import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  User,
  Phone,
  Mail,
  Edit2,
  Save,
  X,
  Image as ImageIcon,
  Heart,
  History,
  Camera,
  Upload,
  ShieldCheck,
  CheckCircle2,
  BadgeCheck,
  Sparkles,
  Building2,
  Smartphone,
  LayoutDashboard,
  Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { authAPI, listingsAPI, uploadAPI } from '@/services/api';
import { useI18n } from '@/i18n';
import ListingCard from '@/components/listings/ListingCard';
import { useFavorites } from '@/hooks/useFavorites';
import { useRecentVisits } from '@/hooks/useRecentVisits';
import { getImageUrl } from '@/utils/imageUrl';

const Profile = () => {
  const { user, setUser } = useAuthStore();
  const { t } = useI18n();
  const { favorites } = useFavorites();
  const { recentVisits } = useRecentVisits();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'myAds' | 'favorites' | 'recent'>('myAds');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [listings, setListings] = useState<any[]>([]);

  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [agencyNameInput, setAgencyNameInput] = useState(user?.agencyName || '');
  const [agentLicenseInput, setAgentLicenseInput] = useState(user?.agentLicenseNo || '');
  const [submittingAgentReq, setSubmittingAgentReq] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);

  // Verify.mn MO SMS Verification State
  const [showPhoneOtpModal, setShowPhoneOtpModal] = useState(false);
  const [sessionData, setSessionData] = useState<{
    sessionId: string;
    shortcode: string;
    text: string;
    smsUri: string;
    displayInstruction: string;
    expiresAt: string;
    isSandbox?: boolean;
  } | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [isVerifiedSuccess, setIsVerifiedSuccess] = useState(false);

  // 3-second Polling for Verify.mn Session Status
  useEffect(() => {
    let pollTimer: any;

    if (showPhoneOtpModal && sessionData?.sessionId && !isVerifiedSuccess) {
      pollTimer = setInterval(async () => {
        try {
          const res = await authAPI.checkPhoneSession(sessionData.sessionId);
          if (res.data?.sessionStatus === 'VERIFIED') {
            setIsVerifiedSuccess(true);
            setUser({ ...user!, isPhoneVerified: true });
            setMessage('🎉 Утасны дугаар амжилттай баталгаажлаа!');
            setTimeout(() => {
              setShowPhoneOtpModal(false);
              setSessionData(null);
              setIsVerifiedSuccess(false);
            }, 3000);
          } else if (res.data?.sessionStatus === 'EXPIRED') {
            setOtpError('Хугацаа дууссан байна. Дахин оролдоно уу.');
          }
        } catch (err: any) {
          console.error('Verify.mn polling error:', err);
        }
      }, 3000);
    }

    return () => {
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [showPhoneOtpModal, sessionData, isVerifiedSuccess, user]);

  const handleStartPhoneOtp = async () => {
    if (!user?.phone) {
      setMessage('Эхлээд профайл дээрээ утасны дугаараа хадгална уу.');
      return;
    }
    setVerifyingPhone(true);
    setOtpError('');
    setIsVerifiedSuccess(false);
    try {
      const res = await authAPI.createPhoneSession();
      setSessionData(res.data);
      setShowPhoneOtpModal(true);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Баталгаажуулах хүсэлт үүсгэхэд алдаа гарлаа');
    } finally {
      setVerifyingPhone(false);
    }
  };

  const handleSimulateVerify = async () => {
    setOtpLoading(true);
    try {
      await authAPI.verifyPhone(undefined, user?.phone);
      setIsVerifiedSuccess(true);
      if (user) {
        setUser({ ...user, isPhoneVerified: true });
      }
      setMessage('🎉 Утасны дугаар амжилттай баталгаажлаа!');
      setTimeout(() => {
        setShowPhoneOtpModal(false);
        setSessionData(null);
        setIsVerifiedSuccess(false);
      }, 2000);
    } catch (err: any) {
      setOtpError('Баталгаажуулахад алдаа гарлаа');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    setVerifyingEmail(true);
    try {
      const res = await authAPI.verifyEmail();
      setUser({ ...user!, isEmailVerified: true });
      setMessage(res.data?.message || 'Имэйл амжилттай баталгаажлаа.');
      setTimeout(() => setMessage(''), 4000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Баталгаажуулахад алдаа гарлаа');
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleAgentVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyNameInput || !agentLicenseInput) {
      setMessage('Бүх талбарыг бөглөнө үү.');
      return;
    }
    setSubmittingAgentReq(true);
    try {
      const res = await authAPI.requestAgentVerification({
        agencyName: agencyNameInput,
        agentLicenseNo: agentLicenseInput,
      });
      setUser({
        ...user!,
        agencyName: agencyNameInput,
        agentLicenseNo: agentLicenseInput,
        agentVerificationStatus: 'PENDING',
      });
      setShowAgentModal(false);
      setMessage(res.data?.message || 'Агент баталгаажуулах хүсэлт илгээгдлээ.');
      setTimeout(() => setMessage(''), 5000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Хүсэлт илгээхэд алдаа гарлаа');
    } finally {
      setSubmittingAgentReq(false);
    }
  };

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({ name: user.name, phone: user.phone || '' });
    }
  }, [user, reset]);

  useEffect(() => {
    const fetchFreshProfile = async () => {
      try {
        const res = await authAPI.getProfile();
        if (res.data) {
          setUser(res.data);
        }
      } catch (err) {
        console.error('Error refreshing profile:', err);
      }
    };
    fetchFreshProfile();

    const fetchListings = async () => {
      try {
        const res = await listingsAPI.getMy();
        setListings(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchListings();
  }, [setUser]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setMessage('');

    try {
      // 1. Upload to API
      let finalAvatarUrl = '';
      try {
        const uploadRes = await uploadAPI.uploadAvatar(file);
        if (uploadRes.data?.url) {
          finalAvatarUrl = uploadRes.data.url;
        }
      } catch (uploadErr) {
        console.warn('API avatar upload failed, falling back to preview', uploadErr);
      }

      if (!finalAvatarUrl) {
        finalAvatarUrl = URL.createObjectURL(file);
      }

      setAvatarPreview(finalAvatarUrl);

      // 2. Update User Profile on Backend
      const updateRes = await authAPI.updateProfile({
        name: user?.name,
        phone: user?.phone,
        avatar: finalAvatarUrl,
        avatarUrl: finalAvatarUrl,
      });

      if (updateRes.data) {
        const updated = updateRes.data;
        setUser({
          ...user,
          ...updated,
          avatar: updated.avatar || updated.avatarUrl || finalAvatarUrl,
          avatarUrl: updated.avatarUrl || updated.avatar || finalAvatarUrl,
        });
      } else {
        setUser({
          ...user!,
          avatar: finalAvatarUrl,
          avatarUrl: finalAvatarUrl,
        });
      }

      setMessage(t.profile.updated);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Avatar upload failed', err);
      setMessage(t.common.error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    setMessage('');
    try {
      const res = await authAPI.updateProfile({
        ...data,
        avatar: avatarPreview || user?.avatar || user?.avatarUrl,
      });
      setUser(res.data || { ...user!, ...data });
      setIsEditing(false);
      setMessage(t.profile.updated);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const currentAvatar = getImageUrl(avatarPreview || user?.avatar || user?.avatarUrl);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-7xl mx-auto">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <motion.div variants={itemVariants} className="flex justify-between items-center">
          <h1 className="text-3xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-plasma to-aurora">
            {t.profile.title}
          </h1>
          {message && (
            <div className="px-4 py-2 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/50 rounded-lg font-medium">
              {message}
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info Card */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="glass-card p-6 rounded-2xl border border-white/10 backdrop-blur-md relative overflow-hidden group">

              {/* Hidden File Input for Avatar Upload */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />

              <div className="flex flex-col items-center mb-8 relative z-10">
                {/* Interactive Avatar Upload Container */}
                <div
                  className="relative group cursor-pointer mb-4"
                  onClick={() => fileInputRef.current?.click()}
                  title="Зураг солих (Upload Photo)"
                >
                  <div className="w-24 h-24 rounded-full bg-cosmic border-2 border-aurora flex items-center justify-center overflow-hidden shadow-lg relative">
                    {currentAvatar ? (
                      <img src={currentAvatar} alt={user?.name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={40} className="text-aurora" />
                    )}
                    {uploadingAvatar && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                        <Upload size={24} className="animate-bounce text-plasma" />
                      </div>
                    )}
                  </div>

                  {/* Camera overlay icon */}
                  <div className="absolute bottom-0 right-0 p-2 bg-plasma text-white rounded-full shadow-lg border border-white/20 hover:scale-110 transition-transform">
                    <Camera size={14} />
                  </div>
                </div>

                <h2 className="text-xl font-bold text-starlight">{user?.name}</h2>
                <p className="text-nebula-text text-sm">{user?.email}</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 text-xs text-plasma hover:underline font-medium flex items-center space-x-1"
                >
                  <Camera size={12} />
                  <span>Профайл зураг солих</span>
                </button>
              </div>

              {!isEditing ? (
                <div className="space-y-4 relative z-10">
                  {/* Name */}
                  <div className="flex items-center space-x-3 text-starlight bg-void/50 p-3 rounded-xl border border-white/5">
                    <User size={18} className="text-plasma flex-shrink-0" />
                    <span className="font-semibold">{user?.name}</span>
                  </div>

                  {/* Email with Verification */}
                  <div className="flex items-center justify-between text-starlight bg-void/50 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <Mail size={18} className="text-plasma flex-shrink-0" />
                      <span className="text-xs sm:text-sm truncate">{user?.email}</span>
                    </div>
                    {user?.isEmailVerified ? (
                      <span className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[11px] font-bold border border-emerald-500/30 flex-shrink-0">
                        <CheckCircle2 size={12} />
                        <span>Баталгаажсан</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleVerifyEmail}
                        disabled={verifyingEmail}
                        className="px-2 py-0.5 rounded-md bg-plasma/20 hover:bg-plasma text-plasma hover:text-white text-[11px] font-bold transition-all border border-plasma/40 flex-shrink-0"
                      >
                        {verifyingEmail ? '...' : 'Баталгаажуулах'}
                      </button>
                    )}
                  </div>

                  {/* Phone with Verification */}
                  <div className="flex items-center justify-between text-starlight bg-void/50 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <Phone size={18} className="text-plasma flex-shrink-0" />
                      <span className="text-xs sm:text-sm">{user?.phone || 'Оруулаагүй байна'}</span>
                    </div>
                    {user?.phone ? (
                      user.isPhoneVerified ? (
                        <span className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[11px] font-bold border border-emerald-500/30 flex-shrink-0">
                          <CheckCircle2 size={12} />
                          <span>Баталгаажсан</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleStartPhoneOtp}
                          disabled={verifyingPhone}
                          className="px-2 py-0.5 rounded-md bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-white text-[11px] font-bold transition-all border border-amber-500/40 flex-shrink-0"
                        >
                          {verifyingPhone ? '...' : 'Баталгаажуулах'}
                        </button>
                      )
                    ) : null}
                  </div>

                  {/* Agent Verification Status Badge */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-cosmic to-void border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ShieldCheck size={18} className={user?.isVerifiedAgent ? 'text-amber-400' : 'text-nebula-text'} />
                        <span className="text-xs font-bold text-starlight">Агентын статус</span>
                      </div>
                      {user?.isVerifiedAgent || user?.subscriptionTier === 'PRO_AGENT' || user?.subscriptionTier === 'AGENCY' ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase flex items-center space-x-1">
                          <BadgeCheck size={12} />
                          <span>Баталгаажсан Агент</span>
                        </span>
                      ) : user?.agentVerificationStatus === 'PENDING' ? (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold">
                          ⏳ Хүсэлт шалгагдаж байна
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-nebula-text text-[10px] font-semibold">
                          Хэрэглэгч
                        </span>
                      )}
                    </div>

                    {!user?.isVerifiedAgent && user?.subscriptionTier !== 'PRO_AGENT' && user?.subscriptionTier !== 'AGENCY' && (
                      <button
                        type="button"
                        onClick={() => setShowAgentModal(true)}
                        className="w-full py-2 bg-gradient-to-r from-plasma/20 to-nova/20 hover:from-plasma hover:to-nova text-plasma hover:text-white border border-plasma/30 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-sm"
                      >
                        <Sparkles size={14} />
                        <span>🛡️ Агент баталгаажуулах хүсэлт илгээх</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full mt-4 py-3 bg-void/50 hover:bg-plasma/20 text-starlight rounded-xl border border-white/10 flex items-center justify-center space-x-2 transition-all hover:border-plasma/50 font-medium text-sm"
                  >
                    <Edit2 size={16} />
                    <span>{t.profile.editProfile}</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative z-10">
                  <div>
                    <label className="block text-sm text-nebula-text mb-1">{t.profile.name}</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-3.5 text-nebula-text" />
                      <input
                        {...register('name', { required: true })}
                        className="w-full bg-void/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-starlight focus:outline-none focus:border-plasma focus:ring-1 focus:ring-plasma transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-nebula-text mb-1">{t.profile.phone}</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-3.5 text-nebula-text" />
                      <input
                        {...register('phone')}
                        placeholder="Жишээ: 99118888"
                        className="w-full bg-void/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-starlight focus:outline-none focus:border-plasma focus:ring-1 focus:ring-plasma transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 mt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 bg-gradient-to-r from-plasma to-nova text-white-force font-medium rounded-lg flex items-center justify-center space-x-2 hover:shadow-lg transition-all text-sm"
                    >
                      <Save size={16} />
                      <span>{t.profile.save}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-3 bg-void/50 hover:bg-plasma/20 text-starlight font-medium rounded-lg border border-white/10 flex items-center justify-center space-x-2 transition-all text-sm"
                    >
                      <X size={16} />
                      <span>{t.profile.cancel}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>

          {/* Listings & Favorites Tab Section */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            <div className="flex space-x-2 bg-nebula p-2 rounded-xl border border-white/10">
              <button
                onClick={() => setActiveTab('myAds')}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'myAds'
                    ? 'bg-gradient-to-r from-plasma to-nova text-white-force shadow-lg'
                    : 'text-nebula-text hover:text-plasma hover:bg-white/5'
                }`}
              >
                <ImageIcon size={16} />
                <span>{t.profile.myAds} ({listings.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('favorites')}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'favorites'
                    ? 'bg-gradient-to-r from-plasma to-nova text-white-force shadow-lg'
                    : 'text-nebula-text hover:text-plasma hover:bg-white/5'
                }`}
              >
                <Heart size={16} className="text-red-400" />
                <span>{t.profile.favorites} ({favorites.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('recent')}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'recent'
                    ? 'bg-gradient-to-r from-plasma to-nova text-white-force shadow-lg'
                    : 'text-nebula-text hover:text-plasma hover:bg-white/5'
                }`}
              >
                <History size={16} className="text-aurora" />
                <span>{t.share.recentVisits} ({recentVisits.length})</span>
              </button>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/10 backdrop-blur-md min-h-[500px]">
              {activeTab === 'myAds' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
                    <div className="text-xs text-nebula-text">
                      Нийт <span className="text-starlight font-bold">{listings.length}</span> зар оруулсан байна.
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to="/dashboard"
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-plasma/20 hover:bg-plasma/30 text-plasma text-xs font-bold transition-all border border-plasma/30"
                      >
                        <LayoutDashboard size={14} />
                        <span>Хянах самбар (Удирдах)</span>
                      </Link>
                      <Link
                        to="/create-listing"
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-starlight text-xs font-semibold transition-all border border-white/10"
                      >
                        <Plus size={14} />
                        <span>Шинэ зар</span>
                      </Link>
                    </div>
                  </div>

                  {listings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {listings.map((listing, idx) => (
                        <ListingCard key={listing.id || listing._id || idx} listing={listing} index={idx} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-nebula-text space-y-3">
                      <ImageIcon size={48} className="opacity-50" />
                      <p>{t.dashboard.noListings}</p>
                      <Link
                        to="/create-listing"
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-plasma to-nova text-white text-xs font-bold shadow-md"
                      >
                        + Анхны зараа нийтлэх
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'favorites' && (
                favorites.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {favorites.map((listing, idx) => (
                      <ListingCard key={listing.id || (listing as any)._id || idx} listing={listing} index={idx} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-nebula-text">
                    <Heart size={48} className="mb-4 opacity-30 text-red-400" />
                    <p>{t.share.noFavorites}</p>
                  </div>
                )
              )}

              {activeTab === 'recent' && (
                recentVisits.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recentVisits.map((listing, idx) => (
                      <ListingCard key={listing.id || (listing as any)._id || idx} listing={listing} index={idx} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-nebula-text">
                    <History size={48} className="mb-4 opacity-30 text-aurora" />
                    <p>{t.share.noRecentVisits}</p>
                  </div>
                )
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
      {/* Agent Verification Modal */}
      {showAgentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md glass-card bg-void border border-plasma/40 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="text-amber-400" size={22} />
                <h3 className="text-base font-bold text-starlight">Агент баталгаажуулах хүсэлт</h3>
              </div>
              <button
                onClick={() => setShowAgentModal(false)}
                className="p-1 rounded-lg text-nebula-text hover:text-white hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-nebula-text leading-relaxed">
              Үл хөдлөх хөрөнгийн зуучлалын байгууллага болон агентын гэрчилгээгээ баталгаажуулснаар таны бүх зар дээр{' '}
              <strong className="text-amber-300">🛡️ Баталгаажсан Агент</strong> тэмдэг харагдаж, хэрэглэгчдийн итгэлийг
              нэмэгдүүлнэ.
            </p>

            <form onSubmit={handleAgentVerificationSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-starlight mb-1">
                  Харьяалагдах компани / Агентлаг
                </label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3 top-3 text-nebula-text" />
                  <input
                    type="text"
                    required
                    value={agencyNameInput}
                    onChange={(e) => setAgencyNameInput(e.target.value)}
                    placeholder="Жишээ: RE/MAX Diamond, Century 21"
                    className="w-full bg-void/60 border border-white/15 rounded-xl py-2.5 pl-9 pr-3 text-starlight text-xs focus:outline-none focus:border-plasma focus:ring-1 focus:ring-plasma"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-starlight mb-1">
                  Зуучлалын лиценз / Сертификатын дугаар
                </label>
                <div className="relative">
                  <BadgeCheck size={16} className="absolute left-3 top-3 text-nebula-text" />
                  <input
                    type="text"
                    required
                    value={agentLicenseInput}
                    onChange={(e) => setAgentLicenseInput(e.target.value)}
                    placeholder="Жишээ: RE-2024-8899"
                    className="w-full bg-void/60 border border-white/15 rounded-xl py-2.5 pl-9 pr-3 text-starlight text-xs focus:outline-none focus:border-plasma focus:ring-1 focus:ring-plasma"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="submit"
                  disabled={submittingAgentReq}
                  className="flex-1 py-2.5 bg-gradient-to-r from-plasma via-nova to-aurora text-white-force font-bold rounded-xl text-xs hover:shadow-lg hover:shadow-plasma/30 transition-all flex items-center justify-center space-x-1.5"
                >
                  <ShieldCheck size={14} />
                  <span>{submittingAgentReq ? 'Илгээж байна...' : 'Хүсэлт илгээх'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAgentModal(false)}
                  className="px-4 py-2.5 bg-void/50 hover:bg-white/10 text-starlight text-xs font-semibold rounded-xl border border-white/10 transition-all"
                >
                  Болих
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Verify.mn MO SMS Verification Modal */}
      {showPhoneOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card max-w-sm w-full p-6 rounded-2xl border border-plasma/40 bg-cosmic shadow-2xl relative"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-plasma/20 text-plasma">
                  <Phone size={18} />
                </div>
                <h3 className="text-base font-bold text-starlight">Утасны дугаар баталгаажуулах</h3>
              </div>
              <button
                onClick={() => setShowPhoneOtpModal(false)}
                className="text-nebula-text hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {isVerifiedSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="text-lg font-bold text-emerald-400">Амжилттай баталгаажлаа!</h4>
                <p className="text-xs text-nebula-text">Таны {user?.phone} дугаар баталгаажлаа.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 bg-void/80 border border-white/10 rounded-xl text-center space-y-2">
                  <p className="text-xs text-nebula-text">Доорх тусгай дугаарт код илгээнэ үү:</p>
                  <div className="text-xl font-bold font-mono text-aurora">
                    Дугаар: <span className="text-white">144773</span>
                  </div>
                  <div className="text-2xl font-black font-mono tracking-widest text-plasma bg-plasma/10 py-2 rounded-lg border border-plasma/20">
                    {sessionData?.text || '...'}
                  </div>
                </div>

                {/* 1-Tap Mobile SMS Trigger Link */}
                {sessionData?.smsUri && (
                  <a
                    href={sessionData.smsUri}
                    className="w-full py-3 bg-gradient-to-r from-plasma to-nova text-white-force font-bold rounded-xl text-xs hover:shadow-lg hover:shadow-plasma/30 transition-all flex items-center justify-center space-x-2 text-center"
                  >
                    <Smartphone size={16} />
                    <span>📱 Мессеж илгээх (SMS нээх)</span>
                  </a>
                )}

                <div className="flex items-center justify-center space-x-2 py-2 text-xs text-amber-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  <span>SMS хүлээж байна (3 секунд тутам шалгаж байна)...</span>
                </div>

                {otpError && (
                  <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-semibold text-center">
                    ⚠️ {otpError}
                  </div>
                )}

                {/* Sandbox fallback action for dev */}
                {sessionData?.isSandbox && (
                  <div className="pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={handleSimulateVerify}
                      disabled={otpLoading}
                      className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white rounded-xl text-xs font-bold border border-emerald-500/30 transition-all"
                    >
                      {otpLoading ? '...' : '🧪 [Тест горим] Шууд баталгаажуулах'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Profile;
