export type AppPermission =
  // Quotes
  | 'quote.create'
  | 'quote.read'
  | 'quote.update'
  | 'quote.delete'
  | 'quote.send'
  | 'quote.accept'
  | 'quote.reject'
  | 'quote.convert'
  // Proformas
  | 'proforma.create'
  | 'proforma.read'
  | 'proforma.update'
  | 'proforma.convert'
  // Contracts
  | 'contract.create'
  | 'contract.read'
  | 'contract.sign'
  | 'contract.activate'
  // Sales
  | 'sale.create'
  | 'sale.read'
  | 'sale.update'
  // Customers
  | 'customer.create'
  | 'customer.read'
  | 'customer.update'
  | 'customer.delete'
  // Products
  | 'product.create'
  | 'product.read'
  | 'product.update'
  | 'product.delete'
  // Product Serials & Lifecycle
  | 'serial.create'
  | 'serial.read'
  | 'serial.updateStatus'
  | 'serial.service'
  // Finance & Payments
  | 'payment.create'
  | 'payment.read'
  // System Administration
  | 'audit.read'
  | 'settings.update'
  | 'user.manage'
  | 'reports.read';

export type RoleName =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'SALES'
  | 'FINANCE'
  | 'OPERATIONS'
  | 'VIEWER';

export const ROLE_PERMISSIONS: Record<RoleName, AppPermission[]> = {
  SUPER_ADMIN: [
    'quote.create', 'quote.read', 'quote.update', 'quote.delete', 'quote.send', 'quote.accept', 'quote.reject', 'quote.convert',
    'proforma.create', 'proforma.read', 'proforma.update', 'proforma.convert',
    'contract.create', 'contract.read', 'contract.sign', 'contract.activate',
    'sale.create', 'sale.read', 'sale.update',
    'customer.create', 'customer.read', 'customer.update', 'customer.delete',
    'product.create', 'product.read', 'product.update', 'product.delete',
    'serial.create', 'serial.read', 'serial.updateStatus', 'serial.service',
    'payment.create', 'payment.read',
    'audit.read', 'settings.update', 'user.manage', 'reports.read'
  ],
  ADMIN: [
    'quote.create', 'quote.read', 'quote.update', 'quote.send', 'quote.accept', 'quote.reject', 'quote.convert',
    'proforma.create', 'proforma.read', 'proforma.update', 'proforma.convert',
    'contract.create', 'contract.read', 'contract.sign', 'contract.activate',
    'sale.create', 'sale.read', 'sale.update',
    'customer.create', 'customer.read', 'customer.update',
    'product.create', 'product.read', 'product.update',
    'serial.create', 'serial.read', 'serial.updateStatus', 'serial.service',
    'payment.create', 'payment.read',
    'audit.read', 'settings.update', 'reports.read'
  ],
  SALES: [
    'quote.create', 'quote.read', 'quote.update', 'quote.send', 'quote.accept', 'quote.reject', 'quote.convert',
    'proforma.create', 'proforma.read', 'proforma.convert',
    'contract.create', 'contract.read',
    'sale.read',
    'customer.create', 'customer.read', 'customer.update',
    'product.read',
    'serial.read',
    'reports.read'
  ],
  FINANCE: [
    'quote.read',
    'proforma.read', 'proforma.update',
    'contract.read',
    'sale.read',
    'customer.read',
    'product.read',
    'payment.create', 'payment.read',
    'reports.read'
  ],
  OPERATIONS: [
    'customer.read',
    'product.read', 'product.create', 'product.update',
    'sale.read', 'sale.update',
    'serial.create', 'serial.read', 'serial.updateStatus', 'serial.service',
    'contract.read'
  ],
  VIEWER: [
    'quote.read',
    'proforma.read',
    'contract.read',
    'sale.read',
    'customer.read',
    'product.read',
    'serial.read',
    'payment.read',
    'reports.read'
  ]
};

export function hasPermission(role: RoleName | string, permission: AppPermission): boolean {
  // Normalize Turkish role string to RoleName if passed as e.g. "Super Admin"
  let normalizedRole: RoleName = 'VIEWER';
  if (role === 'SUPER_ADMIN' || role === 'Super Admin') normalizedRole = 'SUPER_ADMIN';
  else if (role === 'ADMIN' || role === 'Admin') normalizedRole = 'ADMIN';
  else if (role === 'SALES' || role === 'Satış Personeli') normalizedRole = 'SALES';
  else if (role === 'FINANCE' || role === 'Finans') normalizedRole = 'FINANCE';
  else if (role === 'OPERATIONS' || role === 'Operasyon / Teknik') normalizedRole = 'OPERATIONS';
  else if (role === 'VIEWER' || role === 'Sadece Görüntüleme') normalizedRole = 'VIEWER';

  const perms = ROLE_PERMISSIONS[normalizedRole];
  return perms ? perms.includes(permission) : false;
}
