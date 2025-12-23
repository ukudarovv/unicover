// Mock services for testing

export const mockCoursesService = {
  getCourses: jest.fn(),
  getCourse: jest.fn(),
  createCourse: jest.fn(),
  updateCourse: jest.fn(),
  deleteCourse: jest.fn(),
  getCourseStudents: jest.fn(),
  enrollStudents: jest.fn(),
  completeLesson: jest.fn(),
};

export const mockTestsService = {
  getTests: jest.fn(),
  getTest: jest.fn(),
  createTest: jest.fn(),
  updateTest: jest.fn(),
  deleteTest: jest.fn(),
  getTestQuestions: jest.fn(),
};

export const mockUsersService = {
  getUsers: jest.fn(),
  getUser: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  exportUsers: jest.fn(),
  importUsers: jest.fn(),
};

export const mockAnalyticsService = {
  getStats: jest.fn(),
  getEnrollmentTrend: jest.fn(),
  getTestResultsDistribution: jest.fn(),
  getCoursesPopularity: jest.fn(),
  getTopStudents: jest.fn(),
};

export const mockCertificatesService = {
  getCertificates: jest.fn(),
  getCertificate: jest.fn(),
  downloadCertificatePDF: jest.fn(),
  verifyCertificate: jest.fn(),
};

export const mockExamsService = {
  startTestAttempt: jest.fn(),
  saveTestAttempt: jest.fn(),
  submitTestAttempt: jest.fn(),
  getMyAttempts: jest.fn(),
};

// Mock toast
export const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
};

