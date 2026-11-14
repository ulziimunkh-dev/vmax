import api from './api';
import type { FurnitureMaker, FurniturePortfolioItem, FurnitureArticleItem } from '@/types/furniture';

export interface GetFurnitureParams {
  search?: string;
  category?: string;
  district?: string;
  hasVideo?: boolean;
  page?: number;
  limit?: number;
}

export const furnitureApi = {
  getAll: (params?: GetFurnitureParams) =>
    api.get<{ items: FurnitureMaker[]; total: number; page: number; limit: number; totalPages: number }>(
      '/furniture',
      { params },
    ),

  getOne: (id: string) => api.get<FurnitureMaker>(`/furniture/${id}`),

  getMy: () => api.get<FurnitureMaker | null>('/furniture/my'),

  getTips: () => api.get<FurnitureArticleItem[]>('/furniture/tips'),

  create: (data: Partial<FurnitureMaker>) => api.post<FurnitureMaker>('/furniture', data),

  update: (id: string, data: Partial<FurnitureMaker>) => api.patch<FurnitureMaker>(`/furniture/${id}`, data),

  addPortfolioItem: (id: string, item: Partial<FurniturePortfolioItem>) =>
    api.post<FurnitureMaker>(`/furniture/${id}/portfolio`, item),

  deletePortfolioItem: (makerId: string, portfolioId: string) =>
    api.delete<FurnitureMaker>(`/furniture/${makerId}/portfolio/${portfolioId}`),

  delete: (id: string) => api.delete(`/furniture/${id}`),
};
