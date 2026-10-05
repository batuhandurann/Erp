import {
  Customer,
  Product,
  Quote,
  Proforma,
  Contract,
  Sale,
  ProductSerial,
  Payment,
  AuditLog,
  CompanySettings,
  QuoteItem,
  QuoteStatus,
  ProductLifecycleStatus,
  ServiceRecord,
  User
} from '../types';
import {
  INITIAL_CUSTOMERS,
  INITIAL_PRODUCTS,
  INITIAL_QUOTES,
  INITIAL_PROFORMAS,
  INITIAL_CONTRACTS,
  INITIAL_SALES,
  INITIAL_PRODUCT_SERIALS,
  INITIAL_PAYMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_COMPANY_SETTINGS,
  INITIAL_USERS
} from '../mock/seedData';

// Storage Key prefix for browser/node persistence
const DB_STORAGE_KEY = 'businessflow_db_store_';

class DatabaseStorage {
  private memoryStore: Map<string, any> = new Map();

  private isLocalStorageAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  get<T>(key: string, defaultValue: T): T {
    if (this.isLocalStorageAvailable()) {
      try {
        const item = window.localStorage.getItem(DB_STORAGE_KEY + key);
        if (item) return JSON.parse(item);
      } catch (e) {
        console.warn('LocalStorage read error:', e);
      }
    }
    if (this.memoryStore.has(key)) {
      return this.memoryStore.get(key);
    }
    this.memoryStore.set(key, defaultValue);
    return defaultValue;
  }

  set<T>(key: string, value: T): void {
    this.memoryStore.set(key, value);
    if (this.isLocalStorageAvailable()) {
      try {
        window.localStorage.setItem(DB_STORAGE_KEY + key, JSON.stringify(value));
      } catch (e) {
        console.warn('LocalStorage write error:', e);
      }
    }
  }

  clear(): void {
    this.memoryStore.clear();
    if (this.isLocalStorageAvailable()) {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k && k.startsWith(DB_STORAGE_KEY)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach(k => window.localStorage.removeItem(k));
      } catch (e) {
        console.warn('LocalStorage clear error:', e);
      }
    }
  }
}

export const dbStorage = new DatabaseStorage();

// Audit Logger Helper
function logAudit(
  entityType: AuditLog['entityType'],
  entityId: string,
  entityCode: string,
  action: string,
  details: string,
  user: { id?: string; name?: string; role?: string } = {}
) {
  const logs = dbStorage.get<AuditLog[]>('audit_logs', INITIAL_AUDIT_LOGS);
  const now = new Date();
  const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const newLog: AuditLog = {
    id: 'aud-' + Date.now() + Math.random().toString(36).substr(2, 4),
    timestamp: formatted,
    userId: user.id || 'usr-system',
    userName: user.name || 'Sistem Yöneticisi',
    userRole: (user.role as any) || 'Super Admin',
    entityType,
    entityId,
    entityCode,
    action,
    details
  };

  dbStorage.set('audit_logs', [newLog, ...logs]);
}

