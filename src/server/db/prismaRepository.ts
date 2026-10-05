import { prisma } from './prisma';
import { 
  Customer, 
  Product, 
  Quote, 
  QuoteStatus, 
  Proforma, 
  Contract, 
  Sale, 
  ProductSerial, 
  Payment, 
  AuditLog, 
  CompanySettings, 
  User 
} from '../../types';

export const isPrismaActive = (): boolean => {
  return !!process.env.DATABASE_URL;
};

// ==========================================
// 1. CUSTOMER REPOSITORY (PRISMA POSTGRES)
// ==========================================
export const prismaCustomerRepo = {
  findMany: async (tenantId: string = 'org-apex-01'): Promise<Customer[]> => {
    const list = await prisma.customer.findMany({
      where: { tenantId, isArchived: false },
      include: { contacts: true },
      orderBy: { createdAt: 'desc' }
    });

    return list.map((c: any) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      taxNumber: c.taxNumber,
      taxOffice: c.taxOffice,
      address: '',
      city: '',
      phone: '',
      email: '',
      industry: c.industry || 'Diğer',
      creditLimit: c.creditLimit ? Number(c.creditLimit) : undefined,
      notes: c.notes || undefined,
      createdAt: c.createdAt.toISOString().split('T')[0],
      contacts: c.contacts.map((ct: any) => ({
        name: ct.name,
        title: ct.title,
        email: ct.email,
        phone: ct.phone,
        isPrimary: ct.isPrimary
      }))
    }));
  },

  findById: async (id: string, tenantId: string = 'org-apex-01'): Promise<Customer | null> => {
    const c: any = await prisma.customer.findFirst({
      where: { id, tenantId },
      include: { contacts: true }
    });
    if (!c) return null;

    return {
      id: c.id,
      code: c.code,
      name: c.name,
      taxNumber: c.taxNumber,
      taxOffice: c.taxOffice,
      address: '',
      city: '',
      phone: '',
      email: '',
      industry: c.industry || 'Diğer',
      creditLimit: c.creditLimit ? Number(c.creditLimit) : undefined,
      notes: c.notes || undefined,
      createdAt: c.createdAt.toISOString().split('T')[0],
      contacts: c.contacts.map((ct: any) => ({
        name: ct.name,
        title: ct.title,
        email: ct.email,
        phone: ct.phone,
        isPrimary: ct.isPrimary
      }))
    };
  },

  create: async (data: Omit<Customer, 'id' | 'code' | 'createdAt'>, user?: any, tenantId: string = 'org-apex-01'): Promise<Customer> => {
    // Generate concurrency-safe sequential customer code
    const seq = await prisma.numberSequence.upsert({
      where: { tenantId_year: { tenantId, year: 2026 } },
      update: { customerSeq: { increment: 1 } },
      create: { tenantId, year: 2026, customerSeq: 11 }
    });
    const code = `MSR-2026-${String(seq.customerSeq).padStart(4, '0')}`;

    const created: any = await prisma.customer.create({
      data: {
        tenantId,
        code,
        name: data.name,
        taxNumber: data.taxNumber,
        taxOffice: data.taxOffice,
        industry: data.industry,
        creditLimit: data.creditLimit,
        notes: data.notes,
        contacts: {
          create: (data.contacts || []).map((ct: any) => ({
            name: ct.name,
            title: ct.title,
            email: ct.email,
            phone: ct.phone,
            isPrimary: ct.isPrimary || false
          }))
        }
      },
      include: { contacts: true }
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: user?.id,
        userName: user?.name || 'Sistem',
        userRole: user?.role || 'SYSTEM',
        entityType: 'CUSTOMER',
        entityId: created.id,
        entityCode: created.code,
        action: 'Müşteri Kaydı Oluşturuldu',
        details: `${created.name} firması sisteme eklendi.`
      }
    });

    return {
      id: created.id,
      code: created.code,
      name: created.name,
      taxNumber: created.taxNumber,
      taxOffice: created.taxOffice,
      address: data.address || '',
      city: data.city || '',
      phone: data.phone || '',
      email: data.email || '',
      industry: created.industry || 'Diğer',
      creditLimit: created.creditLimit ? Number(created.creditLimit) : undefined,
      notes: created.notes || undefined,
      createdAt: created.createdAt.toISOString().split('T')[0],
      contacts: created.contacts.map((ct: any) => ({
        name: ct.name,
        title: ct.title,
        email: ct.email,
        phone: ct.phone,
        isPrimary: ct.isPrimary
      }))
    };
  },

  update: async (id: string, data: Partial<Customer>, user?: any, tenantId: string = 'org-apex-01'): Promise<Customer | null> => {
    const updated: any = await prisma.customer.update({
      where: { id },
      data: {
        name: data.name,
        taxNumber: data.taxNumber,
        taxOffice: data.taxOffice,
        industry: data.industry,
        creditLimit: data.creditLimit,
        notes: data.notes
      },
      include: { contacts: true }
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: user?.id,
        userName: user?.name || 'Sistem',
        userRole: user?.role || 'SYSTEM',
        entityType: 'CUSTOMER',
        entityId: updated.id,
        entityCode: updated.code,
        action: 'Müşteri Kaydı Güncellendi',
        details: `${updated.name} firma bilgileri güncellendi.`
      }
    });

    return {
      id: updated.id,
      code: updated.code,
      name: updated.name,
      taxNumber: updated.taxNumber,
      taxOffice: updated.taxOffice,
      address: data.address || '',
      city: data.city || '',
      phone: data.phone || '',
      email: data.email || '',
      industry: updated.industry || 'Diğer',
      creditLimit: updated.creditLimit ? Number(updated.creditLimit) : undefined,
      notes: updated.notes || undefined,
      createdAt: updated.createdAt.toISOString().split('T')[0],
      contacts: updated.contacts.map((ct: any) => ({
        name: ct.name,
        title: ct.title,
        email: ct.email,
        phone: ct.phone,
        isPrimary: ct.isPrimary
      }))
    };
  },

  delete: async (id: string, user?: any, tenantId: string = 'org-apex-01'): Promise<boolean> => {
    // Check referential integrity: quotes, contracts, sales
    const quotesCount = await prisma.quote.count({ where: { customerId: id } });
    const contractsCount = await prisma.contract.count({ where: { customerId: id } });
    const salesCount = await prisma.sale.count({ where: { customerId: id } });

    if (quotesCount > 0 || contractsCount > 0 || salesCount > 0) {
      throw new Error('Bu müşteriye ait aktif teklif, sözleşme veya satış kaydı bulunmaktadır. Veri bütünlüğü gereği silinemez.');
    }

    const deleted = await prisma.customer.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: user?.id,
        userName: user?.name || 'Sistem',
        userRole: user?.role || 'SYSTEM',
        entityType: 'CUSTOMER',
        entityId: deleted.id,
        entityCode: deleted.code,
        action: 'Müşteri Silindi',
        details: `${deleted.name} firması veritabanından kaldırıldı.`
      }
    });

    return true;
  }
};

