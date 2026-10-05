export type UserRole = 
  | 'Super Admin' 
  | 'Admin' 
  | 'Satış Personeli' 
  | 'Finans' 
  | 'Operasyon / Teknik' 
  | 'Sadece Görüntüleme';

export interface User {
  id: string;
  username?: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  avatar?: string;
  department: string;
  password?: string;
}

export interface CustomerContact {
  name: string;
  title: string;
  email: string;
  phone: string;
  isPrimary?: boolean;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  taxNumber: string;
  taxOffice: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  contacts: CustomerContact[];
  industry: string;
  creditLimit?: number;
  notes?: string;
  activities?: CustomerActivity[];
  createdAt: string;
}

export type ActivityType = 'CALL' | 'MEETING' | 'EMAIL' | 'NOTE' | 'TASK';

export interface CustomerActivity {
  id: string;
  customerId: string;
  type: ActivityType;
  title: string;
  description: string;
  authorName: string;
  authorId: string;
  createdAt: string;
  dueDate?: string;
  completed?: boolean;
}

export interface ExchangeRate {
  code: 'USD' | 'EUR' | 'GBP';
  name: string;
  buying: number;
  selling: number;
  effectiveSelling: number;
  changeRate: number;
  updatedAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  unitPrice: number;
  currency: 'TRY' | 'USD' | 'EUR';
  taxRate: number; // percentage, e.g. 20
  stockQuantity: number;
  warrantyMonths: number;
  description: string;
  brand: string;
  model: string;
}

export interface QuoteItem {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  currency: 'TRY' | 'USD' | 'EUR';
  discountRate: number; // e.g. 5 for 5%
  discountAmount: number;
  taxRate: number; // e.g. 20 for 20%
  taxAmount: number;
  netAmount: number;
  total: number;
}

export type QuoteStatus = 
  | 'DRAFT'
  | 'SENT'
  | 'VIEWED'
  | 'ACCEPTED'
  | 'CONVERTED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CANCELLED';

export interface Quote {
  id: string;
  quoteNumber: string; // e.g. TKL-2026-000124
  customerId: string;
  customerName: string;
  customerTaxNumber: string;
  customerTaxOffice: string;
  customerAddress: string;
  customerPhone: string;
  customerEmail: string;
  contactPerson: string;
  salesPersonId: string;
  salesPersonName: string;
  date: string;
  validUntil: string;
  currency: 'TRY' | 'USD' | 'EUR';
  paymentTerms: string;
  deliveryTerms: string;
  items: QuoteItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  status: QuoteStatus;
  convertedToProformaId?: string;
  convertedToContractId?: string;
  notes?: string;
  revision: number;
  publicToken?: string;
  signatureData?: string;
  signedBy?: string;
  signedTitle?: string;
  signedAt?: string;
  exchangeRate?: number;
  tryEquivalentTotal?: number;
  createdAt: string;
  updatedAt: string;
}

export type ProformaPaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID';

export interface Proforma {
  id: string;
  proformaNumber: string; // e.g. PRO-2026-000087
  quoteId?: string;
  quoteNumber?: string;
  customerId: string;
  customerName: string;
  customerTaxNumber: string;
  customerTaxOffice: string;
  customerAddress: string;
  customerPhone: string;
  customerEmail: string;
  date: string;
  dueDate: string;
  currency: 'TRY' | 'USD' | 'EUR';
  paymentTerms: string;
  deliveryTerms: string;
  items: QuoteItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: ProformaPaymentStatus;
  bankDetails: {
    bankName: string;
    accountHolder: string;
    iban: string;
    swift?: string;
  };
  convertedToContractId?: string;
  convertedToSaleId?: string;
  notes?: string;
  createdAt: string;
}

export type ContractStatus = 'DRAFT' | 'PENDING_SIGNATURE' | 'SIGNED' | 'COMPLETED' | 'TERMINATED';

export interface Contract {
  id: string;
  contractNumber: string; // e.g. SOZ-2026-000043
  quoteId?: string;
  quoteNumber?: string;
  proformaId?: string;
  proformaNumber?: string;
  customerId: string;
  customerName: string;
  customerTaxNumber: string;
  customerTaxOffice: string;
  customerAddress: string;
  customerRepresentative: string;
  customerTitle: string;
  sellerName: string;
  sellerTaxNumber: string;
  sellerTaxOffice: string;
  sellerAddress: string;
  sellerRepresentative: string;
  sellerTitle: string;
  contractDate: string;
  deliveryDate: string;
  warrantyTerms: string;
  paymentTerms: string;
  deliveryTerms: string;
  specialClauses: string[];
  items: QuoteItem[];
  grandTotal: number;
  currency: 'TRY' | 'USD' | 'EUR';
  status: ContractStatus;
  signedDate?: string;
  notes?: string;
  createdAt: string;
}

