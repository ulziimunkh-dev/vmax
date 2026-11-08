import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useI18n } from '@/i18n';
import { authAPI } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { Phone, Mail, Lock, Smartphone, RefreshCw, CheckCircle2, MessageSquare, ArrowLeft } from 'lucide-react';

const Login = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetRedirect = searchParams.get('redirect') || '/';
  const loginStore = useAuthStore((state) => state.login);

  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');

  // Phone Login State
  const [phone, setPhone] = useState('');
  const [phoneSession, setPhoneSession] = useState<{
    sessionId: string;
    shortcode: string;
    text: string;
    smsUri: string;
    displayInstruction: string;
    expiresAt: string;
    isSandbox?: boolean;
  } | null>(null);
  const [phoneVerifiedSuccess, setPhoneVerifiedSuccess] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);

  // Email Login State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 3-second Polling for Phone Login Session Verification
  useEffect(() => {
    let pollTimer: any;

    if (phoneSession?.sessionId && !phoneVerifiedSuccess) {
      pollTimer = setInterval(async () => {
        try {
          const res = await authAPI.checkPhoneLoginSession(phoneSession.sessionId);
          if (res.data?.sessionStatus === 'VERIFIED') {
            setPhoneVerifiedSuccess(true);
            const { user, access_token } = res.data;
            if (user && access_token) {
              loginStore(user, access_token);
              setTimeout(() => {
                navigate(targetRedirect);
              }, 1200);
            }
          } else if (res.data?.sessionStatus === 'EXPIRED') {
            setError('Баталгаажуулах сессийн хугацаа дууссан байна. Дахин оролдоно уу.');
            setPhoneSession(null);
          }
        } catch (err: any) {
          console.error('Phone login polling error:', err);
        }
      }, 3000);
    }

    return () => {
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [phoneSession, phoneVerifiedSuccess, targetRedirect, loginStore, navigate]);

  const handleStartPhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      setError('Утасны дугаар буруу байна. 8 оронтой дугаар оруулна уу.');
      return;
    }

    setError('');
    setPhoneLoading(true);
    try {
      const res = await authAPI.createPhoneLoginSession(cleanPhone);
      setPhoneSession(res.data);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (Array.isArray(msg)) {
        setError(msg.join(', '));
      } else if (typeof msg === 'string') {
        setError(msg);
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('Сервертэй холбогдож чадсангүй. Backend сервер (порт 5000) ажиллаж байгаа эсэхийг шалгана уу.');
      } else {
        setError(err.message || 'Баталгаажуулах хүсэлт үүсгэхэд алдаа гарлаа.');
      }
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleSandboxApprove = async () => {
    if (!phoneSession?.sessionId) return;
    setPhoneLoading(true);
    try {
      const res = await authAPI.sandboxApprovePhoneLogin(phoneSession.sessionId);
      if (res.data?.sessionStatus === 'VERIFIED') {
        setPhoneVerifiedSuccess(true);
        const { user, access_token } = res.data;
        if (user && access_token) {
          loginStore(user, access_token);
          setTimeout(() => {
            navigate(targetRedirect);
          }, 1000);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Тест баталгаажуулалтад алдаа гарлаа.');
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleGoogleSuccess = async (token: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.googleLogin(token);
      const { user, access_token } = res.data;
      loginStore(user, access_token);
      navigate(targetRedirect);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (Array.isArray(msg)) {
        setError(msg.join(', '));
      } else if (typeof msg === 'string') {
        setError(msg);
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('Сервертэй холбогдож чадсангүй (Network Error). Backend сервер (порт 5000) ажиллаж байгаа эсэхийг шалгана уу.');
      } else {
        setError(err.message || 'Google-ээр нэвтрэхэд алдаа гарлаа.');
      }
    } finally {
      setLoading(false);
    }
  };

  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      if (tokenResponse?.access_token) {
        handleGoogleSuccess(tokenResponse.access_token);
      }
    },
    onError: (errorResponse: any) => {
      if (errorResponse?.error === 'popup_closed_by_user') {
        return;
      }
      setError(`Google нэвтрэлт амжилтгүй боллоо: ${errorResponse?.error_description || errorResponse?.error || 'Цонх хаагдсан эсвэл зөвшөөрөл олгосонгүй'}`);
    },
  });

  const handleGoogleAuth = () => {
    setError('');
    try {
      triggerGoogleLogin();
    } catch {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2 && clientId) {
        const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          callback: (tokenResponse: any) => {
            if (tokenResponse?.access_token) {
              handleGoogleSuccess(tokenResponse.access_token);
            }
          },
        });
        tokenClient.requestAccessToken({ prompt: 'consent' });
      } else {
        setError('Google нэвтрэлт эхлүүлэхэд алдаа гарлаа. Хуудсаа дахин ачаална уу.');
      }
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
      navigate(targetRedirect);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (Array.isArray(msg)) {
        setError(msg.join(', '));
      } else if (typeof msg === 'string') {
        setError(msg);
      } else {
        setError('Нэвтрэхэд алдаа гарлаа. Мэдээллээ шалгаад дахин оролдоно уу.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 pt-16 pb-12">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full max-w-md p-6 sm:p-8 rounded-3xl border-glow">
        <h2 className="text-3xl font-heading font-black text-center mb-6 text-glow">{t.auth.login}</h2>

        {error && (
          <div className="mb-5 p-3.5 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-xs sm:text-sm text-center font-medium">
            {error}
          </div>
        )}

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-void/70 border border-white/10 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('phone');
              setError('');
            }}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-1.5 transition-all ${
              authMethod === 'phone'
                ? 'bg-gradient-to-r from-plasma to-nova text-white shadow-md'
                : 'text-nebula-text hover:text-starlight'
            }`}
          >
            <Smartphone size={16} />
            <span>{t.auth.phoneLoginTab}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod('email');
              setError('');
            }}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-1.5 transition-all ${
              authMethod === 'email'
                ? 'bg-gradient-to-r from-plasma to-nova text-white shadow-md'
                : 'text-nebula-text hover:text-starlight'
            }`}
          >
            <Mail size={16} />
            <span>{t.auth.emailLoginTab}</span>
          </button>
        </div>

        {/* --- Phone Login Flow --- */}
        {authMethod === 'phone' && (
          <div className="space-y-4">
            {!phoneSession ? (
              <form onSubmit={handleStartPhoneLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-nebula-text mb-1.5">
                    {t.auth.phone} (MO SMS Баталгаажуулалт)
                  </label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3.5 top-3.5 text-plasma" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t.auth.phonePlaceholder}
                      className="w-full bg-void/50 border border-white/15 rounded-xl py-3 pl-11 pr-4 text-starlight placeholder-nebula-text focus:outline-none focus:border-plasma focus:ring-1 focus:ring-plasma transition-all text-sm font-mono tracking-wide"
                    />
                  </div>
                  <p className="text-[11px] text-nebula-text mt-1.5 leading-relaxed">
                    Утасны дугаараа оруулаад 144773 тусгай дугаарт мессеж илгээн шууд нууц үггүйгээр баталгаажуулж нэвтэрнэ.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={phoneLoading}
                  className="w-full bg-gradient-to-r from-plasma to-nova text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-plasma/30 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2 text-sm"
                >
                  {phoneLoading ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : (
                    <MessageSquare size={18} />
                  )}
                  <span>{phoneLoading ? 'Уншиж байна...' : t.auth.sendSmsCode}</span>
                </button>
              </form>
            ) : (
              /* Verify.mn MO SMS Prompt Box */
              <div className="p-5 bg-void/80 border border-plasma/40 rounded-2xl space-y-4 text-center">
                {phoneVerifiedSuccess ? (
                  <div className="py-6 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40 animate-bounce">
                      <CheckCircle2 size={36} />
                    </div>
                    <h3 className="text-lg font-bold text-starlight">{t.auth.verifiedPhoneSuccess}</h3>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <span className="text-xs font-bold text-plasma flex items-center space-x-1.5">
                        <Smartphone size={16} />
                        <span>{t.auth.sendSmsInstruction}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setPhoneSession(null);
                          setError('');
                        }}
                        className="text-xs text-nebula-text hover:text-white flex items-center space-x-1 transition-colors"
                      >
                        <ArrowLeft size={12} />
                        <span>{t.auth.changePhone}</span>
                      </button>
                    </div>

                    <p className="text-xs text-nebula-text leading-relaxed">
                      {t.auth.verifySmsDesc}
                    </p>

                    <div className="bg-plasma/10 border border-plasma/30 rounded-xl p-3.5 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-nebula-text">{t.auth.shortcodeLabel}</span>
                        <span className="text-starlight font-black text-sm font-mono tracking-wider bg-white/10 px-2 py-0.5 rounded">
                          {phoneSession.shortcode}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-nebula-text">{t.auth.textLabel}</span>
                        <span className="text-plasma font-black text-base font-mono tracking-widest bg-plasma/20 px-3 py-1 rounded-lg border border-plasma/40">
                          {phoneSession.text}
                        </span>
                      </div>
                    </div>

                    {/* Mobile SMS button */}
                    <a
                      href={phoneSession.smsUri}
                      className="w-full inline-flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-plasma to-nova text-white font-bold rounded-xl shadow-md hover:shadow-plasma/30 transition-all text-xs sm:text-sm"
                    >
                      <MessageSquare size={16} />
                      <span>{t.auth.openSmsApp}</span>
                    </a>

                    {/* Polling Indicator */}
                    <div className="flex items-center justify-center space-x-2 text-[11px] text-cyan-300 py-1">
                      <RefreshCw size={14} className="animate-spin text-cyan-400" />
                      <span>{t.auth.waitingSms}</span>
                    </div>

                    {/* Sandbox / Dev Fast Track */}
                    <button
                      type="button"
                      onClick={handleSandboxApprove}
                      disabled={phoneLoading}
                      className="w-full py-2 bg-white/5 hover:bg-white/10 border border-dashed border-white/20 rounded-xl text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors"
                    >
                      {t.auth.sandboxApprove}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- Email Login Flow --- */}
        {authMethod === 'email' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-nebula-text mb-1.5">{t.auth.email}</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-3.5 text-nebula-text" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t.auth.email}
                  className="w-full bg-void/50 border border-white/15 rounded-xl py-3 pl-11 pr-4 text-starlight placeholder-nebula-text focus:outline-none focus:border-plasma focus:ring-1 focus:ring-plasma transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-nebula-text mb-1.5">{t.auth.password}</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-3.5 text-nebula-text" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t.auth.password}
                  className="w-full bg-void/50 border border-white/15 rounded-xl py-3 pl-11 pr-4 text-starlight placeholder-nebula-text focus:outline-none focus:border-plasma focus:ring-1 focus:ring-plasma transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-plasma to-nova text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-plasma/30 transition-all duration-300 disabled:opacity-50 text-sm"
            >
              {loading ? '...' : t.auth.login}
            </button>
          </form>
        )}

        {/* Google Login Alternative */}
        <div className="mt-6">
          <div className="flex items-center py-2 mb-4">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="px-3 text-nebula-text text-xs uppercase tracking-wider font-semibold">{t.auth.or}</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full bg-white text-gray-900 border border-slate-200 font-semibold py-3 rounded-xl flex items-center justify-center space-x-2.5 hover:bg-gray-50 transition-colors shadow-sm active:scale-95 cursor-pointer text-xs sm:text-sm"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            <span className="text-slate-800 font-semibold">{t.auth.continueGoogle}</span>
          </button>
        </div>

        <p className="mt-6 text-center text-nebula-text text-xs sm:text-sm">
          {t.auth.newUser}{' '}
          <Link to="/register" className="text-plasma font-bold hover:underline transition-colors">
            {t.auth.register}
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
