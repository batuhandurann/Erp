import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Search,
  Plus,
  Building2,
  Phone,
  Mail,
  ArrowRight,
  ShieldCheck,
  X,
  Download
} from 'lucide-react';
import { Customer } from '../../types';
import { exportToCSV } from '../../utils/exportUtils';

interface CustomerListViewProps {
  onOpenDetailModal: (id: string) => void;
}

export const CustomerListView: React.FC<CustomerListViewProps> = ({ onOpenDetailModal }) => {
  const { customers, addCustomer, currentUser } = useApp();
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [taxOffice, setTaxOffice] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('İstanbul');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactTitle, setContactTitle] = useState('');
  const [industry, setIndustry] = useState('Bilişim & Yazılım');

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.taxNumber.includes(search)
  );

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCustomer({
      name,
      taxNumber,
      taxOffice,
      address,
      city,
      phone,
      email,
      industry,
      creditLimit: 5000000,
      contacts: [
        {
          name: contactName || 'Firma Temsilcisi',
          title: contactTitle || 'Satın Alma Sorumlusu',
          email,
          phone,
          isPrimary: true
        }
      ]
    });

    setIsCreateOpen(false);
    setName('');
    setTaxNumber('');
    setTaxOffice('');
    setAddress('');
    setPhone('');
    setEmail('');
    setContactName('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>Müşteri Portföyü & CRM ({customers.length})</span>
          </h2>
          <p className="text-xs text-slate-500">
            Kurumsal firma kayıtları, vergi künyeleri ve müşteri 360 bağlantıları
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const headers = ['Müşteri Kodu', 'Firma Adı', 'Vergi No', 'Vergi Dairesi', 'Sektör', 'Telefon', 'E-Posta', 'Şehir'];
              const rows = filtered.map(c => [
                c.code,
                c.name,
                c.taxNumber,
                c.taxOffice,
                c.industry || '',
                c.phone || '',
                c.email || '',
                c.city || ''
              ]);
              exportToCSV('Musteri_Listesi', headers, rows);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-colors"
            title="Excel uyumlu CSV formatında indir"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Excel / CSV</span>
          </button>

          {currentUser.role !== 'Sadece Görüntüleme' && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Müşteri Tanımla</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Firma Adı, Müşteri Kodu (CST-) veya Vergi No Ara..."
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="p-3.5">Müşteri Kodu</th>
                <th className="p-3.5">Firma Unvanı</th>
                <th className="p-3.5">Vergi Dairesi & No</th>
                <th className="p-3.5">İletişim Yetkilisi</th>
                <th className="p-3.5">Telefon / E-Posta</th>
                <th className="p-3.5">Sektör</th>
                <th className="p-3.5 text-right">360 Kartı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Arama kriterine uygun müşteri bulunamadı.
                  </td>
                </tr>
              ) : (
                filtered.map(customer => (
                  <tr key={customer.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-indigo-700">
                      {customer.code}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{customer.name}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">{customer.address}</div>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-700">
                      <div>{customer.taxOffice}</div>
                      <div className="text-slate-400">{customer.taxNumber}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800">
                        {customer.contacts[0]?.name || '-'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {customer.contacts[0]?.title}
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-600 text-[11px]">
                      <div>{customer.phone}</div>
                      <div className="text-slate-400">{customer.email}</div>
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {customer.industry || 'Bilişim'}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => onOpenDetailModal(customer.id)}
                        className="px-3 py-1.5 text-xs font-bold text-indigo-600 hover:text-white hover:bg-indigo-600 border border-indigo-200 hover:border-indigo-600 rounded-lg transition-colors"
                      >
                        Müşteri 360 →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Customer Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Yeni Kurumsal Müşteri Kaydı</h3>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Firma Resmi Unvanı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: ABC Teknoloji San. ve Tic. A.Ş."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Vergi Dairesi</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Maslak V.D."
                    value={taxOffice}
                    onChange={e => setTaxOffice(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Vergi Numarası</label>
                  <input
                    type="text"
                    required
                    placeholder="10 Haneli VKN"
                    value={taxNumber}
                    onChange={e => setTaxNumber(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Adres</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Cadde, Sokak, Kapı No, İlçe, İl"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Telefon</label>
                  <input
                    type="text"
                    placeholder="+90 (212) 000 00 00"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">E-Posta</label>
                  <input
                    type="email"
                    placeholder="info@sirket.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">İrtibat Yetkilisi Adı</label>
                  <input
                    type="text"
                    placeholder="Örn: Ahmet Yılmaz"
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Yetkili Unvanı</label>
                  <input
                    type="text"
                    placeholder="Örn: BT Direktörü"
                    value={contactTitle}
                    onChange={e => setContactTitle(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Müşteriyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
