import { describe, it, expect } from 'vitest';
import {
  calculateQuoteItem,
  calculateQuoteSummary,
  roundCurrency,
  validatePaymentCalculation
} from '../../src/utils/financial';

describe('Financial Calculation Engine (Banker Precision)', () => {
  it('correctly rounds currency to 2 decimal places without precision loss', () => {
    expect(roundCurrency(10.005)).toBe(10.01);
    expect(roundCurrency(0.1 + 0.2)).toBe(0.3);
    expect(roundCurrency(12345.678)).toBe(12345.68);
  });

  it('calculates gross, discount, VAT, and total for a quote item accurately', () => {
    const item = calculateQuoteItem({
      quantity: 3,
      unitPrice: 10000,
      discountRate: 10, // 10%
      taxRate: 20 // 20% VAT
    });

    // 3 * 10,000 = 30,000
    // Discount 10% = 3,000
    // Net = 27,000
    // VAT 20% = 5,400
    // Total = 32,400
    expect(item.discountAmount).toBe(3000);
    expect(item.netAmount).toBe(27000);
    expect(item.taxAmount).toBe(5400);
    expect(item.total).toBe(32400);
  });

  it('aggregates quote totals correctly with multiple items', () => {
    const items = [
      calculateQuoteItem({ quantity: 2, unitPrice: 5000, discountRate: 0, taxRate: 20 }),
      calculateQuoteItem({ quantity: 1, unitPrice: 10000, discountRate: 20, taxRate: 20 })
    ];

    const summary = calculateQuoteSummary(items);
    // Item 1: 10,000 gross, 0 disc, 2,000 tax, 12,000 total
    // Item 2: 10,000 gross, 2,000 disc, 1,600 tax, 9,600 total
    // Subtotal = 20,000
    // DiscountTotal = 2,000
    // TaxTotal = 3,600
    // GrandTotal = 21,600
    expect(summary.subtotal).toBe(20000);
    expect(summary.discountTotal).toBe(2000);
    expect(summary.taxTotal).toBe(3600);
    expect(summary.grandTotal).toBe(21600);
  });

  it('prevents overpayment beyond remaining balance', () => {
    const totalDue = 50000;
    const currentPaid = 0;
    const validCheck = validatePaymentCalculation(totalDue, currentPaid, 30000);
    expect(validCheck.valid).toBe(true);
    expect(validCheck.newRemaining).toBe(20000);

    const invalidCheck = validatePaymentCalculation(totalDue, currentPaid, 60000);
    expect(invalidCheck.valid).toBe(false);
    expect(invalidCheck.error).toContain('Fazla ödeme engellendi');
  });

  it('rejects negative or zero payment amounts', () => {
    const checkNegative = validatePaymentCalculation(50000, 0, -100);
    expect(checkNegative.valid).toBe(false);

    const checkZero = validatePaymentCalculation(50000, 0, 0);
    expect(checkZero.valid).toBe(false);
  });
});
