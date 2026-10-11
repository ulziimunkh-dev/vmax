import React, { useState, useRef, useEffect } from 'react';
import { X, Copy, Check, Share2, MessageCircle, Send, PhoneCall, Download, Image as ImageIcon, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/i18n';
import type { Listing } from '@/types';
import { listingsAPI } from '@/services/api';
import { getImageUrl } from '@/utils/imageUrl';

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

// -- Clipboard helper with multiple robust fallbacks -------------------------

const copyToClipboard = async (text: string): Promise<boolean> => {
  // Method 1: Modern Async Clipboard API
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard.writeText failed:', err);
    }
  }

  // Method 2: Synchronous document.execCommand('copy') with visible-attached element
  if (typeof document !== 'undefined') {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      // Do NOT set display:none or opacity:0 as some browsers/extensions block clipboard from invisible elements
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      textarea.style.top = (window.pageYOffset || document.documentElement.scrollTop) + 'px';
      textarea.style.fontSize = '16px'; // Prevent auto-zoom on iOS
      document.body.appendChild(textarea);

      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);

      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (successful) return true;
    } catch (err) {
      console.warn('execCommand fallback failed:', err);
    }
  }

  return false;
};

// -- Shared button class strings ---------------------------------------------

const BTN =
  'flex items-center space-x-3 p-3 rounded-xl bg-plasma/10 border border-plasma/30 text-starlight hover:bg-plasma/20 hover:border-plasma/55 transition-all text-sm font-semibold focus:outline-none cursor-pointer';

