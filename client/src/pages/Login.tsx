import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useI18n } from '@/i18n';
import { authAPI } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Phone,
  Mail,
  Lock,
  RefreshCw,
  CheckCircle2,
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react';

const Login = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetRedirect = searchParams.get('redirect') || '/';
  const loginStore = useAuthStore((state) => state.login);

  // Unified Password Login State (auto-detect phone or email)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password Reset / Forgot Password State
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [resetMethod, setResetMethod] = useState<'phone' | 'email'>('phone');
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [resetOtp, setResetOtp] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');
  const [maskedTarget, setMaskedTarget] = useState('');
  const [demoCode, setDemoCode] = useState<string | null>(null);

  // Responsive Google Sign-in button width
  const googleWrapperRef = useRef<HTMLDivElement>(null);
  const [googleWidth, setGoogleWidth] = useState<number>(340);

  useEffect(() => {
    const updateWidth = () => {
      if (googleWrapperRef.current) {
        const w = googleWrapperRef.current.offsetWidth;
        if (w > 0) {
          // Google GSI accepts width between 200 and 400
          setGoogleWidth(Math.max(200, Math.min(400, Math.floor(w))));
        }
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [isForgotMode]);

  // Determine if loginIdentifier looks like a phone number
  const isIdentifierPhone =
    !loginIdentifier.includes('@') &&
    (loginIdentifier.replace(/\D/g, '').length >= 3 || /^\d+$/.test(loginIdentifier.trim()));

  // Handle Password Login (Phone or Email + Password)
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      setError('Утасны дугаар эсвэл имэйл хаягаа оруулна уу.');
      return;
    }
    if (!password) {
      setError('Нууц үгээ оруулна уу.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({
        identifier: loginIdentifier.trim(),
        password,
      });
      const { user, access_token } = response.data;
      loginStore(user, access_token);
      navigate(targetRedirect);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (Array.isArray(msg)) {
        setError(msg.join(', '));
      } else if (typeof msg === 'string') {
        setError(msg);
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('Сервертэй холбогдож чадсангүй. Backend сервер (порт 5000) ажиллаж байгаа эсэхийг шалгана уу.');
      } else {
        setError('Утас/имэйл эсвэл нууц үг буруу байна.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Send Password Reset OTP
  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetIdentifier.trim()) {
      setError(resetMethod === 'phone' ? 'Утасны дугаараа оруулна уу.' : 'Имэйл хаягаа оруулна уу.');
      return;
    }

    setError('');
    setResetLoading(true);

    try {
      const res = await authAPI.sendPasswordResetOtp({
        method: resetMethod,
        identifier: resetIdentifier.trim(),
      });
      setMaskedTarget(res.data?.maskedTarget || resetIdentifier.trim());
      if (res.data?.demoCode) {
        setDemoCode(res.data.demoCode);
      }
      setResetStep(2);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(typeof msg === 'string' ? msg : 'Баталгаажуулах код илгээхэд алдаа гарлаа.');
    } finally {
      setResetLoading(false);
    }
  };

  // Handle Execute Password Reset
  const handleExecuteResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetOtp.trim()) {
      setError('6 оронтой баталгаажуулах кодоо оруулна уу.');
      return;
    }
    if (resetNewPassword.length < 6) {
      setError('Шинэ нууц үг хамгийн багадаа 6 тэмдэгттэй байх ёстой.');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setError('Шинэ нууц үг давталттайгаа таарахгүй байна.');
      return;
    }

    setError('');
    setResetLoading(true);

    try {
      const res = await authAPI.resetPassword({
        method: resetMethod,
        identifier: resetIdentifier.trim(),
        otp: resetOtp.trim(),
        newPassword: resetNewPassword,
      });
      setResetSuccessMsg(res.data?.message || 'Нууц үг амжилттай шинэчлэгдлээ!');
      setTimeout(() => {
        setIsForgotMode(false);
        setResetStep(1);
        setResetOtp('');
        setResetNewPassword('');
        setResetConfirmPassword('');
        setResetSuccessMsg('');
        setLoginIdentifier(resetIdentifier.trim());
        setPassword('');
      }, 2000);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(typeof msg === 'string' ? msg : 'Нууц үг шинэчлэхэд алдаа гарлаа.');
    } finally {
      setResetLoading(false);
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

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-3 sm:px-4 pt-16 pb-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-md p-5 sm:p-8 rounded-3xl border-glow"
      >
        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-xs sm:text-sm text-center font-medium">
            {error}
          </div>
        )}

        {/* --- PASSWORD RESET / FORGOT PASSWORD VIEW --- */}
        {isForgotMode ? (
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  setIsForgotMode(false);
                  setError('');
                  setResetStep(1);
                  setResetSuccessMsg('');
                }}
                className="p-1.5 rounded-lg text-nebula-text hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Буцах"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h3 className="text-xl font-heading font-black text-starlight">Нууц үг сэргээх</h3>
                <p className="text-xs text-nebula-text">Баталгаажуулах код ашиглан нууц үгээ шинэчлэх</p>
              </div>
            </div>

            {resetSuccessMsg ? (
              <div className="p-6 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-center space-y-3 my-4">
                <CheckCircle2 size={40} className="text-emerald-400 mx-auto" />
                <p className="text-sm font-bold text-emerald-200">{resetSuccessMsg}</p>
                <p className="text-xs text-nebula-text">Нэвтрэх цонх руу шилжиж байна...</p>
              </div>
            ) : resetStep === 1 ? (
              <form onSubmit={handleSendResetOtp} className="space-y-4">
                {/* Method Switcher: Phone vs Email */}
                <div className="grid grid-cols-2 p-1 bg-void/70 border border-white/10 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      setResetMethod('phone');
                      setError('');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                      resetMethod === 'phone'
                        ? 'bg-gradient-to-r from-plasma to-nova text-white shadow-md'
                        : 'text-nebula-text hover:text-starlight'
                    }`}
                  >
                    <Phone size={14} />
                    <span>Утасны дугаараар</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setResetMethod('email');
                      setError('');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                      resetMethod === 'email'
                        ? 'bg-gradient-to-r from-plasma to-nova text-white shadow-md'
                        : 'text-nebula-text hover:text-starlight'
                    }`}
                  >
                    <Mail size={14} />
                    <span>Имэйл хаягаар</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-nebula-text mb-1.5">
                    {resetMethod === 'phone' ? 'Бүртгэлтэй утасны дугаар' : 'Бүртгэлтэй имэйл хаяг'}
                  </label>
                  <div className="relative">
                    {resetMethod === 'phone' ? (
                      <Phone size={18} className="absolute left-3.5 top-3.5 text-nebula-text" />
                    ) : (
                      <Mail size={18} className="absolute left-3.5 top-3.5 text-nebula-text" />
                    )}
                    <input
                      type={resetMethod === 'phone' ? 'tel' : 'email'}
                      required
                      value={resetIdentifier}
                      onChange={(e) => setResetIdentifier(e.target.value)}
                      placeholder={resetMethod === 'phone' ? 'Жишээ: 99001122' : 'Жишээ: user@example.com'}
                      className="w-full bg-void/50 border border-white/15 rounded-xl py-3 pl-11 pr-4 text-starlight placeholder-nebula-text focus:outline-none focus:border-plasma focus:ring-1 focus:ring-plasma transition-all text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full bg-gradient-to-r from-plasma to-nova text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-plasma/30 transition-all duration-300 disabled:opacity-50 text-sm flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {resetLoading && <RefreshCw size={16} className="animate-spin" />}
                  <span>{resetLoading ? 'Илгээж байна...' : 'Баталгаажуулах код авах'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleExecuteResetPassword} className="space-y-4">
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs space-y-1">
                  <div className="text-nebula-text">Баталгаажуулах код илгээгдсэн хаяг:</div>
                  <div className="font-bold text-plasma font-mono text-sm">{maskedTarget}</div>
                  {demoCode && (
                    <div className="text-[11px] text-aurora font-mono pt-1 border-t border-white/10">
                      Тест код: {demoCode}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-nebula-text mb-1.5">
                    6 оронтой баталгаажуулах код
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Жишээ: 123456"
                    className="w-full bg-void/50 border border-white/15 rounded-xl py-3 px-4 text-starlight text-center font-mono text-lg tracking-widest placeholder-nebula-text focus:outline-none focus:border-plasma focus:ring-1 focus:ring-plasma transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-nebula-text mb-1.5">Шинэ нууц үг</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-3.5 text-nebula-text" />
                    <input
                      type="password"
                      required
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      placeholder="Дор хаяж 6 тэмдэгт"
                      className="w-full bg-void/50 border border-white/15 rounded-xl py-3 pl-11 pr-4 text-starlight placeholder-nebula-text focus:outline-none focus:border-plasma focus:ring-1 focus:ring-plasma transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-nebula-text mb-1.5">Шинэ нууц үг давтах</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-3.5 text-nebula-text" />
                    <input
                      type="password"
                      required
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      placeholder="Шинэ нууц үгээ дахин оруулна уу"
                      className="w-full bg-void/50 border border-white/15 rounded-xl py-3 pl-11 pr-4 text-starlight placeholder-nebula-text focus:outline-none focus:border-plasma focus:ring-1 focus:ring-plasma transition-all text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full bg-gradient-to-r from-plasma to-nova text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-plasma/30 transition-all duration-300 disabled:opacity-50 text-sm flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {resetLoading && <RefreshCw size={16} className="animate-spin" />}
                  <span>{resetLoading ? 'Шинэчилж байна...' : 'Нууц үг шинэчлэх'}</span>
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setResetStep(1);
                      setError('');
                    }}
                    className="text-xs text-nebula-text hover:text-plasma transition-colors cursor-pointer"
                  >
                    ← Кодоо дахин авах / Хаяг өөрчлөх
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* --- DIRECT PASSWORD LOGIN VIEW (No SMS tab) --- */
          <div>
            <h2 className="text-3xl font-heading font-black text-center mb-6 text-glow">{t.auth.login}</h2>

            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-nebula-text">
                    Утасны дугаар эсвэл Имэйл
                  </label>
                  <span className="text-[10px] text-plasma font-semibold flex items-center gap-1">
                    {isIdentifierPhone ? '📱 Утас танигдлаа' : '✉️ Имэйл танигдлаа'}
                  </span>
                </div>
                <div className="relative">
                  {isIdentifierPhone ? (
                    <Phone size={18} className="absolute left-3.5 top-3.5 text-plasma transition-colors" />
                  ) : (
                    <Mail size={18} className="absolute left-3.5 top-3.5 text-nebula-text transition-colors" />
                  )}
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="99001122 эсвэл name@example.com"
                    className="w-full bg-void/50 border border-white/15 rounded-xl py-3 pl-11 pr-4 text-starlight placeholder-nebula-text focus:outline-none focus:border-plasma focus:ring-1 focus:ring-plasma transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-nebula-text">{t.auth.password}</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotMode(true);
                      setError('');
                      setResetStep(1);
                      if (loginIdentifier.trim()) {
                        setResetIdentifier(loginIdentifier.trim());
                        setResetMethod(isIdentifierPhone ? 'phone' : 'email');
                      }
                    }}
                    className="text-xs text-plasma font-semibold hover:underline cursor-pointer"
                  >
                    Нууц үгээ мартсан уу?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-3.5 text-nebula-text" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.auth.password}
                    className="w-full bg-void/50 border border-white/15 rounded-xl py-3 pl-11 pr-11 text-starlight placeholder-nebula-text focus:outline-none focus:border-plasma focus:ring-1 focus:ring-plasma transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-nebula-text hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-plasma to-nova text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-plasma/30 transition-all duration-300 disabled:opacity-50 text-sm cursor-pointer flex items-center justify-center space-x-2"
              >
                {loading && <RefreshCw size={16} className="animate-spin" />}
                <span>{loading ? 'Нэвтэрч байна...' : t.auth.login}</span>
              </button>
            </form>

            {/* Google Login Alternative */}
            <div className="mt-6">
              <div className="flex items-center py-2 mb-4">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="px-3 text-nebula-text text-xs uppercase tracking-wider font-semibold">
                  {t.auth.or}
                </span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              <div
                ref={googleWrapperRef}
                className="w-full flex justify-center overflow-hidden [&_iframe]:!max-w-full"
              >
                <GoogleLogin
                  key={googleWidth}
                  onSuccess={async (credentialResponse) => {
                    if (credentialResponse.credential) {
                      await handleGoogleSuccess(credentialResponse.credential);
                    }
                  }}
                  onError={() => {
                    setError('Google нэвтрэлт амжилтгүй боллоо.');
                  }}
                  theme="outline"
                  size="large"
                  width={String(googleWidth)}
                  text="continue_with"
                  shape="rectangular"
                />
              </div>
            </div>

            <p className="mt-6 text-center text-nebula-text text-xs sm:text-sm">
              {t.auth.newUser}{' '}
              <Link to="/register" className="text-plasma font-bold hover:underline transition-colors">
                {t.auth.register}
              </Link>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
