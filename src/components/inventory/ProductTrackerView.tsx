import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Cpu,
  Search,
  Filter,
  ShieldCheck,
  Wrench,
  AlertTriangle,
  ArrowRight,
  Package
} from 'lucide-react';
import { ProductLifecycleStatus } from '../../types';

interface ProductTrackerViewProps {
  onOpenSerialDetail: (id: string) => void;
}

export const ProductTrackerView: React.FC<ProductTrackerViewProps> = ({ onOpenSerialDetail }) => {
  const { productSerials } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filtered = productSerials.filter(s => {
    const matchesSearch =
      s.internalId.toLowerCase().includes(search.toLowerCase()) ||
      s.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.productName.toLowerCase().includes(search.toLowerCase()) ||
      (s.customerName && s.customerName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: ProductLifecycleStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'SERVICE':
        return 'bg-rose-100 text-rose-800 border-rose-200 font-bold animate-pulse';
      case 'DELIVERED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SOLD':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'STOCK':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <span>Ürün & Seri No Yaşam Döngüsü Takibi ({productSerials.length})</span>
          </h2>
          <p className="text-xs text-slate-500">
            Satış sonrası donanımlara otomatik atanan benzersiz <span className="font-mono text-indigo-600">PRD-2026-XXXXXX</span> kimlikleri ve üretici seri numaraları
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="İç Kod (PRD-), Üretici Seri No (SN-), Model veya Müşteri Ara..."
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: 'Tümü' },
            { id: 'ACTIVE', label: 'Aktif' },
            { id: 'SERVICE', label: 'Serviste' },
            { id: 'DELIVERED', label: 'Teslim Edildi' },
            { id: 'SOLD', label: 'Satıldı' },
            { id: 'STOCK', label: 'Stokta' }
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === s.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="p-3.5">İç Takip ID</th>
                <th className="p-3.5">Üretici Seri No</th>
                <th className="p-3.5">Donanım / Ürün Modeli</th>
                <th className="p-3.5">Sahip Müşteri</th>
                <th className="p-3.5">Satış Faturası</th>
                <th className="p-3.5">Garanti Bitiş</th>
                <th className="p-3.5">Yaşam Durumu</th>
                <th className="p-3.5 text-right">Geçmiş / Servis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Arama kriterlerine uygun cihaz kaydı bulunamadı.
                  </td>
                </tr>
              ) : (
                filtered.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-mono font-extrabold text-indigo-700 bg-indigo-50/40">
                      {s.internalId}
                    </td>
                    <td className="p-3.5 font-mono font-semibold text-slate-800">
                      {s.serialNumber}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{s.productName}</div>
                      <div className="text-[10px] text-slate-400">{s.category} · {s.brand}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800">{s.customerName || 'Merkez Depo'}</div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600">
                      {s.saleNumber || '-'}
                    </td>
                    <td className="p-3.5 font-mono text-slate-600">
                      {s.warrantyEndDate || '-'}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(s.status)}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => onOpenSerialDetail(s.id)}
                        className="px-3 py-1 text-xs font-bold text-indigo-600 hover:text-white hover:bg-indigo-600 border border-indigo-200 hover:border-indigo-600 rounded-lg transition-colors"
                      >
                        Yaşam Döngüsü →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
