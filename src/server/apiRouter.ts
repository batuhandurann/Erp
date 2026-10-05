import { Router, Request, Response, NextFunction } from 'express';
import {
  customerRepo,
  productRepo,
  quoteRepo,
  proformaRepo,
  contractRepo,
  saleRepo,
  serialRepo,
  paymentRepo,
  settingsRepo,
  auditRepo,
  dashboardRepo,
  userRepo
} from '../db/repository';
import {
  authenticate,
  requirePermission,
  enforceQuoteDataScope,
  enforceCustomerDataScope,
  requireTenant,
  rateLimit,
  AuthenticatedRequest
} from './middleware/auth';
import { authService } from './services/authService';
import { revokeToken } from './auth/tokens';
import { customerService } from './services/customerService';
import { quoteService } from './services/quoteService';
import { saleService } from './services/saleService';
import { paymentService } from './services/paymentService';
import {
  LoginSchema,
  CustomerCreateSchema,
  QuoteCreateSchema,
  PaymentCreateSchema,
  SaleConversionSchema
} from './validators/schemas';

export const apiRouter = Router();

// Apply global rate limiting on API
apiRouter.use(rateLimit(300, 60 * 1000));

// Health Check (Public)
apiRouter.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import('./db/prisma');
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch {
      dbStatus = 'connection_error';
    }
  } else if (process.env.DEMO_MODE === 'true') {
    dbStatus = 'demo_controlled_store';
  }

  res.json({
    status: 'ok',
    platform: 'BusinessFlow ERP',
    version: 'v2.0-production',
    database: dbStatus,
    security: 'JWT_RBAC_TENANT_ENFORCED',
    timestamp: new Date().toISOString()
  });
});

// 1. Authentication Endpoints (Public)
apiRouter.post('/auth/login', rateLimit(40, 60 * 1000), async (req, res) => {
  try {
    const identifier = req.body.identifier || req.body.username || req.body.email || req.body.id || '';
    const password = req.body.password;
    const tenantId = (req.headers['x-tenant-id'] as string) || req.body.tenantId || 'org-apex-01';

    if (!identifier) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Lütfen kullanıcı kimliği (ID/Kullanıcı Adı veya E-posta) giriniz.'
        }
      });
    }

    const result = await authService.login(identifier, password, tenantId);

    res.json({
      success: true,
      token: result.accessToken,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user
    });
  } catch (err: any) {
    res.status(401).json({
      error: {
        code: 'INVALID_CREDENTIALS',
        message: err.message || 'Kimlik doğrulama başarısız.'
      }
    });
  }
});

apiRouter.post('/auth/logout', authenticate, (req: AuthenticatedRequest, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    revokeToken(token);
  }
  res.json({ success: true, message: 'Oturum başarıyla kapatıldı ve token anında geçersiz kılındı.' });
});

// Require Authentication for All Routes Below
apiRouter.use(authenticate);
apiRouter.use(requireTenant);

apiRouter.get('/auth/me', (req: AuthenticatedRequest, res) => {
  res.json({
    success: true,
    data: req.user
  });
});

// 2. Customers API
apiRouter.get('/customers', async (req: AuthenticatedRequest, res) => {
  try {
    const data = await customerService.list(req.tenantId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: err.message } });
  }
});

apiRouter.get('/customers/:id', enforceCustomerDataScope, async (req: AuthenticatedRequest, res) => {
  try {
    const data = await customerService.getById(req.params.id, req.tenantId);
    if (!data) return res.status(404).json({ error: { code: 'CUSTOMER_NOT_FOUND', message: 'Müşteri bulunamadı' } });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: err.message } });
  }
});

apiRouter.get('/customers/:id/360', enforceCustomerDataScope, async (req: AuthenticatedRequest, res) => {
  try {
    const data = await customerService.get360View(req.params.id, req.tenantId);
    if (!data) return res.status(404).json({ error: { code: 'CUSTOMER_NOT_FOUND', message: 'Müşteri bulunamadı' } });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: err.message } });
  }
});

apiRouter.post('/customers', requirePermission('customer.create'), async (req: AuthenticatedRequest, res) => {
  const parsed = CustomerCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Müşteri bilgileri geçersiz',
        details: parsed.error.format()
      }
    });
  }

  try {
    const customer = await customerService.create(parsed.data as any, req.user, req.tenantId);
    res.status(201).json({ success: true, data: customer });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: err.message } });
  }
});

apiRouter.patch('/customers/:id', requirePermission('customer.update'), async (req: AuthenticatedRequest, res) => {
  try {
    const updated = await customerService.update(req.params.id, req.body, req.user, req.tenantId);
    if (!updated) return res.status(404).json({ error: { code: 'CUSTOMER_NOT_FOUND', message: 'Müşteri bulunamadı' } });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: err.message } });
  }
});

