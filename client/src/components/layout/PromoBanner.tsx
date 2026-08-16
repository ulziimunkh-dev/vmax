import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, X } from "lucide-react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const TARGET = new Date("2026-09-01T00:00:00+08:00");

function getTimeLeft(): TimeLeft {
  const diff = TARGET.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const Pad = ({ n }: { n: number }) => (
  <span className="promo-digit">{String(n).padStart(2, "0")}</span>
);
const Sep = () => <span className="promo-sep">:</span>;

const PromoBanner: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft());
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem("promo_dismissed") === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const expired = TARGET.getTime() <= Date.now();
  if (dismissed || expired) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem("promo_dismissed", "1");
    } catch {
      /* noop */
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        id="promo-banner"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="promo-banner-root"
      >
        <div className="promo-inner">
          <div className="promo-glow promo-glow-left" />
          <div className="promo-glow promo-glow-right" />

          <div className="promo-content">
            <div className="promo-text-group">
              <span className="promo-icon-wrap">
                <Zap size={14} fill="currentColor" />
              </span>
              <span className="promo-label">
                Онцгой санал:&nbsp;
                <strong>Хязгааргүй зар</strong>&nbsp;байршуулах эрх —&nbsp;
                <span className="promo-until">9-р сарын 1 хүртэл үнэгүй!</span>
              </span>
            </div>

            <div className="promo-countdown" aria-label="Countdown">
              <div className="promo-unit">
                <Pad n={timeLeft.days} />
                <span className="promo-unit-label">өдөр</span>
              </div>
              <Sep />
              <div className="promo-unit">
                <Pad n={timeLeft.hours} />
                <span className="promo-unit-label">цаг</span>
              </div>
              <Sep />
              <div className="promo-unit">
                <Pad n={timeLeft.minutes} />
                <span className="promo-unit-label">мин</span>
              </div>
              <Sep />
              <div className="promo-unit">
                <Pad n={timeLeft.seconds} />
                <span className="promo-unit-label">сек</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="promo-close"
            aria-label="Хаах"
          >
            <X size={14} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PromoBanner;
