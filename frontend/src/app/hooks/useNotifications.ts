import { useState, useEffect } from 'react';
import { notificationsService } from '../services/notifications';
import { Notification } from '../types/lms';

export function useNotifications(params?: { unread_only?: boolean; read?: boolean }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiParams: { read?: boolean } = {};
        // Backend поддерживает фильтр read, отправляем read=false для непрочитанных
        if (params?.unread_only || params?.read === false) {
          apiParams.read = false;
        }
        const data = await notificationsService.getNotifications(apiParams);
        // Гарантируем, что всегда возвращаем массив
        setNotifications(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки уведомлений');
        console.error('Failed to fetch notifications:', err);
        // При ошибке устанавливаем пустой массив
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [params?.unread_only, params?.read]);

  return { notifications, loading, error };
}

