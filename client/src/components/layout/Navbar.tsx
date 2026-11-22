import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  User as UserIcon,
  Globe,
  Sun,
  Moon,
  Sparkles,
  Plus,
  Scale,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Building2,
  ShieldCheck,
  Layers,
  MessageSquare,
  Calculator,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useI18n } from '@/i18n';
import { useThemeStore } from '@/store/useThemeStore';
import { useCompareStore } from '@/store/useCompareStore';
import { chatAPI } from '@/services/api';
import { MobileDrawer } from './MobileDrawer';
import { getImageUrl } from '@/utils/imageUrl';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { t, lang, setLang } = useI18n();
  const { mode, toggleTheme } = useThemeStore();
  const { compareListings } = useCompareStore();
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadChatCount(0);
      return;
    }
    const fetchUnreads = () => {
      chatAPI.getUnreadCount()
        .then((res) => setUnreadChatCount(res.data?.unreadCount || 0))
        .catch(() => {});
    };
    fetchUnreads();
    const interval = setInterval(fetchUnreads, 12000);
    return () => clearInterval(interval);
  }, [isAuthenticated, location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close user menu on route change
  useEffect(() => {
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  const toggleLang = () => {
    setLang(lang === 'mn' ? 'en' : 'mn');
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      <header
        className={`fixed top-0 w-full z-40 transition-all duration-300 ${scrolled
          ? 'bg-void/90 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20'
          : 'bg-void/40 backdrop-blur-md border-b border-white/5'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Left: Brand Logo & Main Nav */}
            <div className="flex items-center space-x-3 xl:space-x-6">
              <Link to="/" className="flex items-center space-x-2 group flex-shrink-0">
                <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-xl bg-gradient-to-tr from-plasma via-nova to-aurora p-0.5 shadow-lg shadow-plasma/30 group-hover:scale-105 transition-transform flex-shrink-0">
                  <div className="w-full h-full bg-void rounded-[10px] flex items-center justify-center">
                    <Building2 className="w-4 h-4 xl:w-5 xl:h-5 text-plasma group-hover:text-white transition-colors" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg xl:text-xl font-heading font-black tracking-tight text-starlight text-glow leading-none whitespace-nowrap">
                    Vmax<span className="text-plasma">.mn</span>
                  </span>
                  <span className="text-[8px] xl:text-[9px] uppercase tracking-widest text-nebula-text/70 font-semibold mt-0.5 hidden sm:block">
                    Real Estate
                  </span>
                </div>
              </Link>

              {/* Desktop Main Navigation Links */}
              <nav className="hidden lg:flex items-center space-x-0.5 xl:space-x-1">
                <Link
                  to="/"
                  className={`px-2.5 py-1.5 xl:px-3.5 xl:py-2 rounded-xl text-xs xl:text-sm font-medium transition-all whitespace-nowrap ${location.pathname === '/'
                    ? 'text-white bg-white/10 font-bold'
                    : 'text-nebula-text hover:text-white hover:bg-white/5'
                    }`}
                >
                  {t.nav.listings}
                </Link>

                <Link
                  to="/projects"
                  className={`px-2.5 py-1.5 xl:px-3.5 xl:py-2 rounded-xl text-xs xl:text-sm font-medium transition-all flex items-center space-x-1 whitespace-nowrap ${location.pathname.startsWith('/projects')
                    ? 'text-white bg-white/10 font-bold'
                    : 'text-nebula-text hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Building2 size={14} className="text-plasma flex-shrink-0" />
                  <span>{t.nav.projects}</span>
                  <span className="px-1.5 py-0.2 text-[8px] xl:text-[9px] font-black rounded-md bg-plasma/20 text-plasma border border-plasma/30 uppercase">
                    3D
                  </span>
                </Link>

                <Link
                  to="/furniture"
                  className={`px-2.5 py-1.5 xl:px-3.5 xl:py-2 rounded-xl text-xs xl:text-sm font-medium transition-all flex items-center space-x-1 whitespace-nowrap ${location.pathname.startsWith('/furniture')
                    ? 'text-white bg-white/10 font-bold'
                    : 'text-nebula-text hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Layers size={14} className="text-aurora flex-shrink-0" />
                  <span>{t.nav.furniture}</span>
                  <span className="px-1.5 py-0.2 text-[8px] xl:text-[9px] font-black rounded-md bg-aurora/20 text-aurora border border-aurora/30 uppercase">
                    New
                  </span>
                </Link>

                <Link
                  to="/calculator"
                  className={`px-2.5 py-1.5 xl:px-3.5 xl:py-2 rounded-xl text-xs xl:text-sm font-medium transition-all flex items-center space-x-1 whitespace-nowrap ${location.pathname === '/calculator'
                    ? 'text-white bg-white/10 font-bold'
                    : 'text-nebula-text hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Calculator size={14} className="text-emerald-400 flex-shrink-0" />
                  <span className="hidden xl:inline">Зээлийн тооцоолуур</span>
                  <span className="xl:hidden">Тооцоолуур</span>
                  <span className="px-1.5 py-0.2 text-[8px] xl:text-[9px] font-black rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                    6%
                  </span>
                </Link>

                <Link
                  to="/compare"
                  className={`px-2.5 py-1.5 xl:px-3.5 xl:py-2 rounded-xl text-xs xl:text-sm font-medium transition-all flex items-center space-x-1 whitespace-nowrap ${location.pathname === '/compare'
                    ? 'text-white bg-white/10 font-bold'
                    : 'text-nebula-text hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Scale size={14} className="text-cyan-400 flex-shrink-0" />
                  <span className="hidden xl:inline">{t.nav.compare}</span>
                  {compareListings.length > 0 && (
                    <span className="px-1.5 py-0.2 text-[9px] font-black rounded-full bg-plasma text-white">
                      {compareListings.length}
                    </span>
                  )}
                </Link>
              </nav>
            </div>

            {/* Right: Actions & User Controls */}
            <div className="hidden lg:flex items-center space-x-2 xl:space-x-3">
              {/* Language & Theme Controls Pill */}
              <div className="flex items-center p-0.5 xl:p-1 bg-void/60 border border-white/10 rounded-xl space-x-0.5 xl:space-x-1">
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  title={mode === 'dark' ? 'Гэгээлэг горимд шилжих' : 'Харанхуй горимд шилжих'}
                  className="p-1.5 rounded-lg text-nebula-text hover:text-white hover:bg-white/10 transition-all"
                >
                  {mode === 'dark' ? (
                    <Sun size={15} className="text-amber-400" />
                  ) : (
                    <Moon size={15} className="text-plasma" />
                  )}
                </button>

                <div className="w-[1px] h-3.5 bg-white/10" />

                {/* Language Switch */}
                <button
                  onClick={toggleLang}
                  className="px-2 py-1 rounded-lg text-xs font-bold text-starlight hover:text-plasma hover:bg-white/10 transition-all uppercase flex items-center space-x-1"
                >
                  <Globe size={12} className="text-plasma" />
                  <span>{lang}</span>
                </button>
              </div>

              {/* Create Listing Primary CTA Button */}
              <Link
                to="/create-listing"
                className="flex items-center space-x-1.5 px-3 py-1.5 xl:px-4 xl:py-2 rounded-xl bg-gradient-to-r from-plasma to-nova text-white font-semibold text-xs xl:text-sm shadow-md shadow-plasma/25 hover:shadow-lg hover:shadow-plasma/40 hover:scale-[1.02] active:scale-95 transition-all whitespace-nowrap flex-shrink-0"
              >
                <Plus size={15} className="stroke-[2.5] flex-shrink-0" />
                <span className="hidden xl:inline whitespace-nowrap">{t.nav.createListing}</span>
                <span className="xl:hidden whitespace-nowrap">Зар</span>
              </Link>

              {/* Chat / Messages Notification Button */}
              {isAuthenticated && (
                <Link
                  to="/dashboard?tab=messages"
                  title={t.chat.messagesTab}
                  className="relative p-1.5 xl:p-2 rounded-xl bg-void/60 hover:bg-white/10 border border-white/10 text-nebula-text hover:text-white transition-all flex items-center justify-center flex-shrink-0"
                >
                  <MessageSquare size={16} className="text-plasma" />
                  {unreadChatCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center animate-pulse shadow-md">
                      {unreadChatCount > 9 ? '9+' : unreadChatCount}
                    </span>
                  )}
                </Link>
              )}

              {/* User Account / Profile Section */}
              {isAuthenticated && user ? (
                <div className="relative flex-shrink-0" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-1.5 pr-2.5 rounded-xl bg-void/60 hover:bg-white/10 border border-white/10 transition-all group flex-shrink-0"
                  >
                    <div className="w-7 h-7 xl:w-8 xl:h-8 rounded-lg bg-gradient-to-tr from-plasma to-aurora p-0.5 flex-shrink-0 overflow-hidden">
                      {user.avatar || user.avatarUrl ? (
                        <img
                          src={getImageUrl(user.avatar || user.avatarUrl)}
                          alt={user.name || 'Profile'}
                          className="w-full h-full object-cover rounded-[6px]"
                        />
                      ) : (
                        <div className="w-full h-full bg-void rounded-[6px] flex items-center justify-center font-bold text-xs text-starlight">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                    </div>
                    <div className="text-left hidden xl:block">
                      <p className="text-xs font-bold text-starlight leading-tight truncate max-w-[90px]">
                        {user.name || 'Хэрэглэгч'}
                      </p>
                      <p className="text-[9px] text-plasma font-semibold leading-tight">
                        {user.subscriptionTier === 'AGENCY'
                          ? 'Агентлаг'
                          : user.subscriptionTier === 'PRO_AGENT'
                            ? 'PRO Агент'
                            : 'Хэрэглэгч'}
                      </p>
                    </div>
                    <ChevronDown
                      size={13}
                      className={`text-nebula-text group-hover:text-white transition-transform flex-shrink-0 ${isUserMenuOpen ? 'rotate-180' : ''
                        }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-void/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-2 space-y-1 z-50 overflow-hidden"
                      >
                        {/* Header Info */}
                        <div className="p-2.5 bg-white/[0.03] rounded-xl border border-white/5 mb-1 flex items-center space-x-2.5">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-plasma to-aurora p-0.5 flex-shrink-0 overflow-hidden">
                            {user.avatar || user.avatarUrl ? (
                              <img
                                src={getImageUrl(user.avatar || user.avatarUrl)}
                                alt={user.name || 'Profile'}
                                className="w-full h-full object-cover rounded-[6px]"
                              />
                            ) : (
                              <div className="w-full h-full bg-void rounded-[6px] flex items-center justify-center font-bold text-xs text-starlight">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-starlight truncate">{user.name || 'Хэрэглэгч'}</p>
                            <p className="text-[11px] text-nebula-text truncate">{user.email}</p>
                          </div>
                        </div>

                        <Link
                          to="/dashboard"
                          className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-nebula-text hover:text-white hover:bg-white/5 transition-all"
                        >
                          <LayoutDashboard size={15} className="text-plasma" />
                          <span>{t.nav.dashboard}</span>
                        </Link>

                        <Link
                          to="/dashboard?tab=messages"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-nebula-text hover:text-white hover:bg-white/5 transition-all"
                        >
                          <div className="flex items-center space-x-2.5">
                            <MessageSquare size={15} className="text-plasma" />
                            <span>{t.chat.messagesTab}</span>
                          </div>
                          {unreadChatCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[10px]">
                              {unreadChatCount}
                            </span>
                          )}
                        </Link>

                        <Link
                          to="/profile"
                          className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-nebula-text hover:text-white hover:bg-white/5 transition-all"
                        >
                          <UserIcon size={15} className="text-aurora" />
                          <span>{t.nav.profile}</span>
                        </Link>

                        {/* <Link
                          to="/pricing"
                          className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-amber-300 hover:bg-amber-500/10 transition-all"
                        >
                          <Sparkles size={15} className="text-amber-400" />
                          <span>Багц шинэчлэх</span>
                        </Link> */}

                        <div className="h-[1px] bg-white/10 my-1" />

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-all"
                        >
                          <LogOut size={15} />
                          <span>{t.nav.logout}</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-void/60 hover:bg-white/10 border border-white/10 text-starlight text-xs font-semibold hover:text-white transition-all"
                >
                  <UserIcon size={15} className="text-plasma" />
                  <span>{t.nav.login}</span>
                </Link>
              )}
            </div>

            {/* Mobile & Tablet Top Bar Controls (< 1024px) */}
            <div className="lg:hidden flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-void/50 border border-white/10 text-starlight active:scale-95 transition-transform"
                aria-label="Загвар солих"
              >
                {mode === 'dark' ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-plasma" />}
              </button>

              <button
                onClick={toggleLang}
                className="px-2.5 py-1.5 rounded-xl bg-void/50 border border-white/10 text-xs font-bold text-starlight uppercase active:scale-95 transition-transform flex items-center space-x-1"
                aria-label="Хэл солих"
              >
                <Globe size={13} className="text-plasma" />
                <span>{lang}</span>
              </button>

              {/* User Profile Avatar / Login Icon on Mobile & Tablet */}
              {isAuthenticated && user ? (
                <Link
                  to="/profile"
                  className="w-8 h-8 rounded-lg bg-gradient-to-tr from-plasma to-aurora p-0.5 overflow-hidden flex-shrink-0"
                  title="Хэрэглэгчийн профайл"
                >
                  {user.avatar || user.avatarUrl ? (
                    <img
                      src={getImageUrl(user.avatar || user.avatarUrl)}
                      alt={user.name || 'User'}
                      className="w-full h-full object-cover rounded-[6px]"
                    />
                  ) : (
                    <div className="w-full h-full bg-void rounded-[6px] flex items-center justify-center font-bold text-xs text-starlight">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="p-2 rounded-xl bg-void/50 border border-white/10 text-starlight active:scale-95 transition-transform"
                  title="Нэвтрэх"
                >
                  <UserIcon size={17} className="text-plasma" />
                </Link>
              )}

              <button
                onClick={() => setIsDrawerOpen(true)}
                className="p-2 rounded-xl bg-plasma/20 text-plasma border border-plasma/30 active:scale-95 transition-transform"
                aria-label="Цэс нээх"
              >
                <Menu size={20} />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Native Slide-in Mobile Drawer */}
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
};

export default Navbar;
