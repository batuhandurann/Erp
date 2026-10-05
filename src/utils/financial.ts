/**
 * Canonical Financial Calculation Engine for BusinessFlow ERP
 * Single Source of Truth for both Frontend and Backend
 * Prevents IEEE-754 floating point errors via integer/epsilon rounding
 */

export interface RawFinancialItem {
  id?: string;
  productId?: string;
  productSku?: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  discountRate?: number; // 0 - 100 percentage
  taxRate?: number;      // 0, 1, 10, 20 percentage
  currency?: 'TRY' | 'USD' | 'EUR';
}

export interface CalculatedFinancialItem extends RawFinancialItem {
  id: string;
  grossAmount: number;   // quantity * unitPrice
  discountAmount: number;// (grossAmount * discountRate) / 100
  netAmount: number;     // grossAmount - discountAmount
  taxAmount: number;     // (netAmount * taxRate) / 100
  total: number;         // netAmount + taxAmount
}

export interface FinancialCalculationResult {
  valid: boolean;
  errors: string[];
  items: CalculatedFinancialItem[];
  subtotal: number;       // Sum of gross amounts
  discountTotal: number;  // Sum of discount amounts
  netTotal: number;       // subtotal - discountTotal
  taxTotal: number;       // Sum of tax amounts
  grandTotal: number;     // netTotal + taxTotal
  currency: 'TRY' | 'USD' | 'EUR';
}

/**
 * Deterministic 2-decimal banker/commercial rounder
 * Handles precision like 0.1 + 0.2 = 0.30000000000000004
 */
