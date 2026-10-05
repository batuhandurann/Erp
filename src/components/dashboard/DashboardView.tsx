import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileSpreadsheet,
  FileCheck2,
  FileText,
  ShoppingBag,
  TrendingUp,
  Cpu,
  Clock,
  ArrowRight,
  ShieldCheck,
  Plus,
  AlertCircle,
  CheckCircle2,
  Wrench,
  DollarSign,
  Users,
  Award,
  Zap,
  Filter
} from 'lucide-react';
import { OnboardingGuide } from '../common/OnboardingGuide';

interface DashboardViewProps {
  onOpenNewQuote: () => void;
  onOpenQuoteDetail: (id: string) => void;
  onOpenProformaDetail: (id: string) => void;
  onOpenContractDetail: (id: string) => void;
  onOpenSerialDetail: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewQuote,
  onOpenQuoteDetail,
  onOpenProformaDetail,
  onOpenContractDetail,
  onOpenSerialDetail
}) => {
  const {
    quotes,
    proformas,
    contracts,
    sales,
    productSerials,
    customers,
    payments,
    setActiveView,
    convertQuoteToProforma,
    currentUser,
    auditLogs
  } = useApp();

  const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'year'>('month');

  // Metrics
  const totalSalesRevenue = sales.reduce((acc, s) => acc + s.grandTotal, 0);
  const pendingQuotesVolume = quotes
    .filter(q => q.status === 'SENT' || q.status === 'ACCEPTED' || q.status === 'VIEWED')
    .reduce((acc, q) => acc + q.grandTotal, 0);
  
  const pendingReceivables = proformas
    .filter(p => p.remainingAmount > 0)
    .reduce((acc, p) => acc + p.remainingAmount, 0);

  const activeWarrantyProducts = productSerials.filter(s => s.status === 'ACTIVE' || s.status === 'DELIVERED').length;
  const inServiceProducts = productSerials.filter(s => s.status === 'SERVICE').length;
  
  const expiringWarrantyCount = productSerials.filter(s => {
    if (!s.warrantyEndDate) return false;
    const end = new Date(s.warrantyEndDate).getTime();
    const now = Date.now();
    const diffDays = Math.ceil((end - now) / (1000 * 3600 * 24));
    return diffDays > 0 && diffDays <= 60;
  }).length;

  const quoteConversionRate = quotes.length > 0
    ? Math.round((quotes.filter(q => q.status === 'CONVERTED' || q.status === 'ACCEPTED').length / quotes.length) * 100)
    : 0;

  // Accepted quotes awaiting conversion
  const acceptedQuotesAwaitingAction = quotes.filter(q => q.status === 'ACCEPTED');

  // Customer rankings
  const customerRevenues: Record<string, { total: number; quotes: number }> = {};
  sales.forEach(s => {
    if (!customerRevenues[s.customerName]) {
      customerRevenues[s.customerName] = { total: 0, quotes: 0 };
    }
    customerRevenues[s.customerName].total += s.grandTotal;
  });
  quotes.forEach(q => {
    if (customerRevenues[q.customerName]) {
      customerRevenues[q.customerName].quotes++;
    }
  });

  const sortedCustomers = Object.entries(customerRevenues).sort((a, b) => b[1].total - a[1].total);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Onboarding Guide Component */}
      <OnboardingGuide onOpenNewQuote={onOpenNewQuote} />

      {/* Top Welcome & KPI Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-400">
              BusinessFlow B2B Satış & Donanım Takip Platformu
            </span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono font-semibold">
              v1.0 Kurumsal
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Günaydın, {currentUser.name}
          </h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Tekliften proformaya, sözleşmeden otomatik seri numaralı ürün yaşam döngüsü takibine kadar operasyonel durum özeti:
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Timeframe pill selector */}
          <div className="bg-slate-800/90 p-1 rounded-xl border border-slate-700/60 flex items-center gap-1 text-xs">
            <button
              onClick={() => setTimeframe('month')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                timeframe === 'month' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Bu Ay
            </button>
            <button
              onClick={() => setTimeframe('quarter')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                timeframe === 'quarter' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Bu Çeyrek
            </button>
            <button
              onClick={() => setTimeframe('year')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                timeframe === 'year' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Yıllık
            </button>
          </div>

          {currentUser.role !== 'Sadece Görüntüleme' && (
            <button
              onClick={onOpenNewQuote}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-2xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Teklif Hazırla</span>
            </button>
          )}
        </div>
      </div>

      {/* 6 Core KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Metric 1: Total Sales */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Kümülatif Satış</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900 tabular-nums font-mono">
              {totalSalesRevenue.toLocaleString('tr-TR')} ₺
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-1">
              {sales.length} adet onaylı satış
            </div>
          </div>
        </div>

        {/* Metric 2: Pending Quotes */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Açık Teklif Hacmi</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900 tabular-nums font-mono">
              {pendingQuotesVolume.toLocaleString('tr-TR')} ₺
            </div>
            <div className="text-[10px] text-amber-600 font-semibold mt-1">
              {quotes.filter(q => q.status === 'SENT' || q.status === 'ACCEPTED').length} teklif masada
            </div>
          </div>
        </div>

        {/* Metric 3: Conversion Rate */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Kazanma Oranı</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-indigo-700 tabular-nums font-mono">
              %{quoteConversionRate}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Teklif $\rightarrow$ Proforma / Satış
            </div>
          </div>
        </div>

        {/* Metric 4: Outstanding Receivables */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Bekleyen Tahsilat</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900 tabular-nums font-mono">
              {pendingReceivables.toLocaleString('tr-TR')} ₺
            </div>
            <div className="text-[10px] text-blue-600 font-semibold mt-1">
              {proformas.filter(p => p.remainingAmount > 0).length} açık proforma
            </div>
          </div>
        </div>

        {/* Metric 5: Active Customers */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Aktif Müşteriler</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900 tabular-nums font-mono">
              {customers.length} Firma
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Kurumsal portföy
            </div>
          </div>
        </div>

        {/* Metric 6: Tracked Hardware Devices */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">İzlenen PRD Cihaz</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Cpu className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-indigo-700 tabular-nums font-mono">
              {productSerials.length} Donanım
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5">
              <span>{activeWarrantyProducts} aktif</span>
              {inServiceProducts > 0 && <span className="text-rose-600 font-bold">· {inServiceProducts} serviste</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Smart Next-Step Actions Hub (Section 9) */}
      {acceptedQuotesAwaitingAction.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-amber-500 text-white flex items-center justify-center">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                Akıllı İşlem Önerileri (Bekleyen Onaylar)
              </h3>
            </div>
            <span className="text-xs font-semibold text-amber-800">
              {acceptedQuotesAwaitingAction.length} Teklif Müşteri Tarafından Kabul Edildi
            </span>
          </div>

          <div className="divide-y divide-amber-200/60">
            {acceptedQuotesAwaitingAction.map(quote => (
              <div key={quote.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-amber-200">
                      {quote.quoteNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{quote.customerName}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    {quote.items.length} Kalem Donanım · Tutar: <strong className="text-slate-900 tabular-nums">{quote.grandTotal.toLocaleString('tr-TR')} ₺</strong> · Vade: {quote.paymentTerms}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onOpenQuoteDetail(quote.id)}
                    className="px-3 py-1.5 text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors font-medium"
                  >
                    Detay
                  </button>
                  {currentUser.role !== 'Sadece Görüntüleme' && (
                    <button
                      onClick={() => {
                        const newProf = convertQuoteToProforma(quote.id);
                        if (newProf) onOpenProformaDetail(newProf.id);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>1 Tıkla Proforma Oluştur →</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Pipeline, Tables and Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Pipeline & Recent Quotes */}
        <div className="lg:col-span-2 space-y-6">
          {/* End-to-End Visual Workflow Pipeline */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Uçtan Uca Satış & Donanım Yaşam Döngüsü
                </h3>
                <p className="text-[11px] text-slate-500">Müşteriden tahsilata ve satış sonrası cihaz takibine veri akışı</p>
              </div>
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                Otomatik Senkronize
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/70 space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase">1. Teklif</div>
                <div className="font-mono text-xs font-extrabold text-slate-900">TKL-2026</div>
                <div className="text-[10px] text-slate-500">{quotes.length} Kayıt</div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/70 space-y-1">
                <div className="text-[10px] font-bold text-emerald-700 uppercase">2. Onay</div>
                <div className="text-xs font-extrabold text-emerald-700">ACCEPTED</div>
                <div className="text-[10px] text-slate-500">{acceptedQuotesAwaitingAction.length} Bekleyen</div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/70 space-y-1">
                <div className="text-[10px] font-bold text-blue-700 uppercase">3. Proforma</div>
                <div className="font-mono text-xs font-extrabold text-blue-700">PRO-2026</div>
                <div className="text-[10px] text-slate-500">{proformas.length} Düzenlendi</div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/70 space-y-1">
                <div className="text-[10px] font-bold text-purple-700 uppercase">4. Sözleşme</div>
                <div className="font-mono text-xs font-extrabold text-purple-700">SOZ-2026</div>
                <div className="text-[10px] text-slate-500">{contracts.length} İmzalı</div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/70 space-y-1">
                <div className="text-[10px] font-bold text-emerald-700 uppercase">5. Satış</div>
                <div className="font-mono text-xs font-extrabold text-slate-900">SAT-2026</div>
                <div className="text-[10px] text-slate-500">{sales.length} Fatura</div>
              </div>

              <div className="p-3 rounded-xl border border-indigo-200 bg-indigo-50/70 space-y-1">
                <div className="text-[10px] font-bold text-indigo-700 uppercase">6. Cihaz Takip</div>
                <div className="font-mono text-xs font-extrabold text-indigo-900">PRD-2026</div>
                <div className="text-[10px] text-indigo-700 font-semibold">{productSerials.length} Cihaz</div>
              </div>
            </div>
          </div>

          {/* Recent Quotes Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Son Teklifler & Durumlar</h3>
                <p className="text-[11px] text-slate-500">Müşterilere sunulan güncel teklif kayıtları</p>
              </div>
              <button
                onClick={() => setActiveView('quotes')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>Tümünü Gör</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                    <th className="p-3 font-semibold">Teklif No</th>
                    <th className="p-3 font-semibold">Müşteri</th>
                    <th className="p-3 font-semibold text-right">Tutar</th>
                    <th className="p-3 font-semibold">Geçerlilik</th>
                    <th className="p-3 font-semibold">Durum</th>
                    <th className="p-3 font-semibold text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quotes.slice(0, 5).map(q => (
                    <tr key={q.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900">{q.quoteNumber}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{q.customerName}</div>
                        <div className="text-[10px] text-slate-400">{q.contactPerson}</div>
                      </td>
                      <td className="p-3 text-right font-bold tabular-nums text-slate-900">
                        {q.grandTotal.toLocaleString('tr-TR')} ₺
                      </td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">{q.validUntil}</td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          q.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' :
                          q.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                          q.status === 'CONVERTED' ? 'bg-purple-100 text-purple-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => onOpenQuoteDetail(q.id)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
                        >
                          Detay
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Rankings & Warranty Alarms */}
        <div className="space-y-6">
          {/* Top Valued Clients */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>En Değerli Müşteriler</span>
              </h3>
              <span className="text-[10px] text-slate-400">Ciro Bazlı</span>
            </div>

            <div className="space-y-3">
              {sortedCustomers.slice(0, 4).map(([custName, meta], idx) => (
                <div key={custName} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-900 truncate max-w-[180px]">{idx + 1}. {custName}</span>
                    <span className="text-indigo-700 font-mono tabular-nums font-bold">
                      {meta.total.toLocaleString('tr-TR')} ₺
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Açık teklif: {meta.quotes} adet
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warranty & Maintenance Alerts */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Garanti & Servis Monitörü</span>
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Canlı İzleme
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-600">Garantisi Aktif Donanım:</span>
                <span className="font-bold text-emerald-700 font-mono tabular-nums">{activeWarrantyProducts} Cihaz</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-600">Serviste / Parça Değişiminde:</span>
                <span className="font-bold text-rose-600 font-mono tabular-nums">{inServiceProducts} Cihaz</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-600">60 Gün İçinde Dolacak:</span>
                <span className="font-bold text-amber-600 font-mono tabular-nums">{expiringWarrantyCount} Cihaz</span>
              </div>
            </div>

            <button
              onClick={() => setActiveView('inventory')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200/70 text-slate-800 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1"
            >
              <span>Donanım Takip Merkezine Git</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Recent Activity Timeline Stream */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Son Sistem Hareketleri</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              {auditLogs.slice(0, 4).map(log => (
                <div key={log.id} className="pb-2 border-b border-slate-100 last:border-none space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="font-mono text-[10px] text-slate-400">{log.timestamp.split(' ')[1] || log.timestamp}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 line-clamp-1">{log.details}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{log.userName} ({log.userRole})</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
