import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileCheck2,
  Search,
  Printer,
  ChevronRight,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { ProformaPaymentStatus } from '../../types';

interface ProformaListViewProps {
  onOpenDetailModal: (id: string) => void;
}

export const ProformaListView: React.FC<ProformaListViewProps> = ({ onOpenDetailModal }) => {
  const { proformas, openDocumentViewer } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filtered = proformas.filter(p => {
    const matchesSearch =
      p.proformaNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (p.quoteNumber && p.quoteNumber.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || p.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-indigo-600" />
            <span>Proforma Faturalar ({proformas.length})</span>
          </h2>
          <p className="text-xs text-slate-500">
            Tekliften otomatik türetilen resmi proforma faturalar, banka ödeme hesapları ve tahsilat takibi
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Proforma No (PRO-), Teklif No veya Müşteri Ara..."
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {['ALL', 'UNPAID', 'PARTIAL', 'PAID'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {s === 'ALL' ? 'Tümü' : s === 'UNPAID' ? 'Ödeme Bekliyor' : s === 'PARTIAL' ? 'Kısmi Ödeme' : 'Ödendi'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="p-3.5">Proforma No</th>
                <th className="p-3.5">Bağlı Teklif</th>
                <th className="p-3.5">Müşteri</th>
                <th className="p-3.5">Vade Tarihi</th>
                <th className="p-3.5 text-right">Toplam Tutar</th>
                <th className="p-3.5 text-right">Tahsil Edilen</th>
                <th className="p-3.5">Durum</th>
                <th className="p-3.5 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Kayıtlı proforma bulunamadı.
                  </td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-blue-700">
                      {p.proformaNumber}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-500">
                      {p.quoteNumber || '-'}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900">{p.customerName}</div>
                      <div className="text-[10px] text-slate-400">{p.items.length} Kalem Ürün</div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600">{p.dueDate}</td>
                    <td className="p-3.5 text-right font-bold tabular-nums font-mono text-slate-900">
                      {p.grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </td>
                    <td className="p-3.5 text-right font-semibold tabular-nums font-mono text-emerald-700">
                      {p.paidAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                        p.paymentStatus === 'PARTIAL' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {p.paymentStatus === 'PAID' ? 'ÖDENDİ' : p.paymentStatus === 'PARTIAL' ? 'KISMİ ÖDEME' : 'ÖDEME BEKLİYOR'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      <button
                        onClick={() => openDocumentViewer('proforma', p)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                        title="Resmi PDF Yazdır"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onOpenDetailModal(p.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                      >
                        Detay / Tahsilat
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