// 1. Customer Repository
export const customerRepo = {
  findMany: (): Customer[] => {
    return dbStorage.get<Customer[]>('customers', INITIAL_CUSTOMERS);
  },
  findById: (id: string): Customer | undefined => {
    return customerRepo.findMany().find(c => c.id === id);
  },
  create: (data: Omit<Customer, 'id' | 'code' | 'createdAt'>, user?: any): Customer => {
    const list = customerRepo.findMany();
    const code = `CST-2026-${String(list.length + 1).padStart(4, '0')}`;
    const newCustomer: Customer = {
      ...data,
      id: 'cst-' + Date.now(),
      code,
      createdAt: new Date().toISOString()
    };
    dbStorage.set('customers', [newCustomer, ...list]);
    logAudit('CUSTOMER', newCustomer.id, newCustomer.code, 'Müşteri Eklendi', `${newCustomer.name} müşteri kaydı açıldı.`, user);
    return newCustomer;
  },
  update: (id: string, data: Partial<Customer>, user?: any): Customer | null => {
    const list = customerRepo.findMany();
    const idx = list.findIndex(c => c.id === id);
    if (idx === -1) return null;
    const updated = { ...list[idx], ...data };
    list[idx] = updated;
    dbStorage.set('customers', list);
    logAudit('CUSTOMER', updated.id, updated.code, 'Müşteri Güncellendi', `${updated.name} firma bilgileri güncellendi.`, user);
    return updated;
  },
  delete: (id: string, user?: any): boolean => {
    const list = customerRepo.findMany();
    const filtered = list.filter(c => c.id !== id);
    if (filtered.length === list.length) return false;
    dbStorage.set('customers', filtered);
    logAudit('CUSTOMER', id, id, 'Müşteri Silindi', 'Müşteri kaydı silindi.', user);
    return true;
  },
  get360View: (id: string) => {
    const customer = customerRepo.findById(id);
    if (!customer) return null;

    const quotes = quoteRepo.findMany().filter(q => q.customerId === id);
    const proformas = proformaRepo.findMany().filter(p => p.customerId === id);
    const contracts = contractRepo.findMany().filter(c => c.customerId === id);
    const sales = saleRepo.findMany().filter(s => s.customerId === id);
    const serials = serialRepo.findMany().filter(s => s.customerId === id);
    const payments = paymentRepo.findMany().filter(p => p.customerId === id);

    const totalSalesAmount = sales.reduce((acc, s) => acc + s.grandTotal, 0);
    const totalPaymentsAmount = payments.reduce((acc, p) => acc + p.amount, 0);
    const outstandingBalance = Math.max(0, totalSalesAmount - totalPaymentsAmount);

    return {
      customer,
      kpis: {
        totalSales: totalSalesAmount,
        totalQuotes: quotes.length,
        totalProducts: serials.length,
        outstandingBalance
      },
      quotes,
      proformas,
      contracts,
      sales,
      serials,
      payments
    };
  }
};

// 2. Product Repository
export const productRepo = {
  findMany: (): Product[] => {
    return dbStorage.get<Product[]>('products', INITIAL_PRODUCTS);
  },
  findById: (id: string): Product | undefined => {
    return productRepo.findMany().find(p => p.id === id);
  },
  create: (data: Omit<Product, 'id'>, user?: any): Product => {
    const list = productRepo.findMany();
    const newProduct: Product = {
      ...data,
      id: 'prd-base-' + Date.now()
    };
    dbStorage.set('products', [newProduct, ...list]);
    logAudit('PRODUCT', newProduct.id, newProduct.sku, 'Ürün Kataloğa Eklendi', `${newProduct.name} stoğa kaydedildi.`, user);
    return newProduct;
  },
  update: (id: string, data: Partial<Product>, user?: any): Product | null => {
    const list = productRepo.findMany();
    const idx = list.findIndex(p => p.id === id);
    if (idx === -1) return null;
    const updated = { ...list[idx], ...data };
    list[idx] = updated;
    dbStorage.set('products', list);
    logAudit('PRODUCT', updated.id, updated.sku, 'Ürün Parametreleri Güncellendi', `${updated.name} fiyat/stok güncellendi.`, user);
    return updated;
  }
};

