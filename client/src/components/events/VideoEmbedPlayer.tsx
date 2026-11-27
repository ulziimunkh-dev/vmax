import React from 'react';
import { getImageUrl } from '@/utils/imageUrl';

interface VideoEmbedPlayerProps {
  url: string;
  className?: string;
  maxHeightClass?: string;
}

export function extractVideoSource(rawInput: string): string {
  const trimmed = (rawInput || '').trim();
  if (!trimmed) return '';

  // Extract src from pasted <iframe> embed code (Facebook, YouTube, etc.)
  if (trimmed.toLowerCase().includes('<iframe')) {
    const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
    if (srcMatch?.[1]) {
      return srcMatch[1].replace(/&amp;/g, '&').trim();
    }
  }
  return trimmed;
}

interface ParsedVideo {
  kind: 'iframe' | 'video';
  src: string;
  isVertical?: boolean;
}

export function parseVideoUrl(rawInput: string): ParsedVideo {
  const clean = extractVideoSource(rawInput);

  // 1. Facebook embed plugin URL directly
  if (/facebook\.com\/plugins\/video\.php/i.test(clean)) {
    const isVertical =
      /reel|share\/r\//i.test(clean) ||
      (/width=(\d+)/i.test(clean) &&
        /height=(\d+)/i.test(clean) &&
        Number(clean.match(/height=(\d+)/i)?.[1] || 0) >
          Number(clean.match(/width=(\d+)/i)?.[1] || 0));
    return { kind: 'iframe', src: clean, isVertical };
  }

  // 2. Facebook video / reel / watch / share link
  if (/(?:facebook\.com|fb\.watch|fb\.com)\//i.test(clean)) {
    const isVertical = /\/reel\/|\/share\/r\//i.test(clean);
    const embedSrc = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(clean)}&show_text=false&t=0`;
    return { kind: 'iframe', src: embedSrc, isVertical };
  }

  // 3. YouTube watch / shorts / youtu.be link
  const ytMatch = clean.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/,
  );
  if (ytMatch?.[1]) {
    const isVertical = /youtube\.com\/shorts\//i.test(clean);
    return {
      kind: 'iframe',
      src: `https://www.youtube.com/embed/${ytMatch[1]}`,
      isVertical,
    };
  }

  // 4. Generic uploaded or direct MP4/MOV video
  return { kind: 'video', src: getImageUrl(clean) };
}

export const VideoEmbedPlayer: React.FC<VideoEmbedPlayerProps> = ({
  url,
  className = '',
  maxHeightClass = 'max-h-[420px]',
}) => {
  const parsed = parseVideoUrl(url);
  if (!parsed.src) return null;

  if (parsed.kind === 'iframe') {
    return (
      <div
        className={`w-full flex justify-center bg-black ${className}`}
      >
        <div
          className={
            parsed.isVertical
              ? 'w-full max-w-[340px] aspect-[9/16]'
              : 'w-full aspect-video'
          }
        >
          <iframe
            src={parsed.src}
            className="w-full h-full border-0"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            scrolling="no"
            title="Venue Walkthrough Video"
          />
        </div>
      </div>
    );
  }

  return (
    <video
      src={parsed.src}
      controls
      playsInline
      className={`w-full ${maxHeightClass} object-contain ${className}`}
    />
  );
};
