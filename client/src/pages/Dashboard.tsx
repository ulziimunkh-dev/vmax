import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, Ban, Edit2, Trash2, RefreshCw, Eye, EyeOff, LayoutDashboard, Share2, Sparkles, Calendar, MessageSquare, Phone, ShieldCheck, User as UserIcon, X, ExternalLink } from 'lucide-react';
import { useI18n } from '@/i18n';
import { listingsAPI, chatAPI } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import type { Listing } from '@/types';
import { SocialShareModal } from '@/components/listings/SocialShareModal';
import { PromoteListingModal } from '@/components/listings/PromoteListingModal';
import { ListingExcelActions } from '@/components/listings/ListingExcelActions';
import { DashboardMessages } from '@/components/chat/DashboardMessages';
import { formatRelativeTime, formatDateFull } from '@/utils/formatTime';
import { getImageUrl } from '@/utils/imageUrl';


const Dashboard = () => {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'active' | 'expired' | 'closed' | 'messages'>('active');
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShareListing, setSelectedShareListing] = useState<Listing | null>(null);
  const [selectedPromoteListing, setSelectedPromoteListing] = useState<Listing | null>(null);
  const [selectedAuditListing, setSelectedAuditListing] = useState<Listing | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isAuditLoading, setIsAuditLoading] = useState(false);
  const [isAllAudit, setIsAllAudit] = useState(false);

  const handleOpenListingAudit = async (listing: Listing) => {
    setSelectedAuditListing(listing);
    setIsAllAudit(false);
    setIsAuditModalOpen(true);
    setIsAuditLoading(true);
    try {
      const res = await listingsAPI.getContactAuditLogs(listing.id || (listing as any)._id);
      setAuditLogs(Array.isArray(res.data) ? res.data : (res.data?.logs || []));
    } catch (err) {
      console.error('Failed to fetch contact audit logs', err);
      setAuditLogs([]);
    } finally {
      setIsAuditLoading(false);
    }
  };

  const handleOpenAllAudit = async () => {
    setSelectedAuditListing(null);
    setIsAllAudit(true);
    setIsAuditModalOpen(true);
    setIsAuditLoading(true);
    try {
      const res = await listingsAPI.getMyContactAuditLogs();
      setAuditLogs(Array.isArray(res.data) ? res.data : (res.data?.logs || []));
    } catch (err) {
      console.error('Failed to fetch all contact audit logs', err);
      setAuditLogs([]);
    } finally {
      setIsAuditLoading(false);
    }
  };


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
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'messages') {
      setActiveTab('messages');
    }
  }, []);

  useEffect(() => {
    chatAPI.getUnreadCount()
      .then((res) => {
        setUnreadChatCount(res.data?.unreadCount || 0);
      })
      .catch(() => {});
  }, [activeTab]);

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

  const activeListings = listings.filter((l) => (l.status || '').toUpperCase() === 'ACTIVE');
  const expiredListings = listings.filter((l) => (l.status || '').toUpperCase() === 'EXPIRED');
  const closedListings = listings.filter((l) => (l.status || '').toUpperCase() === 'CLOSED');

  const filteredListings =
    activeTab === 'active'
      ? activeListings
      : activeTab === 'expired'
      ? expiredListings
      : closedListings;

  // Compute Total Views & Shares across all user ads
  const totalViews = listings.reduce((sum, item) => sum + (item.viewsCount || 0), 0);
  const totalShares = listings.reduce((sum, item) => sum + (item.sharesCount || 0), 0);
  const totalPhoneReveals = listings.reduce((sum, item) => sum + (item.phoneRevealsCount || 0), 0);

  const tabs = [
    {
      id: 'active',
      label: t.dashboard.active,
      shortLabel: t.dashboard.active,
      count: activeListings.length,
      icon: Activity,
    },
    {
      id: 'expired',
      label: t.dashboard.expired,
      shortLabel: 'Дууссан',
      count: expiredListings.length,
      icon: Clock,
    },
    {
      id: 'closed',
      label: t.dashboard.closed,
      shortLabel: t.dashboard.closed,
      count: closedListings.length,
      icon: Ban,
    },
    {
      id: 'messages',
      label: t.chat.messagesTab,
      shortLabel: 'Зурвас',
      count: unreadChatCount,
      icon: MessageSquare,
      showCountOnlyIfPositive: true,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-28 sm:pb-16 px-3 sm:px-6 max-w-7xl mx-auto overflow-x-hidden">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 sm:space-y-8">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2.5 sm:p-3 bg-plasma/20 rounded-xl text-plasma shrink-0">
              <LayoutDashboard size={28} className="sm:w-8 sm:h-8" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-plasma to-aurora truncate">
                {t.dashboard.title}
              </h1>
              <p className="text-xs sm:text-sm text-nebula-text mt-0.5">
                {t.dashboard.activeListings}: <span className="font-bold text-starlight">{activeListings.length}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:flex-initial">
              <ListingExcelActions onSuccess={fetchListings} className="w-full sm:w-auto justify-center" />
            </div>
            <button
              onClick={() => navigate('/create-listing')}
              className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-plasma to-nova text-white font-bold text-xs sm:text-sm shadow-lg shadow-plasma/25 hover:shadow-plasma/40 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <span>+ Шинэ зар нийтлэх</span>
            </button>
          </div>
        </motion.div>

        {/* Engagement Summary Analytics Widgets */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="glass-card p-3.5 sm:p-5 rounded-2xl flex items-center justify-between border border-white/10">
            <div className="min-w-0 pr-1">
              <div className="text-[10px] sm:text-xs text-nebula-text uppercase font-semibold tracking-wider truncate">
                {t.dashboard.activeListings}
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-starlight mt-0.5">
                {activeListings.length}
              </div>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-plasma/20 text-plasma shrink-0">
              <Activity size={20} className="sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="glass-card p-3.5 sm:p-5 rounded-2xl flex items-center justify-between border border-white/10">
            <div className="min-w-0 pr-1">
              <div className="text-[10px] sm:text-xs text-nebula-text uppercase font-semibold tracking-wider truncate">
                {t.dashboard.totalViews}
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-aurora mt-0.5">
                {totalViews.toLocaleString()}
              </div>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-aurora/20 text-aurora shrink-0">
              <Eye size={20} className="sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="glass-card p-3.5 sm:p-5 rounded-2xl flex items-center justify-between border border-white/10">
            <div className="min-w-0 pr-1">
              <div className="text-[10px] sm:text-xs text-nebula-text uppercase font-semibold tracking-wider truncate">
                {t.dashboard.totalShares}
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-nova mt-0.5">
                {totalShares.toLocaleString()}
              </div>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-nova/20 text-nova shrink-0">
              <Share2 size={20} className="sm:w-6 sm:h-6" />
            </div>
          </div>

          <div
            onClick={handleOpenAllAudit}
            className="glass-card p-3.5 sm:p-5 rounded-2xl flex items-center justify-between border border-white/10 hover:border-aurora/40 cursor-pointer transition-all hover:scale-[1.01] active:scale-95 group"
            title="Бүх зарын залгасан / утас үзсэн хэрэглэгчдийн дэлгэрэнгүй жагсаалт харах"
          >
            <div className="min-w-0 pr-1">
              <div className="text-[10px] sm:text-xs text-nebula-text uppercase font-semibold tracking-wider flex items-center gap-1 truncate">
                <span className="truncate">Утас үзсэн</span>
                <span className="text-[9px] bg-aurora/20 text-aurora px-1 py-0.2 rounded font-mono group-hover:bg-aurora group-hover:text-black transition-colors shrink-0">
                  Аудит
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-aurora mt-0.5">
                {totalPhoneReveals.toLocaleString()}
              </div>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-aurora/20 text-aurora group-hover:scale-110 transition-transform shrink-0">
              <Phone size={20} className="sm:w-6 sm:h-6" />
            </div>
          </div>
        </motion.div>

        {/* Status Tabs (2x2 grid on mobile for 100% visibility, flex on desktop) */}
        <motion.div variants={itemVariants} className="w-full">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 sm:gap-2 bg-nebula p-1.5 sm:p-2 rounded-2xl border border-white/10 sm:w-fit">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center justify-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-5 py-2.5 sm:py-3 rounded-xl transition-all font-semibold text-xs sm:text-sm whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-plasma to-nova text-white-force shadow-md shadow-plasma/30'
                      : 'text-nebula-text hover:text-plasma hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} className="shrink-0 sm:w-[18px] sm:h-[18px]" />
                  <span className="sm:hidden">
                    {tab.shortLabel} {tab.showCountOnlyIfPositive && tab.count === 0 ? '' : `(${tab.count})`}
                  </span>
                  <span className="hidden sm:inline">
                    {tab.label} {tab.showCountOnlyIfPositive && tab.count === 0 ? '' : `(${tab.count})`}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Content View */}
        {activeTab === 'messages' ? (
          <motion.div variants={itemVariants}>
            <DashboardMessages />
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="glass-card border border-white/10 rounded-2xl p-3.5 sm:p-6 backdrop-blur-md min-h-[400px]">
          {loading ? (
            <div className="flex justify-center items-center h-64 text-aurora">
              <RefreshCw className="animate-spin" size={32} />
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-nebula-text space-y-4">
              <LayoutDashboard size={48} className="opacity-20" />
              <p className="text-base font-medium">{t.dashboard.noListings}</p>
              {activeTab === 'active' && (
                <button
                  onClick={() => navigate('/create-listing')}
                  className="px-5 py-2.5 rounded-xl bg-plasma/20 hover:bg-plasma/30 text-plasma border border-plasma/30 font-semibold text-sm transition-colors cursor-pointer"
                >
                  Шинэ зар нийтлэх
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {filteredListings.map((listing) => {
                const id = listing.id || (listing as any)._id;
                return (
                  <div
                    key={id}
                    className="p-3.5 sm:p-4 bg-void/50 border border-white/10 rounded-2xl hover:border-plasma/30 transition-all space-y-3"
                  >
                    <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
                      <div
                        onClick={() => navigate(`/listings/${id}`)}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-cosmic flex-shrink-0 overflow-hidden relative cursor-pointer group border border-white/10"
                      >
                        {listing.images && listing.images.length > 0 ? (
                          <img
                            src={getImageUrl(listing.images[0])}
                            alt={listing.title}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800&auto=format&fit=crop';
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-void to-cosmic flex items-center justify-center text-plasma text-xs font-bold">
                            Vmax
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3
                          onClick={() => navigate(`/listings/${id}`)}
                          className="text-starlight font-bold text-sm sm:text-base line-clamp-1 hover:text-plasma transition-colors cursor-pointer"
                        >
                          {listing.title}
                        </h3>
                        <p className="text-aurora font-bold text-base sm:text-lg mt-0.5">
                          ₮{Number(listing.price).toLocaleString()}
                        </p>

                        {/* Inline Views, Share & Publication Date Badge */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-[11px] sm:text-xs text-nebula-text">
                          <span className="flex items-center space-x-1 shrink-0">
                            <Clock size={11} className="text-plasma shrink-0" />
                            <span>{formatRelativeTime(listing.createdAt, lang)}</span>
                          </span>
                          <span className="flex items-center space-x-1 text-nebula-text/70 shrink-0 hidden sm:flex">
                            <Calendar size={11} className="text-aurora shrink-0" />
                            <span>({formatDateFull(listing.createdAt)})</span>
                          </span>
                          <span className="flex items-center space-x-1 shrink-0">
                            <Eye size={11} className="text-aurora shrink-0" />
                            <span>{listing.viewsCount || 0} үзсэн</span>
                          </span>
                          <span className="flex items-center space-x-1 shrink-0">
                            <Share2 size={11} className="text-plasma shrink-0" />
                            <span>{listing.sharesCount || 0} хуваалцсан</span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenListingAudit(listing);
                            }}
                            className="flex items-center space-x-1 text-aurora hover:underline cursor-pointer shrink-0"
                            title="Энэ зарын дугаар үзсэн хэрэглэгчдийг харах"
                          >
                            <Phone size={11} className="shrink-0" />
                            <span className="font-semibold">{listing.phoneRevealsCount || 0} залгасан</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-2.5 border-t border-white/5 justify-start sm:justify-end">
                      {/* View Listing Button */}
                      <button
                        onClick={() => navigate(`/listings/${id}`)}
                        className="flex items-center space-x-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-void/60 border border-white/10 hover:bg-white/10 text-starlight rounded-xl transition-colors text-xs sm:text-sm font-medium cursor-pointer"
                        title="Зарыг үзэх"
                      >
                        <Eye size={14} className="text-aurora" />
                        <span>Үзэх</span>
                      </button>

                      {/* Social Share Quick Button */}
                      <button
                        onClick={() => setSelectedShareListing(listing)}
                        className="flex items-center space-x-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-plasma/20 hover:bg-plasma/30 text-plasma border border-plasma/30 rounded-xl transition-colors text-xs sm:text-sm font-medium cursor-pointer"
                      >
                        <Share2 size={14} />
                        <span>{t.share.shareTitle}</span>
                      </button>

                      {/* Audit Logs Button */}
                      <button
                        onClick={() => handleOpenListingAudit(listing)}
                        className="flex items-center space-x-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-void/60 border border-white/10 hover:bg-aurora/20 text-starlight hover:text-aurora rounded-xl transition-colors text-xs sm:text-sm font-medium cursor-pointer"
                        title="Утасны дугаар үзсэн / залгасан аудитын түүх"
                      >
                        <ShieldCheck size={14} className="text-aurora" />
                        <span>Аудит ({listing.phoneRevealsCount || 0})</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => navigate(`/listings/${id}/edit`)}
                        className="flex items-center space-x-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-void/60 border border-white/10 hover:bg-plasma/20 text-starlight rounded-xl transition-colors text-xs sm:text-sm font-medium cursor-pointer"
                        title="Засах"
                      >
                        <Edit2 size={14} className="text-plasma" />
                        <span>{t.dashboard.edit}</span>
                      </button>

                      {activeTab === 'active' && (
                        <>
                          <button
                            onClick={() => setSelectedPromoteListing(listing)}
                            className={`flex items-center space-x-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl transition-all text-xs sm:text-sm font-bold shadow-md cursor-pointer ${
                              listing.promotionTier === 'TOP_URGENT'
                                ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-red-500/20'
                                : listing.promotionTier === 'VIP' || listing.isPromoted
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-amber-500/20'
                                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-orange-500/20'
                            }`}
                            title="Зараа VIP / Онцлох болгож эхэнд байршуулах"
                          >
                            <Sparkles size={14} />
                            <span>
                              {listing.promotionTier === 'TOP_URGENT'
                                ? '🔥 Яаралтай'
                                : listing.promotionTier === 'VIP' || listing.isPromoted
                                ? '⭐ VIP'
                                : 'Онцлох болгох'}
                            </span>
                          </button>

                          <button
                            onClick={() => handleAction(() => listingsAPI.close(id))}
                            className="flex items-center space-x-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-500 border border-amber-500/30 rounded-xl transition-colors text-xs sm:text-sm font-medium cursor-pointer"
                            title="Түр хаах"
                          >
                            <EyeOff size={14} />
                            <span>{t.dashboard.unpublish}</span>
                          </button>
                        </>
                      )}

                      {activeTab === 'expired' && (
                        <button
                          onClick={() => handleAction(() => listingsAPI.renew(id))}
                          className="flex items-center space-x-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-plasma/20 hover:bg-plasma/30 text-plasma rounded-xl transition-colors text-xs sm:text-sm font-medium cursor-pointer"
                        >
                          <RefreshCw size={14} />
                          <span>{t.dashboard.renew}</span>
                        </button>
                      )}

                      {activeTab === 'closed' && (
                        <button
                          onClick={() => handleAction(() => listingsAPI.publish(id))}
                          className="flex items-center space-x-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-xl transition-colors text-xs sm:text-sm font-medium cursor-pointer"
                        >
                          <Eye size={14} />
                          <span>{t.dashboard.publish}</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(id)}
                        className="flex items-center space-x-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 rounded-xl transition-colors text-xs sm:text-sm font-medium cursor-pointer"
                        title="Устгах"
                      >
                        <Trash2 size={14} />
                        <span>{t.dashboard.delete}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
        )}
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
    
      {/* Contact Reveal / Phone Audit Logs Modal */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 bg-void/80 backdrop-blur-md z-50 flex items-center justify-center p-2.5 sm:p-4">
          <div className="glass-card w-full max-w-2xl p-4 sm:p-7 rounded-2xl sm:rounded-3xl border border-aurora/30 shadow-2xl relative bg-slate-900/95 dark:bg-void/95 text-white animate-in fade-in zoom-in-95 duration-200 max-h-[88vh] flex flex-col">
            <button
              onClick={() => {
                setIsAuditModalOpen(false);
                setSelectedAuditListing(null);
              }}
              className="absolute top-3.5 right-3.5 text-nebula-text hover:text-white p-2 bg-void/50 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center space-x-3 mb-4 sm:mb-6 pr-6">
              <div className="p-2.5 sm:p-3 bg-aurora/20 text-aurora rounded-xl sm:rounded-2xl border border-aurora/40 shrink-0">
                <ShieldCheck size={22} className="sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-starlight font-heading truncate">
                  {isAllAudit
                    ? 'Бүх зарын утас үзсэн / залгасан аудит'
                    : `"${selectedAuditListing?.title || 'Зарын'}" утас үзсэн бүртгэл`}
                </h3>
                <p className="text-nebula-text text-[11px] sm:text-xs mt-0.5 line-clamp-1 sm:line-clamp-none">
                  Утасны дугаар дээр дарж залгасан эсвэл дугаар ил болгосон хэрэглэгчдийн нарийвчилсан мэдээлэл
                </p>
              </div>
            </div>

            {isAuditLoading ? (
              <div className="py-12 text-center text-nebula-text">
                <RefreshCw size={28} className="animate-spin mx-auto mb-3 text-aurora" />
                <span className="text-sm">Аудит мэдээлэл ачаалж байна...</span>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="py-12 text-center text-nebula-text italic text-sm bg-void/40 rounded-2xl border border-white/5">
                Одоогоор утасны дугаар үзсэн эсвэл залгасан бүртгэл байхгүй байна.
              </div>
            ) : (
              <div className="space-y-2.5 sm:space-y-3 max-h-[60vh] sm:max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
                {auditLogs.map((log: any, idx: number) => {
                  const viewer = log.viewerUser;
                  return (
                    <div
                      key={log.id || idx}
                      className="bg-void/60 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 hover:border-aurora/30 transition-all flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2.5 sm:gap-3.5"
                    >
                      <div className="flex items-start space-x-2.5 sm:space-x-3 min-w-0 flex-1">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-plasma to-aurora flex items-center justify-center font-bold text-white text-sm sm:text-base flex-shrink-0 overflow-hidden shadow-inner">
                          {viewer?.avatarUrl ? (
                            <img src={viewer.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span>{(viewer?.name || 'U')[0].toUpperCase()}</span>
                          )}
                        </div>
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
                            <span className="font-bold text-starlight text-xs sm:text-sm truncate">
                              {viewer?.name || 'Зочин хэрэглэгч'}
                            </span>
                            {viewer ? (
                              <span className="px-2 py-0.2 rounded-full text-[9px] sm:text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                ✓ Нэвтэрсэн
                              </span>
                            ) : (
                              <span className="px-2 py-0.2 rounded-full text-[9px] sm:text-[10px] font-semibold bg-white/10 text-nebula-text">
                                Зочин
                              </span>
                            )}
                          </div>

                          {isAllAudit && (log.listingTitle || log.listing?.title) && (
                            <div className="text-[11px] sm:text-xs text-plasma font-medium truncate">
                              Зар: {log.listingTitle || log.listing?.title}
                            </div>
                          )}

                          <div className="text-nebula-text text-[11px] sm:text-xs flex flex-wrap items-center gap-2 sm:gap-3">
                            {viewer?.phone && (
                              <span className="text-aurora font-mono font-semibold flex items-center gap-1">
                                <Phone size={11} />
                                {viewer.phone}
                              </span>
                            )}
                            {viewer?.email && (
                              <span className="text-nebula-text/80 truncate max-w-[150px] sm:max-w-none">
                                {viewer.email}
                              </span>
                            )}
                            <span className="text-[10px] text-nebula-text/60">
                              IP: <code className="text-plasma/90">{log.viewerIp || 'Хамгаалагдсан'}</code>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1.5 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                        <div className="text-right text-nebula-text text-[10px] sm:text-[11px]">
                          {formatDateFull(log.createdAt)}
                        </div>
                        {viewer?.phone && (
                          <a
                            href={'tel:' + viewer.phone}
                            className="inline-flex items-center space-x-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 bg-aurora hover:bg-aurora/90 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-aurora/20 hover:scale-105 active:scale-95 cursor-pointer"
                          >
                            <Phone size={12} />
                            <span>Эргэж залгах</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
</div>
  );
};


export default Dashboard;
