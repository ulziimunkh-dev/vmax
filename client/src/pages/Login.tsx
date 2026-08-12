import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n';

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const Login = () => {
  const { t } = useI18n();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 pt-16">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full max-w-md p-8 rounded-2xl border-glow">
        <h2 className="text-3xl font-heading font-bold text-center mb-8 text-glow">{t.auth.login}</h2>
        <div className="space-y-4">
          <button className="w-full bg-white text-gray-900 font-medium py-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-gray-100 transition-colors">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            <span>{t.auth.continueGoogle}</span>
          </button>
          <button className="w-full bg-[#1877F2] text-white font-medium py-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-[#0c66db] transition-colors">
            <FacebookIcon />
            <span>{t.auth.continueFacebook}</span>
          </button>

          <div className="flex items-center py-4">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="px-4 text-nebula-text text-sm">{t.auth.or}</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <input type="email" placeholder={t.auth.email} className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-plasma focus:ring-1 focus:ring-plasma transition-all" />
          <input type="password" placeholder={t.auth.password} className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-plasma focus:ring-1 focus:ring-plasma transition-all" />

          <button className="w-full bg-gradient-to-r from-plasma to-nova text-white font-medium py-3 rounded-xl hover:shadow-lg hover:shadow-plasma/30 transition-all duration-300">
            {t.auth.login}
          </button>
        </div>
        <p className="mt-6 text-center text-nebula-text text-sm">
          {t.auth.newUser} <Link to="/register" className="text-plasma hover:text-white transition-colors">{t.auth.register}</Link>
        </p>
      </motion.div>
    </div>
  );
};
export default Login;
