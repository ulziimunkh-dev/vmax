import React, { useState } from 'react';
import { Search, Mic, MapPin, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';
import { useI18n } from '@/i18n';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const { t } = useI18n();

  const { isListening, startListening } = useVoiceSearch((text) => {
    setQuery(text);
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-4 md:p-6 rounded-2xl border-glow">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

        <div className="md:col-span-2 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-nebula-text" />
          </div>
          <input
            type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            className="block w-full pl-10 pr-12 py-3 bg-void/50 border border-white/10 rounded-xl text-white placeholder-nebula-text focus:outline-none focus:border-plasma focus:ring-1 focus:ring-plasma transition-all"
            placeholder={t.hero.search + '...'}
          />
          <button onClick={startListening} className={`absolute inset-y-0 right-0 pr-3 flex items-center ${isListening ? 'text-plasma animate-pulse' : 'text-nebula-text hover:text-plasma transition-colors'}`}>
            <Mic className="h-5 w-5" />
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Home className="h-5 w-5 text-nebula-text" />
          </div>
          <select className="block w-full pl-10 pr-3 py-3 bg-void/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-plasma appearance-none">
            <option value="">{t.filters.all} ({t.filters.category})</option>
            <option value="apartment">{t.filters.apartment}</option>
            <option value="house">{t.filters.house}</option>
            <option value="land">{t.filters.land}</option>
            <option value="commercial">{t.filters.commercial}</option>
          </select>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-nebula-text" />
          </div>
          <select className="block w-full pl-10 pr-3 py-3 bg-void/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-plasma appearance-none">
            <option value="">{t.filters.location}</option>
            <option value="ulaanbaatar">Улаанбаатар</option>
            <option value="darkhan">Дархан</option>
            <option value="erdenet">Эрдэнэт</option>
          </select>
        </div>

        <button className="w-full bg-gradient-to-r from-plasma to-nova text-white font-medium py-3 rounded-xl hover:shadow-lg hover:shadow-plasma/30 transition-all duration-300">
          {t.hero.search}
        </button>
      </div>
    </motion.div>
  );
};
export default SearchBar;
