import { apiClient } from './api';
import { Notification } from '../types/lms';

const notificationsService = {
  async getNotifications(params?: { read?: boolean }): Promise<Notification[]> {
    const data = await apiClient.get<any>('/notifications/', params);
    
    // Backend возвращает пагинированный ответ Django REST Framework
    if (data && typeof data === 'object' && Array.isArray(data.results)) {
      return data.results;
    }
    
    // Fallback для непагинированных ответов (обратная совместимость)
    if (Array.isArray(data)) {
      return data;
    }
    
    // Если данные в другом формате, возвращаем пустой массив
    return [];
  },

  async markAsRead(notificationId: string): Promise<Notification> {
    return apiClient.put<Notification>(`/notifications/${notificationId}/read/`);
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.post('/notifications/mark_all_read/');
  },
};

export { notificationsService };

