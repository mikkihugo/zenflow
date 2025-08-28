// Vitest setup file for Hybrid TDD tests

// Global test timeout for complex operations
import { vi} from "vitest";

// Global test timeout set via vitest config

// Setup for both London and Classical TDD approaches
import { beforeEach } from 'vitest';

beforeEach(() => {
	// Clear mocks for London TDD
	vi.clearAllMocks();
});
