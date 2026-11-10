import React, { useState, useEffect } from 'react';
import { Search, Mic, MapPin, Home, SlidersHorizontal, Bell, Flame, Building2, Layers, RotateCcw, BedDouble } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';
import { useI18n } from '@/i18n';
import FilterDrawer from './FilterDrawer';
import { SaveSearchAlertModal } from './SaveSearchAlertModal';
import { PriceInput } from '@/components/common/PriceInput';
import { locationsAPI } from '@/services/api';

export const DISTRICT_KHOROOS_MAP: Record<string, number> = {
  'Хан-Уул': 25,
  'Баянзүрх': 28,
  'Сүхбаатар': 20,
  'Баянгол': 25,
  'Сонгинохайрхан': 43,
  'Чингэлтэй': 24,
  'Багануур': 5,
  'Багахангай': 2,
  'Налайх': 8,
};

export const POPULAR_LOCATIONS = [
  { id: 'zaisan', label: 'Зайсан', district: 'Хан-Уул', query: 'Зайсан' },
  { id: 'yarmag', label: 'Яармаг / Нисэх', district: 'Хан-Уул', query: 'Яармаг' },
  { id: 'river-garden', label: 'River Garden', district: 'Хан-Уул', query: 'River Garden' },
  { id: '120-myangat', label: '120 мянгат', district: 'Хан-Уул', query: '120 мянгат' },
  { id: 'hunnu-2222', label: 'Хүннү 2222', district: 'Хан-Уул', query: 'Хүннү 2222' },
  { id: 'ih-mongol', label: 'Их Монгол', district: 'Хан-Уул', query: 'Их Монгол' },
  { id: 'bayanmongol', label: 'Баянмонгол', district: 'Баянзүрх', query: 'Баянмонгол' },
  { id: 'sansar', label: 'Сансар', district: 'Баянзүрх', query: 'Сансар' },
  { id: 'tov-talbai', label: 'Төв талбай (А бүс)', district: 'Сүхбаатар', query: 'Төв талбай' },
  { id: '3-4-khoroolol', label: '3, 4-р хороолол', district: 'Баянгол', query: '3-р хороолол' },
  { id: '1-khoroolol', label: '1-р хороолол', district: 'Сонгинохайрхан', query: '1-р хороолол' },
  { id: '10-khoroolol', label: '10-р хороолол', district: 'Баянгол', query: '10-р хороолол' },
  { id: 'marshal-town', label: 'Маршал Таун', district: 'Хан-Уул', query: 'Маршал' },
  { id: 'encanto', label: 'Encanto Town', district: 'Баянзүрх', query: 'Encanto' },
  { id: 'belkh', label: 'Бэлх / Сэлх', district: 'Сүхбаатар', query: 'Бэлх' },
];

export interface SearchFilterParams {
  query: string;
  type: string;
  category: string;
  district: string;
  khoroo?: string;
  priceMin: string;
  priceMax: string;
  areaMin?: string;
  areaMax?: string;
  bedrooms?: string;
  bathrooms?: string;
  yearBuiltMin?: string;
  constructionType?: string;
  sortBy: string;
}