apiRouter.delete('/customers/:id', requirePermission('customer.delete'), async (req: AuthenticatedRequest, res) => {
  try {
    const result = await customerService.delete(req.params.id, req.user, req.tenantId);
    res.json({ success: true, message: result.message });
  } catch (err: any) {
    res.status(409).json({
      error: {
        code: 'INTEGRITY_VIOLATION',
        message: err.message
      }
    });
  }
});

// 3. Quotes API
apiRouter.get('/quotes', (req: AuthenticatedRequest, res) => {
  let quotes = quoteService.list(req.tenantId);
  if (req.user?.role === 'SALES') {
    quotes = quotes.filter(q => q.salesPersonId === req.user?.id);
  }
  res.json({ success: true, data: quotes });
});

apiRouter.get('/quotes/:id', enforceQuoteDataScope, (req: AuthenticatedRequest, res) => {
  const quote = quoteService.getById(req.params.id, req.tenantId);
  if (!quote) return res.status(404).json({ error: { code: 'QUOTE_NOT_FOUND', message: 'Teklif bulunamadı' } });
  res.json({ success: true, data: quote });
});

apiRouter.post('/quotes', requirePermission('quote.create'), async (req: AuthenticatedRequest, res) => {
  const parsed = QuoteCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Teklif bilgileri geçersiz',
        details: parsed.error.format()
      }
    });
  }

  try {
    const newQuote = await quoteService.create(parsed.data, req.user, req.tenantId);
    res.status(201).json({ success: true, data: newQuote });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'QUOTE_CREATION_FAILED', message: err.message } });
  }
});

apiRouter.patch('/quotes/:id/status', requirePermission('quote.accept'), (req: AuthenticatedRequest, res) => {
  const { status, note } = req.body;
  const updated = quoteService.updateStatus(req.params.id, status, req.user, note);
  if (!updated) return res.status(404).json({ error: { code: 'QUOTE_NOT_FOUND', message: 'Teklif bulunamadı' } });
  res.json({ success: true, data: updated });
});

apiRouter.post('/quotes/:id/convert-proforma', requirePermission('proforma.create'), (req: AuthenticatedRequest, res) => {
  const proforma = quoteService.convertToProforma(req.params.id, req.user);
  if (!proforma) return res.status(400).json({ error: { code: 'CONVERSION_FAILED', message: 'Teklif proformaya dönüştürülemedi' } });
  res.status(201).json({ success: true, data: proforma });
});

// 4. Proformas & Contracts
apiRouter.get('/proformas', (req: AuthenticatedRequest, res) => {
  res.json({ success: true, data: proformaRepo.findMany() });
});

apiRouter.get('/contracts', (req: AuthenticatedRequest, res) => {
  res.json({ success: true, data: contractRepo.findMany() });
});

// 5. Sales & Serialization
apiRouter.get('/sales', (req: AuthenticatedRequest, res) => {
  res.json({ success: true, data: saleService.list(req.tenantId) });
});

apiRouter.post('/sales/convert', requirePermission('sale.create'), async (req: AuthenticatedRequest, res) => {
  const parsed = SaleConversionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dönüşüm parametreleri geçersiz' }
    });
  }

  try {
    const sale = await saleService.createFromWorkflow(parsed.data.sourceType, parsed.data.sourceId, req.user, req.tenantId);
    res.status(201).json({ success: true, data: sale });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'SALE_CREATION_FAILED', message: err.message } });
  }
});

// 6. Products & Serials
apiRouter.get('/products', (req: AuthenticatedRequest, res) => {
  res.json({ success: true, data: productRepo.findMany() });
});

apiRouter.get('/serials', (req: AuthenticatedRequest, res) => {
  res.json({ success: true, data: serialRepo.findMany() });
});

// 7. Payments
apiRouter.get('/payments', requirePermission('payment.read'), (req: AuthenticatedRequest, res) => {
  res.json({ success: true, data: paymentService.list(req.tenantId) });
});

apiRouter.post('/payments', requirePermission('payment.create'), async (req: AuthenticatedRequest, res) => {
  const parsed = PaymentCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Tahsilat bilgileri geçersiz',
        details: parsed.error.format()
      }
    });
  }

  try {
    const payment = await paymentService.recordPayment(parsed.data, req.user, req.tenantId);
    res.status(201).json({ success: true, data: payment });
  } catch (err: any) {
    res.status(400).json({ error: { code: 'PAYMENT_FAILED', message: err.message } });
  }
});

// 8. Settings & Audit
apiRouter.get('/settings', (req: AuthenticatedRequest, res) => {
  res.json({ success: true, data: settingsRepo.get() });
});

apiRouter.get('/audit-logs', (req: AuthenticatedRequest, res) => {
  res.json({ success: true, data: auditRepo.findMany() });
});

apiRouter.get('/dashboard/metrics', (req: AuthenticatedRequest, res) => {
  res.json({ success: true, data: dashboardRepo.getMetrics() });
});
