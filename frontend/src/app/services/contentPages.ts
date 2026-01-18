import { apiClient } from './api';

export interface ContentPage {
  id: number;
  page_type: 'terms' | 'privacy';
  content_ru: string;
  content_kz: string;
  content_en: string;
  created_at: string;
  updated_at: string;
}

export interface ContentPageUpdate {
  content_ru: string;
  content_kz: string;
  content_en: string;
}

export const contentPagesService = {
  async getAll(): Promise<ContentPage[]> {
    const data = await apiClient.get<any>('/core/content-pages/');
    
    // Backend может возвращать данные в разных форматах:
    // 1. Прямой массив: [page1, page2, ...]
    // 2. Пагинированный ответ: { results: [...], count: N, next: ..., previous: ... }
    // 3. Объект с данными: { data: [...] }
    
    if (Array.isArray(data)) {
      return data;
    }
    
    // Проверяем пагинированный ответ Django REST Framework
    if (data && typeof data === 'object') {
      if (Array.isArray(data.results)) {
        return data.results;
      }
      if (Array.isArray(data.data)) {
        return data.data;
      }
      if (Array.isArray(data.pages)) {
        return data.pages;
      }
    }
    
    console.warn('Unexpected response format for content pages, returning empty array:', data);
    return [];
  },

  async getByType(pageType: 'terms' | 'privacy', lang?: string): Promise<{ content: string; page_type: string; language: string }> {
    const url = lang ? `/core/content-pages/by-type/${pageType}/?lang=${lang}` : `/core/content-pages/by-type/${pageType}/`;
    return apiClient.get(url);
  },

  async get(pageId: number): Promise<ContentPage> {
    return apiClient.get<ContentPage>(`/core/content-pages/${pageId}/`);
  },

  async update(pageId: number, data: ContentPageUpdate): Promise<ContentPage> {
    return apiClient.put<ContentPage>(`/core/content-pages/${pageId}/`, data);
  },

  async create(data: { page_type: 'terms' | 'privacy' } & ContentPageUpdate): Promise<ContentPage> {
    return apiClient.post<ContentPage>('/core/content-pages/', data);
  },
};
