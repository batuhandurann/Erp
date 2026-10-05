import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle2,
  Circle,
  X,
  ArrowRight,
  Sparkles,
  Building2,
  Users,
  Package,
  FileSpreadsheet,
  Cpu
} from 'lucide-react';

interface OnboardingGuideProps {
  onOpenNewQuote: () => void;
  onOpenNewCustomer?: () => void;
}

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ onOpenNewQuote }) => {
  const {
    customers,
    products,
    quotes,
    sales,
    productSerials,
    setActiveView,
    onboardingDismissed,
    setOnboardingDismissed,
    isDemoMode
  } = useApp();

  if (onboardingDismissed) return null;

  const steps = [
    {
      id: 'settings',
      title: 'Şirket ve Numaratör Ayarları',
      desc: 'Firma unvanı, Maslak V.D. ve TKL/PRO sayaçlarını kontrol edin.',
      completed: true,
      action: () => setActiveView('settings'),
      icon: Building2
    },
    {
      id: 'customer',
      title: 'Kurumsal Müşteri Kaydı',
      desc: `${customers.length} kayıtlı müşteri portföyde hazır.`,
      completed: customers.length > 0,
      action: () => setActiveView('customers'),
      icon: Users
    },
    {
      id: 'product',
      title: 'Donanım Portföyü & Stok',
      desc: `${products.length} adet sunucu, switch ve el terminali katalogda.`,
      completed: products.length > 0,
      action: () => setActiveView('products'),
      icon: Package
    },
    {
      id: 'quote',
      title: 'Teklif Tanzimi & Proforma',
      desc: `${quotes.length} adet teklif oluşturuldu, onaylananlar proformaya hazır.`,
      completed: quotes.length > 0,
      action: () => onOpenNewQuote(),
      icon: FileSpreadsheet
    },
    {
      id: 'serial',
      title: 'Satış & Otomatik PRD Cihaz Takibi',
      desc: `${productSerials.length} cihaz garantisi ve üretici seri no ile izleniyor.`,
      completed: sales.length > 0 && productSerials.length > 0,
      action: () => setActiveView('inventory'),
      icon: Cpu
    }
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs relative overflow-hidden transition-all duration-200">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold text-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                BusinessFlow Hızlı Başlangıç & Kurulum Rehberi
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                %{progressPercent} Tamamlandı
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tekliften satışa ve seri numaralı cihaz takip yaşam döngüsüne 5 temel adımda hakim olun.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setOnboardingDismissed(true)}
            className="text-xs text-slate-400 hover:text-slate-700 px-2 py-1 rounded transition-colors"
          >
            Rehberi Gizle
          </button>
        </div>
      </div>

      {/* Steps List */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              onClick={step.action}
              className={`p-3 rounded-xl border text-left cursor-pointer transition-all hover:border-indigo-400 hover:shadow-2xs flex flex-col justify-between ${
                step.completed ? 'bg-slate-50/70 border-slate-200/80' : 'bg-white border-indigo-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                    <span>Adım {idx + 1}</span>
                  </div>
                  {step.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300" />
                  )}
                </div>
                <div className="text-xs font-bold text-slate-900 leading-snug">{step.title}</div>
                <div className="text-[10px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                  {step.desc}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[11px] font-semibold text-indigo-600">
                <span>{step.completed ? 'Gözden Geçir' : 'Başla'}</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
