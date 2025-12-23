import { useState, useEffect } from 'react';
import { examsService } from '../services/exams';
import { TestAttempt } from '../types/lms';

export function useMyAttempts() {
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await examsService.getMyAttempts();
        // Защита от не-массивов
        const dataArray = Array.isArray(data) ? data : [];
        setAttempts(dataArray);
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки попыток');
        console.error('Failed to fetch attempts:', err);
        setAttempts([]); // Устанавливаем пустой массив при ошибке
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, []);

  return { attempts, loading, error };
}

