import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, Ban, Edit2, Trash2, RefreshCw, Eye, EyeOff, LayoutDashboard, Share2, Sparkles, Calendar, MessageSquare, Phone, ShieldCheck, User as UserIcon, X, ExternalLink, Building2, Armchair, Plus, MapPin, CheckCircle2, Star, Layers, AlertCircle, Camera, Video, Upload } from 'lucide-react';
import { useI18n } from '@/i18n';
import { listingsAPI, chatAPI, projectsAPI, uploadAPI } from '@/services/api';
import { furnitureApi } from '@/services/furnitureApi';
import { useNavigate } from 'react-router-dom';
import type { Listing } from '@/types';
import type { FurnitureMaker, FurniturePortfolioItem } from '@/types/furniture';
import { SocialShareModal } from '@/components/listings/SocialShareModal';
import { PromoteListingModal } from '@/components/listings/PromoteListingModal';
import { ListingExcelActions } from '@/components/listings/ListingExcelActions';
import { DashboardMessages } from '@/components/chat/DashboardMessages';
import { formatRelativeTime, formatDateFull } from '@/utils/formatTime';
import { getImageUrl } from '@/utils/imageUrl';


const Dashboard = () => {
  const { t, lang } = useI18n();
  const navigate = useNavigate();

  // Top-Level Section Selector: 'listings' | 'projects' | 'furniture'
  const [dashboardSection, setDashboardSection] = useState<'listings' | 'projects' | 'furniture'>('listings');

  // Listings state
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

  // Projects state
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // Furniture Maker Workshop state
  const [myMaker, setMyMaker] = useState<FurnitureMaker | null>(null);
  const [furnitureLoading, setFurnitureLoading] = useState(false);

  // Quick Portfolio Add Modal State
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [portTitle, setPortTitle] = useState('');
  const [portCategory, setPortCategory] = useState('KITCHEN');
  const [portMaterials, setPortMaterials] = useState('');
  const [portDurationDays, setPortDurationDays] = useState(14);
  const [portImages, setPortImages] = useState<string[]>([]);
  const [portVideoUrl, setPortVideoUrl] = useState('');
  const [portUploadingImg, setPortUploadingImg] = useState(false);
  const [portUploadingVideo, setPortUploadingVideo] = useState(false);
  const [savingPortfolio, setSavingPortfolio] = useState(false);

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

  const fetchMyProjects = async () => {
    setProjectsLoading(true);
    try {
      const res = await projectsAPI.getMy();
      setMyProjects(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Failed to fetch my projects', error);
      setMyProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  };

  const fetchMyMaker = async () => {
    setFurnitureLoading(true);
    try {
      const res = await furnitureApi.getMy();
      setMyMaker(res.data || null);
    } catch (error) {
      console.error('Failed to fetch my furniture profile', error);
      setMyMaker(null);
    } finally {
      setFurnitureLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
    fetchMyProjects();
    fetchMyMaker();
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'messages') {
      setActiveTab('messages');
    }
    const sec = params.get('section');
    if (sec === 'projects' || sec === 'furniture' || sec === 'listings') {
      setDashboardSection(sec);
    }
  }, []);

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Та энэ төслийг устгахдаа итгэлтэй байна уу?')) {
      try {
        await projectsAPI.remove(id);
        fetchMyProjects();
      } catch (err) {
        console.error(err);
        alert('Төсөл устгахад алдаа гарлаа.');
      }
    }
  };

  const handleDeleteMaker = async (id: string) => {
    if (window.confirm('Та урлангийнхаа албан ёсны профайлыг устгахдаа итгэлтэй байна уу?')) {
      try {
        await furnitureApi.delete(id);
        setMyMaker(null);
      } catch (err) {
        console.error(err);
        alert('Урлан устгахад алдаа гарлаа.');
      }
    }
  };

  const handleDeletePortfolioItem = async (portfolioId: string) => {
    if (!myMaker) return;
    if (window.confirm('Энэ ажлыг портфолиогоос хасахдаа итгэлтэй байна уу?')) {
      try {
        const res = await furnitureApi.deletePortfolioItem(myMaker.id, portfolioId);
        setMyMaker(res.data);
      } catch (err) {
        console.error(err);
        alert('Портфолио хасахад алдаа гарлаа.');
      }
    }
  };

  const handleAddPortfolioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myMaker) return;
    if (!portTitle.trim()) {
      alert('Ажлын гарчгийг оруулна уу.');
      return;
    }
    setSavingPortfolio(true);
    try {
      const res = await furnitureApi.addPortfolioItem(myMaker.id, {
        title: portTitle.trim(),
        category: portCategory,
        materials: portMaterials.trim(),
        durationDays: Number(portDurationDays) || 14,
        images: portImages,
        videoUrl: portVideoUrl.trim() || undefined,
      });
      setMyMaker(res.data);
      setIsPortfolioModalOpen(false);
      // Reset form
      setPortTitle('');
      setPortMaterials('');
      setPortImages([]);
      setPortVideoUrl('');
    } catch (err) {
      console.error(err);
      alert('Портфолио ажил нэмэхэд алдаа гарлаа.');
    } finally {
      setSavingPortfolio(false);
    }
  };

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
        {/* Top-Level Section Selector (Multi-Entity Tabs: Listings vs Projects vs Workshop) */}
        <motion.div variants={itemVariants} className="flex flex-wrap sm:inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-void/80 border border-slate-200 dark:border-white/10 w-full sm:w-auto overflow-hidden no-scrollbar">
          <button
            type="button"
            onClick={() => setDashboardSection('listings')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              dashboardSection === 'listings'
                ? 'bg-white dark:bg-gradient-to-r dark:from-plasma dark:to-nova text-slate-900 dark:text-white shadow-md'
                : 'text-slate-600 dark:text-nebula-text hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>🏠 Үл хөдлөхийн зар</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-slate-200 dark:bg-white/20">
              {listings.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setDashboardSection('projects')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              dashboardSection === 'projects'
                ? 'bg-white dark:bg-gradient-to-r dark:from-plasma dark:to-nova text-slate-900 dark:text-white shadow-md'
                : 'text-slate-600 dark:text-nebula-text hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 size={16} />
            <span>Барилгын төсөл</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-slate-200 dark:bg-white/20">
              {myProjects.length}/1
            </span>
          </button>

          <button
            type="button"
            onClick={() => setDashboardSection('furniture')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              dashboardSection === 'furniture'
                ? 'bg-white dark:bg-gradient-to-r dark:from-plasma dark:to-nova text-slate-900 dark:text-white shadow-md'
                : 'text-slate-600 dark:text-nebula-text hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Armchair size={16} />
            <span>Урлан & Тавилга</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-slate-200 dark:bg-white/20">
              {myMaker ? '1/1' : '0/1'}
            </span>
          </button>
        </motion.div>

        {/* Section Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2.5 sm:p-3 bg-plasma/20 rounded-xl text-plasma shrink-0">
              {dashboardSection === 'projects' ? (
                <Building2 size={28} className="sm:w-8 sm:h-8" />
              ) : dashboardSection === 'furniture' ? (
                <Armchair size={28} className="sm:w-8 sm:h-8" />
              ) : (
                <LayoutDashboard size={28} className="sm:w-8 sm:h-8" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-plasma to-aurora truncate">
                {dashboardSection === 'projects'
                  ? 'Барилгын төсөл, хотхоны удирдлага'
                  : dashboardSection === 'furniture'
                  ? 'Тавилгын урлан & Интерьер студи'
                  : t.dashboard.title}
              </h1>
              <p className="text-xs sm:text-sm text-nebula-text mt-0.5">
                {dashboardSection === 'projects'
                  ? `Бүртгэлтэй төсөл: ${myProjects.length}/1 (Хэрэглэгчийн лимит: 1 төсөл)`
                  : dashboardSection === 'furniture'
                  ? myMaker
                    ? `${myMaker.name} • Урлангийн лимит: 1/1`
                    : 'Урлан бүртгэгдээгүй байна (Хэрэглэгчийн лимит: 1 урлан)'
                  : `${t.dashboard.activeListings}: ${activeListings.length}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {dashboardSection === 'listings' && (
              <>
                <div className="flex-1 sm:flex-initial">
                  <ListingExcelActions onSuccess={fetchListings} className="w-full sm:w-auto justify-center" />
                </div>
                <button
                  onClick={() => navigate('/create-listing')}
                  className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-plasma to-nova text-white font-bold text-xs sm:text-sm shadow-lg shadow-plasma/25 hover:shadow-plasma/40 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  <span>+ Шинэ зар нийтлэх</span>
                </button>
              </>
            )}

            {dashboardSection === 'projects' && (
              myProjects.length >= 1 ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-amber-500 font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    Лимит хүрсэн (1/1)
                  </span>
                  <button
                    onClick={() => navigate(`/create-project?edit=${myProjects[0].id}`)}
                    className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer border border-white/15"
                  >
                    <Edit2 size={15} />
                    <span>Төсөл засах</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/create-project')}
                  className="flex items-center justify-center space-x-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-plasma to-nova text-white font-bold text-xs sm:text-sm shadow-lg shadow-plasma/25 hover:shadow-plasma/40 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Plus size={16} />
                  <span>+ Шинэ төсөл бүртгэх</span>
                </button>
              )
            )}

            {dashboardSection === 'furniture' && (
              myMaker ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-400 font-bold px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    Урлан идэвхтэй (1/1)
                  </span>
                  <button
                    onClick={() => navigate(`/create-furniture-profile?edit=${myMaker.id}`)}
                    className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-plasma to-nova text-white font-bold text-xs sm:text-sm shadow-lg shadow-plasma/25 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                  >
                    <Edit2 size={15} />
                    <span>Урлангийн мэдээлэл засах</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/create-furniture-profile')}
                  className="flex items-center justify-center space-x-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-plasma to-nova text-white font-bold text-xs sm:text-sm shadow-lg shadow-plasma/25 hover:shadow-plasma/40 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Plus size={16} />
                  <span>+ Урлангийн профайл үүсгэх</span>
                </button>
              )
            )}
          </div>
        </motion.div>

        {dashboardSection === 'listings' && (
          <>
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
          </>
        )}

        {/* 🏢 Projects Section */}
        {dashboardSection === 'projects' && (
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Limit Banner */}
            <div className="glass-card p-4 sm:p-5 rounded-2xl border border-plasma/30 bg-plasma/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2.5 rounded-xl bg-plasma/20 text-plasma shrink-0">
                  <Building2 size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-starlight text-sm sm:text-base">
                    Барилгын төслийн менежмент
                  </h3>
                  <p className="text-xs text-nebula-text mt-0.5">
                    Чанар, спам хамгаалалтын зорилгоор 1 хэрэглэгч 1 төсөл бүртгэх лимиттэй. Нийтэлсэн төслөө хэдийд ч засах боломжтой.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  myProjects.length >= 1
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                }`}>
                  Бүртгэл: {myProjects.length} / 1
                </span>
              </div>
            </div>

            {projectsLoading ? (
              <div className="glass-card p-12 text-center text-nebula-text rounded-2xl">
                <RefreshCw size={28} className="animate-spin mx-auto mb-3 text-plasma" />
                <p className="text-sm">Төслийн мэдээлэл ачаалж байна...</p>
              </div>
            ) : myProjects.length === 0 ? (
              <div className="glass-card p-10 sm:p-14 text-center rounded-2xl border border-white/10 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-plasma/10 border border-plasma/20 text-plasma flex items-center justify-center mx-auto">
                  <Building2 size={32} />
                </div>
                <div className="max-w-md mx-auto space-y-1.5">
                  <h3 className="text-lg font-bold text-starlight">Танд бүртгэлтэй төсөл байхгүй байна</h3>
                  <p className="text-xs sm:text-sm text-nebula-text">
                    Хотхоны албан ёсны үнэ, 3D виртуал аялал, өрөөний төлөвлөлтүүдээ нийтлэн зорилтот худалдан авагчдад хүргээрэй.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/create-project')}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-plasma to-nova text-white font-bold text-xs sm:text-sm shadow-lg shadow-plasma/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Шинэ төсөл бүртгэх</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myProjects.map((p) => {
                  const cover = p.coverImage || (p.images && p.images[0]) || '/placeholder.png';
                  return (
                    <div
                      key={p.id}
                      className="glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-plasma/40 transition-all flex flex-col group shadow-lg"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-void/80">
                        <img
                          src={getImageUrl(cover)}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          {p.hasVirtualTour3D && (
                            <span className="px-2.5 py-1 rounded-full bg-plasma/90 text-white text-[10px] font-extrabold backdrop-blur-md shadow-md">
                              3D Аялалтай
                            </span>
                          )}
                          <span className="px-2.5 py-1 rounded-full bg-void/80 text-white text-[10px] font-bold backdrop-blur-md">
                            {p.developer || 'Барилга угсралт'}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h4 className="text-base font-bold text-starlight group-hover:text-plasma transition-colors line-clamp-1">
                            {p.name}
                          </h4>
                          <div className="flex items-center text-xs text-nebula-text gap-1">
                            <MapPin size={13} className="text-plasma shrink-0" />
                            <span className="truncate">{p.location || 'Улаанбаатар'}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                            <span className="text-nebula-text">М.кв үнэ:</span>
                            <span className="font-bold text-plasma">
                              {p.pricePerSqmMin ? `${Number(p.pricePerSqmMin).toLocaleString()} ₮-өөс` : 'Үнэ тохирно'}
                            </span>
                          </div>
                          {p.floorPlans && p.floorPlans.length > 0 && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-nebula-text">Төлөвлөлт:</span>
                              <span className="font-medium text-starlight">{p.floorPlans.length} төрөл</span>
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                          <button
                            onClick={() => navigate(`/projects/${p.id}`)}
                            className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-starlight text-xs font-semibold transition-all border border-white/10 cursor-pointer"
                          >
                            <ExternalLink size={13} />
                            <span>Үзэх</span>
                          </button>
                          <button
                            onClick={() => navigate(`/create-project?edit=${p.id}`)}
                            className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-xl bg-plasma/20 hover:bg-plasma/30 text-plasma text-xs font-bold transition-all border border-plasma/30 cursor-pointer"
                          >
                            <Edit2 size={13} />
                            <span>Засах</span>
                          </button>
                          <button
                            onClick={() => handleDeleteProject(p.id)}
                            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all cursor-pointer"
                            title="Устгах"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* 🛋️ Furniture Studio Section */}
        {dashboardSection === 'furniture' && (
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Limit Banner */}
            <div className="glass-card p-4 sm:p-5 rounded-2xl border border-nova/30 bg-nova/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2.5 rounded-xl bg-nova/20 text-nova shrink-0">
                  <Armchair size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-starlight text-sm sm:text-base">
                    Тавилгын урлан & Портфолио
                  </h3>
                  <p className="text-xs text-nebula-text mt-0.5">
                    1 хэрэглэгч 1 урлангийн профайл бүртгэх лимиттэй. Урлангийнхаа хийсэн ажлуудыг (портфолио) хязгааргүй нэмэх боломжтой.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  myMaker
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                }`}>
                  Урлан: {myMaker ? '1 / 1 (Бүртгэлтэй)' : '0 / 1 (Бүртгээгүй)'}
                </span>
              </div>
            </div>

            {furnitureLoading ? (
              <div className="glass-card p-12 text-center text-nebula-text rounded-2xl">
                <RefreshCw size={28} className="animate-spin mx-auto mb-3 text-nova" />
                <p className="text-sm">Урлангийн мэдээлэл ачаалж байна...</p>
              </div>
            ) : !myMaker ? (
              <div className="glass-card p-10 sm:p-14 text-center rounded-2xl border border-white/10 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-nova/10 border border-nova/20 text-nova flex items-center justify-center mx-auto">
                  <Armchair size={32} />
                </div>
                <div className="max-w-md mx-auto space-y-1.5">
                  <h3 className="text-lg font-bold text-starlight">Тавилгын урлан бүртгэгдээгүй байна</h3>
                  <p className="text-xs sm:text-sm text-nebula-text">
                    Гал тогоо, үүдний өрөө, захиалгат тавилгын урлангийн профайлаа нээж хийсэн ажлуудынхаа зургуудыг оруулан захиалга аваарай.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/create-furniture-profile')}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-plasma to-nova text-white font-bold text-xs sm:text-sm shadow-lg shadow-plasma/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Урлангийн профайл үүсгэх</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Maker Overview Card */}
                <div className="glass-card rounded-2xl p-5 sm:p-6 border border-white/10 space-y-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-void/80 border border-white/15 shrink-0 shadow-md">
                        <img
                          src={getImageUrl(myMaker.logoUrl || myMaker.coverUrl || '/placeholder.png')}
                          alt={myMaker.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg sm:text-xl font-bold text-starlight font-heading">
                            {myMaker.name}
                          </h3>
                          {myMaker.isVerified && (
                            <CheckCircle2 size={16} className="text-emerald-400" />
                          )}
                        </div>
                        <p className="text-xs text-nebula-text mt-0.5 line-clamp-1">
                          {myMaker.description || 'Захиалгат тавилгын урлан'}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-nebula-text mt-2">
                          <span className="flex items-center gap-1 text-aurora">
                            <Phone size={12} />
                            {myMaker.phone}
                          </span>
                          {myMaker.warrantyMonths && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px]">
                              {myMaker.warrantyMonths} сарын баталгаа
                            </span>
                          )}
                          {myMaker.experienceYears && (
                            <span className="px-2 py-0.5 rounded-full bg-white/5 text-starlight border border-white/10 text-[11px]">
                              {myMaker.experienceYears} жил ажилласан
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
                      <button
                        onClick={() => navigate(`/furniture/${myMaker.id}`)}
                        className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-starlight text-xs font-semibold border border-white/10 transition-all cursor-pointer"
                      >
                        <ExternalLink size={13} />
                        <span>Профайл үзэх</span>
                      </button>
                      <button
                        onClick={() => navigate(`/create-furniture-profile?edit=${myMaker.id}`)}
                        className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-plasma/20 hover:bg-plasma/30 text-plasma text-xs font-bold border border-plasma/30 transition-all cursor-pointer"
                      >
                        <Edit2 size={13} />
                        <span>Мэдээлэл засах</span>
                      </button>
                      <button
                        onClick={() => handleDeleteMaker(myMaker.id)}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all cursor-pointer"
                        title="Урланг устгах"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Portfolio Section Header */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <div>
                    <h4 className="text-base font-bold text-starlight flex items-center gap-2">
                      <Layers size={18} className="text-nova" />
                      <span>Урласан ажлуудын портфолио ({myMaker.portfolio?.length || 0})</span>
                    </h4>
                    <p className="text-xs text-nebula-text mt-0.5">
                      Хэрэглэгчдэд урласан бүтээгдэхүүнийхээ чанар, загварыг бодитоор харуулах зураг, видео
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPortfolioModalOpen(true)}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-nova to-plasma text-white text-xs font-bold shadow-md shadow-nova/20 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                  >
                    <Plus size={15} />
                    <span>+ Шинэ ажил нэмэх</span>
                  </button>
                </div>

                {/* Portfolio Items Grid */}
                {!myMaker.portfolio || myMaker.portfolio.length === 0 ? (
                  <div className="glass-card p-10 text-center rounded-2xl border border-white/10 space-y-3">
                    <p className="text-xs sm:text-sm text-nebula-text">
                      Одоогоор портфолио ажил оруулаагүй байна. Хийсэн ажлуудынхаа зургийг нэмж итгэлцлээ нэмэгдүүлээрэй.
                    </p>
                    <button
                      onClick={() => setIsPortfolioModalOpen(true)}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-starlight text-xs font-bold border border-white/15 transition-all cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Ажил нэмэх</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {myMaker.portfolio.map((item) => {
                      const img = (item.images && item.images[0]) || '/placeholder.png';
                      return (
                        <div
                          key={item.id}
                          className="glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-nova/40 transition-all flex flex-col group shadow-md"
                        >
                          <div className="relative aspect-[4/3] bg-void/80 overflow-hidden">
                            <img
                              src={getImageUrl(img)}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {item.videoUrl && (
                              <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full bg-void/80 text-white text-[10px] font-bold backdrop-blur-md flex items-center gap-1">
                                <Video size={10} className="text-aurora" /> Видеотой
                              </span>
                            )}
                          </div>
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <div className="space-y-1">
                              <h5 className="font-bold text-starlight text-sm line-clamp-1">{item.title}</h5>
                              {item.materials && (
                                <p className="text-xs text-nebula-text line-clamp-1">
                                  Материал: {item.materials}
                                </p>
                              )}
                              {item.durationDays && (
                                <p className="text-[11px] text-nebula-text/80">
                                  Хийгдсэн хугацаа: {item.durationDays} хоног
                                </p>
                              )}
                            </div>
                            <div className="pt-2 border-t border-white/5 flex items-center justify-end">
                              <button
                                onClick={() => handleDeletePortfolioItem(item.id)}
                                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-all cursor-pointer"
                              >
                                <Trash2 size={12} />
                                <span>Устгах</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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

      {/* Quick Add Portfolio Modal */}
      {isPortfolioModalOpen && myMaker && (
        <div className="fixed inset-0 bg-void/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="glass-card w-full max-w-lg p-5 sm:p-6 rounded-2xl border border-nova/30 shadow-2xl relative bg-slate-900/95 dark:bg-void/95 text-white animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsPortfolioModalOpen(false)}
              className="absolute top-4 right-4 text-nebula-text hover:text-white p-2 bg-void/50 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center space-x-3 mb-5 pr-8">
              <div className="p-2.5 bg-nova/20 text-nova rounded-xl border border-nova/40 shrink-0">
                <Plus size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-starlight font-heading">Шинэ ажил (Портфолио) нэмэх</h3>
                <p className="text-xs text-nebula-text mt-0.5">
                  {myMaker.name} урлангийн хийсэн ажлыг нийтлэх
                </p>
              </div>
            </div>

            <form onSubmit={handleAddPortfolioSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-starlight mb-1">Ажлын нэр *</label>
                <input
                  type="text"
                  required
                  value={portTitle}
                  onChange={(e) => setPortTitle(e.target.value)}
                  placeholder="Жишээ: Зайсан дахь орчин үеийн гал тогооны иж бүрэн тавилга"
                  className="w-full bg-void/50 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-starlight focus:outline-none focus:border-nova"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-starlight mb-1">Төрөл</label>
                  <select
                    value={portCategory}
                    onChange={(e) => setPortCategory(e.target.value)}
                    className="w-full bg-void/50 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-starlight focus:outline-none focus:border-nova"
                  >
                    <option value="KITCHEN">Гал тогоо</option>
                    <option value="WARDROBE">Үүд / Шүүгээ</option>
                    <option value="LIVING_ROOM">Зочны өрөө</option>
                    <option value="BEDROOM">Унтлагын өрөө</option>
                    <option value="OFFICE">Оффис тавилга</option>
                    <option value="FULL_INTERIOR">Бүрэн интерьер</option>
                    <option value="CUSTOM">Бусад захиалга</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-starlight mb-1">Хугацаа (хоног)</label>
                  <input
                    type="number"
                    min="1"
                    value={portDurationDays}
                    onChange={(e) => setPortDurationDays(Number(e.target.value))}
                    className="w-full bg-void/50 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-starlight focus:outline-none focus:border-nova"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-starlight mb-1">Ашигласан материал</label>
                <input
                  type="text"
                  value={portMaterials}
                  onChange={(e) => setPortMaterials(e.target.value)}
                  placeholder="Жишээ: Солонгос лактай хавтан, Blum нугас, кварц тавцан"
                  className="w-full bg-void/50 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-starlight focus:outline-none focus:border-nova"
                />
              </div>

              <div>
                <label className="block font-bold text-starlight mb-1">Зураг оруулах *</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {portImages.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/15">
                      <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPortImages(portImages.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 p-0.5 bg-red-500 rounded-full text-white cursor-pointer"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  <label className="w-16 h-16 rounded-xl border-2 border-dashed border-white/20 hover:border-nova/50 flex flex-col items-center justify-center cursor-pointer transition-colors">
                    <Camera size={18} className="text-nebula-text" />
                    <span className="text-[9px] text-nebula-text mt-0.5">{portUploadingImg ? '...' : '+ Нэмэх'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      disabled={portUploadingImg}
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (!files || files.length === 0) return;
                        setPortUploadingImg(true);
                        try {
                          const uploaded: string[] = [];
                          for (let i = 0; i < files.length; i++) {
                            const res = await uploadAPI.uploadFile(files[i]);
                            uploaded.push(res.data.url);
                          }
                          setPortImages((prev) => [...prev, ...uploaded]);
                        } catch (err) {
                          alert('Зураг хуулахад алдаа гарлаа');
                        } finally {
                          setPortUploadingImg(false);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-starlight mb-1">Видео (сонголттой)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={portVideoUrl}
                    onChange={(e) => setPortVideoUrl(e.target.value)}
                    placeholder="Видеоны холбоос эсвэл шууд хуулах"
                    className="flex-1 bg-void/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-starlight focus:outline-none focus:border-nova"
                  />
                  <label className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-starlight font-bold flex items-center gap-1 cursor-pointer">
                    <Upload size={14} />
                    <span>{portUploadingVideo ? '...' : 'Хуулах'}</span>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      disabled={portUploadingVideo}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setPortUploadingVideo(true);
                        try {
                          const res = await uploadAPI.uploadFile(file);
                          setPortVideoUrl(res.data.url);
                        } catch (err) {
                          alert('Видео хуулахад алдаа гарлаа');
                        } finally {
                          setPortUploadingVideo(false);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPortfolioModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-starlight text-xs font-semibold cursor-pointer"
                >
                  Болих
                </button>
                <button
                  type="submit"
                  disabled={savingPortfolio || portImages.length === 0}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-nova to-plasma text-white text-xs font-bold shadow-md shadow-nova/25 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {savingPortfolio ? 'Хадгалж байна...' : 'Нийтлэх'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


export default Dashboard;
