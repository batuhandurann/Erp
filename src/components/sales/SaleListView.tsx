import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShoppingBag,
  Search,
  Printer,
  ChevronRight,
  Cpu,
  PackageCheck,
  Download
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

interface SaleListViewProps {
  onOpenDetailModal: (id: string) => void;
}

export const SaleListView: React.FC<SaleListViewProps> = ({ onOpenDetailModal }) => {
  const { sales, openDocumentViewer } = useApp();
  const [search, setSearch] = useState('');

  const filtered = sales.filter(s =>
    s.saleNumber.toLowerCase().includes(search.toLowerCase()) ||
    s.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    s.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-600" />
            <span>Satışlar & Faturalar ({sales.length})</span>
          </h2>
          <p className="text-xs text-slate-500">
            Onaylanan satışlar, resmi faturalar ve otomatik bağlanan seri numaralı ürünler
          </p>
        </div>

        <button
          onClick={() => {
            const headers = ['Satış No', 'Fatura No', 'Müşteri Adı', 'Tarih', 'Tutar', 'Para Birimi', 'Ödeme Durumu', 'Teslimat Durumu'];
            const rows = filtered.map(s => [
              s.saleNumber,
              s.invoiceNumber,
              s.customerName,
              new Date(s.date).toLocaleDateString('tr-TR'),
              s.grandTotal,
              s.currency,
              s.paymentStatus,
              s.deliveryStatus
            ]);
            exportToCSV('Satislar_Listesi', headers, rows);
          }}
          className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          title="Excel uyumlu CSV formatında indir"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Excel / CSV</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Satış No (SAT-), Fatura No (FAT-) veya Müşteri Ara..."
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="p-3.5">Satış No</th>
                <th className="p-3.5">Resmi Fatura No</th>
                <th className="p-3.5">Müşteri</th>
                <th className="p-3.5">Tarih</th>
                <th className="p-3.5 text-right">Tutar</th>
                <th className="p-3.5">Ödeme</th>
                <th className="p-3.5">Sevkiyat</th>
                <th className="p-3.5 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Kayıtlı satış faturası bulunamadı.
                  </td>
                </tr>
              ) : (
                filtered.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900">
                      {s.saleNumber}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-700">
                      {s.invoiceNumber}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900">{s.customerName}</div>
                      <div className="text-[10px] text-slate-400">
                        {s.items.length} Kalem · {s.generatedSerialIds?.length || 0} Cihaz
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600">{s.date}</td>
                    <td className="p-3.5 text-right font-bold tabular-nums font-mono text-slate-900">
                      {s.grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {s.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {s.deliveryStatus}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      <button
                        onClick={() => openDocumentViewer('sale', s)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                        title="Fatura & İrsaliye Yazdır"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onOpenDetailModal(s.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                      >
                        Detay / Cihazlar
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
