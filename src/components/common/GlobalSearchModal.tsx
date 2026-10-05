import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  X,
  FileSpreadsheet,
  FileCheck2,
  FileText,
  ShoppingBag,
  Cpu,
  Users,
  Package,
  ArrowRight
} from 'lucide-react';

interface GlobalSearchModalProps {
  onSelectEntity: (type: string, id: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ onSelectEntity }) => {
  const {
    globalSearchOpen,
    setGlobalSearchOpen,
    customers,
    quotes,
    proformas,
    contracts,
    sales,
    productSerials,
    products,
    setActiveView
  } = useApp();

  const [query, setQuery] = useState('');

  // Handle ESC or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setGlobalSearchOpen(!globalSearchOpen);
      }
      if (e.key === 'Escape') {
        setGlobalSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [globalSearchOpen, setGlobalSearchOpen]);

  if (!globalSearchOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedCustomers = q ? customers.filter(c => 
    c.name.toLowerCase().includes(q) || 
    c.code.toLowerCase().includes(q) ||
    c.taxNumber.includes(q)
  ) : [];

  const matchedQuotes = q ? quotes.filter(quote =>
    quote.quoteNumber.toLowerCase().includes(q) ||
    quote.customerName.toLowerCase().includes(q)
  ) : [];

  const matchedProformas = q ? proformas.filter(p =>
    p.proformaNumber.toLowerCase().includes(q) ||
    p.customerName.toLowerCase().includes(q)
  ) : [];

  const matchedContracts = q ? contracts.filter(c =>
    c.contractNumber.toLowerCase().includes(q) ||
    c.customerName.toLowerCase().includes(q)
  ) : [];

  const matchedSales = q ? sales.filter(s =>
    s.saleNumber.toLowerCase().includes(q) ||
    s.invoiceNumber.toLowerCase().includes(q) ||
    s.customerName.toLowerCase().includes(q)
  ) : [];

  const matchedSerials = q ? productSerials.filter(s =>
    s.internalId.toLowerCase().includes(q) ||
    s.serialNumber.toLowerCase().includes(q) ||
    s.productName.toLowerCase().includes(q) ||
    (s.customerName && s.customerName.toLowerCase().includes(q))
  ) : [];

  const matchedProducts = q ? products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.sku.toLowerCase().includes(q)
  ) : [];

  const totalResults = 
    matchedCustomers.length +
    matchedQuotes.length +
    matchedProformas.length +
    matchedContracts.length +
    matchedSales.length +
    matchedSerials.length +
    matchedProducts.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 sm:pt-20">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Teklif No (TKL-), Seri No (PRD- / SN-), Firma veya Ürün Adı..."
            className="flex-1 text-sm bg-transparent outline-hidden text-slate-900 placeholder:text-slate-400"
            autoFocus
          />
          <button
            onClick={() => setGlobalSearchOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {!q ? (
            <div className="py-10 text-center space-y-2">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hızlı Arama İpuçları</div>
              <div className="text-xs text-slate-400 max-w-sm mx-auto">
                <span className="font-mono text-slate-600">TKL-2026</span> yazarak teklifleri,{' '}
                <span className="font-mono text-slate-600">PRD-2026</span> yazarak ürün seri takip kartlarını, veya firma adını arayabilirsiniz.
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              "{query}" ile eşleşen hiçbir kayıt bulunamadı.
            </div>
          ) : (
            <>
              {/* Product Serials */}
              {matchedSerials.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                    <Cpu className="w-3 h-3 text-indigo-500" />
                    <span>Ürün Seri & Yaşam Döngüsü Kartları ({matchedSerials.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchedSerials.slice(0, 4).map(s => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setGlobalSearchOpen(false);
                          setActiveView('inventory');
                          onSelectEntity('serial', s.id);
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-50 flex items-center justify-between border border-transparent hover:border-slate-200 transition-colors group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-indigo-700">{s.internalId}</span>
                            <span className="text-xs text-slate-700">{s.productName}</span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Seri No: <span className="font-mono font-medium text-slate-600">{s.serialNumber}</span> · Müşteri: {s.customerName || 'Stokta'}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quotes */}
              {matchedQuotes.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3 h-3 text-amber-500" />
                    <span>Teklifler ({matchedQuotes.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchedQuotes.slice(0, 4).map(quote => (
                      <button
                        key={quote.id}
                        onClick={() => {
                          setGlobalSearchOpen(false);
                          setActiveView('quotes');
                          onSelectEntity('quote', quote.id);
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-50 flex items-center justify-between border border-transparent hover:border-slate-200 transition-colors group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900">{quote.quoteNumber}</span>
                            <span className="text-xs text-slate-600">{quote.customerName}</span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Tutar: <span className="font-semibold text-slate-700">{quote.grandTotal.toLocaleString('tr-TR')} ₺</span> · Durum: {quote.status}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Customers */}
              {matchedCustomers.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-emerald-500" />
                    <span>Müşteriler ({matchedCustomers.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchedCustomers.slice(0, 3).map(c => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setGlobalSearchOpen(false);
                          setActiveView('customers');
                          onSelectEntity('customer', c.id);
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-50 flex items-center justify-between border border-transparent hover:border-slate-200 transition-colors group"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900">{c.name}</div>
                          <div className="text-[11px] text-slate-400">
                            Kod: {c.code} · V.D: {c.taxOffice} - {c.taxNumber}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Proformas & Contracts */}
              {(matchedProformas.length > 0 || matchedContracts.length > 0) && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                    <FileCheck2 className="w-3 h-3 text-blue-500" />
                    <span>Proformalar & Sözleşmeler</span>
                  </div>
                  <div className="space-y-1">
                    {matchedProformas.slice(0, 2).map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setGlobalSearchOpen(false);
                          setActiveView('proformas');
                          onSelectEntity('proforma', p.id);
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-50 flex items-center justify-between border border-transparent hover:border-slate-200 transition-colors group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-blue-700">{p.proformaNumber}</span>
                            <span className="text-xs text-slate-600">{p.customerName}</span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Tutar: {p.grandTotal.toLocaleString('tr-TR')} ₺ · Ödeme: {p.paymentStatus}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}

                    {matchedContracts.slice(0, 2).map(c => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setGlobalSearchOpen(false);
                          setActiveView('contracts');
                          onSelectEntity('contract', c.id);
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-50 flex items-center justify-between border border-transparent hover:border-slate-200 transition-colors group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-purple-700">{c.contractNumber}</span>
                            <span className="text-xs text-slate-600">{c.customerName}</span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Durum: {c.status} · Tutar: {c.grandTotal.toLocaleString('tr-TR')} ₺
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
          <span>Seçmek için tıklayın</span>
          <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-500 font-mono text-[10px]">ESC</kbd>
        </div>
      </div>
    </div>
  );
};
