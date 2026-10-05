import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User as UserIcon, 
  Building2, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  KeyRound,
  Users,
  Sparkles,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface DemoCredential {
  name: string;
  role: UserRole;
  identifier: string;
  password: string;
  title: string;
  badgeColor: string;
  icon: string;
  summary: string;
}

const DEMO_CREDENTIALS: DemoCredential[] = [
  {
    name: 'Batuhan Duran',
    role: 'Super Admin',
    identifier: 'admin',
    password: 'Admin123!',
    title: 'Genel Müdür & Kurucu',
    badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: '👑',
    summary: 'Tam sistem yetkisi, kullanıcı rolleri, finans, denetim ve ayarlar'
  },
  {
    name: 'Selin Karaca',
    role: 'Admin',
    identifier: 'selin',
    password: 'Selin123!',
    title: 'Operasyon & Satış Direktörü',
    badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: '🛡️',
    summary: 'Tüm operasyonel akış, satış onayı, sözleşmeler ve şirket yönetimi'
  },
  {
    name: 'Ahmet Yılmaz',
    role: 'Satış Personeli',
    identifier: 'ahmet',
    password: 'Satis123!',
    title: 'Kıdemli Satış Yöneticisi',
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: '💼',
    summary: 'Müşteri CRM, teklif hazırlama, proforma (Tahsilat yetkisi kısıtlıdır)'
  },
  {
    name: 'Deniz Aksoy',
    role: 'Finans',
    identifier: 'deniz',
    password: 'Finans123!',
    title: 'Finans & Muhasebe Müdürü',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: '💰',
    summary: 'Tahsilat kaydı, ödeme mutabakatı, kasa hareketleri ve finansal raporlar'
  },
  {
    name: 'Caner Erkin',
    role: 'Operasyon / Teknik',
    identifier: 'caner',
    password: 'Teknik123!',
    title: 'Teknik Destek & Depo Lideri',
    badgeColor: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    icon: '🔧',
    summary: 'Cihaz seri numaraları, servis bakım fişleri ve depo sevkiyatı'
  },
  {
    name: 'Zeynep Demir',
    role: 'Sadece Görüntüleme',
    identifier: 'zeynep',
    password: 'Denetim123!',
    title: 'Yönetim Kurulu Danışmanı',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: '👁️',
    summary: 'Salt-okunur denetim erişimi, rapor inceleme (Veri değiştirme kapalı)'
  }
];

export const LoginView: React.FC = () => {
  const { login } = useApp();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [tenantId, setTenantId] = useState('org-apex-01');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'credentials'>('form');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Lütfen Kullanıcı ID veya E-posta adresinizi giriniz.');
      return;
    }
    if (!password) {
      setError('Lütfen parolanızı giriniz.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await login(identifier.trim(), password, tenantId);
      if (!res.success) {
        setError(res.error || 'Kullanıcı ID veya parola hatalı.');
      }
    } catch (err: any) {
      setError(err.message || 'Giriş yapılırken sunucu hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const autofillAndLogin = async (demo: DemoCredential) => {
    setIdentifier(demo.identifier);
    setPassword(demo.password);
    setError(null);
    setLoading(true);
    try {
      const res = await login(demo.identifier, demo.password, tenantId);
      if (!res.success) {
        setError(res.error || 'Giriş başarısız.');
      }
    } catch (err: any) {
      setError(err.message || 'Bağlantı hatası.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-700/30">
        
        {/* Left Side: Brand & Hero Showcase */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-indigo-900 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle geometric background accents */}
          <div className="absolute -right-16 -top-16 w-56 h-56 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  BusinessFlow
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ERP v2.0
                  </span>
                </h1>
                <p className="text-xs text-slate-300 font-medium tracking-wide">
                  Apex Teknoloji A.Ş. Portal
                </p>
              </div>
            </div>

            <div className="space-y-4 my-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-100 leading-snug">
                Kurumsal B2B Kaynak & Süreç Yönetimi
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Her çalışanın kendi kullanıcı kimliği ve şifresiyle oturum açtığı, rol bazlı yetkilendirme (RBAC) ve denetim kayıtları ile güvence altına alınmış kurumsal yönetim sistemi.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Teklif, Proforma, Sözleşme, Satış ve Cihaz Seri No Akışı</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Bcrypt Parola Güvenliği & Kriptografik JWT İmzası</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Express API & Çoklu Kiracı (Multi-Tenant) İzolasyonu</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> 256-Bit SSL Koruma
            </span>
            <span>Apex Teknoloji © 2026</span>
          </div>
        </div>

        {/* Right Side: Login Form & Role Quick-Selector */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-slate-50/50">
          <div>
            {/* Header Tabs */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Güvenli Giriş Paneli</h3>
                <p className="text-xs text-slate-500 mt-0.5">Kullanıcı ID ve parolanızla oturum açın</p>
              </div>

              <div className="flex items-center p-1 bg-slate-200/80 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    activeTab === 'form' 
                      ? 'bg-white text-slate-900 shadow-sm font-semibold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Giriş Formu
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('credentials')}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                    activeTab === 'credentials' 
                      ? 'bg-white text-indigo-700 shadow-sm font-semibold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  Kullanıcı Listesi
                </button>
              </div>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-600" />
                <div className="flex-1">
                  <span className="font-semibold">Giriş Başarısız:</span> {error}
                </div>
              </div>
            )}

            {/* Main Form View */}
            {activeTab === 'form' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Kullanıcı ID / E-posta Adresi <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Örn: admin veya batuhan.duran@apexteknoloji.com.tr"
                      required
                      autoFocus
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3 text-slate-400" />
                    ID (örn. <span className="font-semibold text-slate-700">admin, selin, ahmet, deniz</span>) veya tam e-posta girebilirsiniz.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Parola / Şifre <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Varsayılan: <code className="bg-slate-100 text-indigo-700 px-1 py-0.5 rounded font-mono font-semibold">Admin123!</code>
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-10 pr-11 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Şirket / Organizasyon Kodu (Tenant ID)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={tenantId}
                      onChange={(e) => setTenantId(e.target.value)}
                      placeholder="org-apex-01"
                      className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 font-mono focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-indigo-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Kimlik Doğrulanıyor...</span>
                      </>
                    ) : (
                      <>
                        <span>Güvenli Giriş Yap</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : null}

            {/* Quick Demo Credentials Panel (Always visible or tabbed) */}
            <div className="mt-6 pt-5 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Kayıtlı Kullanıcılar & Giriş Bilgileri
                </span>
                <span className="text-[11px] text-slate-500">Tıklayarak doğrudan giriş yapabilirsiniz:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {DEMO_CREDENTIALS.map((demo) => (
                  <div
                    key={demo.identifier}
                    onClick={() => autofillAndLogin(demo)}
                    className="group p-3 bg-white hover:bg-indigo-50/60 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer shadow-sm hover:shadow text-left flex items-start gap-3"
                  >
                    <div className="text-xl p-1.5 bg-slate-50 rounded-lg group-hover:scale-110 transition-transform">
                      {demo.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 truncate">
                          {demo.name}
                        </span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${demo.badgeColor}`}>
                          {demo.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono truncate">
                        ID: <span className="font-bold text-slate-700">{demo.identifier}</span> | Şifre: <span className="text-indigo-600 font-semibold">{demo.password}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 truncate">
                        {demo.summary}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              RBAC Yetkilendirme Aktif
            </span>
            <span>BusinessFlow v2.0 • Güvenli Oturum</span>
          </div>
        </div>

      </div>
    </div>
  );
};
