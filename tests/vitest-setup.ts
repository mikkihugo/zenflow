/**
 * Vitest Global Setup
 *
 * This file sets up the global test environment for Vitest tests.
 * It includes enhanced matchers, test utilities, and environment configuration.
 */

// Import Vitest globals and utilities
import { expect, vi} from "vitest";
import "./global-types";

// Set up proper event handling to prevent memory leaks and hangs
// import { EventEmitter} from "@claude-zen/foundation";
import { EventEmitter } from 'events';

// Increase max listeners globally to prevent warnings
EventEmitter.defaultMaxListeners = 20;

// Mock process.exit to prevent tests from actually exiting
vi.stubGlobal("process", {
	...process,
	exit:vi.fn(),
	on:vi.fn(),
	off:vi.fn(),
	removeListener:vi.fn(),
	removeAllListeners:vi.fn(),
	emit:vi.fn(),
});

// Set up timeout handling for hanging tests
const originalSetTimeout = globalThis.setTimeout;
globalThis.setTimeout = ((
	callback:(...args: any[]) => void,
	delay?:number,
	...args:any[]
) => {
	// Limit timeouts to max 60 seconds to prevent infinite hangs
	const safeDelay = Math.min(delay || 0, 60000);
	return originalSetTimeout(callback, safeDelay, ...args);
}) as typeof setTimeout;

// Add custom matchers for better test assertions
expect.extend({
	toBeWithinRange(received:number, floor:number, ceiling:number) {
		const pass = received >= floor && received <= ceiling;
		if (pass) {
			return {
				message: () =>
					`expected ${received} not to be within range ${floor} - ${ceiling}`,
				pass: true,
};
}
		return {
			message: () =>
				`expected ${received} to be within range ${floor} - ${ceiling}`,
			pass: false,
};
},

	toHaveBeenCalledWithObjectContaining(received: any, expected: unknown) {
		const pass = received.mock.calls.some((call: unknown[]) =>
			call.some(
				(arg) =>
					typeof arg === "object" &&
					arg !== null &&
					Object.keys(expected as Record<string, unknown>).every(
						(key) => key in arg && (arg as any)[key] === (expected as any)[key],
					),
			),
		);

		return {
			message: () =>
				pass
					? `expected mock not to have been called with object containing ${JSON.stringify(expected)}`
					: `expected mock to have been called with object containing ${JSON.stringify(expected)}`,
			pass,
};
},
});

// Global test utilities
globalThis.testUtils = {
	/**
	 * Create a mock logger for tests
	 */
	createMockLogger:() => ({
		debug:vi.fn(),
		info:vi.fn(),
		warn:vi.fn(),
		error:vi.fn(),
		log:vi.fn(),
}),

	/**
	 * Create a mock configuration object
	 */
	createMockConfig:(overrides: any = {}) => ({
		database:{
			type:"sqlite",
			path:":memory:",
			...(overrides.database || {}),
},
		memory:{
			type:"memory",
			maxSize:1000,
			...(overrides.memory || {}),
},
		neural:{
			enabled:false,
			...(overrides.neural || {}),
},
		...overrides,
}),

	/**
	 * Wait for a specified amount of time
	 */
	wait:(ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

	/**
	 * Create a temporary directory for tests
	 */
	createTempDir:async () => {
		const fs = await import("node:fs/promises");
		const path = await import("node:path");
		const os = await import("node:os");

		const tempDir = await fs.mkdtemp(
			path.join(os.tmpdir(), "claude-zen-test-"),
		);
		return tempDir;
},

	/**
	 * Clean up temporary directory
	 */
	cleanupTempDir:async (dirPath: string) => {
		const fs = await import("node:fs/promises");
		try {
			await fs.rm(dirPath, { recursive:true, force:true});
} catch (_error) {
			// Ignore cleanup errors in tests
}
},
};

// Mock global console methods for cleaner test output
const originalConsole = { ...console};
globalThis.restoreConsole = () => {
	Object.assign(console, originalConsole);
};

// Suppress console output during tests (can be restored per test)
    // eslint-disable-next-line no-console
console.log = vi.fn();
    // eslint-disable-next-line no-console
console.warn = vi.fn();
    // eslint-disable-next-line no-console
console.error = vi.fn();
    // eslint-disable-next-line no-console
console.info = vi.fn();
    // eslint-disable-next-line no-console
console.debug = vi.fn();

// Environment variables for tests
process.env.NODE_ENV = "test";
process.env.ZEN_TEST_MODE = "true";

// Global timeout for async operations in tests
vi.setConfig({ testTimeout:30000});

// Add custom domain matchers - commented out since file doesn't exist
// import { domainMatchers} from "../src/__tests__/helpers/test-utils.js";
// expect.extend(domainMatchers);
