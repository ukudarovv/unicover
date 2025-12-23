// Export all mocks
export * from './services';

// Mock React Router
export const mockNavigate = jest.fn();
export const mockUseNavigate = () => mockNavigate;
export const mockUseParams = jest.fn(() => ({}));
export const mockUseLocation = jest.fn(() => ({
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'default',
}));

// Mock UserContext
export const mockUser = {
  id: '1',
  fullName: 'Test Admin',
  email: 'admin@test.com',
  phone: '+77770000001',
  role: 'admin',
  verified: true,
};

export const mockUserContext = {
  user: mockUser,
  loading: false,
  login: jest.fn(),
  logout: jest.fn(),
  updateUser: jest.fn(),
  refreshUser: jest.fn(),
};

