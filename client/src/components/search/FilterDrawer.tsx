import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Maximize, MapPin, Layers } from 'lucide-react';
import { useI18n } from '@/i18n';
import { PriceInput } from '@/components/common/PriceInput';
import { locationsAPI } from '@/services/api';
import { DISTRICT_KHOROOS_MAP } from './SearchBar';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  district?: string;
  khoroo?: string;
  onApply?: (filters: { district?: string; khoroo?: string; priceMin: string; priceMax: string; areaMin: string; areaMax: string }) => void;
}

const FilterDrawer: React.FC<Props> = ({ isOpen, onClose, district: initDistrict = '', khoroo: initKhoroo = '', onApply }) => {
  const { t } = useI18n();
  const [district, setDistrict] = useState(initDistrict);
  const [khoroo, setKhoroo] = useState(initKhoroo);
  const [khorooOptions, setKhorooOptions] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [areaMin, setAreaMin] = useState('');
  const [areaMax, setAreaMax] = useState('');

  useEffect(() => {
    setDistrict(initDistrict);
    setKhoroo(initKhoroo);
  }, [initDistrict, initKhoroo, isOpen]);

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

  const handleApply = () => {
    if (onApply) {
      onApply({ district, khoroo, priceMin, priceMax, areaMin, areaMax });
    }
    onClose();
  };

  const handleReset = () => {
    setDistrict('');
    setKhoroo('');
    setPriceMin('');
    setPriceMax('');
    setAreaMin('');
    setAreaMax('');
    if (onApply) {
      onApply({ district: '', khoroo: '', priceMin: '', priceMax: '', areaMin: '', areaMax: '' });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-void/80 backdrop-blur-sm z-40" />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 h-[85vh] bg-cosmic border-t border-white/10 rounded-t-3xl z-50 p-6 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-heading font-bold text-starlight">{t.filters.apply}</h3>
              <button onClick={onClose} className="text-nebula-text hover:text-plasma p-2 bg-void/50 rounded-full"><X size={20} /></button>
            </div>

            <div className="space-y-6">
              {/* District Select */}
              <div>
                <label className="block text-sm font-semibold text-starlight mb-2 flex items-center">
                  <MapPin size={16} className="mr-1 text-plasma" />
                  <span>Дүүрэг сонгох</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    setKhoroo('');
                  }}
                  className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-starlight focus:outline-none focus:border-plasma text-sm cursor-pointer"
                >
                  <option value="">Бүх дүүрэг</option>
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

              {/* Khoroo Select */}
              {district && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                  <label className="block text-sm font-semibold text-starlight mb-2 flex items-center">
                    <Layers size={16} className="mr-1 text-plasma" />
                    <span>Хороо сонгох ({district})</span>
                  </label>
                  <select
                    value={khoroo}
                    onChange={(e) => setKhoroo(e.target.value)}
                    className="w-full bg-plasma/10 border border-plasma/40 rounded-xl px-4 py-3 text-starlight focus:outline-none focus:border-plasma text-sm cursor-pointer"
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

              {/* Price Range */}
              <div>
                <label className="block text-sm font-semibold text-starlight mb-2 flex items-center">
                  <DollarSign size={16} className="mr-1 text-plasma" />
                  <span>{t.filters.priceRange}</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <PriceInput
                    value={priceMin}
                    onChange={setPriceMin}
                    placeholder={t.filters.min}
                    size="sm"
                  />
                  <PriceInput
                    value={priceMax}
                    onChange={setPriceMax}
                    placeholder={t.filters.max}
                    size="sm"
                  />
                </div>
              </div>

              {/* Area Range */}
              <div>
                <label className="block text-sm font-semibold text-starlight mb-2 flex items-center">
                  <Maximize size={16} className="mr-1 text-plasma" />
                  <span>{t.filters.areaRange} (м.кв)</span>
                </label>
                <div className="flex space-x-4">
                  <input
                    type="number"
                    value={areaMin}
                    onChange={(e) => setAreaMin(e.target.value)}
                    placeholder={t.filters.min}
                    className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-starlight placeholder-nebula-text focus:outline-none focus:border-plasma text-sm"
                  />
                  <input
                    type="number"
                    value={areaMax}
                    onChange={(e) => setAreaMax(e.target.value)}
                    placeholder={t.filters.max}
                    className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-starlight placeholder-nebula-text focus:outline-none focus:border-plasma text-sm"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-1/3 bg-void/50 border border-white/10 text-nebula-text font-medium py-3 rounded-xl hover:text-plasma transition-all text-sm"
                >
                  {t.filters.reset}
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="w-2/3 bg-gradient-to-r from-plasma to-nova text-white-force font-medium py-3 rounded-xl hover:shadow-lg hover:shadow-plasma/30 transition-all text-sm"
                >
                  {t.filters.apply}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
export default FilterDrawer;
