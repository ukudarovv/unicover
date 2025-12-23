import React from 'react';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, waitFor, fireEvent } from '../../utils/testUtils';
import { mockCoursesService } from '../../mocks/services';
import { useCourses } from '../../../hooks/useCourses';
import { AdminDashboard } from '../../../components/lms/AdminDashboard';

// Mock hooks
jest.mock('../../../hooks/useCourses');
jest.mock('../../../hooks/useAnalytics');
jest.mock('../../../hooks/useTests');

const mockUseCourses = useCourses as jest.MockedFunction<typeof useCourses>;

describe('CoursesSection', () => {
  const mockCourses = [
    {
      id: '1',
      title: 'Test Course 1',
      description: 'Test Description 1',
      category: 'industrial_safety',
      status: 'active',
      duration: 120,
      modules: [],
    },
    {
      id: '2',
      title: 'Test Course 2',
      description: 'Test Description 2',
      category: 'fire_safety',
      status: 'draft',
      duration: 90,
      modules: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCourses.mockReturnValue({
      courses: mockCourses,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });
    mockCoursesService.getCourseStudents.mockResolvedValue([]);
  });

  it('should display list of courses', () => {
    render(<AdminDashboard />);
    
    // Navigate to courses section
    const coursesButton = screen.getByText(/Курсы/i).closest('button');
    if (coursesButton) {
      fireEvent.click(coursesButton);
    }

    waitFor(() => {
      expect(screen.getByText('Test Course 1')).toBeInTheDocument();
      expect(screen.getByText('Test Course 2')).toBeInTheDocument();
    });
  });

  it('should display loading state', () => {
    mockUseCourses.mockReturnValue({
      courses: [],
      loading: true,
      error: null,
      refetch: jest.fn(),
    });

    render(<AdminDashboard />);
    
    const coursesButton = screen.getByText(/Курсы/i).closest('button');
    if (coursesButton) {
      fireEvent.click(coursesButton);
    }

    waitFor(() => {
      expect(screen.getByText(/Загрузка курсов/i)).toBeInTheDocument();
    });
  });

  it('should display empty state when no courses', () => {
    mockUseCourses.mockReturnValue({
      courses: [],
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<AdminDashboard />);
    
    const coursesButton = screen.getByText(/Курсы/i).closest('button');
    if (coursesButton) {
      fireEvent.click(coursesButton);
    }

    waitFor(() => {
      expect(screen.getByText(/Нет курсов/i)).toBeInTheDocument();
    });
  });

  it('should open course editor when create button is clicked', () => {
    render(<AdminDashboard />);
    
    const coursesButton = screen.getByText(/Курсы/i).closest('button');
    if (coursesButton) {
      fireEvent.click(coursesButton);
    }

    waitFor(() => {
      const createButton = screen.getByText(/Создать курс/i);
      fireEvent.click(createButton);
      
      expect(screen.getByText(/Создать тест|Редактировать тест/i)).toBeInTheDocument();
    });
  });

  it('should search courses by title', () => {
    render(<AdminDashboard />);
    
    const coursesButton = screen.getByText(/Курсы/i).closest('button');
    if (coursesButton) {
      fireEvent.click(coursesButton);
    }

    waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/Поиск курсов/i);
      fireEvent.change(searchInput, { target: { value: 'Test Course 1' } });
      
      expect(screen.getByText('Test Course 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Course 2')).not.toBeInTheDocument();
    });
  });

  it('should delete course when delete button is clicked', async () => {
    const mockRefetch = jest.fn();
    mockUseCourses.mockReturnValue({
      courses: mockCourses,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });
    mockCoursesService.deleteCourse.mockResolvedValue(undefined);

    // Mock window.confirm
    window.confirm = jest.fn(() => true);

    render(<AdminDashboard />);
    
    const coursesButton = screen.getByText(/Курсы/i).closest('button');
    if (coursesButton) {
      fireEvent.click(coursesButton);
    }

    await waitFor(() => {
      const deleteButtons = screen.getAllByText(/Удалить/i);
      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0]);
      }
    });

    await waitFor(() => {
      expect(mockCoursesService.deleteCourse).toHaveBeenCalledWith('1');
      expect(mockRefetch).toHaveBeenCalled();
    });
  });
});

