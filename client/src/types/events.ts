export type VenueType =
  | 'EVENT_HALL'
  | 'RESTAURANT'
  | 'HOTEL_BALLROOM'
  | 'LOUNGE_VIP'
  | 'RESORT_OUTDOOR'
  | 'CONFERENCE_HALL';

export type EventOccasionType =
  | 'NEW_YEAR'
  | 'WEDDING'
  | 'BIRTHDAY'
  | 'HAIR_CEREMONY'
  | 'CORPORATE'
  | 'GRADUATION'
  | 'CONFERENCE'
  | 'OTHER';

export interface EventOrganization {
  id: string;
  name: string;
  tagline?: string;
  description?: string;
  logoUrl?: string;
  phone: string;
  email?: string;
  city: string;
  district: string;
  addressDetail?: string;
  websiteUrl?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventPackageItem {
  id: string;
  name: string;
  pricePerPerson: number;
  minGuests?: number;
  description?: string;
  includes: string[];
}

export interface EventVenue {
  id: string;
  name: string;
  tagline?: string;
  description: string;
  venueType: VenueType;
  eventTypes: string[];
  logoUrl?: string;
  coverUrl?: string;
  images?: string[];
  videoUrl?: string;
  minCapacity: number;
  maxCapacity: number;
  pricePerPerson?: number;
  hallRentalPrice?: number;
  currency: string;
  city: string;
  district: string;
  addressDetail?: string;
  latitude?: number;
  longitude?: number;
  amenities?: string[];
  bookedDates?: string[];
  packages: EventPackageItem[];
  phone: string;
  secondaryPhone?: string;
  email?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  websiteUrl?: string;
  rating: number;
  reviewsCount: number;
  views: number;
  phoneRevealsCount?: number;
  isVerified: boolean;
  isFeatured: boolean;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventInquiry {
  id: string;
  venueId: string;
  venue?: EventVenue;
  eventType: string;
  eventDate: string;
  guestCount: number;
  packageName?: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  notes?: string;
  message?: string;
  quotedPrice?: number;
  quoteMessage?: string;
  respondedAt?: string;
  status: 'PENDING' | 'CONTACTED' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
}

export interface QueryEventVenuesParams {
  search?: string;
  venueType?: string;
  eventType?: string;
  district?: string;
  minGuests?: number;
  maxPricePerPerson?: number;
  availableDate?: string;
  amenity?: string;
  page?: number;
  limit?: number;
}

export const VENUE_TYPES: { id: VenueType; mn: string; en: string }[] = [
  { id: 'EVENT_HALL', mn: 'Эвент заал / Танхим', en: 'Event Hall' },
  { id: 'RESTAURANT', mn: 'Ресторан', en: 'Restaurant' },
  { id: 'HOTEL_BALLROOM', mn: 'Зочид буудлын их танхим', en: 'Hotel Ballroom' },
  { id: 'LOUNGE_VIP', mn: 'VIP Лоунж / Клуб', en: 'VIP Lounge & Club' },
  { id: 'RESORT_OUTDOOR', mn: 'Амралт / Гадна талбай', en: 'Resort & Outdoor' },
  { id: 'CONFERENCE_HALL', mn: 'Хурлын танхим', en: 'Conference Hall' },
];

export const EVENT_OCCASIONS: {
  id: EventOccasionType;
  mn: string;
  en: string;
  emoji: string;
  serviceMn: string;
  serviceEn: string;
}[] = [
  {
    id: 'NEW_YEAR',
    mn: 'Шинэ жил',
    en: 'New Year',
    emoji: '🎄',
    serviceMn: 'Байгууллагын шинэ жилийн арга хэмжээ',
    serviceEn: 'Corporate & group New Year parties',
  },
  {
    id: 'WEDDING',
    mn: 'Хурим',
    en: 'Wedding',
    emoji: '💍',
    serviceMn: 'Хуримын ресторан, заал',
    serviceEn: 'Wedding restaurants & banquet halls',
  },
  {
    id: 'BIRTHDAY',
    mn: 'Төрсөн өдөр',
    en: 'Birthday',
    emoji: '🎂',
    serviceMn: 'Төрсөн өдөр, хүүхдийн баяр',
    serviceEn: 'Birthday & kids celebration venues',
  },
  {
    id: 'HAIR_CEREMONY',
    mn: 'Үсний найр',
    en: 'Hair Ceremony',
    emoji: '👶',
    serviceMn: 'Хүүхдийн үсний найрын ресторан',
    serviceEn: 'Child first-haircut ceremony restaurants',
  },
  {
    id: 'CORPORATE',
    mn: 'Corporate Event',
    en: 'Corporate Event',
    emoji: '🏢',
    serviceMn: 'Байгууллагын хурал, уулзалт',
    serviceEn: 'Corporate meetings & gatherings',
  },
  {
    id: 'GRADUATION',
    mn: 'Төгсөлтийн баяр',
    en: 'Graduation',
    emoji: '🎓',
    serviceMn: 'Төгсөлтийн баяр',
    serviceEn: 'Graduation banquets & parties',
  },
  {
    id: 'CONFERENCE',
    mn: 'Хурал, семинар',
    en: 'Conference',
    emoji: '🎤',
    serviceMn: 'Хурал, семинар, сургалт',
    serviceEn: 'Conferences, seminars & trainings',
  },
  {
    id: 'OTHER',
    mn: 'Бусад арга хэмжээ',
    en: 'Other Events',
    emoji: '🎉',
    serviceMn: 'Бусад арга хэмжээ',
    serviceEn: 'Other special events & parties',
  },
];

export const EVENT_DISTRICTS = [
  'Сүхбаатар',
  'Хан-Уул',
  'Баянзүрх',
  'Чингэлтэй',
  'Баянгол',
  'Сонгинохайрхан',
  'Налайх',
];

const EXTRA_VENUE_LABELS: Record<string, { mn: string; en: string }> = {
  OUTDOOR_RESORT: { mn: 'Амралт / Гадна талбай', en: 'Resort & Outdoor' },
  LOUNGE_BAR: { mn: 'VIP Лоунж / Бар', en: 'Lounge & Bar' },
};

const EXTRA_OCCASION_LABELS: Record<string, { mn: string; en: string; emoji: string }> = {
  ANNIVERSARY: { mn: 'Ойн баяр', en: 'Anniversary', emoji: '🥂' },
};

export interface EventPhoneRevealLog {
  id: string;
  venueId: string;
  venueName: string;
  viewerUserId?: string;
  viewerIp?: string;
  userAgent?: string;
  createdAt: string;
  viewerUser?: {
    id: string;
    name?: string;
    phone?: string;
    email?: string;
    avatarUrl?: string;
  } | null;
}

export interface EventMessageItem {
  id: string;
  venueId: string;
  customerUserId: string;
  senderRole: 'CUSTOMER' | 'OWNER';
  senderName: string;
  content: string;
  createdAt: string;
}

export interface EventChatThread {
  key: string;
  venueId: string;
  venueName: string;
  customerUserId: string;
  customerName: string;
  customerPhone?: string;
  messages: EventMessageItem[];
}

export function maskPhoneNumber(phone?: string): string {
  if (!phone) return '****-****';
  const trimmed = phone.trim();
  if (trimmed.length <= 4) return '****';
  return `${trimmed.slice(0, trimmed.length - 4)}****`;
}

export function getVenueTypeLabel(type: string, lang: 'mn' | 'en' = 'mn'): string {
  const found = VENUE_TYPES.find((v) => v.id === type);
  if (found) return found[lang];
  const extra = EXTRA_VENUE_LABELS[type];
  return extra ? extra[lang] : type;
}

export function getOccasionLabel(type: string, lang: 'mn' | 'en' = 'mn'): string {
  const found = EVENT_OCCASIONS.find((o) => o.id === type);
  if (found) return `${found.emoji} ${found[lang]}`;
  const extra = EXTRA_OCCASION_LABELS[type];
  return extra ? `${extra.emoji} ${extra[lang]}` : type;
}
