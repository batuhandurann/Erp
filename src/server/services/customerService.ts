import { prismaCustomerRepo, isPrismaActive } from '../db/prismaRepository';
import { customerRepo, quoteRepo, contractRepo, saleRepo } from '../../db/repository';
import { Customer } from '../../types';

export const customerService = {
  list: async (tenantId: string = 'org-apex-01'): Promise<Customer[]> => {
    if (isPrismaActive()) {
      return prismaCustomerRepo.findMany(tenantId);
    }
    if (process.env.NODE_ENV === 'production') {
      throw new Error('DATABASE_REQUIRED: Production environment requires active PostgreSQL connection.');
    }
    return customerRepo.findMany();
  },

  getById: async (id: string, tenantId: string = 'org-apex-01'): Promise<Customer | null> => {
    if (isPrismaActive()) {
      return prismaCustomerRepo.findById(id, tenantId);
    }
    if (process.env.NODE_ENV === 'production') {
      throw new Error('DATABASE_REQUIRED: Production environment requires active PostgreSQL connection.');
    }
    return customerRepo.findById(id) || null;
  },

  get360View: async (id: string, tenantId: string = 'org-apex-01') => {
    return customerRepo.get360View(id);
  },

  create: async (data: Omit<Customer, 'id' | 'code' | 'createdAt'>, user?: any, tenantId: string = 'org-apex-01'): Promise<Customer> => {
    if (isPrismaActive()) {
      return prismaCustomerRepo.create(data, user, tenantId);
    }
    if (process.env.NODE_ENV === 'production') {
      throw new Error('DATABASE_REQUIRED: Production environment requires active PostgreSQL connection.');
    }
    return customerRepo.create(data, user);
  },

  update: async (id: string, data: Partial<Customer>, user?: any, tenantId: string = 'org-apex-01'): Promise<Customer | null> => {
    if (isPrismaActive()) {
      return prismaCustomerRepo.update(id, data, user, tenantId);
    }
    if (process.env.NODE_ENV === 'production') {
      throw new Error('DATABASE_REQUIRED: Production environment requires active PostgreSQL connection.');
    }
    return customerRepo.update(id, data, user);
  },

  delete: async (id: string, user?: any, tenantId: string = 'org-apex-01'): Promise<{ success: boolean; message?: string }> => {
    if (isPrismaActive()) {
      const success = await prismaCustomerRepo.delete(id, user, tenantId);
      return { success, message: 'Müşteri başarıyla silindi' };
    }
    if (process.env.NODE_ENV === 'production') {
      throw new Error('DATABASE_REQUIRED: Production environment requires active PostgreSQL connection.');
    }

    const quotes = quoteRepo.findMany().filter(q => q.customerId === id);
    const contracts = contractRepo.findMany().filter(c => c.customerId === id);
    const sales = saleRepo.findMany().filter(s => s.customerId === id);

    if (quotes.length > 0 || contracts.length > 0 || sales.length > 0) {
      throw new Error('Bu müşteriye ait aktif teklif, sözleşme veya satış kaydı bulunmaktadır. Veri bütünlüğü nedeniyle silinemez; arşivlenebilir.');
    }

    const success = customerRepo.delete(id, user);
    return { success, message: 'Müşteri başarıyla silindi' };
  }
};
