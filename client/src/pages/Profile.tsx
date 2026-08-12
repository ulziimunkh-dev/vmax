import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { User, Phone, Mail, Edit2, Save, X, Image as ImageIcon } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { authAPI, listingsAPI } from '@/services/api';
import { useI18n } from '@/i18n';
import ListingCard from '@/components/listings/ListingCard';

const Profile = () => {
  const { user, setUser } = useAuthStore();
  const { t } = useI18n();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [listings, setListings] = useState<any[]>([]);

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
    const fetchListings = async () => {
      try {
        const res = await listingsAPI.getMy();
        setListings(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchListings();
  }, []);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setMessage('');
    try {
      const res = await authAPI.updateProfile(data);
      setUser(res.data);
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

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-7xl mx-auto">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <motion.div variants={itemVariants} className="flex justify-between items-center">
          <h1 className="text-3xl font-space font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-aurora to-accent-nova">
            {t.profile.title}
          </h1>
          {message && (
            <div className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/50 rounded-lg">
              {message}
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info Card */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="bg-bg-nebula p-6 rounded-2xl border border-white/10 backdrop-blur-md relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-plasma/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex flex-col items-center mb-8 relative z-10">
                <div className="w-24 h-24 rounded-full bg-bg-cosmic border-2 border-accent-aurora flex items-center justify-center mb-4 overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} className="text-accent-aurora" />
                  )}
                </div>
                <h2 className="text-xl font-bold text-text-starlight">{user?.name}</h2>
                <p className="text-text-nebula text-sm">{user?.email}</p>
              </div>

              {!isEditing ? (
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center space-x-3 text-text-starlight bg-bg-cosmic/50 p-3 rounded-lg border border-white/5">
                    <User size={18} className="text-accent-plasma" />
                    <span>{user?.name}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-text-starlight bg-bg-cosmic/50 p-3 rounded-lg border border-white/5">
                    <Mail size={18} className="text-accent-plasma" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-text-starlight bg-bg-cosmic/50 p-3 rounded-lg border border-white/5">
                    <Phone size={18} className="text-accent-plasma" />
                    <span>{user?.phone || 'Оруулаагүй байна'}</span>
                  </div>
                  
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 flex items-center justify-center space-x-2 transition-all hover:border-accent-plasma/50"
                  >
                    <Edit2 size={18} />
                    <span>{t.profile.editProfile}</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative z-10">
                  <div>
                    <label className="block text-sm text-text-nebula mb-1">{t.profile.name}</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-3.5 text-text-nebula" />
                      <input
                        {...register('name', { required: true })}
                        className="w-full bg-bg-cosmic border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-accent-plasma focus:ring-1 focus:ring-accent-plasma transition-all"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-text-nebula mb-1">{t.profile.phone}</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-3.5 text-text-nebula" />
                      <input
                        {...register('phone')}
                        className="w-full bg-bg-cosmic border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-accent-plasma focus:ring-1 focus:ring-accent-plasma transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 mt-6">
                    <button 
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 bg-gradient-to-r from-accent-plasma to-accent-nova text-white rounded-lg flex items-center justify-center space-x-2 hover:shadow-[0_0_15px_rgba(108,92,231,0.5)] transition-all"
                    >
                      <Save size={18} />
                      <span>{t.profile.save}</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 flex items-center justify-center space-x-2 transition-all"
                    >
                      <X size={18} />
                      <span>{t.profile.cancel}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>

          {/* User's Ads Summary/List */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="bg-bg-nebula p-6 rounded-2xl border border-white/10 backdrop-blur-md min-h-[500px]">
              <h3 className="text-xl font-space font-bold text-white mb-6 border-b border-white/10 pb-4">
                {t.profile.myAds}
              </h3>
              
              {listings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {listings.map(listing => (
                    <ListingCard key={listing._id} listing={listing} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-text-nebula">
                  <ImageIcon size={48} className="mb-4 opacity-50" />
                  <p>{t.dashboard.noListings}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
