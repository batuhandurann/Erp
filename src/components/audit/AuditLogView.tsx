import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { History, Search, Filter, UserCheck, Shield } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useApp();
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');

  const filtered = auditLogs.filter(log => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.entityCode.toLowerCase().includes(search.toLowerCase());

    const matchesEntity = entityFilter === 'ALL' || log.entityType === entityFilter;
    return matchesSearch && matchesEntity;
  });

  const entityTypes = [
    { id: 'ALL', label: 'Tümü' },
    { id: 'QUOTE', label: 'Teklif (TKL)' },
    { id: 'PROFORMA', label: 'Proforma (PRO)' },
    { id: 'CONTRACT', label: 'Sözleşme (SOZ)' },
    { id: 'SALE', label: 'Satış (SAT)' },
    { id: 'SERIAL', label: 'Cihaz Seri (PRD)' },
    { id: 'CUSTOMER', label: 'Müşteri (CRM)' },
    { id: 'SETTINGS', label: 'Sistem & Ayar' }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-600" />
          <span>Sistem Denetim Günlüğü (Audit Trail - {auditLogs.length})</span>
        </h2>
        <p className="text-xs text-slate-500">
          Uygulama genelinde gerçekleştirilen durum değişimleri, fiyat güncellemeleri ve operasyon logları
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Kullanıcı, Belge Kodu veya İşlem Ara..."
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {entityTypes.map(e => (
            <button
              key={e.id}
              onClick={() => setEntityFilter(e.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                entityFilter === e.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {e.label}
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
                <th className="p-3.5 w-40">Zaman Damgası</th>
                <th className="p-3.5 w-44">Kullanıcı & Rol</th>
                <th className="p-3.5 w-28">Varlık Türü</th>
                <th className="p-3.5 w-36">İlgili Belge / Kod</th>
                <th className="p-3.5 w-52">Eylem</th>
                <th className="p-3.5">İşlem Detayları & Açıklama</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filtered.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3.5 text-slate-500">{log.timestamp}</td>
                  <td className="p-3.5 font-sans">
                    <div className="font-semibold text-slate-900">{log.userName}</div>
                    <div className="text-[10px] text-slate-400">{log.userRole}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {log.entityType}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-indigo-700">{log.entityCode}</td>
                  <td className="p-3.5 font-sans font-bold text-slate-900">{log.action}</td>
                  <td className="p-3.5 font-sans text-slate-600 leading-relaxed">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
