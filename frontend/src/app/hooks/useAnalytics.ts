import { useState, useEffect } from 'react';
import { analyticsService, AnalyticsStats, EnrollmentTrend, TestResultsDistribution, CoursePopularity, TopStudent } from '../services/analytics';

export function useAnalytics() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await analyticsService.getStats();
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки статистики');
        console.error('Failed to fetch analytics stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}

export function useEnrollmentTrend() {
  const [data, setData] = useState<EnrollmentTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await analyticsService.getEnrollmentTrend();
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки данных');
        console.error('Failed to fetch enrollment trend:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

export function useTestResultsDistribution() {
  const [data, setData] = useState<TestResultsDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await analyticsService.getTestResultsDistribution();
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки данных');
        console.error('Failed to fetch test results distribution:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

export function useCoursesPopularity() {
  const [data, setData] = useState<CoursePopularity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await analyticsService.getCoursesPopularity();
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки данных');
        console.error('Failed to fetch courses popularity:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

export function useTopStudents() {
  const [data, setData] = useState<TopStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await analyticsService.getTopStudents();
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки данных');
        console.error('Failed to fetch top students:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