export type SaleDeliveryStatus = 'PENDING' | 'PREPARING' | 'SHIPPED' | 'DELIVERED';
export type SalePaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID';

export interface Sale {
  id: string;
  saleNumber: string; // e.g. SAT-2026-000081
  quoteId?: string;
  quoteNumber?: string;
  proformaId?: string;
  proformaNumber?: string;
  contractId?: string;
  contractNumber?: string;
  customerId: string;
  customerName: string;
  date: string;
  invoiceNumber: string; // e.g. FAT-2026-00341
  items: QuoteItem[];
  grandTotal: number;
  currency: 'TRY' | 'USD' | 'EUR';
  paymentStatus: SalePaymentStatus;
  deliveryStatus: SaleDeliveryStatus;
  paidAmount: number;
  generatedSerialIds: string[]; // PRD-2026-xxxx IDs
  notes?: string;
  createdAt: string;
}

export type ProductLifecycleStatus = 
  | 'STOCK'
  | 'RESERVED'
  | 'SOLD'
  | 'DELIVERED'
  | 'ACTIVE'
  | 'WARRANTY'
  | 'SERVICE'
  | 'RETURNED';

export interface ServiceRecord {
  id: string;
  date: string;
  type: 'ARIZA' | 'PERIYODIK_BAKIM' | 'PARCA_DEGISIMI' | 'YAZILIM_GUNCELLEME';
  issueDescription: string;
  resolution?: string;
  technician: string;
  cost?: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';
  resolvedDate?: string;
}

export interface ProductMovement {
  date: string;
  fromStatus?: ProductLifecycleStatus;
  toStatus: ProductLifecycleStatus;
  action: string;
  performedBy: string;
  note?: string;
}

export interface ProductSerial {
  id: string;
  internalId: string; // e.g. PRD-2026-000452
  serialNumber: string; // e.g. SN-X92-829193
  productId: string;
  productName: string;
  category: string;
  brand: string;
  model: string;
  customerId?: string;
  customerName?: string;
  saleId?: string;
  saleNumber?: string;
  quoteId?: string;
  quoteNumber?: string;
  contractId?: string;
  contractNumber?: string;
  status: ProductLifecycleStatus;
  deliveryDate?: string;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  serviceRecords: ServiceRecord[];
  movements: ProductMovement[];
  notes?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  saleId?: string;
  saleNumber?: string;
  proformaId?: string;
  proformaNumber?: string;
  customerId: string;
  customerName: string;
  amount: number;
  currency: 'TRY' | 'USD' | 'EUR';
  paymentDate: string;
  paymentMethod: 'HAVALE/EFT' | 'KREDI_KARTI' | 'CEK' | 'NAKIT';
  referenceNo: string;
  recordedBy: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  entityType: 'QUOTE' | 'PROFORMA' | 'CONTRACT' | 'SALE' | 'PRODUCT' | 'CUSTOMER' | 'SERIAL' | 'SETTINGS';
  entityId: string;
  entityCode: string;
  action: string;
  details: string;
}

export interface CompanySettings {
  companyName: string;
  commercialTitle: string;
  taxNumber: string;
  taxOffice: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  bankName: string;
  branch: string;
  accountHolder: string;
  iban: string;
  swift: string;
  authorizedSignatory: string;
  authorizedSignatoryTitle: string;
  logoUrl?: string;
  sequences: {
    quoteCurrent: number;
    proformaCurrent: number;
    contractCurrent: number;
    saleCurrent: number;
    productCurrent: number;
    year: number;
  };
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'WARNING' | 'INFO' | 'SUCCESS';
  date: string;
  linkType?: 'quote' | 'proforma' | 'contract' | 'serial' | 'sale';
  targetId?: string;
  read: boolean;
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

export type SubscriptionTier = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  planName: string;
  status: 'ACTIVE' | 'TRIAL' | 'PAST_DUE';
  trialDaysLeft: number;
  monthlyPrice: number;
  currency: string;
  limits: {
    maxUsers: number;
    usedUsers: number;
    maxQuotesPerMonth: number;
    usedQuotesThisMonth: number;
    serialTrackingLimit: number;
    customDomain: boolean;
    auditLogRetentionDays: number;
    apiAccess: boolean;
  };
}
