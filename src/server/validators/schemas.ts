import { z } from 'zod';

export const LoginSchema = z.object({
  identifier: z.string().min(1).optional(),
  email: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional()
});

export const CustomerCreateSchema = z.object({
  name: z.string().min(2, 'Müşteri ticari unvanı en az 2 karakter olmalıdır'),
  taxNumber: z.string().regex(/^\d{10,11}$/, 'Vergi numarası 10 veya 11 haneli olmalıdır'),
  taxOffice: z.string().min(2, 'Vergi dairesi zorunludur'),
  address: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  industry: z.string().optional(),
  creditLimit: z.number().nonnegative().optional()
});

export const QuoteItemSchema = z.object({
  productId: z.string().min(1, 'Ürün seçimi zorunludur'),
  productSku: z.string(),
  productName: z.string(),
  quantity: z.number().int().positive('Miktar pozitif bir tam sayı olmalıdır'),
  unitPrice: z.number().nonnegative('Birim fiyat negatif olamaz'),
  discountRate: z.number().min(0).max(100, 'İskonto %0 ile %100 arasında olmalıdır'),
  taxRate: z.number().refine(val => [0, 1, 10, 20].includes(val), {
    message: 'Geçersiz KDV oranı (Kabul edilen: 0, 1, 10, 20)'
  })
});

export const QuoteCreateSchema = z.object({
  customerId: z.string().min(1, 'Müşteri seçimi zorunludur'),
  customerName: z.string().min(1),
  customerTaxNumber: z.string(),
  customerTaxOffice: z.string(),
  customerAddress: z.string().optional(),
  customerPhone: z.string().optional(),
  customerEmail: z.string().optional(),
  contactPerson: z.string().optional(),
  currency: z.enum(['TRY', 'USD', 'EUR']).default('TRY'),
  paymentTerms: z.string().min(1),
  deliveryTerms: z.string().min(1),
  items: z.array(QuoteItemSchema).min(1, 'Teklifte en az bir kalem bulunmalıdır'),
  notes: z.string().optional(),
  validUntil: z.string().optional()
});

export const PaymentCreateSchema = z.object({
  customerId: z.string().min(1),
  customerName: z.string().min(1),
  amount: z.number().positive('Ödeme tutarı 0’dan büyük olmalıdır'),
  currency: z.enum(['TRY', 'USD', 'EUR']).default('TRY'),
  paymentMethod: z.enum(['HAVALE/EFT', 'KREDI_KARTI', 'CEK', 'NAKIT']),
  referenceNo: z.string().min(1, 'Banka dekont / referans no zorunludur'),
  saleId: z.string().optional(),
  proformaId: z.string().optional(),
  notes: z.string().optional()
});

export const SaleConversionSchema = z.object({
  sourceType: z.enum(['contract', 'proforma', 'quote']),
  sourceId: z.string().min(1)
});
