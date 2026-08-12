import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useI18n } from '@/i18n';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout } = useAuthStore();
  const { t, lang, setLang } = useI18n();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLang = () => {
    setLang(lang === 'mn' ? 'en' : 'mn');
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-bg-void/90 backdrop-blur-md border-b border-white/10' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-space font-bold text-text-starlight text-glow">
              Vmax<span className="text-accent-plasma">.mn</span>
            </motion.span>
          </Link>
          <div className="hidden md:flex space-x-6 items-center">
            <Link to="/" className="text-text-nebula hover:text-white transition-colors">{t.nav.listings}</Link>
            
            <button onClick={toggleLang} className="flex items-center space-x-1 text-text-nebula hover:text-white transition-colors uppercase text-sm font-medium">
              <Globe size={16} />
              <span>{lang}</span>
            </button>

            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-text-nebula hover:text-white transition-colors">{t.nav.dashboard}</Link>
                <Link to="/profile" className="text-text-nebula hover:text-white transition-colors">{t.nav.profile}</Link>
                <Link to="/create-listing" className="bg-accent-plasma/20 border border-accent-plasma/50 text-accent-plasma px-4 py-2 rounded-lg hover:bg-accent-plasma/30 transition-colors">
                  {t.nav.createListing}
                </Link>
                <button onClick={logout} className="text-text-nebula hover:text-white">{t.nav.logout}</button>
              </>
            ) : (
              <Link to="/login" className="flex items-center space-x-2 text-white bg-accent-plasma px-4 py-2 rounded-lg hover:bg-accent-nova transition-colors shadow-lg shadow-accent-plasma/30">
                <User size={18} />
                <span>{t.nav.login}</span>
              </Link>
            )}
          </div>
          <div className="md:hidden flex items-center space-x-4">
            <button onClick={toggleLang} className="text-text-nebula uppercase text-sm font-medium flex items-center">
              <Globe size={16} className="mr-1" /> {lang}
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="text-white p-2">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden bg-bg-cosmic border-t border-white/10 overflow-hidden">
            <div className="px-4 py-4 space-y-4 flex flex-col">
              <Link to="/" className="text-text-nebula" onClick={() => setIsOpen(false)}>{t.nav.listings}</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="text-text-nebula" onClick={() => setIsOpen(false)}>{t.nav.dashboard}</Link>
                  <Link to="/profile" className="text-text-nebula" onClick={() => setIsOpen(false)}>{t.nav.profile}</Link>
                  <Link to="/create-listing" className="text-accent-plasma font-semibold" onClick={() => setIsOpen(false)}>{t.nav.createListing}</Link>
                  <button onClick={() => { logout(); setIsOpen(false); }} className="text-left text-text-nebula">{t.nav.logout}</button>
                </>
              ) : (
                <Link to="/login" className="text-white" onClick={() => setIsOpen(false)}>{t.nav.login} / {t.nav.register}</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
export default Navbar;

