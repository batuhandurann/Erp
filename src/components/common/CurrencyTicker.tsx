import React, { useState } from 'react';
import { currencyService } from '../../services/currencyService';
import { TrendingUp, TrendingDown, RefreshCw, DollarSign } from 'lucide-react';

export const CurrencyTicker: React.FC = () => {
  const [rates, setRates] = useState(currencyService.getRates());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setRates(currencyService.getRates());
      setIsRefreshing(false);
    }, 400);
  };

  return (
    <div className="bg-slate-900 text-slate-300 px-4 py-1.5 flex flex-wrap items-center justify-between text-xs border-b border-slate-800">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 font-semibold text-slate-200">
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          <span>TCMB Gösterge Kurları:</span>
        </span>
      </div>

      <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
        {rates.map(rate => (
          <div key={rate.code} className="flex items-center gap-1.5 font-mono">
            <span className="font-bold text-white">{rate.code}/TRY:</span>
            <span className="text-slate-100">{rate.effectiveSelling.toFixed(2)} ₺</span>
            <span
              className={`text-[10px] flex items-center px-1 rounded ${
                rate.changeRate >= 0 ? 'text-emerald-400 bg-emerald-950/60' : 'text-rose-400 bg-rose-950/60'
              }`}
            >
              {rate.changeRate >= 0 ? (
                <TrendingUp className="w-2.5 h-2.5 mr-0.5 inline" />
              ) : (
                <TrendingDown className="w-2.5 h-2.5 mr-0.5 inline" />
              )}
              %{Math.abs(rate.changeRate)}
            </span>
          </div>
        ))}

        <button
          onClick={handleRefresh}
          className="text-slate-400 hover:text-white transition-colors p-0.5 rounded"
          title="TCMB Kurlarını Yenile"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
        </button>
      </div>
    </div>
  );
};
