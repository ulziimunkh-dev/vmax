import React from 'react';
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
  Building,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useI18n } from '@/i18n';
import { useThemeStore } from '@/store/useThemeStore';
import { useCompareStore } from '@/store/useCompareStore';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { t, lang, setLang } = useI18n();
  const { mode, toggleTheme } = useThemeStore();
  const { compareListings } = useCompareStore();

  const toggleLang = () => {
    setLang(lang === 'mn' ? 'en' : 'mn');
  };

  const navItems = [
    {
      label: t.nav.listings,
      to: '/',
      icon: <Home size={18} className="text-plasma" />,
    },
    {
      label: 'Багцууд (VIP, Баталгаажсан)',
      to: '/pricing',
      icon: <Sparkles size={18} className="text-amber-400" />,
      badge: 'VIP',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      label: t.nav.createListing,
      to: '/create-listing',
      icon: <PlusCircle size={18} className="text-aurora" />,
      highlight: true,
    },
    {
      label: 'Зар харьцуулах',
      to: '/compare',
      icon: <Scale size={18} className="text-cyan-400" />,
      badge: compareListings.length > 0 ? `${compareListings.length}` : undefined,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    ...(isAuthenticated
      ? [
          {
            label: t.nav.dashboard,
            to: '/dashboard',
            icon: <LayoutDashboard size={18} className="text-nova" />,
          },
          {
            label: t.nav.profile,
            to: '/profile',
            icon: <User size={18} className="text-plasma" />,
          },
        ]
      : []),
    {
      label: 'Бидний тухай',
      to: '/about',
      icon: <Info size={18} className="text-nebula-text" />,
    },
    {
      label: 'Үйлчилгээний нөхцөл',
      to: '/terms',
      icon: <FileText size={18} className="text-nebula-text" />,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-void/80 backdrop-blur-md z-50 md:hidden"
          />

          {/* Slide-in Mobile Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-void/95 backdrop-blur-2xl border-l border-white/10 z-50 md:hidden flex flex-col shadow-2xl shadow-plasma/20"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <Link to="/" onClick={onClose} className="flex items-center space-x-2">
                <span className="text-xl font-heading font-bold text-starlight text-glow">
                  Vmax<span className="text-plasma">.mn</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-plasma/20 text-plasma border border-plasma/30 font-bold">
                  App
                </span>
              </Link>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 text-nebula-text hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Хаах"
              >
                <X size={20} />
              </button>
            </div>

            {/* User Profile Card Section */}
            <div className="p-4 border-b border-white/10 bg-white/[0.02]">
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-3 p-3 rounded-2xl bg-cosmic/60 border border-white/10">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-plasma via-nova to-aurora p-0.5 flex-shrink-0 overflow-hidden">
                    {user.avatar || user.avatarUrl ? (
                      <img
                        src={user.avatar || user.avatarUrl}
                        alt={user.name || 'Profile'}
                        className="w-full h-full object-cover rounded-[10px]"
                      />
                    ) : (
                      <div className="w-full h-full bg-void rounded-[10px] flex items-center justify-center font-bold text-starlight text-base">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-starlight truncate">{user.name || 'Хэрэглэгч'}</h4>
                    <p className="text-xs text-nebula-text truncate">{user.email}</p>
                    <div className="flex items-center space-x-1.5 mt-1">
                      <ShieldCheck size={12} className="text-plasma" />
                      <span className="text-[10px] font-semibold text-plasma">
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
                <div className="p-4 rounded-2xl bg-gradient-to-br from-plasma/10 to-nova/10 border border-plasma/30 space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-starlight">Vmax Real Estate</h4>
                    <p className="text-xs text-nebula-text">Зар оруулах, хадгалахын тулд нэвтэрнэ үү</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      onClick={onClose}
                      className="py-2 text-center bg-gradient-to-r from-plasma to-nova text-white text-xs font-semibold rounded-xl hover:shadow-lg hover:shadow-plasma/30 transition-all"
                    >
                      {t.nav.login}
                    </Link>
                    <Link
                      to="/register"
                      onClick={onClose}
                      className="py-2 text-center bg-white/5 hover:bg-white/10 text-starlight text-xs font-semibold rounded-xl border border-white/10 transition-all"
                    >
                      {t.nav.register}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-none">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                    item.highlight
                      ? 'bg-gradient-to-r from-plasma/20 to-nova/20 text-white border border-plasma/40 shadow-sm'
                      : 'text-nebula-text hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 rounded-lg bg-void/60 border border-white/5">
                      {item.icon}
                    </div>
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight size={14} className="text-nebula-text/40" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Quick Settings: Theme & Language */}
            <div className="p-4 border-t border-white/10 space-y-3 bg-white/[0.02]">
              <div className="grid grid-cols-2 gap-2">
                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-void/50 border border-white/10 text-xs font-semibold text-starlight hover:bg-white/5 transition-all"
                >
                  {mode === 'dark' ? (
                    <>
                      <Sun size={15} className="text-amber-400" />
                      <span>Гэгээлэг</span>
                    </>
                  ) : (
                    <>
                      <Moon size={15} className="text-plasma" />
                      <span>Харанхуй</span>
                    </>
                  )}
                </button>

                {/* Language Switch Button */}
                <button
                  onClick={toggleLang}
                  className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-void/50 border border-white/10 text-xs font-semibold text-starlight hover:bg-white/5 transition-all uppercase"
                >
                  <Globe size={15} className="text-plasma" />
                  <span>{lang === 'mn' ? 'Монгол (MN)' : 'English (EN)'}</span>
                </button>
              </div>

              {/* Logout Button */}
              {isAuthenticated && (
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-all"
                >
                  <LogOut size={15} />
                  <span>{t.nav.logout}</span>
                </button>
              )}

              {/* Footer text */}
              <div className="text-center pt-1 text-[11px] text-nebula-text/60">
                Vmax.mn • Монголын Үл Хөдлөх Хөрөнгийн Платформ
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
