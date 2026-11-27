import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Users,
  Phone,
  Star,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Calendar,
  Eye,
  Mail,
  Globe,
  Lock,
  MessageSquare,
  Edit2,
} from 'lucide-react';
import { eventsApi } from '@/services/eventsApi';
import {
  type EventVenue,
  type EventPackageItem,
  getVenueTypeLabel,
  getOccasionLabel,
  maskPhoneNumber,
} from '@/types/events';
import { EventInquiryModal } from '@/components/events/EventInquiryModal';
import { EventChatModal } from '@/components/events/EventChatModal';
import { VideoEmbedPlayer } from '@/components/events/VideoEmbedPlayer';
import { useAuthStore } from '@/store/useAuthStore';
import { useI18n } from '@/i18n';
import { getImageUrl } from '@/utils/imageUrl';

export const EventVenueDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const defaultEventType = searchParams.get('eventType') || undefined;
  const defaultDate = searchParams.get('date') || undefined;
  const defaultGuestsParam = searchParams.get('guests');
  const defaultGuestCount = defaultGuestsParam ? Number(defaultGuestsParam) : undefined;
  const { user } = useAuthStore();
  const { lang } = useI18n();
  const [venue, setVenue] = useState<EventVenue | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] =
    useState<EventPackageItem | null>(null);

  const [isPhoneRevealed, setIsPhoneRevealed] = useState(false);
  const [revealedPhone, setRevealedPhone] = useState<string | null>(null);
  const [revealedSecondaryPhone, setRevealedSecondaryPhone] = useState<string | null>(null);
  const [phoneRevealsCount, setPhoneRevealsCount] = useState(0);
  const [revealing, setRevealing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    eventsApi
      .getOne(id)
      .then((res) => {
        setVenue(res.data);
        setPhoneRevealsCount(res.data.phoneRevealsCount || 0);
        const firstImg =
          res.data.coverUrl ||
          res.data.images?.[0] ||
          'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80';
        setActiveImage(firstImg);
      })
      .catch((err) => {
        console.error('Failed to load event venue:', err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 max-w-6xl mx-auto">
        <div className="h-96 rounded-3xl bg-white/5 animate-pulse mb-6" />
        <div className="h-48 rounded-3xl bg-white/5 animate-pulse" />
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 text-center max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-starlight mb-3">
          {lang === 'en' ? 'Venue Not Found' : 'Эвент газар олдсонгүй'}
        </h2>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-plasma text-white text-sm font-bold"
        >
          <ArrowLeft size={16} />
          {lang === 'en' ? 'Back to Events' : 'Буцах'}
        </Link>
      </div>
    );
  }

  const gallery = Array.from(
    new Set(
      [venue.coverUrl, ...(venue.images || [])].filter(
        (img): img is string => Boolean(img),
      ),
    ),
  );

  const cleanPhone = String(user?.phone || '').replace(/\D/g, '');
  const userEmail = String(user?.email || '').trim().toLowerCase();
  const isSuperAdmin = Boolean(
    cleanPhone.endsWith('89767700') ||
      cleanPhone.endsWith('89357373') ||
      userEmail === 'uujgii36@gmail.com' ||
      userEmail === 'ulziimunkhb.1@gmail.com',
  );
  const isOwner = Boolean(
    user && ((venue?.userId && user.id === venue.userId) || isSuperAdmin),
  );

  const handleRevealPhone = async () => {
    if (!venue || isPhoneRevealed || revealing) return;
    setRevealing(true);
    try {
      const res = await eventsApi.revealContact(venue.id);
      setRevealedPhone(res.data.phone);
      if (res.data.secondaryPhone) {
        setRevealedSecondaryPhone(res.data.secondaryPhone);
      }
      setPhoneRevealsCount(res.data.revealsCount);
      setIsPhoneRevealed(true);
    } catch {
      setRevealedPhone(venue.phone);
      setRevealedSecondaryPhone(venue.secondaryPhone || null);
      setPhoneRevealsCount((prev) => prev + 1);
      setIsPhoneRevealed(true);
    } finally {
      setRevealing(false);
    }
  };

  const openBookingModal = (pkg?: EventPackageItem) => {
    setSelectedPackage(pkg || null);
    setIsInquiryOpen(true);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-sm text-nebula-text hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          <span>
            {lang === 'en'
              ? 'All Restaurants & Event Halls'
              : 'Бүх Ресторан & Эвент заал руу буцах'}
          </span>
        </Link>

        {isOwner && (
          <Link
            to={`/create-event-venue?edit=${venue.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-plasma hover:bg-plasma/90 text-white text-xs sm:text-sm font-bold shadow-lg shadow-plasma/25 transition-all"
          >
            <Edit2 size={15} />
            <span>{lang === 'en' ? 'Edit Venue' : 'Мэдээлэл засах'}</span>
          </Link>
        )}
      </div>

      {/* Gallery */}
      <div className="rounded-3xl overflow-hidden bg-void/60 border border-white/10 mb-8">
        <div className="relative h-72 sm:h-[420px] bg-black/50">
          <img
            src={getImageUrl(activeImage)}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent" />

          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900/80 backdrop-blur-md text-white border border-white/20 shadow-sm">
              {getVenueTypeLabel(venue.venueType, lang)}
            </span>
            {venue.isFeatured && (
              <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center gap-1 shadow-sm">
                <Sparkles size={13} />
                VIP
              </span>
            )}
            {venue.isVerified && (
              <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900/80 backdrop-blur-md text-emerald-400 border border-emerald-400/40 flex items-center gap-1 shadow-sm">
                <ShieldCheck size={14} />
                {lang === 'en' ? 'Verified' : 'Баталгаажсан'}
              </span>
            )}
          </div>
        </div>

        {gallery.length > 1 && (
          <div className="p-3 flex gap-2.5 overflow-x-auto bg-void/80 border-t border-white/10">
            {gallery.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`relative w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                  activeImage === img
                    ? 'border-plasma scale-105'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={getImageUrl(img)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Occasions */}
          <div className="p-6 rounded-2xl bg-void/60 border border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-heading font-black text-starlight">
                {venue.name}
              </h1>
              <div className="flex items-center gap-3 text-xs text-nebula-text">
                <span className="flex items-center gap-1 text-amber-300 font-bold">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  {venue.rating?.toFixed(1) || '4.9'} ({venue.reviewsCount})
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={14} />
                  {venue.views}
                </span>
              </div>
            </div>

            {venue.tagline && (
              <p className="text-sm text-aurora font-medium mb-4">
                {venue.tagline}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mb-5">
              {(venue.eventTypes || []).map((occ) => (
                <span
                  key={occ}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-plasma/15 border border-plasma/30 text-starlight"
                >
                  {getOccasionLabel(occ, lang)}
                </span>
              ))}
            </div>

            <p className="text-sm text-nebula-text leading-relaxed whitespace-pre-line">
              {venue.description}
            </p>
          </div>

          {/* Walkthrough Reel Video */}
          {venue.videoUrl && (
            <div className="p-6 rounded-2xl bg-void/60 border border-white/10 space-y-3">
              <h2 className="text-lg font-heading font-bold text-starlight">
                {lang === 'en' ? '🎬 Venue Walkthrough Reel' : '🎬 Заалны танилцуулга Reel'}
              </h2>
              <div className="rounded-2xl overflow-hidden bg-black border border-white/10">
                <VideoEmbedPlayer url={venue.videoUrl} />
              </div>
            </div>
          )}

          {/* Amenities */}
          {venue.amenities && venue.amenities.length > 0 && (
            <div className="p-6 rounded-2xl bg-void/60 border border-white/10">
              <h2 className="text-lg font-heading font-bold text-starlight mb-4">
                {lang === 'en'
                  ? 'Facilities & Amenities'
                  : 'Боломжууд & Тоноглол'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {venue.amenities.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 text-sm text-starlight"
                  >
                    <CheckCircle2
                      size={16}
                      className="text-emerald-400 flex-shrink-0"
                    />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Event Packages */}
          {venue.packages && venue.packages.length > 0 && (
            <div className="p-6 rounded-2xl bg-void/60 border border-white/10">
              <h2 className="text-lg font-heading font-bold text-starlight mb-4">
                {lang === 'en'
                  ? 'Event Packages & Menus'
                  : 'Арга хэмжээний багц & Меню'}
              </h2>
              <div className="space-y-4">
                {venue.packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-plasma/40 transition-colors"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="text-base font-bold text-starlight">
                          {pkg.name}
                        </h3>
                        {pkg.minGuests && (
                          <span className="text-xs text-nebula-text">
                            {lang === 'en'
                              ? `Min. ${pkg.minGuests} guests`
                              : `Хамгийн багадаа ${pkg.minGuests} хүн`}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-aurora">
                          {pkg.pricePerPerson.toLocaleString()}₮
                        </span>
                        <span className="text-xs text-nebula-text ml-1">
                          / {lang === 'en' ? 'guest' : 'хүн'}
                        </span>
                      </div>
                    </div>

                    {pkg.description && (
                      <p className="text-xs text-nebula-text mb-3">
                        {pkg.description}
                      </p>
                    )}

                    {pkg.includes && pkg.includes.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {pkg.includes.map((inc, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg text-[11px] bg-void/70 border border-white/10 text-starlight/90"
                          >
                            ✓ {inc}
                          </span>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => openBookingModal(pkg)}
                      className="px-4 py-2 rounded-xl bg-plasma/20 hover:bg-plasma text-plasma hover:text-white border border-plasma/30 text-xs font-bold transition-all"
                    >
                      {lang === 'en'
                        ? 'Select & Request Quote'
                        : 'Энэ багцаар захиалга өгөх'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sticky Booking Sidebar */}
        <div className="space-y-6">
          <div className="sticky top-24 p-6 rounded-2xl bg-void/80 border border-white/15 shadow-2xl space-y-5">
            <div>
              <span className="text-xs text-nebula-text uppercase tracking-wider font-semibold">
                {lang === 'en' ? 'Pricing & Capacity' : 'Үнэ & Багтаамж'}
              </span>
              {venue.pricePerPerson ? (
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-aurora">
                    {venue.pricePerPerson.toLocaleString()}₮
                  </span>
                  <span className="text-xs text-nebula-text">
                    / {lang === 'en' ? 'person (starting)' : 'хүний (эхлэх үнэ)'}
                  </span>
                </div>
              ) : null}
              {venue.hallRentalPrice ? (
                <div className="mt-1 text-xs text-nebula-text">
                  {lang === 'en' ? 'Hall rental:' : 'Заалны түрээс:'}{' '}
                  <span className="font-bold text-starlight">
                    {venue.hallRentalPrice.toLocaleString()}₮
                  </span>
                </div>
              ) : null}
            </div>

            <div className="space-y-3 pt-3 border-t border-white/10 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-nebula-text flex items-center gap-2">
                  <Users size={15} className="text-plasma" />
                  {lang === 'en' ? 'Capacity' : 'Багтаамж'}
                </span>
                <span className="font-bold text-starlight">
                  {venue.minCapacity} – {venue.maxCapacity}{' '}
                  {lang === 'en' ? 'guests' : 'хүн'}
                </span>
              </div>

              <div className="flex items-start justify-between gap-2">
                <span className="text-nebula-text flex items-center gap-2 flex-shrink-0">
                  <MapPin size={15} className="text-aurora" />
                  {lang === 'en' ? 'Location' : 'Байршил'}
                </span>
                <span className="text-right text-starlight font-medium text-xs">
                  {venue.city}, {venue.district}
                  {venue.addressDetail ? `, ${venue.addressDetail}` : ''}
                </span>
              </div>
            </div>

            {venue.bookedDates && venue.bookedDates.length > 0 && (
              <div className="pt-3 border-t border-white/10 space-y-2">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Calendar size={13} />
                  {lang === 'en' ? 'Already Booked Dates' : 'Захиалгатай (дүүрсэн) өдрүүд'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {venue.bookedDates
                    .slice()
                    .sort()
                    .map((d) => (
                      <span
                        key={d}
                        className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-500/15 border border-red-500/30 text-red-300"
                      >
                        {d}
                      </span>
                    ))}
                </div>
              </div>
            )}

            <button
              onClick={() => openBookingModal()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-plasma via-nova to-aurora text-white font-bold text-sm shadow-lg shadow-plasma/25 hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
            >
              <Calendar size={16} />
              {lang === 'en'
                ? 'Request Availability & Quote'
                : 'Сул өдөр & Үнийн санал авах'}
            </button>

            <div className="pt-4 border-t border-white/10 space-y-2.5 text-sm">
              {isPhoneRevealed || isOwner ? (
                <>
                  <a
                    href={`tel:${(revealedPhone || venue.phone).replace(/\D/g, '')}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold transition-colors"
                  >
                    <Phone size={15} />
                    <span>{revealedPhone || venue.phone}</span>
                  </a>

                  {(revealedSecondaryPhone || venue.secondaryPhone) && (
                    <a
                      href={`tel:${(revealedSecondaryPhone || venue.secondaryPhone || '').replace(/\D/g, '')}`}
                      className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-nebula-text text-xs font-semibold transition-colors"
                    >
                      <Phone size={13} />
                      <span>{revealedSecondaryPhone || venue.secondaryPhone}</span>
                    </a>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleRevealPhone}
                  disabled={revealing}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-plasma hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-60"
                >
                  <Lock size={15} className="text-amber-300" />
                  <span>
                    {revealing
                      ? lang === 'en'
                        ? 'Revealing...'
                        : 'Утас гаргаж байна...'
                      : lang === 'en'
                      ? `Show Phone (${maskPhoneNumber(venue.phone)})`
                      : `Утас харах (${maskPhoneNumber(venue.phone)})`}
                  </span>
                </button>
              )}

              <div className="flex items-center justify-between text-[11px] text-nebula-text px-1 pt-0.5">
                <span>{lang === 'en' ? 'Phone views:' : 'Утас харсан:'}</span>
                <span className="font-bold text-plasma">{phoneRevealsCount} удаа</span>
              </div>

              <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-plasma to-aurora hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-plasma/25 transition-all cursor-pointer"
              >
                <MessageSquare size={16} />
                <span>
                  {lang === 'en' ? 'Chat Directly' : 'Шууд чат бичих'}
                </span>
              </button>

              {venue.email && (
                <a
                  href={`mailto:${venue.email}`}
                  className="flex items-center justify-center gap-2 text-xs text-nebula-text hover:text-white pt-1"
                >
                  <Mail size={13} />
                  <span>{venue.email}</span>
                </a>
              )}

              {venue.websiteUrl && (
                <a
                  href={venue.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 text-xs text-plasma hover:underline"
                >
                  <Globe size={13} />
                  <span>{venue.websiteUrl}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <EventInquiryModal
        venue={venue}
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        selectedPackage={selectedPackage}
        defaultEventType={defaultEventType}
        defaultDate={defaultDate}
        defaultGuestCount={defaultGuestCount}
      />

      <EventChatModal
        venue={venue}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
};

export default EventVenueDetail;
