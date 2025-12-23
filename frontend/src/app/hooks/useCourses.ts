import { useState, useEffect, useCallback } from 'react';
import { coursesService } from '../services/courses';
import { Course } from '../types/lms';
import { PaginatedResponse } from '../types/pagination';

export function useCourses(params?: { 
  status?: string; 
  category?: string; 
  search?: string;
  page?: number;
  page_size?: number;
}) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [pagination, setPagination] = useState<{ count: number; next: string | null; previous: string | null }>({
    count: 0,
    next: null,
    previous: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await coursesService.getCourses(params);
      setCourses(data.results);
      setPagination({
        count: data.count,
        next: data.next,
        previous: data.previous,
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка загрузки курсов';
      setError(errorMessage);
      console.error('Failed to fetch courses:', err);
      setCourses([]);
      setPagination({ count: 0, next: null, previous: null });
    } finally {
      setLoading(false);
    }
  }, [params?.status, params?.category, params?.search, params?.page, params?.page_size]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const refetch = useCallback(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, pagination, loading, error, refetch };
}

export function useCourse(courseId?: string) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await coursesService.getCourse(courseId);
        setCourse(data);
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки курса');
        console.error('Failed to fetch course:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  return { course, loading, error };
}

