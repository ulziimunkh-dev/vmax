import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initGA, trackPageView } from '@/utils/analytics';

/**
 * AnalyticsTracker automatically tracks route changes and initializes GA4
 */
export const AnalyticsTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Initialize GA on mount
    initGA();
  }, []);

  useEffect(() => {
    // Track every client-side page navigation
    const path = location.pathname + location.search;
    trackPageView(path);
  }, [location]);

  return null;
};
