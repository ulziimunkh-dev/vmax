import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { authAPI } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const AppleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 170 170" fill="currentColor">
    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.13-1.9-14.35-6.08-3.48-2.83-7.4-7.57-11.77-14.23-7.5-11.41-13.15-24.12-16.96-38.12-3.8-14-5.71-26.96-5.71-38.87 0-14.56 3.6-26.77 10.79-36.63 7.2-9.87 16.42-14.88 27.67-15.04 4.57 0 9.77 1.18 15.6 3.55 5.82 2.37 9.87 3.55 12.14 3.55 1.95 0 6.09-1.24 12.42-3.73 6.33-2.49 11.63-3.61 15.91-3.37 11.85.98 21.03 5.34 27.56 13.08-10.43 6.31-15.54 15.34-15.33 27.09.22 9.13 3.7 16.74 10.44 22.84 6.74 6.1 14.89 9.38 24.46 9.84-2.39 7.07-5.75 14.55-10.08 22.45zM119.22 31.86c0-7.39 2.65-14.51 7.95-21.36 5.3-6.85 11.96-10.5 20-10.96.22.98.33 1.96.33 2.94 0 7.28-2.73 14.46-8.18 21.54-5.45 7.08-12.06 10.8-19.85 11.16-.07-1.1-.25-2.2-.25-3.32z"/>
  </svg>
);

const Login = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isAppleDevice = typeof window !== 'undefined' && /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);

  const handleGoogleAuth = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (typeof window === 'undefined' || (!(window as any).google?.accounts?.id && !(window as any).google?.accounts?.oauth2)) {
      setError('Google Identity Services ачаалагдаж байна. Түр хүлээнэ үү эсвэл хуудсаа дахин ачаална уу.');
      return;
    }

    if (!clientId) {
      setError('Google Client ID тохируулагдаагүй байна. .env файлд VITE_GOOGLE_CLIENT_ID-г оруулна уу.');
      return;
    }

    try {
      // 1. iOS Safari & Mobile Compatible OAuth2 Token Client
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

      // 2. ID Token Prompt Fallback
      (window as any).google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          if (!response?.credential) return;
          try {
            setLoading(true);
            setError('');
            const res = await authAPI.googleLogin(response.credential);
            const { user, access_token } = res.data;
            loginStore(user, access_token);
            navigate('/');
          } catch (err: any) {
            setError(err.response?.data?.message || 'Google-ээр нэвтрэхэд алдаа гарлаа.');
          } finally {
            setLoading(false);
          }
        },
      });

      (window as any).google.accounts.id.prompt();
    } catch {
      setError('Google нэвтрэлт эхлүүлэхэд алдаа гарлаа.');
    }
  };

  const handleAppleAuth = async () => {
    setError('');
    setLoading(true);

    try {
      // Initiate Apple Web Sign-In or native iOS Apple ID auth
      const mockAppleToken = 'apple_mock_id_token_demo';
      const response = await authAPI.appleLogin(mockAppleToken, {
        name: { firstName: 'iPhone', lastName: 'User' },
        email: 'iphone.user@icloud.com',
      });

      const { user, access_token } = response.data;
      loginStore(user, access_token);
      navigate('/');
    } catch {
      setError('Apple-аар нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу.');
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
      const response = await authAPI.login(formData);
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
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 pt-16">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full max-w-md p-8 rounded-2xl border-glow">
        <h2 className="text-3xl font-heading font-bold text-center mb-8 text-glow">{t.auth.login}</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {/* Apple Sign-In Button (Temporarily commented out until Apple Service ID setup)
          {(isAppleDevice || true) && (
            <button
              type="button"
              onClick={handleAppleAuth}
              className="w-full bg-black text-white text-white-force font-semibold py-3 rounded-xl flex items-center justify-center space-x-2 border border-white/20 hover:bg-slate-900 transition-all shadow-md active:scale-95"
            >
              <AppleIcon />
              <span className="text-white text-white-force">Apple-аар нэвтрэх</span>
            </button>
          )}
          */}

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full bg-white text-gray-900 border border-slate-200 font-medium py-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors shadow-sm active:scale-95 cursor-pointer"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            <span className="text-slate-800 font-semibold text-sm">{t.auth.continueGoogle}</span>
          </button>

          {/* Facebook Sign-In Button (Temporarily commented out until Facebook App Review)
          <button type="button" className="w-full bg-[#1877F2] text-white-force font-medium py-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-[#0c66db] transition-colors shadow-sm">
            <FacebookIcon />
            <span>{t.auth.continueFacebook}</span>
          </button>
          */}


          <div className="flex items-center py-4">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="px-4 text-nebula-text text-sm">{t.auth.or}</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              value={formData.password}
              onChange={handleChange}
              placeholder={t.auth.password}
              className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-starlight placeholder-nebula-text focus:outline-none focus:border-plasma focus:ring-1 focus:ring-plasma transition-all"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-plasma to-nova text-white-force font-medium py-3 rounded-xl hover:shadow-lg hover:shadow-plasma/30 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? '...' : t.auth.login}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-nebula-text text-sm">
          {t.auth.newUser} <Link to="/register" className="text-plasma font-semibold hover:underline transition-colors">{t.auth.register}</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
