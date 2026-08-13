import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Starfield from '@/components/layout/Starfield';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import CreateListing from '@/pages/CreateListing';
import ListingDetail from '@/pages/ListingDetail';
import Pricing from '@/pages/Pricing';
import CompareListings from '@/pages/CompareListings';
import AboutUs from '@/pages/AboutUs';
import TermsOfService from '@/pages/TermsOfService';
import { CompareFloatingBar } from '@/components/listings/CompareFloatingBar';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import api from '@/services/api';

const App = () => {
  const { token, setUser, logout } = useAuthStore();
  const { mode } = useThemeStore();

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
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <BrowserRouter>
        <Starfield />
        <div className="min-h-screen flex flex-col font-sans relative z-0 transition-colors duration-300">
          <Navbar />
          <main className="flex-grow">
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
              <Route path="/create-listing" element={<CreateListing />} />
              <Route path="/listings/:id" element={<ListingDetail />} />
            </Routes>
          </main>
          <CompareFloatingBar />
          <Footer />
        </div>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};



export default App;