// ==========================================
// 2. PRODUCT REPOSITORY (PRISMA POSTGRES)
// ==========================================
export const prismaProductRepo = {
  findMany: async (tenantId: string = 'org-apex-01'): Promise<Product[]> => {
    const list = await prisma.product.findMany({
      where: { tenantId, isArchived: false },
      orderBy: { createdAt: 'desc' }
    });

    return list.map((p: any) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      category: p.category,
      unitPrice: Number(p.unitPrice),
      currency: (p.currency as any) || 'TRY',
      taxRate: Number(p.taxRate),
      stockQuantity: p.stockQuantity,
      warrantyMonths: p.warrantyMonths,
      description: p.description || '',
      brand: p.brand,
      model: p.model
    }));
  },

  findById: async (id: string, tenantId: string = 'org-apex-01'): Promise<Product | null> => {
    const p = await prisma.product.findFirst({ where: { id, tenantId } });
    if (!p) return null;

    return {
      id: p.id,
      sku: p.sku,
      name: p.name,
      category: p.category,
      unitPrice: Number(p.unitPrice),
      currency: (p.currency as any) || 'TRY',
      taxRate: Number(p.taxRate),
      stockQuantity: p.stockQuantity,
      warrantyMonths: p.warrantyMonths,
      description: p.description || '',
      brand: p.brand,
      model: p.model
    };
  }
};

// ==========================================
// 3. NUMBER SEQUENCE (POSTGRESQL CONCURRENCY-SAFE)
// ==========================================
export const prismaSequenceRepo = {
  getNextNumber: async (
    type: 'quote' | 'proforma' | 'contract' | 'sale' | 'product' | 'payment',
    tenantId: string = 'org-apex-01'
  ): Promise<{ numberStr: string; nextSeq: number }> => {
    const year = 2026;
    let field = 'quoteSeq';
    let prefix = 'TKL';

    switch (type) {
      case 'quote': field = 'quoteSeq'; prefix = 'TKL'; break;
      case 'proforma': field = 'proformaSeq'; prefix = 'PRO'; break;
      case 'contract': field = 'contractSeq'; prefix = 'SOZ'; break;
      case 'sale': field = 'saleSeq'; prefix = 'SAT'; break;
      case 'product': field = 'productSeq'; prefix = 'PRD'; break;
      case 'payment': field = 'saleSeq'; prefix = 'OD'; break;
    }

    const updated = await prisma.numberSequence.upsert({
      where: { tenantId_year: { tenantId, year } },
      update: { [field]: { increment: 1 } },
      create: { tenantId, year, [field]: 101 }
    });

    const nextSeq = (updated as any)[field];
    const numberStr = `${prefix}-${year}-${String(nextSeq).padStart(6, '0')}`;
    return { numberStr, nextSeq };
  }
};
