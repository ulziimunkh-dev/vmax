import React, { useState, useRef, useEffect } from 'react';
import { X, Copy, Check, Share2, MessageCircle, Send, PhoneCall, Download, Image as ImageIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/i18n';
import type { Listing } from '@/types';
import { listingsAPI } from '@/services/api';

const FacebookIcon = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  onShared?: () => void;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  listing,
  onShared,
}) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'links' | 'poster'>('links');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const listingId = listing.id || (listing as any)._id;
  const shareUrl = window.location.origin + `/listings/${listingId}`;
  const shareTitle = `${listing.title} - ${Number(listing.price).toLocaleString()} ₮`;
  const shareText = `🏡 ${listing.title}\n💰 Үнэ: ${Number(listing.price).toLocaleString()} ₮\n📍 Байршил: ${listing.location}, ${listing.district}\n\nVmax.mn дээрээс дэлгэрэнгүйг үзэх:`;

  const recordShare = async () => {
    try {
      if (listingId) {
        await listingsAPI.share(listingId);
        if (onShared) onShared();
      }
    } catch (e) {
      console.log('Share counter updated locally');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      recordShare();
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        recordShare();
      } catch (err) {
        console.log('Share dismissed');
      }
    }
  };

  const openShareLink = (url: string) => {
    window.open(url, '_blank', 'width=600,height=500,scrollbars=yes,resizable=yes');
    recordShare();
  };

  // Canvas Drawing for Social Media Poster
  useEffect(() => {
    if (activeTab === 'poster' && canvasRef.current) {
      renderPosterCanvas();
    }
  }, [activeTab, listing]);

  const renderPosterCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsGenerating(true);
    canvas.width = 1200;
    canvas.height = 630;

    // Background Dark Gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 1200, 630);
    bgGradient.addColorStop(0, '#0a0d18');
    bgGradient.addColorStop(0.5, '#0f172a');
    bgGradient.addColorStop(1, '#030712');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1200, 630);

    // Decorative Glows
    const glow1 = ctx.createRadialGradient(200, 150, 0, 200, 150, 400);
    glow1.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
    glow1.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, 1200, 630);

    const glow2 = ctx.createRadialGradient(1000, 500, 0, 1000, 500, 400);
    glow2.addColorStop(0, 'rgba(236, 72, 153, 0.2)');
    glow2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, 1200, 630);

    // Draw Main Card Container
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(40, 40, 1120, 550, 24);
    ctx.fill();
    ctx.stroke();

    // Brand Watermark Top Left
    ctx.fillStyle = '#6366f1';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('Vmax.mn', 80, 105);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 20px sans-serif';
    ctx.fillText('| Real Estate Platform', 245, 103);

    // Type Badge Top Right
    ctx.fillStyle = listing.type === 'sale' ? '#ec4899' : '#3b82f6';
    ctx.beginPath();
    ctx.roundRect(960, 70, 160, 44, 22);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(listing.type === 'sale' ? t.listings.sale.toUpperCase() : t.listings.rent.toUpperCase(), 1040, 99);
    ctx.textAlign = 'left';

    // Property Image Preview Box or Placeholder
    const drawDetails = () => {
      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 42px sans-serif';
      const truncatedTitle = listing.title.length > 32 ? listing.title.slice(0, 32) + '...' : listing.title;
      ctx.fillText(truncatedTitle, 80, 180);

      // Price Tag (Glow Effect)
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'extrabold 54px sans-serif';
      ctx.fillText(`${Number(listing.price).toLocaleString()} ₮`, 80, 255);

      // Location
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '500 26px sans-serif';
      ctx.fillText(`📍 ${listing.location}, ${listing.district}`, 80, 310);

      // Spec Chips
      const specs = [
        `Талбай: ${listing.areaSqm || 0} м.кв`,
        `Өрөө: ${listing.attributes?.bedrooms || 1}`,
        `Ариун цэвэр: ${listing.attributes?.bathrooms || 1}`,
      ];

      let chipX = 80;
      specs.forEach(spec => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.roundRect(chipX, 350, 220, 50, 14);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '600 20px sans-serif';
        ctx.fillText(spec, chipX + 20, 382);
        chipX += 240;
      });

      // Bottom Footer Bar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.roundRect(80, 440, 1040, 110, 18);
      ctx.fill();

      ctx.fillStyle = '#a5b4fc';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('🔗 Холбогдох & Дэлгэрэнгүй үзэх:', 110, 490);

      ctx.fillStyle = '#ffffff';
      ctx.font = '500 22px sans-serif';
      ctx.fillText(shareUrl, 110, 525);

      setIsGenerating(false);
    };

    if (listing.images && listing.images.length > 0 && listing.images[0]) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = listing.images[0];
      img.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(750, 150, 370, 260, 20);
        ctx.clip();
        ctx.drawImage(img, 750, 150, 370, 260);
        ctx.restore();
        drawDetails();
      };
      img.onerror = () => {
        drawDetails();
      };
    } else {
      drawDetails();
    }
  };

  const handleDownloadPoster = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imageURI = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `Vmax-Ad-${listingId}.png`;
    link.href = imageURI;
    link.click();
    recordShare();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl bg-bg-nebula border border-white/10 rounded-2xl shadow-2xl overflow-hidden glass-card"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <Share2 className="text-accent-plasma" size={24} />
              <h2 className="text-xl font-bold text-white">{t.share.shareTitle}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-text-nebula hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 bg-bg-cosmic/50 px-6 pt-2">
            <button
              onClick={() => setActiveTab('links')}
              className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium transition-all text-sm ${
                activeTab === 'links'
                  ? 'border-accent-plasma text-accent-plasma'
                  : 'border-transparent text-text-nebula hover:text-white'
              }`}
            >
              <Share2 size={16} />
              <span>{t.share.shareTab}</span>
            </button>
            <button
              onClick={() => setActiveTab('poster')}
              className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium transition-all text-sm ${
                activeTab === 'poster'
                  ? 'border-accent-plasma text-accent-plasma'
                  : 'border-transparent text-text-nebula hover:text-white'
              }`}
            >
              <Sparkles size={16} />
              <span>{t.share.posterTab}</span>
            </button>
          </div>

          {/* Tab 1: Links */}
          {activeTab === 'links' && (
            <div className="p-6 space-y-6">
              <p className="text-sm text-text-nebula">{t.share.shareDesc}</p>

              {/* Direct Copy Link Bar */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-nebula">
                  {t.share.copyLink}
                </label>
                <div className="flex items-center bg-bg-cosmic border border-white/10 rounded-xl p-1.5 focus-within:border-accent-plasma/50">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-transparent px-3 py-1.5 text-sm text-white focus:outline-none truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      copied
                        ? 'bg-green-500 text-white'
                        : 'bg-gradient-to-r from-accent-plasma to-accent-nova text-white hover:opacity-90'
                    }`}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copied ? t.share.copied : t.share.copyLink}</span>
                  </button>
                </div>
              </div>

              {/* Social Media Buttons Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {/* Facebook */}
                <button
                  onClick={() =>
                    openShareLink(
                      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
                    )
                  }
                  className="flex items-center space-x-3 p-3 rounded-xl bg-[#1877F2]/15 border border-[#1877F2]/30 text-white hover:bg-[#1877F2]/30 transition-all text-sm font-medium"
                >
                  <div className="p-2 rounded-lg bg-[#1877F2]">
                    <FacebookIcon size={18} className="text-white" />
                  </div>
                  <span>{t.share.shareFb}</span>
                </button>

                {/* FB Messenger */}
                <button
                  onClick={() =>
                    openShareLink(
                      `https://www.facebook.com/dialog/send?link=${encodeURIComponent(
                        shareUrl
                      )}&app_id=291494419107518&redirect_uri=${encodeURIComponent(shareUrl)}`
                    )
                  }
                  className="flex items-center space-x-3 p-3 rounded-xl bg-[#0084FF]/15 border border-[#0084FF]/30 text-white hover:bg-[#0084FF]/30 transition-all text-sm font-medium"
                >
                  <div className="p-2 rounded-lg bg-[#0084FF]">
                    <MessageCircle size={18} className="text-white" />
                  </div>
                  <span>{t.share.shareMessenger}</span>
                </button>

                {/* Telegram */}
                <button
                  onClick={() =>
                    openShareLink(
                      `https://t.me/share/url?url=${encodeURIComponent(
                        shareUrl
                      )}&text=${encodeURIComponent(shareText)}`
                    )
                  }
                  className="flex items-center space-x-3 p-3 rounded-xl bg-[#229ED9]/15 border border-[#229ED9]/30 text-white hover:bg-[#229ED9]/30 transition-all text-sm font-medium"
                >
                  <div className="p-2 rounded-lg bg-[#229ED9]">
                    <Send size={18} className="text-white" />
                  </div>
                  <span>{t.share.shareTg}</span>
                </button>

                {/* WhatsApp */}
                <button
                  onClick={() =>
                    openShareLink(
                      `https://api.whatsapp.com/send?text=${encodeURIComponent(
                        shareText + ' ' + shareUrl
                      )}`
                    )
                  }
                  className="flex items-center space-x-3 p-3 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 text-white hover:bg-[#25D366]/30 transition-all text-sm font-medium"
                >
                  <div className="p-2 rounded-lg bg-[#25D366]">
                    <PhoneCall size={18} className="text-white" />
                  </div>
                  <span>{t.share.shareWa}</span>
                </button>

                {/* X / Twitter */}
                <button
                  onClick={() =>
                    openShareLink(
                      `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                        shareUrl
                      )}&text=${encodeURIComponent(shareTitle)}`
                    )
                  }
                  className="flex items-center space-x-3 p-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all text-sm font-medium"
                >
                  <div className="p-2 rounded-lg bg-black text-white font-bold text-xs flex items-center justify-center w-8 h-8">
                    𝕏
                  </div>
                  <span>{t.share.shareX}</span>
                </button>

                {/* Native System Share */}
                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button
                    onClick={handleNativeShare}
                    className="flex items-center space-x-3 p-3 rounded-xl bg-accent-plasma/20 border border-accent-plasma/30 text-white hover:bg-accent-plasma/40 transition-all text-sm font-medium"
                  >
                    <div className="p-2 rounded-lg bg-accent-plasma">
                      <Share2 size={18} className="text-white" />
                    </div>
                    <span>{t.share.nativeShare}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Canvas Poster Generator */}
          {activeTab === 'poster' && (
            <div className="p-6 space-y-4">
              <div className="relative border border-white/10 rounded-xl overflow-hidden bg-black/40 flex items-center justify-center min-h-[220px]">
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto max-h-[320px] object-contain rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2 text-xs text-text-nebula">
                  <ImageIcon size={16} className="text-accent-aurora" />
                  <span>1200 x 630px (Facebook / Instagram post ready)</span>
                </div>
                <button
                  onClick={handleDownloadPoster}
                  disabled={isGenerating}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-plasma to-accent-nova text-white font-medium hover:shadow-lg hover:shadow-accent-plasma/30 transition-all text-sm"
                >
                  <Download size={18} />
                  <span>{t.share.downloadPoster}</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
