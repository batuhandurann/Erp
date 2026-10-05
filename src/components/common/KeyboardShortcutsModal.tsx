import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Command, Keyboard } from 'lucide-react';

export const KeyboardShortcutsModal: React.FC = () => {
  const { keyboardShortcutsOpen, setKeyboardShortcutsOpen } = useApp();

  if (!keyboardShortcutsOpen) return null;

  const shortcuts = [
    { key: '⌘ / Ctrl + K', description: 'Global Arama & Hızlı Erişim Menüsü' },
    { key: 'N', description: 'Yeni Teklif Oluşturma Sihirbazı' },
    { key: 'C', description: 'Yeni Müşteri Tanımlama' },
    { key: 'D', description: 'Dashboard Görünümüne Dön' },
    { key: 'P', description: 'Donanım Kataloğuna Git' },
    { key: 'ESC', description: 'Açık Pencereyi / Modalı Kapat' },
    { key: '?', description: 'Klavye Kısayolları Rehberini Aç' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Klavye Kısayolları</span>
          </div>
          <button
            onClick={() => setKeyboardShortcutsOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-2.5">
          {shortcuts.map((sc, idx) => (
            <div key={idx} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-none text-xs">
              <span className="text-slate-600 font-medium">{sc.description}</span>
              <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded font-mono text-[11px] font-bold text-slate-800 shadow-2xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-400">
          İşlemlerinizi mouse kullanmadan saniyeler içinde tamamlayın.
        </div>
      </div>
    </div>
  );
};
