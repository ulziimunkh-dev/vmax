import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, Ban, Edit2, Trash2, RefreshCw, Eye, EyeOff, LayoutDashboard, Share2, Sparkles, Calendar } from 'lucide-react';
import { useI18n } from '@/i18n';
import { listingsAPI } from '@/services/api';
import type { Listing } from '@/types';
import { SocialShareModal } from '@/components/listings/SocialShareModal';
import { PromoteListingModal } from '@/components/listings/PromoteListingModal';
import { formatRelativeTime, formatDateFull } from '@/utils/formatTime';
import { getImageUrl } from '@/utils/imageUrl';


const Dashboard = () => {
  const { t, lang } = useI18n();
  const [activeTab, setActiveTab] = useState<'active' | 'expired' | 'closed'>('active');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShareListing, setSelectedShareListing] = useState<Listing | null>(null);
  const [selectedPromoteListing, setSelectedPromoteListing] = useState<Listing | null>(null);


  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await listingsAPI.getMy();
      setListings(res.data || []);
    } catch (error) {
      console.error('Failed to fetch listings', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleAction = async (action: () => Promise<any>) => {
    try {
      await action();
      fetchListings();
    } catch (err) {
      console.error(err);
      alert(t.common.error);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t.dashboard.confirmDelete)) {
      handleAction(() => listingsAPI.remove(id));
    }
  };

  const filteredListings = listings.filter(l => l.status === activeTab);

  // Compute Total Views & Shares across all user ads
  const totalViews = listings.reduce((sum, item) => sum + (item.viewsCount || 0), 0);
  const totalShares = listings.reduce((sum, item) => sum + (item.sharesCount || 0), 0);

  const tabs = [
    { id: 'active', label: t.dashboard.active, icon: Activity },
    { id: 'expired', label: t.dashboard.expired, icon: Clock },
    { id: 'closed', label: t.dashboard.closed, icon: Ban },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-7xl mx-auto">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">

        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center space-x-4">
          <div className="p-3 bg-plasma/20 rounded-xl">
            <LayoutDashboard className="text-plasma" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-plasma to-aurora">
              {t.dashboard.title}
            </h1>
            <p className="text-nebula-text mt-1">{t.dashboard.activeListings}: {listings.filter(l => l.status === 'active').length}</p>
          </div>
        </motion.div>

        {/* Engagement Summary Analytics Widgets */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-5 rounded-2xl flex items-center justify-between border border-white/10">
            <div>
              <div className="text-xs text-nebula-text uppercase font-semibold tracking-wider">
                {t.dashboard.activeListings}
              </div>
              <div className="text-3xl font-bold text-starlight mt-1">
                {listings.filter(l => l.status === 'active').length}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-plasma/20 text-plasma">
              <Activity size={24} />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex items-center justify-between border border-white/10">
            <div>
              <div className="text-xs text-nebula-text uppercase font-semibold tracking-wider">
                {t.dashboard.totalViews}
              </div>
              <div className="text-3xl font-bold text-aurora mt-1">
                {totalViews.toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-aurora/20 text-aurora">
              <Eye size={24} />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex items-center justify-between border border-white/10">
            <div>
              <div className="text-xs text-nebula-text uppercase font-semibold tracking-wider">
                {t.dashboard.totalShares}
              </div>
              <div className="text-3xl font-bold text-nova mt-1">
                {totalShares.toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-nova/20 text-nova">
              <Share2 size={24} />
            </div>
          </div>
        </motion.div>

        {/* Status Tabs */}
        <motion.div variants={itemVariants} className="flex space-x-2 bg-nebula p-2 rounded-xl border border-white/10 w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all font-medium ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-plasma to-nova text-white-force shadow-lg'
                    : 'text-nebula-text hover:text-plasma hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Content Table */}
        <motion.div variants={itemVariants} className="glass-card border border-white/10 rounded-2xl p-6 backdrop-blur-md min-h-[400px]">
          {loading ? (
            <div className="flex justify-center items-center h-64 text-aurora">
              <RefreshCw className="animate-spin" size={32} />
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-nebula-text">
              <LayoutDashboard size={48} className="mb-4 opacity-20" />
              <p>{t.dashboard.noListings}</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredListings.map(listing => {
                const id = listing.id || (listing as any)._id;
                return (
                  <div key={id} className="flex flex-col md:flex-row items-center justify-between p-4 bg-void/50 border border-white/10 rounded-xl hover:border-plasma/30 transition-colors gap-4">

                    <div className="flex items-center space-x-4 w-full md:w-auto">
                      <div className="w-16 h-16 rounded-lg bg-cosmic flex-shrink-0 overflow-hidden relative">
                        {listing.images && listing.images.length > 0 ? (
                          <img src={getImageUrl(listing.images[0])} alt={listing.title} className="w-full h-full object-cover" />
                        ) : (

                          <div className="w-full h-full bg-gradient-to-br from-void to-cosmic flex items-center justify-center text-plasma text-xs font-bold">Vmax</div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-starlight font-bold line-clamp-1">{listing.title}</h3>
                        <p className="text-aurora font-bold mt-1">₮{Number(listing.price).toLocaleString()}</p>

                        {/* Inline Views, Share & Publication Date Badge */}
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-nebula-text">
                          <span className="flex items-center space-x-1">
                            <Clock size={12} className="text-plasma" />
                            <span>Нийтлэгдсэн: {formatRelativeTime(listing.createdAt, lang)}</span>
                          </span>
                          <span className="flex items-center space-x-1 text-nebula-text/70">
                            <Calendar size={11} className="text-aurora" />
                            <span>({formatDateFull(listing.createdAt)})</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Eye size={12} className="text-aurora" />
                            <span>{listing.viewsCount || 0}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Share2 size={12} className="text-plasma" />
                            <span>{listing.sharesCount || 0}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">

                      {/* Social Share Quick Button */}
                      <button
                        onClick={() => setSelectedShareListing(listing)}
                        className="flex items-center space-x-1 px-3 py-2 bg-plasma/20 hover:bg-plasma/30 text-plasma border border-plasma/30 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Share2 size={16} />
                        <span>{t.share.shareTitle}</span>
                      </button>

                      {activeTab === 'active' && (
                        <>
                          <button
                            onClick={() => setSelectedPromoteListing(listing)}
                            className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all text-sm font-bold shadow-md ${
                              listing.promotionTier === 'TOP_URGENT'
                                ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-red-500/20'
                                : listing.promotionTier === 'VIP' || listing.isPromoted
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-amber-500/20'
                                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-orange-500/20'
                            }`}
                            title="Зараа VIP / Онцлох болгож эхэнд байршуулах"
                          >
                            <Sparkles size={16} />
                            <span>
                              {listing.promotionTier === 'TOP_URGENT'
                                ? '🔥 Яаралтай зар'
                                : listing.promotionTier === 'VIP' || listing.isPromoted
                                ? '⭐ VIP Онцлох'
                                : 'Онцлох болгох'}
                            </span>
                          </button>

                          <button className="flex items-center space-x-1 px-3 py-2 bg-void/50 border border-white/10 hover:bg-plasma/20 text-starlight rounded-lg transition-colors text-sm">
                            <Edit2 size={16} />
                            <span>{t.dashboard.edit}</span>
                          </button>
                          <button
                            onClick={() => handleAction(() => listingsAPI.close(id))}
                            className="flex items-center space-x-1 px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-600 dark:text-amber-400 rounded-lg transition-colors text-sm font-medium"
                          >
                            <EyeOff size={16} />
                            <span>{t.dashboard.unpublish}</span>
                          </button>
                        </>
                      )}

                      {activeTab === 'expired' && (
                        <button
                          onClick={() => handleAction(() => listingsAPI.renew(id))}
                          className="flex items-center space-x-1 px-3 py-2 bg-plasma/20 hover:bg-plasma/30 text-plasma rounded-lg transition-colors text-sm font-medium"
                        >
                          <RefreshCw size={16} />
                          <span>{t.dashboard.renew}</span>
                        </button>
                      )}

                      {activeTab === 'closed' && (
                        <button
                          onClick={() => handleAction(() => listingsAPI.publish(id))}
                          className="flex items-center space-x-1 px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors text-sm font-medium"
                        >
                          <Eye size={16} />
                          <span>{t.dashboard.publish}</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(id)}
                        className="flex items-center space-x-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Trash2 size={16} />
                        <span>{t.dashboard.delete}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Share Modal */}
      {selectedShareListing && (
        <SocialShareModal
          isOpen={!!selectedShareListing}
          onClose={() => setSelectedShareListing(null)}
          listing={selectedShareListing}
          onShared={() => fetchListings()}
        />
      )}

      {/* Promote Modal */}
      {selectedPromoteListing && (
        <PromoteListingModal
          isOpen={!!selectedPromoteListing}
          onClose={() => setSelectedPromoteListing(null)}
          listing={selectedPromoteListing}
          onSuccess={() => fetchListings()}
        />
      )}
    </div>
  );
};


export default Dashboard;
