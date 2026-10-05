import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Building2,
  Landmark,
  Hash,
  Save,
  CheckCircle2,
  RotateCcw,
  CreditCard,
  Download,
  Shield,
  FileSpreadsheet,
  Zap,
  Check
} from 'lucide-react';
import { CompanySettings, SubscriptionTier } from '../../types';

export const SettingsView: React.FC = () => {
  const {
    companySettings,
    updateCompanySettings,
    currentUser,
    resetToDefaults,
    customers,
    products,
    quotes,
    sales,
    productSerials,
    payments,
    auditLogs,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'company' | 'sequences' | 'subscription' | 'backup'>('company');
  const [formData, setFormData] = useState<CompanySettings>(companySettings);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>('PROFESSIONAL');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanySettings(formData);
    addToast({
      title: 'Ayarlar Kaydedildi',
      message: 'Firma künyesi ve numaratör parametreleri güncellendi.',
      type: 'success'
    });
  };

  const handleExportJSON = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      companySettings: formData,
      customers,
      products,
      quotes,
      sales,
      productSerials,
      payments,
      auditLogs
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BusinessFlow_ERP_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    addToast({
      title: 'Veri Tabanı Dışa Aktarıldı',
      message: 'Tüm sistem kayıtları JSON formatında indirildi.',
      type: 'success'
    });
  };

  const isViewer = currentUser.role === 'Sadece Görüntüleme';

  const plans = [
    {
      tier: 'STARTER',
      name: 'Starter Plan',
      price: '₺2.490',
      period: '/ ay',
      desc: 'Büyüyen KOBİ ve küçük satış ekipleri için.',
      features: [
        '5 Kullanıcı Hesabı',
        'Aylık 50 Teklif & Proforma',
        '250 Adet PRD Cihaz Takibi',
        'Temel Satış Raporları',
        'E-Posta Desteği'
      ],
      current: selectedPlan === 'STARTER'
    },
    {
      tier: 'PROFESSIONAL',
      name: 'Professional Plan',
      price: '₺5.900',
      period: '/ ay',
      badge: 'En Çok Tercih Edilen',
      desc: 'Orta ve büyük ölçekli donanım, IT ve saha firmaları için.',
      features: [
        '15 Kullanıcı + Sınırsız Viewer',
        'Sınırsız Teklif & Proforma',
        'Sınırsız PRD Seri No & Garanti Takibi',
        'Müşteri 360 Portalı',
        'Granüler RBAC Yetki Matrisi',
        'Tam Audit Trail & PDF Baskı Motoru'
      ],
      current: selectedPlan === 'PROFESSIONAL'
    },
    {
      tier: 'ENTERPRISE',
      name: 'Enterprise Plan',
      price: '₺12.500',
      period: '/ ay',
      desc: 'Çok şubeli, distribütör ve yüksek hacimli kurumsal yapılar.',
      features: [
        'Sınırsız Kullanıcı & Departman',
        'Özel API Entegrasyonu & Webhooklar',
        'Dedicated Cloud SQL / PostgreSQL Bağlantısı',
        '7/24 Telefon ve Yerinde Destek',
        'Özel Belge Şablonları & SLA Garantisi'
      ],
      current: selectedPlan === 'ENTERPRISE'
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          <span>Sistem, Şirket & Ticari Abonelik Ayarları</span>
        </h2>
        <p className="text-xs text-slate-500">
          Kurumsal künye, numaratör kuralları, SaaS plan yönetimi ve veri yedekleme
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-4 flex items-center gap-2 rounded-t-xl text-xs font-semibold overflow-x-auto">
        {[
          { id: 'company', label: 'Şirket & Antet Bilgileri', icon: Building2 },
          { id: 'sequences', label: 'Numaratör Sayaçları', icon: Hash },
          { id: 'subscription', label: 'SaaS Plan & Abonelik', icon: CreditCard },
          { id: 'backup', label: 'Veri Yedekleme & Dışa Aktar', icon: Download }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`py-3.5 px-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === t.id
                  ? 'border-indigo-600 text-indigo-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === 'company' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Resmi Şirket Künyesi (Teklif & Proformada Görünür)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Şirket Kısa Adı</label>
                <input
                  type="text"
                  disabled={isViewer}
                  value={formData.companyName}
                  onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Ticari Tam Unvan</label>
                <input
                  type="text"
                  disabled={isViewer}
                  value={formData.commercialTitle}
                  onChange={e => setFormData({ ...formData, commercialTitle: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Vergi Dairesi</label>
                <input
                  type="text"
                  disabled={isViewer}
                  value={formData.taxOffice}
                  onChange={e => setFormData({ ...formData, taxOffice: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Vergi Numarası (VKN)</label>
                <input
                  type="text"
                  disabled={isViewer}
                  value={formData.taxNumber}
                  onChange={e => setFormData({ ...formData, taxNumber: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-hidden font-mono"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="font-bold text-slate-700 uppercase">Merkez Adres</label>
                <input
                  type="text"
                  disabled={isViewer}
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Banka & Şube</label>
                <input
                  type="text"
                  disabled={isViewer}
                  value={formData.bankName}
                  onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">IBAN</label>
                <input
                  type="text"
                  disabled={isViewer}
                  value={formData.iban}
                  onChange={e => setFormData({ ...formData, iban: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-hidden font-mono font-bold"
                />
              </div>
            </div>

            {!isViewer && (
              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Şirket Bilgilerini Kaydet
                </button>
              </div>
            )}
          </div>
        </form>
      )}

      {activeTab === 'sequences' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Otomatik Numaratör Sayaçları
            </h3>
            <p className="text-xs text-slate-500">
              Sistem yeni belge ve ürün ürettikçe bu sayaçlar artar. Asla silinen belge numarası tekrar edilmez.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Teklif Sıra</span>
                <input
                  type="number"
                  disabled={isViewer}
                  value={formData.sequences.quoteCurrent}
                  onChange={e => setFormData({
                    ...formData,
                    sequences: { ...formData.sequences, quoteCurrent: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full border border-slate-300 rounded p-1.5 font-mono font-bold"
                />
                <div className="text-[10px] font-mono text-indigo-700">TKL-2026-XXXXXX</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Proforma Sıra</span>
                <input
                  type="number"
                  disabled={isViewer}
                  value={formData.sequences.proformaCurrent}
                  onChange={e => setFormData({
                    ...formData,
                    sequences: { ...formData.sequences, proformaCurrent: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full border border-slate-300 rounded p-1.5 font-mono font-bold"
                />
                <div className="text-[10px] font-mono text-blue-700">PRO-2026-XXXXXX</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Sözleşme Sıra</span>
                <input
                  type="number"
                  disabled={isViewer}
                  value={formData.sequences.contractCurrent}
                  onChange={e => setFormData({
                    ...formData,
                    sequences: { ...formData.sequences, contractCurrent: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full border border-slate-300 rounded p-1.5 font-mono font-bold"
                />
                <div className="text-[10px] font-mono text-purple-700">SOZ-2026-XXXXXX</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Satış Sıra</span>
                <input
                  type="number"
                  disabled={isViewer}
                  value={formData.sequences.saleCurrent}
                  onChange={e => setFormData({
                    ...formData,
                    sequences: { ...formData.sequences, saleCurrent: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full border border-slate-300 rounded p-1.5 font-mono font-bold"
                />
                <div className="text-[10px] font-mono text-emerald-700">SAT-2026-XXXXXX</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">PRD Cihaz Sıra</span>
                <input
                  type="number"
                  disabled={isViewer}
                  value={formData.sequences.productCurrent}
                  onChange={e => setFormData({
                    ...formData,
                    sequences: { ...formData.sequences, productCurrent: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full border border-slate-300 rounded p-1.5 font-mono font-bold"
                />
                <div className="text-[10px] font-mono text-indigo-700">PRD-2026-XXXXXX</div>
              </div>
            </div>

            {!isViewer && (
              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Sayaçları Güncelle
                </button>
              </div>
            )}
          </div>
        </form>
      )}

      {activeTab === 'subscription' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Mevcut SaaS Abonelik Durumu
                </h3>
                <p className="text-[11px] text-slate-500">
                  BusinessFlow Enterprise lisansınız aktif olarak çalışmaktadır.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                ● Aktif Kurumsal Lisans
              </span>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {plans.map(p => (
                <div
                  key={p.tier}
                  className={`p-5 rounded-xl border relative flex flex-col justify-between transition-all ${
                    p.current
                      ? 'border-indigo-600 bg-indigo-50/20 shadow-md ring-2 ring-indigo-600/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {p.badge && (
                    <span className="absolute -top-2.5 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white shadow-2xs">
                      {p.badge}
                    </span>
                  )}
                  <div>
                    <div className="text-xs font-bold text-slate-900">{p.name}</div>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900 font-mono">{p.price}</span>
                      <span className="text-xs text-slate-400">{p.period}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{p.desc}</p>
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                      {p.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={() => {
                        setSelectedPlan(p.tier as any);
                        addToast({
                          title: 'Plan Güncellendi',
                          message: `${p.name} başarıyla seçildi.`,
                          type: 'success'
                        });
                      }}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                        p.current
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                      }`}
                    >
                      {p.current ? 'Seçili Plan' : 'Bu Plana Geç'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'backup' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Tam Sistem Veri Yedeği & Dışa Aktarma
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Müşteri kayıtları, teklifler, proformalar, satış faturaları, seri numaralı donanım hareketleri ve audit loglarının tamamını tek tıkla güvenli JSON formatında dışa aktarın.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-slate-900">Eksiksiz JSON Formatı</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {customers.length} Müşteri · {quotes.length} Teklif · {sales.length} Satış · {productSerials.length} Cihaz
              </div>
            </div>

            <button
              onClick={handleExportJSON}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Yedek Dosyasını İndir (.json)</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Fabrika Ayarlarına Dönüş:</span>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Tüm örnek verileri sıfırlayıp ilk fabrika ayarlarına döndürmek istiyor musunuz?')) {
                  resetToDefaults();
                }
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Tüm Veritabanını Sıfırla</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
