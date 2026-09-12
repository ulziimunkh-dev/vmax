import React, { useState, useRef, useEffect } from 'react';
import { X, Copy, Check, Share2, MessageCircle, Send, PhoneCall, Download, Image as ImageIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/i18n';
import type { Listing } from '@/types';
import { listingsAPI } from '@/services/api';

// -- Icons -------------------------------------------------------------------

const FacebookIcon = ({ size = 18, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const XIcon = ({ size = 14, className = 'text-white' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// -- Shared button class strings ---------------------------------------------

const BTN =
  'flex items-center space-x-3 p-3 rounded-xl bg-plasma/10 border border-plasma/30 text-starlight hover:bg-plasma/20 hover:border-plasma/55 transition-all text-sm font-semibold focus:outline-none';

const BTN_SM =
  'flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-plasma/10 border border-plasma/30 text-starlight hover:bg-plasma/20 hover:border-plasma/55 transition-all text-xs font-semibold disabled:opacity-50 focus:outline-none';

// -- Types -------------------------------------------------------------------

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  onShared?: () => void;
}

// -- Component ---------------------------------------------------------------

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
  const shareUrl = window.location.origin + '/listings/' + listingId;
  const shareTitle = `${listing.title} - ${Number(listing.price).toLocaleString()} ₮`;
  const shareText =
    `🏡 ${listing.title}` +
    `\n💰 Үнэ: ${Number(listing.price).toLocaleString()} ₮` +
    `\n📍 Байршил: ${listing.location}, ${listing.district}` +
    `\n\nVmax.mn дээрээс дэлгэрэнгүйг үзэх:`;

  // -- Handlers ---------------------------------------------------------------

  const recordShare = async () => {
    try {
      if (listingId) {
        await listingsAPI.share(listingId);
        if (onShared) onShared();
      }
    } catch {
      // silent
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
    if (!navigator.share) return;
    try {
      await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
      recordShare();
    } catch {
      // dismissed
    }
  };

  const handleFacebookShare = async () => {
    const fullText = `${shareText}\n${shareUrl}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullText);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch {
      // silent
    }

    if (typeof window !== 'undefined' && (window as any).FB && typeof (window as any).FB.ui === 'function') {
      try {
        (window as any).FB.ui(
          {
            method: 'share',
            href: shareUrl,
            quote: fullText,
          },
          function () {
            recordShare();
          }
        );
        return;
      } catch (err) {
        console.warn('FB.ui share failed:', err);
      }
    }

    const sharerUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(fullText)}`;
    openShareLink(sharerUrl);
  };

  const handleFacebookPosterShare = () => {
    handleDownloadPoster();
    const fullText = `${shareText}\n${shareUrl}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(fullText);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch {}

    setTimeout(() => {
      openShareLink(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(fullText)}`);
    }, 600);
  };

  const openShareLink = (url: string) => {
    window.open(url, '_blank', 'width=600,height=500,scrollbars=yes,resizable=yes');
    recordShare();
  };

  // -- Canvas poster ----------------------------------------------------------

  useEffect(() => {
    if (activeTab === 'poster' && canvasRef.current) renderPosterCanvas();
  }, [activeTab, listing]);

  const renderPosterCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsGenerating(true);
    canvas.width = 1200;
    canvas.height = 630;

    const bg = ctx.createLinearGradient(0, 0, 1200, 630);
    bg.addColorStop(0, '#0a0d18');
    bg.addColorStop(0.5, '#0f172a');
    bg.addColorStop(1, '#030712');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1200, 630);

    const g1 = ctx.createRadialGradient(200, 150, 0, 200, 150, 400);
    g1.addColorStop(0, 'rgba(108,92,231,0.25)');
    g1.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, 1200, 630);

    const g2 = ctx.createRadialGradient(1000, 500, 0, 1000, 500, 400);
    g2.addColorStop(0, 'rgba(168,85,247,0.2)');
    g2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, 1200, 630);

    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(40, 40, 1120, 550, 24);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#6c5ce7';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('Vmax.mn', 80, 105);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 20px sans-serif';
    ctx.fillText('| Real Estate Platform', 248, 103);

    ctx.fillStyle = listing.type === 'sale' ? '#ec4899' : '#3b82f6';
    ctx.beginPath();
    ctx.roundRect(960, 70, 160, 44, 22);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      listing.type === 'sale' ? t.listings.sale.toUpperCase() : t.listings.rent.toUpperCase(),
      1040, 99,
    );
    ctx.textAlign = 'left';

    const drawDetails = () => {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 42px sans-serif';
      const title = listing.title.length > 32 ? listing.title.slice(0, 32) + '...' : listing.title;
      ctx.fillText(title, 80, 180);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 54px sans-serif';
      ctx.fillText(`${Number(listing.price).toLocaleString()} ₮`, 80, 255);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '500 26px sans-serif';
      ctx.fillText(`📍 ${listing.location}, ${listing.district}`, 80, 310);

      const specs = [
        `Талбай: ${listing.areaSqm || 0} м.кв`,
        `Өрөө: ${listing.attributes?.bedrooms || 1}`,
        `Ариун цэвэр: ${listing.attributes?.bathrooms || 1}`,
      ];

      let cx = 80;
      specs.forEach((spec) => {
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.beginPath();
        ctx.roundRect(cx, 350, 220, 50, 14);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 20px sans-serif';
        ctx.fillText(spec, cx + 20, 382);
        cx += 240;
      });

      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.beginPath();
      ctx.roundRect(80, 440, 1040, 110, 18);
      ctx.fill();

      ctx.fillStyle = '#a5b4fc';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('🔗 Холбогдох & Дэлгэрэнгүйг үзэх:', 110, 490);
      ctx.fillStyle = '#ffffff';
      ctx.font = '500 22px sans-serif';
      ctx.fillText(shareUrl, 110, 525);

      setIsGenerating(false);
    };

    if (listing.images?.length && listing.images[0]) {
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
      img.onerror = drawDetails;
    } else {
      drawDetails();
    }
  };

  const handleDownloadPoster = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `Vmax-Ad-${listingId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    recordShare();
  };

  const handleSharePosterNative = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `Vmax-Ad-${listingId}.png`, { type: 'image/png' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ title: shareTitle, text: shareText, files: [file] });
          recordShare();
        } catch {
          // dismissed
        }
      } else {
        handleDownloadPoster();
        openShareLink('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(shareUrl));
      }
    }, 'image/png');
  };

  if (!isOpen) return null;

  const tabCls = (tab: 'links' | 'poster') =>
    'flex items-center space-x-2 py-3 px-4 border-b-2 font-semibold transition-all text-sm focus:outline-none ' +
    (activeTab === tab
      ? 'border-plasma text-plasma'
      : 'border-transparent text-nebula-text hover:text-starlight');

  // -- Render -----------------------------------------------------------------

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden glass-card"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-plasma/20">
            <div className="flex items-center space-x-2">
              <Share2 className="text-plasma" size={22} />
              <h2 className="text-lg font-bold text-starlight">{t.share.shareTitle}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-nebula-text hover:text-starlight hover:bg-plasma/10 transition-colors focus:outline-none"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-plasma/20 bg-cosmic/40 px-6 pt-1 gap-2">
            <button onClick={() => setActiveTab('links')} className={tabCls('links')}>
              <Share2 size={15} className="text-current" />
              <span>{t.share.shareTab}</span>
            </button>
            <button onClick={() => setActiveTab('poster')} className={tabCls('poster')}>
              <Sparkles size={15} className="text-current" />
              <span>{t.share.posterTab}</span>
            </button>
          </div>

          {/* TAB 1: Links */}
          {activeTab === 'links' && (
            <div className="p-6 space-y-5">
              <p className="text-sm text-nebula-text">{t.share.shareDesc}</p>

              {/* Copy link */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-nebula-text">
                  {t.share.copyLink}
                </label>
                <div className="flex items-center bg-cosmic/60 border border-plasma/20 rounded-xl p-1.5 focus-within:border-plasma/50 transition-colors">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-transparent px-3 py-1.5 text-sm text-starlight focus:outline-none truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={
                      'flex items-center space-x-1.5 px-4 py-2 rounded-lg font-semibold text-sm transition-all ' +
                      (copied
                        ? 'bg-green-500 text-white'
                        : 'bg-gradient-to-r from-plasma to-nova text-white hover:opacity-90')
                    }
                  >
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                    <span>{copied ? t.share.copied : t.share.copyLink}</span>
                  </button>
                </div>
              </div>

              {/* Social buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button
                  onClick={handleFacebookShare}
                  className={BTN}
                >
                  <div className="p-2 rounded-lg bg-[#1877F2] shrink-0">
                    <FacebookIcon size={17} className="text-white" />
                  </div>
                  <span>{t.share.shareFb}</span>
                </button>

                <button
                  onClick={() => openShareLink('https://www.facebook.com/dialog/send?link=' + encodeURIComponent(shareUrl) + '&app_id=291494419107518&redirect_uri=' + encodeURIComponent(shareUrl))}
                  className={BTN}
                >
                  <div className="p-2 rounded-lg bg-[#0084FF] shrink-0">
                    <MessageCircle size={17} className="text-white" />
                  </div>
                  <span>{t.share.shareMessenger}</span>
                </button>

                <button
                  onClick={() => openShareLink('https://t.me/share/url?url=' + encodeURIComponent(shareUrl) + '&text=' + encodeURIComponent(shareText))}
                  className={BTN}
                >
                  <div className="p-2 rounded-lg bg-[#229ED9] shrink-0">
                    <Send size={17} className="text-white" />
                  </div>
                  <span>{t.share.shareTg}</span>
                </button>

                <button
                  onClick={() => openShareLink('https://api.whatsapp.com/send?text=' + encodeURIComponent(shareText + ' ' + shareUrl))}
                  className={BTN}
                >
                  <div className="p-2 rounded-lg bg-[#25D366] shrink-0">
                    <PhoneCall size={17} className="text-white" />
                  </div>
                  <span>{t.share.shareWa}</span>
                </button>

                <button
                  onClick={() => openShareLink('https://twitter.com/intent/tweet?url=' + encodeURIComponent(shareUrl) + '&text=' + encodeURIComponent(shareTitle))}
                  className={BTN}
                >
                  <div className="p-2 rounded-lg bg-[#14171A] flex items-center justify-center w-[33px] h-[33px] shrink-0">
                    <XIcon />
                  </div>
                  <span>{t.share.shareX}</span>
                </button>

                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button onClick={handleNativeShare} className={BTN}>
                    <div className="p-2 rounded-lg bg-plasma shrink-0">
                      <Share2 size={17} className="text-white" />
                    </div>
                    <span>{t.share.nativeShare}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Poster Generator */}
          {activeTab === 'poster' && (
            <div className="p-6 space-y-4">
              <div className="relative border border-plasma/20 rounded-xl overflow-hidden bg-black/30 flex items-center justify-center min-h-[220px]">
                <canvas ref={canvasRef} className="w-full h-auto max-h-[320px] object-contain rounded-lg" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-nebula-text">
                  <ImageIcon size={14} className="text-aurora" />
                  <span>1200 x 630px — Facebook / Instagram ready</span>
                </div>
                <button
                  onClick={handleDownloadPoster}
                  disabled={isGenerating}
                  className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-gradient-to-r from-plasma to-nova text-white font-semibold hover:shadow-lg hover:shadow-plasma/30 transition-all text-sm disabled:opacity-50"
                >
                  <Download size={15} />
                  <span>{t.share.downloadPoster}</span>
                </button>
              </div>

              <div className="border-t border-plasma/20 pt-4 space-y-2.5">
                <p className="text-xs text-nebula-text">
                  {typeof navigator !== 'undefined' && typeof navigator.canShare === 'function'
                    ? 'Постерыг шууд хуваалцах'
                    : 'Постерыг татаж аваад сошиалд хуваалцаарай'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {typeof navigator !== 'undefined' && 'share' in navigator && (
                    <button onClick={handleSharePosterNative} disabled={isGenerating} className={BTN_SM}>
                      <div className="p-1.5 rounded-lg bg-plasma shrink-0 flex items-center justify-center">
                        <Share2 size={14} className="text-white" />
                      </div>
                      <span className="truncate">Хуваалцах</span>
                    </button>
                  )}

                  <button
                    onClick={handleFacebookPosterShare}
                    disabled={isGenerating}
                    className={BTN_SM}
                  >
                    <div className="p-1.5 rounded-lg bg-[#1877F2] shrink-0 flex items-center justify-center">
                      <FacebookIcon size={14} className="text-white" />
                    </div>
                    <span className="truncate">Facebook</span>
                  </button>

                  <button
                    onClick={() => { handleDownloadPoster(); setTimeout(() => openShareLink('https://t.me/share/url?url=' + encodeURIComponent(shareUrl) + '&text=' + encodeURIComponent(shareText)), 500); }}
                    disabled={isGenerating}
                    className={BTN_SM}
                  >
                    <div className="p-1.5 rounded-lg bg-[#229ED9] shrink-0 flex items-center justify-center">
                      <Send size={14} className="text-white" />
                    </div>
                    <span className="truncate">Telegram</span>
                  </button>

                  <button
                    onClick={() => { handleDownloadPoster(); setTimeout(() => openShareLink('https://twitter.com/intent/tweet?url=' + encodeURIComponent(shareUrl) + '&text=' + encodeURIComponent(shareTitle)), 500); }}
                    disabled={isGenerating}
                    className={BTN_SM}
                  >
                    <div className="p-1.5 rounded-lg bg-[#14171A] shrink-0 flex items-center justify-center w-[26px] h-[26px]">
                      <XIcon size={14} />
                    </div>
                    <span className="truncate">X (Twitter)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
