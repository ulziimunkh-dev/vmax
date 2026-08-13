export const formatRelativeTime = (dateString?: string, lang: 'mn' | 'en' = 'mn'): string => {
  if (!dateString) return lang === 'mn' ? 'Дөнгөж сая' : 'Just now';

  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(diffInSeconds) || diffInSeconds < 60) {
    return lang === 'mn' ? 'Дөнгөж сая' : 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return lang === 'mn' ? `${diffInMinutes} минутын өмнө` : `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return lang === 'mn' ? `${diffInHours} цагийн өмнө` : `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return lang === 'mn' ? `${diffInDays} өдрийн өмнө` : `${diffInDays}d ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return lang === 'mn' ? `${diffInMonths} сарын өмнө` : `${diffInMonths}mo ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return lang === 'mn' ? `${diffInYears} жилийн өмнө` : `${diffInYears}y ago`;
};

export const formatDateFull = (dateString?: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}.${month}.${day} ${hours}:${minutes}`;
};
