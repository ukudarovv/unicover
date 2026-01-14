import { apiClient } from './api';
import { Partner } from '../types/partners';

const partnersService = {
  async getPartners(): Promise<Partner[]> {
    const data = await apiClient.get<any>('/partners/');
    
    // Backend может возвращать данные в разных форматах:
    // 1. Прямой массив: [partner1, partner2, ...]
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
      if (Array.isArray(data.partners)) {
        return data.partners;
      }
    }
    
    console.warn('Unexpected response format for partners, returning empty array:', data);
    return [];
  },

  async getPartner(id: string): Promise<Partner> {
    return apiClient.get<Partner>(`/partners/${id}/`);
  },

  async createPartner(partnerData: FormData): Promise<Partner> {
    return apiClient.post<Partner>('/partners/', partnerData);
  },

  async updatePartner(id: string, partnerData: FormData): Promise<Partner> {
    return apiClient.put<Partner>(`/partners/${id}/`, partnerData);
  },

  async deletePartner(id: string): Promise<void> {
    return apiClient.delete(`/partners/${id}/`);
  },
};

export { partnersService };

