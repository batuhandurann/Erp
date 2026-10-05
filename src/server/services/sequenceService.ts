import { settingsRepo, paymentRepo } from '../../db/repository';

class ConcurrencySafeSequenceService {
  private inFlightLock = false;

  async getNextNumber(
    type: 'quote' | 'proforma' | 'contract' | 'sale' | 'product' | 'payment',
    tenantId: string = 'org-apex-01'
  ): Promise<{ numberStr: string; nextSeq: number }> {
    // Spinlock to ensure zero collision in concurrent asynchronous calls
    while (this.inFlightLock) {
      await new Promise(resolve => setTimeout(resolve, 5));
    }
    this.inFlightLock = true;

    try {
      const settings = settingsRepo.get();
      const year = settings.sequences.year || 2026;
      let nextSeq = 0;
      let prefix = '';

      switch (type) {
        case 'quote':
          nextSeq = settings.sequences.quoteCurrent + 1;
          settings.sequences.quoteCurrent = nextSeq;
          prefix = 'TKL';
          break;
        case 'proforma':
          nextSeq = settings.sequences.proformaCurrent + 1;
          settings.sequences.proformaCurrent = nextSeq;
          prefix = 'PRO';
          break;
        case 'contract':
          nextSeq = settings.sequences.contractCurrent + 1;
          settings.sequences.contractCurrent = nextSeq;
          prefix = 'SOZ';
          break;
        case 'sale':
          nextSeq = settings.sequences.saleCurrent + 1;
          settings.sequences.saleCurrent = nextSeq;
          prefix = 'SAT';
          break;
        case 'product':
          nextSeq = settings.sequences.productCurrent + 1;
          settings.sequences.productCurrent = nextSeq;
          prefix = 'PRD';
          break;
        case 'payment':
          if (!(settings.sequences as any).paymentCurrent) {
            (settings.sequences as any).paymentCurrent = 100;
          }
          nextSeq = (settings.sequences as any).paymentCurrent + 1;
          (settings.sequences as any).paymentCurrent = nextSeq;
          prefix = 'OD';
          break;
      }

      settingsRepo.set(settings);
      const numberStr = `${prefix}-${year}-${String(nextSeq).padStart(6, '0')}`;
      return { numberStr, nextSeq };
    } finally {
      this.inFlightLock = false;
    }
  }
}

export const sequenceService = new ConcurrencySafeSequenceService();
