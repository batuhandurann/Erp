import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Printer,
  ShoppingBag,
  FileCheck2,
  FileText,
  Building2,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Contract } from '../../types';

interface ContractDetailModalProps {
  contractId: string | null;
  onClose: () => void;
  onOpenSale: (saleId: string) => void;
}

export const ContractDetailModal: React.FC<ContractDetailModalProps> = ({
  contractId,
  onClose,
  onOpenSale
}) => {
  const { contracts, createSaleFromWorkflow, openDocumentViewer, currentUser } = useApp();

  if (!contractId) return null;
  const contract = contracts.find(c => c.id === contractId);
  if (!contract) return null;

  const isViewer = currentUser.role === 'Sadece Görüntüleme';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-bold text-slate-900">{contract.contractNumber}</span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
              contract.status === 'SIGNED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
              contract.status === 'PENDING_SIGNATURE' ? 'bg-amber-100 text-amber-800 border-amber-200' :
              'bg-slate-100 text-slate-700'
            }`}>
              {contract.status === 'SIGNED' ? 'İMZALANDI / YÜRÜRLÜKTE' : contract.status === 'PENDING_SIGNATURE' ? 'İMZA BEKLİYOR' : contract.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openDocumentViewer('contract', contract)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Sözleşme PDF / Yazdır</span>
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Strip */}
        {!isViewer && (
          <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-300">
              Sözleşme Akdi Sonrası: <strong className="text-indigo-400">Satış Faturası Düzenleme ve Otomatik PRD Seri No Takibi</strong>
            </span>
            <button
              onClick={() => {
                const sale = createSaleFromWorkflow('contract', contract.id);
                if (sale) {
                  onClose();
                  onOpenSale(sale.id);
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Satışı Kes & Ürün Seri Nolarını Üret →</span>
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Parties Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase">SATICI TARAF</div>
              <div className="font-bold text-slate-900 text-sm">{contract.sellerName}</div>
              <div className="text-slate-600">{contract.sellerAddress}</div>
              <div className="text-slate-500 pt-1">
                <strong>Yetkili İmza:</strong> {contract.sellerRepresentative} ({contract.sellerTitle})
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase">ALICI MÜŞTERİ</div>
              <div className="font-bold text-slate-900 text-sm">{contract.customerName}</div>
              <div className="text-slate-600">{contract.customerAddress}</div>
              <div className="text-slate-500 pt-1">
                <strong>Yetkili Temsilci:</strong> {contract.customerRepresentative} ({contract.customerTitle})
              </div>
            </div>
          </div>

          {/* Legal Clauses */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Sözleşme Maddeleri & Taahhütler
            </div>
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-2 text-xs leading-relaxed text-slate-700">
              {contract.specialClauses.map((clause, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="font-bold text-slate-900 shrink-0">•</span>
                  <span>{clause}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Items & Amount */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Sözleşmeye Konu Donanım ve Hizmet Kalemleri
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="p-3 w-8">#</th>
                    <th className="p-3">Ürün / Donanım</th>
                    <th className="p-3 w-20 text-center">Adet</th>
                    <th className="p-3 w-32 text-right">Birim Fiyat</th>
                    <th className="p-3 w-32 text-right">Toplam Tutar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {contract.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3 text-slate-400 font-mono text-center">{idx + 1}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{item.productName}</div>
                        {item.productSku && <div className="text-[10px] font-mono text-slate-400">{item.productSku}</div>}
                      </td>
                      <td className="p-3 text-center font-bold tabular-nums">{item.quantity} Adet</td>
                      <td className="p-3 text-right tabular-nums font-mono">
                        {item.unitPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                      </td>
                      <td className="p-3 text-right font-bold tabular-nums text-slate-900 font-mono">
                        {item.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800 uppercase">Sözleşme Toplam Bedeli:</span>
              <span className="text-base font-black text-indigo-700 tabular-nums font-mono">
                {contract.grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
