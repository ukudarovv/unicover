import { apiClient } from './api';
import { Protocol } from '../types/lms';

const protocolsService = {
  async getProtocols(params?: { user?: string; status?: string }): Promise<Protocol[]> {
    const data = await apiClient.get<any>('/protocols/', params);
    
    // Backend может возвращать данные в разных форматах:
    // 1. Прямой массив: [protocol1, protocol2, ...]
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
      if (Array.isArray(data.protocols)) {
        return data.protocols;
      }
    }
    
    console.warn('Unexpected response format for protocols, returning empty array:', data);
    return [];
  },

  async getProtocol(id: string): Promise<Protocol> {
    return apiClient.get<Protocol>(`/protocols/${id}/`);
  },

  async requestSignature(protocolId: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/protocols/${protocolId}/request_signature/`);
  },

  async signProtocol(protocolId: string, otp: string): Promise<Protocol> {
    return apiClient.post<Protocol>(`/protocols/${protocolId}/sign/`, { otp });
  },

  async downloadProtocolPDF(id: string): Promise<Blob> {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/protocols/${id}/pdf/`,
      {
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to download protocol');
    }
    
    return response.blob();
  },
};

export { protocolsService };

