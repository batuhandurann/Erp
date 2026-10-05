import React from 'react';
import { useApp } from '../../context/AppContext';
import { Printer, Download, X, Building2, CheckCircle2, ShieldCheck, FileCode } from 'lucide-react';
import { Quote, Proforma, Contract, Sale } from '../../types';
import { downloadUblXml } from '../../utils/ublInvoice';

// Convert numbers to Turkish Lira words
function numberToTurkishWords(num: number): string {
  const units = ['', 'Bir', 'İki', 'Üç', 'Dört', 'Beş', 'Altı', 'Yedi', 'Sekiz', 'Dokuz'];
  const tens = ['', 'On', 'Yirmi', 'Otuz', 'Kırk', 'Elli', 'Altmış', 'Yetmiş', 'Seksen', 'Doksan'];

  if (num === 0) return 'Sıfır Türk Lirası';

  const intPart = Math.floor(num);
  const kurus = Math.round((num - intPart) * 100);

  function convertGroup(n: number): string {
    let result = '';
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const u = n % 10;

    if (h > 0) {
      result += (h === 1 ? 'Yüz' : units[h] + ' Yüz') + ' ';
    }
    if (t > 0) {
      result += tens[t] + ' ';
    }
    if (u > 0) {
      result += units[u] + ' ';
    }
    return result.trim();
  }

  const millions = Math.floor(intPart / 1000000);
  const thousands = Math.floor((intPart % 1000000) / 1000);
  const rest = intPart % 1000;

  let words = '';
  if (millions > 0) {
    words += convertGroup(millions) + ' Milyon ';
  }
  if (thousands > 0) {
    words += (thousands === 1 ? 'Bin ' : convertGroup(thousands) + ' Bin ');
  }
  if (rest > 0) {
    words += convertGroup(rest) + ' ';
  }

  words = words.trim() + ' Türk Lirası';
  if (kurus > 0) {
    words += ' ' + convertGroup(kurus) + ' Kuruş';
  }

  return words;
}

