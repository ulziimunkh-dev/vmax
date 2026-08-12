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
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/services/api';

const App = () => {
  const { token, setUser, logout } = useAuthStore();

  useEffect(() => {
    if (token) {
      api.get('/auth/profile').then((res) => setUser(res.data)).catch(() => logout());
    }
  }, [token]);

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <BrowserRouter>
        <Starfield />
        <div className="min-h-screen flex flex-col font-sans relative z-0">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/create-listing" element={<CreateListing />} />
              <Route path="/listings/:id" element={<ListingDetail />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};
export default App;
