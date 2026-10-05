import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AlertTriangle,
  Clock,
  DollarSign,
  Building2,
  Copy,
  Check,
  Download,
  Send,
  ShieldAlert,
  Calendar,
  X
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

interface AgingRow {
  customerId: string;
  customerCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  totalDue: number;
  current0_30: number;
  overdue31_60: number;
  overdue61_90: number;
  overdue90Plus: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  oldestInvoiceNo?: string;
  daysOverdue: number;
}

export const AgingReportView: React.FC = () => {
  const { customers, sales, payments, companySettings } = useApp();
  const [selectedReminderRow, setSelectedReminderRow] = useState<AgingRow | null>(null);
  const [copied, setCopied] = useState(false);

  // Compute aging buckets per customer
  const agingData: AgingRow[] = customers.map(cust => {
    const custSales = sales.filter(s => s.customerId === cust.id);
    const custPayments = payments.filter(p => p.customerId === cust.id);

    const totalInvoiced = custSales.reduce((acc, s) => acc + s.grandTotal, 0);
    const totalPaid = custPayments.reduce((acc, p) => acc + p.amount, 0);
    const totalDue = Math.max(0, totalInvoiced - totalPaid);

    // Calculate age of open invoices based on issue date + 30 days default payment terms
    let current0_30 = 0;
    let overdue31_60 = 0;
    let overdue61_90 = 0;
    let overdue90Plus = 0;
    let maxDaysOverdue = 0;
    let oldestInvoice = '';

    if (totalDue > 0) {
      custSales.forEach(s => {
        const invoiceDate = new Date(s.date).getTime();
        const now = Date.now();
        const ageDays = Math.max(0, Math.floor((now - invoiceDate) / (1000 * 60 * 60 * 24)));

        if (ageDays > maxDaysOverdue) {
          maxDaysOverdue = ageDays;
          oldestInvoice = s.invoiceNumber;
        }

        const invoiceRemaining = Math.max(0, s.grandTotal - (s.paidAmount || 0));

        if (ageDays <= 30) {
          current0_30 += invoiceRemaining;
        } else if (ageDays <= 60) {
          overdue31_60 += invoiceRemaining;
        } else if (ageDays <= 90) {
          overdue61_90 += invoiceRemaining;
        } else {
          overdue90Plus += invoiceRemaining;
        }
      });
    }

    // Default simulation for sample customers if zero balance to demonstrate real enterprise data
    if (totalDue === 0 && custSales.length > 0) {
      current0_30 = 0;
    }

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (overdue90Plus > 0) {
      riskLevel = 'HIGH';
    } else if (overdue61_90 > 0 || overdue31_60 > 100000) {
      riskLevel = 'MEDIUM';
    }

    return {
      customerId: cust.id,
      customerCode: cust.code,
      customerName: cust.name,
      customerPhone: cust.phone || '',
      customerEmail: cust.email || '',
      totalDue,
      current0_30,
      overdue31_60,
      overdue61_90,
      overdue90Plus,
      riskLevel,
      oldestInvoiceNo: oldestInvoice || 'FAT-2026-001',
      daysOverdue: Math.max(0, maxDaysOverdue - 30)
    };
  }).filter(r => r.totalDue > 0);

  const totalOutstanding = agingData.reduce((acc, r) => acc + r.totalDue, 0);
  const totalOverdue = agingData.reduce((acc, r) => acc + r.overdue31_60 + r.overdue61_90 + r.overdue90Plus, 0);
  const totalCritical = agingData.reduce((acc, r) => acc + r.overdue90Plus, 0);

  const handleExportCSV = () => {
    const headers = [
      'Müşteri Kodu',
      'Müşteri Adı',
      'Toplam Bakiye',
      '0-30 Gün (Normal)',
      '31-60 Gün (Gecikmiş)',
      '61-90 Gün (Kritik)',
      '90+ Gün (Şüpheli)',
      'Risk Seviyesi'
    ];
    const rows = agingData.map(r => [
      r.customerCode,
      r.customerName,
      r.totalDue,
      r.current0_30,
      r.overdue31_60,
      r.overdue61_90,
      r.overdue90Plus,
      r.riskLevel
    ]);
    exportToCSV('Alacak_Yaslandirma_Raporu', headers, rows);
  };

  const generateReminderText = (row: AgingRow) => {
    return `Sayın ${row.customerName} Yetkilisi,

${companySettings.companyName} bünyesindeki cari hesabınız incelendiğinde; ${row.oldestInvoiceNo} referans numaralı faturanızın vadesinin ${row.daysOverdue > 0 ? `${row.daysOverdue} gün` : 'bir süre'} önce dolduğu ve toplam ${row.totalDue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺ açık bakiyenizin bulunduğu tespit edilmiştir.

Hizmetlerimizde herhangi bir aksama yaşanmaması ve cari mutabakatımızın tamamlanabilmesi için ödemenin aşağıda belirtilen şirket hesabımıza ivedilikle iletilmesini rica ederiz.

Banka: ${companySettings.bankName}
IBAN: ${companySettings.iban}
Hesap Sahibi: ${companySettings.commercialTitle}

Saygılarımızla,
${companySettings.companyName} Finans & Muhasebe Departmanı`;
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Toplam Açık Alacak Portföyü</span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-2 font-mono">
            {totalOutstanding.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {agingData.length} kurumsal cari hesapta açık bakiye
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-amber-700 flex items-center justify-between">
            <span>Vadesi Geçmiş Alacaklar (30+ Gün)</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-800 mt-2 font-mono">
            {totalOverdue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
          </div>
          <div className="text-[11px] text-amber-700 mt-1">
            Toplam açık bakiyenin %{totalOutstanding > 0 ? ((totalOverdue / totalOutstanding) * 100).toFixed(1) : 0}'i
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-rose-700 flex items-center justify-between">
            <span>Kritik / Şüpheli Alacak (90+ Gün)</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-black text-rose-900 mt-2 font-mono">
            {totalCritical.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
          </div>
          <div className="text-[11px] text-rose-600 mt-1">
            Acil tahsilat ve hukuki takip adımı önerilir
          </div>
        </div>
      </div>

      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Vade Yaşlandırma Tablosu (Accounts Receivable Aging)</span>
          </h3>
          <p className="text-xs text-slate-500">
            Faturaların kesiliş tarihinden itibaren geçen gün sayısına göre dilimlenmiş alacak tablosu
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Yaşlandırma Raporunu İndir (Excel/CSV)</span>
        </button>
      </div>

      {/* Aging Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                <th className="p-3.5">Müşteri</th>
                <th className="p-3.5 text-right">Toplam Bakiye</th>
                <th className="p-3.5 text-right text-emerald-700">0 - 30 Gün (Vadesi Gelmemiş)</th>
                <th className="p-3.5 text-right text-amber-700">31 - 60 Gün (1. Vade)</th>
                <th className="p-3.5 text-right text-orange-700">61 - 90 Gün (2. Vade)</th>
                <th className="p-3.5 text-right text-rose-700">90+ Gün (Kritik)</th>
                <th className="p-3.5 text-center">Risk</th>
                <th className="p-3.5 text-right">Eylem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {agingData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400">
                    Açık veya gecikmiş bakiyeli müşteri kaydı bulunamadı.
                  </td>
                </tr>
              ) : (
                agingData.map(row => (
                  <tr key={row.customerId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900">{row.customerName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{row.customerCode}</div>
                    </td>
                    <td className="p-3.5 text-right font-black font-mono text-slate-900">
                      {row.totalDue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </td>
                    <td className="p-3.5 text-right font-mono text-slate-600">
                      {row.current0_30 > 0 ? `${row.current0_30.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺` : '-'}
                    </td>
                    <td className="p-3.5 text-right font-mono font-medium text-amber-800">
                      {row.overdue31_60 > 0 ? `${row.overdue31_60.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺` : '-'}
                    </td>
                    <td className="p-3.5 text-right font-mono font-medium text-orange-800">
                      {row.overdue61_90 > 0 ? `${row.overdue61_90.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺` : '-'}
                    </td>
                    <td className="p-3.5 text-right font-mono font-black text-rose-600">
                      {row.overdue90Plus > 0 ? `${row.overdue90Plus.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺` : '-'}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          row.riskLevel === 'HIGH'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : row.riskLevel === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {row.riskLevel === 'HIGH' ? 'Yüksek Risk' : row.riskLevel === 'MEDIUM' ? 'Orta Risk' : 'Normal'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedReminderRow(row)}
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5 ml-auto"
                        title="Ödeme Hatırlatma Metni Hazırla"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Hatırlatma Üret</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Reminder Generator Modal */}
      {selectedReminderRow && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-indigo-400" />
                  <span>Ödeme Hatırlatma Şablonu</span>
                </h4>
                <p className="text-[11px] text-slate-400">{selectedReminderRow.customerName}</p>
              </div>
              <button
                onClick={() => setSelectedReminderRow(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex justify-between">
                <span className="text-slate-600 font-medium">Toplam Açık Tutar:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {selectedReminderRow.totalDue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Hazırlanan Resmi Hatırlatma Metni (E-posta / WhatsApp / SMS):
                </label>
                <textarea
                  readOnly
                  rows={9}
                  value={generateReminderText(selectedReminderRow)}
                  className="w-full text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-sans text-slate-800 leading-relaxed outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedReminderRow(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Kapat
                </button>
                <button
                  onClick={() => handleCopyText(generateReminderText(selectedReminderRow))}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Panoya Kopyalandı!' : 'Metni Kopyala'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
