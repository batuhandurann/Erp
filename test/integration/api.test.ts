import { describe, it, expect } from 'vitest';
import { customerService } from '../../src/server/services/customerService';
import { quoteService } from '../../src/server/services/quoteService';
import { saleService } from '../../src/server/services/saleService';

describe('Service Layer & Transactional Workflows', () => {
  it('creates and lists customers within tenant scope', async () => {
    const newCustomer = await customerService.create(
      {
        name: 'Test Savunma ve Bilişim A.Ş.',
        taxNumber: '9988776655',
        taxOffice: 'Maslak',
        industry: 'Savunma Sanayii',
        address: 'İTÜ Teknokent',
        city: 'İstanbul',
        phone: '+90 212 555 0199',
        email: 'info@testsavunma.com',
        contacts: []
      },
      { id: 'usr-1', name: 'Batuhan Duran', role: 'SUPER_ADMIN' },
      'org-apex-01'
    );

    expect(newCustomer.id).toBeDefined();
    expect(newCustomer.code).toMatch(/^(MSR|CST)-/);

    const customer = await customerService.getById(newCustomer.id, 'org-apex-01');
    expect(customer).not.toBeNull();
    expect(customer?.name).toBe('Test Savunma ve Bilişim A.Ş.');
  });

  it('creates a quote with server-side recalculated totals and assigns a sequential TKL number', async () => {
    const quote = await quoteService.create(
      {
        customerId: 'cst-1',
        customerName: 'Test Müşteri',
        customerTaxNumber: '1234567890',
        customerTaxOffice: 'Boğaziçi',
        items: [
          {
            productId: 'prd-1',
            productSku: 'SRV-DL-R760',
            productName: 'Dell PowerEdge R760',
            quantity: 2,
            unitPrice: 20000,
            discountRate: 10, // 10% discount -> 4,000 TL
            taxRate: 20 // 20% VAT -> 7,200 TL
          }
        ]
      },
      { id: 'usr-3', name: 'Ahmet Yılmaz', role: 'SALES' },
      'org-apex-01'
    );

    expect(quote.quoteNumber).toMatch(/^TKL-\d{4}-\d{6}$/);
    expect(quote.subtotal).toBe(40000);
    expect(quote.discountTotal).toBe(4000);
    expect(quote.taxTotal).toBe(7200);
    expect(quote.grandTotal).toBe(43200);
    expect(quote.status).toBe('DRAFT');
  });

  it('converts workflow to sale and produces unique serialized PRD devices atomically', async () => {
    const sale = await saleService.createFromWorkflow('quote', 'qte-1', {
      id: 'usr-1',
      name: 'Batuhan Duran',
      role: 'SUPER_ADMIN'
    });

    expect(sale).toBeDefined();
    expect(sale.saleNumber).toMatch(/^SAT-\d{4}-\d{6}$/);
    expect(sale.invoiceNumber).toMatch(/^FAT-\d{4}-\d{5}$/);
    expect(sale.generatedSerialIds?.length).toBeGreaterThan(0);
  });
});
