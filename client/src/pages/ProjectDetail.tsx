import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Building2,
  Calendar,
  Sparkles,
  Phone,
  Mail,
  Globe,
  Share2,
  Layers,
  CheckCircle2,
  ChevronRight,
  Maximize2,
  Calculator,
  Download,
  ArrowLeft,
  DollarSign,
  Video,
  Film,
  Play,
} from 'lucide-react';
import type { Project, FloorPlanItem } from '@/types';
import { projectsAPI } from '@/services/api';
import { ProjectMap } from '@/components/projects/ProjectMap';
import { ProjectReelsModal } from '@/components/projects/ProjectReelsModal';
import { getImageUrl } from '@/utils/imageUrl';

const FacebookIcon = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFloorIndex, setActiveFloorIndex] = useState(0);
  const [activeMediaTab, setActiveMediaTab] = useState<'photos' | 'tour3d' | 'video'>('photos');
  const [activeImage, setActiveImage] = useState<string>('');
  const [isReelsModalOpen, setIsReelsModalOpen] = useState(false);
  const [activeReelIndex, setActiveReelIndex] = useState(0);

  // Loan Calculator State
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(30);
  const [loanYears, setLoanYears] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(6); // 6%

  useEffect(() => {
    if (!id) return;
    projectsAPI
      .getOne(id)
      .then((res) => {
        setProject(res.data);
        setActiveImage(res.data?.coverImage);
        if (res.data?.tour3dUrl) {
          setActiveMediaTab('tour3d');
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-plasma"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen pt-32 pb-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-starlight">Төсөл олдсонгүй</h2>
        <Link to="/projects" className="text-plasma hover:underline">
          Төслүүдийн жагсаалт руу буцах
        </Link>
      </div>
    );
  }

  const selectedFloorPlan: FloorPlanItem | undefined = project.floorPlans?.[activeFloorIndex];

  // Mortgage calculation helper
  const propertyPrice = selectedFloorPlan?.startingPrice || project.startingPrice || 200000000;
  const downPaymentAmount = (propertyPrice * downPaymentPercent) / 100;
  const loanPrincipal = propertyPrice - downPaymentAmount;
  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = loanYears * 12;
  const monthlyPayment =
    monthlyRate > 0
      ? (loanPrincipal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
      : loanPrincipal / totalMonths;

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Back button */}
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 text-xs font-semibold text-nebula-text hover:text-starlight transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Бүх төслүүд рүү буцах</span>
      </Link>

      {/* Hero Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-4 border-b border-white/10">
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-plasma/20 text-plasma border border-plasma/40">
              {project.completionYearQuarter || 'Шинэ төсөл'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-nebula-text">
              {project.developerName}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-heading font-black text-starlight tracking-tight">
            {project.name}
          </h1>

          <div className="flex items-center gap-2 text-sm text-nebula-text">
            <MapPin size={16} className="text-nova shrink-0" />
            <span>
              {project.district} {project.khoroo ? `, ${project.khoroo}` : ''}{' '}
              {project.addressDetail ? `(${project.addressDetail})` : ''}
            </span>
          </div>
        </div>

        {/* Pricing & Call to Action */}
        <div className="bg-void/60 p-5 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center gap-5 shrink-0">
          <div>
            <span className="text-xs text-nebula-text block">1 м.кв-ийн эхлэх үнэ</span>
            <span className="text-2xl font-black text-plasma font-mono">
              {project.minPricePerSqm
                ? `${(Number(project.minPricePerSqm) / 1000000).toFixed(1)} сая ₮`
                : 'Тохиролцоно'}
            </span>
          </div>
          <div className="sm:border-l border-white/10 sm:pl-5 flex items-center gap-2">
            {project.salesPhone && (
              <a
                href={`tel:${project.salesPhone.split(',')[0].trim()}`}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-plasma to-nova text-white font-bold text-xs sm:text-sm shadow-lg shadow-plasma/30 hover:shadow-plasma/50 transition-all flex items-center gap-2"
              >
                <Phone size={16} />
                <span>Холбогдох ({project.salesPhone.split(',')[0].trim()})</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Media Showcase (3D Tour / Photos Tab) */}
      <div className="space-y-4">
        {/* Tab Controls */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-void/80 p-1.5 rounded-2xl border border-white/10 dark:border-white/10 shadow-sm flex-wrap">
            {project.tour3dUrl && (
              <button
                type="button"
                onClick={() => setActiveMediaTab('tour3d')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeMediaTab === 'tour3d'
                    ? 'bg-gradient-to-r from-plasma to-nova text-white text-white-force shadow-md'
                    : 'text-nebula-text hover:text-plasma'
                }`}
              >
                <Sparkles size={14} className={activeMediaTab === 'tour3d' ? 'text-white-force' : ''} />
                <span className={activeMediaTab === 'tour3d' ? 'text-white-force' : ''}>3D Виртуал аялал (VR Tour)</span>
              </button>
            )}
            {project.videoUrl && (
              <button
                type="button"
                onClick={() => setActiveMediaTab('video')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeMediaTab === 'video'
                    ? 'bg-gradient-to-r from-plasma to-nova text-white text-white-force shadow-md'
                    : 'text-nebula-text hover:text-plasma'
                }`}
              >
                <Video size={14} className={activeMediaTab === 'video' ? 'text-white-force' : ''} />
                <span className={activeMediaTab === 'video' ? 'text-white-force' : ''}>Танилцуулга видео</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveMediaTab('photos')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeMediaTab === 'photos'
                  ? 'bg-gradient-to-r from-plasma to-nova text-white text-white-force shadow-md'
                  : 'text-nebula-text hover:text-plasma'
              }`}
            >
              <Layers size={14} className={activeMediaTab === 'photos' ? 'text-white-force' : ''} />
              <span className={activeMediaTab === 'photos' ? 'text-white-force' : ''}>Зургийн цомог ({(project.galleryImages?.length || 0) + 1})</span>
            </button>
          </div>

          {/* Social Links on Media bar */}
          <div className="flex items-center gap-2">
            {project.facebookPageUrl && (
              <a
                href={project.facebookPageUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-[#1877F2]/15 hover:bg-[#1877F2]/30 text-[#1877F2] border border-[#1877F2]/40 text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
              >
                <FacebookIcon />
                <span className="hidden sm:inline">Facebook</span>
              </a>
            )}
            {project.instagramHandle && (
              <a
                href={
                  project.instagramHandle.startsWith('http')
                    ? project.instagramHandle
                    : `https://instagram.com/${project.instagramHandle.replace('@', '')}`
                }
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-pink-500/15 hover:bg-pink-500/30 text-pink-500 dark:text-pink-400 border border-pink-500/40 text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
              >
                <InstagramIcon />
                <span className="hidden sm:inline">Instagram</span>
              </a>
            )}
            {project.websiteUrl && (
              <a
                href={project.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-void/80 hover:bg-white/10 text-starlight border border-white/20 text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
              >
                <Globe size={16} />
                <span className="hidden sm:inline">Вебсайт</span>
              </a>
            )}
          </div>
        </div>

        {/* Media Frame Viewer */}
        <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-black/90 aspect-video max-h-[640px] w-full shadow-2xl">
          {activeMediaTab === 'tour3d' && project.tour3dUrl ? (
            <iframe
              src={project.tour3dUrl}
              title="3D Virtual Tour"
              className="w-full h-full border-0"
              allowFullScreen
              allow="xr-spatial-tracking; gyroscope; accelerometer"
            />
          ) : activeMediaTab === 'video' && project.videoUrl ? (
            project.videoUrl.includes('youtube.com') || project.videoUrl.includes('youtu.be') ? (
              <iframe
                src={project.videoUrl.replace('watch?v=', 'embed/')}
                title="Project Intro Video"
                className="w-full h-full border-0"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : (
              <video
                src={getImageUrl(project.videoUrl)}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            )
          ) : (
            <div className="w-full h-full relative">
              <img
                src={activeImage || project.coverImage}
                alt={project.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Thumbnails Row */}
        {activeMediaTab === 'photos' && (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {[project.coverImage, ...(project.galleryImages || [])].map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImage(img)}
                className={`relative w-28 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                  activeImage === img ? 'border-plasma ring-2 ring-plasma/50' : 'border-white/10 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 🎬 Reels & Short Video Showcase */}
      {project.reels && project.reels.length > 0 && (
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-5 bg-gradient-to-br from-void/80 via-cosmic/60 to-void/80 shadow-2xl">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Film size={13} />
                <span>Reels & Богино бичлэгүүд</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-starlight">
                Төслийн бодит үзлэг & <span className="bg-gradient-to-r from-pink-400 to-rose-500 bg-clip-text text-transparent">Reels тойм</span>
              </h2>
            </div>
            <span className="text-xs text-nebula-text font-mono">
              Нийт {project.reels.length} богино бичлэг
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {project.reels.map((reel, rIdx) => (
              <motion.div
                key={rIdx}
                whileHover={{ scale: 1.03, y: -4 }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                  setActiveReelIndex(rIdx);
                  setIsReelsModalOpen(true);
                }}
                className="relative aspect-[9/15] rounded-2xl overflow-hidden cursor-pointer border border-white/10 hover:border-pink-500/60 shadow-lg hover:shadow-pink-500/25 transition-all group bg-void"
              >
                {/* Thumbnail / Video */}
                {reel.thumbnailUrl ? (
                  <img
                    src={getImageUrl(reel.thumbnailUrl)}
                    alt={reel.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <video
                    src={getImageUrl(reel.videoUrl)}
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                )}

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 group-hover:via-black/10 transition-colors" />

                {/* Top Duration / Reels Badge */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-pink-400 border border-white/10 flex items-center gap-1">
                    <Film size={11} />
                    <span>Reel</span>
                  </span>
                  {reel.durationSeconds && (
                    <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-mono text-white/80">
                      {reel.durationSeconds}s
                    </span>
                  )}
                </div>

                {/* Center Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-pink-500/80 group-hover:bg-pink-500 group-hover:scale-110 text-white flex items-center justify-center shadow-lg shadow-pink-500/40 backdrop-blur-md transition-all">
                    <Play size={18} className="translate-x-0.5 fill-white" />
                  </div>
                </div>

                {/* Bottom Title */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 space-y-0.5">
                  <h4 className="text-xs font-bold text-white line-clamp-2 drop-shadow">
                    {reel.title || `${project.name} тойм`}
                  </h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Project Reels Modal */}
      <ProjectReelsModal
        isOpen={isReelsModalOpen}
        onClose={() => setIsReelsModalOpen(false)}
        project={project}
        initialIndex={activeReelIndex}
      />

      {/* Grid: 2 Columns (Left: Floor Plans & Specs, Right: Calculator & Contacts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Floor Plans / Apartment Units (Interactive Tab) */}
          {project.floorPlans && project.floorPlans.length > 0 && (
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-heading text-starlight">
                    🏢 Байрны төлөвлөлт & Сонголтууд
                  </h2>
                  <p className="text-xs text-nebula-text mt-1">
                    Төслийн бэлэн болон захиалга авч буй өрөөний хэмжээнүүд
                  </p>
                </div>
              </div>

              {/* Floor Plan Selector Pills */}
              <div className="flex flex-wrap gap-2">
                {project.floorPlans.map((fp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveFloorIndex(idx)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      activeFloorIndex === idx
                        ? 'bg-plasma text-white border-plasma shadow-lg shadow-plasma/30'
                        : 'bg-void/50 border-white/10 text-nebula-text hover:text-white hover:border-white/30'
                    }`}
                  >
                    <span>{fp.title}</span> ({fp.areaSqm} м²)
                  </button>
                ))}
              </div>

              {/* Selected Floor Plan Detail */}
              {selectedFloorPlan && (
                <div className="p-6 rounded-2xl bg-void/60 border border-white/10 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-starlight">{selectedFloorPlan.title}</h3>
                      <p className="text-xs text-nebula-text mt-0.5">{selectedFloorPlan.description || 'Тав тухтай зохион байгуулалт'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-nebula-text block">Эхлэх үнэ:</span>
                      <span className="text-xl font-bold text-plasma font-mono">
                        {(selectedFloorPlan.startingPrice / 1000000).toLocaleString('mn-MN')} сая ₮
                      </span>
                    </div>
                  </div>

                  {/* Floor Plan Key Specs */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-cosmic border border-white/5">
                      <span className="text-[11px] text-nebula-text block">Өрөөний тоо</span>
                      <span className="text-base font-bold text-starlight">{selectedFloorPlan.rooms} өрөө</span>
                    </div>
                    <div className="p-3 rounded-xl bg-cosmic border border-white/5">
                      <span className="text-[11px] text-nebula-text block">Нийт талбай</span>
                      <span className="text-base font-bold text-starlight">{selectedFloorPlan.areaSqm} м²</span>
                    </div>
                    <div className="p-3 rounded-xl bg-cosmic border border-white/5">
                      <span className="text-[11px] text-nebula-text block">1 м.кв үнэ</span>
                      <span className="text-base font-bold text-plasma">
                        {selectedFloorPlan.pricePerSqm
                          ? `${(selectedFloorPlan.pricePerSqm / 1000000).toFixed(1)} сая`
                          : 'Тохиролцоно'}
                      </span>
                    </div>
                  </div>

                  {/* 2D & 3D Plan Layout Images */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40 p-2">
                      <span className="text-[11px] font-bold text-nebula-text mb-2 block px-2">2D План зураг:</span>
                      <img
                        src={selectedFloorPlan.image2dUrl || 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80'}
                        alt="2D Floor plan"
                        className="w-full h-48 object-contain rounded-lg"
                      />
                    </div>
                    {selectedFloorPlan.image3dUrl ? (
                      <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40 p-2">
                        <span className="text-[11px] font-bold text-nebula-text mb-2 block px-2">3D Загвар:</span>
                        <img
                          src={selectedFloorPlan.image3dUrl}
                          alt="3D Floor plan"
                          className="w-full h-48 object-contain rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40 p-4 flex flex-col items-center justify-center text-center text-xs text-nebula-text">
                        <Sparkles size={24} className="text-plasma mb-2 opacity-60" />
                        <span>3D Загвар бэлтгэгдэж байна</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Description & Overview */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
            <h2 className="text-xl font-bold font-heading text-starlight">Төслийн дэлгэрэнгүй танилцуулга</h2>
            <p className="text-sm text-nebula-text leading-relaxed whitespace-pre-line">
              {project.description}
            </p>
          </div>

          {/* Amenities & Advantages */}
          {project.amenities && project.amenities.length > 0 && (
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
              <h2 className="text-xl font-bold font-heading text-starlight">✨ Хотхоны давуу талууд & Тоноглол</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {project.amenities.map((item, i) => (
                  <div key={i} className="p-3 rounded-xl bg-void/50 border border-white/5 flex items-center gap-2 text-xs text-starlight">
                    <CheckCircle2 size={16} className="text-aurora shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Offers & Payment Conditions */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
            <h2 className="text-xl font-bold font-heading text-starlight">💳 Төлбөрийн нөхцөл & Онцгой урамшуулал</h2>
            <div className="space-y-3">
              {project.specialOffers?.map((offer, i) => (
                <div key={i} className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-3">
                  <span className="text-lg">🎁</span>
                  <span>{offer}</span>
                </div>
              ))}
              <div className="flex flex-wrap gap-2">
                {project.paymentTerms?.map((term, i) => (
                  <span key={i} className="px-3.5 py-1.5 rounded-xl bg-aurora/15 border border-aurora/40 text-aurora text-xs font-bold">
                    ✓ {term}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 📍 Location & Map Section */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-heading text-starlight flex items-center gap-2">
                  <MapPin size={20} className="text-nova" />
                  <span>Байршил & Газрын зураг</span>
                </h2>
                <p className="text-xs text-nebula-text mt-1">
                  {project.district} {project.khoroo ? `, ${project.khoroo}` : ''} {project.addressDetail ? `(${project.addressDetail})` : ''}
                </p>
              </div>
            </div>

            <ProjectMap
              projects={[project]}
              centerLat={project.latitude || 47.9184}
              centerLng={project.longitude || 106.9177}
              height="380px"
              zoom={14}
            />
          </div>
        </div>

        {/* Right Column: Mortgage Calculator & Direct Contact Card */}
        <div className="space-y-6">
          {/* Mortgage Calculator Card */}
          <div className="glass-card p-6 rounded-3xl border border-white/15 space-y-5 bg-gradient-to-b from-cosmic to-void shadow-xl">
            <div className="flex items-center gap-2 text-starlight">
              <Calculator size={20} className="text-plasma" />
              <h3 className="font-bold font-heading text-base">Ипотекийн зээлийн тооцоолуур</h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between mb-1 text-nebula-text">
                  <span>Урьдчилгаа төлбөр ({downPaymentPercent}%):</span>
                  <span className="text-starlight font-bold">{(downPaymentAmount / 1000000).toLocaleString('mn-MN')} сая ₮</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                  className="w-full accent-plasma"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1 text-nebula-text">
                  <span>Зээлийн хүү (жилийн):</span>
                  <span className="text-starlight font-bold">{interestRate}%</span>
                </div>
                <div className="flex gap-2">
                  {[6, 8, 12, 16].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setInterestRate(rate)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        interestRate === rate
                          ? 'bg-plasma text-white border-plasma'
                          : 'bg-void/50 border-white/10 text-nebula-text hover:text-white'
                      }`}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-nebula-text">
                  <span>Зээлийн хугацаа:</span>
                  <span className="text-starlight font-bold">{loanYears} жил</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="5"
                  value={loanYears}
                  onChange={(e) => setLoanYears(Number(e.target.value))}
                  className="w-full accent-plasma"
                />
              </div>
            </div>

            {/* Calculated Monthly Payment Output */}
            <div className="p-4 rounded-2xl bg-plasma/15 border border-plasma/30 text-center space-y-1">
              <span className="text-[11px] text-nebula-text uppercase font-semibold">Сарын төлөлт (ойролцоогоор):</span>
              <div className="text-2xl font-black text-plasma font-mono">
                {Math.round(monthlyPayment).toLocaleString('mn-MN')} ₮
              </div>
            </div>
          </div>

          {/* Sales Office Contact Card */}
          <div className="glass-card p-6 rounded-3xl border border-white/15 space-y-5">
            <h3 className="font-bold font-heading text-base text-starlight">Борлуулалтын албатай холбогдох</h3>

            <div className="space-y-3">
              {project.salesPhone && (
                <a
                  href={`tel:${project.salesPhone.split(',')[0].trim()}`}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white border border-emerald-500/40 font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <Phone size={16} />
                  <span>Утсаар залгах: {project.salesPhone}</span>
                </a>
              )}

              {project.facebookPageUrl && (
                <a
                  href={project.facebookPageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-[#1877F2]/20 hover:bg-[#1877F2] text-white border border-[#1877F2]/40 font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <FacebookIcon />
                  <span>Facebook хуудсаар холбогдох</span>
                </a>
              )}

              {project.instagramHandle && (
                <a
                  href={
                    project.instagramHandle.startsWith('http')
                      ? project.instagramHandle
                      : `https://instagram.com/${project.instagramHandle.replace('@', '')}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-pink-500/20 hover:bg-pink-600 text-white border border-pink-500/40 font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <InstagramIcon />
                  <span>Instagram хаягаар холбогдох</span>
                </a>
              )}

              {project.salesEmail && (
                <a
                  href={`mailto:${project.salesEmail}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-void/50 hover:bg-white/10 text-nebula-text hover:text-white border border-white/10 text-xs transition-all flex items-center justify-center gap-2"
                >
                  <Mail size={15} />
                  <span>Имэйл илгээх</span>
                </a>
              )}
            </div>
          </div>

          {/* Vmax Partnership / Cooperate Banner */}
          <div className="glass-card p-5 rounded-2xl border border-plasma/30 bg-gradient-to-br from-plasma/10 via-cosmic to-void space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-plasma/20 text-plasma flex items-center justify-center">
                <Building2 size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-starlight">Та барилгын төсөл хэрэгжүүлэгч үү?</h4>
                <p className="text-[11px] text-nebula-text">Vmax дээр төслөө нийтэлж хамтран ажиллах</p>
              </div>
            </div>
            <p className="text-[11px] text-nebula-text leading-relaxed">
              Төслийнхөө борлуулалтыг нэмэгдүүлж, олон нийтэд таниулахыг хүсвэл манай багтай холбогдоно уу.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <a
                href="tel:+97689767700"
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-plasma to-nova text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-plasma/20 hover:opacity-95 transition-opacity"
              >
                <Phone size={14} />
                <span>Холбогдох: +976 8976-7700</span>
              </a>
              <Link
                to="/create-project"
                className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-nebula-text hover:text-starlight font-semibold text-xs text-center transition-colors"
              >
                Төсөл нийтлэх маягт
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
