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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useI18n } from '@/i18n';
import { useThemeStore } from '@/store/useThemeStore';
import { useCompareStore } from '@/store/useCompareStore';
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
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-plasma via-nova to-aurora p-0.5 shadow-lg shadow-plasma/30 group-hover:scale-105 transition-transform">
                  <div className="w-full h-full bg-void rounded-[10px] flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-plasma group-hover:text-white transition-colors" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-heading font-black tracking-tight text-starlight text-glow leading-none">
                    Vmax<span className="text-plasma">.mn</span>
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-nebula-text/70 font-semibold mt-0.5">
                    Real Estate
                  </span>
                </div>
              </Link>

              {/* Desktop Main Navigation Links */}
              <nav className="hidden md:flex items-center space-x-1">
                <Link
                  to="/"
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${location.pathname === '/'
                    ? 'text-white bg-white/10 font-bold'
                    : 'text-nebula-text hover:text-white hover:bg-white/5'
                    }`}
                >
                  {t.nav.listings}
                </Link>

                <Link
                  to="/compare"
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-1.5 ${location.pathname === '/compare'
                    ? 'text-white bg-white/10 font-bold'
                    : 'text-nebula-text hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Scale size={15} className="text-cyan-400" />
                  <span>Харьцуулах</span>
                  {compareListings.length > 0 && (
                    <span className="px-1.5 py-0.2 text-[10px] font-black rounded-full bg-plasma text-white">
                      {compareListings.length}
                    </span>
                  )}
                </Link>

                {/* <Link
                  to="/pricing"
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                    location.pathname === '/pricing'
                      ? 'text-amber-300 bg-amber-500/20 border border-amber-500/30'
                      : 'text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10'
                  }`}
                >
                  <Sparkles size={14} className="text-amber-400" />
                  <span>Багцууд</span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                    VIP
                  </span>
                </Link> */}
              </nav>
            </div>

            {/* Right: Actions & User Controls */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Language & Theme Controls Pill */}
              <div className="flex items-center p-1 bg-void/60 border border-white/10 rounded-xl space-x-1">
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  title={mode === 'dark' ? 'Гэгээлэг горимд шилжих' : 'Харанхуй горимд шилжих'}
                  className="p-1.5 rounded-lg text-nebula-text hover:text-white hover:bg-white/10 transition-all"
                >
                  {mode === 'dark' ? (
                    <Sun size={16} className="text-amber-400" />
                  ) : (
                    <Moon size={16} className="text-plasma" />
                  )}
                </button>

                <div className="w-[1px] h-4 bg-white/10" />

                {/* Language Switch */}
                <button
                  onClick={toggleLang}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-starlight hover:text-plasma hover:bg-white/10 transition-all uppercase flex items-center space-x-1"
                >
                  <Globe size={13} className="text-plasma" />
                  <span>{lang}</span>
                </button>
              </div>

              {/* Create Listing Primary CTA Button */}
              <Link
                to="/create-listing"
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-plasma to-nova text-white font-semibold text-sm shadow-md shadow-plasma/25 hover:shadow-lg hover:shadow-plasma/40 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Plus size={16} className="stroke-[2.5]" />
                <span>{t.nav.createListing}</span>
              </Link>

              {/* User Account / Profile Section */}
              {isAuthenticated && user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-xl bg-void/60 hover:bg-white/10 border border-white/10 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-plasma to-aurora p-0.5 flex-shrink-0 overflow-hidden">
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
                    <div className="text-left hidden lg:block">
                      <p className="text-xs font-bold text-starlight leading-tight truncate max-w-[100px]">
                        {user.name || 'Хэрэглэгч'}
                      </p>
                      <p className="text-[10px] text-plasma font-semibold leading-tight">
                        {user.subscriptionTier === 'AGENCY'
                          ? 'Агентлаг'
                          : user.subscriptionTier === 'PRO_AGENT'
                            ? 'PRO Агент'
                            : 'Хэрэглэгч'}
                      </p>
                    </div>
                    <ChevronDown
                      size={14}
                      className={`text-nebula-text group-hover:text-white transition-transform ${isUserMenuOpen ? 'rotate-180' : ''
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

            {/* Mobile Top Bar Controls */}
            <div className="md:hidden flex items-center space-x-2">
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
