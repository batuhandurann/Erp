import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Plus,
  Trash2,
  Calculator,
  Building2,
  Package,
  FileCheck2,
  Eye,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  DollarSign
} from 'lucide-react';
import { QuoteItem } from '../../types';
import { calculateQuoteFinancials } from '../../utils/financial';

interface QuoteCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (quoteId: string) => void;
}

export const QuoteCreateModal: React.FC<QuoteCreateModalProps> = ({
  isOpen,
  onClose,
  onCreated
}) => {
  const { customers, products, createQuote, companySettings } = useApp();

  const [activeStep, setActiveStep] = useState<'customer' | 'items' | 'terms' | 'preview'>('customer');

  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  );
  const [paymentTerms, setPaymentTerms] = useState(
    '%50 Sipariş Onayında Peşin, %50 Mal Teslimatında 30 Gün Vadeli'
  );
  const [deliveryTerms, setDeliveryTerms] = useState(
    'Müşteri Adresine Teslim, Kurulum ve Montaj Dahil (7 İş Günü)'
  );
  const [notes, setNotes] = useState(
    'Fiyatlarımıza KDV dahildir. Ürünler 36 ay yerinde üretici garantisine sahiptir.'
  );

  // Line items
  const [items, setItems] = useState<QuoteItem[]>([
    {
      id: 'qi-new-1',
      productId: products[0]?.id || '',
      productSku: products[0]?.sku || '',
      productName: products[0]?.name || '',
      quantity: 1,
      unitPrice: products[0]?.unitPrice || 0,
      currency: 'TRY',
      discountRate: 0,
      discountAmount: 0,
      taxRate: products[0]?.taxRate || 20,
      taxAmount: 0,
      netAmount: 0,
      total: 0
    }
  ]);

  if (!isOpen) return null;

  const currentCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  const handleProductChange = (index: number, productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    setItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        productId: prod.id,
        productSku: prod.sku,
        productName: prod.name,
        unitPrice: prod.unitPrice,
        taxRate: prod.taxRate
      };
      return updated;
    });
  };

  const handleItemFieldChange = (
    index: number,
    field: 'quantity' | 'unitPrice' | 'discountRate' | 'taxRate',
    val: number
  ) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: val
      };
      return updated;
    });
  };

  const handleAddItem = () => {
    const firstProd = products[0];
    if (!firstProd) return;
    setItems(prev => [
      ...prev,
      {
        id: 'qi-new-' + Date.now(),
        productId: firstProd.id,
        productSku: firstProd.sku,
        productName: firstProd.name,
        quantity: 1,
        unitPrice: firstProd.unitPrice,
        currency: 'TRY',
        discountRate: 0,
        discountAmount: 0,
        taxRate: firstProd.taxRate,
        taxAmount: 0,
        netAmount: 0,
        total: 0
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Canonical Financial Calculations Engine
  const {
    subtotal,
    discountTotal: totalDiscount,
    taxTotal: totalTax,
    grandTotal,
    items: calculatedItems,
    errors: calcErrors,
    valid: isCalcValid
  } = calculateQuoteFinancials(items as any, 'TRY');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer) return;
    if (!isCalcValid && calcErrors.length > 0) {
      alert(calcErrors.join('\n'));
      return;
    }

    const newQuote = createQuote({
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      customerTaxNumber: currentCustomer.taxNumber,
      customerTaxOffice: currentCustomer.taxOffice,
      customerAddress: currentCustomer.address,
      customerPhone: currentCustomer.phone,
      customerEmail: currentCustomer.email,
      contactPerson: currentCustomer.contacts[0]?.name || '',
      validUntil,
      paymentTerms,
      deliveryTerms,
      notes,
      items: calculatedItems as any,
      currency: 'TRY'
    });

    onCreated(newQuote.id);
    onClose();
  };

  const nextQuoteNumber = `TKL-${companySettings.sequences.year}-${String(companySettings.sequences.quoteCurrent + 1).padStart(6, '0')}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Kurumsal Teklif Oluşturma Sihirbazı</h2>
              <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                {nextQuoteNumber}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Fiyatlandırma, stok kontrolü ve canlı önizleme adımlarıyla teklif hazırlayın
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Tabs */}
        <div className="bg-white px-6 border-b border-slate-200 flex items-center gap-4 text-xs font-semibold">
          {[
            { id: 'customer', label: '1. Müşteri & Vade' },
            { id: 'items', label: `2. Donanım & İskonto (${items.length})` },
            { id: 'terms', label: '3. Ticari Şartlar' },
            { id: 'preview', label: '4. Canlı Belge Önizleme' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveStep(tab.id as any)}
              className={`py-3 border-b-2 transition-all ${
                activeStep === tab.id
                  ? 'border-indigo-600 text-indigo-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: Customer & Date Selection */}
          {activeStep === 'customer' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <span>Müşteri Portföyü Seçimi</span>
                  </label>
                  <span className="text-[11px] text-slate-500">{customers.length} kayıtlı kurumsal müşteri</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <select
                      value={selectedCustomerId}
                      onChange={e => setSelectedCustomerId(e.target.value)}
                      className="w-full text-xs font-bold bg-white border border-slate-300 rounded-lg p-2.5 outline-hidden focus:border-indigo-500"
                    >
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.code}) - {c.taxOffice}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Geçerlilik Tarihi</label>
                    <input
                      type="date"
                      value={validUntil}
                      onChange={e => setValidUntil(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>

                {currentCustomer && (
                  <div className="bg-white p-3 rounded-lg border border-slate-200/80 text-xs space-y-1">
                    <div className="font-bold text-slate-900">{currentCustomer.name}</div>
                    <div className="text-slate-600 text-[11px]">{currentCustomer.address}</div>
                    <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-4 pt-1 border-t border-slate-100">
                      <span><strong>V.D./No:</strong> {currentCustomer.taxOffice} - {currentCustomer.taxNumber}</span>
                      <span><strong>Yetkili:</strong> {currentCustomer.contacts[0]?.name || '-'}</span>
                      <span><strong>Tel:</strong> {currentCustomer.phone}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveStep('items')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Sonraki: Donanım & Kalemler →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Items & Pricing */}
          {activeStep === 'items' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Teklif Edilecek Donanım & Ürün Kalemleri ({items.length})
                </h3>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Kalem Ekle</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                      <th className="p-3 w-8">#</th>
                      <th className="p-3">Ürün / Donanım</th>
                      <th className="p-3 w-20 text-center">Stok</th>
                      <th className="p-3 w-20 text-center">Miktar</th>
                      <th className="p-3 w-32 text-right">Birim Fiyat (₺)</th>
                      <th className="p-3 w-20 text-center">İskonto %</th>
                      <th className="p-3 w-32 text-right">Toplam (KDV Dahil)</th>
                      <th className="p-3 w-10 text-center">Sil</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {calculatedItems.map((item, idx) => {
                      const matchedProd = products.find(p => p.id === item.productId || p.sku === item.productSku);
                      const stockAvailable = matchedProd?.stockQuantity || 0;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="p-3 text-slate-400 font-mono text-center">{idx + 1}</td>
                          <td className="p-3">
                            <select
                              value={item.productId}
                              onChange={e => handleProductChange(idx, e.target.value)}
                              className="w-full text-xs font-medium bg-white border border-slate-200 rounded p-1.5 outline-hidden"
                            >
                              {products.map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.sku})
                                </option>
                              ))}
                            </select>
                            {matchedProd && (
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {matchedProd.brand} · Garanti: {matchedProd.warrantyMonths} Ay
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              stockAvailable >= item.quantity ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {stockAvailable} Ad.
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={e => handleItemFieldChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                              className="w-16 text-center bg-white border border-slate-200 rounded p-1 outline-hidden font-bold"
                            />
                          </td>
                          <td className="p-3 text-right">
                            <input
                              type="number"
                              min="0"
                              value={item.unitPrice}
                              onChange={e => handleItemFieldChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="w-28 text-right bg-white border border-slate-200 rounded p-1 outline-hidden tabular-nums font-mono"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.discountRate}
                              onChange={e => handleItemFieldChange(idx, 'discountRate', parseFloat(e.target.value) || 0)}
                              className="w-14 text-center bg-white border border-slate-200 rounded p-1 outline-hidden tabular-nums font-bold"
                            />
                          </td>
                          <td className="p-3 text-right font-bold tabular-nums text-slate-900 font-mono">
                            {item.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              disabled={items.length <= 1}
                              className="text-slate-400 hover:text-rose-600 disabled:opacity-30"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Running Total Indicator */}
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500">Ara Toplam: <strong className="text-slate-800 font-mono">{subtotal.toLocaleString('tr-TR')} ₺</strong> · İskonto: <strong className="text-rose-600 font-mono">-{totalDiscount.toLocaleString('tr-TR')} ₺</strong> · KDV (%20): <strong className="text-slate-800 font-mono">{totalTax.toLocaleString('tr-TR')} ₺</strong></span>
                <span className="font-bold text-slate-900">Genel Toplam: <strong className="text-indigo-700 font-mono text-sm">{grandTotal.toLocaleString('tr-TR')} ₺</strong></span>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep('customer')}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                >
                  ← Önceki: Müşteri
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep('terms')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Sonraki: Ticari Şartlar →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Commercial Terms & Notes */}
          {activeStep === 'terms' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 uppercase">Ödeme Koşulları *</label>
                  <input
                    type="text"
                    required
                    value={paymentTerms}
                    onChange={e => setPaymentTerms(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 mt-1 outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase">Teslimat & Kurulum Şartı *</label>
                  <input
                    type="text"
                    required
                    value={deliveryTerms}
                    onChange={e => setDeliveryTerms(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 mt-1 outline-hidden"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="font-bold text-slate-700 uppercase">Teklif ve Garanti Notları</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 mt-1 outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep('items')}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                >
                  ← Önceki: Donanım & Fiyat
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep('preview')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Sonraki: Belge Önizlemesi →</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Live Document Preview */}
          {activeStep === 'preview' && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-xl p-6 bg-slate-50/50 space-y-4 text-xs">
                <div className="flex justify-between items-start border-b border-slate-300 pb-4">
                  <div>
                    <div className="font-extrabold text-sm text-indigo-700">{companySettings.companyName}</div>
                    <div className="text-[11px] text-slate-600">{companySettings.commercialTitle}</div>
                    <div className="text-[10px] text-slate-400">{companySettings.address}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm text-slate-900">FİYAT TEKLİFİ</div>
                    <div className="font-mono font-bold text-indigo-600">{nextQuoteNumber}</div>
                    <div className="text-[10px] text-slate-400">Son Geçerlilik: {validUntil}</div>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Müşteri</div>
                  <div className="font-bold text-slate-900">{currentCustomer.name}</div>
                  <div className="text-slate-600 text-[11px]">{currentCustomer.address}</div>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th className="p-2">#</th>
                        <th className="p-2">Ürün / Donanım</th>
                        <th className="p-2 text-center">Adet</th>
                        <th className="p-2 text-right">Birim Fiyat</th>
                        <th className="p-2 text-right">Toplam Tutar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {calculatedItems.map((it, idx) => (
                        <tr key={idx}>
                          <td className="p-2 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="p-2 font-medium">{it.productName}</td>
                          <td className="p-2 text-center font-bold">{it.quantity}</td>
                          <td className="p-2 text-right font-mono">{it.unitPrice.toLocaleString('tr-TR')} ₺</td>
                          <td className="p-2 text-right font-mono font-bold">{it.total.toLocaleString('tr-TR')} ₺</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center bg-slate-900 text-white p-3 rounded-xl">
                  <span className="font-bold uppercase text-xs">Genel Teklif Bedeli (KDV Dahil):</span>
                  <span className="text-base font-black tabular-nums font-mono">
                    {grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                  </span>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep('terms')}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                >
                  ← Önceki: Şartlar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                >
                  Teklifi Onayla & Kaydet ({nextQuoteNumber})
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
