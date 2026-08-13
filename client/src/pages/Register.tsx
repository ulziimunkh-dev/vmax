import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { authAPI } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';

const Register = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.register(formData);
      const { user, access_token } = response.data;
      loginStore(user, access_token);
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (Array.isArray(msg)) {
        setError(msg.join(', '));
      } else if (typeof msg === 'string') {
        setError(msg);
      } else {
        setError('Registration failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 pt-16">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full max-w-md p-8 rounded-2xl border-glow">
        <h2 className="text-3xl font-heading font-bold text-center mb-8 text-glow">{t.auth.register}</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder={t.auth.name}
            className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-starlight placeholder-nebula-text focus:outline-none focus:border-plasma focus:ring-1 focus:ring-plasma transition-all"
          />
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder={t.auth.email}
            className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-starlight placeholder-nebula-text focus:outline-none focus:border-plasma focus:ring-1 focus:ring-plasma transition-all"
          />
          <input
            type="password"
            name="password"
            required
            minLength={6}
            value={formData.password}
            onChange={handleChange}
            placeholder={t.auth.password}
            className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-starlight placeholder-nebula-text focus:outline-none focus:border-plasma focus:ring-1 focus:ring-plasma transition-all"
          />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder={t.auth.phone}
            className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-starlight placeholder-nebula-text focus:outline-none focus:border-plasma focus:ring-1 focus:ring-plasma transition-all"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-plasma to-nova text-white-force font-medium py-3 rounded-xl hover:shadow-lg hover:shadow-plasma/30 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? '...' : t.auth.register}
          </button>
        </form>

        <p className="mt-6 text-center text-nebula-text text-sm">
          {t.auth.hasAccount} <Link to="/login" className="text-plasma font-semibold hover:underline transition-colors">{t.auth.login}</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
