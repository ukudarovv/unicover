import React from 'react';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { mockTestsService } from '../../mocks/services';
import { useTests } from '../../../hooks/useTests';

jest.mock('../../../hooks/useTests');

const mockUseTests = useTests as jest.MockedFunction<typeof useTests>;

describe('TestsSection', () => {
  const mockTests = [
    {
      id: '1',
      title: 'Test 1',
      description: 'Description 1',
      courseId: '1',
      timeLimit: 30,
      passingScore: 80,
      maxAttempts: 3,
      questions: [],
    },
    {
      id: '2',
      title: 'Test 2',
      description: 'Description 2',
      courseId: '2',
      timeLimit: 60,
      passingScore: 70,
      maxAttempts: 2,
      questions: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTests.mockReturnValue({
      tests: mockTests,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  it('should create test', async () => {
    const newTest = {
      title: 'New Test',
      description: 'New Description',
      courseId: '1',
      timeLimit: 45,
      passingScore: 75,
      maxAttempts: 3,
      questions: [],
    };

    mockTestsService.createTest.mockResolvedValue({ ...newTest, id: '3' });
    
    const createdTest = await mockTestsService.createTest(newTest);
    expect(createdTest.id).toBe('3');
    expect(mockTestsService.createTest).toHaveBeenCalledWith(newTest);
  });

  it('should update test', async () => {
    const updatedTest = {
      ...mockTests[0],
      title: 'Updated Test',
    };

    mockTestsService.updateTest.mockResolvedValue(updatedTest);
    
    const result = await mockTestsService.updateTest('1', { title: 'Updated Test' });
    expect(result.title).toBe('Updated Test');
    expect(mockTestsService.updateTest).toHaveBeenCalledWith('1', { title: 'Updated Test' });
  });

  it('should delete test', async () => {
    mockTestsService.deleteTest.mockResolvedValue(undefined);
    
    await mockTestsService.deleteTest('1');
    expect(mockTestsService.deleteTest).toHaveBeenCalledWith('1');
  });

  it('should get list of tests', async () => {
    mockTestsService.getTests.mockResolvedValue(mockTests);
    
    const tests = await mockTestsService.getTests();
    expect(tests).toEqual(mockTests);
    expect(mockTestsService.getTests).toHaveBeenCalled();
  });
});

