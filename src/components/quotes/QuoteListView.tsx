import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Plus,
  Search,
  FileSpreadsheet,
  FileCheck2,
  Printer,
  ChevronRight,
  Filter,
  CheckCircle,
  Eye,
  Download,
  LayoutGrid,
  List,
  PenTool
} from 'lucide-react';
import { Quote, QuoteStatus } from '../../types';
import { exportToCSV } from '../../utils/exportUtils';
import { QuoteKanbanView } from './QuoteKanbanView';
import { QuotePublicPortalModal } from './QuotePublicPortalModal';

interface QuoteListViewProps {
  onOpenCreateModal: () => void;
  onOpenDetailModal: (id: string) => void;
  onOpenProformaDetail: (id: string) => void;
}

export const QuoteListView: React.FC<QuoteListViewProps> = ({
  onOpenCreateModal,
  onOpenDetailModal,
  onOpenProformaDetail
}) => {
  const { quotes, convertQuoteToProforma, openDocumentViewer, currentUser } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [portalModalQuote, setPortalModalQuote] = useState<Quote | null>(null);

  const filtered = quotes.filter(q => {
    const matchesSearch =
      q.quoteNumber.toLowerCase().includes(search.toLowerCase()) ||
      q.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: QuoteStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-slate-100 text-slate-700';
      case 'SENT':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'VIEWED':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      case 'ACCEPTED':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold';
      case 'CONVERTED':
        return 'bg-purple-50 text-purple-700 border border-purple-200 font-bold';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const statuses = [
    { id: 'ALL', label: 'Tümü' },
    { id: 'DRAFT', label: 'Taslak' },
    { id: 'SENT', label: 'Gönderildi' },
    { id: 'ACCEPTED', label: 'Onaylandı' },
    { id: 'CONVERTED', label: 'Dönüştürüldü' },
    { id: 'REJECTED', label: 'Reddedildi' }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            <span>Müşteri Teklifleri ({quotes.length})</span>
          </h2>
          <p className="text-xs text-slate-500">
            Otomatik teklif numaralandırma (TKL-2026-XXXX) ve proformaya tek tık aktarım
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Tablo</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Satış Hunisi (Kanban)</span>
            </button>
          </div>

          <button
            onClick={() => {
              const headers = ['Teklif No', 'Müşteri Adı', 'Tarih', 'Geçerlilik', 'Para Birimi', 'Ara Toplam', 'KDV Toplam', 'Genel Toplam', 'Durum'];
              const rows = filtered.map(q => [
                q.quoteNumber,
                q.customerName,
                new Date(q.date).toLocaleDateString('tr-TR'),
                new Date(q.validUntil).toLocaleDateString('tr-TR'),
                q.currency,
                q.subtotal,
                q.taxTotal,
                q.grandTotal,
                q.status
              ]);
              exportToCSV('Teklifler_Listesi', headers, rows);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-colors"
            title="Excel uyumlu CSV formatında indir"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Excel / CSV</span>
          </button>

          {currentUser.role !== 'Sadece Görüntüleme' && (
            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Teklif Oluştur</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Teklif No (TKL-) veya Firma Adı Ara..."
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {statuses.map(s => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === s.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content: Table or Kanban */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                <th className="p-3.5">Teklif No</th>
                <th className="p-3.5">Müşteri</th>
                <th className="p-3.5">Tarih</th>
                <th className="p-3.5">Geçerlilik</th>
                <th className="p-3.5 text-right">Tutar (KDV Dahil)</th>
                <th className="p-3.5">Durum</th>
                <th className="p-3.5 text-right">Hızlı Aksiyonlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400">
                    Arama kriterlerine uygun teklif bulunamadı.
                  </td>
                </tr>
              ) : (
                filtered.map(quote => (
                  <tr key={quote.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900">
                      {quote.quoteNumber}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900">{quote.customerName}</div>
                      <div className="text-[10px] text-slate-400">
                        {quote.contactPerson} · {quote.items.length} Kalem
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-500 font-mono text-[11px]">{quote.date}</td>
                    <td className="p-3.5 text-slate-500 font-mono text-[11px]">{quote.validUntil}</td>
                    <td className="p-3.5 text-right font-bold tabular-nums font-mono text-slate-900">
                      {quote.grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </td>
                    <td className="p-3.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getStatusStyle(quote.status)}`}>
                        {quote.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      {/* One-click conversion shortcut for ACCEPTED quotes */}
                      {quote.status === 'ACCEPTED' && currentUser.role !== 'Sadece Görüntüleme' && (
                        <button
                          onClick={() => {
                            const newProf = convertQuoteToProforma(quote.id);
                            if (newProf) onOpenProformaDetail(newProf.id);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-xs transition-colors"
                          title="Hemen Proforma Oluştur"
                        >
                          Proforma Oluştur
                        </button>
                      )}

                      <button
                        onClick={() => setPortalModalQuote(quote)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                        title="Müşteri Online Onay Portalı & Dijital İmza"
                      >
                        <PenTool className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => openDocumentViewer('quote', quote)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                        title="PDF Yazdır / Görüntüle"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onOpenDetailModal(quote.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        Detay
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      ) : (
        <QuoteKanbanView
          quotes={filtered}
          onOpenDetailModal={onOpenDetailModal}
          onOpenPortalModal={q => setPortalModalQuote(q)}
        />
      )}

      {/* Customer Public Portal & Digital Signature Modal */}
      {portalModalQuote && (
        <QuotePublicPortalModal
          quote={portalModalQuote}
          onClose={() => setPortalModalQuote(null)}
        />
      )}
    </div>
  );
};
