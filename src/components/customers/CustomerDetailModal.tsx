import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Phone,
  Mail,
  FileSpreadsheet,
  FileCheck2,
  FileText,
  ShoppingBag,
  Cpu,
  Wallet,
  History,
  X,
  Plus,
  ShieldCheck,
  MapPin,
  ExternalLink,
  Download,
  Printer
} from 'lucide-react';
import { customerRepo } from '../../db/repository';
import { exportToCSV } from '../../utils/exportUtils';

interface CustomerDetailModalProps {
  customerId: string | null;
  onClose: () => void;
  onOpenQuote: (id: string) => void;
  onOpenProforma: (id: string) => void;
  onOpenContract: (id: string) => void;
  onOpenSerial: (id: string) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customerId,
  onClose,
  onOpenQuote,
  onOpenProforma,
  onOpenContract,
  onOpenSerial
}) => {
  const {
    customers,
    quotes: allQuotes,
    proformas: allProformas,
    contracts: allContracts,
    sales: allSales,
    productSerials: allSerials,
    payments: allPayments,
    auditLogs,
    openDocumentViewer
  } = useApp();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'quotes' | 'proformas' | 'contracts' | 'sales' | 'products' | 'payments' | 'activity'
  >('overview');

  if (!customerId) return null;

  const customer = customers.find(c => c.id === customerId) || customerRepo.findById(customerId);
  if (!customer) return null;

  const quotes = allQuotes.filter(q => q.customerId === customerId);
  const proformas = allProformas.filter(p => p.customerId === customerId);
  const contracts = allContracts.filter(c => c.customerId === customerId);
  const sales = allSales.filter(s => s.customerId === customerId);
  const serials = allSerials.filter(s => s.customerId === customerId);
  const payments = allPayments.filter(p => p.customerId === customerId);

  const totalSales = sales.reduce((acc, s) => acc + s.grandTotal, 0);
  const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
  const outstandingBalance = Math.max(0, totalSales - totalPaid);

  const activeWarrantiesCount = serials.filter(s => s.warrantyEndDate && new Date(s.warrantyEndDate) > new Date()).length;
  const openServiceCount = serials.reduce((acc, s) => acc + (s.serviceRecords || []).filter(r => r.status === 'OPEN').length, 0);

  const kpis = {
    totalSales,
    outstandingBalance,
    totalQuotes: quotes.length,
    totalContracts: contracts.length,
    totalProducts: serials.length,
    activeWarranties: activeWarrantiesCount,
    openServices: openServiceCount
  };

  const customerLogs = auditLogs.filter(
    l => l.entityId === customer.id || l.details.includes(customer.name) || l.details.includes(customer.code)
  );

  const tabs = [
    { id: 'overview', label: 'Genel Bakış', count: undefined },
    { id: 'quotes', label: 'Teklifler', count: quotes.length },
    { id: 'proformas', label: 'Proformalar', count: proformas.length },
    { id: 'contracts', label: 'Sözleşmeler', count: contracts.length },
    { id: 'sales', label: 'Satışlar', count: sales.length },
    { id: 'products', label: 'Cihaz & Seri No', count: serials.length },
    { id: 'payments', label: 'Tahsilatlar', count: payments.length },
    { id: 'activity', label: 'Hareket Geçmişi', count: customerLogs.length }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-900 text-white flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded">
                {customer.code}
              </span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                Aktif Kurumsal Müşteri
              </span>
            </div>
            <h2 className="text-lg font-bold tracking-tight text-white">{customer.name}</h2>
            <div className="text-xs text-slate-400 flex items-center gap-4">
              <span>{customer.industry || 'Bilişim & Altyapı'}</span>
              <span>·</span>
              <span>V.D.: {customer.taxOffice} - {customer.taxNumber}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const headers = ['İşlem Tipi', 'Belge No', 'Tarih', 'Tutar', 'Para Birimi', 'Durum'];
                const rows = [
                  ...sales.map(s => ['Satış Faturası', s.invoiceNumber, new Date(s.date).toLocaleDateString('tr-TR'), s.grandTotal, s.currency, s.paymentStatus]),
                  ...payments.map(p => ['Tahsilat / Ödeme', p.paymentNumber, new Date(p.paymentDate).toLocaleDateString('tr-TR'), p.amount, p.currency, 'Tamamlandı'])
                ];
                exportToCSV(`${customer.name}_Cari_Hesap_Ekstresi`, headers, rows);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors"
              title="Müşteri cari hesap ekstresini Excel/CSV olarak indir"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Cari Ekstre İndir</span>
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 360 KPIs Strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Toplam Satış Cirosu</div>
            <div className="text-sm font-bold text-slate-900 tabular-nums font-mono mt-0.5">
              {kpis.totalSales.toLocaleString('tr-TR')} ₺
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Kalan Tahsilat Bakiyesi</div>
            <div className="text-sm font-bold text-rose-600 tabular-nums font-mono mt-0.5">
              {kpis.outstandingBalance.toLocaleString('tr-TR')} ₺
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Açık Teklifler</div>
            <div className="text-sm font-bold text-slate-900 tabular-nums font-mono mt-0.5">
              {kpis.totalQuotes} Teklif
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Aktif Sözleşmeler</div>
            <div className="text-sm font-bold text-indigo-900 tabular-nums font-mono mt-0.5">
              {kpis.totalContracts} Sözleşme
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Teslim Edilen Cihaz</div>
            <div className="text-sm font-bold text-indigo-700 tabular-nums font-mono mt-0.5">
              {kpis.totalProducts} Adet
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Garanti & Servis</div>
            <div className="text-sm font-bold text-emerald-700 tabular-nums font-mono mt-0.5">
              {kpis.activeWarranties} Garanti · {kpis.openServices} Servis
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 flex items-center gap-1 overflow-x-auto bg-white shrink-0 scrollbar-none">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === t.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold tabular-nums ${
                  activeTab === t.id ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {/* 1. Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span>Kurumsal Kimlik ve Vergi Bilgileri</span>
                </h3>
                <div className="space-y-2 text-xs divide-y divide-slate-100">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Firma Resmi Adı:</span>
                    <span className="font-semibold text-slate-800 text-right">{customer.name}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Müşteri Kodu:</span>
                    <span className="font-mono font-bold text-slate-900">{customer.code}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Vergi Dairesi:</span>
                    <span className="font-semibold text-slate-800">{customer.taxOffice}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Vergi Numarası:</span>
                    <span className="font-mono font-semibold text-slate-800">{customer.taxNumber}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Sektör:</span>
                    <span className="text-slate-800">{customer.industry || 'Teknoloji'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Kredi / Risk Limiti:</span>
                    <span className="font-bold text-emerald-700 tabular-nums">
                      {(customer.creditLimit || 5000000).toLocaleString('tr-TR')} ₺
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  <span>İletişim & Lokasyon</span>
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="text-slate-500 text-[11px]">Fatura & Merkez Adresi:</div>
                    <div className="font-medium text-slate-800 mt-0.5 leading-relaxed">{customer.address}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <div>
                      <div className="text-slate-500 text-[11px]">Telefon:</div>
                      <div className="font-semibold text-slate-800">{customer.phone}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[11px]">E-Posta:</div>
                      <div className="font-semibold text-slate-800 truncate">{customer.email}</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-slate-500 text-[11px] mb-1">Kayıtlı İrtibat Kişileri:</div>
                    {customer.contacts.map((contact, idx) => (
                      <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 mb-1.5 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{contact.name}</div>
                          <div className="text-[11px] text-slate-500">{contact.title}</div>
                        </div>
                        <div className="text-right text-[11px] text-slate-600">
                          <div>{contact.phone}</div>
                          <div className="text-slate-400">{contact.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Quotes Tab */}
          {activeTab === 'quotes' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="p-3">Teklif No</th>
                    <th className="p-3">Tarih</th>
                    <th className="p-3">Kalem Sayısı</th>
                    <th className="p-3 text-right">Tutar</th>
                    <th className="p-3">Durum</th>
                    <th className="p-3 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quotes.length === 0 ? (
                    <tr><td colSpan={6} className="p-6 text-center text-slate-400">Bu müşteriye ait teklif yok.</td></tr>
                  ) : (
                    quotes.map(q => (
                      <tr key={q.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-slate-900">{q.quoteNumber}</td>
                        <td className="p-3 text-slate-500">{q.date}</td>
                        <td className="p-3">{q.items.length} Kalem</td>
                        <td className="p-3 text-right font-bold tabular-nums">{q.grandTotal.toLocaleString('tr-TR')} ₺</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100">{q.status}</span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => { onClose(); onOpenQuote(q.id); }}
                            className="text-indigo-600 hover:text-indigo-800 font-bold"
                          >
                            İncele
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 3. Proformas Tab */}
          {activeTab === 'proformas' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="p-3">Proforma No</th>
                    <th className="p-3">Bağlı Teklif</th>
                    <th className="p-3">Vade</th>
                    <th className="p-3 text-right">Tutar</th>
                    <th className="p-3">Tahsilat Durumu</th>
                    <th className="p-3 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {proformas.length === 0 ? (
                    <tr><td colSpan={6} className="p-6 text-center text-slate-400">Bu müşteriye ait proforma yok.</td></tr>
                  ) : (
                    proformas.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-blue-700">{p.proformaNumber}</td>
                        <td className="p-3 font-mono text-slate-500">{p.quoteNumber || '-'}</td>
                        <td className="p-3 text-slate-500">{p.dueDate}</td>
                        <td className="p-3 text-right font-bold tabular-nums">{p.grandTotal.toLocaleString('tr-TR')} ₺</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {p.paymentStatus}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => { onClose(); onOpenProforma(p.id); }}
                            className="text-indigo-600 hover:text-indigo-800 font-bold"
                          >
                            İncele
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. Contracts Tab */}
          {activeTab === 'contracts' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="p-3">Sözleşme No</th>
                    <th className="p-3">Tarih</th>
                    <th className="p-3">İmzalayan Yetkili</th>
                    <th className="p-3 text-right">Tutar</th>
                    <th className="p-3">Durum</th>
                    <th className="p-3 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contracts.length === 0 ? (
                    <tr><td colSpan={6} className="p-6 text-center text-slate-400">Bu müşteriye ait sözleşme yok.</td></tr>
                  ) : (
                    contracts.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-purple-700">{c.contractNumber}</td>
                        <td className="p-3 text-slate-500">{c.contractDate}</td>
                        <td className="p-3 font-medium">{c.customerRepresentative}</td>
                        <td className="p-3 text-right font-bold tabular-nums">{c.grandTotal.toLocaleString('tr-TR')} ₺</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700">
                            {c.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => { onClose(); onOpenContract(c.id); }}
                            className="text-indigo-600 hover:text-indigo-800 font-bold"
                          >
                            İncele
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 5. Products & Serial Numbers Tab */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="p-3">İç Ürün ID</th>
                    <th className="p-3">Üretici Seri No</th>
                    <th className="p-3">Donanım Adı</th>
                    <th className="p-3">Garanti Bitiş</th>
                    <th className="p-3">Durum</th>
                    <th className="p-3 text-right">Cihaz Geçmişi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {serials.length === 0 ? (
                    <tr><td colSpan={6} className="p-6 text-center text-slate-400">Bu müşteriye tahsis edilmiş cihaz yok.</td></tr>
                  ) : (
                    serials.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-extrabold text-indigo-700">{s.internalId}</td>
                        <td className="p-3 font-mono font-semibold text-slate-800">{s.serialNumber}</td>
                        <td className="p-3 font-medium text-slate-900">{s.productName}</td>
                        <td className="p-3 font-mono text-slate-500">{s.warrantyEndDate || '-'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                            s.status === 'SERVICE' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => { onClose(); onOpenSerial(s.id); }}
                            className="text-indigo-600 hover:text-indigo-800 font-bold"
                          >
                            Yaşam Döngüsü →
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 6. Payments Tab */}
          {activeTab === 'payments' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="p-3">Makbuz / Dekont No</th>
                    <th className="p-3">Tarih</th>
                    <th className="p-3">Yöntem</th>
                    <th className="p-3">Referans No</th>
                    <th className="p-3 text-right">Tutar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.length === 0 ? (
                    <tr><td colSpan={5} className="p-6 text-center text-slate-400">Bu müşteriye ait tahsilat bulunmuyor.</td></tr>
                  ) : (
                    payments.map(pay => (
                      <tr key={pay.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-slate-900">{pay.paymentNumber}</td>
                        <td className="p-3 text-slate-500">{pay.paymentDate}</td>
                        <td className="p-3 font-medium">{pay.paymentMethod}</td>
                        <td className="p-3 font-mono text-slate-500">{pay.referenceNo}</td>
                        <td className="p-3 text-right font-black tabular-nums text-emerald-700 font-mono">
                          +{pay.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 7. Activity History */}
          {activeTab === 'activity' && (
            <div className="space-y-2">
              {customerLogs.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
                  Henüz hareket kaydı bulunmuyor.
                </div>
              ) : (
                customerLogs.map(log => (
                  <div key={log.id} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{log.action}</div>
                      <div className="text-slate-600 mt-0.5">{log.details}</div>
                    </div>
                    <div className="text-right text-[10px] text-slate-400 font-mono">
                      <div>{log.userName}</div>
                      <div>{log.timestamp}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
