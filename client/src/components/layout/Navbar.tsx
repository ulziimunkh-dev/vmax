import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, Globe, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useI18n } from '@/i18n';
import { useThemeStore } from '@/store/useThemeStore';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout } = useAuthStore();
  const { t, lang, setLang } = useI18n();
  const { mode, toggleTheme } = useThemeStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLang = () => {
    setLang(lang === 'mn' ? 'en' : 'mn');
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-void/90 backdrop-blur-md border-b border-white/10 shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-heading font-bold text-starlight text-glow">
              Vmax<span className="text-plasma">.mn</span>
            </motion.span>
          </Link>
          <div className="hidden md:flex space-x-6 items-center">
            <Link to="/" className="text-nebula-text hover:text-plasma transition-colors font-medium">{t.nav.listings}</Link>
            <Link to="/pricing" className="text-amber-400 hover:text-amber-300 transition-colors font-semibold flex items-center space-x-1">
              <span>⭐ Багцууд</span>
            </Link>


            {/* Language Switcher */}
            <button onClick={toggleLang} className="flex items-center space-x-1 text-nebula-text hover:text-plasma transition-colors uppercase text-sm font-medium">
              <Globe size={16} />
              <span>{lang}</span>
            </button>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-xl bg-void/50 border border-white/10 text-plasma hover:bg-plasma/20 transition-all"
            >
              {mode === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-plasma" />}
            </button>

            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-nebula-text hover:text-plasma transition-colors font-medium">{t.nav.dashboard}</Link>
                <Link to="/profile" className="text-nebula-text hover:text-plasma transition-colors font-medium">{t.nav.profile}</Link>
                <Link to="/create-listing" className="bg-plasma/20 border border-plasma/50 text-plasma px-4 py-2 rounded-xl hover:bg-plasma/30 transition-colors font-medium shadow-md shadow-plasma/10">
                  {t.nav.createListing}
                </Link>
                <button onClick={logout} className="text-nebula-text hover:text-red-400 font-medium transition-colors">{t.nav.logout}</button>
              </>
            ) : (
              <Link to="/login" className="flex items-center space-x-2 text-white bg-gradient-to-r from-plasma to-nova px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-plasma/30 transition-all font-medium">
                <User size={18} />
                <span>{t.nav.login}</span>
              </Link>
            )}
          </div>
          <div className="md:hidden flex items-center space-x-3">
            <button onClick={toggleTheme} className="text-plasma p-1.5 rounded-lg bg-void/50 border border-white/10">
              {mode === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-plasma" />}
            </button>
            <button onClick={toggleLang} className="text-nebula-text uppercase text-sm font-medium flex items-center">
              <Globe size={16} className="mr-1" /> {lang}
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="text-starlight p-2">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden bg-cosmic border-t border-white/10 overflow-hidden">
            <div className="px-4 py-4 space-y-4 flex flex-col">
              <Link to="/" className="text-nebula-text" onClick={() => setIsOpen(false)}>{t.nav.listings}</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="text-nebula-text" onClick={() => setIsOpen(false)}>{t.nav.dashboard}</Link>
                  <Link to="/profile" className="text-nebula-text" onClick={() => setIsOpen(false)}>{t.nav.profile}</Link>
                  <Link to="/create-listing" className="text-plasma font-semibold" onClick={() => setIsOpen(false)}>{t.nav.createListing}</Link>
                  <button onClick={() => { logout(); setIsOpen(false); }} className="text-left text-nebula-text">{t.nav.logout}</button>
                </>
              ) : (
                <Link to="/login" className="text-starlight" onClick={() => setIsOpen(false)}>{t.nav.login} / {t.nav.register}</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
export default Navbar;
