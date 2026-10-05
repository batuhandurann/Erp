import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  FileCheck2,
  FileText,
  Printer,
  Send,
  CheckCircle,
  XCircle,
  Building2,
  ArrowRight,
  Clock,
  ExternalLink
} from 'lucide-react';
import { QuoteStatus } from '../../types';

interface QuoteDetailModalProps {
  quoteId: string | null;
  onClose: () => void;
  onOpenProforma: (proformaId: string) => void;
  onOpenContract: (contractId: string) => void;
}

export const QuoteDetailModal: React.FC<QuoteDetailModalProps> = ({
  quoteId,
  onClose,
  onOpenProforma,
  onOpenContract
}) => {
  const {
    quotes,
    updateQuoteStatus,
    convertQuoteToProforma,
    convertQuoteToContract,
    openDocumentViewer,
    currentUser,
    auditLogs
  } = useApp();

  if (!quoteId) return null;
  const quote = quotes.find(q => q.id === quoteId);
  if (!quote) return null;

  const quoteAuditLogs = auditLogs.filter(a => a.entityId === quote.id || a.entityCode === quote.quoteNumber);

  const getStatusBadge = (status: QuoteStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'SENT':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'VIEWED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'ACCEPTED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CONVERTED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const isViewer = currentUser.role === 'Sadece Görüntüleme';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-bold text-slate-900">{quote.quoteNumber}</span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(quote.status)}`}>
              {quote.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openDocumentViewer('quote', quote)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Resmi PDF / Yazdır</span>
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* State Machine Action Banner */}
        {!isViewer && (
          <div className="bg-indigo-50/70 border-b border-indigo-100 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-indigo-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span className="font-semibold">İş Akışı Durum Adımları:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {quote.status === 'DRAFT' && (
                <button
                  onClick={() => updateQuoteStatus(quote.id, 'SENT', 'Müşteriye e-posta ile sevk edildi')}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Müşteriye Gönder</span>
                </button>
              )}

              {(quote.status === 'SENT' || quote.status === 'VIEWED') && (
                <>
                  <button
                    onClick={() => updateQuoteStatus(quote.id, 'ACCEPTED', 'Müşteri satın alma onayı verdi')}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Müşteri Kabul Etti (Onayla)</span>
                  </button>
                  <button
                    onClick={() => updateQuoteStatus(quote.id, 'REJECTED', 'Müşteri bütçe nedeniyle teklifi reddetti')}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reddet</span>
                  </button>
                </>
              )}

              {/* Conversion Buttons */}
              <button
                onClick={() => {
                  const proforma = convertQuoteToProforma(quote.id);
                  if (proforma) {
                    onClose();
                    onOpenProforma(proforma.id);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
                title="Teklifteki tüm ürün ve fiyatları tek tıkla proforma faturaya aktar"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Proforma Oluştur →</span>
              </button>

              <button
                onClick={() => {
                  const contract = convertQuoteToContract(quote.id);
                  if (contract) {
                    onClose();
                    onOpenContract(contract.id);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors shadow-xs"
                title="Hukuki maddeler ve imza şartlarıyla satış sözleşmesi oluştur"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Satış Sözleşmesi Oluştur →</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Customer & Quote Meta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Müşteri Bilgileri</div>
              <div className="font-bold text-slate-900 text-sm">{quote.customerName}</div>
              <div className="text-xs text-slate-600">{quote.customerAddress}</div>
              <div className="text-xs text-slate-500 pt-1">
                <strong>V.D. / No:</strong> {quote.customerTaxOffice} - {quote.customerTaxNumber}
              </div>
              <div className="text-xs text-slate-500">
                <strong>İletişim Yetkilisi:</strong> {quote.contactPerson} ({quote.customerPhone})
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-1.5 text-xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Teklif Parametreleri</div>
              <div className="flex justify-between py-0.5 border-b border-slate-200">
                <span className="text-slate-500">Oluşturma Tarihi:</span>
                <span className="font-semibold text-slate-800">{quote.date}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-200">
                <span className="text-slate-500">Son Geçerlilik:</span>
                <span className="font-semibold text-slate-800">{quote.validUntil}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-200">
                <span className="text-slate-500">Satış Danışmanı:</span>
                <span className="font-semibold text-slate-800">{quote.salesPersonName}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Para Birimi:</span>
                <span className="font-bold text-indigo-700">{quote.currency}</span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Teklif Kalemleri ({quote.items.length})
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="p-3 w-8">#</th>
                    <th className="p-3">Ürün / Donanım</th>
                    <th className="p-3 w-20 text-center">Adet</th>
                    <th className="p-3 w-32 text-right">Birim Fiyat</th>
                    <th className="p-3 w-20 text-center">İskonto</th>
                    <th className="p-3 w-20 text-center">KDV</th>
                    <th className="p-3 w-32 text-right">Toplam Tutar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {quote.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3 text-slate-400 font-mono text-center">{idx + 1}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{item.productName}</div>
                        {item.productSku && (
                          <div className="text-[10px] font-mono text-slate-400">SKU: {item.productSku}</div>
                        )}
                      </td>
                      <td className="p-3 text-center font-bold tabular-nums">{item.quantity} Adet</td>
                      <td className="p-3 text-right tabular-nums font-mono">
                        {item.unitPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                      </td>
                      <td className="p-3 text-center tabular-nums text-slate-600">
                        {item.discountRate > 0 ? `%${item.discountRate}` : '-'}
                      </td>
                      <td className="p-3 text-center tabular-nums text-slate-600">%{item.taxRate}</td>
                      <td className="p-3 text-right font-bold tabular-nums text-slate-900 font-mono">
                        {item.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Terms & Totals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div>
                  <span className="font-bold text-slate-700">Ödeme Şartı: </span>
                  <span className="text-slate-600">{quote.paymentTerms}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Teslimat Şartı: </span>
                  <span className="text-slate-600">{quote.deliveryTerms}</span>
                </div>
                {quote.notes && (
                  <div>
                    <span className="font-bold text-slate-700">Notlar: </span>
                    <span className="text-slate-600">{quote.notes}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 self-start text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Ara Toplam:</span>
                <span className="font-medium tabular-nums font-mono">
                  {quote.subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                </span>
              </div>
              {quote.discountTotal > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Toplam İskonto:</span>
                  <span className="font-medium tabular-nums font-mono">
                    -{quote.discountTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                  </span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>KDV (%20):</span>
                <span className="font-medium tabular-nums font-mono">
                  {quote.taxTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-bold text-slate-900 uppercase">Genel Toplam:</span>
                <span className="text-base font-black text-indigo-700 tabular-nums font-mono">
                  {quote.grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                </span>
              </div>
            </div>
          </div>

          {/* Audit Logs for this quote */}
          {quoteAuditLogs.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Belge Değişiklik Günlüğü (Audit Trail)
              </div>
              <div className="space-y-1.5">
                {quoteAuditLogs.map(log => (
                  <div key={log.id} className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">{log.action}</div>
                      <div className="text-slate-600 text-[11px]">{log.details}</div>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono text-right shrink-0">
                      <div>{log.userName}</div>
                      <div>{log.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
