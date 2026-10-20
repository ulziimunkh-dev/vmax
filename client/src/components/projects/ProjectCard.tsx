import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Building2,
  Eye,
  CheckCircle2,
  Calendar,
  Sparkles,
  Phone,
  Layers,
  ArrowRight,
  Film,
  Video,
} from 'lucide-react';
import type { Project } from '@/types';

// Simple fallback SVG for Facebook & Instagram
const FacebookIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const formatPrice = (val?: number) => {
    if (!val) return 'Тохиролцоно';
    if (val >= 1000000) {
      return `${(val / 1000000).toLocaleString('mn-MN')} сая ₮`;
    }
    return `${val.toLocaleString('mn-MN')} ₮`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'READY_TO_MOVE':
      case 'COMPLETED':
        return {
          label: 'Ашиглалтад орсон',
          bg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40',
        };
      case 'CONSTRUCTING':
        return {
          label: project.completionYearQuarter || 'Баригдаж байгаа',
          bg: 'bg-plasma/15 text-plasma border-plasma/40',
        };
      default:
        return {
          label: 'Төлөвлөгдөж буй',
          bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40',
        };
    }
  };

  const statusBadge = getStatusBadge(project.status);

  return (
    <div className="group rounded-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-cosmic/70 hover:border-plasma/60 hover:shadow-xl hover:shadow-plasma/10 dark:hover:shadow-plasma/20 transition-all duration-300 flex flex-col overflow-hidden shadow-sm">
      {/* Cover Image & Badges */}
      <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-slate-900">
        <img
          src={project.coverImage || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'}
          alt={project.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Subtle dark gradient overlay to ensure image badges and developer tag are always 100% readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-none z-10 gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-sm ${statusBadge.bg} bg-black/60 text-white-force border-white/20 whitespace-nowrap`}>
              {statusBadge.label}
            </span>
            {project.tour3dUrl && (
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-plasma to-nova text-white text-white-force border border-white/30 shadow-lg shadow-plasma/40 flex items-center gap-1 whitespace-nowrap">
                <Sparkles size={12} className="animate-pulse text-white-force" />
                <span className="text-white-force">3D Tour</span>
              </span>
            )}
            {project.reels && project.reels.length > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-pink-500 to-rose-600 text-white text-white-force border border-white/30 shadow-lg shadow-pink-500/40 flex items-center gap-1 whitespace-nowrap">
                <Film size={12} className="text-white-force" />
                <span className="text-white-force">{project.reels.length} Reel</span>
              </span>
            )}
            {project.videoUrl && (!project.reels || project.reels.length === 0) && (
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-white-force border border-white/30 shadow-lg shadow-blue-500/40 flex items-center gap-1 whitespace-nowrap">
                <Video size={12} className="text-white-force" />
                <span className="text-white-force">Video</span>
              </span>
            )}
          </div>

          {project.isFeatured && (
            <span className="shrink-0 whitespace-nowrap px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 border border-amber-300 shadow-md">
              ⭐ VIP төсөл
            </span>
          )}
        </div>

        {/* Developer name & floor plans on image bottom */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white z-10 pointer-events-none">
          <div className="flex items-center gap-1.5 bg-black/75 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/20 text-white shadow-md">
            <Building2 size={13} className="text-purple-300 shrink-0" />
            <span className="font-bold truncate max-w-[190px] text-white-force text-white">{project.developerName}</span>
          </div>

          {project.floorPlans && project.floorPlans.length > 0 && (
            <div className="flex items-center gap-1.5 bg-black/75 px-2.5 py-1.5 rounded-xl backdrop-blur-md border border-white/20 text-slate-200 font-mono text-[11px] shadow-md">
              <Layers size={12} className="text-cyan-300" />
              <span className="text-white-force text-white">{project.floorPlans.length} сонголт</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Title & Location */}
          <Link to={`/projects/${project.id}`} className="block group-hover:text-plasma transition-colors">
            <h3 className="text-lg sm:text-xl font-bold font-heading text-slate-900 dark:text-starlight line-clamp-1">{project.name}</h3>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-nebula-text mt-1.5 line-clamp-1">
            <MapPin size={13} className="text-plasma shrink-0" />
            <span>
              {project.district} {project.khoroo ? `, ${project.khoroo}` : ''} {project.addressDetail ? `(${project.addressDetail})` : ''}
            </span>
          </div>

          {/* Pricing Highlight Card */}
          <div className="mt-4 p-3.5 rounded-xl bg-slate-100/90 dark:bg-void/50 border border-slate-200 dark:border-white/5 flex items-center justify-between shadow-inner">
            <div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-nebula-text block">1 м.кв үнэ:</span>
              <span className="text-sm font-extrabold text-plasma">
                {project.minPricePerSqm ? `${(Number(project.minPricePerSqm) / 1000000).toFixed(1)} сая ₮-өөс` : 'Тохиролцоно'}
              </span>
            </div>
            <div className="text-right border-l border-slate-300 dark:border-white/10 pl-3.5">
              <span className="text-[11px] font-medium text-slate-500 dark:text-nebula-text block">Эхлэх үнэ:</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-starlight">
                {formatPrice(project.startingPrice)}
              </span>
            </div>
          </div>

          {/* Special Offers & Payment tags */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.paymentTerms?.slice(0, 3).map((term, i) => (
              <span
                key={i}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 dark:bg-aurora/10 dark:text-aurora dark:border-aurora/30 font-semibold shadow-xs"
              >
                {term}
              </span>
            ))}
            {project.specialOffers?.[0] && (
              <span className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30 font-semibold truncate max-w-[240px] shadow-xs">
                🎁 {project.specialOffers[0]}
              </span>
            )}
          </div>
        </div>

        {/* Footer: Contacts & Action */}
        <div className="pt-3.5 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-2">
          {/* Socials & Phone */}
          <div className="flex items-center space-x-2">
            {project.salesPhone && (
              <a
                href={`tel:${project.salesPhone.split(',')[0].trim()}`}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-emerald-600 dark:bg-void/80 dark:hover:bg-emerald-500/20 dark:text-emerald-400 border border-slate-200 dark:border-emerald-500/30 hover:border-emerald-500/60 shadow-sm transition-all"
                title={`Залгах: ${project.salesPhone}`}
              >
                <Phone size={15} />
              </a>
            )}

            {project.facebookPageUrl && (
              <a
                href={project.facebookPageUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-[#1877F2] dark:bg-void/80 dark:hover:bg-[#1877F2]/20 border border-slate-200 dark:border-[#1877F2]/30 hover:border-[#1877F2]/60 shadow-sm transition-all"
                title="Facebook хуудас"
              >
                <FacebookIcon />
              </a>
            )}

            {project.instagramHandle && (
              <a
                href={project.instagramHandle.startsWith('http') ? project.instagramHandle : `https://instagram.com/${project.instagramHandle.replace('@', '')}` }
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-pink-50 text-pink-600 dark:bg-void/80 dark:hover:bg-pink-500/20 dark:text-pink-400 border border-slate-200 dark:border-pink-500/30 hover:border-pink-500/60 shadow-sm transition-all"
                title="Instagram хуудас"
              >
                <InstagramIcon />
              </a>
            )}
          </div>

          {/* Details CTA Button */}
          <Link
            to={`/projects/${project.id}`}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-plasma to-nova text-white text-white-force font-bold text-xs shadow-md shadow-plasma/30 hover:shadow-plasma/50 hover:opacity-95 transition-all flex items-center gap-1.5 group/btn cursor-pointer"
          >
            <span className="text-white-force">Дэлгэрэнгүй</span>
            <ArrowRight size={13} className="text-white-force group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
