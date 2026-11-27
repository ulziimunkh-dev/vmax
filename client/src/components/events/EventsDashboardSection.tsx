import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PartyPopper,
  Plus,
  ExternalLink,
  Edit2,
  Trash2,
  Users,
  MapPin,
  Calendar,
  Phone,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Send,
  ChevronLeft,
  ChevronRight,
  List,
  Sparkles,
  Building2,
  Eye,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';
import {
  type EventVenue,
  type EventInquiry,
  type EventOrganization,
  type EventPhoneRevealLog,
  type EventChatThread,
  EVENT_DISTRICTS,
  EVENT_OCCASIONS,
  getVenueTypeLabel,
  getOccasionLabel,
} from '@/types/events';
import { EventChatModal } from './EventChatModal';
import { eventsApi } from '@/services/eventsApi';
import { getImageUrl } from '@/utils/imageUrl';
import { useI18n } from '@/i18n';

interface EventsDashboardSectionProps {
  myOrg: EventOrganization | null;
  myVenues: EventVenue[];
  myInquiries: EventInquiry[];
  myPhoneReveals: EventPhoneRevealLog[];
  myChats: EventChatThread[];
  eventsLoading: boolean;
  onOrgSaved: (org: EventOrganization) => void;
  onVenueUpdated: (venue: EventVenue) => void;
  onDeleteVenue: (id: string) => void;
  onInquiryCreated: (created: EventInquiry) => void;
  onInquiryUpdated: (updated: EventInquiry) => void;
}

const STATUS_BADGES: Record<
  string,
  { label: string; className: string }
