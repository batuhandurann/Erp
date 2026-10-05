import { quoteRepo, proformaRepo } from '../../db/repository';
import { Quote, QuoteStatus } from '../../types';
import { calculateQuoteItem, calculateQuoteSummary } from '../../utils/financial';
import { sequenceService } from './sequenceService';

export const quoteService = {
  list: (tenantId: string = 'org-apex-01'): Quote[] => {
    return quoteRepo.findMany();
  },

  getById: (id: string, tenantId: string = 'org-apex-01'): Quote | null => {
    return quoteRepo.findById(id) || null;
  },

  create: async (data: any, user?: any, tenantId: string = 'org-apex-01'): Promise<Quote> => {
    // 1. Recalculate every item server-side with banker rounding
    const calculatedItems = (data.items || []).map((it: any) => calculateQuoteItem(it));
    const summary = calculateQuoteSummary(calculatedItems);

    const quotePayload = {
      ...data,
      items: calculatedItems,
      subtotal: summary.subtotal,
      discountTotal: summary.discountTotal,
      taxTotal: summary.taxTotal,
      grandTotal: summary.grandTotal
    };

    return quoteRepo.create(quotePayload, user);
  },

  updateStatus: (id: string, status: QuoteStatus, user?: any, note?: string) => {
    return quoteRepo.updateStatus(id, status, user, note);
  },

  convertToProforma: (quoteId: string, user?: any) => {
    return quoteRepo.convertToProforma(quoteId, user);
  }
};
