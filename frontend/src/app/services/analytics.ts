import { apiClient } from './api';

export interface AnalyticsStats {
  total_students: number;
  active_students: number;
  active_courses: number;
  completed_courses: number;
  tests_today: number;
  success_rate: number;
  avg_score: number;
  total_certificates: number;
  certificates_this_month: number;
}

export interface EnrollmentTrend {
  month: string;
  students: number;
}

export interface TestResultsDistribution {
  name: string;
  value: number;
  color: string;
}

export interface CoursePopularity {
  name: string;
  students: number;
}

export interface TopStudent {
  id: string;
  name: string;
  rank: number;
  courses: number;
  avg_score: number;
  certificates: number;
}

const analyticsService = {
  async getStats(): Promise<AnalyticsStats> {
    return apiClient.get<AnalyticsStats>('/analytics/stats/');
  },

  async getEnrollmentTrend(): Promise<EnrollmentTrend[]> {
    return apiClient.get<EnrollmentTrend[]>('/analytics/enrollment_trend/');
  },

  async getTestResultsDistribution(): Promise<TestResultsDistribution[]> {
    return apiClient.get<TestResultsDistribution[]>('/analytics/test_results_distribution/');
  },

  async getCoursesPopularity(): Promise<CoursePopularity[]> {
    return apiClient.get<CoursePopularity[]>('/analytics/courses_popularity/');
  },

  async getTopStudents(): Promise<TopStudent[]> {
    return apiClient.get<TopStudent[]>('/analytics/top_students/');
  },
};

export { analyticsService };