export const DocumentViewerModal: React.FC = () => {
  const { documentViewer, closeDocumentViewer, companySettings } = useApp();

  if (!documentViewer.open || !documentViewer.data) return null;

  const { type, data } = documentViewer;

  const handlePrint = () => {
    window.print();
  };

  const getDocTitle = () => {
    switch (type) {
      case 'quote':
        return 'FİYAT TEKLİFİ';
      case 'proforma':
        return 'PROFORMA FATURA';
      case 'contract':
        return 'DONANIM & HİZMET SATIŞ SÖZLEŞMESİ';
      case 'sale':
        return 'SATIŞ & TESLİMAT BELGESİ';
    }
  };

  const getDocNumber = () => {
    if (type === 'quote') return (data as Quote).quoteNumber;
    if (type === 'proforma') return (data as Proforma).proformaNumber;
    if (type === 'contract') return (data as Contract).contractNumber;
    if (type === 'sale') return (data as Sale).saleNumber;
    return '';
  };

  const grandTotal = data.grandTotal || 0;
  const items = data.items || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white">
      {/* Top Action Bar (hidden on print) */}
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] print:max-h-none print:shadow-none print:rounded-none">
        <div className="no-print bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm tracking-tight">{getDocTitle()}</span>
            <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              {getDocNumber()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {(type === 'sale' || type === 'proforma') && (
              <button
                onClick={() => downloadUblXml(data, companySettings)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-slate-800 hover:bg-slate-700 hover:text-emerald-300 border border-slate-700 rounded-lg transition-colors shadow-xs"
                title="GİB UBL-TR 2.1 E-Fatura XML İndir"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>E-Fatura XML İndir</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
              title="Yazıcıya gönder veya PDF olarak kaydet"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Yazdır / PDF İndir</span>
            </button>
            <button
              onClick={closeDocumentViewer}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* A4 Document Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-white print:p-0 print:overflow-visible">
          <div className="print-document max-w-3xl mx-auto border border-slate-200 print:border-none p-8 sm:p-12 bg-white text-slate-800 text-xs shadow-xs rounded-sm">
            {/* Header: Company Info + Document Title */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
              <div className="space-y-1 max-w-[60%]">
                <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-xl tracking-tight uppercase">
                  <div className="w-7 h-7 bg-indigo-600 text-white rounded flex items-center justify-center text-xs font-black">
                    PQ
                  </div>
                  <span>{companySettings.companyName}</span>
                </div>
                <div className="text-[11px] text-slate-600 font-medium">{companySettings.commercialTitle}</div>
                <div className="text-[10px] text-slate-500 leading-relaxed">
                  {companySettings.address}
                </div>
                <div className="text-[10px] text-slate-500">
                  <span className="font-semibold text-slate-700">Vergi Dairesi & No:</span> {companySettings.taxOffice} / {companySettings.taxNumber}
                </div>
                <div className="text-[10px] text-slate-500">
                  <span className="font-semibold text-slate-700">Tel:</span> {companySettings.phone} · <span className="font-semibold text-slate-700">E-Posta:</span> {companySettings.email}
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="text-lg font-black text-slate-900 tracking-tight">{getDocTitle()}</div>
                <div className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded inline-block">
                  {getDocNumber()}
                </div>
                <div className="text-[10px] text-slate-500 mt-2">
                  <span className="font-semibold text-slate-700">Düzenleme Tarihi:</span> {data.date || data.contractDate || new Date().toISOString().split('T')[0]}
                </div>
                {data.validUntil && (
                  <div className="text-[10px] text-slate-500">
                    <span className="font-semibold text-slate-700">Geçerlilik Tarihi:</span> {data.validUntil}
                  </div>
                )}
                {data.dueDate && (
                  <div className="text-[10px] text-slate-500">
                    <span className="font-semibold text-slate-700">Ödeme Vadesi:</span> {data.dueDate}
                  </div>
                )}
                {data.salesPersonName && (
                  <div className="text-[10px] text-slate-500">
                    <span className="font-semibold text-slate-700">Yetkili Danışman:</span> {data.salesPersonName}
                  </div>
                )}
              </div>
            </div>

            {/* Customer Box */}
            <div className="bg-slate-50 rounded border border-slate-200 p-4 mb-6">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Müşteri / Alıcı Bilgileri
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{data.customerName}</div>
                  <div className="text-[11px] text-slate-600 mt-1 leading-snug">{data.customerAddress}</div>
                </div>
                <div className="space-y-0.5 text-right">
                  <div className="text-[11px] text-slate-700">
                    <span className="font-semibold">V.D. / No:</span> {data.customerTaxOffice} - {data.customerTaxNumber}
                  </div>
                  {data.contactPerson && (
                    <div className="text-[11px] text-slate-700">
                      <span className="font-semibold">Yetkili:</span> {data.contactPerson}
                    </div>
                  )}
                  {data.customerPhone && (
                    <div className="text-[11px] text-slate-700">
                      <span className="font-semibold">Tel:</span> {data.customerPhone}
                    </div>
                  )}
                  {data.customerEmail && (
                    <div className="text-[11px] text-slate-700">
                      <span className="font-semibold">E-Posta:</span> {data.customerEmail}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Special Contract Clauses (if Contract) */}
            {type === 'contract' && data.specialClauses && (
              <div className="mb-6 space-y-2">
                <div className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1">
                  SÖZLEŞME HÜKÜM VE KOŞULLARI
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-700 leading-relaxed">
                  {data.specialClauses.map((clause: string, idx: number) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-slate-400 font-semibold">•</span>
                      <span>{clause}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Items Table */}
            <div className="mb-6">
              <div className="font-bold text-slate-900 text-xs mb-2">ÜRÜN VE HİZMET KALEMLERİ</div>
              <table className="w-full text-left border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold">
                    <th className="p-2 border border-slate-200 w-8 text-center">#</th>
                    <th className="p-2 border border-slate-200">Ürün / Hizmet Açıklaması</th>
                    <th className="p-2 border border-slate-200 w-16 text-center">Miktar</th>
                    <th className="p-2 border border-slate-200 w-24 text-right">Birim Fiyat</th>
                    <th className="p-2 border border-slate-200 w-16 text-right">İskonto</th>
                    <th className="p-2 border border-slate-200 w-14 text-center">KDV</th>
                    <th className="p-2 border border-slate-200 w-28 text-right">Tutar (KDV Dahil)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px]">
                  {items.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-2 border border-slate-200 text-center font-mono text-slate-500">{idx + 1}</td>
                      <td className="p-2 border border-slate-200">
                        <div className="font-semibold text-slate-900">{item.productName}</div>
                        {item.productSku && (
                          <div className="text-[10px] font-mono text-slate-500">Kod: {item.productSku}</div>
                        )}
                      </td>
                      <td className="p-2 border border-slate-200 text-center font-bold tabular-nums">{item.quantity} Ad.</td>
                      <td className="p-2 border border-slate-200 text-right tabular-nums">
                        {item.unitPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                      </td>
                      <td className="p-2 border border-slate-200 text-right tabular-nums text-slate-600">
                        {item.discountRate > 0 ? `%${item.discountRate}` : '-'}
                      </td>
                      <td className="p-2 border border-slate-200 text-center tabular-nums text-slate-600">
                        %{item.taxRate}
                      </td>
                      <td className="p-2 border border-slate-200 text-right font-bold tabular-nums text-slate-900">
                        {item.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations & Totals Box */}
            <div className="flex justify-between items-start mb-6">
              {/* Payment & Delivery Terms notes */}
              <div className="w-[50%] space-y-2 text-[10px] text-slate-600">
                <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                  <div>
                    <span className="font-bold text-slate-800">Ödeme Koşulu:</span> {data.paymentTerms || '%50 Peşin, %50 Teslimatta'}
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">Teslimat Şartı:</span> {data.deliveryTerms || 'Adrese Teslim'}
                  </div>
                  {data.warrantyTerms && (
                    <div>
                      <span className="font-bold text-slate-800">Garanti:</span> {data.warrantyTerms}
                    </div>
                  )}
                </div>

                {/* Bank Account Info (for Proforma & Quote) */}
                <div className="p-3 bg-indigo-50/50 rounded border border-indigo-100 text-[10px] space-y-0.5">
                  <div className="font-bold text-indigo-900">Havale / EFT Hesap Bilgileri:</div>
                  <div className="text-slate-700">{companySettings.bankName}</div>
                  <div className="font-mono font-semibold text-slate-900">{companySettings.iban}</div>
                  <div className="text-slate-600">Alıcı: {companySettings.accountHolder}</div>
                </div>
              </div>

              {/* Totals Table */}
              <div className="w-[45%]">
                <table className="w-full text-[11px] border border-slate-200">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 text-slate-600">Ara Toplam:</td>
                      <td className="p-2 text-right font-medium tabular-nums">
                        {(data.subtotal || grandTotal / 1.2).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                      </td>
                    </tr>
                    {data.discountTotal > 0 && (
                      <tr className="border-b border-slate-200 text-rose-600">
                        <td className="p-2">Toplam İskonto:</td>
                        <td className="p-2 text-right font-medium tabular-nums">
                          -{(data.discountTotal).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                        </td>
                      </tr>
                    )}
                    <tr className="border-b border-slate-200">
                      <td className="p-2 text-slate-600">Hesaplanan KDV (%20):</td>
                      <td className="p-2 text-right font-medium tabular-nums">
                        {(data.taxTotal || (grandTotal - (grandTotal / 1.2))).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                      </td>
                    </tr>
                    <tr className="bg-slate-900 text-white font-bold text-xs">
                      <td className="p-2.5">GENEL TOPLAM:</td>
                      <td className="p-2.5 text-right tabular-nums text-sm">
                        {grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Amount in words */}
                <div className="mt-2 text-[10px] text-slate-500 italic text-right">
                  Yalnız: #{numberToTurkishWords(grandTotal)}#
                </div>
              </div>
            </div>

            {/* Signatures & Stamp section */}
            <div className="border-t border-slate-200 pt-6 mt-8">
              <div className="grid grid-cols-2 gap-8 text-center">
                <div className="border border-slate-200 rounded p-4 h-36 flex flex-col justify-between">
                  <div className="text-[11px] font-bold text-slate-800">
                    SATICININ KAŞE & YETKİLİ İMZASI
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {companySettings.companyName}
                    <div className="font-semibold text-slate-700">{companySettings.authorizedSignatory}</div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded p-4 h-36 flex flex-col justify-between">
                  <div className="text-[11px] font-bold text-slate-800">
                    ALICININ KAŞE & YETKİLİ İMZASI
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {data.customerName}
                    <div className="font-semibold text-slate-700">{data.contactPerson || data.customerRepresentative || 'Yetkili İmza'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Small Footer */}
            <div className="mt-8 text-center text-[9px] text-slate-400 border-t border-slate-100 pt-2">
              İşbu belge elektronik ortamda ProQuote ERP Satış & Donanım Takip Sistemi üzerinden üretilmiştir.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
