import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Send,
  CheckCircle,
} from 'lucide-react';

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 4000);
  };

  return (
    <footer className="bg-void/90 backdrop-blur-2xl border-t border-white/10 mt-20 transition-colors duration-300 relative overflow-hidden">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-plasma/60 to-transparent" />
      <div className="absolute top-0 right-1/4 w-96 h-48 bg-plasma/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Column 1: Brand & Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-plasma via-nova to-aurora p-0.5 shadow-lg shadow-plasma/30 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-void rounded-[10px] flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-plasma" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-heading font-black tracking-tight text-starlight text-glow leading-none">
                  Vmax<span className="text-plasma">.mn</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest text-nebula-text/70 font-semibold mt-0.5">
                  Real Estate Platform
                </span>
              </div>
            </Link>

            <p className="text-nebula-text text-sm leading-relaxed max-w-sm">
              Монголын хамгийн сүүлийн үеийн, найдвартай үл хөдлөх хөрөнгийн платформ. Орон сууц, хаус, оффис зарах болон түрээслэх хамгийн хурдан шийдэл.
            </p>

            {/* Direct Contact Cards */}
            <div className="space-y-2 pt-2 text-xs text-nebula-text">
              <div className="flex items-center space-x-2.5">
                <Phone size={14} className="text-plasma flex-shrink-0" />
                <span>+976 7711-8888, +976 9911-8888</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail size={14} className="text-aurora flex-shrink-0" />
                <span>contact@vmax.mn, info@vmax.mn</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <MapPin size={14} className="text-nova flex-shrink-0" />
                <span>Улаанбаатар хот, Сүхбаатар дүүрэг, 1-р хороо</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-starlight font-bold text-sm mb-4 tracking-wide uppercase flex items-center space-x-1.5">
              <span>Үндсэн цэс</span>
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-nebula-text hover:text-plasma transition-colors flex items-center space-x-1.5">
                  <ArrowRight size={12} className="text-plasma/60" />
                  <span>Бүх зар үзэх</span>
                </Link>
              </li>
              <li>
                <Link to="/create-listing" className="text-nebula-text hover:text-plasma transition-colors flex items-center space-x-1.5">
                  <ArrowRight size={12} className="text-plasma/60" />
                  <span>Шинэ зар нийтлэх</span>
                </Link>
              </li>
              <li>
                <Link to="/compare" className="text-nebula-text hover:text-plasma transition-colors flex items-center space-x-1.5">
                  <ArrowRight size={12} className="text-plasma/60" />
                  <span>Зар харьцуулах</span>
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors flex items-center space-x-1.5">
                  <Sparkles size={13} className="text-amber-400" />
                  <span>VIP Багцууд</span>
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-nebula-text hover:text-plasma transition-colors flex items-center space-x-1.5">
                  <ArrowRight size={12} className="text-plasma/60" />
                  <span>Хяналтын самбар</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Real Estate Categories */}
          <div>
            <h4 className="text-starlight font-bold text-sm mb-4 tracking-wide uppercase">
              Ангилал
            </h4>
            <ul className="space-y-2.5 text-sm text-nebula-text">
              <li>
                <Link to="/" className="hover:text-plasma transition-colors">
                  🏢 Орон сууц зарна
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-plasma transition-colors">
                  🔑 Орон сууц түрээслүүлнэ
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-plasma transition-colors">
                  🏡 Хаус, Таунхаус
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-plasma transition-colors">
                  💼 Оффис, Үйлчилгээний талбай
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-plasma transition-colors">
                  🌲 Зуслан, Амралтын газар
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter & Company Info */}
          <div>
            <h4 className="text-starlight font-bold text-sm mb-4 tracking-wide uppercase">
              Мэдэгдэл захиалах
            </h4>
            <p className="text-xs text-nebula-text leading-relaxed mb-3">
              Хамгийн сүүлийн үеийн тансаг орон сууц, онцлох зарын мэдээллийг имэйлээрээ аваарай.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Имэйл хаягаа оруулна уу"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-void/60 border border-white/10 text-xs text-starlight placeholder-nebula-text/60 focus:outline-none focus:border-plasma focus:ring-1 focus:ring-plasma transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-3 bg-gradient-to-r from-plasma to-nova text-white rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity"
                  aria-label="Илгээх"
                >
                  <Send size={13} />
                </button>
              </div>

              {subscribed && (
                <div className="text-[11px] text-emerald-400 font-semibold flex items-center space-x-1 mt-1">
                  <CheckCircle size={12} />
                  <span>Амжилттай бүртгэгдлээ!</span>
                </div>
              )}
            </form>

            <div className="mt-4 pt-4 border-t border-white/10 space-y-1.5 text-xs text-nebula-text">
              <div><Link to="/about" className="hover:text-plasma transition-colors">Бидний тухай</Link></div>
              <div><Link to="/terms" className="hover:text-plasma transition-colors">Үйлчилгээний нөхцөл & Нууцлал</Link></div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar with Socials & Status */}
      <div className="border-t border-white/10 bg-void/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Copyright text */}
          <div className="flex items-center space-x-2 text-xs text-nebula-text text-center sm:text-left">
            <span>&copy; {new Date().getFullYear()} Vmax.mn. Бүх эрх хуулиар хамгаалагдсан.</span>
          </div>

          {/* System Online Badge */}
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Систем хэвийн ажиллаж байна</span>
          </div>

          {/* Social Icons */}
          <div className="flex items-center space-x-2">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="p-2 rounded-xl bg-white/5 hover:bg-plasma/20 text-nebula-text hover:text-plasma border border-white/10 hover:border-plasma/40 transition-all"
            >
              <FacebookIcon />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="p-2 rounded-xl bg-white/5 hover:bg-plasma/20 text-nebula-text hover:text-plasma border border-white/10 hover:border-plasma/40 transition-all"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="p-2 rounded-xl bg-white/5 hover:bg-plasma/20 text-nebula-text hover:text-plasma border border-white/10 hover:border-plasma/40 transition-all"
            >
              <TwitterIcon />
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
