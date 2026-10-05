import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Printer,
  ShoppingBag,
  Cpu,
  Truck,
  CheckCircle2,
  Building2,
  PackageCheck,
  ArrowRight
} from 'lucide-react';
import { Sale } from '../../types';

interface SaleDetailModalProps {
  saleId: string | null;
  onClose: () => void;
  onOpenSerial: (serialId: string) => void;
}

export const SaleDetailModal: React.FC<SaleDetailModalProps> = ({
  saleId,
  onClose,
  onOpenSerial
}) => {
  const { sales, productSerials, openDocumentViewer } = useApp();

  if (!saleId) return null;
  const sale = sales.find(s => s.id === saleId);
  if (!sale) return null;

  // Filter product serials generated for this sale
  const connectedSerials = productSerials.filter(
    s => s.saleId === sale.id || s.saleNumber === sale.saleNumber || (sale.generatedSerialIds && sale.generatedSerialIds.includes(s.id))
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-bold text-slate-900">{sale.saleNumber}</span>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
              Fatura: {sale.invoiceNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openDocumentViewer('sale', sale)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Fatura & Teslimat Yazdır</span>
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Sale Meta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Müşteri & Sevk Bilgileri</div>
              <div className="font-bold text-slate-900 text-sm">{sale.customerName}</div>
              <div className="text-slate-600">Satış Tarihi: {sale.date}</div>
              {sale.quoteNumber && (
                <div className="text-slate-500 font-mono text-[11px]">
                  Bağlı Teklif: {sale.quoteNumber}
                </div>
              )}
              {sale.contractNumber && (
                <div className="text-slate-500 font-mono text-[11px]">
                  Sözleşme No: {sale.contractNumber}
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Finans & Sevkiyat Durumu</div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500">Ödeme Durumu:</span>
                <span className="font-bold text-emerald-700">{sale.paymentStatus} (Tahsil Edildi)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500">Sevkiyat / Teslimat:</span>
                <span className="font-semibold text-slate-800">{sale.deliveryStatus}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Toplam Satış Tutarı:</span>
                <span className="font-bold text-slate-900 tabular-nums font-mono text-sm">
                  {sale.grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                </span>
              </div>
            </div>
          </div>

          {/* Connected Serial Numbers Spotlight */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-600" />
                <span>Bu Satıştan Otomatik Türetilen Ürün / Seri Takip Kayıtları ({connectedSerials.length})</span>
              </h3>
              <span className="text-[11px] text-slate-500">Her donanım birimine benzersiz ID atandı</span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="p-3">Otomatik İç ID</th>
                    <th className="p-3">Üretici Seri No</th>
                    <th className="p-3">Cihaz Modeli</th>
                    <th className="p-3">Garanti Bitiş</th>
                    <th className="p-3">Durum</th>
                    <th className="p-3 text-right">Yaşam Döngüsü</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {connectedSerials.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-400">
                        Cihaz seri numaraları atanıyor...
                      </td>
                    </tr>
                  ) : (
                    connectedSerials.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-extrabold text-indigo-700 bg-indigo-50/50">
                          {s.internalId}
                        </td>
                        <td className="p-3 font-mono font-semibold text-slate-900">
                          {s.serialNumber}
                        </td>
                        <td className="p-3 font-medium text-slate-800">
                          {s.productName}
                        </td>
                        <td className="p-3 font-mono text-slate-500">
                          {s.warrantyEndDate || '-'}
                        </td>
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
                            onClick={() => {
                              onClose();
                              onOpenSerial(s.id);
                            }}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                          >
                            Cihaz Detayı →
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sale Items Table */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Faturalandırılan Ürün Kalemleri
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
                <tbody className="divide-y divide-slate-100">
                  {sale.items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3 text-slate-400 font-mono text-center">{idx + 1}</td>
                      <td className="p-3 font-semibold text-slate-900">{it.productName}</td>
                      <td className="p-3 text-center font-bold tabular-nums">{it.quantity} Adet</td>
                      <td className="p-3 text-right tabular-nums font-mono">
                        {it.unitPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                      </td>
                      <td className="p-3 text-right font-bold tabular-nums text-slate-900 font-mono">
                        {it.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
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
