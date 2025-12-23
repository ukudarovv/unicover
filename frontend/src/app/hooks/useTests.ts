import { useState, useEffect, useCallback } from 'react';
import { testsService } from '../services/tests';
import { Test } from '../types/lms';
import { PaginatedResponse } from '../types/pagination';

export function useTests(params?: { 
  course?: string; 
  search?: string; 
  is_active?: boolean;
  page?: number;
  page_size?: number;
}) {
  const [tests, setTests] = useState<Test[]>([]);
  const [pagination, setPagination] = useState<{ count: number; next: string | null; previous: string | null }>({
    count: 0,
    next: null,
    previous: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await testsService.getTests(params);
      setTests(data.results);
      setPagination({
        count: data.count,
        next: data.next,
        previous: data.previous,
      });
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки тестов');
      console.error('Failed to fetch tests:', err);
      setTests([]);
      setPagination({ count: 0, next: null, previous: null });
    } finally {
      setLoading(false);
    }
  }, [params?.course, params?.search, params?.is_active, params?.page, params?.page_size]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const refetch = useCallback(() => {
    fetchTests();
  }, [fetchTests]);

  return { tests, pagination, loading, error, refetch };
}

export function useTest(testId?: string) {
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTest = async () => {
      if (!testId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await testsService.getTest(testId);
        setTest(data);
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки теста');
        console.error('Failed to fetch test:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [testId]);

  return { test, loading, error };
}

