// Jest setup file for Hybrid TDD tests
import 'jest-extended';

// Global test timeout for complex operations
import { jest } from '@jest/globals';

jest.setTimeout(60000);

// Setup for both London and Classical TDD approaches
beforeEach(() => {
  // Clear mocks for London TDD
  jest.clearAllMocks();
});
