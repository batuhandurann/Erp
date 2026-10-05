import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Cpu,
  Search,
  Filter,
  Wrench,
  ShieldCheck,
  Clock,
  History,
  AlertTriangle,
  CheckCircle2,
  X,
  Plus,
  ArrowRight,
  Package
} from 'lucide-react';
import { ProductLifecycleStatus, ProductSerial, ServiceRecord } from '../../types';

interface ProductSerialDetailModalProps {
  serialId: string | null;
  onClose: () => void;
  onOpenCustomer: (id: string) => void;
  onOpenSale: (id: string) => void;
}

export const ProductSerialDetailModal: React.FC<ProductSerialDetailModalProps> = ({
  serialId,
  onClose,
  onOpenCustomer,
  onOpenSale
}) => {
  const { productSerials, updateSerialStatus, addServiceRecord, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'timeline' | 'service' | 'warranty'>('timeline');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<ProductLifecycleStatus>('ACTIVE');
  const [statusNote, setStatusNote] = useState('');

  // Service entry form
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceType, setServiceType] = useState<ServiceRecord['type']>('ARIZA');
  const [issueDescription, setIssueDescription] = useState('');
  const [technician, setTechnician] = useState(currentUser.name);

  if (!serialId) return null;
  const serial = productSerials.find(s => s.id === serialId || s.internalId === serialId);
  if (!serial) return null;

  // Warranty calculation
  const getWarrantyInfo = () => {
    if (!serial.warrantyEndDate) return { status: 'Bilinmiyor', daysRemaining: 0, expired: false };
    const end = new Date(serial.warrantyEndDate).getTime();
    const now = Date.now();
    const diffDays = Math.ceil((end - now) / (1000 * 3600 * 24));
    if (diffDays <= 0) {
      return { status: 'Garanti Süresi Doldu', daysRemaining: 0, expired: true };
    }
    if (diffDays <= 60) {
      return { status: `${diffDays} Gün Kaldı (Yakında Bitiyor)`, daysRemaining: diffDays, expired: false, alert: true };
    }
    const months = Math.floor(diffDays / 30);
    return { status: `${months} Ay Kalan Garanti (${diffDays} gün)`, daysRemaining: diffDays, expired: false };
  };

  const warranty = getWarrantyInfo();

  const handleStatusChange = (e: React.FormEvent) => {
    e.preventDefault();
    updateSerialStatus(serial.id, newStatus, statusNote);
    setShowStatusModal(false);
    setStatusNote('');
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueDescription) return;

    addServiceRecord(serial.id, {
      date: new Date().toISOString().split('T')[0],
      type: serviceType,
      issueDescription,
      technician: technician || currentUser.name,
      status: 'OPEN'
    });

    setIssueDescription('');
    setShowServiceForm(false);
    setActiveTab('service');
  };

  const isViewer = currentUser.role === 'Sadece Görüntüleme';

  const lifecycleStages: { id: ProductLifecycleStatus; label: string }[] = [
    { id: 'STOCK', label: 'Depoda' },
    { id: 'RESERVED', label: 'Rezerve' },
    { id: 'SOLD', label: 'Satıldı' },
    { id: 'DELIVERED', label: 'Teslim Edildi' },
    { id: 'ACTIVE', label: 'Aktif Çalışıyor' },
    { id: 'SERVICE', label: 'Serviste / Bakımda' },
    { id: 'RETURNED', label: 'İade Edildi' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-900 text-white flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-base font-extrabold bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 px-3 py-0.5 rounded">
                {serial.internalId}
              </span>
              <span className="font-mono text-xs text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                Seri No: {serial.serialNumber}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">{serial.productName}</h2>
            <div className="text-xs text-slate-400">
              Kategori: {serial.category} · Marka / Model: {serial.brand} ({serial.model})
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current State & Action Strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-medium">Mevcut Yaşam Durumu:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              serial.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
              serial.status === 'SERVICE' ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse' :
              serial.status === 'DELIVERED' ? 'bg-blue-100 text-blue-800' :
              'bg-slate-200 text-slate-800'
            }`}>
              {serial.status}
            </span>
          </div>

          {!isViewer && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowStatusModal(true)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-colors"
              >
                Durum Değiştir (Lifecycle)
              </button>

              <button
                onClick={() => setShowServiceForm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs transition-colors"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Arıza / Servis Kaydı Aç</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Lifecycle Status Change Modal */}
        {showStatusModal && (
          <div className="p-4 bg-indigo-50 border-b border-indigo-100">
            <form onSubmit={handleStatusChange} className="flex flex-wrap items-end gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-indigo-950 uppercase">Yeni Durum Seçin:</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as ProductLifecycleStatus)}
                  className="bg-white border border-indigo-200 rounded p-1.5 font-bold"
                >
                  {lifecycleStages.map(st => (
                    <option key={st.id} value={st.id}>{st.label} ({st.id})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 flex-1 min-w-[200px]">
                <label className="font-bold text-indigo-950 uppercase">İşlem / Hareket Notu:</label>
                <input
                  type="text"
                  placeholder="Örn: Müşteri veri merkezine montajı yapıldı"
                  value={statusNote}
                  onChange={e => setStatusNote(e.target.value)}
                  className="w-full bg-white border border-indigo-200 rounded p-1.5"
                />
              </div>

              <button type="submit" className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded">
                Kaydet
              </button>
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="px-3 py-1.5 border border-slate-300 rounded bg-white text-slate-600"
              >
                İptal
              </button>
            </form>
          </div>
        )}

        {/* New Service Ticket Form */}
        {showServiceForm && (
          <form onSubmit={handleAddService} className="p-4 bg-rose-50 border-b border-rose-200 space-y-3 text-xs">
            <div className="font-bold text-rose-900 uppercase flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-rose-600" />
              <span>Yeni Servis & Arıza Kaydı Bildirimi</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-rose-950">Kayıt Türü:</label>
                <select
                  value={serviceType}
                  onChange={e => setServiceType(e.target.value as any)}
                  className="w-full mt-1 bg-white border border-rose-300 rounded p-2"
                >
                  <option value="ARIZA">Donanım Arızası</option>
                  <option value="PERIYODIK_BAKIM">Periyodik Bakım / Temizlik</option>
                  <option value="PARCA_DEGISIMI">Parça Değişimi (RMA)</option>
                  <option value="YAZILIM_GUNCELLEME">Firmware / Yazılım Güncelleme</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-rose-950">Arıza / İşlem Detayı:</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Güç kaynağı fanı yüksek ses yapıyor veya amber arıza ışığı yanıyor"
                  value={issueDescription}
                  onChange={e => setIssueDescription(e.target.value)}
                  className="w-full mt-1 bg-white border border-rose-300 rounded p-2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowServiceForm(false)}
                className="px-3 py-1.5 border border-rose-300 bg-white rounded text-rose-700 font-medium"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold"
              >
                Servis Kaydını Aç
              </button>
            </div>
          </form>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Linked Core Workflow Entities */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1 text-xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Müşteri / Lokasyon</div>
              <div className="font-bold text-slate-900 text-sm truncate">{serial.customerName || 'Merkez Depo'}</div>
              {serial.customerId && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenCustomer(serial.customerId!);
                  }}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 pt-1"
                >
                  <span>Müşteri 360'a Git</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1 text-xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase">İlişkili Satış Faturası</div>
              <div className="font-mono font-bold text-slate-900 text-sm">{serial.saleNumber || 'Stokta'}</div>
              {serial.saleId && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenSale(serial.saleId!);
                  }}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 pt-1"
                >
                  <span>Satış Detayına Git</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1 text-xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Garanti Kapsamı</div>
              <div className="font-semibold text-slate-900">{warranty.status}</div>
              <div className="text-[11px] text-slate-500 font-mono">
                Bitiş: {serial.warrantyEndDate || 'Süresiz'}
              </div>
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === 'timeline' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Yaşam Döngüsü Zaman Çizelgesi ({serial.movements.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('service')}
              className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === 'service' ? 'border-rose-600 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Servis & Arıza Kayıtları ({serial.serviceRecords.length})</span>
            </button>
          </div>

          {/* 1. Complete Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {serial.movements.map((move, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-white" />
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">{move.action}</span>
                        <span className="font-mono text-[10px] text-slate-400">{move.date}</span>
                      </div>
                      {move.note && (
                        <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 mt-1">
                          {move.note}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-1">
                        <span>İşlemi Yapan: <strong>{move.performedBy}</strong></span>
                        <span>·</span>
                        <span>Geçiş: {move.fromStatus} → <strong>{move.toStatus}</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Service Records Tab */}
          {activeTab === 'service' && (
            <div className="space-y-3">
              {serial.serviceRecords.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  Bu cihaz için açılmış herhangi bir arıza veya bakım kaydı bulunmuyor.
                </div>
              ) : (
                serial.serviceRecords.map((rec, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold px-2 py-0.5 rounded text-[10px] bg-rose-50 text-rose-700 border border-rose-200">
                          {rec.type}
                        </span>
                        <span className="font-bold text-slate-900">{rec.issueDescription}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rec.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {rec.status === 'RESOLVED' ? 'ÇÖZÜLDÜ' : 'İŞLEMDE'}
                      </span>
                    </div>

                    {rec.resolution && (
                      <div className="p-2.5 bg-emerald-50/60 rounded border border-emerald-100 text-emerald-950 text-[11px] leading-relaxed">
                        <strong>Çözüm Detayı:</strong> {rec.resolution}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                      <span>Tarih: {rec.date}</span>
                      <span>Teknisyen: <strong>{rec.technician}</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
