import React, { useRef, useState, useEffect } from 'react';
import { Quote } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle2,
  X,
  Building2,
  PenTool,
  RotateCcw,
  ShieldCheck,
  Send,
  MessageSquare,
  AlertCircle,
  Clock,
  Download
} from 'lucide-react';

interface QuotePublicPortalModalProps {
  quote: Quote | null;
  onClose: () => void;
}

export const QuotePublicPortalModal: React.FC<QuotePublicPortalModalProps> = ({ quote, onClose }) => {
  const { updateQuoteStatus, companySettings } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signerName, setSignerName] = useState(quote?.contactPerson || '');
  const [signerTitle, setSignerTitle] = useState('Satın Alma / Genel Müdür');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isRevisionMode, setIsRevisionMode] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');

  // Setup canvas for drawing
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e293b';
  }, [canvasRef, isRevisionMode]);

  if (!quote) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleApproveAndSign = () => {
    if (!hasSignature || !signerName.trim() || !termsAccepted) return;
    const canvas = canvasRef.current;
    const signatureDataUrl = canvas ? canvas.toDataURL() : '';

    // Update Quote status to ACCEPTED with digital signature metadata
    updateQuoteStatus(
      quote.id,
      'ACCEPTED',
      `Müşteri Online Portal üzerinden dijital imza ile onaylandı: ${signerName} (${signerTitle})`
    );

    // Save signature directly on quote object in memory
    (quote as any).signatureData = signatureDataUrl;
    (quote as any).signedBy = signerName;
    (quote as any).signedTitle = signerTitle;
    (quote as any).signedAt = new Date().toISOString();

    setIsSubmitted(true);
  };

  const handleSendRevision = () => {
    if (!revisionNotes.trim()) return;
    updateQuoteStatus(
      quote.id,
      'VIEWED',
      `Müşteri revizyon talebi iletti: "${revisionNotes.trim()}"`
    );
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Portal Banner */}
        <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-indigo-900/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
              BF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-tight text-white">Müşteri Online Onay Portalı</h3>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Güvenli 256-bit SSL
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {companySettings.companyName} tarafından {quote.customerName} için düzenlenmiştir
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {isSubmitted ? (
            <div className="p-8 text-center space-y-4 max-w-lg mx-auto bg-emerald-50 rounded-2xl border border-emerald-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-emerald-950">İşleminiz Başarıyla Kaydedildi!</h2>
              <p className="text-xs text-emerald-800 leading-relaxed">
                {isRevisionMode
                  ? 'Revizyon talebiniz ve notlarınız müşteri temsilcinize ulaştırıldı. En kısa sürede güncellenmiş teklif tarafınıza iletilecektir.'
                  : `Teklif dijital imzanız ile onaylandı. Yetkili: ${signerName} (${signerTitle}). Satış ve sevkiyat süreci başlatıldı.`}
              </p>
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  Pencereyi Kapat
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium">Teklif Referans No</div>
                  <div className="font-mono text-sm font-bold text-slate-900 mt-1">{quote.quoteNumber}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Düzenleme: {new Date(quote.date).toLocaleDateString('tr-TR')}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium">Son Geçerlilik Tarihi</div>
                  <div className="text-sm font-bold text-amber-700 mt-1">
                    {new Date(quote.validUntil).toLocaleDateString('tr-TR')}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-500" /> Kalan Süre: Aktif
                  </div>
                </div>

                <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100">
                  <div className="text-[11px] text-indigo-700 font-medium">Teklif Toplam Bedeli</div>
                  <div className="text-lg font-black text-indigo-900 mt-0.5">
                    {quote.grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {quote.currency === 'TRY' ? '₺' : quote.currency}
                  </div>
                  <div className="text-[10px] text-indigo-600 mt-0.5 font-medium">
                    KDV Dahil Net Tutar
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2.5 px-4">Ürün / Hizmet Tanımı</th>
                      <th className="py-2.5 px-3 text-center">Miktar</th>
                      <th className="py-2.5 px-3 text-right">Birim Fiyat</th>
                      <th className="py-2.5 px-3 text-center">İskonto</th>
                      <th className="py-2.5 px-4 text-right">Toplam</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quote.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-4">
                          <div className="font-semibold text-slate-900">{item.productName}</div>
                          <div className="text-[10px] font-mono text-slate-400">{item.productSku}</div>
                        </td>
                        <td className="py-2.5 px-3 text-center font-medium">{item.quantity} Adet</td>
                        <td className="py-2.5 px-3 text-right">
                          {item.unitPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {quote.currency === 'TRY' ? '₺' : quote.currency}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-500">
                          {item.discountRate > 0 ? `%${item.discountRate}` : '-'}
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                          {item.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {quote.currency === 'TRY' ? '₺' : quote.currency}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Terms & Notes */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <div className="font-semibold text-slate-800">Teklif Şartları & Ödeme Koşulları:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>• Ödeme Koşulu: <span className="font-medium text-slate-800">{quote.paymentTerms}</span></div>
                  <div>• Teslimat Süresi: <span className="font-medium text-slate-800">{quote.deliveryTerms}</span></div>
                </div>
              </div>

              {/* Action Tabs: Approve & Sign OR Request Revision */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => setIsRevisionMode(false)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      !isRevisionMode
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <PenTool className="w-4 h-4" />
                    <span>Dijital İmza ile Onayla</span>
                  </button>

                  <button
                    onClick={() => setIsRevisionMode(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      isRevisionMode
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Revizyon / İndirim Talep Et</span>
                  </button>
                </div>

                {isRevisionMode ? (
                  <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 space-y-3">
                    <label className="block text-xs font-bold text-amber-950">
                      Revizyon Talebiniz ve Notlarınız:
                    </label>
                    <textarea
                      rows={4}
                      value={revisionNotes}
                      onChange={e => setRevisionNotes(e.target.value)}
                      placeholder="Örnek: Teklifte belirtilen 3. kalemde %5 ek iskonto yapılabilirse ve teslimat 10 güne çekilirse onay verebiliriz..."
                      className="w-full text-xs p-3 bg-white border border-amber-300 rounded-xl outline-hidden focus:border-amber-600 text-slate-800"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleSendRevision}
                        disabled={!revisionNotes.trim()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                      >
                        <Send className="w-4 h-4" />
                        <span>Revizyon Talebini İlet</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Yetkili İsim Soyisim:
                        </label>
                        <input
                          type="text"
                          value={signerName}
                          onChange={e => setSignerName(e.target.value)}
                          placeholder="Ad Soyad"
                          className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg outline-hidden focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Yetkili Unvan / Görev:
                        </label>
                        <input
                          type="text"
                          value={signerTitle}
                          onChange={e => setSignerTitle(e.target.value)}
                          placeholder="Örn: Satın Alma Müdürü"
                          className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg outline-hidden focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Canvas Signature Pad */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <PenTool className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Islak / Dijital İmzanızı Çizin (Fare veya Dokunmatik Ekran):</span>
                        </label>
                        <button
                          type="button"
                          onClick={clearSignature}
                          className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-600 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>İmzayı Temizle</span>
                        </button>
                      </div>

                      <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-white rounded-xl overflow-hidden shadow-inner">
                        <canvas
                          ref={canvasRef}
                          width={750}
                          height={160}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                          className="w-full h-36 cursor-crosshair touch-none bg-white"
                        />
                      </div>
                      {!hasSignature && (
                        <p className="text-[10px] text-amber-600 mt-1">
                          * Lütfen yukarıdaki alana imzanızı çizin.
                        </p>
                      )}
                    </div>

                    {/* Terms Checkbox */}
                    <label className="flex items-start gap-2.5 cursor-pointer pt-2">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={e => setTermsAccepted(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                      <span className="text-xs text-slate-600 leading-relaxed select-none">
                        Fiyat teklifinde yer alan tüm kalemleri, toplam tutarı ve ticari şartları inceledim; firmam adına siparişi ve teklifi resmi olarak <strong>onaylıyor ve taahhüt ediyorum</strong>.
                      </span>
                    </label>

                    {/* Final Action Button */}
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={handleApproveAndSign}
                        disabled={!hasSignature || !signerName.trim() || !termsAccepted}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-md transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Teklifi İmzala & Resmi Olarak Onayla</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
