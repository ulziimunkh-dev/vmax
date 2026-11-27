import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, Send, CheckCircle2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EVENT_OCCASIONS,
  type EventVenue,
  type EventPackageItem,
} from '@/types/events';
import { eventsApi } from '@/services/eventsApi';
import { useAuthStore } from '@/store/useAuthStore';
import { useI18n } from '@/i18n';

interface EventInquiryModalProps {
  venue?: EventVenue;
  venues?: EventVenue[];
  isOpen: boolean;
  onClose: () => void;
  selectedPackage?: EventPackageItem | null;
  defaultEventType?: string;
  defaultDate?: string;
  defaultGuestCount?: number;
  onSuccess?: () => void;
}

export const EventInquiryModal: React.FC<EventInquiryModalProps> = ({
  venue,
  venues,
  isOpen,
  onClose,
  selectedPackage,
  defaultEventType,
  defaultDate,
  defaultGuestCount,
  onSuccess,
}) => {
  const { user } = useAuthStore();
  const { lang } = useI18n();

  const targetVenues = venues && venues.length > 0 ? venues : venue ? [venue] : [];
  const isBulk = targetVenues.length > 1;
  const primaryVenue = targetVenues[0];

  const [eventType, setEventType] = useState(
    defaultEventType || primaryVenue?.eventTypes?.[0] || 'NEW_YEAR',
  );
  const [eventDate, setEventDate] = useState(defaultDate || '');
  const [guestCount, setGuestCount] = useState(
    defaultGuestCount || selectedPackage?.minGuests || primaryVenue?.minCapacity || 50,
  );
  const [packageName, setPackageName] = useState(
    selectedPackage?.name || (selectedPackage as any)?.title || '',
  );
  const [contactName, setContactName] = useState(user?.name || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (defaultEventType) setEventType(defaultEventType);
    if (defaultDate) setEventDate(defaultDate);
    if (defaultGuestCount) setGuestCount(defaultGuestCount);
  }, [isOpen, defaultEventType, defaultDate, defaultGuestCount]);

  useEffect(() => {
    if (selectedPackage) {
      setPackageName(selectedPackage.name || (selectedPackage as any).title || '');
      if (selectedPackage.minGuests && !defaultGuestCount) {
        setGuestCount(selectedPackage.minGuests);
      }
    }
  }, [selectedPackage, defaultGuestCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isBulk) {
        await eventsApi.bulkInquire({
          venueIds: targetVenues.map((v) => v.id),
          eventType,
          eventDate,
          guestCount: Number(guestCount),
          packageName: packageName || undefined,
          contactName,
          contactPhone,
          message: notes || undefined,
        });
      } else if (primaryVenue) {
        await eventsApi.inquire(primaryVenue.id, {
          eventType,
          eventDate,
          guestCount: Number(guestCount),
          packageName: packageName || undefined,
          contactName,
          contactPhone,
          contactEmail: contactEmail || undefined,
          notes: notes || undefined,
          message: notes || undefined,
        });
      }
      setSuccess(true);
      onSuccess?.();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          (lang === 'en'
            ? 'Failed to send inquiry. Please try again.'
            : 'Хүсэлт илгээхэд алдаа гарлаа. Дахин оролдоно уу.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setSuccess(false);
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          onClick={resetAndClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            className="w-full max-w-lg rounded-2xl bg-void border border-white/15 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div>
                <h3 className="text-base font-heading font-bold text-starlight flex items-center gap-2">
                  <Sparkles size={16} className="text-plasma" />
                  {isBulk
                    ? lang === 'en'
                      ? `Send Quote Request to ${targetVenues.length} Venues`
                      : `${targetVenues.length} байгууллагад зэрэг үнийн санал илгээх`
                    : lang === 'en'
                    ? 'Request Booking / Quote'
                    : 'Захиалга & Үнийн санал авах'}
                </h3>
                <p className="text-xs text-nebula-text mt-0.5 line-clamp-1">
                  {targetVenues.map((v) => v.name).join(' • ')}
                </p>
              </div>
              <button
                type="button"
                onClick={resetAndClose}
                aria-label="Хаах"
                className="p-2 rounded-xl bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-starlight hover:bg-slate-300 dark:hover:bg-white/20 transition-colors cursor-pointer flex-shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {success ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 size={28} />
                </div>
                <h4 className="text-lg font-bold text-starlight">
                  {lang === 'en'
                    ? 'Inquiry Sent Successfully!'
                    : 'Таны хүсэлт амжилттай илгээгдлээ!'}
                </h4>
                <p className="text-sm text-nebula-text">
                  {isBulk
                    ? lang === 'en'
                      ? `Your quote request was sent to ${targetVenues.length} venues. They will contact you at ${contactPhone}.`
                      : `Таны үнийн саналын хүсэлт ${targetVenues.length} байгууллагад зэрэг илгээгдлээ. Менежерүүд ${contactPhone} дугаараар холбогдох болно.`
                    : lang === 'en'
                    ? `${primaryVenue?.name} will contact you shortly at ${contactPhone}.`
                    : `${primaryVenue?.name}-ийн менежер тантай ${contactPhone} дугаараар удахгүй холбогдох болно.`}
                </p>
                <button
                  onClick={resetAndClose}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-plasma to-nova text-white text-sm font-bold"
                >
                  {lang === 'en' ? 'Done' : 'Хаах'}
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="p-5 space-y-4 overflow-y-auto"
              >
                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-nebula-text mb-1.5">
                      {lang === 'en' ? 'Event Type' : 'Арга хэмжээний төрөл'} *
                    </label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-starlight focus:outline-none focus:border-plasma"
                    >
                      {EVENT_OCCASIONS.map((occ) => (
                        <option key={occ.id} value={occ.id} className="bg-void">
                          {occ.emoji} {occ[lang]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-nebula-text mb-1.5">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={12} />
                        {lang === 'en' ? 'Event Date' : 'Өдөр / Огноо'} *
                      </span>
                    </label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-starlight focus:outline-none focus:border-plasma"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-nebula-text mb-1.5">
                      <span className="inline-flex items-center gap-1">
                        <Users size={12} />
                        {lang === 'en' ? 'Estimated Guests' : 'Зочдын тоо'} *
                      </span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={Math.max(...targetVenues.map((v) => v.maxCapacity || 200), 500) * 2}
                      required
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-starlight focus:outline-none focus:border-plasma"
                    />
                  </div>

                  {!isBulk && primaryVenue && primaryVenue.packages?.length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-nebula-text mb-1.5">
                        {lang === 'en' ? 'Package (optional)' : 'Багц сонгох'}
                      </label>
                      <select
                        value={packageName}
                        onChange={(e) => setPackageName(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-starlight focus:outline-none focus:border-plasma"
                      >
                        <option value="" className="bg-void">
                          {lang === 'en' ? 'Custom / Decide later' : 'Тухайн үед шийднэ'}
                        </option>
                        {primaryVenue.packages.map((pkg) => {
                          const label = pkg.name || (pkg as any).title || 'Багц';
                          return (
                            <option
                              key={pkg.id}
                              value={label}
                              className="bg-void"
                            >
                              {label} ({(pkg.pricePerPerson || 0).toLocaleString()}₮)
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-nebula-text mb-1.5">
                      {lang === 'en' ? 'Your Name' : 'Таны нэр'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder={lang === 'en' ? 'Full name' : 'Нэрээ бичнэ үү'}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-starlight focus:outline-none focus:border-plasma"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-nebula-text mb-1.5">
                      {lang === 'en' ? 'Phone Number' : 'Утасны дугаар'} *
                    </label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="9911-XXXX"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-starlight focus:outline-none focus:border-plasma"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-nebula-text mb-1.5">
                    {lang === 'en' ? 'Additional Notes' : 'Нэмэлт хүсэлт / Тэмдэглэл'}
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={
                      lang === 'en'
                        ? 'Special menu, stage setup, DJ, budget preferences...'
                        : 'Тусгай меню, тайз гэрэлтүүлэг, хөтлөгч, төсвийн мэдээлэл гэх мэт...'
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-starlight focus:outline-none focus:border-plasma resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-plasma via-nova to-aurora text-white font-bold text-sm shadow-lg shadow-plasma/25 hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send size={15} />
                  {submitting
                    ? lang === 'en'
                      ? 'Sending...'
                      : 'Илгээж байна...'
                    : lang === 'en'
                    ? 'Send Booking Inquiry'
                    : 'Захиалгын хүсэлт илгээх'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
