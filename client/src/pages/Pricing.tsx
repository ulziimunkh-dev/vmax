import React, { useEffect, useState } from 'react';
import { ShieldCheck, Check, Zap, Crown, Building2, UserCheck, AlertCircle, Sparkles, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { QPayModal } from '@/components/payment/QPayModal';

export const Pricing: React.FC = () => {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [plans, setPlans] = useState<any[]>([]);
  const [status, setStatus] = useState<any>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // QPay Modal State
  const [qpayModalOpen, setQpayModalOpen] = useState<boolean>(false);
  const [selectedPlanForQPay, setSelectedPlanForQPay] = useState<{
    tier: string;
    planName: string;
    basePrice: number;
  } | null>(null);

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

  const handlePlanSelect = (plan: any) => {
    if (!token) {
      navigate('/login?redirect=/pricing');
      return;
    }

    // If it's a paid tier, open QPay modal
    if (plan.priceMnt > 0) {
      setSelectedPlanForQPay({
        tier: plan.id,
        planName: plan.name,
        basePrice: plan.priceMnt,
      });
      setQpayModalOpen(true);
      return;
    }

    // If free tier
    handleFreeUpgrade(plan.id);
  };

  const handleFreeUpgrade = async (tier: string) => {
    setLoadingPlan(tier);
    setMsg(null);
    try {
      const res = await api.post('/subscriptions/upgrade', { tier, durationMonths: 1 });
      setMsg({ type: 'success', text: res.data.message || 'Эрх амжилттай шинэчлэгдлээ!' });
      await fetchStatus();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Багц сонгоход алдаа гарлаа.' });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handlePaymentSuccess = async () => {
    setMsg({
      type: 'success',
      text: 'QPay төлбөр амжилттай хийгдэж, таны гишүүнчлэлийн багц идэвхжлээ!',
    });
    await fetchStatus();
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
          <span>{t.pricing.title}</span>
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black font-heading text-starlight tracking-tight">
          Үл хөдлөх хөрөнгийн борлуулалтаа <span className="text-plasma">3X хурдасга</span>
        </h1>
        <p className="text-nebula-text text-sm md:text-base">
          {t.pricing.subtitle}
        </p>

        {/* QPay Integration Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-500 dark:text-red-400">
          <div className="flex items-center justify-center px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-black uppercase tracking-tighter">
            qPay
          </div>
          <span>QPay төлбөрийн системээр бүх банкны апп ашиглан 1 минутад төлөх боломжтой</span>
        </div>
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

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handlePlanSelect(plan)}
                  disabled={isCurrent || loadingPlan === plan.id}
                  className={`w-full py-4 rounded-2xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-white/10 text-nebula-text border border-white/10 cursor-default'
                      : plan.recommended
                      ? 'bg-gradient-to-r from-plasma to-aurora hover:from-plasma/90 hover:to-aurora/90 text-slate-950 shadow-plasma/40 cursor-pointer'
                      : 'bg-void/80 hover:bg-void text-starlight border border-white/20 hover:border-plasma cursor-pointer'
                  }`}
                >
                  {plan.priceMnt > 0 && !isCurrent && (
                    <div className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px] font-black uppercase">
                      QPay
                    </div>
                  )}
                  <span>
                    {loadingPlan === plan.id
                      ? 'Боловсруулж байна...'
                      : isCurrent
                      ? t.pricing.currentPlan
                      : plan.priceMnt > 0
                      ? 'QPay-ээр авах'
                      : t.pricing.choosePlan}
                  </span>
                </button>

                {plan.priceMnt > 0 && !isCurrent && (
                  <p className="text-[11px] text-center text-slate-500 dark:text-nebula-text flex items-center justify-center gap-1">
                    <QrCode size={12} className="text-red-500" />
                    <span>Бүх банкны QR болон апп дэмжинэ</span>
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* QPay Payment Modal */}
      {selectedPlanForQPay && (
        <QPayModal
          isOpen={qpayModalOpen}
          onClose={() => setQpayModalOpen(false)}
          tier={selectedPlanForQPay.tier}
          planName={selectedPlanForQPay.planName}
          basePrice={selectedPlanForQPay.basePrice}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default Pricing;
