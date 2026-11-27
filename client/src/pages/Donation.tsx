import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Copy,
  Check,
  CreditCard,
  Building2,
  Sparkles,
  Coffee,
  Server,
  ShieldCheck,
  QrCode,
  ArrowRight,
  ExternalLink,
  Award,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { useI18n } from '@/i18n';

interface AccountField {
  id: string;
  label: string;
  labelEn: string;
  value: string;
  copyValue: string;
  displayValue?: string;
  badge?: string;
}

const DONATION_AMOUNTS = [
  { amount: 5000, label: '5,000 ₮', desc: 'Нэг аяга кофе ☕', descEn: 'Cup of Coffee ☕' },
  { amount: 10000, label: '10,000 ₮', desc: 'Серверийн зардал ⚡', descEn: 'Server Support ⚡' },
  { amount: 20000, label: '20,000 ₮', desc: 'Хөгжүүлэлтийн багт 🚀', descEn: 'Dev Team Boost 🚀' },
  { amount: 50000, label: '50,000 ₮', desc: 'Том хувь нэмэр 🌟', descEn: 'Major Contribution 🌟' },
  { amount: 100000, label: '100,000 ₮', desc: 'Алтан дэмжигч 👑', descEn: 'Golden Patron 👑' },
];

export const Donation: React.FC = () => {
  const { lang } = useI18n();
  const isMn = lang === 'mn';

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(20000);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const accountFields: AccountField[] = [
    {
      id: 'recipient',
      label: 'Хүлээн авагчийн нэр',
      labelEn: 'Recipient / Organization',
      value: 'Prime Idea Pluss LLC',
      copyValue: 'Prime Idea Pluss LLC',
      badge: 'Албан ёсны бүртгэлтэй',
    },
    {
      id: 'bank',
      label: 'Хүлээн авах банк',
      labelEn: 'Bank Name',
      value: 'Хаан Банк (Khan Bank)',
      copyValue: 'Хаан Банк',
      badge: 'Хаан Банк',
    },
    {
      id: 'account',
      label: 'Дансны дугаар',
      labelEn: 'Account Number',
      value: '5134277678',
      copyValue: '5134277678',
      displayValue: '5134 277 678',
      badge: 'Дотоодын төлбөр',
    },
    {
      id: 'iban',
      label: 'Олон улсын данс (IBAN)',
      labelEn: 'International Account (IBAN)',
      value: 'MN450005005134277678',
      copyValue: 'MN450005005134277678',
      displayValue: 'MN45 0005 0051 3427 7678',
      badge: 'Гадаад шилжүүлэг',
    },
    {
      id: 'memo',
      label: 'Гүйлгээний утга',
      labelEn: 'Transaction Memo / Purpose',
      value: selectedAmount
        ? `VMAX дэмжлэг ${selectedAmount.toLocaleString()}₮, Утас/Нэр`
        : 'VMAX дэмжлэг, Утас эсвэл Нэр',
      copyValue: selectedAmount
        ? `VMAX дэмжлэг ${selectedAmount}₮`
        : 'VMAX дэмжлэг',
      badge: 'Сонгосон дүнгээр',
    },
  ];

  const handleCopy = (fieldId: string, copyText: string, labelText: string) => {
    navigator.clipboard.writeText(copyText).then(() => {
      setCopiedField(fieldId);
      setToastMessage(`${labelText}: "${copyText}" ${isMn ? 'хуулагдлаа!' : 'copied!'}`);
      setTimeout(() => {
        setCopiedField(null);
        setToastMessage(null);
      }, 2500);
    });
  };

  const handleCopyAll = () => {
    const allText = [
      `Хүлээн авагч: Prime Idea Pluss LLC`,
      `Банк: Хаан Банк (Khan Bank)`,
      `Дансны дугаар: 5134277678`,
      `IBAN: MN450005005134277678`,
      `Гүйлгээний утга: VMAX дэмжлэг`,
    ].join('\n');

    navigator.clipboard.writeText(allText).then(() => {
      setCopiedField('all');
      setToastMessage(isMn ? 'Бүх дансны мэдээлэл хуулагдлаа!' : 'All account details copied!');
      setTimeout(() => {
        setCopiedField(null);
        setToastMessage(null);
      }, 2500);
    });
  };

  return (
    <div className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-starlight">
      {/* Background Ambient Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-plasma/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-80 right-10 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-96 left-10 w-72 h-72 bg-aurora/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Floating Copied Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-2 px-5 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs sm:text-sm shadow-2xl shadow-emerald-500/40 border border-emerald-400"
          >
            <CheckCircle2 size={18} className="flex-shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-rose-500/15 via-plasma/15 to-aurora/15 border border-rose-500/30 px-4 py-1.5 rounded-full text-rose-400 text-xs sm:text-sm font-bold shadow-lg shadow-rose-500/10"
        >
          <Heart size={16} className="text-rose-400 fill-rose-400 animate-pulse" />
          <span>{isMn ? 'VMAX Платформыг Дэмжих' : 'Support VMAX Platform'}</span>
        </motion.div>

        <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight text-starlight leading-tight">
          {isMn ? (
            <>
              Бидний үйл ажиллагаанд <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-rose-400 via-plasma to-aurora bg-clip-text text-transparent">
                урам нэмж дэмжих
              </span>
            </>
          ) : (
            <>
              Encourage & Support <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-rose-400 via-plasma to-aurora bg-clip-text text-transparent">
                Our Mission & Growth
              </span>
            </>
          )}
        </h1>

        <p className="text-nebula-text text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
          {isMn
            ? 'VMAX.MN нь Монголын үл хөдлөх хөрөнгийн зах зээлийг дундын өндөр зуучлалын шимтгэлгүй, ил тод, технологид суурилсан хурдан бөгөөд нээлттэй байлгах зорилготой ажилладаг. Бидний багийг дэмжихийг хүсвэл доорх дансаар сэтгэлийн дэмжлэг илгээх боломжтой.'
            : 'VMAX.MN is dedicated to transforming Mongolia’s real estate marketplace into a transparent, commission-free, AI-powered ecosystem. If you would like to encourage our ongoing work, infrastructure, and team, you can send support via the account details below.'}
        </p>
      </div>

      {/* Main Grid: Bank Card & Support Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
        
        {/* Left Column (7 cols): Khan Bank Account Showcase */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Khan Bank Digital Card Replica */}
          <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#063319] via-[#094d27] to-[#041a0d] border border-emerald-500/30 shadow-2xl shadow-emerald-950/60 text-white">
            {/* Card Background Patterns */}
            <div className="absolute -top-16 -right-16 w-60 h-60 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-emerald-600/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_70%)] pointer-events-none" />

            {/* Top Row: Khan Bank Branding & Chip */}
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                  <Building2 size={22} className="text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg tracking-wide uppercase text-emerald-100 flex items-center gap-1.5">
                    Хаан Банк
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 normal-case font-semibold">
                      Khan Bank
                    </span>
                  </h3>
                  <p className="text-[11px] text-emerald-200/80 tracking-wider">OFFICIAL RECIPIENT ACCOUNT</p>
                </div>
              </div>

              {/* NFC / Contactless Icon */}
              <div className="flex items-center space-x-1 text-emerald-300/80">
                <CreditCard size={24} />
              </div>
            </div>

            {/* Main Account Number - Highlighted with Giant Copy Button */}
            <div className="mb-6 relative z-10">
              <p className="text-xs uppercase tracking-widest text-emerald-200/70 font-semibold mb-1">
                {isMn ? 'Дансны дугаар (Account Number)' : 'Domestic Account Number'}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-black/30 backdrop-blur-md border border-white/10">
                <div>
                  <div className="font-mono text-2xl sm:text-3xl font-black tracking-wider text-emerald-300 drop-shadow-md">
                    5134 277 678
                  </div>
                  <div className="text-[11px] text-emerald-200/60 font-mono mt-0.5">
                    ХААН БАНК • ТӨГРӨГ (MNT)
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy('account', '5134277678', isMn ? 'Дансны дугаар' : 'Account Number')}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg ${
                    copiedField === 'account'
                      ? 'bg-emerald-400 text-slate-950 scale-105'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:scale-102'
                  }`}
                >
                  {copiedField === 'account' ? (
                    <>
                      <Check size={16} />
                      <span>{isMn ? 'Хуулагдлаа!' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>{isMn ? 'Дугаар хуулах' : 'Copy Number'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Account Holder Name */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-4 border-t border-emerald-500/20 relative z-10">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-emerald-200/70 font-medium">
                  {isMn ? 'Хүлээн авагч (Recipient)' : 'Account Holder'}
                </p>
                <div className="font-heading font-extrabold text-lg sm:text-xl text-white tracking-wide">
                  Prime Idea Pluss LLC
                </div>
                <div className="text-xs text-emerald-200/80">
                  Прайм Айдиа Плас ХХК
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCopy('recipient', 'Prime Idea Pluss LLC', isMn ? 'Хүлээн авагчийн нэр' : 'Recipient Name')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-emerald-200 transition-colors cursor-pointer border border-white/10 self-start sm:self-auto"
              >
                {copiedField === 'recipient' ? <Check size={13} className="text-emerald-300" /> : <Copy size={13} />}
                <span>{copiedField === 'recipient' ? (isMn ? 'Хуулагдсан' : 'Copied') : (isMn ? 'Нэр хуулах' : 'Copy Name')}</span>
              </button>
            </div>
          </div>

          {/* Detailed Account Fields with Copy Buttons */}
          <div className="rounded-3xl bg-nebula/60 backdrop-blur-xl border border-white/10 p-5 sm:p-6 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-sm sm:text-base text-starlight flex items-center space-x-2">
                <ShieldCheck size={18} className="text-emerald-400" />
                <span>{isMn ? 'Бүх дансны нарийвчилсан мэдээлэл' : 'Detailed Account Specs'}</span>
              </h3>

              <button
                type="button"
                onClick={handleCopyAll}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-plasma/15 hover:bg-plasma/25 text-plasma font-bold text-xs border border-plasma/30 transition-all cursor-pointer shadow-sm"
              >
                {copiedField === 'all' ? <Check size={14} /> : <Copy size={14} />}
                <span>{isMn ? 'Бүгдийг нэг дор хуулах' : 'Copy All Info'}</span>
              </button>
            </div>

            {/* Field rows */}
            {accountFields.map((field) => (
              <div
                key={field.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-void/50 hover:bg-void/80 border border-white/5 hover:border-white/10 transition-all gap-2"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-nebula-text font-medium">
                      {isMn ? field.label : field.labelEn}
                    </span>
                    {field.badge && (
                      <span className="text-[10px] font-semibold px-2 py-0.2 rounded-md bg-white/5 border border-white/10 text-nebula-text/80">
                        {field.badge}
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-sm sm:text-base font-bold text-starlight mt-0.5 truncate select-all">
                    {field.displayValue || field.value}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(field.id, field.copyValue, isMn ? field.label : field.labelEn)}
                  className={`self-end sm:self-auto px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer flex-shrink-0 ${
                    copiedField === field.id
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/30'
                      : 'bg-white/5 hover:bg-white/15 text-starlight border border-white/10'
                  }`}
                  aria-label={`Copy ${field.label}`}
                >
                  {copiedField === field.id ? (
                    <>
                      <Check size={14} />
                      <span>{isMn ? 'Хуулагдлаа' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>{isMn ? 'Хуулах' : 'Copy'}</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Quick Transfer Guide for Mobile Banking */}
          <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-4 sm:p-5">
            <h4 className="text-xs sm:text-sm font-bold text-emerald-300 flex items-center space-x-2 mb-3">
              <Zap size={16} />
              <span>{isMn ? 'Хаан банкны апп-аар шилжүүлэх 3 алхам' : 'How to transfer via mobile banking'}</span>
            </h4>
            <ol className="text-xs text-nebula-text space-y-2 list-decimal list-inside leading-relaxed">
              <li>
                <span className="text-starlight font-semibold">{isMn ? 'Апп-аа нээнэ' : 'Open Banking App'}:</span>{' '}
                {isMn
                  ? 'Хаан банк эсвэл дурын банкны апп-ынхаа "Гүйлгээ хийх" цэсийг сонгоно.'
                  : 'Open Khan Bank or any bank app and select "Transfer".'}
              </li>
              <li>
                <span className="text-starlight font-semibold">{isMn ? 'Дансаа оруулна' : 'Paste Account'}:</span>{' '}
                {isMn ? (
                  <>
                    Дансны дугаарт <code className="bg-void/80 px-1.5 py-0.5 rounded text-emerald-400 font-bold">5134277678</code>-г хуулж тавихад хүлээн авагчаар{' '}
                    <strong className="text-starlight">Prime Idea Pluss LLC</strong> автоматаар гарч ирнэ.
                  </>
                ) : (
                  <>
                    Enter <code className="bg-void/80 px-1.5 py-0.5 rounded text-emerald-400 font-bold">5134277678</code>. Recipient will verify as Prime Idea Pluss LLC.
                  </>
                )}
              </li>
              <li>
                <span className="text-starlight font-semibold">{isMn ? 'Гүйлгээний утга' : 'Enter Memo'}:</span>{' '}
                {isMn
                  ? 'Утга дээр "VMAX дэмжлэг" болон өөрийн нэр/утсаа бичиж баталгаажуулна.'
                  : 'Add "VMAX support" and your name/phone in the transaction memo.'}
              </li>
            </ol>
          </div>

        </div>

        {/* Right Column (5 cols): Amount Preset & Impact Showcase */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Support Amount Preset Picker */}
          <div className="rounded-3xl bg-nebula/60 backdrop-blur-xl border border-white/10 p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles size={18} className="text-amber-400" />
              <h3 className="font-bold text-sm sm:text-base text-starlight">
                {isMn ? 'Дэмжих дүнгээ сонгох (Сонголтоор)' : 'Select Support Tier'}
              </h3>
            </div>
            <p className="text-xs text-nebula-text">
              {isMn
                ? 'Та доорх дүнгүүдээс сонгох эсвэл дурын дүнгээр дэмжлэг илгээх боломжтой.'
                : 'Select a suggested amount or transfer any amount from your heart.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DONATION_AMOUNTS.map((item) => {
                const isSelected = selectedAmount === item.amount;
                return (
                  <button
                    key={item.amount}
                    type="button"
                    onClick={() => setSelectedAmount(isSelected ? null : item.amount)}
                    className={`p-3 rounded-2xl text-left transition-all border cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'bg-gradient-to-br from-plasma/25 to-nova/25 border-plasma shadow-lg shadow-plasma/20 ring-1 ring-plasma'
                        : 'bg-void/60 hover:bg-void border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-extrabold font-mono ${isSelected ? 'text-plasma' : 'text-starlight'}`}>
                        {item.label}
                      </span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-plasma text-white flex items-center justify-center">
                          <Check size={12} />
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-nebula-text block">
                      {isMn ? item.desc : item.descEn}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedAmount && (
              <div className="p-3 rounded-xl bg-plasma/10 border border-plasma/20 text-xs text-plasma font-semibold flex items-center justify-between">
                <span>{isMn ? `Сонгосон дүн: ${selectedAmount.toLocaleString()} ₮` : `Selected: ${selectedAmount.toLocaleString()} ₮`}</span>
                <span className="text-[10px] text-nebula-text">{isMn ? 'Гүйлгээний утга шинэчлэгдлээ' : 'Memo updated'}</span>
              </div>
            )}
          </div>

          {/* What your donation supports (Transparency / Impact) */}
          <div className="rounded-3xl bg-nebula/60 backdrop-blur-xl border border-white/10 p-5 sm:p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-sm sm:text-base text-starlight flex items-center space-x-2">
              <Award size={18} className="text-plasma" />
              <span>{isMn ? 'Таны дэмжлэг юунд зарцуулагдах вэ?' : 'Where Does Your Support Go?'}</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-void/40 border border-white/5">
                <div className="p-2 rounded-xl bg-plasma/10 text-plasma flex-shrink-0 mt-0.5">
                  <Server size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-starlight">
                    {isMn ? 'Клоуд сервер & Өндөр хурд' : 'High-Speed Cloud Servers'}
                  </h4>
                  <p className="text-[11px] text-nebula-text leading-relaxed mt-0.5">
                    {isMn
                      ? 'Платформ 24/7 тасралтгүй, хурдан, аюулгүй ажиллах серверийн сарын зардалд'
                      : 'Monthly hosting and high-bandwidth cloud infrastructure.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-void/40 border border-white/5">
                <div className="p-2 rounded-xl bg-aurora/10 text-aurora flex-shrink-0 mt-0.5">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-starlight">
                    {isMn ? 'AI & Дижитал шинэчлэл' : 'AI & 3D Feature Enhancements'}
                  </h4>
                  <p className="text-[11px] text-nebula-text leading-relaxed mt-0.5">
                    {isMn
                      ? 'Хиймэл оюун ухаант хайлтын зөвлөх, 3D төслийн үзүүлэнг сайжруулахад'
                      : 'Developing AI search assistant, 3D tours, and smart price analytics.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-void/40 border border-white/5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 flex-shrink-0 mt-0.5">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-starlight">
                    {isMn ? '2,600+ Бодит зарын чанар' : 'Verified Listings Quality'}
                  </h4>
                  <p className="text-[11px] text-nebula-text leading-relaxed mt-0.5">
                    {isMn
                      ? 'Хуурамч болон зарагдсан зарыг цэвэрлэх, өдөр тутмын дата синк хийхэд'
                      : 'Keeping listings updated, filtering inactive ads, and verifying owners.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-void/40 border border-white/5">
                <div className="p-2 rounded-xl bg-amber-400/10 text-amber-300 flex-shrink-0 mt-0.5">
                  <Coffee size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-starlight">
                    {isMn ? 'Хөгжүүлэгч залуусын багт' : 'Developer & Design Team Boost'}
                  </h4>
                  <p className="text-[11px] text-nebula-text leading-relaxed mt-0.5">
                    {isMn
                      ? 'Системийг бүтээж буй залуусын шаргуу хөдөлмөрийг урамшуулах кофе, сэтгэлийн дэм'
                      : 'Encouraging our engineers, product designers, and support staff.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Warm Thank You Box */}
          <div className="rounded-2xl p-5 bg-gradient-to-br from-plasma/10 via-nebula/40 to-aurora/10 border border-plasma/20 text-center space-y-2">
            <Heart size={24} className="text-rose-400 fill-rose-400 mx-auto animate-bounce" />
            <h4 className="font-bold text-sm text-starlight">
              {isMn ? 'Биднийг дэмждэг танд БАЯРЛАЛАА!' : 'Thank you for your generous support!'}
            </h4>
            <p className="text-xs text-nebula-text leading-relaxed">
              {isMn
                ? 'Таны бага ч болов хувь нэмэр Монголын үл хөдлөхийн зах зээлийг илүү нээлттэй, үнэн зөв, технологийн дэвшилтэт болгоход үнэтэй хүч болдог.'
                : 'Every contribution empowers us to keep building a transparent and modern real estate platform for all Mongolians.'}
            </p>
          </div>

        </div>

      </div>

      {/* Bottom FAQ / Assurance */}
      <div className="border-t border-white/10 pt-10 text-center max-w-xl mx-auto space-y-2">
        <p className="text-xs text-nebula-text">
          {isMn
            ? 'Холбоо барих болон хамтран ажиллах саналтай бол:'
            : 'For inquiries or enterprise partnership proposals:'}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-starlight">
          <span className="flex items-center gap-1.5 text-plasma">
            📧 contact@vmax.mn
          </span>
          <span className="text-white/20">•</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            📞 +976 8976 7700
          </span>
        </div>
      </div>
    </div>
  );
};

export default Donation;
