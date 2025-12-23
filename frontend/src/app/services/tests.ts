import { apiClient } from './api';
import { Test, Question } from '../types/lms';
import { PaginatedResponse, PaginationParams } from '../types/pagination';

// Вспомогательные функции для конвертации форматов вопросов

/**
 * Конвертирует вопрос из frontend формата в backend формат
 */
function convertQuestionToBackendFormat(question: Question): any {
  const backendQuestion: any = {
    type: question.type,
    text: question.text,
    order: question.order,
    weight: question.weight,
  };

  if (question.type === 'yes_no') {
    // Для yes_no правильный ответ хранится в correctAnswer
    backendQuestion.options = [
      { text: 'Да', is_correct: question.correctAnswer === 'Да' },
      { text: 'Нет', is_correct: question.correctAnswer === 'Нет' }
    ];
  } else if (question.type === 'short_answer') {
    // Для short_answer правильный ответ хранится в correctAnswer
    backendQuestion.options = [
      { text: question.correctAnswer || '', is_correct: true }
    ];
  } else if (question.type === 'single_choice' || question.type === 'multiple_choice') {
    // Для single_choice и multiple_choice options - массив строк
    // correctAnswer - строка или массив строк
    const optionsArray = Array.isArray(question.options) 
      ? question.options.filter((opt): opt is string => typeof opt === 'string')
      : [];
    
    const correctAnswers = Array.isArray(question.correctAnswer) 
      ? question.correctAnswer 
      : question.correctAnswer ? [question.correctAnswer] : [];
    
    backendQuestion.options = optionsArray.map((opt: string, index: number) => ({
      text: opt,
      is_correct: correctAnswers.includes(opt),
      id: `opt-${index}`
    }));
  } else {
    // Для других типов вопросов (matching, ordering) - пустой массив options
    backendQuestion.options = [];
  }

  return backendQuestion;
}

/**
 * Конвертирует вопрос из backend формата в frontend формат
 */
function convertQuestionFromBackendFormat(question: any): Question {
  const frontendQuestion: Question = {
    id: String(question.id),
    type: question.type,
    text: question.text,
    order: question.order,
    weight: question.weight,
  };

  if (question.type === 'yes_no') {
    // Для yes_no извлекаем правильный ответ из options
    const correctOption = question.options?.find((opt: any) => opt.is_correct);
    frontendQuestion.correctAnswer = correctOption?.text || '';
    frontendQuestion.options = ['Да', 'Нет'];
  } else if (question.type === 'short_answer') {
    // Для short_answer правильный ответ в options[0].text
    const correctOption = question.options?.[0];
    frontendQuestion.correctAnswer = correctOption?.text || '';
    frontendQuestion.options = undefined;
  } else if (question.type === 'single_choice' || question.type === 'multiple_choice') {
    // Для single_choice и multiple_choice извлекаем options и correctAnswer
    frontendQuestion.options = question.options?.map((opt: any) => opt.text) || [];
    const correctOptions = question.options?.filter((opt: any) => opt.is_correct) || [];
    if (question.type === 'single_choice') {
      frontendQuestion.correctAnswer = correctOptions[0]?.text || '';
    } else {
      frontendQuestion.correctAnswer = correctOptions.map((opt: any) => opt.text);
    }
  } else {
    // Для других типов вопросов (matching, ordering)
    frontendQuestion.options = question.options?.map((opt: any) => opt.text) || [];
    frontendQuestion.correctAnswer = undefined;
  }

  return frontendQuestion;
}

import { PaginatedResponse, PaginationParams } from '../types/pagination';

