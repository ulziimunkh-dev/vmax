import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  QrCode,
  Smartphone,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  X,
  Sparkles,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/services/api';

interface BankAppUrl {
  name: string;
  description: string;
  logo: string;
  link: string;
}

interface InvoiceData {
  invoiceId: string;
  amount: number;
  tier: string;
  durationMonths: number;
  qrText: string;
  qrImage: string;
  urls: BankAppUrl[];
  isMock: boolean;
  expiresAt: string;
}

interface QPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: string;
  planName: string;
  basePrice: number;
  onSuccess: () => void;
}

const BANK_COLOR_MAP: Record<string, { bg: string; text: string; short: string }> = {
  'Хаан банк': { bg: 'bg-emerald-600', text: 'text-white', short: 'KHAN' },
  'Голомт банк': { bg: 'bg-blue-700', text: 'text-white', short: 'GLMT' },
  'Худалдаа Хөгжлийн Банк': { bg: 'bg-amber-600', text: 'text-white', short: 'TDB' },
  'Төрийн банк': { bg: 'bg-sky-600', text: 'text-white', short: 'STATE' },
  'Хас банк': { bg: 'bg-cyan-600', text: 'text-white', short: 'XAC' },
  'М Банк': { bg: 'bg-red-600', text: 'text-white', short: 'M' },
  'SocialPay': { bg: 'bg-blue-500', text: 'text-white', short: 'SPAY' },
  'Мост Мони': { bg: 'bg-indigo-600', text: 'text-white', short: 'MOST' },
  'Ард Апп': { bg: 'bg-rose-600', text: 'text-white', short: 'ARD' },
  'Богд Банк': { bg: 'bg-teal-700', text: 'text-white', short: 'BOGD' },
};

