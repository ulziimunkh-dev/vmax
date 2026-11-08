import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Starfield from '@/components/layout/Starfield';
import PromoBanner from '@/components/layout/PromoBanner';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import CreateListing from '@/pages/CreateListing';
import ListingDetail from '@/pages/ListingDetail';
import Pricing from '@/pages/Pricing';
import CompareListings from '@/pages/CompareListings';
import Projects from '@/pages/Projects';
import ProjectDetail from '@/pages/ProjectDetail';
import CreateProject from '@/pages/CreateProject';
import Furniture from '@/pages/Furniture';
import FurnitureDetail from '@/pages/FurnitureDetail';
import CreateFurnitureProfile from '@/pages/CreateFurnitureProfile';
import AboutUs from '@/pages/AboutUs';
import TermsOfService from '@/pages/TermsOfService';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import { CompareFloatingBar } from '@/components/listings/CompareFloatingBar';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { VmaxAIChat } from '@/components/ai/VmaxAIChat';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import api, { authAPI } from '@/services/api';

import { ScrollToTop } from '@/components/common/ScrollToTop';

const App = () => {
  const { token, setUser, logout, login } = useAuthStore();
  const { mode } = useThemeStore();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token=')) {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const accessToken = hashParams.get('access_token');
      if (accessToken) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
        authAPI.googleLogin(accessToken).then((res) => {
          const { user: authUser, access_token: jwtToken } = res.data;
          login(authUser, jwtToken);
          const target = sessionStorage.getItem('oauth_target_redirect');
          if (target) {
            sessionStorage.removeItem('oauth_target_redirect');
            window.location.href = target;
          }
        }).catch((err) => {
          console.error('Google OAuth hash login failed:', err);
        });
      }
    }
  }, [login]);

  useEffect(() => {
    if (mode === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [mode]);

  useEffect(() => {
    if (token) {
      api.get('/auth/profile').then((res) => setUser(res.data)).catch(() => logout());
    }
  }, [token]);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || '474155590838-p7h6dsl91e883rmdsu5naqg9seevtv5v.apps.googleusercontent.com'}>
      <BrowserRouter>
        <ScrollToTop />
        <Starfield />
        <div className="min-h-screen flex flex-col font-sans relative z-0 transition-colors duration-300">
          <PromoBanner />
          <Navbar />
          <main className="flex-grow pb-20 md:pb-0">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/compare" element={<CompareListings />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/data-deletion" element={<PrivacyPolicy />} />
              <Route path="/create-listing" element={<CreateListing />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/create-project" element={<CreateProject />} />
              <Route path="/furniture" element={<Furniture />} />
              <Route path="/furniture/:id" element={<FurnitureDetail />} />
              <Route path="/create-furniture-profile" element={<CreateFurnitureProfile />} />
              <Route path="/listings/:id/edit" element={<CreateListing />} />
              <Route path="/listings/:id" element={<ListingDetail />} />
            </Routes>
          </main>
          <CompareFloatingBar />
          <PWAInstallPrompt />
          <VmaxAIChat />
          <MobileBottomNav />
          <Footer />
        </div>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};



export default App;
