import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Users,
  Star,
  ShieldCheck,
  Sparkles,
  Phone,
  ArrowUpRight,
  Check,
  Plus,
} from 'lucide-react';
import {
  type EventVenue,
  getVenueTypeLabel,
  getOccasionLabel,
  maskPhoneNumber,
} from '@/types/events';
import { useI18n } from '@/i18n';
import { getImageUrl } from '@/utils/imageUrl';

interface EventVenueCardProps {
  venue: EventVenue;
  isSelected?: boolean;
  onToggleSelect?: (venue: EventVenue) => void;
  detailQuery?: string;
}

export const EventVenueCard: React.FC<EventVenueCardProps> = ({
  venue,
  isSelected = false,
  onToggleSelect,
  detailQuery = '',
}) => {
  const { lang } = useI18n();
  const coverSrc = venue.coverUrl
    ? getImageUrl(venue.coverUrl)
    : venue.images?.[0]
    ? getImageUrl(venue.images[0])
    : 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80';

  return (
    <Link
      to={`/events/${venue.id}${detailQuery}`}
      className="group relative flex flex-col rounded-2xl bg-void/60 border border-white/10 hover:border-plasma/50 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-plasma/15 hover:-translate-y-1"
    >
      {/* Cover Image */}
      <div className="relative h-52 overflow-hidden bg-black/40">
        <img
          src={coverSrc}
          alt={venue.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-void/80 backdrop-blur-md text-white border border-white/15">
            {getVenueTypeLabel(venue.venueType, lang)}
          </span>
          <div className="flex items-center gap-1.5">
            {venue.isFeatured && (
              <span className="px-2 py-1 rounded-lg text-[10px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg flex items-center gap-1">
                <Sparkles size={11} />
                VIP
              </span>
            )}
            {venue.isVerified && (
              <span className="p-1.5 rounded-lg bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-500/30">
                <ShieldCheck size={13} />
              </span>
            )}
          </div>
        </div>

        {/* Bottom Price & Rating */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            {venue.pricePerPerson ? (
              <div className="px-2.5 py-1 rounded-lg bg-void/85 backdrop-blur-md border border-white/15 inline-flex items-baseline gap-1">
                <span className="text-sm font-black text-aurora">
                  {venue.pricePerPerson.toLocaleString()}₮
                </span>
                <span className="text-[10px] text-nebula-text">
                  / {lang === 'en' ? 'guest' : 'хүн'}
                </span>
              </div>
            ) : venue.hallRentalPrice ? (
              <div className="px-2.5 py-1 rounded-lg bg-void/85 backdrop-blur-md border border-white/15 inline-flex items-baseline gap-1">
                <span className="text-sm font-black text-aurora">
                  {venue.hallRentalPrice.toLocaleString()}₮
                </span>
                <span className="text-[10px] text-nebula-text">
                  / {lang === 'en' ? 'hall' : 'заал'}
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-void/85 backdrop-blur-md border border-white/15 text-xs font-bold text-amber-300">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span>{venue.rating?.toFixed(1) || '4.9'}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-base font-heading font-bold text-starlight group-hover:text-plasma transition-colors line-clamp-1">
            {venue.name}
          </h3>
          <ArrowUpRight
            size={16}
            className="text-nebula-text group-hover:text-plasma flex-shrink-0 mt-0.5 transition-colors"
          />
        </div>

        {venue.tagline && (
          <p className="text-xs text-nebula-text line-clamp-2 mb-3">
            {venue.tagline}
          </p>
        )}

        {/* Occasion Chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {(venue.eventTypes || []).slice(0, 3).map((occ) => (
            <span
              key={occ}
              className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/5 border border-white/10 text-starlight/90"
            >
              {getOccasionLabel(occ, lang)}
            </span>
          ))}
          {(venue.eventTypes?.length || 0) > 3 && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/5 border border-white/10 text-nebula-text">
              +{(venue.eventTypes?.length || 0) - 3}
            </span>
          )}
        </div>

        {/* Footer Meta */}
        <div className="mt-auto pt-3 border-t border-white/10 flex items-center justify-between text-xs text-nebula-text">
          <div className="flex items-center gap-1.5">
            <Users size={13} className="text-plasma" />
            <span className="font-semibold text-starlight/90">
              {venue.minCapacity}–{venue.maxCapacity}
            </span>
            <span>{lang === 'en' ? 'guests' : 'хүн'}</span>
          </div>

          <div className="flex items-center gap-1 truncate max-w-[140px]">
            <MapPin size={13} className="text-aurora flex-shrink-0" />
            <span className="truncate">{venue.district}</span>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px] text-nebula-text/80">
          <span className="flex items-center gap-1">
            <Phone size={11} className="text-emerald-400" />
            {maskPhoneNumber(venue.phone)}
          </span>
          {onToggleSelect ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleSelect(venue);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1 ${
                isSelected
                  ? 'bg-plasma text-white border-plasma shadow-sm'
                  : 'bg-white/5 hover:bg-plasma/20 text-starlight border-white/15 hover:border-plasma/40'
              }`}
            >
              {isSelected ? <Check size={11} /> : <Plus size={11} />}
              <span>
                {isSelected
                  ? lang === 'en'
                    ? 'Selected'
                    : 'Сонгосон'
                  : lang === 'en'
                  ? 'Add to Quote'
                  : 'Санал авах'}
              </span>
            </button>
          ) : (
            <span className="text-plasma font-semibold group-hover:underline">
              {lang === 'en' ? 'Book / Details →' : 'Захиалах / Дэлгэрэнгүй →'}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
