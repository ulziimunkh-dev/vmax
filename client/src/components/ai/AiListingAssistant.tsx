import React, { useState } from 'react';
import { Sparkles, Bot, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { aiAPI } from '@/services/api';

interface AiAssistantPanelProps {
  type: string;
  category?: string;
  district: string;
  khoroo?: string;
  location?: string;
  areaSqm: string | number;
  rooms?: string | number;
  floor?: string | number;
  totalFloors?: string | number;
  price?: string | number;
  highlights?: string[];
  onDescriptionGenerated: (desc: string) => void;
}

export const AiListingAssistant: React.FC<AiAssistantPanelProps> = ({
  type,
  category,
  district,
  khoroo,
  location,
  areaSqm,
  rooms,
  floor,
  totalFloors,
  price,
  highlights = [],
  onDescriptionGenerated,
}) => {
  const [loadingDesc, setLoadingDesc] = useState(false);
  const [estimatingPrice, setEstimatingPrice] = useState(false);
  const [priceData, setPriceData] = useState<any>(null);

  const handleGenerateDesc = async () => {
    if (!areaSqm || Number(areaSqm) <= 0) {
      alert('AI тайлбар бичүүлэхийн тулд эхлээд талбай (м.кв)-аа оруулна уу.');
      return;
    }

    setLoadingDesc(true);
    try {
      const res = await aiAPI.generateDescription({
        type,
        category,
        district,
        khoroo,
        location,
        areaSqm: Number(areaSqm),
        rooms: rooms ? Number(rooms) : undefined,
        floor: floor ? Number(floor) : undefined,
        totalFloors: totalFloors ? Number(totalFloors) : undefined,
        price: price ? Number(price) : undefined,
        highlights,
      });

      if (res.data?.description) {
        onDescriptionGenerated(res.data.description);
      }
    } catch (err) {
      console.error(err);
      alert('Тайлбар үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.');
    } finally {
      setLoadingDesc(false);
    }
  };

  const handleEstimatePrice = async () => {
    if (!areaSqm || Number(areaSqm) <= 0) {
      alert('Үнэлгээ хийхийн тулд эхлээд талбай (м.кв)-аа оруулна уу.');
      return;
    }

    setEstimatingPrice(true);
    try {
      const res = await aiAPI.estimatePrice({
        type,
        category,
        district,
        khoroo,
        areaSqm: Number(areaSqm),
        price: price ? Number(price) : undefined,
      });

      setPriceData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setEstimatingPrice(false);
    }
  };

  return (
    <div className="rounded-2xl p-4 bg-plasma/10 dark:bg-plasma/15 border border-plasma/30 space-y-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-plasma/20 text-plasma">
            <Bot size={18} />
          </div>
          <span className="font-extrabold text-xs sm:text-sm text-indigo-950 dark:text-purple-100">
            Vmax AI Ухаалаг Туслах
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Price Estimator Button */}
          <button
            type="button"
            onClick={handleEstimatePrice}
            disabled={estimatingPrice}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold border border-slate-300 dark:border-white/20 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <TrendingUp size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-slate-800 dark:text-slate-100 font-bold">{estimatingPrice ? 'Тооцоолж байна...' : 'Зах зээлийн үнэлгээ'}</span>
          </button>

          {/* Generate Description Button */}
          <button
            type="button"
            onClick={handleGenerateDesc}
            disabled={loadingDesc}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-plasma to-nova text-white text-white-force text-xs font-bold shadow-md shadow-plasma/30 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles size={14} className="text-white-force animate-pulse" />
            <span className="text-white-force">{loadingDesc ? 'AI бичиж байна...' : '✨ AI-аар тайлбар бичүүлэх'}</span>
          </button>
        </div>
      </div>

      {/* Market Price Assessment Card */}
      {priceData && (
        <div className="mt-2 p-3.5 rounded-xl bg-slate-50 dark:bg-void/90 border border-slate-300 dark:border-white/10 text-xs space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 dark:text-nebula-text">
              {district} дүүргийн дундаж м.кв үнэ:
            </span>
            <span className="font-extrabold text-plasma text-sm">
              {(priceData.avgPerSqm / 1000000).toFixed(1)} сая ₮
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 dark:text-nebula-text">
              Тооцоолсон зах зээлийн жишиг үнэ:
            </span>
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">
              {(priceData.recommendedPrice / 1000000).toFixed(1)} сая ₮
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
            <span>{priceData.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};