export function roundCurrency(value: number): number {
  if (isNaN(value) || !isFinite(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Formats a monetary number in Turkish Lira or selected currency format
 */
export function formatMoney(amount: number, currency: string = 'TRY'): string {
  const rounded = roundCurrency(amount);
  const formatted = rounded.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  switch (currency) {
    case 'USD':
      return `$${formatted}`;
    case 'EUR':
      return `€${formatted}`;
    case 'TRY':
    default:
      return `${formatted} ₺`;
  }
}

/**
 * Calculates item lines, discounts, taxes and grand total deterministically
 * Strict validation against negative numbers, NaN, over-discounting
 */
export function calculateQuoteFinancials(
  rawItems: RawFinancialItem[],
  currency: 'TRY' | 'USD' | 'EUR' = 'TRY'
): FinancialCalculationResult {
  const errors: string[] = [];

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return {
      valid: false,
      errors: ['En az bir ürün kalemi eklenmelidir.'],
      items: [],
      subtotal: 0,
      discountTotal: 0,
      netTotal: 0,
      taxTotal: 0,
      grandTotal: 0,
      currency
    };
  }

  let subtotal = 0;
  let discountTotal = 0;
  let taxTotal = 0;

  const calculatedItems: CalculatedFinancialItem[] = rawItems.map((item, index) => {
    const itemNum = index + 1;
    let qty = Number(item.quantity);
    let unitPrice = Number(item.unitPrice);
    let discRate = Number(item.discountRate || 0);
    let taxRate = Number(item.taxRate !== undefined ? item.taxRate : 20);

    // Negative & NaN Safety Guard
    if (isNaN(qty) || qty <= 0) {
      errors.push(`Kalem #${itemNum}: Ürün adedi sıfırdan büyük bir sayı olmalıdır.`);
      qty = Math.max(1, isNaN(qty) ? 1 : qty);
    }

    if (isNaN(unitPrice) || unitPrice < 0) {
      errors.push(`Kalem #${itemNum}: Birim fiyat negatif olamaz.`);
      unitPrice = Math.max(0, isNaN(unitPrice) ? 0 : unitPrice);
    }

    if (isNaN(discRate) || discRate < 0) {
      errors.push(`Kalem #${itemNum}: İskonto oranı negatif olamaz.`);
      discRate = 0;
    } else if (discRate > 100) {
      errors.push(`Kalem #${itemNum}: İskonto oranı %100'den büyük olamaz.`);
      discRate = 100;
    }

    // Supported Turkish VAT rates: 0, 1, 10, 20
    if (![0, 1, 10, 20].includes(taxRate)) {
      errors.push(`Kalem #${itemNum}: Geçersiz KDV oranı (%${taxRate}). İzin verilenler: %0, %1, %10, %20.`);
      taxRate = 20;
    }

    // Exact Line calculations
    const grossAmount = roundCurrency(qty * unitPrice);
    const discountAmount = roundCurrency((grossAmount * discRate) / 100);
    const netAmount = roundCurrency(grossAmount - discountAmount);
    const taxAmount = roundCurrency((netAmount * taxRate) / 100);
    const total = roundCurrency(netAmount + taxAmount);

    subtotal = roundCurrency(subtotal + grossAmount);
    discountTotal = roundCurrency(discountTotal + discountAmount);
    taxTotal = roundCurrency(taxTotal + taxAmount);

    return {
      ...item,
      id: item.id || `item-${Date.now()}-${index}`,
      quantity: qty,
      unitPrice,
      discountRate: discRate,
      taxRate,
      grossAmount,
      discountAmount,
      netAmount,
      taxAmount,
      total,
      currency
    };
  });

  const netTotal = roundCurrency(subtotal - discountTotal);
  const grandTotal = roundCurrency(netTotal + taxTotal);

  return {
    valid: errors.length === 0,
    errors,
    items: calculatedItems,
    subtotal,
    discountTotal,
    netTotal,
    taxTotal,
    grandTotal,
    currency
  };
}

/**
 * Verifies payment against remaining balance.
 * Prevents overpayments and negative payments.
 */
export function validatePaymentCalculation(
  totalDue: number,
  currentPaid: number,
  incomingPaymentAmount: number
): {
  valid: boolean;
  error?: string;
  newPaidTotal: number;
  newRemaining: number;
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
} {
  const safeTotal = roundCurrency(totalDue);
  const safeCurrentPaid = roundCurrency(currentPaid);
  const safeIncoming = roundCurrency(incomingPaymentAmount);

  if (isNaN(safeIncoming) || safeIncoming <= 0) {
    return {
      valid: false,
      error: 'Tahsilat tutarı 0 veya negatif olamaz.',
      newPaidTotal: safeCurrentPaid,
      newRemaining: roundCurrency(safeTotal - safeCurrentPaid),
      paymentStatus: safeCurrentPaid >= safeTotal ? 'PAID' : (safeCurrentPaid > 0 ? 'PARTIAL' : 'UNPAID')
    };
  }

  const remaining = roundCurrency(safeTotal - safeCurrentPaid);

  if (safeIncoming > remaining + 0.01) {
    return {
      valid: false,
      error: `Fazla ödeme engellendi: Kalan borç ${formatMoney(remaining)}, girilen tutar ${formatMoney(safeIncoming)}.`,
      newPaidTotal: safeCurrentPaid,
      newRemaining: remaining,
      paymentStatus: safeCurrentPaid >= safeTotal ? 'PAID' : (safeCurrentPaid > 0 ? 'PARTIAL' : 'UNPAID')
    };
  }

  const newPaidTotal = roundCurrency(safeCurrentPaid + safeIncoming);
  const newRemaining = Math.max(0, roundCurrency(safeTotal - newPaidTotal));
  const paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID' = 
    newRemaining === 0 ? 'PAID' : (newPaidTotal > 0 ? 'PARTIAL' : 'UNPAID');

  return {
    valid: true,
    newPaidTotal,
    newRemaining,
    paymentStatus
  };
}

export function calculateQuoteItem(item: RawFinancialItem): CalculatedFinancialItem {
  const result = calculateQuoteFinancials([item]);
  return result.items[0];
}

export function calculateQuoteSummary(items: CalculatedFinancialItem[] | RawFinancialItem[]) {
  const result = calculateQuoteFinancials(items as RawFinancialItem[]);
  return {
    subtotal: result.subtotal,
    discountTotal: result.discountTotal,
    netTotal: result.netTotal,
    taxTotal: result.taxTotal,
    grandTotal: result.grandTotal,
    valid: result.valid,
    errors: result.errors
  };
}

