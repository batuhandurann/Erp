import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Customer,
  Product,
  Quote,
  QuoteStatus,
  Proforma,
  Contract,
  Sale,
  ProductSerial,
  ProductLifecycleStatus,
  Payment,
  AuditLog,
  CompanySettings,
  AppNotification,
  ServiceRecord,
  QuoteItem,
  ToastMessage
} from '../types';
import {
  INITIAL_USERS,
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
  INITIAL_NOTIFICATIONS
} from '../mock/seedData';
import { hasPermission, AppPermission } from '../types/rbac';
import { api, http } from '../services/apiClient';

export const roundCurrency = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

export type AppView = 
  | 'dashboard'
  | 'quotes'
  | 'proformas'
  | 'contracts'
  | 'sales'
  | 'inventory'
  | 'customers'
  | 'products'
  | 'finance'
  | 'reports'
  | 'users'
  | 'settings'
  | 'audit';

interface DocumentViewerState {
  open: boolean;
  type: 'quote' | 'proforma' | 'contract' | 'sale';
  data: any;
}

interface AppContextType {
  // Navigation & UI
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  documentViewer: DocumentViewerState;
  openDocumentViewer: (type: 'quote' | 'proforma' | 'contract' | 'sale', data: any) => void;
  closeDocumentViewer: () => void;
  globalSearchOpen: boolean;
  setGlobalSearchOpen: (open: boolean) => void;