const testsService = {
  async getTests(params?: { 
    course?: string; 
    search?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<Test>> {
    const data = await apiClient.get<any>('/tests/', params);
    
    // Backend возвращает пагинированный ответ Django REST Framework
    let tests: any[] = [];
    let count = 0;
    let next: string | null = null;
    let previous: string | null = null;
    
    if (data && typeof data === 'object' && Array.isArray(data.results)) {
      tests = data.results;
      count = data.count || tests.length;
      next = data.next || null;
      previous = data.previous || null;
    } else if (Array.isArray(data)) {
      tests = data;
      count = data.length;
    } else if (data && typeof data === 'object') {
      tests = data.data || data.tests || [];
      count = data.count || tests.length;
      next = data.next || null;
      previous = data.previous || null;
    }
    
    // Обрабатываем course: преобразуем в courseId для каждого теста
    tests = tests.map((test: any) => {
      if (test.course) {
        test.courseId = typeof test.course === 'string' ? test.course : String(test.course);
      } else {
        test.courseId = '';
      }
      return test;
    });
    
    return {
      results: tests,
      count,
      next,
      previous,
    };
  },

  async getTest(id: string): Promise<Test> {
    const data = await apiClient.get<any>(`/tests/${id}/`);
    
    // Конвертируем вопросы из backend формата в frontend формат
    if (data.questions && Array.isArray(data.questions)) {
      data.questions = data.questions.map((q: any) => convertQuestionFromBackendFormat(q));
    }
    
    // Обрабатываем course: преобразуем в courseId
    if (data.course) {
      data.courseId = typeof data.course === 'string' ? data.course : String(data.course);
    } else {
      data.courseId = '';
    }
    
    return data as Test;
  },

  async createTest(test: Partial<Test>): Promise<Test> {
    // Сохраняем вопросы отдельно
    const questions = test.questions || [];
    
    // Обрабатываем courseId: если пустая строка, передаем null, иначе значение или null
    let courseId: string | number | null = null;
    if (test.courseId) {
      courseId = test.courseId;
    } else if (test.course) {
      courseId = typeof test.course === 'string' ? test.course : test.course?.id;
    }
    // Если courseId - пустая строка, преобразуем в null
    if (courseId === '' || courseId === undefined) {
      courseId = null;
    }
    
    // Convert frontend format to backend format
    const backendTest: any = {
      ...test,
      course_id: courseId,
      passing_score: test.passingScore || test.passing_score,
      time_limit: test.timeLimit || test.time_limit,
      max_attempts: test.maxAttempts || test.max_attempts,
      is_active: test.is_active !== undefined ? test.is_active : true,
    };
    // Remove frontend-specific fields
    delete backendTest.courseId;
    delete backendTest.course;
    delete backendTest.passingScore;
    delete backendTest.timeLimit;
    delete backendTest.maxAttempts;
    delete backendTest.status;
    delete backendTest.attemptsUsed;
    delete backendTest.attemptsTotal;
    delete backendTest.questions; // Удаляем вопросы, они будут созданы отдельно
    delete backendTest.shuffleQuestions; // Frontend-only field
    delete backendTest.showResults; // Frontend-only field
    
    // Создаем тест без вопросов
    const createdTest = await apiClient.post<any>('/tests/', backendTest);
    
    // Создаем вопросы через отдельный endpoint
    if (questions.length > 0) {
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const backendQuestion = convertQuestionToBackendFormat({
          ...question,
          order: question.order || i + 1,
        });
        try {
          await apiClient.post(`/tests/${createdTest.id}/questions/`, backendQuestion);
        } catch (error) {
          console.error(`Failed to create question ${i + 1}:`, error);
        }
      }
    }
    
    // Загружаем тест с вопросами для возврата
    return this.getTest(String(createdTest.id));
  },

  async updateTest(id: string, test: Partial<Test>): Promise<Test> {
    // Сохраняем вопросы отдельно
    const questions = test.questions || [];
    
    // Обрабатываем courseId: если пустая строка, передаем null, иначе значение или null
    let courseId: string | number | null = null;
    if (test.courseId) {
      courseId = test.courseId;
    } else if (test.course) {
      courseId = typeof test.course === 'string' ? test.course : test.course?.id;
    }
    // Если courseId - пустая строка, преобразуем в null
    if (courseId === '' || courseId === undefined) {
      courseId = null;
    }
    
    // Convert frontend format to backend format
    const backendTest: any = {
      ...test,
      course_id: courseId,
      passing_score: test.passingScore || test.passing_score,
      time_limit: test.timeLimit || test.time_limit,
      max_attempts: test.maxAttempts || test.max_attempts,
      is_active: test.is_active !== undefined ? test.is_active : true,
    };
    // Remove frontend-specific fields
    delete backendTest.courseId;
    delete backendTest.course;
    delete backendTest.passingScore;
    delete backendTest.timeLimit;
    delete backendTest.maxAttempts;
    delete backendTest.status;
    delete backendTest.attemptsUsed;
    delete backendTest.attemptsTotal;
    delete backendTest.questions; // Удаляем вопросы, они будут обновлены отдельно
    delete backendTest.shuffleQuestions; // Frontend-only field
    delete backendTest.showResults; // Frontend-only field
    
    // Обновляем тест
    await apiClient.put(`/tests/${id}/`, backendTest);
    
    // Получаем существующие вопросы
    const existingQuestions = await this.getTestQuestions(id);
    const existingQuestionIds = new Set(existingQuestions.map(q => String(q.id)));
    const newQuestionIds = new Set(questions.map(q => q.id).filter(id => id && !String(id).startsWith('q-')));
    
    // Удаляем вопросы, которых нет в новом списке
    for (const existingQuestion of existingQuestions) {
      if (!newQuestionIds.has(String(existingQuestion.id))) {
        try {
          await apiClient.delete(`/tests/${id}/questions/${existingQuestion.id}/`);
        } catch (error) {
          console.error(`Failed to delete question ${existingQuestion.id}:`, error);
        }
      }
    }
    
    // Создаем или обновляем вопросы
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const backendQuestion = convertQuestionToBackendFormat({
        ...question,
        order: question.order || i + 1,
      });
      
      const questionId = question.id && !String(question.id).startsWith('q-') ? String(question.id) : null;
      
      try {
        if (questionId && existingQuestionIds.has(questionId)) {
          // Обновляем существующий вопрос
          await apiClient.put(`/tests/${id}/questions/${questionId}/`, backendQuestion);
        } else {
          // Создаем новый вопрос
          await apiClient.post(`/tests/${id}/questions/`, backendQuestion);
        }
      } catch (error) {
        console.error(`Failed to save question ${i + 1}:`, error);
        // Продолжаем обработку остальных вопросов
      }
    }
    
    // Загружаем обновленный тест с вопросами для возврата
    return this.getTest(id);
  },

  async deleteTest(id: string): Promise<void> {
    await apiClient.delete(`/tests/${id}/`);
  },

  async getTestQuestions(testId: string): Promise<Question[]> {
    const data = await apiClient.get<any>(`/tests/${testId}/questions/`);
    
    // Backend может возвращать данные в разных форматах:
    // 1. Прямой массив: [question1, question2, ...]
    // 2. Пагинированный ответ: { results: [...], count: N, next: ..., previous: ... }
    // 3. Объект с данными: { data: [...] }
    
    let questionsArray: any[] = [];
    if (Array.isArray(data)) {
      questionsArray = data;
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.results)) {
        questionsArray = data.results;
      } else if (Array.isArray(data.data)) {
        questionsArray = data.data;
      } else if (Array.isArray(data.questions)) {
        questionsArray = data.questions;
      }
    }
    
    // Конвертируем вопросы из backend формата в frontend формат
    return questionsArray.map((q: any) => convertQuestionFromBackendFormat(q));
  },

  async addQuestion(testId: string, question: Partial<Question>): Promise<Question> {
    const backendQuestion = convertQuestionToBackendFormat(question as Question);
    const created = await apiClient.post<any>(`/tests/${testId}/questions/`, backendQuestion);
    return convertQuestionFromBackendFormat(created);
  },

  async updateQuestion(testId: string, questionId: string, question: Partial<Question>): Promise<Question> {
    const backendQuestion = convertQuestionToBackendFormat(question as Question);
    const updated = await apiClient.put<any>(`/tests/${testId}/questions/${questionId}/`, backendQuestion);
    return convertQuestionFromBackendFormat(updated);
  },

  async deleteQuestion(testId: string, questionId: string): Promise<void> {
    await apiClient.delete(`/tests/${testId}/questions/${questionId}/`);
  },
};

export { testsService };

