import React from 'react';
import { motion } from 'framer-motion';
import { Scale, ArrowLeft, Trash2, Check, X, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCompareStore } from '@/store/useCompareStore';
import { useI18n } from '@/i18n';
import { getImageUrl } from '@/utils/imageUrl';

const CompareListings: React.FC = () => {
  const { t } = useI18n();
  const { compareListings, removeFromCompare, clearCompare } = useCompareStore();

  if (compareListings.length === 0) {
    return (
      <div className="min-h-[70vh] pt-28 pb-16 flex flex-col items-center justify-center text-center px-4">
        <div className="p-6 bg-plasma/10 rounded-full border border-plasma/30 mb-6 text-plasma">
          <Scale size={48} className="animate-bounce" />
        </div>
        <h2 className="text-3xl font-bold font-heading text-starlight mb-3">
          {t.compare.noProperties}
        </h2>
        <p className="text-nebula-text max-w-md mb-8">
          {t.compare.selectHint}
        </p>
        <Link
          to="/"
          className="px-6 py-3 bg-gradient-to-r from-plasma to-aurora text-white font-bold rounded-xl shadow-lg hover:shadow-plasma/40 transition-all flex items-center space-x-2"
        >
          <ArrowLeft size={18} />
          <span>{t.compare.browseListings}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-plasma font-semibold text-sm mb-2">
            <Scale size={18} />
            <span>{t.compare.barTitle}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-black text-starlight">
            {t.compare.pageTitle}
          </h1>
          <p className="text-xs text-nebula-text mt-1">{t.compare.pageSubtitle}</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={clearCompare}
            className="px-4 py-2.5 bg-void/60 border border-white/10 hover:border-red-500/50 text-nebula-text hover:text-red-400 rounded-xl text-sm font-semibold transition-all flex items-center space-x-2"
          >
            <Trash2 size={16} />
            <span>{t.compare.clearAll}</span>
          </button>

          <Link
            to="/"
            className="px-4 py-2.5 bg-plasma/20 border border-plasma/40 text-plasma hover:bg-plasma hover:text-white rounded-xl text-sm font-semibold transition-all flex items-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>{t.compare.browseListings}</span>
          </Link>
        </div>
      </div>

      {/* Comparison Grid Table */}
      <div className="overflow-x-auto pb-6 scrollbar-thin">
        <div className="min-w-[700px] grid grid-cols-5 gap-4">

          {/* Spec Categories Header Column */}
          <div className="space-y-6 text-sm text-nebula-text font-bold pt-6">
            <div className="h-64 flex items-end pb-4 font-heading text-starlight text-lg font-bold border-b border-white/10">
              {t.assetAttributes.title}
            </div>
            <div className="h-10 flex items-center">{t.compare.price}:</div>
            <div className="h-10 flex items-center">{t.priceInput.sqmPrice}:</div>
            <div className="h-10 flex items-center">{t.filters.type}:</div>
            <div className="h-10 flex items-center">{t.filters.category}:</div>
            <div className="h-10 flex items-center">{t.compare.location}:</div>
            <div className="h-10 flex items-center">{t.compare.area}:</div>
            <div className="h-10 flex items-center">{t.compare.rooms}:</div>
            <div className="h-10 flex items-center">{t.listings.bathrooms}:</div>
            <div className="h-10 flex items-center">{t.compare.floor}:</div>
            <div className="h-10 flex items-center">{t.compare.year}:</div>
            <div className="h-10 flex items-center">{t.compare.construction}:</div>
            <div className="h-10 flex items-center">{t.assetAttributes.garage}:</div>
            <div className="h-10 flex items-center">Action:</div>
          </div>

          {/* Selected Listing Columns */}
          {compareListings.map((item, idx) => {
            const id = item.id || (item as any)._id;
            const price = Number(item.price);
            const area = Number(item.areaSqm);
            const pricePerSqm = area > 0 ? Math.round(price / area) : 0;
            const attrs = item.attributes || {};

            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="space-y-6 glass-card p-4 rounded-2xl relative border border-white/10 hover:border-plasma/40 transition-all"
              >
                {/* Image & Remove */}
                <div className="h-64 flex flex-col justify-between border-b border-white/10 pb-4">
                  <div className="relative h-36 w-full rounded-xl overflow-hidden mb-3">
                    <img
                      src={getImageUrl(item.images?.[0])}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeFromCompare(id)}
                      className="absolute top-2 right-2 p-1.5 bg-void/80 hover:bg-red-500 text-starlight rounded-full transition-all"
                      title={t.compare.remove}
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <h3 className="text-starlight font-bold text-sm line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                </div>

                {/* Specs Data */}
                <div className="h-10 flex items-center font-bold text-plasma text-base">
                  ₮{price.toLocaleString()}
                </div>

                <div className="h-10 flex items-center text-starlight text-sm font-semibold">
                  {pricePerSqm > 0 ? `₮${pricePerSqm.toLocaleString()} / ${t.listings.sqm}` : '-'}
                </div>

                <div className="h-10 flex items-center">
                  <span className="px-3 py-1 bg-plasma/20 text-plasma rounded-full text-xs font-semibold">
                    {item.type === 'sale' ? t.listings.sale : item.type === 'daily_rent' ? t.listings.dailyRent : t.listings.rent}
                  </span>
                </div>

                <div className="h-10 flex items-center text-starlight text-sm">
                  {item.category?.toUpperCase() || '-'}
                </div>

                <div className="h-10 flex items-center text-starlight text-sm truncate">
                  {item.district || item.location}
                </div>

                <div className="h-10 flex items-center font-bold text-aurora text-sm">
                  {item.areaSqm} {t.listings.sqm}
                </div>

                <div className="h-10 flex items-center text-starlight text-sm">
                  {attrs.bedrooms || attrs.rooms ? `${attrs.bedrooms || attrs.rooms} ${t.listings.bedrooms}` : '-'}
                </div>

                <div className="h-10 flex items-center text-starlight text-sm">
                  {attrs.bathrooms ? `${attrs.bathrooms} ${t.listings.bathrooms}` : '-'}
                </div>

                <div className="h-10 flex items-center text-starlight text-sm">
                  {attrs.floor ? `${attrs.floor} / ${attrs.totalFloors || '-'}` : '-'}
                </div>

                <div className="h-10 flex items-center text-starlight text-sm">
                  {attrs.yearBuilt ? `${attrs.yearBuilt}` : '-'}
                </div>

                <div className="h-10 flex items-center text-starlight text-sm truncate">
                  {attrs.constructionType || '-'}
                </div>

                <div className="h-10 flex items-center text-starlight text-sm truncate">
                  {attrs.garage || '-'}
                </div>

                <div className="h-10 flex items-center">
                  <Link
                    to={`/listings/${id}`}
                    className="w-full py-2 bg-plasma/20 hover:bg-plasma border border-plasma/40 text-plasma hover:text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1"
                  >
                    <span>{t.contactCard.viewDetails}</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CompareListings;
