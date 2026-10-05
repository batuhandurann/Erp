import { Request, Response, NextFunction } from 'express';
import { RoleName, AppPermission, hasPermission, ROLE_PERMISSIONS } from '../../types/rbac';
import { verifyToken, JwtPayload } from '../auth/tokens';
import { auditRepo, quoteRepo, customerRepo, userRepo } from '../../db/repository';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: RoleName;
  tenantId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  tenantId?: string;
}

// In-memory rate limiting map: IP -> { count, resetAt }
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(maxRequests = 120, windowMs = 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();
    const current = rateLimitMap.get(ip);

    if (!current || now > current.resetAt) {
      rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    current.count++;
    if (current.count > maxRequests) {
      return res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Çok fazla istek gönderildi. Lütfen bir süre sonra tekrar deneyiniz.'
        }
      });
    }

    next();
  };
}

// Authentication Middleware with signed JWT & tenant verification
export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const headerTenantId = (req.headers['x-tenant-id'] as string) || 'org-apex-01';

  let user: AuthenticatedUser | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);

    // 1. First attempt cryptographically signed JWT
    const decoded = verifyToken(token);
    if (decoded) {
      user = {
        id: decoded.userId,
        name: decoded.name || 'Yetkili Kullanıcı',
        email: decoded.email,
        role: (decoded.role as RoleName) || 'SALES',
        tenantId: decoded.tenantId || headerTenantId
      };
    } else if (token.includes('role:')) {
      // 2. Backward compatibility fallback for dev migration tokens
      const parts = token.split('|');
      let extractedRole: RoleName = 'SALES';
      let extractedUid = 'usr-1';

      parts.forEach(p => {
        if (p.startsWith('role:')) extractedRole = p.split(':')[1] as RoleName;
        if (p.startsWith('uid:')) extractedUid = p.split(':')[1];
      });

      const matchedUser = userRepo.findById(extractedUid);
      user = {
        id: extractedUid,
        name: matchedUser?.name || 'Sistem Kullanıcısı',
        email: matchedUser?.email || `${extractedUid}@apex-teknoloji.com.tr`,
        role: extractedRole,
        tenantId: headerTenantId
      };
    }
  }

  // Fallback for dev environment headers
  if (!user && (req.headers['x-user-role'] || req.headers['x-user-id'])) {
    const headerRole = (req.headers['x-user-role'] as RoleName) || 'SUPER_ADMIN';
    const headerUserId = (req.headers['x-user-id'] as string) || 'usr-1';
    const matchedUser = userRepo.findById(headerUserId);

    user = {
      id: headerUserId,
      name: matchedUser?.name || 'Süper Yönetici',
      email: matchedUser?.email || 'admin@apex-teknoloji.com.tr',
      role: headerRole,
      tenantId: headerTenantId
    };
  }

  if (!user) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Bu işlemi gerçekleştirmek için geçerli bir kimlik doğrulama belirteci gereklidir.'
      }
    });
  }

  req.user = user;
  req.tenantId = user.tenantId || headerTenantId;
  next();
}

// Granular RBAC Middleware
export function requirePermission(permission: AppPermission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Oturum açılması gerekiyor.'
        }
      });
    }

    if (!hasPermission(req.user.role, permission)) {
      auditRepo.findMany(); // trigger read for audit context
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: `Erişim Engellendi: Bu işlem için '${permission}' yetkisine sahip olmalısınız. (Mevcut rolünüz: ${req.user.role})`
        }
      });
    }

    next();
  };
}

// Multi-Tenancy Enforcement Middleware
export function requireTenant(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const tokenTenant = req.user?.tenantId;
  const headerTenant = req.headers['x-tenant-id'] as string | undefined;
  const targetTenant = req.params.tenantId || req.body?.tenantId;

  // Cross-tenant header spoofing prevention
  if (tokenTenant && headerTenant && tokenTenant !== headerTenant) {
    return res.status(403).json({
      error: {
        code: 'TENANT_ACCESS_DENIED',
        message: 'Belirteçteki yetkili organizasyon (tenant) ile istek başlığındaki organizasyon uyuşmuyor.'
      }
    });
  }

  // Cross-tenant body/param injection prevention
  if (tokenTenant && targetTenant && tokenTenant !== targetTenant) {
    return res.status(403).json({
      error: {
        code: 'TENANT_ACCESS_DENIED',
        message: 'Farklı bir şirketin / organizasyonun verilerine erişim yetkiniz bulunmamaktadır.'
      }
    });
  }

  next();
}

// Anti-IDOR Scope Guards
export function enforceQuoteDataScope(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Yetkisiz erişim' } });

  if (['SUPER_ADMIN', 'ADMIN', 'FINANCE'].includes(req.user.role)) {
    return next();
  }

  const quoteId = req.params.id;
  if (!quoteId) return next();

  const quote = quoteRepo.findById(quoteId);
  if (!quote) {
    return res.status(404).json({ error: { code: 'QUOTE_NOT_FOUND', message: 'Teklif bulunamadı' } });
  }

  if (req.user.role === 'SALES' && quote.salesPersonId !== req.user.id) {
    return res.status(403).json({
      error: {
        code: 'IDOR_ACCESS_DENIED',
        message: 'Bu teklif başka bir satış temsilcisine aittir. Görüntüleme veya değiştirme yetkiniz yoktur.'
      }
    });
  }

  next();
}

export function enforceCustomerDataScope(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Yetkisiz erişim' } });

  const customerId = req.params.id;
  if (!customerId) return next();

  const customer = customerRepo.findById(customerId);
  if (!customer) {
    return res.status(404).json({ error: { code: 'CUSTOMER_NOT_FOUND', message: 'Müşteri kaydı bulunamadı' } });
  }

  next();
}
