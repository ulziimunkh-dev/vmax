import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Coins, 
  Info,
  HelpCircle
} from 'lucide-react';
import { MortgageCalculator } from '@/components/listings/MortgageCalculator';

export const MortgageCalculatorPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const priceFromQuery = searchParams.get('price');
  const initialNum = priceFromQuery ? Math.max(0, parseInt(priceFromQuery, 10)) : 250_000_000;

  const [activePrice, setActivePrice] = useState<number>(initialNum);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSelectPreset = (amount: number) => {
    setActivePrice(amount);
    setSearchParams({ price: amount.toString() });
  };

  const presets = [
    { label: '150 сая ₮', value: 150_000_000, desc: '100% Ипотект багтана' },
    { label: '200 сая ₮', value: 200_000_000, desc: 'Хосолсон зээл' },
    { label: '250 сая ₮', value: 250_000_000, desc: 'Нийтлэг дундаж' },
    { label: '350 сая ₮', value: 350_000_000, desc: 'Хосолсон зээл' },
    { label: '500 сая ₮', value: 500_000_000, desc: 'Шинэ орон сууц' },
    { label: '800 сая ₮', value: 800_000_000, desc: 'Тансаг зэрэглэл' },
  ];

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-20 px-3 sm:px-6 max-w-7xl mx-auto">
      {/* 1. Hero Header */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl mx-auto space-y-3 mb-8"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider shadow-sm">
          <Calculator size={15} />
          <span>Банкны аргачлал • 6% Ипотекийн хөтөлбөр</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
          Орон сууцны зээл & <span className="bg-gradient-to-r from-plasma via-nova to-emerald-500 bg-clip-text text-transparent">Ипотекийн тооцоолуур</span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-nebula-text leading-relaxed font-medium">
          Орон сууцны үнэ, урьдчилгаа, зээлийн хугацаа, сарын бодит төлөлт, шаардагдах өрхийн орлого болон зээлийн бүрэн эргэн төлөлтийн хуваарийг бодит банкны томьёогоор нарийвчлан тооцоолоорой.
        </p>

        {/* Quick Price Preset Chips */}
        <div className="pt-3">
          <span className="text-xs text-slate-500 dark:text-nebula-text font-semibold block mb-2">
            Нийтлэг үнийн дүнгээр хурдан шалгах:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {presets.map((p) => {
              const isSelected = activePrice === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => handleSelectPreset(p.value)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-plasma text-white border-plasma shadow-md shadow-plasma/25 scale-105'
                      : 'bg-white dark:bg-void/80 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-starlight border-slate-200 dark:border-white/15'
                  }`}
                >
                  <span>{p.label}</span>
                  <span className={`text-[10px] ml-1.5 opacity-80 ${isSelected ? 'text-white/90' : 'text-slate-500 dark:text-nebula-text'}`}>
                    ({p.desc})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* 2. Embedded Mortgage Calculator Component */}
      <motion.div
        key={activePrice}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-12"
      >
        <MortgageCalculator 
          initialPrice={activePrice}
          className="shadow-2xl"
        />
      </motion.div>

      {/* 3. Comprehensive Guide & Banking Information */}
      <div className="mt-12 space-y-6">
        <div className="border-t border-slate-200 dark:border-white/10 pt-8 text-center max-w-xl mx-auto">
          <h2 className="text-lg sm:text-xl font-heading font-black text-slate-900 dark:text-white">
            Зээл авахад анхаарах гол зүйлс
          </h2>
          <p className="text-xs text-slate-500 dark:text-nebula-text mt-1">
            Монгол банк болон арилжааны банкуудын баримталдаг албан ёсны журам, шалгуурууд
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: 6% Mortgage */}
          <div className="glass-card p-5 sm:p-6 rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Coins size={22} />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  Улсын 6% Ипотекийн зээл
                </h3>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  Хөнгөлөлттэй хүүтэй
                </span>
              </div>
            </div>
            <ul className="text-xs text-slate-600 dark:text-nebula-text space-y-2 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Урьдчилгаа төлбөр:</strong> 30%-иас доошгүй байх</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Зээлийн дээд хэмжээ:</strong> Улаанбаатар хотод 150 сая ₮ хүртэл</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Хугацаа:</strong> 30 хүртэл жил (360 сар)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Шалгуур:</strong> Сүүлийн 1 жилээс доошгүй хугацаанд НДШ тасралтгүй төлсөн байх</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Combined Loan */}
          <div className="glass-card p-5 sm:p-6 rounded-2xl border border-plasma/30 bg-plasma/5 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-plasma/20 text-plasma">
                <Building2 size={22} />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  Хосолсон зээл гэж юу вэ?
                </h3>
                <span className="text-[11px] font-bold text-plasma">
                  150 сая ₮-өөс дээш үнэтэй байранд
                </span>
              </div>
            </div>
            <ul className="text-xs text-slate-600 dark:text-nebula-text space-y-2 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={14} className="text-plasma shrink-0 mt-0.5" />
                <span>Орон сууцны зээлийн үлдэгдэл 150 сая ₮-өөс давсан үед банк үлдсэн хэсгийг <strong>банкны энгийн зээлээр</strong> (16%-20% хүүтэй) хослуулан олгодог.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={14} className="text-plasma shrink-0 mt-0.5" />
                <span>Банкны энгийн зээлийн хугацаа ихэвчлэн <strong>15 хүртэл жил</strong> байдаг тул сарын нийт төлөлт өсдөг.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={14} className="text-plasma shrink-0 mt-0.5" />
                <span><strong>Зөвлөмж:</strong> Боломжтой бол урьдчилгаагаа нэмэгдүүлэн зээлээ 150 сая ₮ дотор багтаавал хүүний зардлаа их хэмжээгээр хэмнэнэ.</span>
              </li>
            </ul>
          </div>

          {/* Card 3: DTI 45% Rule */}
          <div className="glass-card p-5 sm:p-6 rounded-2xl border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-500">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  Өрхийн орлогын харьцаа (DTI 45%)
                </h3>
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  Монголбанкны журам
                </span>
              </div>
            </div>
            <ul className="text-xs text-slate-600 dark:text-nebula-text space-y-2 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <span>Сарын нийт зээлийн төлбөр нь өрхийн татварын дараах <strong>цэвэр орлогын 45%-иас</strong> хэтрэхгүй байх ёстой.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <span>Хэрэв өрхийн орлого хүрэлцэхгүй бол <strong>хамтран зээлдэгч</strong> (эхнэр/нөхөр, гэр бүлийн гишүүн)-ий орлогыг нэмж тооцуулах боломжтой.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <span>Бусад банк, ББСБ-д байгаа зээлийн үлдэгдлүүд энэхүү 45%-ийн лимитээс хасагдаж тооцогдоно.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Banner to search listings */}
        <div className="mt-8 p-6 rounded-3xl bg-gradient-to-r from-plasma/10 via-purple-50/60 to-indigo-50/40 dark:from-[#171330] dark:via-[#23184d] dark:to-[#1a1236] border border-plasma/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <h4 className="text-base sm:text-lg font-heading font-black text-slate-900 dark:text-white">
              Өөрийн бодсон төсөвт тохирох байраа олох
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-purple-200">
              Vmax дээр нийтлэгдсэн 400+ баталгаажсан үл хөдлөх хөрөнгийн заруудаас үнэ, байршлаар шүүн үзээрэй.
            </p>
          </div>
          <Link
            to="/?type=SALE&category=APARTMENT"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-plasma to-nova text-white font-bold text-xs sm:text-sm shadow-md shadow-plasma/25 hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <span>Зарууд үзэх</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
};
