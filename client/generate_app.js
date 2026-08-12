const fs = require('fs');
const path = require('path');
const projectDir = 'c:/Users/dell/.gemini/antigravity/scratch/vmax/client';

const files = {
  'src/components/layout/Navbar.tsx': `
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={\`fixed top-0 w-full z-50 transition-all duration-300 \${scrolled ? 'bg-void/90 backdrop-blur-md border-b border-white/10' : 'bg-transparent'}\`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-heading font-bold text-starlight text-glow">
              Vmax<span className="text-plasma">.mn</span>
            </motion.span>
          </Link>
          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/listings" className="text-nebula-text hover:text-white transition-colors">Зар үзэх</Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-nebula-text hover:text-white transition-colors">Хянах самбар</Link>
                <Link to="/create-listing" className="bg-plasma/20 border border-plasma/50 text-plasma px-4 py-2 rounded-lg hover:bg-plasma/30 transition-colors">
                  Зар оруулах
                </Link>
                <button onClick={logout} className="text-nebula-text hover:text-white">Гарах</button>
              </>
            ) : (
              <Link to="/login" className="flex items-center space-x-2 text-white bg-plasma px-4 py-2 rounded-lg hover:bg-nova transition-colors shadow-lg shadow-plasma/30">
                <User size={18} />
                <span>Нэвтрэх</span>
              </Link>
            )}
          </div>
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden bg-cosmic border-t border-white/10">
            <div className="px-4 py-4 space-y-4 flex flex-col">
              <Link to="/listings" className="text-nebula-text" onClick={() => setIsOpen(false)}>Зар үзэх</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="text-nebula-text" onClick={() => setIsOpen(false)}>Хянах самбар</Link>
                  <Link to="/create-listing" className="text-plasma font-semibold" onClick={() => setIsOpen(false)}>Зар оруулах</Link>
                  <button onClick={() => { logout(); setIsOpen(false); }} className="text-left text-nebula-text">Гарах</button>
                </>
              ) : (
                <Link to="/login" className="text-white" onClick={() => setIsOpen(false)}>Нэвтрэх / Бүртгүүлэх</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
export default Navbar;
`,
  'src/components/layout/Footer.tsx': `
import React from 'react';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => (
  <footer className="bg-cosmic/50 backdrop-blur-md border-t border-white/5 pt-12 pb-8 mt-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
        <h3 className="text-xl font-heading font-bold text-glow mb-4">Vmax.mn</h3>
        <p className="text-nebula-text text-sm">Ирээдүйн үл хөдлөх хөрөнгийн платформ. Хамгийн хялбар, хамгийн хурдан.</p>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-4">Холбоосууд</h4>
        <ul className="space-y-2 text-sm text-nebula-text">
          <li><a href="#" className="hover:text-plasma transition-colors">Бидний тухай</a></li>
          <li><a href="#" className="hover:text-plasma transition-colors">Үйлчилгээний нөхцөл</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-4">Холбоо барих</h4>
        <ul className="space-y-2 text-sm text-nebula-text">
          <li>Утас: +976 8888-8888</li>
          <li>Имэйл: info@vmax.mn</li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-4">Дагах</h4>
        <div className="flex space-x-4">
          <a href="#" className="text-nebula-text hover:text-plasma"><Facebook size={20} /></a>
          <a href="#" className="text-nebula-text hover:text-plasma"><Instagram size={20} /></a>
          <a href="#" className="text-nebula-text hover:text-plasma"><Twitter size={20} /></a>
        </div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-white/5 text-center text-sm text-nebula-text">
      &copy; {new Date().getFullYear()} Vmax.mn. Бүх эрх хуулиар хамгаалагдсан.
    </div>
  </footer>
);
export default Footer;
`,
  'src/App.tsx': `
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Starfield from '@/components/layout/Starfield';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
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
              {/* Other routes omitted for brevity in base generation, to be expanded */}
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};
export default App;
`,
  'src/main.tsx': `
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(projectDir, filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim(), 'utf8');
}
console.log('App files generated.');
