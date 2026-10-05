import { describe, it, expect } from 'vitest';
import { hasPermission } from '../../src/types/rbac';

describe('RBAC Authorization Rules', () => {
  it('SUPER_ADMIN has all administrative, quote, payment, and deletion permissions', () => {
    expect(hasPermission('SUPER_ADMIN', 'customer.create')).toBe(true);
    expect(hasPermission('SUPER_ADMIN', 'quote.create')).toBe(true);
    expect(hasPermission('SUPER_ADMIN', 'quote.accept')).toBe(true);
    expect(hasPermission('SUPER_ADMIN', 'payment.create')).toBe(true);
    expect(hasPermission('SUPER_ADMIN', 'settings.update')).toBe(true);
  });

  it('SALES can create quotes and customers, but cannot record payments or update settings', () => {
    expect(hasPermission('SALES', 'customer.create')).toBe(true);
    expect(hasPermission('SALES', 'quote.create')).toBe(true);
    expect(hasPermission('SALES', 'payment.create')).toBe(false);
    expect(hasPermission('SALES', 'settings.update')).toBe(false);
  });

  it('FINANCE can record payments and view invoices, but cannot update system settings', () => {
    expect(hasPermission('FINANCE', 'payment.create')).toBe(true);
    expect(hasPermission('FINANCE', 'payment.read')).toBe(true);
    expect(hasPermission('FINANCE', 'settings.update')).toBe(false);
  });

  it('VIEWER cannot perform any mutating actions', () => {
    expect(hasPermission('VIEWER', 'customer.create')).toBe(false);
    expect(hasPermission('VIEWER', 'customer.update')).toBe(false);
    expect(hasPermission('VIEWER', 'quote.create')).toBe(false);
    expect(hasPermission('VIEWER', 'payment.create')).toBe(false);
  });
});
