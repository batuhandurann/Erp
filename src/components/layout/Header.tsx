import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  ChevronDown,
  UserCheck,
  Shield,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  Keyboard,
  Sparkles,
  Database,
  ExternalLink,
  LogOut
} from 'lucide-react';
import { UserRole } from '../../types';

interface HeaderProps {
  onOpenNewQuoteModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewQuoteModal }) => {
  const {
    activeView,
    currentUser,
    users,
    switchUser,
    logout,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setGlobalSearchOpen,
    setActiveView,
    resetToDefaults,
    isDemoMode,
    loadDemoData,
    loadCleanData,
    setKeyboardShortcutsOpen
  } = useApp();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const roleRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setRoleMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifMenuOpen(false);
      }
      if (demoRef.current && !demoRef.current.contains(e.target as Node)) {
        setDemoMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const viewTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Yönetim Dashboard', subtitle: 'Satış hunisi, teklif dönüşüm oranları ve operasyonel metrikler' },
    quotes: { title: 'Teklif Yönetimi', subtitle: 'Müşteri teklifleri, onay süreçleri ve revizyon takibi' },
    proformas: { title: 'Proforma Faturalar', subtitle: 'Tekliften türetilmiş resmi proformalar ve banka bilgileri' },
    contracts: { title: 'Satış Sözleşmeleri', subtitle: 'Hukuki maddeler, teslimat ve garanti yükümlülükleri' },
    sales: { title: 'Satış & Faturalar', subtitle: 'Onaylanmış siparişler ve otomatik envanter ilişkilendirmesi' },
    inventory: { title: 'Ürün & Seri No Takip', subtitle: 'PRD kodlu yaşam döngüsü, üretici seri no ve servis geçmişi' },
    products: { title: 'Ürün Kataloğu & Stok', subtitle: 'Donanım portföyü, birim fiyatlar ve vergi matrahları' },
    customers: { title: 'Müşteri Portföyü (CRM)', subtitle: 'Firma kayıtları, vergi daireleri ve yetkili iletişimler' },
    finance: { title: 'Ödemeler & Finans', subtitle: 'Banka transferleri, avanslar ve tahsilat takibi' },
    reports: { title: 'Raporlar & Analitik', subtitle: 'Ciro performansı, en çok satanlar ve garanti bitiş projeksiyonu' },
    users: { title: 'Kullanıcılar & Roller (RBAC)', subtitle: 'Yetkilendirme matrisi ve departman erişimleri' },
    settings: { title: 'Şirket & Numaratör Ayarları', subtitle: 'Firma künyesi, banka hesapları ve TKL/PRO/PRD sayaçları' },
    audit: { title: 'Sistem Audit Logları', subtitle: 'Değişiklik geçmişi ve denetim izleme kayıtları' }
  };

  const currentViewMeta = viewTitles[activeView] || { title: 'Yönetim', subtitle: '' };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Admin':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Satış Personeli':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Finans':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Operasyon / Teknik':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Sadece Görüntüleme':
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* View Title */}
      <div className="flex flex-col">
        <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
          {currentViewMeta.title}
        </h1>
        <p className="text-xs text-slate-500 hidden sm:block">
          {currentViewMeta.subtitle}
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Demo / Live Data Environment Switcher */}
        <div className="relative" ref={demoRef}>
          <button
            onClick={() => setDemoMenuOpen(!demoMenuOpen)}
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
              isDemoMode
                ? 'bg-amber-50/70 border-amber-200/80 text-amber-800 hover:bg-amber-100/70'
                : 'bg-emerald-50/70 border-emerald-200/80 text-emerald-800 hover:bg-emerald-100/70'
            }`}
            title="Veri Tabanı Modu"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isDemoMode ? 'Demo Veri Seti' : 'Canlı Çalışma Alanı'}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {demoMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-1 text-xs">
              <div className="font-bold text-slate-900 mb-1">Veri Seti Yönetimi</div>
              <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                Uygulamanın tüm özelliklerini keşfetmek için hazır kurumsal demo verilerini yükleyebilir veya temiz bir sıfır veritabanına geçebilirsiniz.
              </p>
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    loadDemoData();
                    setDemoMenuOpen(false);
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-800">Örnek Verileri Yükle</div>
                    <div className="text-[10px] text-slate-400">ABC Teknoloji, Dell Sunucular, Proformalar</div>
                  </div>
                  {isDemoMode && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </button>

                <button
                  onClick={() => {
                    loadCleanData();
                    setDemoMenuOpen(false);
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-800">Sıfırdan Başla (Temizle)</div>
                    <div className="text-[10px] text-slate-400">Tüm test kayıtlarını sıfırlar</div>
                  </div>
                  {!isDemoMode && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Global Search trigger */}
        <button
          onClick={() => setGlobalSearchOpen(true)}
          className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors"
          title="Arama (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Arama...</span>
          <kbd className="text-[10px] bg-white border border-slate-300 rounded px-1 text-slate-500 font-mono">⌘K</kbd>
        </button>

        {/* Keyboard Shortcuts Trigger Button */}
        <button
          onClick={() => setKeyboardShortcutsOpen(true)}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors hidden sm:block"
          title="Klavye Kısayolları (?)"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* Quick Create Quote Button */}
        {currentUser.role !== 'Sadece Görüntüleme' && (
          <button
            onClick={onOpenNewQuoteModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Yeni Teklif</span>
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifMenuOpen(!notifMenuOpen)}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Bildirimler"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {notifMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Bildirimler ({unreadCount})</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Tümünü Okundu Say
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-slate-400">
                    Henüz bildiriminiz yok.
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        if (n.linkType === 'quote') setActiveView('quotes');
                        if (n.linkType === 'proforma') setActiveView('proformas');
                        if (n.linkType === 'contract') setActiveView('contracts');
                        if (n.linkType === 'serial') setActiveView('inventory');
                        if (n.linkType === 'sale') setActiveView('sales');
                        setNotifMenuOpen(false);
                      }}
                      className={`px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors ${!n.read ? 'bg-indigo-50/40' : ''}`}
                    >
                      <div className="flex items-start gap-2.5">
                        {n.type === 'SUCCESS' && <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />}
                        {n.type === 'WARNING' && <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />}
                        {n.type === 'INFO' && <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-900">{n.title}</div>
                          <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{n.message}</div>
                          <div className="text-[10px] text-slate-400 mt-1">{n.date}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* RBAC Role Switcher Dropdown */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-xs"
            title="Aktif Rolü Değiştir (RBAC Testi)"
          >
            <div className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
              {currentUser.name[0]}
            </div>
            <div className="text-left hidden sm:block">
              <div className="font-semibold text-slate-800 leading-tight">{currentUser.name}</div>
              <div className="text-[10px] text-slate-500">{currentUser.role}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3 py-1.5 border-b border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Rol Değiştir (RBAC Simülasyonu)
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Her rolün yetki ve ekran kısıtlarını canlı test edin:
                </div>
              </div>
              <div className="py-1">
                {users.map(u => {
                  const isCurrent = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        isCurrent ? 'bg-indigo-50/60' : ''
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                          <span>{u.name}</span>
                          {isCurrent && <span className="text-[10px] text-indigo-600 font-bold">● Aktif</span>}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{u.title}</div>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${getRoleBadgeStyle(u.role)}`}>
                        {u.role}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="pt-2 px-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <button
                  onClick={() => {
                    if (window.confirm('Tüm örnek verileri sıfırlayıp ilk fabrika ayarlarına döndürmek istiyor musunuz?')) {
                      resetToDefaults();
                      setRoleMenuOpen(false);
                    }
                  }}
                  className="flex items-center gap-1 text-slate-500 hover:text-rose-600 transition-colors py-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Veritabanını Sıfırla</span>
                </button>

                <button
                  onClick={() => {
                    setRoleMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-semibold transition-colors py-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Çıkış Yap</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dedicated Quick Logout Button */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-all text-xs font-medium cursor-pointer"
          title="Oturumu Kapat / Giriş Paneline Dön"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Çıkış</span>
        </button>
      </div>
    </header>
  );
};
