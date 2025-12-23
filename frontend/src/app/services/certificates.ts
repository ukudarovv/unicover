import { apiClient } from './api';
import { Certificate } from '../types/lms';

const certificatesService = {
  async getCertificates(params?: { user?: string }): Promise<Certificate[]> {
    const data = await apiClient.get<any>('/certificates/', params);
    
    // Backend может возвращать данные в разных форматах:
    // 1. Прямой массив: [cert1, cert2, ...]
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
      if (Array.isArray(data.certificates)) {
        return data.certificates;
      }
    }
    
    console.warn('Unexpected response format for certificates, returning empty array:', data);
    return [];
  },

  async getCertificate(id: string): Promise<Certificate> {
    return apiClient.get<Certificate>(`/certificates/${id}/`);
  },

  async downloadCertificatePDF(id: string): Promise<Blob> {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/certificates/${id}/pdf/`,
      {
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to download certificate');
    }
    
    return response.blob();
  },

  async verifyCertificate(qrCode: string): Promise<{ valid: boolean; certificate?: Certificate }> {
    return apiClient.get(`/certificates/verify/${qrCode}/`);
  },
};

export { certificatesService };

