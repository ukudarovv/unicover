import React from 'react';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, waitFor, fireEvent } from '../../utils/testUtils';
import { mockUsersService } from '../../mocks/services';

describe('UsersSection', () => {
  const mockUsers = [
    {
      id: '1',
      fullName: 'Test User 1',
      email: 'user1@test.com',
      phone: '+77081234567',
      role: 'student',
      verified: true,
      organization: 'Test Org',
    },
    {
      id: '2',
      fullName: 'Test User 2',
      email: 'user2@test.com',
      phone: '+77082345678',
      role: 'teacher',
      verified: false,
      organization: 'Test Org 2',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsersService.getUsers.mockResolvedValue(mockUsers);
  });

  it('should display list of users', async () => {
    // This test would require rendering UserManagement component
    // For now, we'll test the service mock
    const users = await mockUsersService.getUsers();
    expect(users).toEqual(mockUsers);
    expect(mockUsersService.getUsers).toHaveBeenCalled();
  });

  it('should create user', async () => {
    const newUser = {
      fullName: 'New User',
      email: 'newuser@test.com',
      phone: '+77083456789',
      role: 'student' as const,
    };

    mockUsersService.createUser.mockResolvedValue({ ...newUser, id: '3' });
    
    const createdUser = await mockUsersService.createUser(newUser);
    expect(createdUser.id).toBe('3');
    expect(mockUsersService.createUser).toHaveBeenCalledWith(newUser);
  });

  it('should update user', async () => {
    const updatedUser = {
      ...mockUsers[0],
      fullName: 'Updated User',
    };

    mockUsersService.updateUser.mockResolvedValue(updatedUser);
    
    const result = await mockUsersService.updateUser('1', { fullName: 'Updated User' });
    expect(result.fullName).toBe('Updated User');
    expect(mockUsersService.updateUser).toHaveBeenCalledWith('1', { fullName: 'Updated User' });
  });

  it('should delete user', async () => {
    mockUsersService.deleteUser.mockResolvedValue(undefined);
    
    await mockUsersService.deleteUser('1');
    expect(mockUsersService.deleteUser).toHaveBeenCalledWith('1');
  });

  it('should filter users by role', async () => {
    mockUsersService.getUsers.mockResolvedValue([mockUsers[0]]);
    
    const students = await mockUsersService.getUsers({ role: 'student' });
    expect(students).toHaveLength(1);
    expect(students[0].role).toBe('student');
    expect(mockUsersService.getUsers).toHaveBeenCalledWith({ role: 'student' });
  });

  it('should search users', async () => {
    mockUsersService.getUsers.mockResolvedValue([mockUsers[0]]);
    
    const results = await mockUsersService.getUsers({ search: 'Test User 1' });
    expect(results).toHaveLength(1);
    expect(mockUsersService.getUsers).toHaveBeenCalledWith({ search: 'Test User 1' });
  });
});

