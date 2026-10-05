import React from 'react';
import { useApp, AppView } from '../../context/AppContext';
import {
  LayoutDashboard,
  FileSpreadsheet,
  FileCheck2,
  FileText,
  ShoppingBag,
  Cpu,
  Package,
  Users,
  Wallet,
  BarChart3,
  ShieldAlert,
  Settings,
  History,
  Search,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    quotes,
    proformas,
    contracts,
    productSerials,
    setGlobalSearchOpen,
    currentUser,
    companySettings
  } = useApp();

  const pendingQuotes = quotes.filter(q => q.status === 'ACCEPTED' || q.status === 'SENT').length;
  const pendingProformas = proformas.filter(p => p.paymentStatus !== 'PAID').length;
  const activeSerials = productSerials.filter(s => s.status === 'ACTIVE' || s.status === 'SERVICE').length;

  const navGroups: {
    title: string;
    items: {
      id: AppView;
      label: string;
      icon: React.ElementType;
      badge?: number | string;
      badgeColor?: string;
    }[];
  }[] = [
    {
      title: 'ANA PANEL',
      items: [
        { id: 'dashboard', label: 'Dashboard & KPI', icon: LayoutDashboard }
      ]
    },
    {
      title: 'SATIŞ & BELGE AKIŞI',
      items: [
        {
          id: 'quotes',
          label: 'Teklif Yönetimi',
          icon: FileSpreadsheet,
          badge: pendingQuotes > 0 ? pendingQuotes : undefined,
          badgeColor: 'bg-amber-100 text-amber-800'
        },
        {
          id: 'proformas',
          label: 'Proforma Faturalar',
          icon: FileCheck2,
          badge: pendingProformas > 0 ? pendingProformas : undefined,
          badgeColor: 'bg-blue-100 text-blue-800'
        },
        {
          id: 'contracts',
          label: 'Satış Sözleşmeleri',
          icon: FileText,
          badge: contracts.length
        },
        {
          id: 'sales',
          label: 'Satışlar & Faturalar',
          icon: ShoppingBag
        }
      ]
    },
    {
      title: 'ÜRÜN & YAŞAM DÖNGÜSÜ',
      items: [
        {
          id: 'inventory',
          label: 'Ürün & Seri No Takip',
          icon: Cpu,
          badge: activeSerials > 0 ? `${activeSerials} Aktif` : undefined,
          badgeColor: 'bg-emerald-100 text-emerald-800'
        },
        {
          id: 'products',
          label: 'Ürün Kataloğu & Stok',
          icon: Package
        }
      ]
    },
    {
      title: 'İLİŞKİLER & FİNANS',
      items: [
        { id: 'customers', label: 'Müşteriler (CRM)', icon: Users },
        { id: 'finance', label: 'Ödemeler & Kasa', icon: Wallet },
        { id: 'reports', label: 'Raporlar & Analitik', icon: BarChart3 }
      ]
    },
    {
      title: 'SİSTEM & YÖNETİM',
      items: [
        { id: 'users', label: 'Kullanıcılar & RBAC', icon: ShieldAlert },
        { id: 'settings', label: 'Şirket & Numaratör', icon: Settings },
        { id: 'audit', label: 'Sistem Audit Logları', icon: History }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 h-screen sticky top-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm font-bold text-lg tracking-wider">
            PQ
          </div>
          <div>
            <div className="font-bold text-white text-sm tracking-tight flex items-center gap-1.5">
              ProQuote <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">ERP</span>
            </div>
            <div className="text-[11px] text-slate-400 truncate max-w-[130px]">
              {companySettings.companyName.split(' ')[0]} Donanım
            </div>
          </div>
        </div>
      </div>

      {/* Global Search Button */}
      <div className="p-3 border-b border-slate-800/60">
        <button
          onClick={() => setGlobalSearchOpen(true)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-all border border-slate-700/60 shadow-inner group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400" />
            <span>Hızlı Arama...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-900 border border-slate-700 rounded text-slate-400">⌘K</kbd>
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <div className="px-2.5 text-[10px] font-semibold text-slate-400 tracking-wider">
              {group.title}
            </div>
            {group.items.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full tabular-nums ${
                        isActive
                          ? 'bg-indigo-700 text-white'
                          : item.badgeColor || 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom User Status Card */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/30">
        <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-white text-xs font-bold uppercase shrink-0">
            {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
            <div className="text-[11px] text-indigo-300 truncate">{currentUser.role}</div>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Sistem Aktif" />
        </div>
      </div>
    </aside>
  );
};
