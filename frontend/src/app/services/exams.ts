import { apiClient } from './api';
import { TestAttempt } from '../types/lms';

const examsService = {
  async startTestAttempt(testId: string): Promise<TestAttempt> {
    return apiClient.post<TestAttempt>('/exams/start/', { test_id: testId });
  },

  async saveTestAttempt(attemptId: string, answers: Record<string, any>): Promise<TestAttempt> {
    return apiClient.post<TestAttempt>(`/exams/${attemptId}/save/`, { answers });
  },

  async submitTestAttempt(attemptId: string): Promise<TestAttempt> {
    return apiClient.post<TestAttempt>(`/exams/${attemptId}/submit/`);
  },

  async getTestAttempt(attemptId: string): Promise<TestAttempt> {
    return apiClient.get<TestAttempt>(`/exams/${attemptId}/`);
  },

  async getMyAttempts(): Promise<TestAttempt[]> {
    const data = await apiClient.get<any>('/exams/my_attempts/');
    
    // Backend может возвращать данные в разных форматах:
    // 1. Прямой массив: [attempt1, attempt2, ...]
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
      if (Array.isArray(data.attempts)) {
        return data.attempts;
      }
    }
    
    console.warn('Unexpected response format for test attempts, returning empty array:', data);
    return [];
  },

  async getTestAttempts(testId: string): Promise<TestAttempt[]> {
    const data = await apiClient.get<any>(`/exams/test_attempts/?test_id=${testId}`);
    
    // Backend возвращает массив попыток
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
      if (Array.isArray(data.attempts)) {
        return data.attempts;
      }
    }
    
    console.warn('Unexpected response format for test attempts, returning empty array:', data);
    return [];
  },

  async saveAnswer(attemptId: number, answerData: { question: string; selected_options?: string[]; answer_text?: string }): Promise<void> {
    return apiClient.post(`/exams/${attemptId}/save/`, { answers: { [answerData.question]: answerData.selected_options || answerData.answer_text } });
  },
};

export { examsService };

