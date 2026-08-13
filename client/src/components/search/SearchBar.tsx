import React, { useState } from 'react';
import { Search, Mic, MapPin, Home, SlidersHorizontal, ArrowUpDown, DollarSign, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';
import { useI18n } from '@/i18n';
import FilterDrawer from './FilterDrawer';
import { SaveSearchAlertModal } from './SaveSearchAlertModal';

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
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [district, setDistrict] = useState('');
  const [khoroo, setKhoroo] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [areaMin, setAreaMin] = useState('');
  const [areaMax, setAreaMax] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [yearBuiltMin, setYearBuiltMin] = useState('');
  const [constructionType, setConstructionType] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const { t } = useI18n();

  const { isListening, startListening } = useVoiceSearch((text) => {
    setQuery(text);
  });

  const handleSearch = () => {
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
      });
    }
  };


  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-4 md:p-6 rounded-2xl border-glow shadow-2xl relative z-30"
      >
        {/* Top Controls: Transaction Type Tabs & Sorting Dropdown */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          {/* Type Selector Tabs */}
          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto">
            <button
              onClick={() => setType('')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                type === ''
                  ? 'bg-gradient-to-r from-plasma to-nova text-white-force shadow-lg shadow-plasma/30'
                  : 'bg-void/40 text-nebula-text hover:text-plasma hover:bg-void/60'
              }`}
            >
              {t.filters.allTypes}
            </button>
            <button
              onClick={() => setType('SALE')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                type === 'SALE'
                  ? 'bg-gradient-to-r from-plasma to-nova text-white-force shadow-lg shadow-plasma/30'
                  : 'bg-void/40 text-nebula-text hover:text-plasma hover:bg-void/60'
              }`}
            >
              {t.listings.sale}
            </button>
            <button
              onClick={() => setType('RENT')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                type === 'RENT'
                  ? 'bg-gradient-to-r from-plasma to-nova text-white-force shadow-lg shadow-plasma/30'
                  : 'bg-void/40 text-nebula-text hover:text-plasma hover:bg-void/60'
              }`}
            >
              {t.listings.rent}
            </button>
          </div>

          {/* Sort By Dropdown & Advanced Toggle */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <div className="relative flex-1 sm:flex-initial">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-plasma">
                <ArrowUpDown size={14} />
              </div>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  if (onSearch) {
                    onSearch({ query, type, category, district, priceMin, priceMax, sortBy: e.target.value });
                  }
                }}
                className="pl-8 pr-8 py-2 bg-void/50 border border-white/10 rounded-xl text-starlight text-xs font-semibold focus:outline-none focus:border-plasma appearance-none cursor-pointer w-full"
              >
                <option value="newest">{t.sort.newest}</option>
                <option value="views">{t.sort.mostViewed} 🔥</option>
                <option value="priceAsc">{t.sort.priceLowHigh}</option>
                <option value="priceDesc">{t.sort.priceHighLow}</option>
                <option value="mostShared">{t.sort.mostShared}</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`hidden md:flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                showAdvanced || priceMin || priceMax
                  ? 'bg-plasma/20 border-plasma/40 text-plasma'
                  : 'bg-void/50 border-white/10 text-nebula-text hover:text-plasma'
              }`}
            >
              <SlidersHorizontal size={14} />
              <span>Үнэ шүүх</span>
            </button>
          </div>
        </div>

        {/* Main Search Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Keyword Search Input */}
          <div className="md:col-span-5 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-nebula-text">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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
          <div className="md:col-span-3 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-nebula-text">
              <Home className="h-5 w-5" />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="block w-full pl-11 pr-8 py-3 bg-void/50 border border-white/10 rounded-xl text-starlight focus:outline-none focus:border-plasma appearance-none text-sm cursor-pointer"
            >
              <option value="">{t.filters.category} ({t.filters.all})</option>
              <option value="APARTMENT">{t.filters.apartment}</option>
              <option value="HOUSE">{t.filters.house}</option>
              {/* <option value="LAND">{t.filters.land}</option> */}
              <option value="COMMERCIAL">{t.filters.commercial}</option>
              {/* <option value="RESORT">{t.filters.resort}</option> */}
            </select>

          </div>

          {/* 9 Districts of Ulaanbaatar Dropdown */}
          <div className="md:col-span-3 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-nebula-text">
              <MapPin className="h-5 w-5" />
            </div>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="block w-full pl-11 pr-8 py-3 bg-void/50 border border-white/10 rounded-xl text-starlight focus:outline-none focus:border-plasma appearance-none text-sm cursor-pointer"
            >
              <option value="">{t.filters.location}</option>
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

          {/* Search, Alert & Filter Buttons */}
          <div className="md:col-span-1 flex space-x-2">
            <button
              onClick={handleSearch}
              className="w-full bg-gradient-to-r from-plasma to-nova text-white-force font-medium py-3 rounded-xl hover:shadow-lg hover:shadow-plasma/30 transition-all duration-300 flex items-center justify-center"
              title="Хайх"
            >
              <Search className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={() => setIsAlertModalOpen(true)}
              className="px-3 bg-plasma/20 border border-plasma/40 text-plasma hover:bg-plasma hover:text-white rounded-xl flex items-center justify-center transition-all"
              title="Шинэ зарын мэдэгдэл захиалах"
            >
              <Bell className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="md:hidden px-3 bg-void/50 border border-white/10 text-nebula-text hover:text-plasma rounded-xl flex items-center justify-center"
              title="More Filters"
            >
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </div>

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
                <label className="block text-xs font-semibold text-nebula-text mb-1 flex items-center">
                  <DollarSign size={13} className="mr-1 text-plasma" />
                  <span>Доод үнэ (₮)</span>
                </label>
                <input
                  type="number"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  placeholder="Мин үнэ"
                  className="w-full bg-void/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-starlight focus:outline-none focus:border-plasma"
                />
              </div>

              {/* Price Max */}
              <div>
                <label className="block text-xs font-semibold text-nebula-text mb-1 flex items-center">
                  <DollarSign size={13} className="mr-1 text-plasma" />
                  <span>Дээд үнэ (₮)</span>
                </label>
                <input
                  type="number"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  placeholder="Макс үнэ"
                  className="w-full bg-void/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-starlight focus:outline-none focus:border-plasma"
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
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full bg-void/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-starlight focus:outline-none focus:border-plasma"
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
                  value={constructionType}
                  onChange={(e) => setConstructionType(e.target.value)}
                  className="w-full bg-void/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-starlight focus:outline-none focus:border-plasma"
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
                    handleSearch();
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
        onApply={(filters) => {
          if (onSearch) {
            onSearch({
              query,
              type,
              category,
              district,
              priceMin: filters.priceMin,
              priceMax: filters.priceMax,
              sortBy,
            });
          }
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
          priceMin,
          priceMax,
          sortBy,
        }}
      />
    </>
  );
};


export default SearchBar;
