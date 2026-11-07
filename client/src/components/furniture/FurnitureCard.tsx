import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Star,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
  Play,
  Award,
  ChevronRight,
  Layers,
} from 'lucide-react';
import type { FurnitureMaker, FurniturePortfolioItem } from '@/types/furniture';
import { getImageUrl } from '@/utils/imageUrl';

interface FurnitureCardProps {
  maker: FurnitureMaker;
  onOpenReel?: (item: FurniturePortfolioItem, maker: FurnitureMaker) => void;
}

const CATEGORY_NAMES: Record<string, string> = {
  KITCHEN: 'Гал тогоо',
  WARDROBE: 'Шүүгээ & Шкаф',
  LIVING_ROOM: 'Зочны өрөө',
  KIDS: 'Хүүхдийн өрөө',
  OFFICE: 'Оффис тавилга',
  SOLID_WOOD: 'Цэвэр мод',
  CUSTOM: 'Захиалгат хийц',
};

export const FurnitureCard: React.FC<FurnitureCardProps> = ({ maker, onOpenReel }) => {
  const phone = maker.phone || '89117722';
  const portfolioWithVideo = maker.portfolio?.find((p) => Boolean(p.videoUrl));

  return (
    <div className="glass-card rounded-3xl overflow-hidden border border-white/10 hover:border-plasma/50 transition-all duration-300 shadow-xl hover:shadow-plasma/10 flex flex-col group bg-void/80">
      {/* Cover Image & Badges */}
      <div className="relative h-44 w-full overflow-hidden bg-void">
        <img
          src={getImageUrl(maker.coverUrl || (maker.portfolio && maker.portfolio[0]?.images?.[0]))}
          alt={maker.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-black/40 to-transparent" />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
          {maker.isVerified && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-md flex items-center gap-1">
              <ShieldCheck size={12} />
              <span>Баталгаажсан</span>
            </span>
          )}

          {maker.warrantyMonths && (
            <span className="px-2.5 py-1 rounded-full bg-plasma/80 text-white text-[10px] font-bold backdrop-blur-md shadow-md flex items-center gap-1">
              <Award size={12} />
              <span>{maker.warrantyMonths} сарын баталгаа</span>
            </span>
          )}
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-bold flex items-center gap-1 shadow-md">
          <Star size={12} className="text-amber-400 fill-amber-400" />
          <span>{maker.rating.toFixed(1)}</span>
          <span className="text-[10px] text-white/60">({maker.reviewsCount})</span>
        </div>

        {/* Maker Logo */}
        <div className="absolute -bottom-5 left-5 w-14 h-14 rounded-2xl p-0.5 bg-gradient-to-tr from-plasma via-nova to-aurora shadow-xl shadow-plasma/30">
          <div className="w-full h-full bg-void rounded-[14px] overflow-hidden">
            <img
              src={getImageUrl(maker.logoUrl || maker.coverUrl)}
              alt={maker.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80';
              }}
            />
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 pt-7 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link
                to={`/furniture/${maker.id}`}
                className="text-base sm:text-lg font-black text-white hover:text-plasma transition-colors line-clamp-1 group-hover:underline"
              >
                {maker.name}
              </Link>
              <div className="flex items-center gap-1.5 text-xs text-nebula-text/80 mt-0.5">
                <MapPin size={12} className="text-plasma flex-shrink-0" />
                <span>{maker.district} {maker.city ? `• ${maker.city}` : ''}</span>
                <span className="text-white/30">•</span>
                <Clock size={12} className="text-aurora flex-shrink-0" />
                <span>{maker.experienceYears}+ жил</span>
              </div>
            </div>
          </div>

          {maker.tagline && (
            <p className="text-xs text-starlight/80 line-clamp-2 leading-relaxed">
              {maker.tagline}
            </p>
          )}

          {/* Specialization Categories */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {maker.categories?.slice(0, 4).map((cat) => (
              <span
                key={cat}
                className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-white/5 border border-white/10 text-starlight/90"
              >
                {CATEGORY_NAMES[cat] || cat}
              </span>
            ))}
          </div>

          {/* Materials Used tags */}
          {maker.materialsUsed && maker.materialsUsed.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-plasma/90 pt-1">
              <Layers size={12} className="flex-shrink-0" />
              <span className="truncate">{maker.materialsUsed.join(' • ')}</span>
            </div>
          )}
        </div>

        {/* Completed Works Thumbnails Preview */}
        {maker.portfolio && maker.portfolio.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between text-[11px] text-nebula-text/80 font-medium">
              <span>Хийсэн ажлууд ({maker.portfolio.length})</span>
              {portfolioWithVideo && (
                <span className="text-plasma flex items-center gap-1 text-[10px] font-bold">
                  <Play size={10} fill="currentColor" /> Реел бичлэгтэй
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {maker.portfolio.slice(0, 3).map((item) => {
                const hasVideo = Boolean(item.videoUrl);
                const thumb = item.thumbnailUrl || (item.images && item.images[0]) || maker.coverUrl;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (onOpenReel) {
                        onOpenReel(item, maker);
                      }
                    }}
                    className="relative aspect-video rounded-xl overflow-hidden bg-void/50 border border-white/10 cursor-pointer group/item hover:border-plasma transition-all"
                    title={item.title}
                  >
                    <img
                      src={getImageUrl(thumb)}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80';
                      }}
                    />

                    {hasVideo && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-plasma text-white flex items-center justify-center shadow-md">
                          <Play size={10} fill="currentColor" className="translate-x-0.2" />
                        </div>
                      </div>
                    )}

                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                      <span className="text-[9px] text-white line-clamp-1 font-medium">{item.title}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions Row: Direct Phone Call & View Profile */}
        <div className="pt-2 flex items-center gap-2">
          <a
            href={`tel:${phone.replace(/\D/g, '')}`}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Phone size={13} />
            <span>Шууд залгах ({phone})</span>
          </a>

          {maker.facebookUrl && (
            <a
              href={maker.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600 hover:text-white text-blue-400 transition-all shadow-md active:scale-95"
              title="Facebook хуудас"
            >
              <ExternalLink size={14} />
            </a>
          )}

          <Link
            to={`/furniture/${maker.id}`}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition-all flex items-center gap-1"
          >
            <span>Үзэх</span>
            <ChevronRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
};
