import { apiClient } from './api';
import { Project, ProjectDetail, ProjectCategory } from '../types/projects';

const projectsService = {
  async getProjects(params?: {
    category?: string;
    category_id?: string;
    year?: string;
    search?: string;
    ordering?: string;
  }): Promise<Project[]> {
    const data = await apiClient.get<any>('/projects/', params);
    
    // Backend может возвращать данные в разных форматах:
    // 1. Прямой массив: [project1, project2, ...]
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
      if (Array.isArray(data.projects)) {
        return data.projects;
      }
    }
    
    console.warn('Unexpected response format for projects, returning empty array:', data);
    return [];
  },

  async getProject(id: string): Promise<ProjectDetail> {
    return apiClient.get<ProjectDetail>(`/projects/${id}/`);
  },

  async getProjectCategories(): Promise<ProjectCategory[]> {
    const data = await apiClient.get<any>('/projects/categories/');
    
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
      if (Array.isArray(data.categories)) {
        return data.categories;
      }
    }
    
    console.warn('Unexpected response format for project categories, returning empty array:', data);
    return [];
  },

  async createProject(project: Partial<Project>, imageFile?: File): Promise<Project> {
    const formData = new FormData();
    
    // Append all project fields
    Object.entries(project).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'image') {
        if (key === 'characteristics') {
          // Handle characteristics JSON field - always stringify
          if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else if (typeof value === 'string') {
            // Already a string, just append it
            formData.append(key, value);
          } else {
            formData.append(key, JSON.stringify({}));
          }
        } else {
          formData.append(key, String(value));
        }
      }
    });
    
    // Append image file if provided
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    return apiClient.post<Project>('/projects/', formData, {
      headers: {} // Let browser set Content-Type with boundary for FormData
    });
  },

  async updateProject(id: string, project: Partial<Project>, imageFile?: File): Promise<Project> {
    console.log('updateProject called:', { id, project, imageFile: imageFile ? `${imageFile.name} (${imageFile.size} bytes)` : 'none' });
    
    // Always use FormData for updates to ensure proper file handling
    // This allows updating project with or without image
    const formData = new FormData();
    
    // Append all project fields
    Object.entries(project).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'image') {
        if (key === 'characteristics') {
          // Handle characteristics JSON field - always stringify
          if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else if (typeof value === 'string') {
            // Already a string, just append it
            formData.append(key, value);
          } else {
            formData.append(key, JSON.stringify({}));
          }
        } else {
          formData.append(key, String(value));
        }
      }
    });
    
    // Append image file if provided
    if (imageFile) {
      console.log('Appending image file to FormData:', imageFile.name);
      formData.append('image', imageFile);
    }
    
    // Use PUT for full update with FormData
    console.log('Sending PUT request with FormData');
    return apiClient.put<Project>(`/projects/${id}/`, formData, {
      headers: {} // Let browser set Content-Type with boundary for FormData
    });
  },

  async deleteProject(id: string): Promise<void> {
    return apiClient.delete(`/projects/${id}/`);
  },

  async addProjectImage(projectId: string, imageFile: File, order?: number): Promise<any> {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (order !== undefined) {
      formData.append('order', String(order));
    }
    
    return apiClient.post(`/projects/${projectId}/add_image/`, formData, {
      headers: {} // Let browser set Content-Type with boundary for FormData
    });
  },

  async deleteProjectImage(projectId: string, imageId: string): Promise<void> {
    return apiClient.delete(`/projects/${projectId}/images/${imageId}/`);
  },

  async createCategory(category: Partial<ProjectCategory>): Promise<ProjectCategory> {
    return apiClient.post<ProjectCategory>('/projects/categories/', category);
  },

  async updateCategory(id: string, category: Partial<ProjectCategory>): Promise<ProjectCategory> {
    return apiClient.put<ProjectCategory>(`/projects/categories/${id}/`, category);
  },

  async deleteCategory(id: string): Promise<void> {
    return apiClient.delete(`/projects/categories/${id}/`);
  },
};

export { projectsService };