export const QPayModal: React.FC<QPayModalProps> = ({
  isOpen,
  onClose,
  tier,
  planName,
  basePrice,
  onSuccess,
}) => {
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [loadingInvoice, setLoadingInvoice] = useState<boolean>(true);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [activeTab, setActiveTab] = useState<'qr' | 'banks'>('qr');
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [checkingPayment, setCheckingPayment] = useState<boolean>(false);
  const [simulatingPayment, setSimulatingPayment] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(900); // 15 mins

  const pollIntervalRef = useRef<any>(null);

  // Calculate pricing based on duration
  const calculateTotal = (months: number) => {
    let discount = 0;
    if (months >= 12) discount = 0.15;
    else if (months >= 6) discount = 0.10;
    else if (months >= 3) discount = 0.05;
    return Math.round(basePrice * months * (1 - discount));
  };

  // Generate / Fetch Invoice
  const createInvoice = useCallback(
    async (months: number) => {
      setLoadingInvoice(true);
      setErrorMsg(null);
      setIsPaid(false);
      try {
        const res = await api.post('/subscriptions/qpay/create-invoice', {
          tier,
          durationMonths: months,
        });
        setInvoice(res.data);
        setSecondsRemaining(900);
      } catch (err: any) {
        console.error('Invoice create failed', err);
        setErrorMsg(err.response?.data?.message || 'QPay нэхэмжлэх үүсгэхэд алдаа гарлаа.');
      } finally {
        setLoadingInvoice(false);
      }
    },
    [tier],
  );

  // Handle duration tab change
  const handleDurationChange = (months: number) => {
    setDurationMonths(months);
    createInvoice(months);
  };

  // Initialize invoice when modal opens
  useEffect(() => {
    if (isOpen) {
      createInvoice(1);
      setDurationMonths(1);
    } else {
      setInvoice(null);
      setIsPaid(false);
      setErrorMsg(null);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    }
  }, [isOpen, createInvoice]);

  // Check payment status API call
  const checkStatus = useCallback(async () => {
    if (!invoice?.invoiceId || isPaid) return;
    try {
      setCheckingPayment(true);
      const res = await api.get(`/subscriptions/qpay/check/${invoice.invoiceId}`);
      if (res.data?.isPaid) {
        setIsPaid(true);
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2200);
      }
    } catch (err) {
      console.error('Error polling QPay status', err);
    } finally {
      setCheckingPayment(false);
    }
  }, [invoice, isPaid, onSuccess, onClose]);

  // Polling setup: check every 3.5 seconds
  useEffect(() => {
    if (isOpen && invoice?.invoiceId && !isPaid) {
      pollIntervalRef.current = setInterval(() => {
        checkStatus();
      }, 3500);

      return () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      };
    }
  }, [isOpen, invoice?.invoiceId, isPaid, checkStatus]);

  // Expiration countdown
  useEffect(() => {
    if (!isOpen || isPaid) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, isPaid]);

  // Sandbox simulation
  const handleSimulatePayment = async () => {
    if (!invoice?.invoiceId) return;
    setSimulatingPayment(true);
    try {
      const res = await api.post(`/subscriptions/qpay/simulate/${invoice.invoiceId}`);
      if (res.data?.isPaid) {
        setIsPaid(true);
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1800);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Тест төлбөр батлахад алдаа гарлаа.');
    } finally {
      setSimulatingPayment(false);
    }
  };

  const handleCopyQr = () => {
    if (invoice?.qrText) {
      navigator.clipboard.writeText(invoice.qrText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-void/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg my-auto rounded-3xl bg-white dark:bg-nebula border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Top Gradient Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-rose-500 to-amber-500" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* QPay Logo Badge */}
            <div className="flex items-center justify-center h-10 px-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black tracking-wider shadow-md shadow-red-500/20">
              <span className="text-sm font-sans font-black">q</span>
              <span className="text-xs uppercase font-extrabold ml-0.5 tracking-tighter">Pay</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-heading font-black text-slate-900 dark:text-starlight text-base sm:text-lg">
                  QPay-ээр төлөх
                </h3>
                <span className="text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 font-bold px-2 py-0.5 rounded-full border border-red-500/20">
                  Шуурхай
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-nebula-text">
                Бүх банкны аппликейшнээр төлөх боломжтой
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Success View */}
        {isPaid ? (
          <div className="p-8 text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center border-2 border-emerald-500/40 shadow-xl shadow-emerald-500/20"
            >
              <CheckCircle2 size={46} />
            </motion.div>
            <h4 className="text-2xl font-black font-heading text-slate-900 dark:text-starlight">
              Төлбөр амжилттай баталгаажлаа!
            </h4>
            <p className="text-sm text-slate-600 dark:text-nebula-text max-w-sm mx-auto">
              Таны <strong className="text-plasma">{planName}</strong> багцын эрх{' '}
              <strong>{durationMonths} сар</strong>-аар амжилттай идэвхжлээ.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/30">
              <Sparkles size={14} />
              <span>Шинэ боломжууд таны аккаунтад нээгдлээ</span>
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-6 space-y-5">
            {/* Plan & Duration Selector */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-void/60 border border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-plasma/20 rounded-lg text-plasma">
                    <Zap size={16} />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 dark:text-nebula-text block">Сонгосон багц:</span>
                    <span className="font-extrabold text-slate-900 dark:text-starlight text-sm">
                      {planName}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 dark:text-nebula-text block">Нийт дүн:</span>
                  <span className="font-black text-slate-900 dark:text-white text-lg text-plasma">
                    ₮{calculateTotal(durationMonths).toLocaleString('mn-MN')}
                  </span>
                </div>
              </div>

              {/* Month tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-white dark:bg-nebula rounded-xl border border-slate-200 dark:border-white/10">
                {[
                  { months: 1, label: '1 сар', tag: '' },
                  { months: 3, label: '3 сар', tag: '-5%' },
                  { months: 12, label: '12 сар', tag: '-15%' },
                ].map((item) => (
                  <button
                    key={item.months}
                    type="button"
                    onClick={() => handleDurationChange(item.months)}
                    className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${
                      durationMonths === item.months
                        ? 'bg-plasma text-white-force shadow-md shadow-plasma/30'
                        : 'text-slate-600 dark:text-nebula-text hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.tag && (
                      <span
                        className={`text-[9px] font-extrabold uppercase mt-0.5 ${
                          durationMonths === item.months ? 'text-amber-300' : 'text-emerald-500'
                        }`}
                      >
                        {item.tag}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center space-x-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Tabs: QR vs Bank Apps */}
            <div className="flex border-b border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab('qr')}
                className={`flex-1 pb-2.5 font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'qr'
                    ? 'border-red-500 text-red-600 dark:text-red-400'
                    : 'border-transparent text-slate-500 dark:text-nebula-text hover:text-slate-700'
                }`}
              >
                <QrCode size={16} />
                <span>QR код уншуулах</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('banks')}
                className={`flex-1 pb-2.5 font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'banks'
                    ? 'border-red-500 text-red-600 dark:text-red-400'
                    : 'border-transparent text-slate-500 dark:text-nebula-text hover:text-slate-700'
                }`}
              >
                <Smartphone size={16} />
                <span>Банкны аппаар төлөх</span>
              </button>
            </div>

            {/* Content Body */}
            {loadingInvoice ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <RefreshCw size={28} className="animate-spin text-red-500" />
                <span className="text-xs text-slate-500 dark:text-nebula-text font-medium">
                  QPay нэхэмжлэх үүсгэж байна...
                </span>
              </div>
            ) : invoice ? (
              <div>
                {activeTab === 'qr' ? (
                  <div className="flex flex-col items-center text-center space-y-4">
                    {/* QR Frame */}
                    <div className="relative p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-xl">
                      {/* Corner Accents */}
                      <div className="absolute top-1.5 left-1.5 w-4 h-4 border-t-2 border-l-2 border-red-500 rounded-tl pointer-events-none" />
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 border-t-2 border-r-2 border-red-500 rounded-tr pointer-events-none" />
                      <div className="absolute bottom-1.5 left-1.5 w-4 h-4 border-b-2 border-l-2 border-red-500 rounded-bl pointer-events-none" />
                      <div className="absolute bottom-1.5 right-1.5 w-4 h-4 border-b-2 border-r-2 border-red-500 rounded-br pointer-events-none" />

                      <img
                        src={invoice.qrImage}
                        alt="QPay QR Code"
                        className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                      />
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Та банкны апп-аараа QR кодыг уншуулан төлбөрөө хийнэ үү.
                      </p>
                      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-nebula-text">
                        <Clock size={12} className="text-amber-500" />
                        <span>Хүчинтэй хугацаа: </span>
                        <strong className="text-slate-900 dark:text-starlight font-mono">
                          {formatTime(secondsRemaining)}
                        </strong>
                      </div>
                    </div>

                    {/* Copy QR text helper */}
                    <button
                      type="button"
                      onClick={handleCopyQr}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-medium transition cursor-pointer"
                    >
                      {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      <span>{copied ? 'Хуулагдлаа!' : 'QR утга хуулах'}</span>
                    </button>
                  </div>
                ) : (
                  /* Banks Grid */
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500 dark:text-nebula-text text-center">
                      Өөрийн ашигладаг банкны аппликейшнийг сонгоно уу:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                      {invoice.urls?.map((bank, bIdx) => {
                        const styleMeta = BANK_COLOR_MAP[bank.name] || {
                          bg: 'bg-slate-700',
                          text: 'text-white',
                          short: bank.name.slice(0, 3).toUpperCase(),
                        };

                        return (
                          <a
                            key={bIdx}
                            href={bank.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-void/40 hover:bg-slate-100 dark:hover:bg-white/5 hover:border-red-500/40 transition group cursor-pointer"
                          >
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] shrink-0 mr-2.5 shadow-sm ${styleMeta.bg} ${styleMeta.text}`}
                            >
                              {styleMeta.short}
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="block text-xs font-bold text-slate-900 dark:text-starlight truncate group-hover:text-red-500 transition-colors">
                                {bank.name}
                              </span>
                              <span className="block text-[10px] text-slate-400 dark:text-nebula-text truncate">
                                {bank.description || 'Апп нээх'}
                              </span>
                            </div>
                            <ExternalLink
                              size={12}
                              className="text-slate-400 group-hover:text-red-500 shrink-0 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Bottom Actions & Auto-check indicator */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-nebula-text">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>Төлбөрийг автоматаар шалгаж байна...</span>
                    </div>

                    <button
                      type="button"
                      onClick={checkStatus}
                      disabled={checkingPayment}
                      className="font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={12} className={checkingPayment ? 'animate-spin' : ''} />
                      <span>Төлбөр шалгах</span>
                    </button>
                  </div>

                  {/* Sandbox / Test Simulation Button */}
                  {invoice.isMock && (
                    <button
                      type="button"
                      onClick={handleSimulatePayment}
                      disabled={simulatingPayment}
                      className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles size={14} />
                      <span>
                        {simulatingPayment
                          ? 'Төлбөр баталгаажуулж байна...'
                          : '🧪 Тест горим: Төлбөрийг шууд батлах (Sandbox)'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default QPayModal;
