const getBaseApiUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
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

  // AWS S3 private images - route through authenticated backend proxy
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