const BTN_SM =
  'flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-plasma/10 border border-plasma/30 text-starlight hover:bg-plasma/20 hover:border-plasma/55 transition-all text-xs font-semibold disabled:opacity-50 focus:outline-none cursor-pointer';

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
  const [posterNotification, setPosterNotification] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const listingId = listing.id || (listing as any)._id;
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  // If running locally, route social crawler previews to public domain so Facebook/Telegram scrapers succeed
  const publicShareUrl = isLocalhost
    ? `https://vmax.mn/listings/${listingId}`
    : `${window.location.origin}/listings/${listingId}`;

  const currentLocalUrl = typeof window !== 'undefined' ? `${window.location.origin}/listings/${listingId}` : publicShareUrl;

  const isLand = listing.category === 'LAND';
  const areaDisplay = isLand && Number(listing.areaSqm) >= 10000
    ? `${(Number(listing.areaSqm) / 10000).toFixed(2)} га`
    : `${listing.areaSqm || 0} м.кв`;

  const shareTitle = `${listing.title} - ${Number(listing.price).toLocaleString()} ₮`;
  const shareText =
    `🏡 ${listing.title}` +
    `\n💰 Үнэ: ${Number(listing.price).toLocaleString()} ₮` +
    `\n📐 Хэмжээ: ${areaDisplay}` +
    (isLand && listing.attributes?.landUsage ? `\n📌 Зориулалт: ${listing.attributes.landUsage}` : '') +
    `\n📍 Байршил: ${listing.location || ''}, ${listing.district || 'Улаанбаатар'}` +
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
    const success = await copyToClipboard(currentLocalUrl);
    if (success) {
      setCopied(true);
      recordShare();
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const openShareWindow = (url: string) => {
    const width = 640;
    const height = 580;
    const left = typeof window !== 'undefined' ? window.screen.width / 2 - width / 2 : 100;
    const top = typeof window !== 'undefined' ? window.screen.height / 2 - height / 2 : 100;
    window.open(
      url,
      'vmax_share_popup',
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
    );
    recordShare();
  };

  const handleNativeShare = async () => {
    if (typeof navigator === 'undefined' || !navigator.share) return;
    try {
      await navigator.share({ title: shareTitle, text: shareText, url: publicShareUrl });
      recordShare();
    } catch {
      // dismissed
    }
  };

  // Direct, reliable Facebook share using standard Sharer (bypasses FB SDK app review blocks)
  const handleFacebookShare = async () => {
    const fullText = `${shareText}\n${publicShareUrl}`;
    await copyToClipboard(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);

    const sharerUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicShareUrl)}&quote=${encodeURIComponent(fullText)}`;
    openShareWindow(sharerUrl);
  };

  // -- Canvas poster generation -----------------------------------------------

  useEffect(() => {
    if (activeTab === 'poster') {
      renderPosterCanvas(true);
    }
  }, [activeTab, listing]);

  const renderPosterCanvas = (withImage: boolean = true) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsGenerating(true);
    canvas.width = 1200;
    canvas.height = 630;

    const firstImage = listing.images?.length && listing.images[0] ? getImageUrl(listing.images[0]) : '';

    const executeDraw = (loadedImg: HTMLImageElement | null) => {
      // 1. Solid modern dark gradient background
      const bg = ctx.createLinearGradient(0, 0, 1200, 630);
      bg.addColorStop(0, '#090b14');
      bg.addColorStop(0.5, '#0d1322');
      bg.addColorStop(1, '#05070e');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 1200, 630);

      // Cosmic atmospheric glows
      const g1 = ctx.createRadialGradient(250, 120, 0, 250, 120, 450);
      g1.addColorStop(0, 'rgba(108, 92, 231, 0.35)');
      g1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, 1200, 630);

      const g2 = ctx.createRadialGradient(950, 520, 0, 950, 520, 450);
      g2.addColorStop(0, 'rgba(168, 85, 247, 0.25)');
      g2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, 1200, 630);

      // Outer sleek border frame
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(30, 30, 1140, 570, 20);
      ctx.stroke();

      // Top Header: Brand & Type Badge
      // Brand logo
      ctx.fillStyle = '#8b5cf6';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('Vmax.mn', 65, 75);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 18px sans-serif';
      ctx.fillText('| Үл хөдлөх хөрөнгийн платформ', 240, 75);

      // Sale / Rent Badge
      const isSale = String(listing.type).toLowerCase() === 'sale';
      const badgeText = isSale ? (t.listings?.sale?.toUpperCase() || 'ЗАРНА') : (t.listings?.rent?.toUpperCase() || 'ТҮРЭЭСЛҮҮЛНЭ');
      ctx.fillStyle = isSale ? '#ec4899' : '#3b82f6';
      ctx.beginPath();
      ctx.roundRect(970, 52, 170, 42, 21);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(badgeText, 1055, 74);
      ctx.textAlign = 'left';

      // Header separator line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(65, 115);
      ctx.lineTo(1135, 115);
      ctx.stroke();

      // ── RIGHT COLUMN: Property Image Card (x=670, y=140, w=470, h=350) ──
      const imgX = 670;
      const imgY = 140;
      const imgW = 465;
      const imgH = 345;
      const imgR = 18;

      if (loadedImg) {
        try {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(imgX, imgY, imgW, imgH, imgR);
          ctx.clip();

          // Cover crop
          const sRatio = loadedImg.width / loadedImg.height;
          const dRatio = imgW / imgH;
          let sx = 0, sy = 0, sw = loadedImg.width, sh = loadedImg.height;
          if (sRatio > dRatio) {
            sw = loadedImg.height * dRatio;
            sx = (loadedImg.width - sw) / 2;
          } else {
            sh = loadedImg.width / dRatio;
            sy = (loadedImg.height - sh) / 2;
          }
          ctx.drawImage(loadedImg, sx, sy, sw, sh, imgX, imgY, imgW, imgH);
          ctx.restore();

          // Border outline on image
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(imgX, imgY, imgW, imgH, imgR);
          ctx.stroke();
        } catch (e) {
          console.warn('Image render fallback on canvas:', e);
        }
      } else {
        // Fallback stylish placeholder
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.beginPath();
        ctx.roundRect(imgX, imgY, imgW, imgH, imgR);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#818cf8';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🏡 Vmax.mn Property', imgX + imgW / 2, imgY + imgH / 2);
        ctx.textAlign = 'left';
      }

      // ── LEFT COLUMN: Text Info (x=65, max width=570) ──
      const maxTextWidth = 570;

      // Wrap Title nicely into max 2 lines
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px sans-serif';
      ctx.textBaseline = 'top';

      const words = (listing.title || '').trim().split(' ');
      const titleLines: string[] = [];
      let currentLine = '';

      for (let n = 0; n < words.length; n++) {
        const testLine = currentLine ? `${currentLine} ${words[n]}` : words[n];
        const testWidth = ctx.measureText(testLine).width;
        if (testWidth > maxTextWidth && currentLine) {
          titleLines.push(currentLine);
          currentLine = words[n];
          if (titleLines.length === 2) break;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine && titleLines.length < 2) {
        titleLines.push(currentLine);
      }
      if (titleLines.length === 2 && currentLine && words.length > 3) {
        // If there were more words, add ellipsis
        if (ctx.measureText(titleLines[1] + '...').width <= maxTextWidth) {
          titleLines[1] = titleLines[1] + '...';
        }
      }

      let textCursorY = 145;
      titleLines.forEach((line) => {
        ctx.fillText(line, 65, textCursorY);
        textCursorY += 40;
      });

      // Price Tag (High prominence)
      textCursorY += 8;
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 44px sans-serif';
      const formattedPrice = `${Number(listing.price || 0).toLocaleString()} ₮`;
      ctx.fillText(formattedPrice, 65, textCursorY);
      textCursorY += 56;

      // Location
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '500 21px sans-serif';
      let loc = `📍 ${listing.location || ''}${listing.district ? `, ${listing.district}` : ''}`;
      if (ctx.measureText(loc).width > maxTextWidth) {
        while (loc.length > 10 && ctx.measureText(loc + '...').width > maxTextWidth) {
          loc = loc.slice(0, -1);
        }
        loc += '...';
      }
      ctx.fillText(loc, 65, textCursorY);
      textCursorY += 42;

      // Property Spec Badges (3 items side-by-side or stacked cleanly)
      const specs = isLand
        ? [
            `📐 ${areaDisplay}`,
            `📌 ${(listing.attributes?.landUsage ? String(listing.attributes.landUsage).slice(0, 14) : 'Газар')}`,
            `📜 ${(listing.attributes?.ownershipType ? String(listing.attributes.ownershipType).slice(0, 12) : 'Өмчлөх')}`,
          ]
        : [
            `📐 ${listing.areaSqm || 0} м.кв`,
            `🚪 ${listing.attributes?.bedrooms || listing.attributes?.rooms || 1} өрөө`,
            `🚿 ${listing.attributes?.bathrooms || 1} ОО`,
          ];

      let badgeX = 65;
      const badgeW = 175;
      const badgeH = 46;
      specs.forEach((spec) => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(badgeX, textCursorY, badgeW, badgeH, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f1f5f9';
        ctx.font = '600 17px sans-serif';
        ctx.textBaseline = 'middle';
        ctx.fillText(spec, badgeX + 14, textCursorY + badgeH / 2);
        badgeX += badgeW + 14;
      });

      // ── BOTTOM CONTAINER: Call to Action Bar (Full width) ──
      const footerY = 505;
      const footerH = 75;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.beginPath();
      ctx.roundRect(65, footerY, 1070, footerH, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.stroke();

      ctx.fillStyle = '#a5b4fc';
      ctx.font = '600 18px sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔗 Дэлгэрэнгүй мэдээлэл & Холбогдох:', 90, footerY + footerH / 2);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(publicShareUrl, 1105, footerY + footerH / 2);
      ctx.textAlign = 'left';

      setIsGenerating(false);
    };

    if (withImage && firstImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => executeDraw(img);
      img.onerror = () => executeDraw(null);
      img.src = firstImage;
    } else {
      executeDraw(null);
    }
  };

  // Safe canvas exporter with automatic taint protection
  const getSafePosterDataUrl = (): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    try {
      return canvas.toDataURL('image/png');
    } catch (err) {
      console.warn('Canvas export tainted, re-rendering clean fallback poster:', err);
      renderPosterCanvas(false);
      try {
        return canvas.toDataURL('image/png');
      } catch {
        return null;
      }
    }
  };

  const handleDownloadPoster = (): boolean => {
    const dataUrl = getSafePosterDataUrl();
    if (!dataUrl) return false;

    const link = document.createElement('a');
    link.download = `Vmax-Ad-${listingId}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    recordShare();
    return true;
  };

  const handleFacebookPosterShare = async () => {
    // 1. Download poster image immediately
    handleDownloadPoster();

    // 2. Copy listing caption text + link to clipboard
    const fullText = `${shareText}\n${publicShareUrl}`;
    await copyToClipboard(fullText);

    setCopied(true);
    setPosterNotification('📥 Постер татагдлаа! 📋 Зарын текст хуулагдсан тул Facebook дээрээ зурагтайгаа хамт нийтлээрэй.');
    setTimeout(() => {
      setCopied(false);
      setPosterNotification('');
    }, 6000);

    // 3. Open Facebook share dialog directly in synchronous user gesture (NO setTimeout!)
    const sharerUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicShareUrl)}&quote=${encodeURIComponent(fullText)}`;
    openShareWindow(sharerUrl);
  };

  const handleTelegramPosterShare = async () => {
    handleDownloadPoster();
    const fullText = `${shareText}\n${publicShareUrl}`;
    await copyToClipboard(fullText);
    openShareWindow(`https://t.me/share/url?url=${encodeURIComponent(publicShareUrl)}&text=${encodeURIComponent(shareText)}`);
  };

  const handleXPosterShare = async () => {
    handleDownloadPoster();
    openShareWindow(`https://twitter.com/intent/tweet?url=${encodeURIComponent(publicShareUrl)}&text=${encodeURIComponent(shareTitle)}`);
  };

  const handleSharePosterNative = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          handleDownloadPoster();
          return;
        }
        const file = new File([blob], `Vmax-Ad-${listingId}.png`, { type: 'image/png' });
        if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
          try {
            await navigator.share({ title: shareTitle, text: shareText, files: [file] });
            recordShare();
          } catch {
            // user dismissed
          }
        } else {
          handleDownloadPoster();
          handleFacebookPosterShare();
        }
      }, 'image/png');
    } catch {
      handleDownloadPoster();
    }
  };

  if (!isOpen) return null;

  const tabCls = (tab: 'links' | 'poster') =>
    'flex items-center space-x-2 py-3 px-4 border-b-2 font-semibold transition-all text-sm focus:outline-none cursor-pointer ' +
    (activeTab === tab
      ? 'border-plasma text-plasma'
      : 'border-transparent text-nebula-text hover:text-starlight');

  // -- Render -----------------------------------------------------------------

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden glass-card border border-plasma/30 bg-[#0f111a]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-plasma/20">
            <div className="flex items-center space-x-2">
              <Share2 className="text-plasma" size={22} />
              <h2 className="text-lg font-bold text-starlight">{t.share.shareTitle}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-nebula-text hover:text-starlight hover:bg-plasma/10 transition-colors focus:outline-none cursor-pointer"
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
                    value={currentLocalUrl}
                    className="flex-1 bg-transparent px-3 py-1.5 text-sm text-starlight focus:outline-none truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={
                      'flex items-center space-x-1.5 px-4 py-2 rounded-lg font-semibold text-sm transition-all cursor-pointer ' +
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
                {/* Facebook */}
                <button
                  type="button"
                  onClick={handleFacebookShare}
                  className={BTN}
                >
                  <div className="p-2 rounded-lg bg-[#1877F2] shrink-0">
                    <FacebookIcon size={17} className="text-white" />
                  </div>
                  <span>{t.share.shareFb}</span>
                </button>

                {/* Messenger */}
                <button
                  type="button"
                  onClick={() => {
                    const messengerUrl = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(publicShareUrl)}&app_id=1416187317097976&redirect_uri=${encodeURIComponent(publicShareUrl)}`;
                    openShareWindow(messengerUrl);
                  }}
                  className={BTN}
                >
                  <div className="p-2 rounded-lg bg-[#0084FF] shrink-0">
                    <MessageCircle size={17} className="text-white" />
                  </div>
                  <span>{t.share.shareMessenger}</span>
                </button>

                {/* Telegram */}
                <button
                  type="button"
                  onClick={() => openShareWindow('https://t.me/share/url?url=' + encodeURIComponent(publicShareUrl) + '&text=' + encodeURIComponent(shareText))}
                  className={BTN}
                >
                  <div className="p-2 rounded-lg bg-[#229ED9] shrink-0">
                    <Send size={17} className="text-white" />
                  </div>
                  <span>{t.share.shareTg}</span>
                </button>

                {/* WhatsApp */}
                <button
                  type="button"
                  onClick={() => openShareWindow('https://api.whatsapp.com/send?text=' + encodeURIComponent(shareText + ' ' + publicShareUrl))}
                  className={BTN}
                >
                  <div className="p-2 rounded-lg bg-[#25D366] shrink-0">
                    <PhoneCall size={17} className="text-white" />
                  </div>
                  <span>{t.share.shareWa}</span>
                </button>

                {/* X (Twitter) */}
                <button
                  type="button"
                  onClick={() => openShareWindow('https://twitter.com/intent/tweet?url=' + encodeURIComponent(publicShareUrl) + '&text=' + encodeURIComponent(shareTitle))}
                  className={BTN}
                >
                  <div className="p-2 rounded-lg bg-[#14171A] flex items-center justify-center w-[33px] h-[33px] shrink-0">
                    <XIcon />
                  </div>
                  <span>{t.share.shareX}</span>
                </button>

                {/* Native OS Share Sheet */}
                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button type="button" onClick={handleNativeShare} className={BTN}>
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
              <div className="relative border border-plasma/20 rounded-xl overflow-hidden bg-black/40 flex items-center justify-center min-h-[220px]">
                <canvas ref={canvasRef} className="w-full h-auto max-h-[320px] object-contain rounded-lg" />
              </div>

              {/* Toast banner for user confirmation */}
              {posterNotification && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center space-x-2"
                >
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>{posterNotification}</span>
                </motion.div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-nebula-text">
                  <ImageIcon size={14} className="text-aurora" />
                  <span>1200 x 630px — Facebook / Instagram бэлэн формат</span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadPoster}
                  disabled={isGenerating}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-plasma to-nova text-white font-semibold hover:shadow-lg hover:shadow-plasma/30 transition-all text-sm disabled:opacity-50 cursor-pointer"
                >
                  <Download size={15} />
                  <span>{t.share.downloadPoster}</span>
                </button>
              </div>

              {/* Caption Preview & Manual Copy Box */}
              <div className="bg-cosmic/50 border border-plasma/25 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-starlight flex items-center space-x-1.5">
                    <span>📋 Зарын тайлбар текст</span>
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      const fullText = `${shareText}\n${publicShareUrl}`;
                      const ok = await copyToClipboard(fullText);
                      if (ok) {
                        setCopied(true);
                        setPosterNotification('✅ Зарын тайлбар текст амжилттай хуулагдлаа! Одоо Facebook дээрээ Paste хийнэ үү.');
                        setTimeout(() => {
                          setCopied(false);
                          setPosterNotification('');
                        }, 5000);
                      }
                    }}
                    className="flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg bg-plasma/20 border border-plasma/40 text-plasma hover:bg-plasma/30 transition-all font-medium cursor-pointer"
                  >
                    {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copied ? 'Хуулагдлаа' : 'Текстийг хуулах'}</span>
                  </button>
                </div>
                <p className="text-xs text-nebula-text/90 line-clamp-2 font-mono bg-void/50 p-2 rounded-lg border border-white/5 select-all">
                  {shareText} {publicShareUrl}
                </p>
                <p className="text-[11px] text-amber-300/80 leading-relaxed">
                  💡 <b>Facebook-д нийтлэх заавар:</b> Facebook-ийн нийтлэл бичих хэсэгт хулганы баруун товч дарж <b>Paste (эсвэл Ctrl+V)</b> дарна. Мөн татагдсан постер зургаа хамт оруулж болно.
                </p>
              </div>

              <div className="border-t border-plasma/20 pt-4 space-y-2.5">
                <p className="text-xs text-nebula-text font-medium">
                  📢 Постер хуваалцах:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* Native Mobile Share */}
                  {typeof navigator !== 'undefined' && 'share' in navigator && (
                    <button type="button" onClick={handleSharePosterNative} disabled={isGenerating} className={BTN_SM}>
                      <div className="p-1.5 rounded-lg bg-plasma shrink-0 flex items-center justify-center">
                        <Share2 size={14} className="text-white" />
                      </div>
                      <span className="truncate">Хуваалцах</span>
                    </button>
                  )}

                  {/* Facebook */}
                  <button
                    type="button"
                    onClick={handleFacebookPosterShare}
                    disabled={isGenerating}
                    className={BTN_SM}
                  >
                    <div className="p-1.5 rounded-lg bg-[#1877F2] shrink-0 flex items-center justify-center">
                      <FacebookIcon size={14} className="text-white" />
                    </div>
                    <span className="truncate">Facebook-д нийтлэх</span>
                  </button>

                  {/* Telegram */}
                  <button
                    type="button"
                    onClick={handleTelegramPosterShare}
                    disabled={isGenerating}
                    className={BTN_SM}
                  >
                    <div className="p-1.5 rounded-lg bg-[#229ED9] shrink-0 flex items-center justify-center">
                      <Send size={14} className="text-white" />
                    </div>
                    <span className="truncate">Telegram</span>
                  </button>

                  {/* X (Twitter) */}
                  <button
                    type="button"
                    onClick={handleXPosterShare}
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
