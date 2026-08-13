import React from 'react';
import { History, Trash2, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n';
import { useRecentVisits } from '@/hooks/useRecentVisits';
import { Link } from 'react-router-dom';
import { getImageUrl } from '@/utils/imageUrl';

export const RecentVisits: React.FC = () => {

  const { t } = useI18n();
  const { recentVisits, clearVisits } = useRecentVisits();

  if (!recentVisits || recentVisits.length === 0) return null;

  return (
    <div className="py-8 border-t border-white/10 mt-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-accent-plasma/20 rounded-lg">
            <History className="text-accent-plasma" size={20} />
          </div>
          <h3 className="text-xl font-bold text-white">{t.share.recentVisits}</h3>
        </div>
        <button
          onClick={clearVisits}
          className="flex items-center space-x-1 text-xs text-text-nebula hover:text-red-400 transition-colors"
        >
          <Trash2 size={14} />
          <span>Цэвэрлэх</span>
        </button>
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10">
        {recentVisits.map((item, idx) => {
          const id = item.id || (item as any)._id;
          return (
            <motion.div
              key={id || idx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex-shrink-0 w-64 glass-card rounded-xl overflow-hidden hover:border-accent-plasma/40 transition-all group"
            >
              <Link to={`/listings/${id}`}>
                <div className="h-32 w-full relative overflow-hidden bg-bg-cosmic">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={getImageUrl(item.images[0])}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (

                    <div className="w-full h-full flex items-center justify-center text-plasma/40 font-bold text-sm">
                      Vmax.mn
                    </div>
                  )}
                  <span className="absolute top-2 right-2 bg-void/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-semibold text-white">
                    {item.type === 'sale' ? t.listings.sale : t.listings.rent}
                  </span>
                </div>
                <div className="p-3">
                  <h4 className="text-sm font-semibold text-white truncate group-hover:text-accent-plasma transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-sm font-bold text-accent-aurora mt-1">
                    {Number(item.price).toLocaleString()} ₮
                  </p>
                  <div className="flex items-center text-[11px] text-text-nebula mt-2">
                    <MapPin size={12} className="mr-1 text-accent-plasma flex-shrink-0" />
                    <span className="truncate">{item.location || item.district}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
