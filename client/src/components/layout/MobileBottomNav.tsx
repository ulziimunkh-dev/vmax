import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Plus, Scale, User } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCompareStore } from '@/store/useCompareStore';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const { compareListings } = useCompareStore();

  const currentPath = location.pathname;

  const handleSearchTabClick = () => {
    if (currentPath === '/') {
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const navTabs = [
    {
      id: 'home',
      label: 'Нүүр',
      to: '/',
      icon: Home,
      isActive: currentPath === '/',
    },
    {
      id: 'search',
      label: 'Хайлт',
      to: '/',
      icon: Search,
      onClick: handleSearchTabClick,
      isActive: false,
    },
    {
      id: 'create',
      label: 'Зар нэмэх',
      to: '/create-listing',
      icon: Plus,
      isCenterAction: true,
      isActive: currentPath === '/create-listing',
    },
    {
      id: 'compare',
      label: 'Харьцуулах',
      to: '/compare',
      icon: Scale,
      badge: compareListings.length > 0 ? compareListings.length : null,
      isActive: currentPath === '/compare',
    },
    {
      id: 'profile',
      label: isAuthenticated ? 'Миний' : 'Нэвтрэх',
      to: isAuthenticated ? '/dashboard' : '/login',
      icon: User,
      isActive: currentPath === '/dashboard' || currentPath === '/profile' || currentPath === '/login',
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-void/90 backdrop-blur-2xl border-t border-white/10 shadow-[0_-10px_25px_rgba(0,0,0,0.5)] pb-[env(safe-area-inset-bottom,0px)]">
      <div className="grid grid-cols-5 h-16 items-center px-1 max-w-lg mx-auto">
        {navTabs.map((tab) => {
          const Icon = tab.icon;

          if (tab.isCenterAction) {
            return (
              <div key={tab.id} className="flex flex-col items-center justify-center relative -top-3">
                <Link
                  to={tab.to}
                  className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-plasma via-nova to-aurora p-0.5 shadow-xl shadow-plasma/40 active:scale-90 transition-transform flex items-center justify-center"
                  aria-label={tab.label}
                >
                  <div className="w-full h-full bg-void rounded-[14px] flex items-center justify-center">
                    <Icon size={24} className="text-white" />
                  </div>
                </Link>
                <span className="text-[10px] font-semibold text-plasma mt-1">
                  {tab.label}
                </span>
              </div>
            );
          }

          return (
            <Link
              key={tab.id}
              to={tab.to}
              onClick={tab.onClick}
              className={`flex flex-col items-center justify-center py-1.5 transition-all relative active:scale-95 ${
                tab.isActive
                  ? 'text-plasma font-bold'
                  : 'text-nebula-text hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon size={20} className={tab.isActive ? 'text-plasma stroke-[2.5]' : 'text-nebula-text stroke-[1.8]'} />
                {tab.badge !== null && tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-plasma text-white text-[9px] font-black flex items-center justify-center shadow-md shadow-plasma/50 animate-scaleIn">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 ${tab.isActive ? 'text-plasma font-bold' : 'text-nebula-text'}`}>
                {tab.label}
              </span>
              {tab.isActive && (
                <div className="w-1 h-1 rounded-full bg-plasma mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
