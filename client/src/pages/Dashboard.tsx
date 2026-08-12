import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, Ban, Edit2, Trash2, RefreshCw, Eye, EyeOff, LayoutDashboard } from 'lucide-react';
import { useI18n } from '@/i18n';
import { listingsAPI } from '@/services/api';
import type { Listing } from '@/types';

const Dashboard = () => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'active' | 'expired' | 'closed'>('active');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await listingsAPI.getMy();
      setListings(res.data);
    } catch (error) {
      console.error('Failed to fetch listings', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleAction = async (action: () => Promise<any>) => {
    try {
      await action();
      fetchListings();
    } catch (err) {
      console.error(err);
      alert(t.common.error);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t.dashboard.confirmDelete)) {
      handleAction(() => listingsAPI.remove(id));
    }
  };

  const filteredListings = listings.filter(l => l.status === activeTab);

  const tabs = [
    { id: 'active', label: t.dashboard.active, icon: Activity },
    { id: 'expired', label: t.dashboard.expired, icon: Clock },
    { id: 'closed', label: t.dashboard.closed, icon: Ban },
  ];

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
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
        
        <motion.div variants={itemVariants} className="flex items-center space-x-4">
          <div className="p-3 bg-accent-plasma/20 rounded-xl">
            <LayoutDashboard className="text-accent-plasma" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-space font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-aurora to-accent-nova">
              {t.dashboard.title}
            </h1>
            <p className="text-text-nebula mt-1">{t.dashboard.activeListings}: {listings.filter(l => l.status === 'active').length}</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants} className="flex space-x-2 bg-bg-nebula p-2 rounded-xl border border-white/5 w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-accent-plasma to-accent-nova text-white shadow-lg'
                    : 'text-text-nebula hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Content */}
        <motion.div variants={itemVariants} className="bg-bg-nebula border border-white/10 rounded-2xl p-6 backdrop-blur-md min-h-[400px]">
          {loading ? (
            <div className="flex justify-center items-center h-64 text-accent-aurora">
              <RefreshCw className="animate-spin" size={32} />
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-text-nebula">
              <LayoutDashboard size={48} className="mb-4 opacity-20" />
              <p>{t.dashboard.noListings}</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredListings.map(listing => (
                <div key={listing._id} className="flex flex-col md:flex-row items-center justify-between p-4 bg-bg-cosmic border border-white/5 rounded-xl hover:border-accent-plasma/30 transition-colors gap-4">
                  
                  <div className="flex items-center space-x-4 w-full md:w-auto">
                    <div className="w-16 h-16 rounded-lg bg-gray-800 flex-shrink-0 overflow-hidden">
                      {listing.images && listing.images.length > 0 ? (
                        <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-medium line-clamp-1">{listing.title}</h3>
                      <p className="text-accent-aurora font-medium mt-1">₮{listing.price.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                    
                    {activeTab === 'active' && (
                      <>
                        <button className="flex items-center space-x-1 px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm">
                          <Edit2 size={16} />
                          <span>{t.dashboard.edit}</span>
                        </button>
                        <button 
                          onClick={() => handleAction(() => listingsAPI.close(listing._id))}
                          className="flex items-center space-x-1 px-3 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-colors text-sm"
                        >
                          <EyeOff size={16} />
                          <span>{t.dashboard.unpublish}</span>
                        </button>
                      </>
                    )}

                    {activeTab === 'expired' && (
                      <button 
                        onClick={() => handleAction(() => listingsAPI.renew(listing._id))}
                        className="flex items-center space-x-1 px-3 py-2 bg-accent-plasma/20 hover:bg-accent-plasma/30 text-accent-plasma rounded-lg transition-colors text-sm"
                      >
                        <RefreshCw size={16} />
                        <span>{t.dashboard.renew}</span>
                      </button>
                    )}

                    {activeTab === 'closed' && (
                      <button 
                        onClick={() => handleAction(() => listingsAPI.publish(listing._id))}
                        className="flex items-center space-x-1 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors text-sm"
                      >
                        <Eye size={16} />
                        <span>{t.dashboard.publish}</span>
                      </button>
                    )}

                    <button 
                      onClick={() => handleDelete(listing._id)}
                      className="flex items-center space-x-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm"
                    >
                      <Trash2 size={16} />
                      <span>{t.dashboard.delete}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