  // Role & User & Auth
  users: User[];
  currentUser: User;
  isAuthenticated: boolean;
  login: (identifier: string, password?: string, tenantId?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUser: (user: User) => void;
  canPerformAction: (requiredRole: string | string[]) => boolean;

  // Data Collections
  customers: Customer[];
  products: Product[];
  quotes: Quote[];
  proformas: Proforma[];
  contracts: Contract[];
  sales: Sale[];
  productSerials: ProductSerial[];
  payments: Payment[];
  auditLogs: AuditLog[];
  companySettings: CompanySettings;
  notifications: AppNotification[];

  // Mutations
  addCustomer: (customer: Omit<Customer, 'id' | 'code' | 'createdAt'>) => Customer;
  updateCustomer: (customer: Customer) => void;
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (product: Product) => void;

  // Workflow Core Engine
  createQuote: (quoteData: Partial<Quote>) => Quote;
  updateQuoteStatus: (quoteId: string, status: QuoteStatus, note?: string) => void;
  convertQuoteToProforma: (quoteId: string) => Proforma | null;
  convertQuoteToContract: (quoteId: string) => Contract | null;
  convertProformaToContract: (proformaId: string) => Contract | null;
  createSaleFromWorkflow: (sourceType: 'proforma' | 'contract' | 'quote', sourceId: string) => Sale | null;
  
  // Inventory & Product Lifecycle
  updateSerialStatus: (serialId: string, newStatus: ProductLifecycleStatus, note?: string) => void;
  addServiceRecord: (serialId: string, record: Omit<ServiceRecord, 'id'>) => void;
  updateServiceRecord: (serialId: string, recordId: string, updates: Partial<ServiceRecord>) => void;
  
  // Finance
  recordPayment: (payment: Omit<Payment, 'id' | 'paymentNumber'>) => void;

  // Settings & System
  updateCompanySettings: (settings: CompanySettings) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  resetToDefaults: () => void;

  // Commercial SaaS Additions
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  onboardingDismissed: boolean;
  setOnboardingDismissed: (dismissed: boolean) => void;
  isDemoMode: boolean;
  loadDemoData: () => void;
  loadCleanData: () => void;
  keyboardShortcutsOpen: boolean;
  setKeyboardShortcutsOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'proquote_erp_data_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from localStorage or seedData
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [documentViewer, setDocumentViewer] = useState<DocumentViewerState>({
    open: false,
    type: 'quote',
    data: null
  });

  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !!sessionStorage.getItem('bf_active_user');
    }
    return false;
  });
  const [currentUser, setCurrentUser] = useState<User>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('bf_active_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    return INITIAL_USERS[0];
  });
  const [companySettings, setCompanySettings] = useState<CompanySettings>(INITIAL_COMPANY_SETTINGS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [quotes, setQuotes] = useState<Quote[]>(INITIAL_QUOTES);
  const [proformas, setProformas] = useState<Proforma[]>(INITIAL_PROFORMAS);
  const [contracts, setContracts] = useState<Contract[]>(INITIAL_CONTRACTS);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [productSerials, setProductSerials] = useState<ProductSerial[]>(INITIAL_PRODUCT_SERIALS);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  // SaaS Commercial States
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [onboardingDismissed, setOnboardingDismissed] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY + '_onboarding') === 'true';
  });
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [keyboardShortcutsOpen, setKeyboardShortcutsOpen] = useState(false);

  // Load real business data from HTTP backend on mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [cRes, pRes, qRes, profRes, contRes, sRes, serRes, payRes, setRes, audRes] = await Promise.all([
          api.customers.list(),
          api.products.list(),
          api.quotes.list(),
          api.proformas.list(),
          api.contracts.list(),
          api.sales.list(),
          api.serials.list(),
          api.payments.list(),
          api.settings.get(),
          api.audit.list()
        ]);

        if (!isMounted) return;
        if (cRes.success && cRes.data) setCustomers(cRes.data);
        if (pRes.success && pRes.data) setProducts(pRes.data);
        if (qRes.success && qRes.data) setQuotes(qRes.data);
        if (profRes.success && profRes.data) setProformas(profRes.data);
        if (contRes.success && contRes.data) setContracts(contRes.data);
        if (sRes.success && sRes.data) setSales(sRes.data);
        if (serRes.success && serRes.data) setProductSerials(serRes.data);
        if (payRes.success && payRes.data) setPayments(payRes.data);
        if (setRes.success && setRes.data) setCompanySettings(setRes.data);
        if (audRes.success && audRes.data) setAuditLogs(audRes.data);
      } catch (err) {
        console.warn('API data fetch warning (operating with in-memory state):', err);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = 'tst-' + Date.now() + Math.random().toString(36).substr(2, 4);
    const newToast: ToastMessage = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration || 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleSetOnboardingDismissed = (dismissed: boolean) => {
    setOnboardingDismissed(dismissed);
    localStorage.setItem(STORAGE_KEY + '_onboarding', dismissed ? 'true' : 'false');
  };

  const loadDemoData = () => {
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setCompanySettings(INITIAL_COMPANY_SETTINGS);
    setCustomers(INITIAL_CUSTOMERS);
    setProducts(INITIAL_PRODUCTS);
    setQuotes(INITIAL_QUOTES);
    setProformas(INITIAL_PROFORMAS);
    setContracts(INITIAL_CONTRACTS);
    setSales(INITIAL_SALES);
    setProductSerials(INITIAL_PRODUCT_SERIALS);
    setPayments(INITIAL_PAYMENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setIsDemoMode(true);
    localStorage.setItem(STORAGE_KEY + '_demo_mode', 'true');
    addToast({
      title: 'Demo Veri Seti Yüklendi',
      message: 'Örnek kurumsal müşteriler, ürünler ve teklifler yüklendi.',
      type: 'info'
    });
  };

  const loadCleanData = () => {
    setCustomers([]);
    setQuotes([]);
    setProformas([]);
    setContracts([]);
    setSales([]);
    setProductSerials([]);
    setPayments([]);
    setNotifications([]);
    setIsDemoMode(false);
    localStorage.setItem(STORAGE_KEY + '_demo_mode', 'false');
    addToast({
      title: 'Temiz Çalışma Ortamı',
      message: 'Tüm test verileri temizlendi. Gerçek operasyonel verilerinizi girmeye hazırsınız.',
      type: 'success'
    });
  };

  // Keyboard Shortcuts Global Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT');
      
      // Escape closes shortcuts or viewer
      if (e.key === 'Escape') {
        if (keyboardShortcutsOpen) setKeyboardShortcutsOpen(false);
        if (documentViewer.open) closeDocumentViewer();
        if (globalSearchOpen) setGlobalSearchOpen(false);
        return;
      }

      if (isInput) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setGlobalSearchOpen(!globalSearchOpen);
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setKeyboardShortcutsOpen(prev => !prev);
        return;
      }

      if (e.key === 'd' || e.key === 'D') {
        setActiveView('dashboard');
        return;
      }

      if (e.key === 'p' || e.key === 'P') {
        setActiveView('products');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyboardShortcutsOpen, documentViewer.open, globalSearchOpen]);

  // UI preferences persistence only (strictly no business data in localStorage)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_onboarding', onboardingDismissed ? 'true' : 'false');
  }, [onboardingDismissed]);

  // Helper for audit logging
  const logAudit = (
    entityType: AuditLog['entityType'],
    entityId: string,
    entityCode: string,
    action: string,
    details: string
  ) => {
    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const newLog: AuditLog = {
      id: 'aud-' + Date.now() + Math.random().toString(36).substr(2, 4),
      timestamp: formatted,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      entityType,
      entityId,
      entityCode,
      action,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: 'notif-' + Date.now(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // RBAC permission check
  const checkPermission = (permission: AppPermission, actionName: string): boolean => {
    const allowed = hasPermission(currentUser.role, permission);
    if (!allowed) {
      logAudit(
        'SETTINGS',
        currentUser.id,
        currentUser.role,
        'YETKİSİZ İŞLEM ENGELLENDİ (403)',
        `'${currentUser.role}' rolündeki ${currentUser.name}, yetkisi bulunmayan '${actionName}' (${permission}) eylemini çalıştırmayı denedi.`
      );
      addToast({
        type: 'error',
        title: 'Yetki Yetersiz (403)',
        message: `'${currentUser.role}' rolünüz bu işlem (${actionName}) için yetkili değildir.`
      });
      return false;
    }
    return true;
  };

  const canPerformAction = (requiredRole: string | string[]) => {
    if (currentUser.role === 'Super Admin') return true;
    if (currentUser.role === 'Sadece Görüntüleme') return false;
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(currentUser.role) || currentUser.role === 'Admin';
    }
    return currentUser.role === requiredRole || currentUser.role === 'Admin';
  };

  const login = async (identifier: string, password?: string, tenantId: string = 'org-apex-01'): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.auth.login(identifier, password, tenantId);
      if (res.success && (res.data?.user || (res as any).user)) {
        const loggedUser = res.data?.user || (res as any).user;
        setCurrentUser(loggedUser);
        setIsAuthenticated(true);
        sessionStorage.setItem('bf_active_user', JSON.stringify(loggedUser));
        const token = res.data?.token || (res as any).token || (res as any).accessToken;
        if (token) {
          http.setToken(token);
        }
        addToast({
          type: 'success',
          title: 'Giriş Başarılı',
          message: `Hoş geldiniz, Sn. ${loggedUser.name} (${loggedUser.role})`
        });
        return { success: true };
      } else {
        return { 
          success: false, 
          error: res.error?.message || 'Kullanıcı ID veya parola hatalı.' 
        };
      }
    } catch (err: any) {
      return { 
        success: false, 
        error: err.message || 'Bağlantı hatası oluştu.' 
      };
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    sessionStorage.removeItem('bf_active_user');
    sessionStorage.removeItem('bf_auth_token');
    addToast({
      type: 'info',
      title: 'Oturum Kapatıldı',
      message: 'Güvenli bir şekilde çıkış yaptınız.'
    });
  };

  const switchUser = (user: User) => {
    setCurrentUser(user);
    sessionStorage.setItem('bf_active_user', JSON.stringify(user));
    logAudit(
      'SETTINGS',
      user.id,
      user.email,
      'Kullanıcı Rolü Değiştirildi',
      `Aktif oturum ${user.name} (${user.role}) olarak güncellendi.`
    );
  };

  const openDocumentViewer = (type: 'quote' | 'proforma' | 'contract' | 'sale', data: any) => {
    setDocumentViewer({ open: true, type, data });
  };

  const closeDocumentViewer = () => {
    setDocumentViewer({ open: false, type: 'quote', data: null });
  };

  // Customer Actions
  const addCustomer = (customerData: Omit<Customer, 'id' | 'code' | 'createdAt'>) => {
    if (!checkPermission('customer.create', 'Yeni Müşteri Ekle')) return null as any;
    const code = `MSR-${companySettings.sequences.year}-${String(customers.length + 1).padStart(4, '0')}`;
    const newCustomer: Customer = {
      ...customerData,
      id: 'cst-' + Date.now(),
      code,
      createdAt: new Date().toISOString()
    };
    setCustomers(prev => [newCustomer, ...prev]);
    logAudit('CUSTOMER', newCustomer.id, newCustomer.code, 'Yeni Müşteri Eklendi', `${newCustomer.name} müşteri portföyüne kaydedildi.`);
    return newCustomer;
  };

  const updateCustomer = (updated: Customer) => {
    if (!checkPermission('customer.update', 'Müşteri Güncelle')) return;
    setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
    logAudit('CUSTOMER', updated.id, updated.code, 'Müşteri Bilgileri Güncellendi', `${updated.name} firma kayıtları revize edildi.`);
  };

  // Product Actions
  const addProduct = (productData: Omit<Product, 'id'>) => {
    if (!checkPermission('product.create', 'Ürün Ekle')) return null as any;
    const newProduct: Product = {
      ...productData,
      id: 'prd-base-' + Date.now()
    };
    setProducts(prev => [newProduct, ...prev]);
    logAudit('PRODUCT', newProduct.id, newProduct.sku, 'Yeni Ürün Kataloğa Eklendi', `${newProduct.name} stok birimi oluşturuldu.`);
    return newProduct;
  };

  const updateProduct = (updated: Product) => {
    if (!checkPermission('product.update', 'Ürün Güncelle')) return;
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    logAudit('PRODUCT', updated.id, updated.sku, 'Ürün Bilgisi Güncellendi', `${updated.name} fiyat/stok parametreleri güncellendi.`);
  };

  // Workflow: Quote Management
  const createQuote = (quoteData: Partial<Quote>) => {
    if (!checkPermission('quote.create', 'Teklif Oluştur')) return null as any;

    const nextSeq = companySettings.sequences.quoteCurrent + 1;
    const quoteNumber = `TKL-${companySettings.sequences.year}-${String(nextSeq).padStart(6, '0')}`;
    
    // Calculate totals securely with high precision rounding
    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;
    
    const items: QuoteItem[] = (quoteData.items || []).map((item, idx) => {
      const gross = roundCurrency(item.quantity * item.unitPrice);
      const discount = roundCurrency((gross * (item.discountRate || 0)) / 100);
      const net = roundCurrency(gross - discount);
      const tax = roundCurrency((net * (item.taxRate !== undefined ? item.taxRate : 20)) / 100);
      const total = roundCurrency(net + tax);

      subtotal = roundCurrency(subtotal + gross);
      discountTotal = roundCurrency(discountTotal + discount);
      taxTotal = roundCurrency(taxTotal + tax);

      return {
        ...item,
        id: item.id || `qi-${Date.now()}-${idx}`,
        discountAmount: discount,
        taxAmount: tax,
        netAmount: net,
        total
      };
    });

    const grandTotal = roundCurrency(subtotal - discountTotal + taxTotal);

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
      salesPersonId: currentUser.id,
      salesPersonName: currentUser.name,
      date: quoteData.date || new Date().toISOString().split('T')[0],
      validUntil: quoteData.validUntil || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      currency: quoteData.currency || 'TRY',
      paymentTerms: quoteData.paymentTerms || '%50 Siparişte Peşin, %50 Teslimatta',
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

    setQuotes(prev => [newQuote, ...prev]);
    setCompanySettings(prev => ({
      ...prev,
      sequences: { ...prev.sequences, quoteCurrent: nextSeq }
    }));

    logAudit('QUOTE', newQuote.id, newQuote.quoteNumber, 'Teklif Oluşturuldu', `${newQuote.customerName} için ${newQuote.grandTotal.toLocaleString('tr-TR')} ₺ tutarında teklif hazırlandı.`);
    return newQuote;
  };

  const updateQuoteStatus = (quoteId: string, status: QuoteStatus, note?: string) => {
    setQuotes(prev => prev.map(q => {
      if (q.id === quoteId) {
        logAudit(
          'QUOTE',
          q.id,
          q.quoteNumber,
          'Teklif Durumu Değiştirildi',
          `Teklif durumu ${q.status} → ${status} yapıldı. ${note ? `(Not: ${note})` : ''}`
        );
        return { ...q, status, updatedAt: new Date().toISOString() };
      }
      return q;
    }));
  };

  // Workflow Step: Quote -> Proforma
  const convertQuoteToProforma = (quoteId: string): Proforma | null => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return null;

    const nextSeq = companySettings.sequences.proformaCurrent + 1;
    const proformaNumber = `PRO-${companySettings.sequences.year}-${String(nextSeq).padStart(6, '0')}`;

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
        bankName: companySettings.bankName,
        accountHolder: companySettings.accountHolder,
        iban: companySettings.iban,
        swift: companySettings.swift
      },
      notes: `TKL-${quote.quoteNumber} nolu tekliften otomatik türetilmiştir. ${quote.notes || ''}`,
      createdAt: new Date().toISOString()
    };

    setProformas(prev => [newProforma, ...prev]);
    setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status: 'CONVERTED', convertedToProformaId: newProforma.id } : q));
    setCompanySettings(prev => ({
      ...prev,
      sequences: { ...prev.sequences, proformaCurrent: nextSeq }
    }));

    logAudit(
      'PROFORMA',
      newProforma.id,
      newProforma.proformaNumber,
      'Tekliften Proforma Oluşturuldu',
      `${quote.quoteNumber} teklifi ${newProforma.proformaNumber} proformasına dönüştürüldü.`
    );

    addNotification({
      title: 'Proforma Fatura Hazırlandı',
      message: `${quote.customerName} için ${newProforma.proformaNumber} proforması oluşturuldu.`,
      type: 'SUCCESS',
      date: new Date().toLocaleDateString('tr-TR'),
      linkType: 'proforma',
      targetId: newProforma.id
    });

    return newProforma;
  };

  // Workflow Step: Quote or Proforma -> Satış Sözleşmesi
  const convertQuoteToContract = (quoteId: string): Contract | null => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return null;

    const nextSeq = companySettings.sequences.contractCurrent + 1;
    const contractNumber = `SOZ-${companySettings.sequences.year}-${String(nextSeq).padStart(6, '0')}`;

    const newContract: Contract = {
      id: 'cnt-' + Date.now(),
      contractNumber,
      quoteId: quote.id,
      quoteNumber: quote.quoteNumber,
      proformaId: quote.convertedToProformaId,
      customerId: quote.customerId,
      customerName: quote.customerName,
      customerTaxNumber: quote.customerTaxNumber,
      customerTaxOffice: quote.customerTaxOffice,
      customerAddress: quote.customerAddress,
      customerRepresentative: quote.contactPerson || 'Müşteri Yetkilisi',
      customerTitle: 'Satın Alma Yetkilisi',
      sellerName: companySettings.companyName,
      sellerTaxNumber: companySettings.taxNumber,
      sellerTaxOffice: companySettings.taxOffice,
      sellerAddress: companySettings.address,
      sellerRepresentative: companySettings.authorizedSignatory,
      sellerTitle: companySettings.authorizedSignatoryTitle,
      contractDate: new Date().toISOString().split('T')[0],
      deliveryDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      warrantyTerms: '36 Ay Parça ve Yerinde Üretici Garantisi',
      paymentTerms: quote.paymentTerms,
      deliveryTerms: quote.deliveryTerms,
      specialClauses: [
        'Madde 1 (Konu): İşbu sözleşme konusu; Satıcı tarafından Alıcıya ekte listelenen donanım ve yazılım ürünlerinin satışı, teslimi ve kurulum şartlarını düzenler.',
        'Madde 2 (Teslimat ve Montaj): Satıcı, sözleşme konusu ürünleri belirtilen adrese eksiksiz, orijinal kutusunda ve çalışır vaziyette teslim edecektir.',
        'Madde 3 (Garanti ve Servis): Ürünler teslim tarihinden itibaren asgari 24/36 ay üretici garantisi altında olup, arıza halinde azami 24 saat içinde müdahale taahhüt edilir.',
        'Madde 4 (Ödeme ve Mülkiyet): Alıcı kararlaştırılan ödeme planına riayet etmekle yükümlüdür. Tam bedel ödenene kadar donanım mülkiyeti satıcıya aittir.',
        'Madde 5 (Yetkili Mahkeme): İşbu sözleşmenin icrasından doğacak ihtilaflarda İstanbul Merkez (Çağlayan) Mahkemeleri ve İcra Daireleri yetkilidir.'
      ],
      items: quote.items,
      grandTotal: quote.grandTotal,
      currency: quote.currency,
      status: 'PENDING_SIGNATURE',
      notes: `Teklif ${quote.quoteNumber} referanslı satış sözleşmesi.`,
      createdAt: new Date().toISOString()
    };

    setContracts(prev => [newContract, ...prev]);
    setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, convertedToContractId: newContract.id } : q));
    setCompanySettings(prev => ({
      ...prev,
      sequences: { ...prev.sequences, contractCurrent: nextSeq }
    }));

    logAudit(
      'CONTRACT',
      newContract.id,
      newContract.contractNumber,
      'Satış Sözleşmesi Düzenlendi',
      `${quote.quoteNumber} teklifinden ${newContract.contractNumber} sözleşmesi oluşturuldu.`
    );

    addNotification({
      title: 'Satış Sözleşmesi Oluşturuldu',
      message: `${quote.customerName} için ${newContract.contractNumber} sözleşmesi imza aşamasına getirildi.`,
      type: 'INFO',
      date: new Date().toLocaleDateString('tr-TR'),
      linkType: 'contract',
      targetId: newContract.id
    });

    return newContract;
  };

  const convertProformaToContract = (proformaId: string): Contract | null => {
    const prof = proformas.find(p => p.id === proformaId);
    if (!prof) return null;

    const nextSeq = companySettings.sequences.contractCurrent + 1;
    const contractNumber = `SOZ-${companySettings.sequences.year}-${String(nextSeq).padStart(6, '0')}`;

    const newContract: Contract = {
      id: 'cnt-' + Date.now(),
      contractNumber,
      quoteId: prof.quoteId,
      quoteNumber: prof.quoteNumber,
      proformaId: prof.id,
      proformaNumber: prof.proformaNumber,
      customerId: prof.customerId,
      customerName: prof.customerName,
      customerTaxNumber: prof.customerTaxNumber,
      customerTaxOffice: prof.customerTaxOffice,
      customerAddress: prof.customerAddress,
      customerRepresentative: 'Müşteri Yetkilisi',
      customerTitle: 'Satın Alma Yetkilisi',
      sellerName: companySettings.companyName,
      sellerTaxNumber: companySettings.taxNumber,
      sellerTaxOffice: companySettings.taxOffice,
      sellerAddress: companySettings.address,
      sellerRepresentative: companySettings.authorizedSignatory,
      sellerTitle: companySettings.authorizedSignatoryTitle,
      contractDate: new Date().toISOString().split('T')[0],
      deliveryDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      warrantyTerms: '36 Ay Parça ve Yerinde Üretici Garantisi',
      paymentTerms: prof.paymentTerms,
      deliveryTerms: prof.deliveryTerms,
      specialClauses: [
        'Madde 1 (Konu): Satıcı tarafından Alıcıya ekte listelenen donanım ve yazılım ürünlerinin satışı ve teslimi.',
        'Madde 2 (Teslimat): Satıcı ürünleri Alıcının belirttiği adrese fatura ve irsaliye eşliğinde teslim edecektir.',
        'Madde 3 (Garanti): Ürünler üretici garantisi altında olup arıza durumunda yerinde parça değişimi sağlanacaktır.',
        'Madde 4 (Yetkili Mahkeme): Doğabilecek uyuşmazlıklarda İstanbul Mahkemeleri yetkilidir.'
      ],
      items: prof.items,
      grandTotal: prof.grandTotal,
      currency: prof.currency,
      status: 'PENDING_SIGNATURE',
      notes: `Proforma ${prof.proformaNumber} referanslı sözleşme.`,
      createdAt: new Date().toISOString()
    };

    setContracts(prev => [newContract, ...prev]);
    setProformas(prev => prev.map(p => p.id === proformaId ? { ...p, convertedToContractId: newContract.id } : p));
    setCompanySettings(prev => ({
      ...prev,
      sequences: { ...prev.sequences, contractCurrent: nextSeq }
    }));

    logAudit(
      'CONTRACT',
      newContract.id,
      newContract.contractNumber,
      'Proformadan Sözleşme Oluşturuldu',
      `${prof.proformaNumber} proformasından ${newContract.contractNumber} sözleşmesi üretildi.`
    );

    return newContract;
  };

  // Workflow Core: Finalize Sale & Auto-Generate Unique Product Serial IDs (PRD-2026-XXXX)
  const createSaleFromWorkflow = (
    sourceType: 'proforma' | 'contract' | 'quote',
    sourceId: string
  ): Sale | null => {
    let customerId = '';
    let customerName = '';
    let items: QuoteItem[] = [];
    let grandTotal = 0;
    let currency: 'TRY' | 'USD' | 'EUR' = 'TRY';
    let quoteId: string | undefined;
    let quoteNumber: string | undefined;
    let proformaId: string | undefined;
    let proformaNumber: string | undefined;
    let contractId: string | undefined;
    let contractNumber: string | undefined;

    if (sourceType === 'proforma') {
      const p = proformas.find(item => item.id === sourceId);
      if (!p) return null;
      customerId = p.customerId;
      customerName = p.customerName;
      items = p.items;
      grandTotal = p.grandTotal;
      currency = p.currency;
      proformaId = p.id;
      proformaNumber = p.proformaNumber;
      quoteId = p.quoteId;
      quoteNumber = p.quoteNumber;
    } else if (sourceType === 'contract') {
      const c = contracts.find(item => item.id === sourceId);
      if (!c) return null;
      customerId = c.customerId;
      customerName = c.customerName;
      items = c.items;
      grandTotal = c.grandTotal;
      currency = c.currency;
      contractId = c.id;
      contractNumber = c.contractNumber;
      quoteId = c.quoteId;
      quoteNumber = c.quoteNumber;
      proformaId = c.proformaId;
      proformaNumber = c.proformaNumber;
    } else if (sourceType === 'quote') {
      const q = quotes.find(item => item.id === sourceId);
      if (!q) return null;
      customerId = q.customerId;
      customerName = q.customerName;
      items = q.items;
      grandTotal = q.grandTotal;
      currency = q.currency;
      quoteId = q.id;
      quoteNumber = q.quoteNumber;
    }

    const nextSaleSeq = companySettings.sequences.saleCurrent + 1;
    const saleNumber = `SAT-${companySettings.sequences.year}-${String(nextSaleSeq).padStart(6, '0')}`;
    const invoiceNumber = `FAT-${companySettings.sequences.year}-${String(nextSaleSeq + 120).padStart(5, '0')}`;

    // Generate individual serial items for every quantity sold!
    // Example: 5 Dell Servers -> 5 distinct PRD-2026-000455, PRD-2026-000456...
    let currentProdSeq = companySettings.sequences.productCurrent;
    const generatedSerials: ProductSerial[] = [];
    const generatedSerialIds: string[] = [];

    const nowStr = new Date().toISOString();
    const today = nowStr.split('T')[0];
    const threeYearsLater = new Date(Date.now() + 365 * 3 * 86400000).toISOString().split('T')[0];

    items.forEach(item => {
      const matchedCatalogProduct = products.find(p => p.id === item.productId || p.sku === item.productSku);
      const warrantyMonths = matchedCatalogProduct ? matchedCatalogProduct.warrantyMonths : 24;
      const warrantyEnd = new Date(Date.now() + warrantyMonths * 30 * 86400000).toISOString().split('T')[0];

      for (let i = 0; i < item.quantity; i++) {
        currentProdSeq++;
        const internalId = `PRD-${companySettings.sequences.year}-${String(currentProdSeq).padStart(6, '0')}`;
        
        // Auto-generate manufacturer serial number
        const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
        const serialNumber = `SN-${item.productSku.split('-')[0]}-${randomHex}`;

        const newSerial: ProductSerial = {
          id: 'prd-ser-' + currentProdSeq,
          internalId,
          serialNumber,
          productId: item.productId,
          productName: item.productName,
          category: matchedCatalogProduct?.category || 'Genel Donanım',
          brand: matchedCatalogProduct?.brand || 'Kurumsal Donanım',
          model: matchedCatalogProduct?.model || item.productName,
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
          notes: `${saleNumber} nolu satış ile ${customerName} firmasına tahsis edildi.`,
          createdAt: nowStr,
          movements: [
            {
              date: `${today} 12:00`,
              fromStatus: 'STOCK',
              toStatus: 'SOLD',
              action: 'Satış faturası onaylandı ve müşteriye bağlandı',
              performedBy: currentUser.name,
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
      currency,
      paymentStatus: 'PAID',
      deliveryStatus: 'PREPARING',
      paidAmount: grandTotal,
      generatedSerialIds,
      notes: `${sourceType.toUpperCase()} kaynağından satışa dönüştürüldü. Toplam ${generatedSerials.length} adet ürün ID'si oluşturuldu.`,
      createdAt: nowStr
    };

    setSales(prev => [newSale, ...prev]);
    setProductSerials(prev => [...generatedSerials, ...prev]);
    
    // Decrement stock from catalog products
    setProducts(prev => prev.map(p => {
      const soldItem = items.find(it => it.productId === p.id || it.productSku === p.sku);
      if (soldItem) {
        return { ...p, stockQuantity: Math.max(0, p.stockQuantity - soldItem.quantity) };
      }
      return p;
    }));

    // Update sequence counters
    setCompanySettings(prev => ({
      ...prev,
      sequences: {
        ...prev.sequences,
        saleCurrent: nextSaleSeq,
        productCurrent: currentProdSeq
      }
    }));

    logAudit(
      'SALE',
      newSale.id,
      newSale.saleNumber,
      'Satış Onaylandı & Seri Numaraları Üretildi',
      `${newSale.customerName} için ${newSale.grandTotal.toLocaleString('tr-TR')} ₺ tutarlı satış gerçekleşti. ${generatedSerials.length} adet benzersiz ürün ID'si (PRD-2026-XXXX) sisteme kaydedildi.`
    );

    addNotification({
      title: 'Satış Gerçekleşti & Ürünler Kaydedildi',
      message: `${newSale.saleNumber} onaylandı. ${generatedSerials.length} adet ürün envanter takip sistemine dahil edildi.`,
      type: 'SUCCESS',
      date: new Date().toLocaleDateString('tr-TR'),
      linkType: 'sale',
      targetId: newSale.id
    });

    return newSale;
  };

  // Product Serial Lifecycle & Service Management
  const updateSerialStatus = (serialId: string, newStatus: ProductLifecycleStatus, note?: string) => {
    setProductSerials(prev => prev.map(serial => {
      if (serial.id === serialId) {
        const movement = {
          date: new Date().toLocaleString('tr-TR'),
          fromStatus: serial.status,
          toStatus: newStatus,
          action: `Durum değişikliği: ${serial.status} → ${newStatus}`,
          performedBy: currentUser.name,
          note: note || ''
        };
        logAudit(
          'SERIAL',
          serial.id,
          serial.internalId,
          'Ürün Yaşam Döngüsü Güncellendi',
          `Ürün ${serial.internalId} (${serial.serialNumber}) durumu ${serial.status} → ${newStatus} olarak güncellendi.`
        );
        return {
          ...serial,
          status: newStatus,
          movements: [movement, ...serial.movements]
        };
      }
      return serial;
    }));
  };

  const addServiceRecord = (serialId: string, recordData: Omit<ServiceRecord, 'id'>) => {
    const newRecord: ServiceRecord = {
      ...recordData,
      id: 'srv-' + Date.now()
    };
    setProductSerials(prev => prev.map(serial => {
      if (serial.id === serialId) {
        const movement = {
          date: new Date().toLocaleString('tr-TR'),
          fromStatus: serial.status,
          toStatus: 'SERVICE' as ProductLifecycleStatus,
          action: `Servis & Arıza Kaydı: ${recordData.type}`,
          performedBy: currentUser.name,
          note: recordData.issueDescription
        };
        logAudit(
          'SERIAL',
          serial.id,
          serial.internalId,
          'Servis / Arıza Kaydı Eklendi',
          `${serial.internalId} için servis kaydı oluşturuldu: ${recordData.issueDescription}`
        );
        return {
          ...serial,
          status: 'SERVICE',
          serviceRecords: [newRecord, ...serial.serviceRecords],
          movements: [movement, ...serial.movements]
        };
      }
      return serial;
    }));
  };

  const updateServiceRecord = (serialId: string, recordId: string, updates: Partial<ServiceRecord>) => {
    setProductSerials(prev => prev.map(serial => {
      if (serial.id === serialId) {
        const updatedRecords = serial.serviceRecords.map(r => {
          if (r.id === recordId) {
            return { ...r, ...updates };
          }
          return r;
        });

        // If service was resolved, move back to ACTIVE
        let newStatus = serial.status;
        if (updates.status === 'RESOLVED') {
          newStatus = 'ACTIVE';
        }

        return {
          ...serial,
          status: newStatus,
          serviceRecords: updatedRecords
        };
      }
      return serial;
    }));
  };

  // Payment Recording
  const recordPayment = (paymentData: Omit<Payment, 'id' | 'paymentNumber'>) => {
    const nextNum = payments.length + 103;
    const paymentNumber = `OD-${companySettings.sequences.year}-${String(nextNum).padStart(6, '0')}`;
    const newPayment: Payment = {
      ...paymentData,
      id: 'pay-' + Date.now(),
      paymentNumber
    };

    setPayments(prev => [newPayment, ...prev]);

    // If proforma payment, update remaining
    if (paymentData.proformaId) {
      setProformas(prev => prev.map(p => {
        if (p.id === paymentData.proformaId) {
          const paid = p.paidAmount + paymentData.amount;
          const rem = Math.max(0, p.grandTotal - paid);
          const paymentStatus = rem === 0 ? 'PAID' : (paid > 0 ? 'PARTIAL' : 'UNPAID');
          return { ...p, paidAmount: paid, remainingAmount: rem, paymentStatus };
        }
        return p;
      }));
    }

    logAudit(
      'SETTINGS',
      newPayment.id,
      newPayment.paymentNumber,
      'Tahsilat Kaydedildi',
      `${paymentData.customerName} firmasından ${paymentData.amount.toLocaleString('tr-TR')} ₺ tahsil edildi.`
    );
  };

  const updateCompanySettings = (settings: CompanySettings) => {
    setCompanySettings(settings);
    logAudit('SETTINGS', 'company', 'Firma Bilgileri', 'Firma Ayarları Güncellendi', 'Şirket unvanı, iletişim veya numara sayaçları güncellendi.');
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const resetToDefaults = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setCompanySettings(INITIAL_COMPANY_SETTINGS);
    setCustomers(INITIAL_CUSTOMERS);
    setProducts(INITIAL_PRODUCTS);
    setQuotes(INITIAL_QUOTES);
    setProformas(INITIAL_PROFORMAS);
    setContracts(INITIAL_CONTRACTS);
    setSales(INITIAL_SALES);
    setProductSerials(INITIAL_PRODUCT_SERIALS);
    setPayments(INITIAL_PAYMENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setActiveView('dashboard');
  };

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        documentViewer,
        openDocumentViewer,
        closeDocumentViewer,
        globalSearchOpen,
        setGlobalSearchOpen,
        users,
        currentUser,
        isAuthenticated,
        login,
        logout,
        switchUser,
        canPerformAction,
        customers,
        products,
        quotes,
        proformas,
        contracts,
        sales,
        productSerials,
        payments,
        auditLogs,
        companySettings,
        notifications,
        addCustomer,
        updateCustomer,
        addProduct,
        updateProduct,
        createQuote,
        updateQuoteStatus,
        convertQuoteToProforma,
        convertQuoteToContract,
        convertProformaToContract,
        createSaleFromWorkflow,
        updateSerialStatus,
        addServiceRecord,
        updateServiceRecord,
        recordPayment,
        updateCompanySettings,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        resetToDefaults,
        toasts,
        addToast,
        removeToast,
        onboardingDismissed,
        setOnboardingDismissed: handleSetOnboardingDismissed,
        isDemoMode,
        loadDemoData,
        loadCleanData,
        keyboardShortcutsOpen,
        setKeyboardShortcutsOpen
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
