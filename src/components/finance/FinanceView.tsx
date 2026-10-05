import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Wallet, Search, Plus, DollarSign, Building2, CreditCard, ArrowDownRight, CheckCircle2, X, Clock, FileSpreadsheet } from 'lucide-react';
import { Payment } from '../../types';
import { AgingReportView } from './AgingReportView';

export const FinanceView: React.FC = () => {
  const { payments, recordPayment, customers, proformas, currentUser } = useApp();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'payments' | 'aging'>('payments');

  // New payment form
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [amount, setAmount] = useState<number>(50000);
  const [paymentMethod, setPaymentMethod] = useState<Payment['paymentMethod']>('HAVALE/EFT');
  const [referenceNo, setReferenceNo] = useState('');
  const [notes, setNotes] = useState('Banka transferi ile cari hesap tahsilatı');

  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);

  const filtered = payments.filter(p =>
    p.customerName.toLowerCase().includes(search.toLowerCase()) ||
    p.paymentNumber.toLowerCase().includes(search.toLowerCase()) ||
    p.referenceNo.toLowerCase().includes(search.toLowerCase())
  );

  const handleRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === selectedCustomerId) || customers[0];
    if (!cust || amount <= 0) return;

    recordPayment({
      customerId: cust.id,
      customerName: cust.name,
      amount,
      currency: 'TRY',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod,
      referenceNo: referenceNo || `REF-${Date.now().toString().slice(-6)}`,
      recordedBy: currentUser.name,
      notes
    });

    setIsModalOpen(false);
    setAmount(0);
    setReferenceNo('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="w-5 h-5 text-indigo-600" />
            <span>Ödemeler, Kasa & Finans ({payments.length})</span>
          </h2>
          <p className="text-xs text-slate-500">
            Müşteri havale/EFT tahsilatları, proforma avansları ve banka hareket defteri
          </p>
        </div>

        {currentUser.role !== 'Sadece Görüntüleme' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tahsilat Girişi Yap</span>
          </button>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'payments'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Kasa & Tahsilat Defteri</span>
        </button>

        <button
          onClick={() => setActiveTab('aging')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'aging'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Alacak Yaşlandırma & Vade Takip Raporu (Aging)</span>
        </button>
      </div>

      {activeTab === 'aging' ? (
        <AgingReportView />
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Toplam Kayıtlı Tahsilat</div>
          <div className="text-2xl font-bold text-emerald-700 tabular-nums font-mono mt-2">
            {totalCollected.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
          </div>
          <div className="text-xs text-slate-400 mt-1">{payments.length} adet banka ve kasa işlemi</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Ana Banka Hesabı</div>
          <div className="text-sm font-bold text-slate-900 mt-2">Garanti BBVA - Kurumsal</div>
          <div className="text-xs font-mono text-slate-500 mt-1">TR32 0006 2000 0001 2345 6789 01</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Tahsilat Yöntem Dağılımı</div>
          <div className="text-xs text-slate-700 space-y-1 mt-2">
            <div className="flex justify-between">
              <span>Banka Havale / EFT:</span>
              <span className="font-bold">95%</span>
            </div>
            <div className="flex justify-between">
              <span>Kurumsal Çek:</span>
              <span className="font-bold">5%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Makbuz No (OD-), Referans veya Müşteri Ara..."
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="p-3.5">Tahsilat No</th>
                <th className="p-3.5">Müşteri</th>
                <th className="p-3.5">Tarih</th>
                <th className="p-3.5">Ödeme Yöntemi</th>
                <th className="p-3.5">Banka Referans / Dekont</th>
                <th className="p-3.5 text-right">Tahsil Edilen Tutar</th>
                <th className="p-3.5">Kayıt Eden</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-slate-900">{p.paymentNumber}</td>
                  <td className="p-3.5 font-semibold text-slate-900">{p.customerName}</td>
                  <td className="p-3.5 font-mono text-slate-600">{p.paymentDate}</td>
                  <td className="p-3.5 font-medium text-slate-700">{p.paymentMethod}</td>
                  <td className="p-3.5 font-mono text-slate-600">{p.referenceNo}</td>
                  <td className="p-3.5 text-right font-black tabular-nums font-mono text-emerald-700">
                    +{p.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                  </td>
                  <td className="p-3.5 text-slate-500 text-[11px]">{p.recordedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* Modal for recording payment */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Yeni Tahsilat Kaydı</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecord} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Müşteri Seçin *</label>
                <select
                  value={selectedCustomerId}
                  onChange={e => setSelectedCustomerId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 font-semibold"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Tahsilat Tutarı (₺) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Ödeme Yöntemi</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  >
                    <option value="HAVALE/EFT">Banka Havale / EFT</option>
                    <option value="KREDI_KARTI">Kredi Kartı / Mail Order</option>
                    <option value="CEK">Müşteri Çeki</option>
                    <option value="NAKIT">Kasa Nakit</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Banka Referans / Dekont No</label>
                <input
                  type="text"
                  placeholder="Örn: GR-892180491"
                  value={referenceNo}
                  onChange={e => setReferenceNo(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Açıklama / Not</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Tahsilatı Onayla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