interface SearchBarProps {
  onSearch?: (filters: SearchFilterParams) => void;
  initialFilters?: Partial<SearchFilterParams>;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, initialFilters }) => {
  const [query, setQuery] = useState(initialFilters?.query || '');
  const [type, setType] = useState(initialFilters?.type || '');
  const [category, setCategory] = useState(initialFilters?.category || '');
  const [district, setDistrict] = useState(initialFilters?.district || '');
  const [khoroo, setKhoroo] = useState(initialFilters?.khoroo || '');
  const [khorooOptions, setKhorooOptions] = useState<string[]>([]);
  const [activePopularId, setActivePopularId] = useState<string | null>(() => {
    const match = POPULAR_LOCATIONS.find(
      (loc) => loc.query === (initialFilters?.query || '') && loc.district === (initialFilters?.district || '')
    );
    return match ? match.id : null;
  });
  const [priceMin, setPriceMin] = useState(initialFilters?.priceMin || '');
  const [priceMax, setPriceMax] = useState(initialFilters?.priceMax || '');
  const [areaMin, setAreaMin] = useState(initialFilters?.areaMin || '');
  const [areaMax, setAreaMax] = useState(initialFilters?.areaMax || '');
  const [bedrooms, setBedrooms] = useState(initialFilters?.bedrooms || '');
  const [bathrooms, setBathrooms] = useState(initialFilters?.bathrooms || '');
  const [yearBuiltMin, setYearBuiltMin] = useState(initialFilters?.yearBuiltMin || '');
  const [constructionType, setConstructionType] = useState(initialFilters?.constructionType || '');
  const [sortBy, setSortBy] = useState(initialFilters?.sortBy || 'newest');
  const [showAdvanced, setShowAdvanced] = useState(() =>
    Boolean(
      initialFilters?.priceMin ||
      initialFilters?.priceMax ||
      initialFilters?.areaMin ||
      initialFilters?.areaMax ||
      initialFilters?.bathrooms ||
      initialFilters?.yearBuiltMin ||
      initialFilters?.constructionType
    )
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    if (!initialFilters) return;
    setQuery(initialFilters.query || '');
    setType(initialFilters.type || '');
    setCategory(initialFilters.category || '');
    setDistrict(initialFilters.district || '');
    setKhoroo(initialFilters.khoroo || '');
    setPriceMin(initialFilters.priceMin || '');
    setPriceMax(initialFilters.priceMax || '');
    setAreaMin(initialFilters.areaMin || '');
    setAreaMax(initialFilters.areaMax || '');
    setBedrooms(initialFilters.bedrooms || '');
    setBathrooms(initialFilters.bathrooms || '');
    setYearBuiltMin(initialFilters.yearBuiltMin || '');
    setConstructionType(initialFilters.constructionType || '');
    setSortBy(initialFilters.sortBy || 'newest');
    const match = POPULAR_LOCATIONS.find(
      (loc) => loc.query === (initialFilters.query || '') && loc.district === (initialFilters.district || '')
    );
    setActivePopularId(match ? match.id : null);
  }, [initialFilters]);

  const { isListening, startListening } = useVoiceSearch((text) => {
    setQuery(text);
  });

  // Dynamically load khoroos when district changes
  useEffect(() => {
    if (!district) {
      setKhorooOptions([]);
      setKhoroo('');
      return;
    }

    const maxCount = DISTRICT_KHOROOS_MAP[district] || 25;
    const fallbackList = Array.from({ length: maxCount }, (_, i) => `${i + 1}-р хороо`);

    locationsAPI.getKhoroos(district)
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const names = res.data.map((item: any) => item.khoroo);
          setKhorooOptions(names);
        } else {
          setKhorooOptions(fallbackList);
        }
      })
      .catch(() => {
        setKhorooOptions(fallbackList);
      });
  }, [district]);

  const emitSearch = (overrides: Partial<SearchFilterParams> = {}) => {
    if (onSearch) {
      onSearch({
        query,
        type,
        category,
        district,
        khoroo,
        priceMin,
        priceMax,
        areaMin,
        areaMax,
        bedrooms,
        bathrooms,
        yearBuiltMin,
        constructionType,
        sortBy,
        ...overrides,
      });
    }
  };

  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    setKhoroo('');
    setActivePopularId(null);
    emitSearch({ district: newDistrict, khoroo: '' });
  };

  const handlePopularLocationClick = (loc: typeof POPULAR_LOCATIONS[0]) => {
    if (activePopularId === loc.id) {
      // Toggle off / reset
      setActivePopularId(null);
      setDistrict('');
      setKhoroo('');
      setQuery('');
      emitSearch({ query: '', district: '', khoroo: '' });
      return;
    }

    setActivePopularId(loc.id);
    setDistrict(loc.district);
    setKhoroo('');
    setQuery(loc.query);

    emitSearch({ query: loc.query, district: loc.district, khoroo: '' });
  };

  const handleSearch = () => {
    emitSearch();
  };

  const activeAdvancedCount = [
    priceMin,
    priceMax,
    areaMin,
    areaMax,
    bathrooms,
    yearBuiltMin,
    constructionType,
    khoroo,
  ].filter(Boolean).length;

  const hasAnyFilter = Boolean(
    query || type || category || district || bedrooms || activeAdvancedCount > 0
  );

  const handleResetAll = () => {
    setQuery('');
    setType('');
    setCategory('');
    setDistrict('');
    setKhoroo('');
    setActivePopularId(null);
    setPriceMin('');
    setPriceMax('');
    setAreaMin('');
    setAreaMax('');
    setBedrooms('');
    setBathrooms('');
    setYearBuiltMin('');
    setConstructionType('');
    emitSearch({
      query: '',
      type: '',
      category: '',
      district: '',
      khoroo: '',
      priceMin: '',
      priceMax: '',
      areaMin: '',
      areaMax: '',
      bedrooms: '',
      bathrooms: '',
      yearBuiltMin: '',
      constructionType: '',
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-4 md:p-6 rounded-2xl border-glow shadow-2xl relative z-30"
      >
        {/* Top Controls: Transaction Type Tabs & Advanced Filters Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-4">
          {/* Segmented Type Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 p-1 bg-void/60 rounded-2xl border border-white/10 w-full sm:w-auto sm:inline-flex sm:space-x-1 gap-1 sm:gap-0">
            <button
              onClick={() => {
                setType('');
                emitSearch({ type: '' });
              }}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all text-center ${
                type === ''
                  ? 'bg-gradient-to-r from-plasma to-nova text-white-force shadow-md shadow-plasma/30'
                  : 'text-slate-600 dark:text-nebula-text hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.filters.allTypes}
            </button>
            <button
              onClick={() => {
                setType('SALE');
                emitSearch({ type: 'SALE' });
              }}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all text-center ${
                type === 'SALE'
                  ? 'bg-gradient-to-r from-plasma to-nova text-white-force shadow-md shadow-plasma/30'
                  : 'text-slate-600 dark:text-nebula-text hover:text-plasma'
              }`}
            >
              {t.listings.sale}
            </button>
            <button
              onClick={() => {
                setType('RENT');
                emitSearch({ type: 'RENT' });
              }}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all text-center ${
                type === 'RENT'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white-force shadow-md shadow-emerald-500/30'
                  : 'text-slate-600 dark:text-nebula-text hover:text-emerald-500'
              }`}
            >
              {t.listings.rent}
            </button>
            <button
              type="button"
              onClick={() => {
                setType('DAILY_RENT');
                emitSearch({ type: 'DAILY_RENT' });
              }}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                type === 'DAILY_RENT'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white-force shadow-md shadow-amber-500/30'
                  : 'text-slate-600 dark:text-nebula-text hover:text-amber-500'
              }`}
            >
              <span>Хоногоор (Stay)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {hasAnyFilter && (
              <button
                type="button"
                onClick={handleResetAll}
                className="flex items-center justify-center space-x-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all border bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 cursor-pointer"
                title="Бүх шүүлтүүрийг арилгах"
              >
                <RotateCcw size={13} />
                <span>Цэвэрлэх</span>
              </button>
            )}

            {/* Advanced Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                showAdvanced || activeAdvancedCount > 0
                  ? 'bg-plasma/20 border-plasma/40 text-plasma shadow-sm'
                  : 'bg-void/50 border-white/10 text-nebula-text hover:text-plasma hover:border-plasma/30'
              }`}
            >
              <SlidersHorizontal size={14} />
              <span>Дэлгэрэнгүй шүүлтүүр</span>
              {activeAdvancedCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-plasma text-white text-[10px] font-bold">
                  {activeAdvancedCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Popular Locations Horizontal Pills Bar */}
        <div className="mb-4 pb-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex items-center space-x-1 text-xs font-bold text-plasma uppercase tracking-wider">
              <Flame size={14} className="text-amber-400 fill-amber-400 animate-pulse" />
              <span>Алдартай байршлууд:</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1 text-xs">
            {POPULAR_LOCATIONS.map((loc) => {
              const isActive = activePopularId === loc.id;
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => handlePopularLocationClick(loc)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl font-medium transition-all duration-200 flex items-center space-x-1.5 border ${
                    isActive
                      ? 'bg-gradient-to-r from-plasma to-nova text-white border-plasma shadow-md shadow-plasma/30 scale-[1.03]'
                      : 'bg-void/40 border-white/10 text-nebula-text hover:text-starlight hover:bg-plasma/10 hover:border-plasma/30'
                  }`}
                >
                  <MapPin size={12} className={isActive ? 'text-white' : 'text-plasma'} />
                  <span>{loc.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Search Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Keyword Search Input */}
          <div className={`${district ? 'md:col-span-3' : 'md:col-span-4'} relative transition-all`}>
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-nebula-text">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              id="search-keyword"
              name="keyword"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (activePopularId) setActivePopularId(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="block w-full pl-11 pr-12 py-3 bg-void/50 border border-white/10 rounded-xl text-starlight placeholder-nebula-text focus:outline-none focus:border-plasma focus:ring-1 focus:ring-plasma transition-all text-sm"
              placeholder={t.hero.search + '...'}
            />
            <button
              onClick={startListening}
              title="Voice Search"
              className={`absolute inset-y-0 right-0 pr-3.5 flex items-center ${
                isListening ? 'text-plasma animate-pulse' : 'text-nebula-text hover:text-plasma transition-colors'
              }`}
            >
              <Mic className="h-5 w-5" />
            </button>
          </div>

          {/* Category Dropdown */}
          <div className={`${district ? 'md:col-span-2' : 'md:col-span-3'} relative transition-all`}>
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-nebula-text">
              <Home className="h-5 w-5" />
            </div>
            <select
              id="search-category"
              name="category"
              value={category}
              onChange={(e) => {
                const val = e.target.value;
                setCategory(val);
                emitSearch({ category: val });
              }}
              className="block w-full pl-11 pr-8 py-3 bg-void/50 border border-white/10 rounded-xl text-starlight focus:outline-none focus:border-plasma appearance-none text-sm cursor-pointer"
            >
              <option value="">{t.filters.category} ({t.filters.all})</option>
              <option value="APARTMENT">{t.filters.apartment}</option>
              <option value="HOUSE">{t.filters.house}</option>
              <option value="LAND">{t.filters.land}</option>
              <option value="COMMERCIAL">{t.filters.commercial}</option>
            </select>
          </div>

          {/* 9 Districts of Ulaanbaatar Dropdown */}
          <div className={`${district ? 'md:col-span-3' : 'md:col-span-3'} relative transition-all`}>
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-nebula-text">
              <MapPin className="h-5 w-5" />
            </div>
            <select
              id="search-district"
              name="district"
              value={district}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="block w-full pl-11 pr-8 py-3 bg-void/50 border border-white/10 rounded-xl text-starlight focus:outline-none focus:border-plasma appearance-none text-sm cursor-pointer"
            >
              <option value="">{t.filters.location} (Бүх дүүрэг)</option>
              <option value="Баянгол">{t.filters.districts.bayangol}</option>
              <option value="Баянзүрх">{t.filters.districts.bayanzurkh}</option>
              <option value="Сонгинохайрхан">{t.filters.districts.songinokhairkhan}</option>
              <option value="Сүхбаатар">{t.filters.districts.sukhbaatar}</option>
              <option value="Хан-Уул">{t.filters.districts.khanuul}</option>
              <option value="Чингэлтэй">{t.filters.districts.chingeltei}</option>
              <option value="Багануур">{t.filters.districts.baganuur}</option>
              <option value="Багахангай">{t.filters.districts.bagakhangai}</option>
              <option value="Налайх">{t.filters.districts.nalaikh}</option>
            </select>
          </div>

          {/* Khoroo Dropdown (Shown when district is selected) */}
          {district && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="md:col-span-2 relative transition-all"
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-plasma">
                <Layers className="h-4 w-4" />
              </div>
              <select
                id="search-khoroo"
                name="khoroo"
                value={khoroo}
                onChange={(e) => {
                  const val = e.target.value;
                  setKhoroo(val);
                  emitSearch({ khoroo: val });
                }}
                className="block w-full pl-9 pr-7 py-3 bg-plasma/10 border border-plasma/40 rounded-xl text-starlight focus:outline-none focus:border-plasma appearance-none text-sm cursor-pointer font-medium"
              >
                <option value="" className="bg-nebula text-starlight">Бүх хороо</option>
                {khorooOptions.map((k) => (
                  <option key={k} value={k} className="bg-nebula text-starlight">
                    {k}
                  </option>
                ))}
              </select>
            </motion.div>
          )}

          {/* Search, Alert & Filter Buttons */}
          <div className="md:col-span-2 flex items-center space-x-2">
            <button
              onClick={handleSearch}
              className="flex-1 bg-gradient-to-r from-plasma via-nova to-aurora text-white-force font-bold py-3 px-4 rounded-xl hover:shadow-lg hover:shadow-plasma/40 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center space-x-2 shadow-md shadow-plasma/25"
              title="Хайх"
            >
              <Search size={16} className="text-white-force stroke-white stroke-[2.5]" color="#ffffff" />
              <span className="font-bold text-sm tracking-wide text-white-force text-white">Хайх</span>
            </button>

            <button
              onClick={() => setIsAlertModalOpen(true)}
              className="p-3 bg-void/50 border border-white/10 text-plasma hover:bg-plasma/20 hover:border-plasma/40 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
              title="Шинэ зарын мэдэгдэл захиалах"
            >
              <Bell className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="md:hidden p-3 bg-void/50 border border-white/10 text-nebula-text hover:text-plasma rounded-xl flex items-center justify-center flex-shrink-0"
              title="More Filters"
            >
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Always-Visible Quick Room Count Selector Pills */}
        <div className="mt-3.5 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-nebula-text mr-1">
            <BedDouble size={14} className="text-plasma" />
            <span>Өрөөний тоо:</span>
          </div>
          {[
            { value: '', label: 'Бүгд' },
            { value: '1', label: '1 өрөө' },
            { value: '2', label: '2 өрөө' },
            { value: '3', label: '3 өрөө' },
            { value: '4', label: '4 өрөө' },
            { value: '5', label: '5+ өрөө' },
          ].map((opt) => {
            const isSelected = bedrooms === opt.value;
            return (
              <button
                key={opt.value || 'all'}
                type="button"
                onClick={() => {
                  const nextVal = isSelected && opt.value !== '' ? '' : opt.value;
                  setBedrooms(nextVal);
                  emitSearch({ bedrooms: nextVal });
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-plasma to-aurora text-white-force border-plasma shadow-md shadow-plasma/25 scale-[1.02]'
                    : 'bg-void/50 border-white/10 text-nebula-text hover:text-starlight hover:border-plasma/40 hover:bg-plasma/10'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Collapsible Detailed Advanced Filters Grid */}
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-white/10 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">

              {/* Price Min */}
              <div>
                <PriceInput
                  value={priceMin}
                  onChange={setPriceMin}
                  label="Доод үнэ (₮)"
                  placeholder="Мин үнэ"
                  size="sm"
                  mode={type === 'RENT' ? 'rent' : 'sale'}
                />
              </div>

              {/* Price Max */}
              <div>
                <PriceInput
                  value={priceMax}
                  onChange={setPriceMax}
                  label="Дээд үнэ (₮)"
                  placeholder="Макс үнэ"
                  size="sm"
                  mode={type === 'RENT' ? 'rent' : 'sale'}
                />
              </div>

              {/* Area Min */}
              <div>
                <label className="block text-xs font-semibold text-nebula-text mb-1 flex items-center">
                  <span>Доод талбай (м.кв)</span>
                </label>
                <input
                  type="number"
                  value={areaMin}
                  onChange={(e) => setAreaMin(e.target.value)}
                  placeholder="Мин м.кв"
                  className="w-full bg-void/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-starlight focus:outline-none focus:border-plasma"
                />
              </div>

              {/* Area Max */}
              <div>
                <label className="block text-xs font-semibold text-nebula-text mb-1 flex items-center">
                  <span>Дээд талбай (м.кв)</span>
                </label>
                <input
                  type="number"
                  value={areaMax}
                  onChange={(e) => setAreaMax(e.target.value)}
                  placeholder="Макс м.кв"
                  className="w-full bg-void/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-starlight focus:outline-none focus:border-plasma"
                />
              </div>

              {/* Bedrooms Select */}
              <div>
                <label className="block text-xs font-semibold text-nebula-text mb-1">
                  <span>Өрөөний тоо</span>
                </label>
                <select
                  id="search-bedrooms"
                  name="bedrooms"
                  value={bedrooms}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBedrooms(val);
                    emitSearch({ bedrooms: val });
                  }}
                  className="w-full bg-void/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-starlight focus:outline-none focus:border-plasma cursor-pointer"
                >
                  <option value="">Бүх өрөө</option>
                  <option value="1">1 өрөө</option>
                  <option value="2">2 өрөө</option>
                  <option value="3">3 өрөө</option>
                  <option value="4">4 өрөө</option>
                  <option value="5">5+ өрөө</option>
                </select>
              </div>

              {/* Construction Type Select */}
              <div>
                <label className="block text-xs font-semibold text-nebula-text mb-1">
                  <span>Барилгын хийц</span>
                </label>
                <select
                  id="search-construction-type"
                  name="constructionType"
                  value={constructionType}
                  onChange={(e) => {
                    const val = e.target.value;
                    setConstructionType(val);
                    emitSearch({ constructionType: val });
                  }}
                  className="w-full bg-void/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-starlight focus:outline-none focus:border-plasma cursor-pointer"
                >
                  <option value="">Бүх барилга</option>
                  <option value="Бүрэн цутгамал">Бүрэн цутгамал</option>
                  <option value="Тоосго">Тоосгон хийц</option>
                  <option value="Каркас">Каркас барилга</option>
                  <option value="Модон">Модон / Канад</option>
                </select>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-2">
              {(priceMin || priceMax || areaMin || areaMax || bedrooms || constructionType) && (
                <button
                  onClick={() => {
                    setPriceMin('');
                    setPriceMax('');
                    setAreaMin('');
                    setAreaMax('');
                    setBedrooms('');
                    setBathrooms('');
                    setYearBuiltMin('');
                    setConstructionType('');
                    emitSearch({
                      priceMin: '',
                      priceMax: '',
                      areaMin: '',
                      areaMax: '',
                      bedrooms: '',
                      bathrooms: '',
                      yearBuiltMin: '',
                      constructionType: '',
                    });
                  }}
                  className="px-4 py-2 bg-void/50 border border-white/10 text-nebula-text hover:text-white rounded-xl text-xs transition-all"
                >
                  {t.filters.reset}
                </button>
              )}
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-gradient-to-r from-plasma to-aurora text-white font-semibold rounded-xl text-xs hover:shadow-lg hover:shadow-plasma/30 transition-all active:scale-95"
              >
                {t.filters.apply} (Дэлгэрэнгүй Шүүх)
              </button>
            </div>
          </motion.div>
        )}

      </motion.div>

      {/* Mobile Filter Drawer */}
      <FilterDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        district={district}
        khoroo={khoroo}
        bedrooms={bedrooms}
        onApply={(filters) => {
          if (filters.district !== undefined) setDistrict(filters.district);
          if (filters.khoroo !== undefined) setKhoroo(filters.khoroo);
          if (filters.bedrooms !== undefined) setBedrooms(filters.bedrooms);
          if (filters.priceMin !== undefined) setPriceMin(filters.priceMin);
          if (filters.priceMax !== undefined) setPriceMax(filters.priceMax);
          if (filters.areaMin !== undefined) setAreaMin(filters.areaMin);
          if (filters.areaMax !== undefined) setAreaMax(filters.areaMax);

          emitSearch({
            district: filters.district !== undefined ? filters.district : district,
            khoroo: filters.khoroo !== undefined ? filters.khoroo : khoroo,
            bedrooms: filters.bedrooms !== undefined ? filters.bedrooms : bedrooms,
            priceMin: filters.priceMin !== undefined ? filters.priceMin : priceMin,
            priceMax: filters.priceMax !== undefined ? filters.priceMax : priceMax,
            areaMin: filters.areaMin !== undefined ? filters.areaMin : areaMin,
            areaMax: filters.areaMax !== undefined ? filters.areaMax : areaMax,
          });
        }}
      />

      {/* Save Search Alert Modal */}
      <SaveSearchAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        filters={{
          query,
          type,
          category,
          district,
          khoroo,
          priceMin,
          priceMax,
          areaMin,
          areaMax,
          bedrooms,
          bathrooms,
          yearBuiltMin,
          constructionType,
          sortBy,
        }}
      />
    </>
  );
};


export default SearchBar;
