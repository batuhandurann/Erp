import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, Users, Check, X, UserCheck } from 'lucide-react';
import { ROLE_PERMISSIONS, RoleName } from '../../types/rbac';

export const UsersView: React.FC = () => {
  const { users, currentUser, switchUser } = useApp();

  const permissionMatrix: { category: string; permissions: { key: string; label: string }[] }[] = [
    {
      category: 'Teklif Yönetimi',
      permissions: [
        { key: 'quote.create', label: 'Teklif Oluşturma (TKL)' },
        { key: 'quote.update', label: 'Teklif Düzenleme' },
        { key: 'quote.send', label: 'Müşteriye Gönderme' },
        { key: 'quote.accept', label: 'Teklifi Onaylama' },
        { key: 'quote.convert', label: 'Tekliften Proforma / Sözleşme Türetme' }
      ]
    },
    {
      category: 'Proforma & Sözleşme',
      permissions: [
        { key: 'proforma.create', label: 'Proforma Fatura Üretme (PRO)' },
        { key: 'contract.create', label: 'Satış Sözleşmesi Hazırlama (SOZ)' },
        { key: 'contract.sign', label: 'Sözleşme İmzalama / Yürürlüğe Alma' }
      ]
    },
    {
      category: 'Satış & Ürün Seri No',
      permissions: [
        { key: 'sale.create', label: 'Satış Faturası Kesme (SAT)' },
        { key: 'serial.create', label: 'Otomatik PRD Cihaz ID Üretme' },
        { key: 'serial.updateStatus', label: 'Yaşam Döngüsü Değiştirme' },
        { key: 'serial.service', label: 'Arıza & Servis Kaydı Açma' }
      ]
    },
    {
      category: 'Müşteri & Ürün Kataloğu',
      permissions: [
        { key: 'customer.create', label: 'Yeni Müşteri Portföyü Ekleme' },
        { key: 'product.create', label: 'Kataloğa Yeni Donanım Ekleme' }
      ]
    },
    {
      category: 'Finans & Yönetim',
      permissions: [
        { key: 'payment.create', label: 'Tahsilat / Ödeme Girişi' },
        { key: 'audit.read', label: 'Audit Loglarını Denetleme' },
        { key: 'settings.update', label: 'Şirket ve Numaratör Ayarları' }
      ]
    }
  ];

  const roleColumns: { role: RoleName; label: string }[] = [
    { role: 'SUPER_ADMIN', label: 'Super Admin' },
    { role: 'ADMIN', label: 'Admin' },
    { role: 'SALES', label: 'Satış' },
    { role: 'FINANCE', label: 'Finans' },
    { role: 'OPERATIONS', label: 'Teknik / Op' },
    { role: 'VIEWER', label: 'Görüntüleme' }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-indigo-600" />
          <span>Kullanıcılar & Rol Tabanlı Yetki Matrisi (RBAC)</span>
        </h2>
        <p className="text-xs text-slate-500">
          Sistemde tanımlı kullanıcılar ve rollere ait granüler erişim yetkileri
        </p>
      </div>

      {/* Users Directory */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Kullanıcı Listesi</span>
          <span className="text-xs text-slate-400">Aktif Kullanıcıyı Seçerek Rolü Canlı Deneyin</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="p-3.5">Ad Soyad</th>
                <th className="p-3.5">Unvan</th>
                <th className="p-3.5">Departman</th>
                <th className="p-3.5">E-Posta</th>
                <th className="p-3.5">Rol</th>
                <th className="p-3.5 text-right">Canlı Test Et</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => {
                const isCurrent = u.id === currentUser.id;
                return (
                  <tr key={u.id} className={`hover:bg-slate-50/60 transition-colors ${isCurrent ? 'bg-indigo-50/30' : ''}`}>
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                        {u.name[0]}
                      </div>
                      <span>{u.name}</span>
                      {isCurrent && <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">● Aktif</span>}
                    </td>
                    <td className="p-3.5 text-slate-700">{u.title}</td>
                    <td className="p-3.5 text-slate-600">{u.department}</td>
                    <td className="p-3.5 font-mono text-slate-500">{u.email}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {!isCurrent && (
                        <button
                          onClick={() => switchUser(u)}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-white hover:bg-indigo-600 border border-indigo-200 rounded-lg transition-colors"
                        >
                          Bu Role Geç
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC Granular Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Granüler Yetkilendirme Matrisi
          </h3>
          <p className="text-[11px] text-slate-500">
            Frontend buton kısıtları ve backend API seviyesinde uygulanan yetki kuralları
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-3.5 w-72">Modül & Yetki Tanımı</th>
                {roleColumns.map(rc => (
                  <th key={rc.role} className="p-3.5 text-center">{rc.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {permissionMatrix.map(grp => (
                <React.Fragment key={grp.category}>
                  <tr className="bg-slate-50 font-bold text-slate-800">
                    <td colSpan={7} className="p-2.5 px-3.5 text-[11px] uppercase tracking-wider bg-slate-100/70">
                      {grp.category}
                    </td>
                  </tr>
                  {grp.permissions.map(perm => (
                    <tr key={perm.key} className="hover:bg-slate-50/50">
                      <td className="p-3 font-medium text-slate-900">
                        <div>{perm.label}</div>
                        <div className="font-mono text-[10px] text-slate-400">{perm.key}</div>
                      </td>
                      {roleColumns.map(rc => {
                        const allowed = (ROLE_PERMISSIONS[rc.role] as any).includes(perm.key);
                        return (
                          <td key={rc.role} className="p-3 text-center">
                            {allowed ? (
                              <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                            ) : (
                              <X className="w-4 h-4 text-slate-300 mx-auto" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
