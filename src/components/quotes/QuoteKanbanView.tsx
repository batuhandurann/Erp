import React from 'react';
import { Quote, QuoteStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  FileSpreadsheet,
  Building2,
  Clock,
  ArrowRight,
  CheckCircle2,
  Send,
  Eye,
  XCircle,
  FileCheck2,
  ExternalLink,
  PenTool
} from 'lucide-react';

interface QuoteKanbanViewProps {
  quotes: Quote[];
  onOpenDetailModal: (id: string) => void;
  onOpenPortalModal: (quote: Quote) => void;
}

interface ColumnDef {
  id: QuoteStatus;
  title: string;
  color: string;
  badgeBg: string;
  borderClass: string;
  icon: React.ReactNode;
}

const COLUMNS: ColumnDef[] = [
  {
    id: 'DRAFT',
    title: 'Taslak',
    color: 'text-slate-700',
    badgeBg: 'bg-slate-100 text-slate-700',
    borderClass: 'border-slate-200',
    icon: <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
  },
  {
    id: 'SENT',
    title: 'Müşteriye Sunuldu',
    color: 'text-blue-700',
    badgeBg: 'bg-blue-50 text-blue-700 border border-blue-200',
    borderClass: 'border-blue-200',
    icon: <Send className="w-3.5 h-3.5 text-blue-600" />
  },
  {
    id: 'VIEWED',
    title: 'İncelendi & Müzakere',
    color: 'text-indigo-700',
    badgeBg: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    borderClass: 'border-indigo-200',
    icon: <Eye className="w-3.5 h-3.5 text-indigo-600" />
  },
  {
    id: 'ACCEPTED',
    title: 'Kabul Edildi / İmzalandı',
    color: 'text-emerald-700',
    badgeBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold',
    borderClass: 'border-emerald-200',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
  },
  {
    id: 'CONVERTED',
    title: 'Fatura & Sözleşme',
    color: 'text-purple-700',
    badgeBg: 'bg-purple-50 text-purple-700 border border-purple-200 font-bold',
    borderClass: 'border-purple-200',
    icon: <FileCheck2 className="w-3.5 h-3.5 text-purple-600" />
  },
  {
    id: 'REJECTED',
    title: 'Kaybedildi / Red',
    color: 'text-rose-700',
    badgeBg: 'bg-rose-50 text-rose-700 border border-rose-200',
    borderClass: 'border-rose-200',
    icon: <XCircle className="w-3.5 h-3.5 text-rose-600" />
  }
];

export const QuoteKanbanView: React.FC<QuoteKanbanViewProps> = ({
  quotes,
  onOpenDetailModal,
  onOpenPortalModal
}) => {
  const { updateQuoteStatus, convertQuoteToProforma } = useApp();

  const getNextStatus = (current: QuoteStatus): QuoteStatus | null => {
    switch (current) {
      case 'DRAFT':
        return 'SENT';
      case 'SENT':
        return 'VIEWED';
      case 'VIEWED':
        return 'ACCEPTED';
      default:
        return null;
    }
  };

  return (
    <div className="overflow-x-auto pb-6">
      <div className="flex gap-4 min-w-[1300px]">
        {COLUMNS.map(col => {
          const colQuotes = quotes.filter(q => q.status === col.id);
          const colTotal = colQuotes.reduce((acc, q) => acc + q.grandTotal, 0);

          return (
            <div
              key={col.id}
              className="flex-1 min-w-[240px] max-w-[320px] bg-slate-50/70 border border-slate-200 rounded-2xl flex flex-col max-h-[78vh]"
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-slate-200 bg-white rounded-t-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {col.icon}
                  <h4 className="text-xs font-bold text-slate-800">{col.title}</h4>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {colQuotes.length}
                </span>
              </div>

              {/* Total Revenue in Column */}
              <div className="px-3.5 py-2 bg-slate-100/50 border-b border-slate-200 text-[11px] flex justify-between items-center text-slate-500">
                <span>Aşama Tutarı:</span>
                <span className="font-bold text-slate-800 font-mono">
                  {colTotal.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
                </span>
              </div>

              {/* Cards Container */}
              <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                {colQuotes.length === 0 ? (
                  <div className="py-8 text-center text-[11px] text-slate-400 italic">
                    Bu aşamada teklif yok
                  </div>
                ) : (
                  colQuotes.map(q => {
                    const next = getNextStatus(q.status);

                    return (
                      <div
                        key={q.id}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all space-y-2.5 group relative"
                      >
                        {/* Top: Quote # & Currency Total */}
                        <div className="flex items-start justify-between gap-2">
                          <button
                            onClick={() => onOpenDetailModal(q.id)}
                            className="font-mono text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                          >
                            {q.quoteNumber}
                          </button>
                          <div className="text-right">
                            <span className="text-xs font-black text-slate-900 font-mono">
                              {q.grandTotal.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}{' '}
                              {q.currency === 'TRY' ? '₺' : q.currency}
                            </span>
                          </div>
                        </div>

                        {/* Customer */}
                        <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 truncate">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{q.customerName}</span>
                        </div>

                        {/* Validity & Items */}
                        <div className="text-[10px] text-slate-500 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {new Date(q.validUntil).toLocaleDateString('tr-TR')}
                          </span>
                          <span>{q.items.length} Kalem</span>
                        </div>

                        {/* Signature Badge if signed */}
                        {(q as any).signedBy && (
                          <div className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>İmzalayan: {(q as any).signedBy}</span>
                          </div>
                        )}

                        {/* Actions Strip */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                          <button
                            onClick={() => onOpenPortalModal(q)}
                            className="text-[10px] font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1 p-1 rounded hover:bg-slate-50 transition-colors"
                            title="Müşteri Portalı ve Dijital İmza Ekranını Aç"
                          >
                            <PenTool className="w-3 h-3" />
                            <span>Portal & İmza</span>
                          </button>

                          {/* Quick Progress Button */}
                          {next && (
                            <button
                              onClick={() => updateQuoteStatus(q.id, next, `Kanban üzerinden durum ${next} aşamasına ilerletildi.`)}
                              className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 transition-colors"
                              title="Bir sonraki duruma ilerlet"
                            >
                              <span>İlerlet</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          {q.status === 'ACCEPTED' && (
                            <button
                              onClick={() => convertQuoteToProforma(q.id)}
                              className="text-[10px] font-bold text-white bg-purple-600 hover:bg-purple-700 flex items-center gap-1 px-2 py-0.5 rounded transition-colors shadow-xs"
                              title="Tek tıkla Proforma Fatura'ya dönüştür"
                            >
                              <FileCheck2 className="w-3 h-3" />
                              <span>Proforma Yap</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
