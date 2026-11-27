import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  X,
  User,
  Home,
  PlusCircle,
  Sparkles,
  LayoutDashboard,
  Scale,
  Info,
  FileText,
  LogOut,
  Globe,
  Sun,
  Moon,
  ChevronRight,
  ShieldCheck,
  Building2,
  Layers,
  MessageSquare,
  Calculator,
  PartyPopper,
  Heart,
  Wrench,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useI18n } from '@/i18n';
import { useThemeStore } from '@/store/useThemeStore';
import { useCompareStore } from '@/store/useCompareStore';
import { getImageUrl } from '@/utils/imageUrl';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DrawerNavItem {
  label: string;
  desc?: string;
  to: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  highlight?: boolean;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { t, lang, setLang } = useI18n();
  const { mode, toggleTheme } = useThemeStore();
  const { compareListings } = useCompareStore();
  const [activeTab, setActiveTab] = useState<'services' | 'tools'>('services');

  // Prevent background scroll while drawer is open; automatically restore on close
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  const toggleLang = () => {
    setLang(lang === 'mn' ? 'en' : 'mn');
  };

  // 1-р салбар: Үндсэн зах зээл & Үйлчилгээ (Core Market & Services)
  const servicesItems: DrawerNavItem[] = [
    {
      label: t.nav.listings,
      desc: lang === 'en' ? 'All apartments, houses, land & rentals' : 'Бүх орон сууц, хаус, газар, түрээс',
      to: '/',
      icon: <Home size={19} className="text-plasma" />,
    },
    {
      label: lang === 'en' ? 'New Projects (3D Tour)' : 'Шинэ төслүүд (3D)',
      desc: lang === 'en' ? 'Explore upcoming projects in 3D' : 'Бүрэн хэмжээст 3D виртуал танилцуулга',
      to: '/projects',
      icon: <Building2 size={19} className="text-plasma" />,
      badge: '3D',
      badgeColor: 'bg-plasma/20 text-plasma border-plasma/30',
    },
    {
      label: lang === 'en' ? 'Furniture & Interior' : 'Тавилга & Засал чимэглэл',
      desc: lang === 'en' ? 'Local furniture makers and interior reels' : 'Монгол урлан бүтээгчдийн видео танилцуулга',
      to: '/furniture',
      icon: <Layers size={19} className="text-aurora" />,
      badge: lang === 'en' ? 'New' : 'Шинэ',
      badgeColor: 'bg-aurora/20 text-aurora border-aurora/30',
    },
    {
      label: lang === 'en' ? 'Events, Restaurants & Halls' : 'Эвент, Ресторан & Заал',
      desc: lang === 'en' ? 'Banquet halls and event spaces booking' : 'Хүлээн авалт, баяр ёслолын заал захиалга',
      to: '/events',
      icon: <PartyPopper size={19} className="text-amber-400" />,
      badge: 'Hot',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      label: t.nav.createListing,
      desc: lang === 'en' ? 'Post free or VIP real estate listing' : 'Үнэгүй болон онцлох зар нийтлэх',
      to: '/create-listing',
      icon: <PlusCircle size={19} className="text-white" />,
      highlight: true,
    },
  ];

  // 2-р салбар: Хэрэгслүүд, Систем & Дэмжлэг (Tools, System & Support)
  const toolsItems: DrawerNavItem[] = [
    {
      label: lang === 'en' ? 'Mortgage Calculator' : 'Зээлийн тооцоолуур (6%)',
      desc: lang === 'en' ? 'Calculate monthly mortgage payments' : 'Ипотекийн 6% зээлийн эргэн төлөлт бодох',
      to: '/calculator',
      icon: <Calculator size={19} className="text-emerald-400" />,
      badge: '6%',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      label: t.nav.compare,
      desc: lang === 'en' ? 'Compare selected properties' : 'Сонгосон заруудын үзүүлэлт харьцуулах',
      to: '/compare',
      icon: <Scale size={19} className="text-cyan-400" />,
      badge: compareListings.length > 0 ? `${compareListings.length}` : undefined,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    {
      label: lang === 'en' ? 'Support / Donate' : 'Биднийг дэмжих (Хандив)',
      desc: lang === 'en' ? 'Support Vmax platform development' : 'Хөгжүүлэлтийн багт урам өгч дэмжих',
      to: '/donate',
      icon: <Heart size={19} className="text-rose-400 fill-rose-400/30" />,
      badge: 'Love',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    {
      label: lang === 'en' ? 'Pricing Plans' : 'VIP Үнийн багцууд',
      desc: lang === 'en' ? 'VIP & Verified agent packages' : 'Онцлох болон баталгаажсан зарын багцууд',
      to: '/pricing',
      icon: <Sparkles size={19} className="text-amber-400" />,
      badge: 'VIP',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    ...(isAuthenticated
      ? [
          {
            label: t.nav.dashboard,
            desc: lang === 'en' ? 'Manage your listings and stats' : 'Өөрийн зар, төсөл, үзүүлэлтүүдээ хянах',
            to: '/dashboard',
            icon: <LayoutDashboard size={19} className="text-nova" />,
          },
          {
            label: t.chat.messagesTab,
            desc: lang === 'en' ? 'Real-time property inquiries' : 'Сонирхогчид болон зарын эздийн чат',
            to: '/dashboard?tab=messages',
            icon: <MessageSquare size={19} className="text-plasma" />,
          },
          {
            label: t.nav.profile,
            desc: lang === 'en' ? 'Account settings & security' : 'Хувийн мэдээлэл, аюулгүй байдал',
            to: '/profile',
            icon: <User size={19} className="text-plasma" />,
          },
        ]
      : []),
    {
      label: lang === 'en' ? 'About Us' : 'Бидний тухай',
      desc: lang === 'en' ? 'About Vmax platform' : 'Vmax платформын танилцуулга',
      to: '/about',
      icon: <Info size={19} className="text-nebula-text" />,
    },
    {
      label: lang === 'en' ? 'Terms & Privacy' : 'Үйлчилгээний нөхцөл',
      desc: lang === 'en' ? 'Usage terms and privacy policy' : 'Нууцлалын бодлого & нөхцөл',
      to: '/terms',
      icon: <FileText size={19} className="text-nebula-text" />,
    },
  ];

  const currentItems = activeTab === 'services' ? servicesItems : toolsItems;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Slide-in Mobile Drawer (from Left) */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-[86%] max-w-sm h-full bg-void border-r border-white/10 flex flex-col shadow-2xl overflow-hidden z-10"
          >
            {/* Header: Logo & Close */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02] flex-shrink-0">
              <Link to="/" onClick={onClose} className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-plasma via-nova to-aurora p-0.5 shadow-md shadow-plasma/30">
                  <div className="w-full h-full bg-void rounded-[10px] flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-plasma" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-heading font-black tracking-tight text-starlight text-glow leading-none">
                    Vmax<span className="text-plasma">.mn</span>
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-nebula-text font-semibold mt-0.5">
                    Real Estate
                  </span>
                </div>
              </Link>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 text-nebula-text hover:text-white hover:bg-white/10 transition-colors active:scale-95 cursor-pointer"
                aria-label="Хаах"
              >
                <X size={20} />
              </button>
            </div>

            {/* User Profile Card Section */}
            <div className="p-3.5 border-b border-white/10 bg-white/[0.015] flex-shrink-0">
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-3 p-3 rounded-2xl bg-cosmic/70 border border-white/10 shadow-sm">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-plasma via-nova to-aurora p-0.5 flex-shrink-0 overflow-hidden">
                    {user.avatar || user.avatarUrl ? (
                      <img
                        src={getImageUrl(user.avatar || user.avatarUrl)}
                        alt={user.name || 'Profile'}
                        className="w-full h-full object-cover rounded-[10px]"
                      />
                    ) : (
                      <div className="w-full h-full bg-void rounded-[10px] flex items-center justify-center font-bold text-starlight text-sm">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-starlight truncate">{user.name || 'Хэрэглэгч'}</h4>
                    <p className="text-xs text-nebula-text truncate">{user.email || user.phone || ''}</p>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <ShieldCheck size={12} className="text-plasma flex-shrink-0" />
                      <span className="text-[10px] font-semibold text-plasma truncate">
                        {user.subscriptionTier === 'AGENCY'
                          ? 'Агентлаг'
                          : user.subscriptionTier === 'PRO_AGENT'
                          ? 'Мэргэжлийн Агент'
                          : user.isVerifiedAgent
                          ? 'Баталгаажсан Агент'
                          : 'Хэрэглэгч'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-gradient-to-br from-plasma/15 via-nova/10 to-aurora/10 border border-plasma/30 space-y-2">
                  <div>
                    <h4 className="text-xs font-bold text-starlight uppercase tracking-wider">Тавтай морилно уу</h4>
                    <p className="text-[11px] text-nebula-text mt-0.5">Зар нийтлэх, хадгалахын тулд нэвтэрнэ үү</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      onClick={onClose}
                      className="py-1.5 text-center bg-gradient-to-r from-plasma to-nova text-white text-xs font-bold rounded-xl shadow-md shadow-plasma/25 active:scale-95 transition-all"
                    >
                      {t.nav.login}
                    </Link>
                    <Link
                      to="/register"
                      onClick={onClose}
                      className="py-1.5 text-center bg-white/5 hover:bg-white/10 text-starlight text-xs font-bold rounded-xl border border-white/10 active:scale-95 transition-all"
                    >
                      {t.nav.register}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 2-Segmented Selector Tabs (Үндсэн үйлчилгээ vs Хэрэгслүүд) */}
            <div className="p-2.5 border-b border-white/10 bg-void/60 flex-shrink-0">
              <div className="grid grid-cols-2 p-1 bg-void/90 rounded-2xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('services')}
                  className={`flex items-center justify-center space-x-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'services'
                      ? 'bg-gradient-to-r from-plasma to-nova text-white shadow-md shadow-plasma/30'
                      : 'text-nebula-text hover:text-white'
                  }`}
                >
                  <Building2 size={14} className={activeTab === 'services' ? 'text-white' : 'text-plasma'} />
                  <span>{lang === 'en' ? 'Market' : 'Үйлчилгээ'}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
                    activeTab === 'services' ? 'bg-white/20 text-white' : 'bg-void border border-white/10 text-nebula-text'
                  }`}>
                    {servicesItems.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('tools')}
                  className={`flex items-center justify-center space-x-1.5 py-2 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
                    activeTab === 'tools'
                      ? 'bg-gradient-to-r from-plasma to-nova text-white shadow-md shadow-plasma/30'
                      : 'text-nebula-text hover:text-white'
                  }`}
                >
                  <Wrench size={14} className={activeTab === 'tools' ? 'text-white' : 'text-aurora'} />
                  <span>{lang === 'en' ? 'Tools' : 'Хэрэгслүүд'}</span>
                  {compareListings.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 absolute top-1.5 right-2 animate-pulse" />
                  )}
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
                    activeTab === 'tools' ? 'bg-white/20 text-white' : 'bg-void border border-white/10 text-nebula-text'
                  }`}>
                    {toolsItems.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Navigation List for Active Segment (No nested AnimatePresence deadlock) */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 overscroll-contain">
              <div key={activeTab} className="space-y-1.5">
                {currentItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={`flex items-center justify-between p-2.5 rounded-2xl text-sm font-medium transition-colors group ${
                      item.highlight
                        ? 'bg-gradient-to-r from-plasma via-nova to-plasma text-white shadow-md shadow-plasma/25 border border-white/20 font-bold'
                        : 'bg-white/[0.03] hover:bg-white/[0.08] active:bg-white/[0.1] border border-white/5 text-starlight'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0 pr-2">
                      <div className={`p-2 rounded-xl flex-shrink-0 ${
                        item.highlight
                          ? 'bg-white/20 text-white'
                          : 'bg-void/80 border border-white/10'
                      }`}>
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <div className={`font-semibold text-xs sm:text-sm truncate ${
                          item.highlight ? 'text-white' : 'text-starlight group-hover:text-plasma transition-colors'
                        }`}>
                          {item.label}
                        </div>
                        {item.desc && (
                          <div className={`text-[11px] truncate mt-0.5 ${
                            item.highlight ? 'text-white/80' : 'text-nebula-text/70'
                          }`}>
                            {item.desc}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {item.badge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight
                        size={15}
                        className={`transition-transform group-hover:translate-x-0.5 ${
                          item.highlight ? 'text-white' : 'text-nebula-text/50'
                        }`}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Settings & Footer */}
            <div className="p-3 border-t border-white/10 space-y-2 bg-white/[0.02] flex-shrink-0">
              <div className="grid grid-cols-2 gap-2">
                {/* Theme Toggle Button */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-void/60 border border-white/10 text-xs font-semibold text-starlight hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                >
                  {mode === 'dark' ? (
                    <>
                      <Sun size={14} className="text-amber-400" />
                      <span>Гэгээлэг</span>
                    </>
                  ) : (
                    <>
                      <Moon size={14} className="text-plasma" />
                      <span>Харанхуй</span>
                    </>
                  )}
                </button>

                {/* Language Switch Button */}
                <button
                  type="button"
                  onClick={toggleLang}
                  className="flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-void/60 border border-white/10 text-xs font-semibold text-starlight hover:bg-white/5 active:scale-95 transition-all uppercase cursor-pointer"
                >
                  <Globe size={14} className="text-plasma" />
                  <span>{lang === 'mn' ? 'Монгол' : 'English'}</span>
                </button>
              </div>

              {/* Logout Button */}
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold active:scale-95 transition-all cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>{t.nav.logout}</span>
                </button>
              )}

              {/* Footer text */}
              <div className="text-center text-[10px] text-nebula-text/60">
                Vmax.mn • Бүх эрх хуулиар хамгаалагдсан
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
