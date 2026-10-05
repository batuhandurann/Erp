import { paymentRepo, proformaRepo, saleRepo } from '../../db/repository';
import { Payment } from '../../types';
import { validatePaymentCalculation } from '../../utils/financial';

export const paymentService = {
  list: (tenantId: string = 'org-apex-01'): Payment[] => {
    return paymentRepo.findMany();
  },

  recordPayment: async (data: any, user?: any, tenantId: string = 'org-apex-01'): Promise<Payment> => {
    if (data.proformaId) {
      const proforma = proformaRepo.findById(data.proformaId);
      if (proforma) {
        const check = validatePaymentCalculation(proforma.grandTotal, proforma.paidAmount || 0, data.amount);
        if (!check.valid) {
          throw new Error(check.error || 'Geçersiz ödeme tutarı');
        }
        proformaRepo.recordPayment(data.proformaId, data.amount, user);
      }
    }

    if (data.saleId) {
      const sale = saleRepo.findById(data.saleId);
      if (sale) {
        const check = validatePaymentCalculation(sale.grandTotal, sale.paidAmount || 0, data.amount);
        if (!check.valid) {
          throw new Error(check.error || 'Geçersiz ödeme tutarı');
        }
      }
    }

    return paymentRepo.create(data, user);
  }
};
