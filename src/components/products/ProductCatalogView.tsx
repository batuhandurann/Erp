import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Package, Search, Plus, X, Tag } from 'lucide-react';
import { Product } from '../../types';

export const ProductCatalogView: React.FC = () => {
  const { products, addProduct, currentUser } = useApp();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Sunucu & Veri Merkezi');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [unitPrice, setUnitPrice] = useState<number>(50000);
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [warrantyMonths, setWarrantyMonths] = useState<number>(24);
  const [description, setDescription] = useState('');

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku) return;

    addProduct({
      sku,
      name,
      category,
      brand: brand || 'Apex Hardware',
      model: model || name,
      unitPrice,
      currency: 'TRY',
      taxRate: 20,
      stockQuantity,
      warrantyMonths,
      description
    });

    setIsModalOpen(false);
    setName('');
    setSku('');
    setBrand('');
    setModel('');
    setDescription('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            <span>Ürün Kataloğu & Donanım Portföyü ({products.length})</span>
          </h2>
          <p className="text-xs text-slate-500">
            Tekliflerde kullanılan kurumsal ürünler, birim fiyatlar ve stok seviyeleri
          </p>
        </div>

        {currentUser.role !== 'Sadece Görüntüleme' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Donanım Ekle</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Ürün Adı, SKU veya Kategori Ara..."
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="p-3.5">Ürün SKU Kodu</th>
                <th className="p-3.5">Ürün Adı & Model</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5 text-right">Birim Fiyat</th>
                <th className="p-3.5 text-center">KDV</th>
                <th className="p-3.5 text-center">Mevcut Stok</th>
                <th className="p-3.5 text-center">Garanti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-slate-900">{p.sku}</td>
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{p.name}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-md">{p.model}</div>
                  </td>
                  <td className="p-3.5 text-slate-600">{p.category}</td>
                  <td className="p-3.5 text-right font-bold tabular-nums font-mono text-slate-900">
                    {p.unitPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                  </td>
                  <td className="p-3.5 text-center tabular-nums text-slate-600">%{p.taxRate}</td>
                  <td className="p-3.5 text-center font-bold tabular-nums">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      p.stockQuantity > 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {p.stockQuantity} Adet
                    </span>
                  </td>
                  <td className="p-3.5 text-center text-slate-600 font-semibold">{p.warrantyMonths} Ay</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Kataloğa Yeni Donanım Ekle</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Ürün SKU / Stok Kodu *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: SRV-DL-R660"
                    value={sku}
                    onChange={e => setSku(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 outline-hidden font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Kategori</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 outline-hidden"
                  >
                    <option value="Sunucu & Veri Merkezi">Sunucu & Veri Merkezi</option>
                    <option value="Ağ & Altyapı">Ağ & Altyapı</option>
                    <option value="Siber Güvenlik">Siber Güvenlik</option>
                    <option value="Güç & Enerji">Güç & Enerji</option>
                    <option value="Otomasyon & Saha Donanımı">Otomasyon & Saha Donanımı</option>
                    <option value="Veri Depolama">Veri Depolama</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Ürün Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Dell PowerEdge R660 Rack Sunucu"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Marka</label>
                  <input
                    type="text"
                    placeholder="Örn: Dell Technologies"
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Model / Konfigürasyon</label>
                  <input
                    type="text"
                    placeholder="Örn: Intel Xeon Silver 4410Y 64GB RAM"
                    value={model}
                    onChange={e => setModel(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Birim Fiyat (₺)</label>
                  <input
                    type="number"
                    min="0"
                    value={unitPrice}
                    onChange={e => setUnitPrice(parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 outline-hidden font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Stok Adedi</label>
                  <input
                    type="number"
                    min="0"
                    value={stockQuantity}
                    onChange={e => setStockQuantity(parseInt(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Garanti (Ay)</label>
                  <input
                    type="number"
                    min="0"
                    value={warrantyMonths}
                    onChange={e => setWarrantyMonths(parseInt(e.target.value) || 24)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Ürünü Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