> = {
  PENDING: {
    label: 'Шинэ хүсэлт',
    className: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  CONTACTED: {
    label: 'Санал илгээсэн',
    className: 'bg-plasma/20 text-plasma border-plasma/30',
  },
  CONFIRMED: {
    label: 'Баталгаажсан',
    className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  CANCELLED: {
    label: 'Цуцлагдсан',
    className: 'bg-red-500/20 text-red-300 border-red-500/30',
  },
};

const VENUE_PRICING_TIERS = [
  {
    name: 'Free',
    price: '0₮',
    desc: 'Profile, зураг, үйлчилгээ',
    badge: 'Идэвхтэй',
  },
  {
    name: 'Standard',
    price: '49,000₮/сар',
    desc: 'Дэлгэрэнгүй profile, статистик',
    badge: 'Санал болгох',
  },
  {
    name: 'Premium',
    price: '99,000₮/сар',
    desc: 'Хайлтын дээгүүр гарах, онцлох profile',
    badge: 'Топ байрлал',
  },
  {
    name: 'Featured',
    price: '30,000₮/7 хоног',
    desc: 'Нүүр хуудсанд онцлох',
    badge: 'Шуурхай өсөлт',
  },
];

export const EventsDashboardSection: React.FC<EventsDashboardSectionProps> = ({
  myOrg,
  myVenues,
  myInquiries,
  myPhoneReveals,
  myChats,
  eventsLoading,
  onOrgSaved,
  onVenueUpdated,
  onDeleteVenue,
  onInquiryCreated,
  onInquiryUpdated,
}) => {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const [activeChatThread, setActiveChatThread] = useState<EventChatThread | null>(null);

  const [isOrgFormOpen, setIsOrgFormOpen] = useState(false);
  const [orgName, setOrgName] = useState(myOrg?.name || '');
  const [orgTagline, setOrgTagline] = useState(myOrg?.tagline || '');
  const [orgPhone, setOrgPhone] = useState(myOrg?.phone || '');
  const [orgEmail, setOrgEmail] = useState(myOrg?.email || '');
  const [orgDistrict, setOrgDistrict] = useState(myOrg?.district || 'Сүхбаатар');
  const [orgAddress, setOrgAddress] = useState(myOrg?.addressDetail || '');
  const [orgDesc, setOrgDesc] = useState(myOrg?.description || '');
  const [orgSaving, setOrgSaving] = useState(false);

  const openOrgEditor = () => {
    setOrgName(myOrg?.name || '');
    setOrgTagline(myOrg?.tagline || '');
    setOrgPhone(myOrg?.phone || '');
    setOrgEmail(myOrg?.email || '');
    setOrgDistrict(myOrg?.district || 'Сүхбаатар');
    setOrgAddress(myOrg?.addressDetail || '');
    setOrgDesc(myOrg?.description || '');
    setIsOrgFormOpen(true);
  };

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrgSaving(true);
    try {
      const payload = {
        name: orgName.trim(),
        tagline: orgTagline.trim() || undefined,
        phone: orgPhone.trim(),
        email: orgEmail.trim() || undefined,
        district: orgDistrict,
        addressDetail: orgAddress.trim() || undefined,
        description: orgDesc.trim() || undefined,
      };
      const res = myOrg
        ? await eventsApi.updateOrg(myOrg.id, payload)
        : await eventsApi.createOrg(payload);
      onOrgSaved(res.data);
      setIsOrgFormOpen(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Байгууллагын профайл хадгалахад алдаа гарлаа.');
    } finally {
      setOrgSaving(false);
    }
  };

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [quotingId, setQuotingId] = useState<string | null>(null);
  const [quotePrice, setQuotePrice] = useState<string>('');
  const [quoteMessage, setQuoteMessage] = useState<string>('');
  const [savingId, setSavingId] = useState<string | null>(null);

  // Calendar state (defaults to current month)
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth()); // 0-indexed
  const [selectedCalDate, setSelectedCalDate] = useState<string | null>(null);
  const [selectedCalVenueId, setSelectedCalVenueId] = useState<string>('ALL');
  const [togglingDate, setTogglingDate] = useState(false);

  // Quick manual booking form inside Calendar
  const [manualVenueId, setManualVenueId] = useState<string>('');
  const [manualEventType, setManualEventType] = useState<string>('NEW_YEAR');
  const [manualCustomerName, setManualCustomerName] = useState<string>('');
  const [manualCustomerPhone, setManualCustomerPhone] = useState<string>('');
  const [manualGuestCount, setManualGuestCount] = useState<number>(50);
  const [manualNotes, setManualNotes] = useState<string>('');
  const [savingManualBooking, setSavingManualBooking] = useState(false);

  const activeCalVenue =
    selectedCalVenueId === 'ALL'
      ? myVenues[0] || null
      : myVenues.find((v) => v.id === selectedCalVenueId) || myVenues[0] || null;

  const targetManualVenueId =
    manualVenueId ||
    (selectedCalVenueId !== 'ALL' ? selectedCalVenueId : myVenues[0]?.id || '');

  const handleToggleBookedDate = async (dateKey: string, venueOverride?: EventVenue) => {
    const targetVenue = venueOverride || activeCalVenue;
    if (!targetVenue) return;
    setTogglingDate(true);
    try {
      const current = targetVenue.bookedDates || [];
      const exists = current.includes(dateKey);
      const nextDates = exists
        ? current.filter((d) => d !== dateKey)
        : [...current, dateKey].sort();
      const res = await eventsApi.update(targetVenue.id, {
        bookedDates: nextDates,
      });
      onVenueUpdated(res.data);
    } catch (err) {
      console.error('Failed to update booked dates:', err);
      alert('Захиалгатай өдөр шинэчлэхэд алдаа гарлаа.');
    } finally {
      setTogglingDate(false);
    }
  };

  const handleSaveManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCalDate || !targetManualVenueId) return;
    setSavingManualBooking(true);
    try {
      const createdRes = await eventsApi.inquire(targetManualVenueId, {
        eventType: manualEventType,
        eventDate: selectedCalDate,
        guestCount: Number(manualGuestCount) || 20,
        contactName: manualCustomerName.trim(),
        contactPhone: manualCustomerPhone.trim(),
        notes: manualNotes.trim() || undefined,
        message: manualNotes.trim() || undefined,
      });
      const confirmedRes = await eventsApi.updateInquiry(createdRes.data.id, {
        status: 'CONFIRMED',
      });
      const targetVenue = myVenues.find((v) => v.id === targetManualVenueId);
      onInquiryCreated({
        ...confirmedRes.data,
        venue: targetVenue,
      });
      if (targetVenue) {
        const dateKey = selectedCalDate.slice(0, 10);
        const existingDates = targetVenue.bookedDates || [];
        if (!existingDates.includes(dateKey)) {
          onVenueUpdated({
            ...targetVenue,
            bookedDates: [...existingDates, dateKey].sort(),
          });
        }
      }
      setManualCustomerName('');
      setManualCustomerPhone('');
      setManualNotes('');
    } catch (err) {
      console.error('Failed to save manual booking:', err);
      alert('Захиалга бүртгэхэд алдаа гарлаа.');
    } finally {
      setSavingManualBooking(false);
    }
  };

  const filteredInquiries = useMemo(() => {
    if (statusFilter === 'ALL') return myInquiries;
    return myInquiries.filter((i) => i.status === statusFilter);
  }, [myInquiries, statusFilter]);

  const handleStatusChange = async (
    inquiryId: string,
    status: 'CONFIRMED' | 'CANCELLED' | 'CONTACTED',
  ) => {
    setSavingId(inquiryId);
    try {
      const res = await eventsApi.updateInquiry(inquiryId, { status });
      onInquiryUpdated(res.data);
    } catch (err) {
      console.error('Failed to update inquiry status:', err);
      alert('Төлөв шинэчлэхэд алдаа гарлаа.');
    } finally {
      setSavingId(null);
    }
  };

  const handleSendQuote = async (inquiryId: string) => {
    setSavingId(inquiryId);
    try {
      const res = await eventsApi.updateInquiry(inquiryId, {
        status: 'CONTACTED',
        quotedPrice: quotePrice ? Number(quotePrice) : undefined,
        quoteMessage: quoteMessage.trim() || undefined,
      });
      onInquiryUpdated(res.data);
      setQuotingId(null);
      setQuotePrice('');
      setQuoteMessage('');
    } catch (err) {
      console.error('Failed to send quote:', err);
      alert('Үнийн санал илгээхэд алдаа гарлаа.');
    } finally {
      setSavingId(null);
    }
  };

  // Calendar helpers
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(calYear, calMonth, 1).getDay() + 6) % 7; // Mon=0..Sun=6
  const monthPrefix = `${calYear}-${String(calMonth + 1).padStart(2, '0')}`;

  const inquiriesByDate = useMemo(() => {
    const map: Record<string, EventInquiry[]> = {};
    myInquiries.forEach((inq) => {
      if (!inq.eventDate) return;
      if (selectedCalVenueId !== 'ALL' && inq.venueId !== selectedCalVenueId) return;
      const key = inq.eventDate.slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(inq);
    });
    return map;
  }, [myInquiries, selectedCalVenueId]);

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalYear((y) => y - 1);
      setCalMonth(11);
    } else {
      setCalMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (calMonth === 11) {
      setCalYear((y) => y + 1);
      setCalMonth(0);
    } else {
      setCalMonth((m) => m + 1);
    }
  };

  if (eventsLoading) {
    return (
      <div className="glass-card p-12 text-center text-nebula-text rounded-2xl">
        <RefreshCw size={28} className="animate-spin mx-auto mb-3 text-plasma" />
        <p className="text-sm">Байгууллагын профайл ачаалж байна...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Progress Steps Header (What's Next) */}
      {(() => {
        const step1Done = Boolean(myOrg);
        const step2Done = step1Done && myVenues.length > 0;
        const step3Done = step2Done && myInquiries.length > 0;
        const currentStep = !step1Done ? 1 : !step2Done ? 2 : 3;

        const steps = [
          {
            num: 1,
            title: 'Байгууллагын Профайл',
            desc: step1Done ? `${myOrg?.name} (1/1)` : 'Үндсэн мэдээлэл, утас, хаяг (1/1)',
            done: step1Done,
          },
          {
            num: 2,
            title: 'Ресторан / Эвент заал нэмэх',
            desc: step2Done
              ? `${myVenues.length} газар бүртгэгдсэн`
              : 'Заал, ресторан, багтаамж, зураг оруулах',
            done: step2Done,
          },
          {
            num: 3,
            title: 'Захиалга & Үнийн санал',
            desc: step3Done
              ? `${myInquiries.length} захиалгын хүсэлт ирсэн`
              : 'Хэрэглэгчээс захиалга авч баталгаажуулах',
            done: step3Done,
          },
        ];

        return (
          <div className="glass-card p-4 sm:p-5 rounded-2xl border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {steps.map((s) => {
                const isNext = currentStep === s.num && !s.done;
                return (
                  <div
                    key={s.num}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                      s.done
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : isNext
                        ? 'bg-plasma/15 border-plasma/50 shadow-lg shadow-plasma/10'
                        : 'bg-white/[0.03] border-white/10 opacity-65'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                        s.done
                          ? 'bg-emerald-500 text-white'
                          : isNext
                          ? 'bg-plasma text-white'
                          : 'bg-white/10 text-nebula-text'
                      }`}
                    >
                      {s.done ? <CheckCircle2 size={15} /> : s.num}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-starlight truncate">
                          Алхам {s.num}: {s.title}
                        </span>
                        {isNext && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-plasma text-white flex-shrink-0">
                            Дараагийнх
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-nebula-text mt-0.5 truncate">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* 1. Step 1: Organization Profile (1/1) */}
      {!myOrg || isOrgFormOpen ? (
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-plasma/30 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-plasma/20 text-plasma flex items-center justify-center">
                <Building2 size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-starlight">
                  {myOrg ? 'Байгууллагын Профайл засах (1/1)' : 'Алхам 1: Байгууллагын Профайл үүсгэх (1/1)'}
                </h3>
                <p className="text-xs text-nebula-text">
                  Эхлээд байгууллагын үндсэн профайлаа үүсгэсний дараа ресторан, эвент заалуудаа нэмнэ үү.
                </p>
              </div>
            </div>
            {myOrg && (
              <button
                type="button"
                onClick={() => setIsOrgFormOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-white/5 text-xs text-nebula-text hover:text-white cursor-pointer"
              >
                Болих
              </button>
            )}
          </div>

          <form onSubmit={handleSaveOrg} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-nebula-text mb-1">
                  Байгууллагын нэр *
                </label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Жишээ: Номадс Хоспиталити Групп"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-starlight focus:outline-none focus:border-plasma"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-nebula-text mb-1">
                  Холбоо барих утас *
                </label>
                <input
                  type="tel"
                  required
                  value={orgPhone}
                  onChange={(e) => setOrgPhone(e.target.value)}
                  placeholder="9911-XXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-starlight focus:outline-none focus:border-plasma"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-nebula-text mb-1">Дүүрэг</label>
                <select
                  value={orgDistrict}
                  onChange={(e) => setOrgDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-starlight focus:outline-none focus:border-plasma"
                >
                  {EVENT_DISTRICTS.map((d) => (
                    <option key={d} value={d} className="bg-void">
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-nebula-text mb-1">И-мэйл</label>
                <input
                  type="email"
                  value={orgEmail}
                  onChange={(e) => setOrgEmail(e.target.value)}
                  placeholder="info@company.mn"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-starlight focus:outline-none focus:border-plasma"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-nebula-text mb-1">Товч уриа</label>
                <input
                  type="text"
                  value={orgTagline}
                  onChange={(e) => setOrgTagline(e.target.value)}
                  placeholder="Шинэ жил, хурим найрын шилдэг сүлжээ"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-starlight focus:outline-none focus:border-plasma"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-nebula-text mb-1">
                Хаяг & Танилцуулга
              </label>
              <input
                type="text"
                value={orgAddress}
                onChange={(e) => setOrgAddress(e.target.value)}
                placeholder="Төв оффис / байршлын хаяг"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-starlight focus:outline-none focus:border-plasma mb-2"
              />
              <textarea
                rows={2}
                value={orgDesc}
                onChange={(e) => setOrgDesc(e.target.value)}
                placeholder="Байгууллагын товч танилцуулга..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-starlight focus:outline-none focus:border-plasma resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={orgSaving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-plasma to-nova text-white font-bold text-sm shadow-lg shadow-plasma/25 cursor-pointer disabled:opacity-50"
            >
              {orgSaving
                ? 'Хадгалж байна...'
                : myOrg
                ? 'Профайл шинэчлэх'
                : 'Байгууллагын Профайл үүсгэх'}
            </button>
          </form>
        </div>
      ) : (
        <div className="glass-card p-5 sm:p-6 rounded-2xl border border-plasma/30 bg-plasma/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-plasma to-aurora flex items-center justify-center text-white flex-shrink-0">
              <Building2 size={24} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-starlight">{myOrg.name}</h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Байгууллагын Профайл (1/1)
                </span>
              </div>
              {myOrg.tagline && (
                <p className="text-xs text-nebula-text mt-0.5">{myOrg.tagline}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-nebula-text">
                <span>📞 {myOrg.phone}</span>
                <span>📍 {myOrg.district}{myOrg.addressDetail ? `, ${myOrg.addressDetail}` : ''}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={openOrgEditor}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-starlight text-xs font-bold border border-white/15 self-start sm:self-center cursor-pointer"
          >
            <Edit2 size={13} />
            <span>Профайл засах</span>
          </button>
        </div>
      )}

      {/* 2. Step 2: Restaurants & Event Halls under the Organization */}
      {myOrg && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base sm:text-lg font-bold text-starlight flex items-center gap-2">
              <PartyPopper size={18} className="text-plasma" />
              <span>Байгууллагын Ресторан & Эвент заалууд ({myVenues.length})</span>
            </h3>
            <button
              type="button"
              onClick={() => navigate('/create-event-venue')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-plasma to-nova text-white font-bold text-xs shadow-lg shadow-plasma/20 cursor-pointer"
            >
              <Plus size={14} />
              <span>Ресторан / Заал нэмэх</span>
            </button>
          </div>

          {myVenues.length === 0 ? (
            <div className="glass-card p-8 rounded-2xl border border-white/10 text-center space-y-3">
              <p className="text-sm font-semibold text-starlight">
                Одоогоор ресторан эсвэл эвент заал нэмээгүй байна
              </p>
              <p className="text-xs text-nebula-text">
                Дээрх "+ Ресторан / Заал нэмэх" товчийг дарж өөрийн танхим, ресторануудаа бүртгэнэ үү.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {myVenues.map((venue) => {
                const cover = venue.coverUrl || venue.images?.[0] || '/placeholder.png';
                return (
                  <div
                    key={venue.id}
                    className="glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-plasma/40 transition-all flex flex-col"
                  >
                    <div className="relative h-44 bg-void/80 overflow-hidden">
                      <img
                        src={getImageUrl(cover)}
                        alt={venue.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-[11px] font-bold text-white border border-white/20 shadow-sm">
                        {getVenueTypeLabel(venue.venueType, lang)}
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h4 className="text-lg font-bold text-starlight line-clamp-1">
                          {venue.name}
                        </h4>
                        {venue.tagline && (
                          <p className="text-xs text-nebula-text line-clamp-1 mt-0.5">
                            {venue.tagline}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-nebula-text">
                          <span className="flex items-center gap-1">
                            <Users size={13} className="text-plasma" />
                            {venue.minCapacity}–{venue.maxCapacity} хүн
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={13} className="text-aurora" />
                            {venue.district}
                          </span>
                          {venue.pricePerPerson && (
                            <span className="text-aurora font-bold">
                              {venue.pricePerPerson.toLocaleString()}₮/хүн
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2.5 text-[11px] text-nebula-text">
                          <span className="flex items-center gap-1">
                            <Eye size={12} className="text-plasma" />
                            {venue.views || 0} үзэлт
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone size={12} className="text-emerald-400" />
                            {venue.phoneRevealsCount || 0} утас харсан
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                        <button
                          onClick={() => navigate(`/events/${venue.id}`)}
                          className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-starlight text-xs font-semibold border border-white/10 cursor-pointer"
                        >
                          <ExternalLink size={13} />
                          <span>Харах</span>
                        </button>
                        <button
                          onClick={() => navigate(`/create-event-venue?edit=${venue.id}`)}
                          className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-xl bg-plasma/20 hover:bg-plasma/30 text-plasma text-xs font-bold border border-plasma/30 cursor-pointer"
                        >
                          <Edit2 size={13} />
                          <span>Засах</span>
                        </button>
                        <button
                          onClick={() => onDeleteVenue(venue.id)}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 cursor-pointer"
                          title="Устгах"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. Booking Inquiries, Quote Sending, Confirmation & Calendar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base sm:text-lg font-bold text-starlight flex items-center gap-2">
            <Calendar size={18} className="text-aurora" />
            <span>Захиалгын хүсэлт, баталгаажуулалт & Түүх ({myInquiries.length})</span>
          </h3>

          <div className="inline-flex items-center p-1 rounded-xl bg-void/60 border border-white/10 self-start">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-plasma text-white'
                  : 'text-nebula-text hover:text-white'
              }`}
            >
              <List size={14} />
              <span>Жагсаалт / Түүх</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-plasma text-white'
                  : 'text-nebula-text hover:text-white'
              }`}
            >
              <Calendar size={14} />
              <span>Календарь</span>
            </button>
          </div>
        </div>

        {viewMode === 'calendar' ? (
          <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-4">
            {/* Venue Pill Tabs + Legend */}
            {myVenues.length > 0 && (
              <div className="space-y-3 pb-3 border-b border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-starlight">
                    Заал / Ресторанаар ялгаж харах:
                  </span>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold">
                    <span className="flex items-center gap-1 text-red-500 dark:text-red-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Захиалгатай
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Баталгаажсан
                    </span>
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Хүлээгдэж буй
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCalVenueId('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedCalVenueId === 'ALL'
                        ? 'bg-plasma text-white border-plasma'
                        : 'bg-white/5 text-nebula-text border-white/10 hover:text-white'
                    }`}
                  >
                    Бүх заал ({myVenues.length})
                  </button>
                  {myVenues.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedCalVenueId(v.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedCalVenueId === v.id
                          ? 'bg-plasma text-white border-plasma'
                          : 'bg-white/5 text-nebula-text border-white/10 hover:text-white'
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={prevMonth}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-starlight cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <h4 className="text-sm sm:text-base font-bold text-starlight">
                {calYear} оны {calMonth + 1}-р сар
              </h4>
              <button
                type="button"
                onClick={nextMonth}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-starlight cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-bold text-nebula-text">
              {['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'].map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="h-14 rounded-xl bg-white/[0.02]" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const dateKey = `${monthPrefix}-${String(day).padStart(2, '0')}`;
                const dayItems = inquiriesByDate[dateKey] || [];
                const bookedVenuesForDay =
                  selectedCalVenueId === 'ALL'
                    ? myVenues.filter((v) => (v.bookedDates || []).includes(dateKey))
                    : activeCalVenue && (activeCalVenue.bookedDates || []).includes(dateKey)
                    ? [activeCalVenue]
                    : [];
                const isManuallyBooked = bookedVenuesForDay.length > 0;
                const hasConfirmed = dayItems.some((x) => x.status === 'CONFIRMED');
                const hasPending = dayItems.some(
                  (x) => x.status === 'PENDING' || x.status === 'CONTACTED',
                );
                const isSelected = selectedCalDate === dateKey;

                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() => setSelectedCalDate(isSelected ? null : dateKey)}
                    className={`h-16 p-1.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-plasma bg-plasma/20 ring-2 ring-plasma/40'
                        : isManuallyBooked
                        ? 'border-red-500/40 bg-red-500/15'
                        : hasConfirmed
                        ? 'border-emerald-500/40 bg-emerald-500/15'
                        : hasPending
                        ? 'border-amber-500/40 bg-amber-500/15'
                        : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.08]'
                    }`}
                  >
                    <span className="text-xs font-bold text-starlight">{day}</span>
                    {dayItems.length > 0 ? (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-300 truncate">
                        {dayItems[0].contactName} ({dayItems.length})
                      </span>
                    ) : isManuallyBooked ? (
                      <span className="text-[10px] font-bold text-red-600 dark:text-red-300 truncate">
                        {selectedCalVenueId === 'ALL' && myVenues.length > 1
                          ? `${bookedVenuesForDay.length} заал дүүрсэн`
                          : 'Захиалгатай'}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {selectedCalDate && (
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h5 className="text-sm font-bold text-starlight">
                    📅 {selectedCalDate} өдрийн захиалга ба төлөв
                  </h5>
                  {activeCalVenue && (
                    <button
                      type="button"
                      disabled={togglingDate}
                      onClick={() => handleToggleBookedDate(selectedCalDate)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer disabled:opacity-50 ${
                        (activeCalVenue.bookedDates || []).includes(selectedCalDate)
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-300'
                          : 'bg-red-500/20 border-red-500/40 text-red-600 dark:text-red-300'
                      }`}
                    >
                      {(activeCalVenue.bookedDates || []).includes(selectedCalDate)
                        ? `✓ ${activeCalVenue.name}: Сул болгох`
                        : `✕ ${activeCalVenue.name}: Дүүрсэн болгох`}
                    </button>
                  )}
                </div>

                {/* Bookings List for Selected Date */}
                {(inquiriesByDate[selectedCalDate] || []).length === 0 ? (
                  <p className="text-xs text-nebula-text">
                    Энэ өдөр бүртгэгдсэн захиалга алга. Доорх хэсгээс шууд захиалга нэмэх боломжтой.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {(inquiriesByDate[selectedCalDate] || []).map((inq) => (
                      <div
                        key={inq.id}
                        className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-plasma/20 text-plasma border border-plasma/30">
                              {inq.venue?.name ||
                                myVenues.find((v) => v.id === inq.venueId)?.name ||
                                'Заал'}
                            </span>
                            <span className="font-bold text-starlight">
                              {getOccasionLabel(inq.eventType, lang)}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                STATUS_BADGES[inq.status]?.className || ''
                              }`}
                            >
                              {STATUS_BADGES[inq.status]?.label || inq.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-nebula-text">
                            <span className="font-semibold text-starlight">
                              👤 {inq.contactName}
                            </span>
                            <span>👥 {inq.guestCount} хүн</span>
                            {(inq.message || inq.notes) && (
                              <span className="italic">"{inq.message || inq.notes}"</span>
                            )}
                          </div>
                        </div>

                        <a
                          href={`tel:${inq.contactPhone}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 font-bold self-start sm:self-center"
                        >
                          <Phone size={12} />
                          <span>{inq.contactPhone}</span>
                        </a>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Manual Booking Form for Selected Date */}
                {myVenues.length > 0 && (
                  <form
                    onSubmit={handleSaveManualBooking}
                    className="p-4 rounded-2xl bg-white/5 border border-plasma/30 space-y-3"
                  >
                    <div className="text-xs font-bold text-starlight">
                      📝 {selectedCalDate} өдөр захиалга бүртгэх (Захиалагчийн мэдээлэл оруулах)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {myVenues.length > 1 && (
                        <select
                          value={targetManualVenueId}
                          onChange={(e) => setManualVenueId(e.target.value)}
                          className="px-3 py-2 rounded-xl bg-void/70 border border-white/10 text-xs text-starlight"
                        >
                          {myVenues.map((v) => (
                            <option key={v.id} value={v.id} className="bg-void">
                              {v.name}
                            </option>
                          ))}
                        </select>
                      )}
                      <select
                        value={manualEventType}
                        onChange={(e) => setManualEventType(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-void/70 border border-white/10 text-xs text-starlight"
                      >
                        {EVENT_OCCASIONS.map((occ) => (
                          <option key={occ.id} value={occ.id} className="bg-void">
                            {occ.emoji} {occ[lang]}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        required
                        value={manualGuestCount}
                        onChange={(e) => setManualGuestCount(Number(e.target.value))}
                        placeholder="Зочдын тоо"
                        className="px-3 py-2 rounded-xl bg-void/70 border border-white/10 text-xs text-starlight"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <input
                        type="text"
                        required
                        value={manualCustomerName}
                        onChange={(e) => setManualCustomerName(e.target.value)}
                        placeholder="Захиалагчийн нэр *"
                        className="px-3 py-2 rounded-xl bg-void/70 border border-white/10 text-xs text-starlight"
                      />
                      <input
                        type="tel"
                        required
                        value={manualCustomerPhone}
                        onChange={(e) => setManualCustomerPhone(e.target.value)}
                        placeholder="Утасны дугаар *"
                        className="px-3 py-2 rounded-xl bg-void/70 border border-white/10 text-xs text-starlight"
                      />
                      <input
                        type="text"
                        value={manualNotes}
                        onChange={(e) => setManualNotes(e.target.value)}
                        placeholder="Тэмдэглэл (сонголттой)"
                        className="px-3 py-2 rounded-xl bg-void/70 border border-white/10 text-xs text-starlight"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={savingManualBooking}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-plasma to-nova text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                    >
                      {savingManualBooking
                        ? 'Хадгалж байна...'
                        : '✓ Захиалга бүртгэх (Баталгаажуулах)'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Status Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'ALL', label: 'Бүгд' },
                { id: 'PENDING', label: 'Шинэ хүсэлт' },
                { id: 'CONTACTED', label: 'Санал илгээсэн' },
                { id: 'CONFIRMED', label: 'Баталгаажсан' },
                { id: 'CANCELLED', label: 'Цуцлагдсан' },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    statusFilter === st.id
                      ? 'bg-plasma text-white border-plasma'
                      : 'bg-white/5 text-nebula-text border-white/10 hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {filteredInquiries.length === 0 ? (
              <div className="glass-card p-6 rounded-2xl border border-white/10 text-center text-xs sm:text-sm text-nebula-text">
                Энэ ангилалд захиалгын хүсэлт алга байна.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredInquiries.map((inq) => {
                  const badge = STATUS_BADGES[inq.status] || STATUS_BADGES.PENDING;
                  const isQuoting = quotingId === inq.id;
                  const isSaving = savingId === inq.id;

                  return (
                    <div
                      key={inq.id}
                      className="glass-card p-4 sm:p-5 rounded-2xl border border-white/10 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                            <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-white/5 text-starlight border border-white/10">
                              {getOccasionLabel(inq.eventType, lang)}
                            </span>
                            <span className="text-sm font-bold text-starlight">
                              {inq.venue?.name || 'Эвент газар'}
                            </span>
                            {inq.packageName && (
                              <span className="text-xs text-aurora font-semibold">
                                • {inq.packageName}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-nebula-text">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} /> {inq.eventDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users size={12} /> {inq.guestCount} зочин
                            </span>
                            <span>• {inq.contactName}</span>
                          </div>

                          {(inq.message || inq.notes) && (
                            <p className="text-xs text-nebula-text/80 italic">
                              "{inq.message || inq.notes}"
                            </p>
                          )}

                          {inq.quotedPrice && (
                            <div className="text-xs text-aurora font-bold pt-1">
                              Илгээсэн үнийн санал: {inq.quotedPrice.toLocaleString()}₮
                              {inq.quoteMessage ? ` — ${inq.quoteMessage}` : ''}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                          <a
                            href={`tel:${inq.contactPhone}`}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold"
                          >
                            <Phone size={13} />
                            <span>{inq.contactPhone}</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => {
                              setQuotingId(isQuoting ? null : inq.id);
                              setQuotePrice(inq.quotedPrice ? String(inq.quotedPrice) : '');
                              setQuoteMessage(inq.quoteMessage || '');
                            }}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-plasma/20 hover:bg-plasma/30 text-plasma border border-plasma/30 text-xs font-bold cursor-pointer"
                          >
                            <Send size={13} />
                            <span>Үнийн санал</span>
                          </button>

                          {inq.status !== 'CONFIRMED' && (
                            <button
                              type="button"
                              disabled={isSaving}
                              onClick={() => handleStatusChange(inq.id, 'CONFIRMED')}
                              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                            >
                              <CheckCircle2 size={13} />
                              <span>Баталгаажуулах</span>
                            </button>
                          )}

                          {inq.status !== 'CANCELLED' && (
                            <button
                              type="button"
                              disabled={isSaving}
                              onClick={() => handleStatusChange(inq.id, 'CANCELLED')}
                              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 cursor-pointer disabled:opacity-50"
                              title="Цуцлах"
                            >
                              <XCircle size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {isQuoting && (
                        <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                          <input
                            type="number"
                            value={quotePrice}
                            onChange={(e) => setQuotePrice(e.target.value)}
                            placeholder="Нийт эсвэл 1 хүний үнийн санал (₮)"
                            className="sm:col-span-4 px-3 py-2 rounded-xl bg-void/70 border border-white/10 text-xs text-starlight"
                          />
                          <input
                            type="text"
                            value={quoteMessage}
                            onChange={(e) => setQuoteMessage(e.target.value)}
                            placeholder="Тайлбар (жишээ: 12/25-нд сул байна, 1 хүний 150,000₮)"
                            className="sm:col-span-6 px-3 py-2 rounded-xl bg-void/70 border border-white/10 text-xs text-starlight"
                          />
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handleSendQuote(inq.id)}
                            className="sm:col-span-2 px-3 py-2 rounded-xl bg-plasma text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                          >
                            Илгээх
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* 3. Phone Reveal Audit & View Statistics */}
      {myVenues.length > 0 && (
        <div className="glass-card p-5 sm:p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-aurora" />
              <h3 className="text-sm sm:text-base font-bold text-starlight">
                Утас үзсэн хэрэглэгчдийн бүртгэл & Статистик ({myPhoneReveals.length})
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-nebula-text">
                Нийт үзэлт:{' '}
                <strong className="text-starlight">
                  {myVenues.reduce((s, v) => s + (v.views || 0), 0)}
                </strong>
              </span>
              <span className="text-nebula-text">
                Утас харсан:{' '}
                <strong className="text-plasma">
                  {myVenues.reduce((s, v) => s + (v.phoneRevealsCount || 0), 0)}
                </strong>
              </span>
            </div>
          </div>

          {myPhoneReveals.length === 0 ? (
            <p className="text-xs text-nebula-text text-center py-4">
              Одоогоор утасны дугаар дээр дарж харсан бүртгэл алга байна.
            </p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {myPhoneReveals.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-plasma to-aurora flex items-center justify-center text-white font-bold flex-shrink-0">
                      {(log.viewerUser?.name || 'З')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-starlight truncate">
                        {log.viewerUser?.name || 'Зочин хэрэглэгч'}{' '}
                        <span className="font-normal text-nebula-text">
                          • {log.venueName}
                        </span>
                      </div>
                      <div className="text-[11px] text-nebula-text truncate">
                        {log.viewerUser?.phone ? `📞 ${log.viewerUser.phone}` : 'Утас бүртгэлгүй'}
                        {log.viewerUser?.email ? ` • ${log.viewerUser.email}` : ''}
                        {log.viewerIp ? ` • IP: ${log.viewerIp}` : ''}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-nebula-text flex-shrink-0">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Direct Chats from Customers */}
      {myVenues.length > 0 && (
        <div className="glass-card p-5 sm:p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-plasma" />
            <h3 className="text-sm sm:text-base font-bold text-starlight">
              Ирсэн шууд чатууд ({myChats.length})
            </h3>
          </div>

          {myChats.length === 0 ? (
            <p className="text-xs text-nebula-text text-center py-4">
              Одоогоор хэрэглэгчээс шууд чат ирээгүй байна.
            </p>
          ) : (
            <div className="space-y-2.5">
              {myChats.map((thread) => {
                const lastMsg = thread.messages[thread.messages.length - 1];
                return (
                  <div
                    key={thread.key}
                    className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs font-bold text-starlight">
                        <span>{thread.customerName}</span>
                        <span className="text-nebula-text font-normal">
                          • {thread.venueName}
                        </span>
                      </div>
                      {lastMsg && (
                        <p className="text-xs text-nebula-text truncate mt-0.5">
                          {lastMsg.senderName}: {lastMsg.content}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveChatThread(thread)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-plasma to-aurora text-white text-xs font-bold cursor-pointer flex-shrink-0 self-start sm:self-center"
                    >
                      <MessageSquare size={13} />
                      <span>Чат нээх</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeChatThread && (
        <EventChatModal
          venue={{ id: activeChatThread.venueId, name: activeChatThread.venueName }}
          customerUserId={activeChatThread.customerUserId}
          customerName={activeChatThread.customerName}
          isOpen={Boolean(activeChatThread)}
          onClose={() => setActiveChatThread(null)}
        />
      )}

      {/* 5. Vmax.mn Event Venue Membership Tiers */}
      <div className="glass-card p-5 sm:p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-amber-400" />
          <h3 className="text-sm sm:text-base font-bold text-starlight">
            Эвент байгууллагын гишүүнчлэлийн багцууд (Бизнес өсөлт)
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {VENUE_PRICING_TIERS.map((tier) => (
            <div
              key={tier.name}
              className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-2"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-black text-starlight">{tier.name}</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-plasma/20 text-plasma">
                    {tier.badge}
                  </span>
                </div>
                <div className="text-base font-black text-aurora mt-1">{tier.price}</div>
                <p className="text-xs text-nebula-text mt-1">{tier.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
