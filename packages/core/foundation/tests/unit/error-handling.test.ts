/**
 * @fileoverview Error Handling Tests
 */

import { describe, expect, it } from "vitest";

describe("Foundation Error Handling", () => {
	describe("Result Pattern", () => {
		it("should create successful results", async () => {
			const { ok } = await import("../../src/error-handling");

			const result = ok("success value");

			expect(result.isOk()).toBe(true);
			expect(result.isErr()).toBe(false);

			if (result.isOk()) {
				expect(result.value).toBe("success value");
			}
		});

		it("should create error results", async () => {
			const { err } = await import("../../src/error-handling");

			const result = err("error message");

			expect(result.isErr()).toBe(true);
			expect(result.isOk()).toBe(false);

			if (result.isErr()) {
				expect(result.error).toBe("error message");
			}
		});

		it("should handle Result operations", async () => {
			const { Result, ok, err } = await import("../../src/error-handling");

			expect(Result).toBeDefined();

			const successResult = ok(42);
			const errorResult = err("failure");

			// Test chaining and operations
			expect(successResult.isOk()).toBe(true);
			expect(errorResult.isErr()).toBe(true);
		});
	});

	describe("Safe Async Operations", () => {
		it("should handle successful async operations", async () => {
			const { safeAsync } = await import("../../src/error-handling");

			const result = await safeAsync(async () => "async success");

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value).toBe("async success");
			}
		});

		it("should handle async errors", async () => {
			const { safeAsync } = await import("../../src/error-handling");

			const result = await safeAsync(async () => {
				throw new Error("async error");
			});

			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error).toBeInstanceOf(Error);
				expect(result.error.message).toBe("async error");
			}
		});

		it("should handle promise rejections", async () => {
			const { safeAsync } = await import("../../src/error-handling");

			const result = await safeAsync(async () => Promise.reject(new Error("rejected promise")));

			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error).toBeInstanceOf(Error);
				expect(result.error.message).toBe("rejected promise");
			}
		});
	});

	describe("Error Handler Integration", () => {
		it("should import error handling modules", async () => {
			const errorHandling = await import("../../src/error-handling");

			expect(errorHandling).toBeDefined();
			expect(errorHandling.ok).toBeDefined();
			expect(errorHandling.err).toBeDefined();
			expect(errorHandling.Result).toBeDefined();
			expect(errorHandling.safeAsync).toBeDefined();
		});

		it("should provide error utilities", async () => {
			const errorHandling = await import("../../src/error-handling");
			const keys = Object.keys(errorHandling);

			expect(keys.length).toBeGreaterThan(4); // At least ok, err, Result, safeAsync
		});
	});
});
