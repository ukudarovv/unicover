import { apiClient } from './api';

export interface License {
  id: string;
  title: string;
  number: string;
  category: 'surveying' | 'construction' | 'other';
  category_display?: string;
  description?: string;
  file?: string;
  file_url?: string;
  issued_date: string;
  valid_until?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

const licensesService = {
  async getLicenses(params?: { category?: string; is_active?: boolean }): Promise<License[]> {
    const data = await apiClient.get<any>('/licenses/', params);
    
    if (Array.isArray(data)) {
      return data;
    }
    
    if (data && typeof data === 'object') {
      if (Array.isArray(data.results)) {
        return data.results;
      }
      if (Array.isArray(data.data)) {
        return data.data;
      }
      if (Array.isArray(data.licenses)) {
        return data.licenses;
      }
    }
    
    console.warn('Unexpected response format for licenses, returning empty array:', data);
    return [];
  },

  async getLicense(id: string): Promise<License> {
    return apiClient.get<License>(`/licenses/${id}/`);
  },

  async createLicense(license: Partial<License>, file?: File): Promise<License> {
    const formData = new FormData();
    
    Object.keys(license).forEach(key => {
      const value = license[key as keyof License];
      if (key === 'valid_until') {
        // Для valid_until отправляем только если есть значение
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, String(value));
        }
      } else if (value !== undefined && value !== null && key !== 'file' && key !== 'file_url' && key !== 'category_display') {
        formData.append(key, String(value));
      }
    });
    
    if (file) {
      formData.append('file', file);
    }
    
    return apiClient.post<License>('/licenses/', formData);
  },

  async updateLicense(id: string, license: Partial<License>, file?: File): Promise<License> {
    const formData = new FormData();
    
    Object.keys(license).forEach(key => {
      const value = license[key as keyof License];
      if (key === 'valid_until') {
        // Для valid_until явно отправляем пустую строку, если undefined/null, чтобы очистить поле
        if (value === undefined || value === null || value === '') {
          formData.append(key, '');
        } else {
          formData.append(key, String(value));
        }
      } else if (value !== undefined && value !== null && key !== 'file' && key !== 'file_url' && key !== 'category_display') {
        formData.append(key, String(value));
      }
    });
    
    if (file) {
      formData.append('file', file);
    }
    
    return apiClient.put<License>(`/licenses/${id}/`, formData);
  },

  async deleteLicense(id: string): Promise<void> {
    return apiClient.delete(`/licenses/${id}/`);
  },

  async downloadLicense(id: string): Promise<Blob> {
    // Use apiClient with blob response type
    return apiClient.get<Blob>(`/licenses/${id}/download/`, undefined, { responseType: 'blob' });
  },
};

export { licensesService };

