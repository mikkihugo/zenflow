/**
 * @fileoverview Test Utilities for Foundation Package
 *
 * Common test helpers, mocks, and utilities.
 */

import { performance } from "node:perf_hooks";
import { vi } from "vitest";
import type { Logger } from "../../src/core/logging";

// Mock implementations
export const mockLogger: Logger = {
	trace: vi.fn(),
	debug: vi.fn(),
	info: vi.fn(),
	warn: vi.fn(),
	error: vi.fn(),
	fatal: vi.fn(),
};

// Test data generators
export const generators = {
	uuid: () =>
		`test-uuid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,

	timestamp: () => Date.now(),

	mockError: (message = "Test error") => new Error(message),

	mockConfig: () => ({
		debug: false,
		metrics: { enabled: false },
		storage: { type: "memory" as const },
		neural: { enabled: false },
		telemetry: { enabled: false },
	}),
};

// Async test utilities
export const asyncUtils = {
	waitFor: (ms: number) =>
		new Promise<void>((resolve) => setTimeout(resolve, ms)),

	waitForCondition: async (
		condition: () => boolean | Promise<boolean>,
		timeout = 5000,
	) => {
		const start = Date.now();
		while (Date.now() - start < timeout) {
			if (await condition()) return true;
			await asyncUtils.waitFor(50);
		}
		throw new Error(`Condition not met within ${timeout}ms`);
	},

	timeout: (ms: number) =>
		new Promise<never>((_resolve, reject) =>
			setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms),
		),
};

// Environment helpers
export const envHelpers = {
	isIntegrationTest: () => process.env['RUN_INTEGRATION'] === "true",
	isPerformanceTest: () => process.env['RUN_PERFORMANCE'] === "true",
	hasApiKey: () => Boolean(process.env['CLAUDE_CODE_OAUTH_TOKEN']),

	requireIntegration: () => {
		if (!envHelpers.isIntegrationTest()) {
			throw new Error("Integration tests require RUN_INTEGRATION=true");
		}
	},

	requireApiKey: () => {
		if (!envHelpers.hasApiKey()) {
			throw new Error(
				"API tests require CLAUDE_CODE_OAUTH_TOKEN environment variable",
			);
		}
	},
};

// Performance testing utilities
export const perfUtils = {
	measureTime: async <T>(
		fn: () => Promise<T>,
	): Promise<{ result: T; duration: number }> => {
		const start = performance.now();
		const result = await fn();
		const duration = performance.now() - start;
		return { result, duration };
	},

	measureMemory: () => {
		if (process.memoryUsage) {
			return process.memoryUsage();
		}
		return null;
	},

	benchmark: async (
		fn: () => Promise<void>,
		iterations = 100,
	): Promise<{ average: number; min: number; max: number }> => {
		const times: number[] = [];

		for (let i = 0; i < iterations; i++) {
			const { duration } = await perfUtils.measureTime(fn);
			times.push(duration);
		}

		return {
			average: times.reduce((a, b) => a + b, 0) / times.length,
			min: Math.min(...times),
			max: Math.max(...times),
		};
	},
};

// Mock factory
export const createMock = {
	logger: () => ({ ...mockLogger }),

	error: (message = "Mock error", code?: string) => {
		const error = new Error(message);
		if (code) (error as Error & { code: string }).code = code;
		return error;
	},

	promise: {
		resolved: <T>(value: T) => Promise.resolve(value),
		rejected: (error: Error) => Promise.reject(error),
		delayed: <T>(value: T, delay: number) =>
			new Promise<T>((resolve) => setTimeout(() => resolve(value), delay)),
	},
};
