import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const FilterDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
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
              <h3 className="text-2xl font-heading font-bold text-white">Дэлгэрэнгүй хайлт</h3>
              <button onClick={onClose} className="text-nebula-text hover:text-white p-2 bg-void/50 rounded-full"><X size={20} /></button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-nebula-text mb-2">Үнийн дүн (₮)</label>
                <div className="flex space-x-4">
                  <input type="number" placeholder="Доод" className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-plasma" />
                  <input type="number" placeholder="Дээд" className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-plasma" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-nebula-text mb-2">Талбайн хэмжээ (м.кв)</label>
                <div className="flex space-x-4">
                  <input type="number" placeholder="Доод" className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-plasma" />
                  <input type="number" placeholder="Дээд" className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-plasma" />
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-plasma to-nova text-white font-medium py-3 rounded-xl hover:shadow-lg hover:shadow-plasma/30 transition-all mt-4">
                Шүүж харах
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
export default FilterDrawer;
