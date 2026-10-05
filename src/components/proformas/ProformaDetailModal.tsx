import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Printer,
  FileText,
  ShoppingBag,
  DollarSign,
  Building2,
  CheckCircle,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { Proforma } from '../../types';

interface ProformaDetailModalProps {
  proformaId: string | null;
  onClose: () => void;
  onOpenContract: (contractId: string) => void;
  onOpenSale: (saleId: string) => void;
}

export const ProformaDetailModal: React.FC<ProformaDetailModalProps> = ({
  proformaId,
  onClose,
  onOpenContract,
  onOpenSale
}) => {
  const {
    proformas,
    convertProformaToContract,
    createSaleFromWorkflow,
    recordPayment,
    openDocumentViewer,
    currentUser,
    companySettings
  } = useApp();

  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'HAVALE/EFT' | 'KREDI_KARTI' | 'CEK'>('HAVALE/EFT');
  const [paymentRef, setPaymentRef] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  if (!proformaId) return null;
  const proforma = proformas.find(p => p.id === proformaId);
  if (!proforma) return null;

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) return;

    recordPayment({
      proformaId: proforma.id,
      proformaNumber: proforma.proformaNumber,
      customerId: proforma.customerId,
      customerName: proforma.customerName,
      amount: paymentAmount,
      currency: proforma.currency,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod,
      referenceNo: paymentRef || `REF-${Date.now().toString().slice(-6)}`,
      recordedBy: currentUser.name,
      notes: 'Proforma avans tahsilatı'
    });

    setPaymentAmount(0);
    setPaymentRef('');
    setShowPaymentForm(false);
  };

  const isViewer = currentUser.role === 'Sadece Görüntüleme';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-bold text-slate-900">{proforma.proformaNumber}</span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
              proforma.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
              proforma.paymentStatus === 'PARTIAL' ? 'bg-amber-100 text-amber-800 border-amber-200' :
              'bg-blue-100 text-blue-800 border-blue-200'
            }`}>
              {proforma.paymentStatus === 'PAID' ? 'ÖDENDİ' : proforma.paymentStatus === 'PARTIAL' ? 'KISMİ ÖDEME' : 'ÖDEME BEKLİYOR'}
            </span>
            {proforma.quoteNumber && (
              <span className="text-xs text-slate-500 font-mono">
                (Teklif: {proforma.quoteNumber})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openDocumentViewer('proforma', proforma)}
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

        {/* Workflow Conversion Strip */}
        {!isViewer && (
          <div className="bg-slate-900 text-white px-6 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-300">
              Sonraki Aşamalar: <span className="text-indigo-400 font-medium">Sözleşme akdi veya Satış onayı ile otomatik PRD kodlu cihaz üretimi</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPaymentForm(!showPaymentForm)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors"
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tahsilat / Ödeme Girişi</span>
              </button>

              <button
                onClick={() => {
                  const contract = convertProformaToContract(proforma.id);
                  if (contract) {
                    onClose();
                    onOpenContract(contract.id);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Satış Sözleşmesi Oluştur →</span>
              </button>

              <button
                onClick={() => {
                  const sale = createSaleFromWorkflow('proforma', proforma.id);
                  if (sale) {
                    onClose();
                    onOpenSale(sale.id);
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Satışı Kes & Seri No Üret →</span>
              </button>
            </div>
          </div>
        )}

        {/* Payment Entry Subform */}
        {showPaymentForm && (
          <form onSubmit={handleRecordPayment} className="bg-emerald-50 border-b border-emerald-200 p-4 px-6 flex flex-wrap items-end gap-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-emerald-900">Tahsilat Tutarı (₺):</label>
              <input
                type="number"
                min="1"
                max={proforma.remainingAmount}
                value={paymentAmount || ''}
                onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)}
                placeholder={`Maks ${proforma.remainingAmount}`}
                className="border border-emerald-300 rounded px-2.5 py-1.5 bg-white text-slate-900 font-mono font-bold"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-emerald-900">Ödeme Yöntemi:</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as any)}
                className="border border-emerald-300 rounded px-2.5 py-1.5 bg-white text-slate-900"
              >
                <option value="HAVALE/EFT">Banka Havale / EFT</option>
                <option value="KREDI_KARTI">Kredi Kartı / Mail Order</option>
                <option value="CEK">Müşteri Çeki</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-emerald-900">Banka Dekont / Referans No:</label>
              <input
                type="text"
                value={paymentRef}
                onChange={e => setPaymentRef(e.target.value)}
                placeholder="Örn: GR-982142"
                className="border border-emerald-300 rounded px-2.5 py-1.5 bg-white text-slate-900"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded shadow-xs"
            >
              Tahsilatı Kaydet
            </button>
          </form>
        )}

        {/* Proforma Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary Financial Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Toplam Proforma Tutarı</div>
              <div className="text-xl font-bold text-slate-900 tabular-nums font-mono mt-1">
                {proforma.grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
              </div>
            </div>

            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
              <div className="text-[10px] font-bold text-emerald-700 uppercase">Tahsil Edilen Tutar</div>
              <div className="text-xl font-bold text-emerald-800 tabular-nums font-mono mt-1">
                {proforma.paidAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
              </div>
            </div>

            <div className="bg-rose-50 p-4 rounded-xl border border-rose-200">
              <div className="text-[10px] font-bold text-rose-700 uppercase">Kalan Tahsilat Bakiyesi</div>
              <div className="text-xl font-bold text-rose-800 tabular-nums font-mono mt-1">
                {proforma.remainingAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
              </div>
            </div>
          </div>

          {/* Customer & Bank Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-1 text-xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Müşteri Bilgileri</div>
              <div className="font-bold text-slate-900 text-sm">{proforma.customerName}</div>
              <div className="text-slate-600">{proforma.customerAddress}</div>
              <div className="text-slate-500 pt-1">
                V.D. / No: {proforma.customerTaxOffice} - {proforma.customerTaxNumber}
              </div>
            </div>

            <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 space-y-1 text-xs">
              <div className="text-[10px] font-bold text-indigo-900 uppercase">Belirtilen Banka Hesabı</div>
              <div className="font-bold text-slate-900">{proforma.bankDetails.bankName}</div>
              <div className="font-mono text-indigo-950 font-bold">{proforma.bankDetails.iban}</div>
              <div className="text-slate-600">Hesap Sahibi: {proforma.bankDetails.accountHolder}</div>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Proforma Kalemleri ({proforma.items.length})
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="p-3 w-8">#</th>
                    <th className="p-3">Ürün / Donanım</th>
                    <th className="p-3 w-20 text-center">Adet</th>
                    <th className="p-3 w-32 text-right">Birim Fiyat</th>
                    <th className="p-3 w-20 text-center">KDV</th>
                    <th className="p-3 w-32 text-right">Toplam Tutar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {proforma.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3 text-slate-400 font-mono text-center">{idx + 1}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{item.productName}</div>
                        {item.productSku && (
                          <div className="text-[10px] font-mono text-slate-400">{item.productSku}</div>
                        )}
                      </td>
                      <td className="p-3 text-center font-bold tabular-nums">{item.quantity} Adet</td>
                      <td className="p-3 text-right tabular-nums font-mono">
                        {item.unitPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
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
        </div>
      </div>
    </div>
  );
};
