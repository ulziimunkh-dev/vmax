import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { authAPI } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { loginWithFacebook } from '@/utils/facebookAuth';

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

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

  const handleGoogleAuth = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (typeof window === 'undefined' || (!(window as any).google?.accounts?.id && !(window as any).google?.accounts?.oauth2)) {
      setError('Google Identity Services ачаалагдаж байна. Түр хүлээнэ үү.');
      return;
    }

    if (!clientId) {
      setError('Google Client ID тохируулагдаагүй байна.');
      return;
    }

    try {
      if ((window as any).google?.accounts?.oauth2) {
        const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.access_token) {
              setLoading(true);
              setError('');
              try {
                const res = await authAPI.googleLogin(tokenResponse.access_token);
                const { user, access_token } = res.data;
                loginStore(user, access_token);
                navigate('/');
              } catch (err: any) {
                setError(err.response?.data?.message || 'Google-ээр нэвтрэхэд алдаа гарлаа.');
              } finally {
                setLoading(false);
              }
            }
          },
        });
        tokenClient.requestAccessToken({ prompt: 'consent' });
        return;
      }
    } catch {
      setError('Google нэвтрэлт эхлүүлэхэд алдаа гарлаа.');
    }
  };

  const handleFacebookAuth = async () => {
    setError('');
    setLoading(true);

    try {
      const accessToken = await loginWithFacebook();
      const response = await authAPI.facebookLogin(accessToken);
      const { user, access_token } = response.data;
      loginStore(user, access_token);
      navigate('/');
    } catch (err: any) {
      setError(err.message || err.response?.data?.message || 'Facebook-ээр нэвтрэхэд алдаа гарлаа.');
    } finally {
      setLoading(false);
    }
  };

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

        <div className="space-y-3 mb-4">
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full bg-white text-gray-900 border border-slate-200 font-medium py-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            <span className="text-slate-800 font-semibold text-sm">{t.auth.continueGoogle}</span>
          </button>

          <button
            type="button"
            onClick={handleFacebookAuth}
            disabled={loading}
            className="w-full bg-[#1877F2] text-white font-medium py-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-[#0c66db] transition-colors shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <FacebookIcon />
            <span className="font-semibold text-sm">{t.auth.continueFacebook}</span>
          </button>

          <div className="flex items-center py-2">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="px-4 text-nebula-text text-sm">{t.auth.or}</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>
        </div>

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
