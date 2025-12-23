import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import React from 'react';
import { render, screen, waitFor } from '../../utils/testUtils';
import { AdminDashboard } from '../../../components/lms/AdminDashboard';
import { mockAnalyticsService } from '../../mocks/services';
import { useAnalytics } from '../../../hooks/useAnalytics';

// Mock hooks
jest.mock('../../../hooks/useAnalytics');
jest.mock('../../../hooks/useCourses');
jest.mock('../../../hooks/useTests');

const mockUseAnalytics = useAnalytics as jest.MockedFunction<typeof useAnalytics>;

describe('AdminDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Overview Section', () => {
    it('should display loading state when data is loading', () => {
      mockUseAnalytics.mockReturnValue({
        stats: null,
        loading: true,
        error: null,
      });

      render(<AdminDashboard />);
      
      expect(screen.getByText(/Загрузка статистики/i)).toBeInTheDocument();
    });

    it('should display error message when there is an error', () => {
      mockUseAnalytics.mockReturnValue({
        stats: null,
        loading: false,
        error: 'Failed to load statistics',
      });

      render(<AdminDashboard />);
      
      expect(screen.getByText(/Ошибка загрузки статистики/i)).toBeInTheDocument();
      expect(screen.getByText(/Failed to load statistics/i)).toBeInTheDocument();
    });

    it('should display statistics cards when data is loaded', () => {
      const mockStats = {
        total_students: 100,
        active_students: 80,
        active_courses: 10,
        completed_courses: 5,
        tests_today: 25,
        success_rate: 85,
        total_certificates: 50,
        certificates_this_month: 10,
      };

      mockUseAnalytics.mockReturnValue({
        stats: mockStats,
        loading: false,
        error: null,
      });

      render(<AdminDashboard />);
      
      expect(screen.getByText(/Всего студентов/i)).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText(/Активных курсов/i)).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText(/Тестов сегодня/i)).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText(/Выдано сертификатов/i)).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('should display quick action buttons', () => {
      mockUseAnalytics.mockReturnValue({
        stats: null,
        loading: false,
        error: null,
      });

      render(<AdminDashboard />);
      
      expect(screen.getByText(/Создать курс/i)).toBeInTheDocument();
      expect(screen.getByText(/Добавить студента/i)).toBeInTheDocument();
      expect(screen.getByText(/Создать тест/i)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should switch between sections', async () => {
      mockUseAnalytics.mockReturnValue({
        stats: null,
        loading: false,
        error: null,
      });

      render(<AdminDashboard />);
      
      // Initially Overview should be active
      const overviewButton = screen.getByText(/Обзор/i).closest('button');
      expect(overviewButton).toHaveClass('bg-blue-600');
      
      // Click on Courses section
      const coursesButton = screen.getByText(/Курсы/i).closest('button');
      if (coursesButton) {
        coursesButton.click();
        await waitFor(() => {
          expect(coursesButton).toHaveClass('bg-blue-600');
        });
      }
    });
  });
});

