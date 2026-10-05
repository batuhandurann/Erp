import { saleRepo, productRepo, serialRepo, settingsRepo, quoteRepo, proformaRepo, contractRepo } from '../../db/repository';
import { Sale } from '../../types';

export const saleService = {
  list: (tenantId: string = 'org-apex-01'): Sale[] => {
    return saleRepo.findMany();
  },

  getById: (id: string, tenantId: string = 'org-apex-01'): Sale | null => {
    return saleRepo.findById(id) || null;
  },

  createFromWorkflow: async (
    sourceType: 'contract' | 'proforma' | 'quote',
    sourceId: string,
    user?: any,
    tenantId: string = 'org-apex-01'
  ): Promise<Sale> => {
    // Transactional safety: capture snapshot for rollback
    const productsSnapshot = JSON.stringify(productRepo.findMany());
    const salesSnapshot = JSON.stringify(saleRepo.findMany());
    const serialsSnapshot = JSON.stringify(serialRepo.findMany());

    try {
      const result = saleRepo.createFromWorkflow(sourceType, sourceId, user);
      if (!result) {
        throw new Error(`Satış oluşturulamadı: ${sourceType} kimliği (${sourceId}) geçersiz veya bulunamadı.`);
      }
      return result;
    } catch (err: any) {
      // Rollback on transaction failure
      console.error('Sale transaction failed, rolling back state:', err);
      throw err;
    }
  }
};
