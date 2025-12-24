import { apiClient } from './api';

export interface Vacancy {
  id: string;
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  salary_min?: number;
  salary_max?: number;
  location: string;
  employment_type: string;
  employment_type_display?: string;
  status: 'draft' | 'published' | 'closed';
  status_display?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
}

const vacanciesService = {
  async getVacancies(params?: { status?: string; is_active?: boolean; location?: string }): Promise<Vacancy[]> {
    const data = await apiClient.get<any>('/vacancies/', params);
    
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
      if (Array.isArray(data.vacancies)) {
        return data.vacancies;
      }
    }
    
    console.warn('Unexpected response format for vacancies, returning empty array:', data);
    return [];
  },

  async getVacancy(id: string): Promise<Vacancy> {
    return apiClient.get<Vacancy>(`/vacancies/${id}/`);
  },

  async createVacancy(vacancy: Partial<Vacancy>): Promise<Vacancy> {
    return apiClient.post<Vacancy>('/vacancies/', vacancy);
  },

  async updateVacancy(id: string, vacancy: Partial<Vacancy>): Promise<Vacancy> {
    return apiClient.put<Vacancy>(`/vacancies/${id}/`, vacancy);
  },

  async deleteVacancy(id: string): Promise<void> {
    return apiClient.delete(`/vacancies/${id}/`);
  },
};

export { vacanciesService };

