import React, { useState, useMemo } from 'react';
import { Calendar, Users, Phone, Send, CheckCircle2, Moon, Clock, ShieldCheck, Sparkles, X, Lock } from 'lucide-react';
import api from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useI18n } from '@/i18n';
import type { Listing } from '@/types';

interface StayBookingCardProps {
  listing: Listing;
  revealedPhone?: string | null;
  onRevealPhone?: () => void;
}

export const StayBookingCard: React.FC<StayBookingCardProps> = ({
  listing,
  revealedPhone,
  onRevealPhone,
}) => {
  const { user } = useAuthStore();
  const { t } = useI18n();

  // Helper to format Date to YYYY-MM-DD
  const formatDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayStr = useMemo(() => formatDateString(new Date()), []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return formatDateString(d);
  }, []);
  const dayAfterTomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return formatDateString(d);
  }, []);

  const [checkIn, setCheckIn] = useState<string>(tomorrowStr);
  const [checkOut, setCheckOut] = useState<string>(dayAfterTomorrowStr);
  const [guests, setGuests] = useState<number>(2);

  // Booking Inquiry Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [guestNotes, setGuestNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Calculate nights
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    const diffTime = outDate.getTime() - inDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [checkIn, checkOut]);

  const pricePerNight = Number(listing.price) || 0;
  const subtotal = pricePerNight * nights;
  const cleaningFee = Number(listing.attributes?.cleaningFee) || 0;
  const totalPrice = subtotal + cleaningFee;

  const rawPhone = listing.contactPhone || listing.attributes?.contactPhone || listing.user?.phone || '8976-7700';
  const isRevealed = Boolean(revealedPhone);
  const finalPhone = revealedPhone || rawPhone;
  const displayMaskedPhone = useMemo(() => {
    const clean = rawPhone.replace(/\D/g, '');
    if (clean.length >= 8) {
      return `${clean.slice(0, 4)}-****`;
    }
    return '8976-****';
  }, [rawPhone]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestPhone.trim()) {
      setErrorMsg('Утасны дугаараа оруулна уу.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    const formattedMessage = [
      `🛎️ [ХОНОГООР ТҮРЭЭСЛЭХ / STAY ЗАХИАЛГЫН ХҮСЭЛТ]`,
      `📅 Ирэх өдөр: ${checkIn}`,
      `📅 Гарах өдөр: ${checkOut}`,
      `🌙 Нийт хоног: ${nights} хоног`,
      `👥 Зочдын тоо: ${guests} хүн`,
      `💰 Хоногийн үнэ: ₮${pricePerNight.toLocaleString()}`,
      `💳 Нийт дүн: ₮${totalPrice.toLocaleString()}`,
      guestNotes ? `📝 Хүсэлт/Тэмдэглэл: ${guestNotes}` : '',
    ].filter(Boolean).join('\n');

    try {
      await api.post('/inquiries', {
        listingId: listing.id,
        name: guestName || 'Зочин',
        email: guestEmail || (user?.email || `${guestPhone.replace(/\D/g, '')}@vmax.mn`),
        phone: guestPhone,
        message: formattedMessage,
      });

      setSubmitSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Захиалгын хүсэлт илгээхэд алдаа гарлаа.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="glass-card p-6 rounded-3xl border border-plasma/30 shadow-2xl backdrop-blur-xl bg-white/95 dark:bg-void/90 relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-plasma/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header Price & Stay Tag */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-heading">
                ₮{pricePerNight.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-nebula-text">/ {t.stayBooking.perNight}</span>
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
              <Sparkles size={12} />
              <span>{t.stayBooking.title}</span>
            </p>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
            <Moon size={13} className="text-amber-500" />
            <span>{t.stayBooking.title}</span>
          </span>
        </div>

        {/* Date Range Selector Box */}
        <div className="space-y-3 mb-5">
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
            {/* Check-in */}
            <div className="p-2.5 rounded-xl bg-white dark:bg-void/70 shadow-sm border border-slate-200 dark:border-white/10">
              <label className="block text-[10px] font-bold text-slate-500 dark:text-nebula-text uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar size={11} className="text-plasma" />
                <span>{t.stayBooking.checkIn}</span>
              </label>
              <input
                type="date"
                min={todayStr}
                value={checkIn}
                onChange={(e) => {
                  const val = e.target.value;
                  setCheckIn(val);
                  if (val >= checkOut) {
                    const nextDay = new Date(val);
                    nextDay.setDate(nextDay.getDate() + 1);
                    setCheckOut(formatDateString(nextDay));
                  }
                }}
                className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-starlight focus:outline-none cursor-pointer"
              />
            </div>

            {/* Check-out */}
            <div className="p-2.5 rounded-xl bg-white dark:bg-void/70 shadow-sm border border-slate-200 dark:border-white/10">
              <label className="block text-[10px] font-bold text-slate-500 dark:text-nebula-text uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar size={11} className="text-plasma" />
                <span>{t.stayBooking.checkOut}</span>
              </label>
              <input
                type="date"
                min={checkIn || todayStr}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-starlight focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Guests Selector */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-plasma" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{t.stayBooking.guests}</p>
                <p className="text-[10px] text-slate-500 dark:text-nebula-text">{guests} {t.stayBooking.guestsCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
                className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-starlight font-black flex items-center justify-center hover:bg-slate-300 dark:hover:bg-white/20 transition cursor-pointer"
              >
                -
              </button>
              <span className="text-xs font-black text-slate-900 dark:text-white w-5 text-center">
                {guests}
              </span>
              <button
                type="button"
                onClick={() => setGuests((g) => Math.min(15, g + 1))}
                className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-starlight font-black flex items-center justify-center hover:bg-slate-300 dark:hover:bg-white/20 transition cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Price Breakdown Calculation */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-void/60 border border-slate-200 dark:border-white/10 space-y-2 mb-5">
          <div className="flex justify-between text-xs text-slate-600 dark:text-nebula-text">
            <span>₮{pricePerNight.toLocaleString()} × {nights} {t.stayBooking.nights}</span>
            <span className="font-semibold text-slate-900 dark:text-starlight">₮{subtotal.toLocaleString()}</span>
          </div>
          {cleaningFee > 0 && (
            <div className="flex justify-between text-xs text-slate-600 dark:text-nebula-text">
              <span>Cleaning Fee</span>
              <span className="font-semibold text-slate-900 dark:text-starlight">₮{cleaningFee.toLocaleString()}</span>
            </div>
          )}
          <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex justify-between items-center text-sm font-bold text-slate-900 dark:text-white">
            <span>{t.stayBooking.totalPrice} ({nights} {t.stayBooking.nights}):</span>
            <span className="text-base text-plasma font-extrabold">₮{totalPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Primary Action: Book Inquiry Request */}
        <button
          type="button"
          onClick={() => {
            setSubmitSuccess(false);
            setErrorMsg('');
            setIsModalOpen(true);
          }}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-extrabold text-sm text-white-force bg-gradient-to-r from-plasma via-indigo-600 to-nova hover:from-plasma/90 hover:to-nova/90 shadow-lg shadow-plasma/30 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer mb-3"
        >
          <Calendar size={17} />
          <span>{t.stayBooking.bookNow}</span>
        </button>

        {/* Secondary Action: Direct Call Host */}
        {isRevealed ? (
          <a
            href={`tel:${finalPhone.replace(/\D/g, '')}`}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer"
          >
            <Phone size={15} />
            <span>{t.stayBooking.callHost} ({finalPhone})</span>
          </a>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (onRevealPhone) onRevealPhone();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer"
          >
            <Lock size={14} />
            <span>{t.stayBooking.callHost} ({displayMaskedPhone})</span>
          </button>
        )}
      </div>

      {/* Booking Inquiry Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-nebula border border-white/10 shadow-2xl p-6 text-starlight overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-plasma/20 text-plasma">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{t.stayBooking.bookingModalTitle}</h3>
                  <p className="text-xs text-nebula-text">{t.stayBooking.bookingModalSubtitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-nebula-text hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {submitSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 size={36} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{t.stayBooking.sentSuccess}</h4>
                  <p className="text-xs text-nebula-text mt-1 max-w-xs mx-auto">
                    {checkIn} - {checkOut} ({nights} {t.stayBooking.nights})
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-void/60 border border-white/10 text-xs text-left space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-nebula-text">{t.stayBooking.nights}:</span>
                    <span className="font-semibold text-white">{checkIn} - {checkOut} ({nights} {t.stayBooking.nights})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-nebula-text">{t.stayBooking.guests}:</span>
                    <span className="font-semibold text-white">{guests} {t.stayBooking.guestsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-nebula-text">{t.stayBooking.totalPrice}:</span>
                    <span className="font-bold text-plasma">₮{totalPrice.toLocaleString()}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition cursor-pointer"
                >
                  {t.common.cancel}
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="mt-4 space-y-4">
                {/* Booking summary banner */}
                <div className="p-3.5 rounded-2xl bg-plasma/10 border border-plasma/25 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">{checkIn} - {checkOut}</p>
                    <p className="text-[11px] text-plasma-light">{nights} {t.stayBooking.nights} • {guests} {t.stayBooking.guestsCount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-plasma">₮{totalPrice.toLocaleString()}</p>
                    <p className="text-[10px] text-nebula-text">{t.stayBooking.totalPrice}</p>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-nebula-text mb-1">
                      {t.stayBooking.yourName} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. John / Анударь"
                      className="w-full bg-void/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-starlight focus:outline-none focus:border-plasma"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-nebula-text mb-1">
                      {t.stayBooking.yourPhone} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="e.g. 9911-2233"
                      className="w-full bg-void/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-starlight focus:outline-none focus:border-plasma"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-nebula-text mb-1">
                      {t.stayBooking.yourEmail}
                    </label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="e.g. user@gmail.com"
                      className="w-full bg-void/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-starlight focus:outline-none focus:border-plasma"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-nebula-text mb-1">
                      {t.stayBooking.specialNotes}
                    </label>
                    <textarea
                      rows={2}
                      value={guestNotes}
                      onChange={(e) => setGuestNotes(e.target.value)}
                      placeholder={t.stayBooking.notesPlaceholder}
                      className="w-full bg-void/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-starlight focus:outline-none focus:border-plasma resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition cursor-pointer"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 rounded-xl font-bold text-xs text-white-force bg-gradient-to-r from-plasma to-nova hover:from-plasma/90 hover:to-nova/90 shadow-lg shadow-plasma/25 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {submitting ? t.stayBooking.submitting : t.stayBooking.submitInquiry}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
