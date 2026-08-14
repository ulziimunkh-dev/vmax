import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Maximize } from 'lucide-react';
import { useI18n } from '@/i18n';
import { PriceInput } from '@/components/common/PriceInput';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApply?: (filters: { priceMin: string; priceMax: string; areaMin: string; areaMax: string }) => void;
}

const FilterDrawer: React.FC<Props> = ({ isOpen, onClose, onApply }) => {
  const { t } = useI18n();
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [areaMin, setAreaMin] = useState('');
  const [areaMax, setAreaMax] = useState('');

  const handleApply = () => {
    if (onApply) {
      onApply({ priceMin, priceMax, areaMin, areaMax });
    }
    onClose();
  };

  const handleReset = () => {
    setPriceMin('');
    setPriceMax('');
    setAreaMin('');
    setAreaMax('');
    if (onApply) {
      onApply({ priceMin: '', priceMax: '', areaMin: '', areaMax: '' });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-void/80 backdrop-blur-sm z-40" />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 h-[80vh] bg-cosmic border-t border-white/10 rounded-t-3xl z-50 p-6 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-heading font-bold text-starlight">{t.filters.apply}</h3>
              <button onClick={onClose} className="text-nebula-text hover:text-plasma p-2 bg-void/50 rounded-full"><X size={20} /></button>
            </div>

            <div className="space-y-6">
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
                    className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-starlight placeholder-nebula-text focus:outline-none focus:border-plasma"
                  />
                  <input
                    type="number"
                    value={areaMax}
                    onChange={(e) => setAreaMax(e.target.value)}
                    placeholder={t.filters.max}
                    className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-starlight placeholder-nebula-text focus:outline-none focus:border-plasma"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-1/3 bg-void/50 border border-white/10 text-nebula-text font-medium py-3 rounded-xl hover:text-plasma transition-all"
                >
                  {t.filters.reset}
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="w-2/3 bg-gradient-to-r from-plasma to-nova text-white-force font-medium py-3 rounded-xl hover:shadow-lg hover:shadow-plasma/30 transition-all"
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
