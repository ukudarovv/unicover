import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from '../../contexts/UserContext';
import { mockUserContext } from '../mocks';

// Mock UserContext
jest.mock('../../contexts/UserContext', () => ({
  ...jest.requireActual('../../contexts/UserContext'),
  useUser: () => mockUserContext,
  UserProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Note: Services are not mocked by default to allow testing with real backend
// If you need to mock services in specific tests, do it in the test file itself

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));

// Mock hooks
jest.mock('../../hooks/useAnalytics', () => ({
  useAnalytics: jest.fn(() => ({
    stats: null,
    loading: false,
    error: null,
  })),
  useEnrollmentTrend: jest.fn(() => ({
    data: [],
    loading: false,
    error: null,
  })),
  useTestResultsDistribution: jest.fn(() => ({
    data: [],
    loading: false,
    error: null,
  })),
  useCoursesPopularity: jest.fn(() => ({
    data: [],
    loading: false,
    error: null,
  })),
  useTopStudents: jest.fn(() => ({
    data: [],
    loading: false,
    error: null,
  })),
}));

jest.mock('../../hooks/useCourses', () => ({
  useCourses: jest.fn(() => ({
    courses: [],
    loading: false,
    error: null,
    refetch: jest.fn(),
  })),
}));

jest.mock('../../hooks/useTests', () => ({
  useTests: jest.fn(() => ({
    tests: [],
    loading: false,
    error: null,
    refetch: jest.fn(),
  })),
}));

interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  return (
    <BrowserRouter>
      <UserProvider>
        {children}
      </UserProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

