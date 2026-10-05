import { Request, Response, NextFunction } from 'express';

export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Prevent cross-site scripting filter bypass
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Allow iframe in same origin and development preview
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  // Remove sensitive fingerprinting headers
  res.removeHeader('X-Powered-By');

  next();
}

// Global Error Handler without stack trace leakage
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[SECURITY AUDIT ERROR LOG]:', err.message);

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: statusCode === 500 
        ? 'Sunucu tarafında beklenmeyen bir hata meydana geldi.' 
        : err.message
    }
  });
}
