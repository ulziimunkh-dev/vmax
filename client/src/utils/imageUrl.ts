const getBaseApiUrl = (): string => {
  let envUrl = (import.meta.env.VITE_API_URL || '').trim();
  if (envUrl) {
    if (envUrl.endsWith('/')) {
      envUrl = envUrl.slice(0, -1);
    }
    // Auto-prefix https:// if provided domain without protocol (e.g. api-production-e009.up.railway.app)
    if (!envUrl.startsWith('http://') && !envUrl.startsWith('https://') && !envUrl.startsWith('/')) {
      envUrl = `https://${envUrl}`;
    }
    return envUrl.replace(/\/api\/?$/, '');
  }

  if (typeof window !== 'undefined') {
    // If running in production browser on Railway/domain, use current origin
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return window.location.origin;
    }
  }
  return 'http://localhost:5000';
};

export const getImageUrl = (url?: string): string => {
  if (!url) return '';

  const apiUrl = getBaseApiUrl();

  // Local data or blob URLs
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  // AWS S3 images - route through authenticated backend proxy for 100% reliable 200 OK delivery
  if (url.includes('.amazonaws.com') || url.includes('.s3.')) {
    return `${apiUrl}/api/uploads/s3?url=${encodeURIComponent(url)}`;
  }

  // Other external URLs (Unsplash, external CDNs)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Client public static assets (e.g. /images/hero_villa.png)
  if (url.startsWith('/images/') || url.startsWith('images/')) {
    return url.startsWith('/') ? url : `/${url}`;
  }

  // Backend uploaded assets (/uploads/...)
  if (url.startsWith('/uploads/')) {
    return `${apiUrl}${url}`;
  }
  if (url.startsWith('uploads/')) {
    return `${apiUrl}/${url}`;
  }

  return `${apiUrl}/uploads/${url.replace(/^\//, '')}`;
};