// 3. Quote Repository (with server-side calculated totals)
export const quoteRepo = {
  findMany: (): Quote[] => {
    return dbStorage.get<Quote[]>('quotes', INITIAL_QUOTES);
  },
  findById: (id: string): Quote | undefined => {
    return quoteRepo.findMany().find(q => q.id === id);
  },
  create: (quoteData: Partial<Quote>, user?: any): Quote => {
    const settings = settingsRepo.get();
    const nextSeq = settings.sequences.quoteCurrent + 1;
    const quoteNumber = `TKL-${settings.sequences.year}-${String(nextSeq).padStart(6, '0')}`;

    // Backend financial calculation validation rule
    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    const items: QuoteItem[] = (quoteData.items || []).map((item, idx) => {
      const gross = item.quantity * item.unitPrice;
      const discount = (gross * (item.discountRate || 0)) / 100;
      const net = gross - discount;
      const tax = (net * (item.taxRate || 20)) / 100;
      const total = net + tax;

      subtotal += gross;
      discountTotal += discount;
      taxTotal += tax;

      return {
        ...item,
        id: item.id || `qi-${Date.now()}-${idx}`,
        discountAmount: discount,
        taxAmount: tax,
        netAmount: net,
        total
      };
    });

    const grandTotal = subtotal - discountTotal + taxTotal;

    const newQuote: Quote = {
      id: 'qte-' + Date.now(),
      quoteNumber,
      customerId: quoteData.customerId || '',
      customerName: quoteData.customerName || '',
      customerTaxNumber: quoteData.customerTaxNumber || '',
      customerTaxOffice: quoteData.customerTaxOffice || '',
      customerAddress: quoteData.customerAddress || '',
      customerPhone: quoteData.customerPhone || '',
      customerEmail: quoteData.customerEmail || '',
      contactPerson: quoteData.contactPerson || '',
      salesPersonId: user?.id || 'usr-3',
      salesPersonName: user?.name || 'Ahmet Yılmaz',
      date: quoteData.date || new Date().toISOString().split('T')[0],
      validUntil: quoteData.validUntil || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      currency: quoteData.currency || 'TRY',
      paymentTerms: quoteData.paymentTerms || '%50 Sipariş Onayında Peşin, %50 Teslimatta',
      deliveryTerms: quoteData.deliveryTerms || 'Stoktan 3 İş Gününde Adrese Teslim',
      items,
      subtotal,
      discountTotal,
      taxTotal,
      grandTotal,
      status: 'DRAFT',
      notes: quoteData.notes || '',
      revision: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const quotes = quoteRepo.findMany();
    dbStorage.set('quotes', [newQuote, ...quotes]);

    settings.sequences.quoteCurrent = nextSeq;
    settingsRepo.set(settings);

    logAudit('QUOTE', newQuote.id, newQuote.quoteNumber, 'Teklif Oluşturuldu', `${newQuote.customerName} için ${newQuote.grandTotal.toLocaleString('tr-TR')} ₺ teklif tanzim edildi.`, user);
    return newQuote;
  },
  updateStatus: (id: string, status: QuoteStatus, user?: any, note?: string): Quote | null => {
    const list = quoteRepo.findMany();
    const idx = list.findIndex(q => q.id === id);
    if (idx === -1) return null;
    const oldStatus = list[idx].status;
    list[idx].status = status;
    list[idx].updatedAt = new Date().toISOString();
    dbStorage.set('quotes', list);
    logAudit('QUOTE', list[idx].id, list[idx].quoteNumber, 'Teklif Durumu Değişti', `${oldStatus} → ${status}. ${note || ''}`, user);
    return list[idx];
  },
  convertToProforma: (quoteId: string, user?: any): Proforma | null => {
    const quote = quoteRepo.findById(quoteId);
    if (!quote) return null;

    const settings = settingsRepo.get();
    const nextSeq = settings.sequences.proformaCurrent + 1;
    const proformaNumber = `PRO-${settings.sequences.year}-${String(nextSeq).padStart(6, '0')}`;

    const newProforma: Proforma = {
      id: 'prof-' + Date.now(),
      proformaNumber,
      quoteId: quote.id,
      quoteNumber: quote.quoteNumber,
      customerId: quote.customerId,
      customerName: quote.customerName,
      customerTaxNumber: quote.customerTaxNumber,
      customerTaxOffice: quote.customerTaxOffice,
      customerAddress: quote.customerAddress,
      customerPhone: quote.customerPhone,
      customerEmail: quote.customerEmail,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      currency: quote.currency,
      paymentTerms: quote.paymentTerms,
      deliveryTerms: quote.deliveryTerms,
      items: quote.items,
      subtotal: quote.subtotal,
      discountTotal: quote.discountTotal,
      taxTotal: quote.taxTotal,
      grandTotal: quote.grandTotal,
      paidAmount: 0,
      remainingAmount: quote.grandTotal,
      paymentStatus: 'UNPAID',
      bankDetails: {
        bankName: settings.bankName,
        accountHolder: settings.accountHolder,
        iban: settings.iban,
        swift: settings.swift
      },
      notes: `TKL-${quote.quoteNumber} nolu tekliften aktarılmıştır.`,
      createdAt: new Date().toISOString()
    };

    const proformas = proformaRepo.findMany();
    dbStorage.set('proformas', [newProforma, ...proformas]);

    // Mark quote as converted
    quoteRepo.updateStatus(quoteId, 'CONVERTED', user, `Dönüştürülen Proforma: ${newProforma.proformaNumber}`);

    settings.sequences.proformaCurrent = nextSeq;
    settingsRepo.set(settings);

    logAudit('PROFORMA', newProforma.id, newProforma.proformaNumber, 'Tekliften Proforma Oluşturuldu', `${quote.quoteNumber} teklifi ${newProforma.proformaNumber} proformasına dönüştürüldü.`, user);
    return newProforma;
  }
};

// 4. Proforma Repository
export const proformaRepo = {
  findMany: (): Proforma[] => {
    return dbStorage.get<Proforma[]>('proformas', INITIAL_PROFORMAS);
  },
  findById: (id: string): Proforma | undefined => {
    return proformaRepo.findMany().find(p => p.id === id);
  },
  recordPayment: (id: string, amount: number, user?: any): Proforma | null => {
    const list = proformaRepo.findMany();
    const idx = list.findIndex(p => p.id === id);
    if (idx === -1) return null;
    const p = { ...list[idx] };
    const newPaid = (p.paidAmount || 0) + amount;
    const newRem = Math.max(0, p.grandTotal - newPaid);
    p.paidAmount = newPaid;
    p.remainingAmount = newRem;
    p.paymentStatus = newRem === 0 ? 'PAID' : (newPaid > 0 ? 'PARTIAL' : 'UNPAID');
    list[idx] = p;
    dbStorage.set('proformas', list);
    logAudit('PROFORMA', p.id, p.proformaNumber, 'Tahsilat İşlendi', `${p.proformaNumber} için ${amount} ₺ tahsilat işlendi. Kalan: ${newRem} ₺`, user);
    return p;
  }
};

// 5. Contract Repository
export const contractRepo = {
  findMany: (): Contract[] => {
    return dbStorage.get<Contract[]>('contracts', INITIAL_CONTRACTS);
  },
  findById: (id: string): Contract | undefined => {
    return contractRepo.findMany().find(c => c.id === id);
  },
  createFromWorkflow: (sourceType: 'quote' | 'proforma', sourceId: string, user?: any): Contract | null => {
    const settings = settingsRepo.get();
    const nextSeq = settings.sequences.contractCurrent + 1;
    const contractNumber = `SOZ-${settings.sequences.year}-${String(nextSeq).padStart(6, '0')}`;

    let customerId = '';
    let customerName = '';
    let customerTaxNumber = '';
    let customerTaxOffice = '';
    let customerAddress = '';
    let items: QuoteItem[] = [];
    let grandTotal = 0;
    let paymentTerms = '';
    let deliveryTerms = '';
    let quoteId: string | undefined;
    let quoteNumber: string | undefined;
    let proformaId: string | undefined;
    let proformaNumber: string | undefined;

    if (sourceType === 'quote') {
      const q = quoteRepo.findById(sourceId);
      if (!q) return null;
      customerId = q.customerId;
      customerName = q.customerName;
      customerTaxNumber = q.customerTaxNumber;
      customerTaxOffice = q.customerTaxOffice;
      customerAddress = q.customerAddress;
      items = q.items;
      grandTotal = q.grandTotal;
      paymentTerms = q.paymentTerms;
      deliveryTerms = q.deliveryTerms;
      quoteId = q.id;
      quoteNumber = q.quoteNumber;
    } else {
      const p = proformaRepo.findById(sourceId);
      if (!p) return null;
      customerId = p.customerId;
      customerName = p.customerName;
      customerTaxNumber = p.customerTaxNumber;
      customerTaxOffice = p.customerTaxOffice;
      customerAddress = p.customerAddress;
      items = p.items;
      grandTotal = p.grandTotal;
      paymentTerms = p.paymentTerms;
      deliveryTerms = p.deliveryTerms;
      quoteId = p.quoteId;
      quoteNumber = p.quoteNumber;
      proformaId = p.id;
      proformaNumber = p.proformaNumber;
    }

    const newContract: Contract = {
      id: 'cnt-' + Date.now(),
      contractNumber,
      quoteId,
      quoteNumber,
      proformaId,
      proformaNumber,
      customerId,
      customerName,
      customerTaxNumber,
      customerTaxOffice,
      customerAddress,
      customerRepresentative: 'Müşteri Yetkilisi',
      customerTitle: 'Satın Alma Yetkilisi',
      sellerName: settings.companyName,
      sellerTaxNumber: settings.taxNumber,
      sellerTaxOffice: settings.taxOffice,
      sellerAddress: settings.address,
      sellerRepresentative: settings.authorizedSignatory,
      sellerTitle: settings.authorizedSignatoryTitle,
      contractDate: new Date().toISOString().split('T')[0],
      deliveryDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      warrantyTerms: '36 Ay Parça ve Yerinde Üretici Garantisi',
      paymentTerms,
      deliveryTerms,
      specialClauses: [
        'Madde 1: Satıcı, sözleşme konusu ürünleri eksiksiz ve üretici garantisiyle teslim etmeyi taahhüt eder.',
        'Madde 2: Donanım arızalarında 4 saat içinde uzaktan müdahale ve azami 24 saat içinde yerinde servis sağlanacaktır.',
        'Madde 3: Alıcı, mal teslimi ve kabul tutanağı tanzimi akabinde fatura bedelini banka hesabına ödeyecektir.',
        'Madde 4: Uyuşmazlık halinde İstanbul Merkez Mahkemeleri ve İcra Daireleri yetkilidir.'
      ],
      items,
      grandTotal,
      currency: 'TRY',
      status: 'PENDING_SIGNATURE',
      createdAt: new Date().toISOString()
    };

    const contracts = contractRepo.findMany();
    dbStorage.set('contracts', [newContract, ...contracts]);

    settings.sequences.contractCurrent = nextSeq;
    settingsRepo.set(settings);

    logAudit('CONTRACT', newContract.id, newContract.contractNumber, 'Satış Sözleşmesi Oluşturuldu', `${newContract.customerName} için ${newContract.contractNumber} sözleşmesi düzenlendi.`, user);
    return newContract;
  }
};

// 6. Sale Repository & Automated Serialization Engine
export const saleRepo = {
  findMany: (): Sale[] => {
    return dbStorage.get<Sale[]>('sales', INITIAL_SALES);
  },
  findById: (id: string): Sale | undefined => {
    return saleRepo.findMany().find(s => s.id === id);
  },
  createFromWorkflow: (sourceType: 'contract' | 'proforma' | 'quote', sourceId: string, user?: any): Sale | null => {
    const settings = settingsRepo.get();
    const nextSaleSeq = settings.sequences.saleCurrent + 1;
    const saleNumber = `SAT-${settings.sequences.year}-${String(nextSaleSeq).padStart(6, '0')}`;
    const invoiceNumber = `FAT-${settings.sequences.year}-${String(nextSaleSeq + 120).padStart(5, '0')}`;

    let customerId = '';
    let customerName = '';
    let items: QuoteItem[] = [];
    let grandTotal = 0;
    let quoteId: string | undefined;
    let quoteNumber: string | undefined;
    let proformaId: string | undefined;
    let proformaNumber: string | undefined;
    let contractId: string | undefined;
    let contractNumber: string | undefined;

    if (sourceType === 'contract') {
      const c = contractRepo.findById(sourceId);
      if (!c) return null;
      customerId = c.customerId;
      customerName = c.customerName;
      items = c.items;
      grandTotal = c.grandTotal;
      contractId = c.id;
      contractNumber = c.contractNumber;
      quoteId = c.quoteId;
      quoteNumber = c.quoteNumber;
      proformaId = c.proformaId;
      proformaNumber = c.proformaNumber;
    } else if (sourceType === 'proforma') {
      const p = proformaRepo.findById(sourceId);
      if (!p) return null;
      customerId = p.customerId;
      customerName = p.customerName;
      items = p.items;
      grandTotal = p.grandTotal;
      proformaId = p.id;
      proformaNumber = p.proformaNumber;
      quoteId = p.quoteId;
      quoteNumber = p.quoteNumber;
    } else {
      const q = quoteRepo.findById(sourceId);
      if (!q) return null;
      customerId = q.customerId;
      customerName = q.customerName;
      items = q.items;
      grandTotal = q.grandTotal;
      quoteId = q.id;
      quoteNumber = q.quoteNumber;
    }

    const today = new Date().toISOString().split('T')[0];
    const threeYearsLater = new Date(Date.now() + 365 * 3 * 86400000).toISOString().split('T')[0];
    const products = productRepo.findMany();

    // Auto-generate unique product serial numbers (PRD-2026-XXXXXX)
    let currentProdSeq = settings.sequences.productCurrent;
    const generatedSerials: ProductSerial[] = [];
    const generatedSerialIds: string[] = [];

    items.forEach(item => {
      const matchedProd = products.find(p => p.id === item.productId || p.sku === item.productSku);
      const warrantyMonths = matchedProd?.warrantyMonths || 24;
      const warrantyEnd = new Date(Date.now() + warrantyMonths * 30 * 86400000).toISOString().split('T')[0];

      for (let i = 0; i < item.quantity; i++) {
        currentProdSeq++;
        const internalId = `PRD-${settings.sequences.year}-${String(currentProdSeq).padStart(6, '0')}`;
        const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
        const serialNumber = `SN-${item.productSku.split('-')[0]}-${randomHex}`;

        const newSerial: ProductSerial = {
          id: 'prd-ser-' + currentProdSeq,
          internalId,
          serialNumber,
          productId: item.productId,
          productName: item.productName,
          category: matchedProd?.category || 'Kurumsal Donanım',
          brand: matchedProd?.brand || 'Kurumsal Donanım',
          model: matchedProd?.model || item.productName,
          customerId,
          customerName,
          saleId: 'sal-' + nextSaleSeq,
          saleNumber,
          quoteId,
          quoteNumber,
          contractId,
          contractNumber,
          status: 'SOLD',
          deliveryDate: today,
          warrantyStartDate: today,
          warrantyEndDate: warrantyEnd || threeYearsLater,
          notes: `${saleNumber} satışı ile ${customerName} firmasına bağlandı.`,
          createdAt: new Date().toISOString(),
          movements: [
            {
              date: `${today} 12:00`,
              fromStatus: 'STOCK',
              toStatus: 'SOLD',
              action: 'Satış faturası onaylandı ve müşteri envanterine tahsis edildi',
              performedBy: user?.name || 'Sistem Yöneticisi',
              note: `${saleNumber} faturası`
            }
          ],
          serviceRecords: []
        };

        generatedSerials.push(newSerial);
        generatedSerialIds.push(newSerial.id);
      }
    });

    const newSale: Sale = {
      id: 'sal-' + nextSaleSeq,
      saleNumber,
      quoteId,
      quoteNumber,
      proformaId,
      proformaNumber,
      contractId,
      contractNumber,
      customerId,
      customerName,
      date: today,
      invoiceNumber,
      items,
      grandTotal,
      currency: 'TRY',
      paymentStatus: 'PAID',
      deliveryStatus: 'PREPARING',
      paidAmount: grandTotal,
      generatedSerialIds,
      notes: `${sourceType.toUpperCase()} üzerinden onaylanan satış. Toplam ${generatedSerials.length} adet benzersiz PRD kodlu cihaz üretildi.`,
      createdAt: new Date().toISOString()
    };

    const sales = saleRepo.findMany();
    dbStorage.set('sales', [newSale, ...sales]);

    const existingSerials = serialRepo.findMany();
    dbStorage.set('product_serials', [...generatedSerials, ...existingSerials]);

    settings.sequences.saleCurrent = nextSaleSeq;
    settings.sequences.productCurrent = currentProdSeq;
    settingsRepo.set(settings);

    logAudit('SALE', newSale.id, newSale.saleNumber, 'Satış Onaylandı & Seri Nolar Üretildi', `${newSale.customerName} için ${newSale.grandTotal.toLocaleString('tr-TR')} ₺ tutarlı satış gerçekleşti. ${generatedSerials.length} adet PRD-2026-XXXX seri no kaydedildi.`, user);
    return newSale;
  }
};

// 7. Serial Tracking Repository (Lifecycle & Service Management)
export const serialRepo = {
  findMany: (): ProductSerial[] => {
    return dbStorage.get<ProductSerial[]>('product_serials', INITIAL_PRODUCT_SERIALS);
  },
  findById: (id: string): ProductSerial | undefined => {
    return serialRepo.findMany().find(s => s.id === id || s.internalId === id);
  },
  updateStatus: (id: string, newStatus: ProductLifecycleStatus, user?: any, note?: string): ProductSerial | null => {
    const list = serialRepo.findMany();
    const idx = list.findIndex(s => s.id === id);
    if (idx === -1) return null;

    const oldStatus = list[idx].status;
    list[idx].status = newStatus;
    list[idx].movements.unshift({
      date: new Date().toLocaleString('tr-TR'),
      fromStatus: oldStatus,
      toStatus: newStatus,
      action: `Durum Güncellemesi: ${oldStatus} → ${newStatus}`,
      performedBy: user?.name || 'Teknik Servis',
      note: note || ''
    });

    dbStorage.set('product_serials', list);
    logAudit('SERIAL', list[idx].id, list[idx].internalId, 'Cihaz Durumu Değiştirildi', `${list[idx].internalId} durumu ${oldStatus} → ${newStatus} yapıldı.`, user);
    return list[idx];
  },
  addServiceRecord: (id: string, record: Omit<ServiceRecord, 'id'>, user?: any): ProductSerial | null => {
    const list = serialRepo.findMany();
    const idx = list.findIndex(s => s.id === id);
    if (idx === -1) return null;

    const newRecord: ServiceRecord = {
      ...record,
      id: 'srv-' + Date.now()
    };

    list[idx].status = 'SERVICE';
    list[idx].serviceRecords.unshift(newRecord);
    list[idx].movements.unshift({
      date: new Date().toLocaleString('tr-TR'),
      fromStatus: 'ACTIVE',
      toStatus: 'SERVICE',
      action: `Servis Girişi: ${record.type}`,
      performedBy: user?.name || record.technician,
      note: record.issueDescription
    });

    dbStorage.set('product_serials', list);
    logAudit('SERIAL', list[idx].id, list[idx].internalId, 'Arıza/Servis Kaydı Açıldı', `${list[idx].internalId} için servis kaydı oluşturuldu: ${record.issueDescription}`, user);
    return list[idx];
  }
};

// 8. Payment Repository
export const paymentRepo = {
  findMany: (): Payment[] => {
    return dbStorage.get<Payment[]>('payments', INITIAL_PAYMENTS);
  },
  create: (data: Omit<Payment, 'id' | 'paymentNumber'>, user?: any): Payment => {
    const list = paymentRepo.findMany();
    const settings = settingsRepo.get();
    const paymentNumber = `OD-${settings.sequences.year}-${String(list.length + 101).padStart(6, '0')}`;

    const newPayment: Payment = {
      ...data,
      id: 'pay-' + Date.now(),
      paymentNumber
    };

    dbStorage.set('payments', [newPayment, ...list]);
    logAudit('SETTINGS', newPayment.id, newPayment.paymentNumber, 'Tahsilat Girişi Yapıldı', `${newPayment.customerName} firmasından ${newPayment.amount.toLocaleString('tr-TR')} ₺ tahsil edildi.`, user);
    return newPayment;
  }
};

// 9. Settings Repository
export const settingsRepo = {
  get: (): CompanySettings => {
    return dbStorage.get<CompanySettings>('company_settings', INITIAL_COMPANY_SETTINGS);
  },
  set: (settings: CompanySettings, user?: any): void => {
    dbStorage.set('company_settings', settings);
    logAudit('SETTINGS', 'settings-id', 'Firma Bilgileri', 'Firma Ayarları Güncellendi', 'Şirket ayarları ve numaratörler güncellendi.', user);
  }
};

// 10. Audit Log Repository
export const auditRepo = {
  findMany: (): AuditLog[] => {
    return dbStorage.get<AuditLog[]>('audit_logs', INITIAL_AUDIT_LOGS);
  }
};

// 11. Dashboard Analytics Service
export const dashboardRepo = {
  getMetrics: () => {
    const sales = saleRepo.findMany();
    const quotes = quoteRepo.findMany();
    const proformas = proformaRepo.findMany();
    const customers = customerRepo.findMany();
    const serials = serialRepo.findMany();

    const totalSales = sales.reduce((acc, s) => acc + s.grandTotal, 0);
    const pendingQuotes = quotes.filter(q => q.status === 'SENT' || q.status === 'ACCEPTED').reduce((acc, q) => acc + q.grandTotal, 0);
    const outstandingPayments = proformas.filter(p => p.remainingAmount > 0).reduce((acc, p) => acc + p.remainingAmount, 0);
    const activeProducts = serials.filter(s => s.status === 'ACTIVE' || s.status === 'DELIVERED').length;
    const expiringWarranties = serials.filter(s => {
      if (!s.warrantyEndDate) return false;
      const end = new Date(s.warrantyEndDate).getTime();
      const now = Date.now();
      const diffDays = (end - now) / (1000 * 3600 * 24);
      return diffDays > 0 && diffDays <= 60;
    }).length;

    return {
      totalSales,
      pendingQuotes,
      activeCustomers: customers.length,
      productsSold: serials.length,
      outstandingPayments,
      expiringWarranties
    };
  }
};

// 12. User Repository
export const userRepo = {
  findMany: (): User[] => {
    return dbStorage.get<User[]>('users', INITIAL_USERS);
  },
  findById: (id: string): User | undefined => {
    return userRepo.findMany().find(u => u.id === id);
  }
};
