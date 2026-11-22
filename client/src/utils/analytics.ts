// Google Analytics 4 (GA4), GTM & Meta/Facebook Pixel Integration Utility for Vmax.mn

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}

export const FB_PIXEL_ID = '1090152784040640';
export const GTM_ID = 'GTM-TRG239ZR';
export const GA_MEASUREMENT_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-Y4Y5BELQ1K').trim();

let isGAInitialized = false;

/**
 * Initialize GA4 by dynamically injecting gtag.js script and configuring measurement ID.
 */
export const initGA = (measurementId: string = GA_MEASUREMENT_ID) => {
  if (typeof window === 'undefined') return;
  if (!measurementId) {
    if (import.meta.env.DEV) {
      console.info('[GA4] No VITE_GA_MEASUREMENT_ID provided. GA4 is running in mock/dormant mode.');
    }
    return;
  }

  if (isGAInitialized) return;

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: false, // We control pageviews manually via React Router for SPAs
    cookie_flags: 'SameSite=None;Secure',
  });

  // Inject script tag if not present
  const existingScript = document.getElementById('ga4-script');
  if (!existingScript) {
    const script = document.createElement('script');
    script.id = 'ga4-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
  }

  isGAInitialized = true;
  if (import.meta.env.DEV) {
    console.info(`[GA4] Initialized successfully with ID: ${measurementId}`);
  }
};

/**
 * Track SPA Route change (Page View)
 */
export const trackPageView = (path: string, title?: string) => {
  if (typeof window === 'undefined') return;
  const pageTitle = title || document.title;
  const pagePath = path || window.location.pathname + window.location.search;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'page_view',
    page_path: pagePath,
    page_title: pageTitle,
    page_location: window.location.href,
  });

  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle,
      page_location: window.location.href,
    });
  }

  // Meta / Facebook Pixel PageView
  if (window.fbq) {
    window.fbq('track', 'PageView');
  }
};

/**
 * Custom Event Tracker (Dispatches to dataLayer for GTM, window.gtag, and window.fbq)
 */
export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...params,
  });

  if (window.gtag) {
    window.gtag('event', eventName, params);
  }
};

/**
 * Real Estate Specific Events
 */

// 1. When a user views a listing detail page
export const trackListingView = (listing: {
  id: string;
  title: string;
  price?: number | string;
  category?: string;
  type?: string;
  district?: string;
}) => {
  trackEvent('view_item', {
    items: [
      {
        item_id: listing.id,
        item_name: listing.title,
        price: Number(listing.price) || 0,
        item_category: listing.category || 'General',
        item_variant: listing.type || 'SALE',
        location_id: listing.district || '',
      },
    ],
    currency: 'MNT',
    value: Number(listing.price) || 0,
  });

  // Meta Pixel ViewContent for Retargeting & Dynamic Ads
  if (window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: listing.title,
      content_ids: [listing.id],
      content_type: 'product',
      value: Number(listing.price) || 0,
      currency: 'MNT',
    });
  }
};

// 2. When a user clicks to reveal owner's phone number (High Value Lead)
export const trackPhoneReveal = (listingId: string, category?: string, price?: number | string) => {
  trackEvent('generate_lead', {
    event_category: 'Contact',
    event_label: 'Reveal Phone Number',
    listing_id: listingId,
    category: category || 'Apartment',
    value: Number(price) || 0,
    currency: 'MNT',
  });

  // Meta Pixel Lead Event
  if (window.fbq) {
    window.fbq('track', 'Lead', {
      content_name: 'Reveal Phone Number',
      content_category: category || 'Apartment',
      value: Number(price) || 0,
      currency: 'MNT',
    });
  }
};

// 3. When a user calculates mortgage loan
export const trackMortgageCalculated = (params: {
  propertyPrice: number;
  loanType?: string;
  monthlyPayment: number;
  downPayment: number;
}) => {
  trackEvent('calculate_mortgage', {
    event_category: 'MortgageCalculator',
    property_price: params.propertyPrice,
    loan_type: params.loanType || 'Combined',
    monthly_payment: params.monthlyPayment,
    down_payment: params.downPayment,
    currency: 'MNT',
  });

  // Meta Pixel Custom Event
  if (window.fbq) {
    window.fbq('trackCustom', 'CalculateMortgage', {
      property_price: params.propertyPrice,
      monthly_payment: params.monthlyPayment,
      loan_type: params.loanType || 'Combined',
      currency: 'MNT',
    });
  }
};

// 4. When a user publishes a new listing
export const trackListingCreated = (listingId: string, category: string, price: number) => {
  trackEvent('create_listing', {
    event_category: 'Listing',
    listing_id: listingId,
    category,
    price,
    currency: 'MNT',
  });
};

// 5. When a user searches with filters
export const trackSearchAction = (searchTerm: string, filters: Record<string, any> = {}) => {
  trackEvent('search', {
    search_term: searchTerm,
    ...filters,
  });
};
