import { apiClient } from './api';
import { Protocol } from '../types/lms';
import { adaptProtocol } from '../utils/typeAdapters';

const protocolsService = {
  async getProtocols(params?: { user?: string; status?: string }): Promise<Protocol[]> {
    const data = await apiClient.get<any>('/protocols/', params);
    
    // Backend может возвращать данные в разных форматах:
    // 1. Прямой массив: [protocol1, protocol2, ...]
    // 2. Пагинированный ответ: { results: [...], count: N, next: ..., previous: ... }
    // 3. Объект с данными: { data: [...] }
    
    let protocolsArray: any[] = [];
    
    if (Array.isArray(data)) {
      protocolsArray = data;
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.results)) {
        protocolsArray = data.results;
      } else if (Array.isArray(data.data)) {
        protocolsArray = data.data;
      } else if (Array.isArray(data.protocols)) {
        protocolsArray = data.protocols;
      }
    }
    
    if (protocolsArray.length === 0) {
      console.warn('Unexpected response format for protocols, returning empty array:', data);
      return [];
    }
    
    // Адаптируем протоколы для фронтенда
    return protocolsArray.map(adaptProtocol);
  },

  async getProtocol(id: string): Promise<Protocol> {
    console.log('getProtocol - fetching protocol with id:', id);
    const data = await apiClient.get<any>(`/protocols/${id}/`);
    console.log('getProtocol - received data:', data);
    const adapted = adaptProtocol(data);
    console.log('getProtocol - adapted protocol:', adapted);
    return adapted;
  },

  async requestSignature(protocolId: string): Promise<{ message: string; otp_expires_at?: string; otp_code?: string; debug?: boolean }> {
    return apiClient.post<{ message: string; otp_expires_at?: string; otp_code?: string; debug?: boolean }>(`/protocols/${protocolId}/request_signature/`);
  },

  async signProtocol(protocolId: string, otp: string): Promise<Protocol> {
    const data = await apiClient.post<any>(`/protocols/${protocolId}/sign/`, { otp });
    return adaptProtocol(data);
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

