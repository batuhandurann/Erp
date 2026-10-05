import {
  Customer,
  Product,
  Quote,
  Proforma,
  Contract,
  Sale,
  ProductSerial,
  Payment,
  CompanySettings,
  AuditLog,
  QuoteStatus,
  ProductLifecycleStatus,
  User
} from '../types';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

class HttpClient {
  private baseUrl = '/api/v1';
  private token: string | null = null;
  private tenantId = 'org-apex-01';

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = sessionStorage.getItem('bf_auth_token') || localStorage.getItem('bf_auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        sessionStorage.setItem('bf_auth_token', token);
      } else {
        sessionStorage.removeItem('bf_auth_token');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  setTenant(tenantId: string) {
    this.tenantId = tenantId;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-tenant-id': this.tenantId,
      ...(options.headers as Record<string, string> || {})
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    } else {
      // Dev fallback header
      headers['x-user-role'] = 'SUPER_ADMIN';
      headers['x-user-id'] = 'usr-1';
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers
      });

      const json = await response.json();

      if (!response.ok) {
        return {
          success: false,
          data: null as any,
          error: json.error || { code: 'HTTP_ERROR', message: `İstek başarısız oldu (${response.status})` }
        };
      }

      return json;
    } catch (err: any) {
      console.error(`API request error on ${endpoint}:`, err);
      return {
        success: false,
        data: null as any,
        error: { code: 'NETWORK_ERROR', message: 'Sunucuya bağlanılamadı. Lütfen ağ bağlantınızı kontrol ediniz.' }
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const http = new HttpClient();

// Typed Production API Client
export const api = {
  // Authentication
  auth: {
    login: async (identifier: string, password?: string, tenantId?: string) => {
      const res = await http.post<{ token: string; accessToken: string; user: User }>('/auth/login', {
        identifier,
        password,
        tenantId
      });
      const token = res.data?.token || (res as any).token || (res as any).accessToken;
      if (token) {
        http.setToken(token);
      }
      return res;
    },
    logout: async () => {
      http.setToken(null);
      return http.post('/auth/logout');
    },
    me: async () => {
      return http.get<User>('/auth/me');
    }
  },

  // Customers
  customers: {
    list: async () => http.get<Customer[]>('/customers'),
    getById: async (id: string) => http.get<Customer>(`/customers/${id}`),
    get360: async (id: string) => http.get<any>(`/customers/${id}/360`),
    create: async (payload: Omit<Customer, 'id' | 'code' | 'createdAt'>) => http.post<Customer>('/customers', payload),
    update: async (id: string, payload: Partial<Customer>) => http.patch<Customer>(`/customers/${id}`, payload),
    delete: async (id: string) => http.delete<{ message: string }>(`/customers/${id}`)
  },

  // Quotes
  quotes: {
    list: async () => http.get<Quote[]>('/quotes'),
    getById: async (id: string) => http.get<Quote>(`/quotes/${id}`),
    create: async (payload: any) => http.post<Quote>('/quotes', payload),
    updateStatus: async (id: string, status: QuoteStatus, note?: string) =>
      http.patch<Quote>(`/quotes/${id}/status`, { status, note }),
    convertToProforma: async (id: string) => http.post<Proforma>(`/quotes/${id}/convert-proforma`)
  },

  // Proformas & Contracts
  proformas: {
    list: async () => http.get<Proforma[]>('/proformas')
  },
  contracts: {
    list: async () => http.get<Contract[]>('/contracts')
  },

  // Sales
  sales: {
    list: async () => http.get<Sale[]>('/sales'),
    convert: async (sourceType: 'contract' | 'proforma' | 'quote', sourceId: string) =>
      http.post<Sale>('/sales/convert', { sourceType, sourceId })
  },

  // Products & Serials
  products: {
    list: async () => http.get<Product[]>('/products')
  },
  serials: {
    list: async () => http.get<ProductSerial[]>('/serials')
  },

  // Payments
  payments: {
    list: async () => http.get<Payment[]>('/payments'),
    create: async (payload: any) => http.post<Payment>('/payments', payload)
  },

  // Settings & Audit
  settings: {
    get: async () => http.get<CompanySettings>('/settings')
  },
  audit: {
    list: async () => http.get<AuditLog[]>('/audit-logs')
  },
  dashboard: {
    metrics: async () => http.get<any>('/dashboard/metrics')
  }
};
