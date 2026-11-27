import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Sparkles,
  PlusCircle,
  Users,
  MapPin,
  PartyPopper,
  SlidersHorizontal,
  RefreshCw,
  Send,
  X,
  Calendar,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { eventsApi } from '@/services/eventsApi';
import {
  EVENT_OCCASIONS,
  VENUE_TYPES,
  EVENT_DISTRICTS,
  type EventVenue,
} from '@/types/events';
import { EventVenueCard } from '@/components/events/EventVenueCard';
import { EventInquiryModal } from '@/components/events/EventInquiryModal';
import { useI18n } from '@/i18n';

export const Events: React.FC = () => {
  const { lang } = useI18n();
  const [venues, setVenues] = useState<EventVenue[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('ALL');
  const [selectedVenueType, setSelectedVenueType] = useState('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [minGuests, setMinGuests] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Multi-venue quote selection (up to 5)
  const [selectedVenues, setSelectedVenues] = useState<EventVenue[]>([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const toggleSelectVenue = (venue: EventVenue) => {
    setSelectedVenues((prev) => {
      const exists = prev.some((v) => v.id === venue.id);
      if (exists) return prev.filter((v) => v.id !== venue.id);
      if (prev.length >= 5) return prev;
      return [...prev, venue];
    });
  };

  useEffect(() => {
    loadVenues();
  }, [selectedOccasion, selectedVenueType, selectedDistrict, minGuests, maxPrice, selectedDate]);

  const loadVenues = async () => {
    setLoading(true);
    try {
      const res = await eventsApi.getAll({
        limit: 50,
        search: searchQuery.trim() || undefined,
        eventType: selectedOccasion === 'ALL' ? undefined : selectedOccasion,
        venueType: selectedVenueType === 'ALL' ? undefined : selectedVenueType,
        district: selectedDistrict === 'ALL' ? undefined : selectedDistrict,
        minGuests: minGuests ? Number(minGuests) : undefined,
        maxPricePerPerson: maxPrice ? Number(maxPrice) : undefined,
        availableDate: selectedDate || undefined,
      });
      setVenues(res.data.items || []);
    } catch (err) {
      console.error('Failed to load event venues:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadVenues();
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedOccasion('ALL');
    setSelectedVenueType('ALL');
    setSelectedDistrict('ALL');
    setMinGuests('');
    setMaxPrice('');
    setSelectedDate('');
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl p-6 sm:p-10 mb-8 overflow-hidden bg-gradient-to-br from-plasma/20 via-void/80 to-aurora/20 border border-white/15 shadow-2xl"
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-plasma/20 border border-plasma/30 text-plasma text-xs font-bold mb-3">
              <PartyPopper size={14} />
              <span>
                {lang === 'en'
                  ? 'Events, Restaurants & Banquet Halls'
                  : 'Шинэ жил • Хурим • Төрсөн өдөр • Эвент заал'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-heading font-black text-starlight tracking-tight mb-3">
              {lang === 'en'
                ? 'Find the Perfect Restaurant or Event Hall'
                : 'Арга хэмжээндээ тохирох Ресторан, Эвент заалыг олоорой'}
            </h1>
            <p className="text-sm sm:text-base text-nebula-text">
              {lang === 'en'
                ? 'Compare capacity, per-guest menus, packages, and send direct booking inquiries for New Year parties, weddings, birthdays, and corporate events.'
                : 'Шинэ жилийн баяр, хурим найр, төрсөн өдөр, байгууллагын хүлээн авалтад зориулсан шилдэг ресторан, заалуудын багтаамж, меню, үнийг харьцуулан шууд захиалга өгөөрэй.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
            <Link
              to="/create-event-venue"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-plasma via-nova to-aurora text-white font-bold text-sm shadow-lg shadow-plasma/25 hover:scale-[1.02] transition-transform"
            >
              <PlusCircle size={18} />
              <span>
                {lang === 'en'
                  ? 'List Your Venue'
                  : 'Ресторан / Заал бүртгүүлэх'}
              </span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* 🎄 2026 New Year Campaign Strip */}
      <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-amber-500/15 to-rose-500/15 border border-amber-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <span className="text-2xl sm:text-3xl leading-none">🎄</span>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-starlight">
              {lang === 'en'
                ? '2026 New Year Corporate Party Bookings Open!'
                : '2026 оны Шинэ жилийн захиалга эхэллээ!'}
            </h2>
            <p className="text-xs text-nebula-text">
              {lang === 'en'
                ? 'Select 3–5 venues below to send a quote request to all of them at once.'
                : 'Доороос 3–5 ресторан, эвент заал сонгоод зэрэг үнийн санал авах хүсэлт илгээгээрэй.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSelectedOccasion('NEW_YEAR')}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-void font-black text-xs sm:text-sm whitespace-nowrap transition-colors shadow-lg shadow-amber-500/20"
        >
          {lang === 'en' ? '🎄 View New Year Venues' : '🎄 Шинэ жилийн заалууд харах'}
        </button>
      </div>

      {/* Occasion Quick Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-5 scrollbar-none">
        <button
          onClick={() => setSelectedOccasion('ALL')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
            selectedOccasion === 'ALL'
              ? 'bg-plasma text-white border-plasma shadow-lg shadow-plasma/25'
              : 'bg-white/5 text-nebula-text border-white/10 hover:text-white hover:bg-white/10'
          }`}
        >
          <Sparkles size={13} className="inline mr-1.5" />
          {lang === 'en' ? 'All Events' : 'Бүх эвент'}
        </button>

        {EVENT_OCCASIONS.map((occ) => (
          <button
            key={occ.id}
            onClick={() => setSelectedOccasion(occ.id)}
            title={lang === 'en' ? occ.serviceEn : occ.serviceMn}
            className={`px-3.5 py-2 rounded-xl text-left whitespace-nowrap transition-all border flex items-center gap-2 ${
              selectedOccasion === occ.id
                ? 'bg-plasma text-white border-plasma shadow-lg shadow-plasma/25'
                : 'bg-white/5 text-nebula-text border-white/10 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="text-base leading-none">{occ.emoji}</span>
            <div className="flex flex-col leading-tight">
              <span className="text-xs sm:text-sm font-bold">{occ[lang]}</span>
              <span
                className={`text-[10px] ${
                  selectedOccasion === occ.id
                    ? 'text-white/80'
                    : 'text-nebula-text/70'
                }`}
              >
                {lang === 'en' ? occ.serviceEn : occ.serviceMn}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Search & Detailed Filter Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="p-4 rounded-2xl bg-void/60 border border-white/10 backdrop-blur-xl mb-8 space-y-3"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-4 relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-nebula-text"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                lang === 'en'
                  ? 'Search venue name, area...'
                  : 'Ресторан, заалны нэр, байршил хайх...'
              }
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-starlight focus:outline-none focus:border-plasma"
            />
          </div>

          {/* Venue Type */}
          <div className="md:col-span-2">
            <select
              value={selectedVenueType}
              onChange={(e) => setSelectedVenueType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-starlight focus:outline-none focus:border-plasma"
            >
              <option value="ALL" className="bg-void">
                {lang === 'en' ? 'All Venue Types' : 'Бүх төрөл'}
              </option>
              {VENUE_TYPES.map((vt) => (
                <option key={vt.id} value={vt.id} className="bg-void">
                  {vt[lang]}
                </option>
              ))}
            </select>
          </div>

          {/* District */}
          <div className="md:col-span-2 relative">
            <MapPin
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-aurora pointer-events-none"
            />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-starlight focus:outline-none focus:border-plasma"
            >
              <option value="ALL" className="bg-void">
                {lang === 'en' ? 'All Districts' : 'Бүх дүүрэг'}
              </option>
              {EVENT_DISTRICTS.map((d) => (
                <option key={d} value={d} className="bg-void">
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Min Guests */}
          <div className="md:col-span-2 relative">
            <Users
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-plasma pointer-events-none"
            />
            <select
              value={minGuests}
              onChange={(e) =>
                setMinGuests(e.target.value ? Number(e.target.value) : '')
              }
              className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-starlight focus:outline-none focus:border-plasma"
            >
              <option value="" className="bg-void">
                {lang === 'en' ? 'Any Guests' : 'Зочдын тоо'}
              </option>
              <option value="20" className="bg-void">20+ {lang === 'en' ? 'guests' : 'хүн'}</option>
              <option value="50" className="bg-void">50+ {lang === 'en' ? 'guests' : 'хүн'}</option>
              <option value="100" className="bg-void">100+ {lang === 'en' ? 'guests' : 'хүн'}</option>
              <option value="200" className="bg-void">200+ {lang === 'en' ? 'guests' : 'хүн'}</option>
              <option value="300" className="bg-void">300+ {lang === 'en' ? 'guests' : 'хүн'}</option>
            </select>
          </div>

          {/* Max Price / Search Button */}
          <div className="md:col-span-2 flex gap-2">
            <select
              value={maxPrice}
              onChange={(e) =>
                setMaxPrice(e.target.value ? Number(e.target.value) : '')
              }
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-starlight focus:outline-none focus:border-plasma"
            >
              <option value="" className="bg-void">
                {lang === 'en' ? 'Any Budget' : 'Үнэ / хүн'}
              </option>
              <option value="100000" className="bg-void">≤ 100,000₮</option>
              <option value="150000" className="bg-void">≤ 150,000₮</option>
              <option value="200000" className="bg-void">≤ 200,000₮</option>
              <option value="300000" className="bg-void">≤ 300,000₮</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-plasma text-white font-bold text-sm hover:bg-plasma/90 transition-colors flex-shrink-0"
            >
              <Search size={16} />
            </button>
          </div>
        </div>

        {/* Available Date Filter Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/10">
          <label className="text-xs font-bold text-nebula-text flex items-center gap-1.5">
            <Calendar size={14} className="text-emerald-400" />
            <span>
              {lang === 'en'
                ? 'Filter by Available Date:'
                : 'Сул өдрөөр шүүх (Өдөр сонгох):'}
            </span>
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-starlight focus:outline-none focus:border-emerald-400"
          />
          {selectedDate && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              {lang === 'en'
                ? `Showing venues available on ${selectedDate}`
                : `${selectedDate} өдөр сул байгаа газрууд`}
              <button
                type="button"
                onClick={() => setSelectedDate('')}
                className="hover:text-white"
              >
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      </form>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-sm text-nebula-text">
          <SlidersHorizontal size={15} className="text-plasma" />
          <span>
            {lang === 'en'
              ? `${venues.length} venues available`
              : `Нийт ${venues.length} газар олдлоо`}
          </span>
        </div>

        {(selectedOccasion !== 'ALL' ||
          selectedVenueType !== 'ALL' ||
          selectedDistrict !== 'ALL' ||
          minGuests ||
          maxPrice ||
          selectedDate ||
          searchQuery) && (
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-plasma hover:underline"
          >
            <RefreshCw size={12} />
            {lang === 'en' ? 'Reset filters' : 'Шүүлтүүр цэвэрлэх'}
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-96 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
            />
          ))}
        </div>
      ) : venues.length === 0 ? (
        <div className="text-center py-20 rounded-3xl bg-void/40 border border-white/10">
          <PartyPopper size={40} className="mx-auto text-nebula-text mb-3 opacity-60" />
          <h3 className="text-lg font-bold text-starlight mb-1">
            {lang === 'en' ? 'No venues found' : 'Тохирох газар олдсонгүй'}
          </h3>
          <p className="text-sm text-nebula-text mb-5">
            {lang === 'en'
              ? 'Try adjusting your filters or search query.'
              : 'Та хайлтын нөхцөл эсвэл шүүлтүүрээ өөрчлөөд дахин хайна уу.'}
          </p>
          <button
            onClick={resetFilters}
            className="px-5 py-2.5 rounded-xl bg-plasma text-white text-sm font-bold"
          >
            {lang === 'en' ? 'Show All Venues' : 'Бүх газруудыг харах'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue) => {
            const qp = new URLSearchParams();
            if (selectedOccasion !== 'ALL') qp.set('eventType', selectedOccasion);
            if (selectedDate) qp.set('date', selectedDate);
            if (minGuests) qp.set('guests', String(minGuests));
            const qs = qp.toString();
            return (
              <EventVenueCard
                key={venue.id}
                venue={venue}
                isSelected={selectedVenues.some((v) => v.id === venue.id)}
                onToggleSelect={toggleSelectVenue}
                detailQuery={qs ? `?${qs}` : ''}
              />
            );
          })}
        </div>
      )}

      {/* Floating Multi-Venue Quote Bar (1-5 venues) */}
      {selectedVenues.length > 0 && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-3xl p-3 sm:p-4 rounded-2xl bg-void/95 backdrop-blur-xl border border-plasma/50 shadow-2xl shadow-plasma/25 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
            <span className="px-2.5 py-1 rounded-xl bg-plasma text-white text-xs font-black flex-shrink-0">
              {selectedVenues.length}/5
            </span>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-starlight truncate">
                {selectedVenues.map((v) => v.name).join(', ')}
              </p>
              <p className="text-[11px] text-nebula-text">
                {lang === 'en'
                  ? 'Select 3–5 venues to compare quotes at once'
                  : '3–5 байгууллагад зэрэг үнийн санал илгээх боломжтой'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-shrink-0">
            <button
              type="button"
              onClick={() => setSelectedVenues([])}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-nebula-text hover:text-white border border-white/10"
              title={lang === 'en' ? 'Clear' : 'Цэвэрлэх'}
            >
              <X size={16} />
            </button>
            <button
              type="button"
              onClick={() => setIsBulkModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-plasma via-nova to-aurora text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg"
            >
              <Send size={14} />
              <span>
                {lang === 'en'
                  ? `Request Quotes (${selectedVenues.length})`
                  : `Зэрэг үнийн санал авах (${selectedVenues.length})`}
              </span>
            </button>
          </div>
        </div>
      )}

      <EventInquiryModal
        venues={selectedVenues}
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        defaultEventType={selectedOccasion !== 'ALL' ? selectedOccasion : undefined}
        defaultDate={selectedDate || undefined}
        defaultGuestCount={minGuests ? Number(minGuests) : undefined}
        onSuccess={() => setSelectedVenues([])}
      />
    </div>
  );
};

export default Events;
