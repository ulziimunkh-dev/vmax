import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n';

const Register = () => {
  const { t } = useI18n();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 pt-16">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full max-w-md p-8 rounded-2xl border-glow">
        <h2 className="text-3xl font-heading font-bold text-center mb-8 text-glow">{t.auth.register}</h2>
        <div className="space-y-4">
          <input type="text" placeholder={t.auth.name} className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-plasma focus:ring-1 focus:ring-plasma transition-all" />
          <input type="email" placeholder={t.auth.email} className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-plasma focus:ring-1 focus:ring-plasma transition-all" />
          <input type="password" placeholder={t.auth.password} className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-plasma focus:ring-1 focus:ring-plasma transition-all" />
          <input type="tel" placeholder={t.auth.phone} className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-plasma focus:ring-1 focus:ring-plasma transition-all" />

          <button className="w-full bg-gradient-to-r from-plasma to-nova text-white font-medium py-3 rounded-xl hover:shadow-lg hover:shadow-plasma/30 transition-all duration-300">
            {t.auth.register}
          </button>
        </div>
        <p className="mt-6 text-center text-nebula-text text-sm">
          {t.auth.hasAccount} <Link to="/login" className="text-plasma hover:text-white transition-colors">{t.auth.login}</Link>
        </p>
      </motion.div>
    </div>
  );
};
export default Register;
