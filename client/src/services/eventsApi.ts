import api from './api';
import type {
  EventVenue,
  EventInquiry,
  EventOrganization,
  EventPhoneRevealLog,
  EventMessageItem,
  EventChatThread,
  QueryEventVenuesParams,
} from '@/types/events';

export const eventsApi = {
  getMyOrg: () => api.get<EventOrganization | null>('/events/org/my'),

  createOrg: (data: Partial<EventOrganization>) =>
    api.post<EventOrganization>('/events/org', data),

  updateOrg: (id: string, data: Partial<EventOrganization>) =>
    api.patch<EventOrganization>(`/events/org/${id}`, data),

  getAll: (params?: QueryEventVenuesParams) =>
    api.get<{
      items: EventVenue[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>('/events', { params }),

  getOne: (id: string) => api.get<EventVenue>(`/events/${id}`),

  getMy: () => api.get<EventVenue[]>('/events/my'),

  getMyInquiries: () => api.get<EventInquiry[]>('/events/my/inquiries'),

  create: (data: Partial<EventVenue>) => api.post<EventVenue>('/events', data),

  update: (id: string, data: Partial<EventVenue>) =>
    api.patch<EventVenue>(`/events/${id}`, data),

  delete: (id: string) => api.delete(`/events/${id}`),

  inquire: (
    id: string,
    data: {
      eventType: string;
      eventDate: string;
      guestCount: number;
      packageName?: string;
      contactName: string;
      contactPhone: string;
      contactEmail?: string;
      notes?: string;
      message?: string;
    },
  ) => api.post<EventInquiry>(`/events/${id}/inquire`, data),

  bulkInquire: (data: {
    venueIds: string[];
    eventType: string;
    eventDate: string;
    guestCount: number;
    packageName?: string;
    contactName: string;
    contactPhone: string;
    message?: string;
  }) =>
    api.post<{ count: number; inquiries: EventInquiry[] }>(
      '/events/bulk-inquire',
      data,
    ),

  updateInquiry: (
    inquiryId: string,
    data: {
      status?: 'PENDING' | 'CONTACTED' | 'CONFIRMED' | 'CANCELLED';
      quotedPrice?: number;
      quoteMessage?: string;
    },
  ) => api.patch<EventInquiry>(`/events/inquiries/${inquiryId}`, data),

  revealContact: (id: string) =>
    api.post<{
      phone: string;
      secondaryPhone?: string;
      revealsCount: number;
    }>(`/events/${id}/reveal-contact`),

  getMyPhoneReveals: () =>
    api.get<EventPhoneRevealLog[]>('/events/my/phone-reveals'),

  getMessages: (venueId: string, customerUserId?: string) =>
    api.get<EventMessageItem[]>(`/events/${venueId}/messages`, {
      params: customerUserId ? { customerUserId } : undefined,
    }),

  sendMessage: (
    venueId: string,
    content: string,
    customerUserId?: string,
  ) =>
    api.post<EventMessageItem>(`/events/${venueId}/messages`, {
      content,
      customerUserId,
    }),

  getMyChats: () => api.get<EventChatThread[]>('/events/my/chats'),
};
