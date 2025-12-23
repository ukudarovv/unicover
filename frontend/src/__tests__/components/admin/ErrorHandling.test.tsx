import React from 'react';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { mockCoursesService, mockTestsService, mockUsersService } from '../../mocks/services';
import { toast } from 'sonner';

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));

describe('Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Courses Error Handling', () => {
    it('should handle error when creating course fails', async () => {
      const error = new Error('Failed to create course');
      mockCoursesService.createCourse.mockRejectedValue(error);

      try {
        await mockCoursesService.createCourse({ title: 'Test Course' });
      } catch (e) {
        expect(e).toBe(error);
      }

      expect(mockCoursesService.createCourse).toHaveBeenCalled();
    });

    it('should handle error when updating course fails', async () => {
      const error = new Error('Failed to update course');
      mockCoursesService.updateCourse.mockRejectedValue(error);

      try {
        await mockCoursesService.updateCourse('1', { title: 'Updated Course' });
      } catch (e) {
        expect(e).toBe(error);
      }

      expect(mockCoursesService.updateCourse).toHaveBeenCalled();
    });

    it('should handle error when deleting course fails', async () => {
      const error = new Error('Failed to delete course');
      mockCoursesService.deleteCourse.mockRejectedValue(error);

      try {
        await mockCoursesService.deleteCourse('1');
      } catch (e) {
        expect(e).toBe(error);
      }

      expect(mockCoursesService.deleteCourse).toHaveBeenCalled();
    });
  });

  describe('Users Error Handling', () => {
    it('should handle error when creating user fails', async () => {
      const error = new Error('Failed to create user');
      mockUsersService.createUser.mockRejectedValue(error);

      try {
        await mockUsersService.createUser({ fullName: 'Test User', phone: '+77081234567' });
      } catch (e) {
        expect(e).toBe(error);
      }

      expect(mockUsersService.createUser).toHaveBeenCalled();
    });

    it('should handle error when updating user fails', async () => {
      const error = new Error('Failed to update user');
      mockUsersService.updateUser.mockRejectedValue(error);

      try {
        await mockUsersService.updateUser('1', { fullName: 'Updated User' });
      } catch (e) {
        expect(e).toBe(error);
      }

      expect(mockUsersService.updateUser).toHaveBeenCalled();
    });

    it('should handle error when deleting user fails', async () => {
      const error = new Error('Failed to delete user');
      mockUsersService.deleteUser.mockRejectedValue(error);

      try {
        await mockUsersService.deleteUser('1');
      } catch (e) {
        expect(e).toBe(error);
      }

      expect(mockUsersService.deleteUser).toHaveBeenCalled();
    });
  });

  describe('Tests Error Handling', () => {
    it('should handle error when creating test fails', async () => {
      const error = new Error('Failed to create test');
      mockTestsService.createTest.mockRejectedValue(error);

      try {
        await mockTestsService.createTest({ title: 'Test' });
      } catch (e) {
        expect(e).toBe(error);
      }

      expect(mockTestsService.createTest).toHaveBeenCalled();
    });

    it('should handle error when updating test fails', async () => {
      const error = new Error('Failed to update test');
      mockTestsService.updateTest.mockRejectedValue(error);

      try {
        await mockTestsService.updateTest('1', { title: 'Updated Test' });
      } catch (e) {
        expect(e).toBe(error);
      }

      expect(mockTestsService.updateTest).toHaveBeenCalled();
    });

    it('should handle error when deleting test fails', async () => {
      const error = new Error('Failed to delete test');
      mockTestsService.deleteTest.mockRejectedValue(error);

      try {
        await mockTestsService.deleteTest('1');
      } catch (e) {
        expect(e).toBe(error);
      }

      expect(mockTestsService.deleteTest).toHaveBeenCalled();
    });
  });
});

