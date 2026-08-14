const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');

export const getImageUrl = (url?: string): string => {
  if (!url) return '';

  // Local data or blob URLs
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  // AWS S3 private images - route through authenticated backend proxy
  if (url.includes('.amazonaws.com') || url.includes('.s3.')) {
    return `${API_URL}/api/uploads/s3?url=${encodeURIComponent(url)}`;
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
    return `${API_URL}${url}`;
  }
  if (url.startsWith('uploads/')) {
    return `${API_URL}/${url}`;
  }

  return `${API_URL}/uploads/${url.replace(/^\//, '')}`;
};
