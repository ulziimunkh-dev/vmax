import React, { useEffect, useState } from 'react';
import { ShieldCheck, Check, Zap, Crown, Building2, UserCheck, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from 'react-router-dom';


export const Pricing: React.FC = () => {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<any[]>([]);
  const [status, setStatus] = useState<any>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchPlans();
    if (token) {
      fetchStatus();
    }
  }, [token]);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/subscriptions/plans');
      setPlans(res.data);
    } catch {
      // Fallback local plan definitions if offline
      setPlans([
        {
          id: 'FREE',
          name: 'Энгийн (Free)',
          priceMnt: 0,
          period: 'Төлбөргүй',
          listingLimit: 3,
          features: [
            '3 хүртэлх идэвхтэй зарын лимит',
            'Стандарт хайлтын илэрц',
            'Шууд чат & утасны холбоос',
          ],
        },
        {
          id: 'PRO_AGENT',
          name: 'Pro Agent',
          priceMnt: 49000,
          period: 'сар бүр',
          listingLimit: 30,
          recommended: true,
          features: [
            '30 хүртэлх идэвхтэй зарын лимит',
            'Баталгаажсан Риэлтор (Verified Agent) тэмдэг',
            'Агентын бие даасан профайл хуудас',
            'Зарын үзэлт & хандалтын аналитик',
            'Тэргүүн дараалалд эрэмбэлэгдэх боломж',
          ],
        },
        {
          id: 'AGENCY',
          name: 'Agency (Агентлаг)',
          priceMnt: 199000,
          period: 'сар бүр',
          listingLimit: 999999,
          features: [
            'Хязгааргүй идэвхтэй зарын лимит',
            'Агентлагийн нэгдсэн лого & профайл',
            'Олон агентын дэд хаяг удирдлага',
            'Шууд VIP зарын хөнгөлөлт',
            '24/7 Тэргүүлэх дэмжлэг & зөвлөгөө',
          ],
        },
      ]);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await api.get('/subscriptions/status');
      setStatus(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpgrade = async (tier: string) => {
    if (!token) {
      navigate('/login');
      return;
    }
    setLoadingPlan(tier);
    setMsg(null);
    try {
      const res = await api.post('/subscriptions/upgrade', { tier, durationMonths: 1 });
      setMsg({ type: 'success', text: res.data.message || 'Эрх амжилттай шинэчлэгдлээ!' });
      await fetchStatus();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Багц ахиулахад алдаа гарлаа.' });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center space-x-2 bg-plasma/10 border border-plasma/30 px-4 py-1.5 rounded-full text-plasma text-xs font-bold"
        >
          <Crown size={16} />
          <span>Vmax.mn Гишүүнчлэлийн багцууд</span>
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black font-heading text-starlight tracking-tight">
          Үл хөдлөх хөрөнгийн борлуулалтаа <span className="text-plasma">3X хурдасга</span>
        </h1>
        <p className="text-nebula-text text-sm md:text-base">
          Агент, зуучлагч, агентлагуудад зориулсан тусгай эрх болон зарын хязгаарыг сонгон борлуулалтаа нэмэгдүүлээрэй.
        </p>
      </div>

      {/* Current status banner */}
      {status && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto mb-12 p-4 rounded-2xl glass-card border border-plasma/40 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-plasma/20 rounded-xl text-plasma">
              <UserCheck size={24} />
            </div>
            <div>
              <span className="text-xs text-nebula-text block">Одоогийн Таны багц:</span>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-starlight text-lg">{status.tier}</span>
                {status.isVerifiedAgent && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                    ✓ Verified Agent
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-nebula-text block">Ашиглаж буй зарын лимит:</span>
            <span className="font-bold text-plasma text-base">
              {status.activeListingsCount} / {status.listingLimit === 999999 ? '∞' : status.listingLimit} Идэвхтэй зар
            </span>
          </div>
        </motion.div>
      )}

      {msg && (
        <div
          className={`max-w-3xl mx-auto mb-8 p-4 rounded-2xl border text-sm font-semibold flex items-center space-x-2 ${
            msg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          <AlertCircle size={18} />
          <span>{msg.text}</span>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan, idx) => {
          const isCurrent = status?.tier === plan.id;
          const isPro = plan.id === 'PRO_AGENT';
          const isAgency = plan.id === 'AGENCY';

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`glass-card rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
                plan.recommended
                  ? 'border-plasma ring-2 ring-plasma/50 shadow-2xl shadow-plasma/20 scale-105 bg-void/80'
                  : 'border-white/10 hover:border-white/20 bg-void/40'
              }`}
            >
              {plan.recommended && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-plasma to-aurora text-slate-950 px-4 py-1 rounded-bl-2xl text-xs font-black uppercase tracking-wider">
                  Ихэнх риэлторуудын сонголт
                </div>
              )}

              <div>
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    {isAgency ? (
                      <Building2 className="text-purple-400" size={24} />
                    ) : isPro ? (
                      <Zap className="text-plasma" size={24} />
                    ) : (
                      <ShieldCheck className="text-nebula-text" size={24} />
                    )}
                    <h3 className="text-2xl font-bold font-heading text-starlight">{plan.name}</h3>
                  </div>
                  <div className="flex items-baseline space-x-1 mt-4">
                    <span className="text-4xl font-black font-heading text-starlight">
                      {plan.priceMnt === 0 ? 'Үнэгүй' : `${plan.priceMnt.toLocaleString('mn-MN')} ₮`}
                    </span>
                    {plan.priceMnt > 0 && (
                      <span className="text-xs text-nebula-text">/ {plan.period}</span>
                    )}
                  </div>
                  <p className="text-xs text-plasma font-semibold mt-2">
                    Лимит: {plan.listingLimit === 999999 ? 'Хязгааргүй' : `${plan.listingLimit} идэвхтэй зар`}
                  </p>
                </div>

                <div className="border-t border-white/10 pt-6 mb-8 space-y-3">
                  {plan.features.map((feature: string, fIdx: number) => (
                    <div key={fIdx} className="flex items-start space-x-3 text-sm text-starlight/90">
                      <div className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5 flex-shrink-0">
                        <Check size={14} />
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleUpgrade(plan.id)}
                disabled={isCurrent || loadingPlan === plan.id}
                className={`w-full py-4 rounded-2xl font-bold text-sm transition-all shadow-lg ${
                  isCurrent
                    ? 'bg-white/10 text-nebula-text border border-white/10 cursor-default'
                    : plan.recommended
                    ? 'bg-gradient-to-r from-plasma to-aurora hover:from-plasma/90 hover:to-aurora/90 text-slate-950 shadow-plasma/40'
                    : 'bg-void/80 hover:bg-void text-starlight border border-white/20 hover:border-plasma'
                }`}
              >
                {loadingPlan === plan.id
                  ? 'Боловсруулж байна...'
                  : isCurrent
                  ? 'Одоогийн идэвхтэй багц'
                  : 'Сонгох & Ахиулах'}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Pricing;
