import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  MapPin,
  Building2,
  Sparkles,
  SlidersHorizontal,
  RotateCcw,
  Plus,
  Layers,
  CheckCircle2,
  LayoutGrid,
  Map,
  X,
  Handshake,
  Phone,
  Mail,
  ArrowRight,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Project } from '@/types';
import { projectsAPI } from '@/services/api';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectMap } from '@/components/projects/ProjectMap';

const DISTRICTS = [
  'Бүгд',
  'Хан-Уул',
  'Баянзүрх',
  'Сүхбаатар',
  'Баянгол',
  'Чингэлтэй',
  'Сонгинохайрхан',
];

export const Projects: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [district, setDistrict] = useState(searchParams.get('district') || 'Бүгд');
  const [status, setStatus] = useState(searchParams.get('status') || 'ALL');
  const [has3dTour, setHas3dTour] = useState(searchParams.get('has3dTour') === 'true');
  const [has6Percent, setHas6Percent] = useState(searchParams.get('has6Percent') === 'true');
  const [priceRange, setPriceRange] = useState<string>('ALL');

  const fetchProjects = async (override?: {
    search?: string;
    district?: string;
    status?: string;
    has3dTour?: boolean;
    has6Percent?: boolean;
    priceRange?: string;
  }) => {
    setLoading(true);
    try {
      const activeSearch = override?.search !== undefined ? override.search : search;
      const activeDistrict = override?.district !== undefined ? override.district : district;
      const activeStatus = override?.status !== undefined ? override.status : status;
      const active3d = override?.has3dTour !== undefined ? override.has3dTour : has3dTour;
      const active6Percent = override?.has6Percent !== undefined ? override.has6Percent : has6Percent;
      const activePriceRange = override?.priceRange !== undefined ? override.priceRange : priceRange;

      const params: any = {};
      if (activeSearch.trim()) params.search = activeSearch.trim();
      if (activeDistrict && activeDistrict !== 'Бүгд') params.district = activeDistrict;
      if (activeStatus && activeStatus !== 'ALL') params.status = activeStatus;
      if (active3d) params.has3dTour = true;
      if (active6Percent) params.has6PercentLoan = true;

      if (activePriceRange === 'UNDER_3M') {
        params.maxPricePerSqm = 3500000;
      } else if (activePriceRange === '3M_TO_5M') {
        params.minPricePerSqm = 3500000;
        params.maxPricePerSqm = 5000000;
      } else if (activePriceRange === 'ABOVE_5M') {
        params.minPricePerSqm = 5000000;
      }

      const res = await projectsAPI.getAll(params);
      setProjects(res.data?.items || []);
      setTotal(res.data?.total || 0);
    } catch (err) {
      console.error('Fetch projects error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search & filter trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, district, status, has3dTour, has6Percent, priceRange]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProjects();
  };

  const resetFilters = () => {
    setSearch('');
    setDistrict('Бүгд');
    setStatus('ALL');
    setHas3dTour(false);
    setHas6Percent(false);
    setPriceRange('ALL');
    setSearchParams({});
    fetchProjects({
      search: '',
      district: 'Бүгд',
      status: 'ALL',
      has3dTour: false,
      has6Percent: false,
      priceRange: 'ALL',
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 border border-white/10 bg-gradient-to-br from-void/90 via-cosmic/70 to-void/90 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-plasma/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-nova/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-plasma/10 border border-plasma/30 text-plasma text-xs font-bold uppercase tracking-wider">
            <Building2 size={14} className="animate-pulse" />
            <span>Шинэ орон сууц, төслүүд</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-heading font-black text-starlight tracking-tight leading-tight">
            Улаанбаатарын шилдэг <span className="bg-gradient-to-r from-plasma via-nova to-aurora bg-clip-text text-transparent">Хотхон & Барилгын төслүүд</span>
          </h1>

          <p className="text-nebula-text text-sm sm:text-base leading-relaxed">
            Барилгын компаниудын албан ёсны үнэ, 3D виртуал аялал, төлөвлөлтийн зураг болон 6% зээлийн нөхцөлтэй шинэ орон сууцуудыг нэг дороос судлаарай.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/create-project"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-plasma to-nova text-white font-bold text-xs sm:text-sm shadow-lg shadow-plasma/30 hover:shadow-plasma/50 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus size={16} />
              <span>Барилгын компани / Төсөл нийтлэх</span>
            </Link>
            <a
              href="tel:+97689767700"
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-starlight hover:text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Phone size={15} className="text-plasma" />
              <span>Хамтран ажиллах: +976 8976-7700</span>
            </a>
          </div>
        </div>
      </div>

      {/* 🤝 Project Cooperation & Partnership Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-plasma/30 bg-gradient-to-r from-plasma/15 via-cosmic/70 to-nova/15 p-5 sm:p-6 shadow-xl backdrop-blur-md">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-plasma/20 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-plasma/20 border border-plasma/40 text-plasma text-[11px] font-bold uppercase tracking-wider">
              <Handshake size={13} />
              <span>Барилга угсралт & Захиалагч нарт</span>
            </div>
            <h3 className="text-lg sm:text-xl font-heading font-black text-starlight tracking-tight">
              Төсөл, хотхоноо Vmax дээр нийтэлж хамтран ажиллах уу?
            </h3>
            <p className="text-xs sm:text-sm text-nebula-text leading-relaxed">
              Та шинээр ашиглалтад орж буй болон баригдаж буй төслөө 3D виртуал аялал, 6% зээлийн мэдээлэлтэйгээр зах зээлд өргөн хүрээнд сурталчлахыг хүсвэл бидэнтэй холбогдоорой.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              href="tel:+97689767700"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-plasma to-nova hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-plasma/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Phone size={15} />
              <span>Холбогдох (8976-7700)</span>
            </a>
            <a
              href="mailto:contact@vmax.mn?subject=Төсөл%20хамтран%20ажиллах%20хүсэлт"
              className="px-4 py-2.5 rounded-xl bg-void/60 hover:bg-white/10 border border-white/15 text-starlight hover:text-white font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Mail size={15} className="text-aurora" />
              <span>Имэйл илгээх</span>
            </a>
            <Link
              to="/create-project"
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-plasma/30 text-plasma hover:text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Төсөл оруулах</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-4">
        {/* Keyword Search & Submit */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-nebula-text" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Хотхоны нэр, Барилгын компани, Байршлаар хайх..."
              className="w-full pl-11 pr-10 py-3 bg-void/60 border border-white/10 rounded-xl text-starlight placeholder-nebula-text text-sm focus:outline-none focus:border-plasma transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  fetchProjects({ search: '' });
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-nebula-text hover:text-white transition-colors cursor-pointer"
                title="Цэвэрлэх"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-plasma hover:bg-plasma/80 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-plasma/25 cursor-pointer flex items-center gap-1.5"
          >
            <Search size={16} />
            <span>Хайх</span>
          </button>
        </form>

        {/* Location (District) Chips */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-starlight flex items-center gap-1.5">
            <MapPin size={13} className="text-plasma" />
            <span>Дүүрэг сонгох:</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {DISTRICTS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDistrict(d)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
                  district === d
                    ? 'bg-plasma text-white border-plasma shadow-md shadow-plasma/30'
                    : 'bg-void/40 border-white/10 text-nebula-text hover:text-starlight hover:border-white/20'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Switches & Additional Filters */}
        <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* 3D Tour Switch */}
            <button
              type="button"
              onClick={() => setHas3dTour(!has3dTour)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                has3dTour
                  ? 'bg-plasma/20 border-plasma text-plasma shadow-sm'
                  : 'bg-void/50 border-white/10 text-nebula-text hover:text-starlight'
              }`}
            >
              <Sparkles size={13} className={has3dTour ? 'text-plasma' : 'opacity-60'} />
              <span>Зөвхөн 3D Tour-тэй</span>
            </button>

            {/* 6% Loan Switch */}
            <button
              type="button"
              onClick={() => setHas6Percent(!has6Percent)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                has6Percent
                  ? 'bg-aurora/20 border-aurora text-aurora shadow-sm'
                  : 'bg-void/50 border-white/10 text-nebula-text hover:text-starlight'
              }`}
            >
              <CheckCircle2 size={13} className={has6Percent ? 'text-aurora' : 'opacity-60'} />
              <span>Ипотекийн 6% зээлтэй</span>
            </button>

            {/* Price Range Selector */}
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-void/60 border border-white/10 text-xs text-starlight focus:outline-none focus:border-plasma"
            >
              <option value="ALL">Бүх м.кв үнэ</option>
              <option value="UNDER_3M">3.5 сая ₮-өөс доош</option>
              <option value="3M_TO_5M">3.5 сая — 5 сая ₮</option>
              <option value="ABOVE_5M">5 сая ₮-өөс дээш (Luxury)</option>
            </select>

            {/* Status Selector */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-void/60 border border-white/10 text-xs text-starlight focus:outline-none focus:border-plasma"
            >
              <option value="ALL">Бүх төлөв</option>
              <option value="READY_TO_MOVE">Ашиглалтад орсон</option>
              <option value="CONSTRUCTING">Баригдаж байгаа</option>
              <option value="PLANNING">Захиалга авч буй</option>
            </select>
          </div>

          {/* Reset button */}
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs text-nebula-text hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Шүүлтүүр цэвэрлэх</span>
          </button>
        </div>
      </div>

      {/* Projects Section with Grid / Map view toggling */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-nebula-text">
            Нийт <span className="text-starlight font-bold">{total}</span> төсөл олдлоо
          </p>

          {/* Grid / Map Mode Toggles */}
          <div className="flex items-center gap-1 bg-void/60 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-plasma text-white shadow-md shadow-plasma/25'
                  : 'text-nebula-text hover:text-white'
              }`}
            >
              <LayoutGrid size={14} />
              <span>Жагсаалт</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-plasma text-white shadow-md shadow-plasma/25'
                  : 'text-nebula-text hover:text-white'
              }`}
            >
              <Map size={14} />
              <span>Газрын зураг</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 rounded-2xl bg-void/40 border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-2xl border border-white/10 space-y-4">
            <Building2 size={48} className="mx-auto text-nebula-text opacity-40" />
            <h3 className="text-xl font-bold text-starlight">Одоогоор төсөл олдсонгүй</h3>
            <p className="text-nebula-text text-xs max-w-sm mx-auto">
              Та сонгосон шүүлтүүрээ өөрчлөх эсвэл хайлтын үгээ шалгаж дахин оролдоно уу.
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl bg-plasma text-white text-xs font-bold"
            >
              Бүх төслийг харах
            </button>
          </div>
        ) : viewMode === 'map' ? (
          <div className="space-y-4">
            <ProjectMap projects={projects} height="650px" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
