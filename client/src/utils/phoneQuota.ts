/**
 * Utility for managing guest user phone reveal quota (Freemium Quota: Option 1)
 * Guests are allowed to reveal up to DAILY_GUEST_PHONE_LIMIT phone numbers per day.
 * Logged-in users have unlimited access.
 */

const STORAGE_KEY = 'vmax_guest_phone_quota_v1';
export const DAILY_GUEST_PHONE_LIMIT = 2;

interface GuestPhoneQuotaState {
  date: string; // YYYY-MM-DD
  viewedListingIds: string[];
}

function getTodayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getGuestQuotaState(): GuestPhoneQuotaState {
  if (typeof window === 'undefined') {
    return { date: getTodayStr(), viewedListingIds: [] };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const today = getTodayStr();
    if (raw) {
      const parsed: GuestPhoneQuotaState = JSON.parse(raw);
      if (parsed && parsed.date === today && Array.isArray(parsed.viewedListingIds)) {
        return parsed;
      }
    }
    // New day or uninitialized -> reset
    const fresh: GuestPhoneQuotaState = { date: today, viewedListingIds: [] };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  } catch {
    return { date: getTodayStr(), viewedListingIds: [] };
  }
}

export function checkPhoneQuota(
  listingId: string,
  isLoggedIn: boolean
): {
  canView: boolean;
  remaining: number;
  limit: number;
  alreadyViewed: boolean;
  isGuest: boolean;
} {
  if (isLoggedIn) {
    return {
      canView: true,
      remaining: Infinity,
      limit: Infinity,
      alreadyViewed: true,
      isGuest: false,
    };
  }

  const state = getGuestQuotaState();
  const alreadyViewed = state.viewedListingIds.includes(String(listingId));
  const count = state.viewedListingIds.length;
  const remaining = Math.max(0, DAILY_GUEST_PHONE_LIMIT - count);

  return {
    canView: alreadyViewed || remaining > 0,
    remaining,
    limit: DAILY_GUEST_PHONE_LIMIT,
    alreadyViewed,
    isGuest: true,
  };
}

export function recordPhoneView(
  listingId: string,
  isLoggedIn: boolean
): {
  remaining: number;
  totalViewed: number;
} {
  if (isLoggedIn) {
    return { remaining: Infinity, totalViewed: 0 };
  }

  try {
    const state = getGuestQuotaState();
    const strId = String(listingId);
    if (!state.viewedListingIds.includes(strId)) {
      state.viewedListingIds.push(strId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
    const remaining = Math.max(0, DAILY_GUEST_PHONE_LIMIT - state.viewedListingIds.length);
    return {
      remaining,
      totalViewed: state.viewedListingIds.length,
    };
  } catch {
    return { remaining: 0, totalViewed: DAILY_GUEST_PHONE_LIMIT };
  }
}
