import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  RotateCcw, 
  TrendingUp, 
  Wallet, 
  Calendar, 
  Percent, 
  Building2, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Info,
  X,
  Sparkles
} from 'lucide-react';

interface MortgageCalculatorProps {
  initialPrice: number;
  propertyTitle?: string;
  className?: string;
  onClose?: () => void;
}

type LoanMode = 'combined' | 'mortgageOnly' | 'commercialOnly';
type RepaymentType = 'annuity' | 'equal_principal';

export const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({
  initialPrice,
  propertyTitle,
  className = '',
  onClose
}) => {
  const MORTGAGE_LIMIT = 150_000_000; // 150 сая ₮ ипотекийн дээд хязгаар
  const DEFAULT_DOWN_PERCENT = 30; // 30% урьдчилгаа
  const DEFAULT_MORTGAGE_RATE = 6.0; // 6% хүү
  const DEFAULT_COMMERCIAL_RATE = 18.0; // 18% банкны хүү
  const DEFAULT_TERM_YEARS = 20; // 20 жил

  // Form states
  const [propertyPrice, setPropertyPrice] = useState<number>(initialPrice || 0);
  const [priceInputStr, setPriceInputStr] = useState<string>((initialPrice || 0).toLocaleString());
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(DEFAULT_DOWN_PERCENT);
  const [termYears, setTermYears] = useState<number>(DEFAULT_TERM_YEARS);
  const [commercialRate, setCommercialRate] = useState<number>(DEFAULT_COMMERCIAL_RATE);
  const [mortgageRate, setMortgageRate] = useState<number>(DEFAULT_MORTGAGE_RATE);
  const [loanMode, setLoanMode] = useState<LoanMode>('combined');
  const [repaymentType, setRepaymentType] = useState<RepaymentType>('annuity');
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  // Sync if initialPrice changes externally
  useEffect(() => {
    if (initialPrice > 0) {
      setPropertyPrice(initialPrice);
      setPriceInputStr(initialPrice.toLocaleString());
    }
  }, [initialPrice]);

  // Derived Calculations
  const downPaymentAmount = Math.round((propertyPrice * downPaymentPercent) / 100);
  const totalLoanPrincipal = Math.max(0, propertyPrice - downPaymentAmount);

  // Split loans based on mode
  let mortgagePrincipal = 0;
  let commercialPrincipal = 0;

  if (loanMode === 'mortgageOnly') {
    mortgagePrincipal = Math.min(totalLoanPrincipal, MORTGAGE_LIMIT);
    commercialPrincipal = 0;
  } else if (loanMode === 'commercialOnly') {
    mortgagePrincipal = 0;
    commercialPrincipal = totalLoanPrincipal;
  } else {
    // Combined mode: mortgage up to 150m, rest to commercial
    mortgagePrincipal = Math.min(totalLoanPrincipal, MORTGAGE_LIMIT);
    commercialPrincipal = Math.max(0, totalLoanPrincipal - MORTGAGE_LIMIT);
  }

  // Monthly payment calculation helper (Annuity)
  const calcAnnuity = (principal: number, annualRate: number, years: number) => {
    if (principal <= 0 || years <= 0) return 0;
    const monthlyRate = (annualRate / 100) / 12;
    const totalMonths = years * 12;
    if (monthlyRate === 0) return Math.round(principal / totalMonths);
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                (Math.pow(1 + monthlyRate, totalMonths) - 1);
    return Math.round(emi);
  };

  const monthlyMortgage = calcAnnuity(mortgagePrincipal, mortgageRate, termYears);
  const monthlyCommercial = calcAnnuity(commercialPrincipal, commercialRate, Math.min(termYears, 15)); // commercial usually max 15 years
  const totalMonthlyPayment = monthlyMortgage + monthlyCommercial;

  // Total repayment & interest
  const totalMonthsMortgage = termYears * 12;
  const totalMonthsCommercial = Math.min(termYears, 15) * 12;

  const totalRepaidMortgage = monthlyMortgage * totalMonthsMortgage;
  const totalRepaidCommercial = monthlyCommercial * totalMonthsCommercial;
  const grandTotalRepaid = totalRepaidMortgage + totalRepaidCommercial;
  const totalInterestPaid = Math.max(0, grandTotalRepaid - (mortgagePrincipal + commercialPrincipal));

  // Minimum required monthly household income (Standard 45% DTI rule)
  const requiredIncome = Math.round(totalMonthlyPayment / 0.45);

  // Amount needed to avoid commercial loan
  const downPaymentToAvoidCommercial = Math.max(0, propertyPrice - MORTGAGE_LIMIT);
  const downPercentToAvoidCommercial = propertyPrice > 0 ? Math.ceil((downPaymentToAvoidCommercial / propertyPrice) * 100) : 0;

  // Handle price input typing with comma formatting
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, '');
    const num = rawDigits ? parseInt(rawDigits, 10) : 0;
    setPropertyPrice(num);
    setPriceInputStr(num > 0 ? num.toLocaleString() : '');
  };

  // Reset to initial listing defaults
  const handleReset = () => {
    setPropertyPrice(initialPrice || 0);
    setPriceInputStr((initialPrice || 0).toLocaleString());
    setDownPaymentPercent(DEFAULT_DOWN_PERCENT);
    setTermYears(DEFAULT_TERM_YEARS);
    setCommercialRate(DEFAULT_COMMERCIAL_RATE);
    setMortgageRate(DEFAULT_MORTGAGE_RATE);
    setLoanMode('combined');
    setRepaymentType('annuity');
    setShowSchedule(false);
  };

  // Quick set down payment to exactly avoid commercial loan
  const handleSetMaxMortgageOnly = () => {
    if (propertyPrice > MORTGAGE_LIMIT) {
      setDownPaymentPercent(Math.min(90, Math.max(10, downPercentToAvoidCommercial)));
      setLoanMode('combined');
    }
  };

  // Generate full yearly amortization schedule for all selected years (up to 30 years)
  const generateYearlySchedule = () => {
    const schedule = [];
    let remainingMortgage = mortgagePrincipal;
    let remainingCommercial = commercialPrincipal;
    const monthlyMortgageRate = (mortgageRate / 100) / 12;
    const monthlyCommercialRate = (commercialRate / 100) / 12;

    for (let yr = 1; yr <= termYears; yr++) {
      let yearlyPayment = 0;
      let yearlyPrincipalPaid = 0;
      let yearlyInterestPaid = 0;

      for (let m = 0; m < 12; m++) {
        // Mortgage portion
        if (remainingMortgage > 0) {
          const intM = remainingMortgage * monthlyMortgageRate;
          const prinM = Math.min(remainingMortgage, Math.max(0, monthlyMortgage - intM));
          yearlyInterestPaid += intM;
          yearlyPrincipalPaid += prinM;
          yearlyPayment += (prinM + intM);
          remainingMortgage = Math.max(0, remainingMortgage - prinM);
        }

        // Commercial portion
        if (remainingCommercial > 0) {
          const intC = remainingCommercial * monthlyCommercialRate;
          const prinC = Math.min(remainingCommercial, Math.max(0, monthlyCommercial - intC));
          yearlyInterestPaid += intC;
          yearlyPrincipalPaid += prinC;
          yearlyPayment += (prinC + intC);
          remainingCommercial = Math.max(0, remainingCommercial - prinC);
        }
      }

      const totalRemaining = Math.max(0, Math.round(remainingMortgage + remainingCommercial));
      schedule.push({
        year: yr,
        yearlyPayment: Math.round(yearlyPayment),
        principalPaid: Math.round(yearlyPrincipalPaid),
        interestPaid: Math.round(yearlyInterestPaid),
        balance: totalRemaining
      });

      if (totalRemaining <= 0 && yr >= termYears) break;
    }
    return schedule;
  };

  return (
    <div className={`p-5 sm:p-7 rounded-3xl bg-white dark:bg-void/90 border border-slate-200 dark:border-white/10 shadow-2xl shadow-plasma/10 transition-all ${className}`}>
      
      {/* 1. Header with Title & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-plasma/10 dark:bg-plasma/20 border border-plasma/30 text-plasma flex items-center justify-center shadow-sm shrink-0">
            <Calculator size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-heading font-black text-slate-900 dark:text-white">
                Орон сууцны зээл & Ипотекийн тооцоолуур
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                Банкны аргачлал
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-nebula-text font-medium mt-0.5">
              Урьдчилгаа, хугацаа, хүүгээ өөрийн боломжид тохируулан бодит сарын төлөлтөө тооцоолж үзээрэй
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-void/80 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-starlight hover:text-plasma transition-all shadow-sm cursor-pointer active:scale-95"
            title="Үндсэн утгаар сэргээх"
          >
            <RotateCcw size={13} />
            <span>Сэргээх</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white transition-all cursor-pointer active:scale-95"
              title="Тооцоолуурыг хураах"
            >
              <X size={14} />
              <span>Хураах</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Loan Mode Selector Tabs */}
      <div className="pt-4 pb-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-void/70 rounded-2xl border border-slate-200/80 dark:border-white/10">
          <button
            type="button"
            onClick={() => setLoanMode('combined')}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
              loanMode === 'combined'
                ? 'bg-white dark:bg-plasma text-slate-900 dark:text-white shadow-md shadow-plasma/20 scale-[1.01]'
                : 'text-slate-600 dark:text-nebula-text hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="shrink-0 text-base">🏛️</span>
            <span>Хосолсон (6% + Банк)</span>
          </button>

          <button
            type="button"
            onClick={() => setLoanMode('mortgageOnly')}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
              loanMode === 'mortgageOnly'
                ? 'bg-white dark:bg-emerald-600 text-slate-900 dark:text-white shadow-md shadow-emerald-500/20 scale-[1.01]'
                : 'text-slate-600 dark:text-nebula-text hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="shrink-0 text-base">🏛️</span>
            <span>Ипотек 6% (≤150 сая)</span>
          </button>

          <button
            type="button"
            onClick={() => setLoanMode('commercialOnly')}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
              loanMode === 'commercialOnly'
                ? 'bg-white dark:bg-amber-600 text-slate-900 dark:text-white shadow-md shadow-amber-500/20 scale-[1.01]'
                : 'text-slate-600 dark:text-nebula-text hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="shrink-0 text-base">🏦</span>
            <span>Банкны энгийн зээл</span>
          </button>
        </div>
      </div>

      {/* 3. Balanced 2-Column Grid (Equal Heights & Perfectly Aligned) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 items-stretch">
        
        {/* LEFT COLUMN: Controls & Inputs */}
        <div className="flex flex-col justify-between space-y-3.5">
          
          {/* 3.1. Property Price Input */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <label className="font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Building2 size={15} className="text-plasma" />
                <span>Орон сууцны үнэ:</span>
              </label>
              {initialPrice > 0 && propertyPrice !== initialPrice && (
                <button
                  type="button"
                  onClick={() => {
                    setPropertyPrice(initialPrice);
                    setPriceInputStr(initialPrice.toLocaleString());
                  }}
                  className="text-plasma hover:underline text-[11px] font-bold cursor-pointer"
                >
                  Зарын үндсэн үнэ рүү сэргээх
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                value={priceInputStr}
                onChange={handlePriceChange}
                placeholder="Үнийн дүн оруулна уу"
                className="w-full pl-4 pr-12 py-2.5 bg-slate-50 dark:bg-void/80 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white font-black text-base focus:outline-none focus:ring-2 focus:ring-plasma focus:border-transparent transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-nebula-text font-black text-sm">
                ₮
              </span>
            </div>
          </div>

          {/* 3.2. Down Payment Slider & Quick Percentage Chips */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-void/70 border border-slate-200 dark:border-white/10 space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-extrabold text-slate-800 dark:text-white text-xs sm:text-sm flex items-center gap-1.5">
                <Wallet size={15} className="text-emerald-500" />
                <span>Урьдчилгаа төлбөр ({downPaymentPercent}%):</span>
              </label>
              <span className="font-black text-slate-900 dark:text-white text-sm sm:text-base whitespace-nowrap font-mono">
                {downPaymentAmount.toLocaleString()} ₮
              </span>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="10"
              max="90"
              step="1"
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-plasma"
            />

            {/* Quick Percentage Chips */}
            <div className="grid grid-cols-5 gap-1.5 pt-0.5">
              {[10, 20, 30, 40, 50].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setDownPaymentPercent(pct)}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                    downPaymentPercent === pct
                      ? 'bg-plasma text-white shadow-sm shadow-plasma/30'
                      : 'bg-white dark:bg-void/80 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-starlight hover:border-plasma'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>

            {/* 100% Mortgage fit button if property price exceeds 150m */}
            {propertyPrice > MORTGAGE_LIMIT && (
              <button
                type="button"
                onClick={handleSetMaxMortgageOnly}
                className="w-full py-1.5 px-3 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                title="Банкны зээл авахгүйгээр зөвхөн 150 сая ₮-ийн 6% ипотек авах урьдчилгааг автоматаар тохируулах"
              >
                <Sparkles size={13} className="text-emerald-500 shrink-0" />
                <span>100% Ипотект тааруулах (Урьдчилгаа: {downPercentToAvoidCommercial}%)</span>
              </button>
            )}

            <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-nebula-text pt-0.5">
              <span>Хамгийн бага: 10%</span>
              <span>Зээлэх дүн: <strong className="text-slate-800 dark:text-white font-black">{totalLoanPrincipal.toLocaleString()} ₮</strong></span>
              <span>Хамгийн их: 90%</span>
            </div>
          </div>

          {/* 3.3. Loan Term Slider & Quick Chips */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-void/70 border border-slate-200 dark:border-white/10 space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-extrabold text-slate-800 dark:text-white text-xs sm:text-sm flex items-center gap-1.5">
                <Calendar size={15} className="text-plasma" />
                <span>Зээлийн хугацаа:</span>
              </label>
              <span className="font-black text-slate-900 dark:text-white text-sm sm:text-base whitespace-nowrap">
                {termYears} жил ({termYears * 12} сар)
              </span>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={termYears}
              onChange={(e) => setTermYears(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-plasma"
            />

            {/* Quick Year Chips */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-0.5">
              {[5, 10, 15, 20, 25, 30].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setTermYears(yr)}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                    termYears === yr
                      ? 'bg-plasma text-white shadow-sm shadow-plasma/30'
                      : 'bg-white dark:bg-void/80 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-starlight hover:border-plasma'
                  }`}
                >
                  {yr} жил
                </button>
              ))}
            </div>
          </div>

          {/* 3.4. Rates & Repayment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Interest Rate */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-void/70 border border-slate-200 dark:border-white/10 space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-white text-xs flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Percent size={14} className="text-amber-500" />
                  {loanMode === 'mortgageOnly' ? 'Ипотекийн хүү:' : 'Банкны хүү:'}
                </span>
                <span className="font-black text-slate-900 dark:text-white text-sm">
                  {loanMode === 'mortgageOnly' ? `${mortgageRate}%` : `${commercialRate}%`}
                </span>
              </label>

              {loanMode === 'commercialOnly' || loanMode === 'combined' ? (
                <div className="space-y-1 pt-0.5">
                  <input
                    type="range"
                    min="12"
                    max="24"
                    step="0.5"
                    value={commercialRate}
                    onChange={(e) => setCommercialRate(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 dark:text-nebula-text">
                    <span>12%</span>
                    <span>Сарын ~{(commercialRate / 12).toFixed(2)}%</span>
                    <span>24%</span>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold pt-1">
                  Улсын хөнгөлөлттэй 6% тогтмол хүүтэй
                </p>
              )}
            </div>

            {/* Repayment type */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-void/70 border border-slate-200 dark:border-white/10 space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-white text-xs flex items-center gap-1">
                <TrendingUp size={14} className="text-plasma" />
                <span>Эргэн төлөлт:</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => setRepaymentType('annuity')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                    repaymentType === 'annuity'
                      ? 'bg-plasma text-white'
                      : 'bg-white dark:bg-void/80 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-starlight'
                  }`}
                >
                  Тэнцүү төлөлт
                </button>
                <button
                  type="button"
                  onClick={() => setRepaymentType('equal_principal')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                    repaymentType === 'equal_principal'
                      ? 'bg-plasma text-white'
                      : 'bg-white dark:bg-void/80 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-starlight'
                  }`}
                >
                  Үндсэн тэнцүү
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Results, Financial Summary & Smart Advice (Matches left height perfectly!) */}
        <div className="flex flex-col justify-between space-y-3.5">
          
          {/* 3.5. Main Monthly Payment Banner */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-plasma/20 via-plasma/10 to-aurora/15 border-2 border-plasma/40 shadow-lg shadow-plasma/10 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-starlight">
              <span className="flex items-center gap-1.5 uppercase tracking-wider font-black text-plasma text-[11px]">
                <TrendingUp size={15} />
                Сарын нийт төлбөр
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-plasma text-white whitespace-nowrap">
                {termYears * 12} сар
              </span>
            </div>

            <div className="py-0.5">
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white font-heading tracking-tight whitespace-nowrap flex items-baseline gap-1.5">
                <span>~{totalMonthlyPayment.toLocaleString()} ₮</span>
                <span className="text-xs sm:text-sm font-extrabold text-plasma font-sans">/ сар</span>
              </div>
            </div>

            {/* Split sub-payments if combined */}
            {loanMode === 'combined' && commercialPrincipal > 0 && (
              <div className="pt-2 border-t border-plasma/20 grid grid-cols-1 gap-1.5 text-xs">
                <div className="flex items-center justify-between gap-2 bg-white/60 dark:bg-void/60 px-3 py-1.5 rounded-xl border border-plasma/10">
                  <span className="text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1.5 text-[11px] sm:text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                    Ипотек 6% ({(mortgagePrincipal / 1_000_000).toFixed(0)} сая):
                  </span>
                  <span className="font-black text-emerald-700 dark:text-emerald-300 whitespace-nowrap text-[11px] sm:text-xs font-mono">
                    ~{monthlyMortgage.toLocaleString()} ₮/сар
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 bg-white/60 dark:bg-void/60 px-3 py-1.5 rounded-xl border border-plasma/10">
                  <span className="text-amber-800 dark:text-amber-300 font-bold flex items-center gap-1.5 text-[11px] sm:text-xs">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                    Банкны зээл ({(commercialPrincipal / 1_000_000).toFixed(1)} сая):
                  </span>
                  <span className="font-black text-amber-700 dark:text-amber-300 whitespace-nowrap text-[11px] sm:text-xs font-mono">
                    ~{monthlyCommercial.toLocaleString()} ₮/сар
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 3.6. Clean Financial Breakdown Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-void/80 border border-slate-200 dark:border-white/10 space-y-2">
            <div className="flex justify-between items-center text-xs pb-1.5 border-b border-slate-200/60 dark:border-white/5">
              <span className="text-slate-500 dark:text-nebula-text font-medium">Зээлийн үндсэн дүн:</span>
              <span className="font-black text-slate-900 dark:text-white whitespace-nowrap font-mono">
                {totalLoanPrincipal.toLocaleString()} ₮
              </span>
            </div>

            <div className="flex justify-between items-center text-xs pb-1.5 border-b border-slate-200/60 dark:border-white/5">
              <span className="text-slate-500 dark:text-nebula-text font-medium">Нийт төлөх хүүгийн зардал:</span>
              <span className="font-black text-amber-600 dark:text-amber-400 whitespace-nowrap font-mono">
                ~{totalInterestPaid.toLocaleString()} ₮
              </span>
            </div>

            <div className="flex justify-between items-center text-xs pb-1.5 border-b border-slate-200/60 dark:border-white/5">
              <span className="text-slate-500 dark:text-nebula-text font-medium">Нийт буцаан төлөх дүн:</span>
              <span className="font-black text-slate-900 dark:text-white whitespace-nowrap font-mono">
                ~{grandTotalRepaid.toLocaleString()} ₮
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">Ипотект хамрагдах дүн (6%):</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap font-mono">
                {mortgagePrincipal.toLocaleString()} ₮
              </span>
            </div>
          </div>

          {/* 3.7. Household Income Requirement */}
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-void/60 border border-slate-200 dark:border-white/10 space-y-1">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-plasma shrink-0" />
              <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                Шаардагдах өрхийн сарын орлого (45% шалгуур):
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-nebula-text leading-relaxed">
              Банкны шалгуураар сарын төлөлт өрхийн орлогын 45%-аас хэтрэхгүй байх тул өрхийн сарын цэвэр орлого хамгийн багадаа{' '}
              <strong className="text-slate-900 dark:text-white font-black whitespace-nowrap">
                ~{requiredIncome.toLocaleString()} ₮
              </strong>{' '}
              байх шаардлагатай.
            </p>
          </div>

          {/* 3.8. Smart Advice / Guarantee Banner */}
          {loanMode === 'combined' && commercialPrincipal > 0 ? (
            <div className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/40 space-y-1 shadow-sm">
              <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 font-extrabold text-xs">
                <span>💡</span>
                <span>Зөвлөмж — Хүүгээ хэмнэх боломж:</span>
              </div>
              <p className="text-[11px] text-slate-700 dark:text-nebula-text leading-relaxed">
                Хэрэв урьдчилгаагаа{' '}
                <strong className="text-slate-900 dark:text-white font-black whitespace-nowrap">
                  {downPaymentToAvoidCommercial.toLocaleString()} ₮ ({downPercentToAvoidCommercial}%)
                </strong>{' '}
                болгож нэмбэл банкны 18%-ийн өндөр хүүтэй зээл авахгүйгээр бүтнээр нь{' '}
                <strong className="text-emerald-700 dark:text-emerald-400 font-black">
                  6% ипотекоор
                </strong>{' '}
                авч, сарын төлөлтөө ~{monthlyMortgage.toLocaleString()} ₮ болгон бууруулах боломжтой.
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 space-y-1 shadow-sm">
              <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs">
                <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>100% Ипотекийн хөтөлбөрт багтаж байна:</span>
              </div>
              <p className="text-[11px] text-slate-700 dark:text-nebula-text leading-relaxed">
                Таны зээлийн үлдэгдэл 150 сая ₮ дээд лимитэд багтаж байгаа тул арилжааны банкны өндөр хүүтэй зээл авах шаардлагагүй, 100% улсын 6% хөнгөлөлттэй зээлд хамрагдана.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* 4. Full-width Schedule Button & Amortization Schedule Table */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/10 space-y-3">
        <button
          type="button"
          onClick={() => setShowSchedule(!showSchedule)}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-void/80 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-starlight hover:text-plasma transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
        >
          <span>{showSchedule ? 'Төлбөрийн графикийг хураах' : 'Жил бүрийн эргэн төлөлтийн хуваарийг харах'}</span>
          {showSchedule ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showSchedule && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
                <span>📅</span>
                <span>Нийт {termYears} жилийн эргэн төлөлтийн бүрэн график ({termYears * 12} сар):</span>
              </h4>
              <span className="text-[11px] text-slate-500 dark:text-nebula-text">
                * Бодит график батлагдсан банкны гэрээний дагуу мөрдөгдөнө
              </span>
            </div>

            <div className="overflow-x-auto max-h-96 overflow-y-auto rounded-2xl border border-slate-200 dark:border-white/10 shadow-inner">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-void text-slate-700 dark:text-white font-extrabold border-b border-slate-200 dark:border-white/10 shadow-sm">
                  <tr>
                    <th className="py-2.5 px-3">Жил</th>
                    <th className="py-2.5 px-3">Жилийн нийт төлбөр</th>
                    <th className="py-2.5 px-3">Үндсэн зээлээс</th>
                    <th className="py-2.5 px-3">Хүүгийн төлөлт</th>
                    <th className="py-2.5 px-3 text-right">Зээлийн үлдэгдэл</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-void/40">
                  {generateYearlySchedule().map((row) => (
                    <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-void/60 transition-colors">
                      <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">{row.year}-р жил</td>
                      <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">{row.yearlyPayment.toLocaleString()} ₮</td>
                      <td className="py-2 px-3 font-semibold text-emerald-600 dark:text-emerald-400">+{row.principalPaid.toLocaleString()} ₮</td>
                      <td className="py-2 px-3 font-semibold text-amber-600 dark:text-amber-400">-{row.interestPaid.toLocaleString()} ₮</td>
                      <td className="py-2 px-3 font-bold text-right text-slate-900 dark:text-white">{row.balance.toLocaleString()} ₮</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 5. Disclaimers & Notes */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 flex items-start gap-2 text-slate-400 dark:text-nebula-text/80 text-[11px] leading-relaxed">
        <Info size={14} className="shrink-0 mt-0.5 text-slate-400" />
        <p>
          Тус тооцоолуур нь банк болон МИК-ийн орон сууцны ипотекийн хөтөлбөрийн ерөнхий аргачлал дээр үндэслэсэн баримжаа тооцоолол бөгөөд банкны бодит хүү, шимтгэл, зээлийн хорооны шийдвэрээс хамааран зөрүүтэй гарч болно.
        </p>
      </div>
    </div>
  );
};
