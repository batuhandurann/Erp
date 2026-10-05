import React from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart3, TrendingUp, DollarSign, Award, ShieldAlert, Printer } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { sales, quotes, proformas, productSerials, customers } = useApp();

  const totalSalesRevenue = sales.reduce((acc, s) => acc + s.grandTotal, 0);
  const totalQuotesRevenue = quotes.reduce((acc, q) => acc + q.grandTotal, 0);
  const conversionRate = quotes.length > 0
    ? Math.round((quotes.filter(q => q.status === 'CONVERTED' || q.status === 'ACCEPTED').length / quotes.length) * 100)
    : 0;

  // Customer sales aggregate
  const customerRevenues: Record<string, number> = {};
  sales.forEach(s => {
    customerRevenues[s.customerName] = (customerRevenues[s.customerName] || 0) + s.grandTotal;
  });

  const sortedCustomers = Object.entries(customerRevenues).sort((a, b) => b[1] - a[1]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <span>Raporlar & Yönetim Analitiği</span>
          </h2>
          <p className="text-xs text-slate-500">
            Dönüşüm oranları, müşteri ciro analizi ve donanım garanti projeksiyonları
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Raporu Yazdır / PDF</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Kümülatif Satış Hacmi</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums font-mono mt-2">
            {totalSalesRevenue.toLocaleString('tr-TR')} ₺
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">
            {sales.length} adet kesinleşmiş fatura
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Teklif Kazanma / Dönüşüm Oranı</div>
          <div className="text-2xl font-bold text-indigo-600 tabular-nums font-mono mt-2">
            %{conversionRate}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {quotes.filter(q => q.status === 'CONVERTED' || q.status === 'ACCEPTED').length} / {quotes.length} Teklif Kabul Edildi
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Sahada Aktif Çalışan Cihaz</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums font-mono mt-2">
            {productSerials.filter(s => s.status === 'ACTIVE').length} Cihaz
          </div>
          <div className="text-xs text-slate-500 mt-1">PRD takip kimliği atanmış envanter</div>
        </div>
      </div>

      {/* Grid: Customer Breakdown & Warranty Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Müşteri Bazlı Ciro Dağılımı</span>
            </h3>
            <span className="text-[11px] text-slate-400">En Değerli Portföy</span>
          </div>

          <div className="space-y-3">
            {sortedCustomers.map(([custName, rev], idx) => {
              const pct = totalSalesRevenue > 0 ? Math.round((rev / totalSalesRevenue) * 100) : 0;
              return (
                <div key={custName} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-800">{idx + 1}. {custName}</span>
                    <span className="font-bold tabular-nums font-mono text-slate-900">
                      {rev.toLocaleString('tr-TR')} ₺ (%{pct})
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hardware Status Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
              <span>Cihaz Yaşam Döngüsü & Garanti Dağılımı</span>
            </h3>
            <span className="text-[11px] text-slate-400">{productSerials.length} Cihaz</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-700">Müşteri Sisteminde Aktif & Garantili:</span>
              <span className="font-bold text-emerald-700 font-mono tabular-nums">
                {productSerials.filter(s => s.status === 'ACTIVE').length} Adet
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-700">Teslimatı Yapılan / Sevk Edilen:</span>
              <span className="font-bold text-blue-700 font-mono tabular-nums">
                {productSerials.filter(s => s.status === 'DELIVERED').length} Adet
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-700">Teknik Servis / Parça Değişiminde:</span>
              <span className="font-bold text-rose-600 font-mono tabular-nums">
                {productSerials.filter(s => s.status === 'SERVICE').length} Adet
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-700">Yeni Satılan (Hazırlık Aşamasında):</span>
              <span className="font-bold text-purple-700 font-mono tabular-nums">
                {productSerials.filter(s => s.status === 'SOLD').length} Adet
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
