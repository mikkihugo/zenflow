// Jest setup file for Hybrid TDD tests
import "jest-extended";

// Global test timeout for complex operations
import { vi } from "vitest";

// Global test timeout set via vitest config

// Setup for both London and Classical TDD approaches
beforeEach(() => {
	// Clear mocks for London TDD
	vi.clearAllMocks();
});
