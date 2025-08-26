/**
 * @fileoverview Comprehensive Result Pattern Tests
 *
 * 100% coverage tests for neverthrow Result patterns and error handling.
 */

import {
	err,
	errAsync,
	ok,
	okAsync,
	type Result,
	ResultAsync,
} from "neverthrow";
import { describe, expect, it } from "vitest";

describe("Result Patterns - 100% Coverage", () => {
	describe("Basic Result Operations", () => {
		it("should create successful results", () => {
			const result = ok("success");

			expect(result.isOk()).toBe(true);
			expect(result.isErr()).toBe(false);

			if (result.isOk()) {
				expect(result.value).toBe("success");
			}
		});

		it("should create error results", () => {
			const error = new Error("test error");
			const result = err(error);

			expect(result.isErr()).toBe(true);
			expect(result.isOk()).toBe(false);

			if (result.isErr()) {
				expect(result.error).toBe(error);
			}
		});

		it("should handle different value types", () => {
			const stringResult = ok("text");
			const numberResult = ok(42);
			const booleanResult = ok(true);
			const objectResult = ok({ key: "value" });
			const arrayResult = ok([1, 2, 3]);

			expect(stringResult.isOk()).toBe(true);
			expect(numberResult.isOk()).toBe(true);
			expect(booleanResult.isOk()).toBe(true);
			expect(objectResult.isOk()).toBe(true);
			expect(arrayResult.isOk()).toBe(true);

			if (stringResult.isOk()) expect(stringResult.value).toBe("text");
			if (numberResult.isOk()) expect(numberResult.value).toBe(42);
			if (booleanResult.isOk()) expect(booleanResult.value).toBe(true);
			if (objectResult.isOk())
				expect(objectResult.value).toEqual({ key: "value" });
			if (arrayResult.isOk()) expect(arrayResult.value).toEqual([1, 2, 3]);
		});

		it("should handle different error types", () => {
			const errorResult = err(new Error("standard error"));
			const stringResult = err("string error");
			const objectResult = err({ code: "ERROR", message: "object error" });

			expect(errorResult.isErr()).toBe(true);
			expect(stringResult.isErr()).toBe(true);
			expect(objectResult.isErr()).toBe(true);
		});
	});

	describe("Result Transformations", () => {
		it("should map successful results", () => {
			const result = ok(10)
				.map((x) => x * 2)
				.map((x) => x.toString())
				.map((x) => `Result: ${x}`);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value).toBe("Result: 20");
			}
		});

		it("should skip map operations on errors", () => {
			let mapCalled = false;
			const result = err(new Error("original")).map(() => {
				mapCalled = true;
				return "mapped";
			});

			expect(result.isErr()).toBe(true);
			expect(mapCalled).toBe(false);

			if (result.isErr()) {
				expect(result.error.message).toBe("original");
			}
		});

		it("should transform errors with mapErr", () => {
			const result = err(new Error("original")).mapErr(
				(error) => new Error(`wrapped: ${error.message}`),
			);

			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error.message).toBe("wrapped: original");
			}
		});

		it("should skip mapErr operations on success", () => {
			let mapErrCalled = false;
			const result = ok("success").mapErr(() => {
				mapErrCalled = true;
				return new Error("should not be called");
			});

			expect(result.isOk()).toBe(true);
			expect(mapErrCalled).toBe(false);

			if (result.isOk()) {
				expect(result.value).toBe("success");
			}
		});
	});

	describe("Result Chaining (andThen)", () => {
		const divide = (x: number, y: number): Result<number, Error> => {
			if (y === 0) return err(new Error("Division by zero"));
			return ok(x / y);
		};

		it("should chain successful operations", () => {
			const result = ok(100)
				.andThen((x) => divide(x, 10))
				.andThen((x) => divide(x, 2));

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value).toBe(5);
			}
		});

		it("should short-circuit on first error", () => {
			const result = ok(100)
				.andThen((x) => divide(x, 0)) // This will fail
				.andThen((x) => divide(x, 2)); // This won't execute

			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error.message).toBe("Division by zero");
			}
		});

		it("should handle complex chaining scenarios", () => {
			const parseNumber = (str: string): Result<number, Error> => {
				const num = Number(str);
				if (Number.isNaN(num)) return err(new Error(`Invalid number: ${str}`));
				return ok(num);
			};

			const sqrt = (x: number): Result<number, Error> => {
				if (x < 0)
					return err(new Error("Cannot take square root of negative number"));
				return ok(Math.sqrt(x));
			};

			// Successful chain
			const successResult = ok("16").andThen(parseNumber).andThen(sqrt);

			expect(successResult.isOk()).toBe(true);
			if (successResult.isOk()) {
				expect(successResult.value).toBe(4);
			}

			// Failed parsing
			const parseFailResult = ok("not-a-number")
				.andThen(parseNumber)
				.andThen(sqrt);

			expect(parseFailResult.isErr()).toBe(true);
			if (parseFailResult.isErr()) {
				expect(parseFailResult.error.message).toBe(
					"Invalid number: not-a-number",
				);
			}

			// Failed sqrt
			const sqrtFailResult = ok("-4").andThen(parseNumber).andThen(sqrt);

			expect(sqrtFailResult.isErr()).toBe(true);
			if (sqrtFailResult.isErr()) {
				expect(sqrtFailResult.error.message).toBe(
					"Cannot take square root of negative number",
				);
			}
		});
	});

	describe("Result Utilities", () => {
		it("should unwrap values with unwrapOr", () => {
			const successResult = ok("success");
			const errorResult = err(new Error("error"));

			expect(successResult.unwrapOr("default")).toBe("success");
			expect(errorResult.unwrapOr("default")).toBe("default");
		});

		it("should match on results", () => {
			const successResult = ok(42);
			const errorResult = err(new Error("failed"));

			const successMatch = successResult.match(
				(value) => `Success: ${value}`,
				(error) => `Error: ${error.message}`,
			);

			const errorMatch = errorResult.match(
				(value) => `Success: ${value}`,
				(error) => `Error: ${error.message}`,
			);

			expect(successMatch).toBe("Success: 42");
			expect(errorMatch).toBe("Error: failed");
		});
	});

	describe("Async Results", () => {
		it("should create async success results", async () => {
			const result = await okAsync("async success");

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value).toBe("async success");
			}
		});

		it("should create async error results", async () => {
			const result = await errAsync(new Error("async error"));

			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error.message).toBe("async error");
			}
		});

		it("should handle async result chains", async () => {
			const asyncDivide = async (
				x: number,
				y: number,
			): Promise<Result<number, Error>> => {
				await new Promise((resolve) => setTimeout(resolve, 1)); // Simulate async work
				if (y === 0) return err(new Error("Async division by zero"));
				return ok(x / y);
			};

			const result = await ResultAsync.fromPromise(
				Promise.resolve(20),
				() => new Error("Promise failed"),
			)
				.andThen(async (x) => await asyncDivide(x, 4))
				.andThen(async (x) => await asyncDivide(x, 5));

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value).toBe(1);
			}
		});

		it("should handle async result failures", async () => {
			const asyncDivide = async (
				x: number,
				y: number,
			): Promise<Result<number, Error>> => {
				await new Promise((resolve) => setTimeout(resolve, 1));
				if (y === 0) return err(new Error("Async division by zero"));
				return ok(x / y);
			};

			const result = await ResultAsync.fromPromise(
				Promise.resolve(20),
				() => new Error("Promise failed"),
			).andThen(async (x) => await asyncDivide(x, 0)); // This will fail

			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error.message).toBe("Async division by zero");
			}
		});
	});

	describe("Performance", () => {
		it("should handle many result operations efficiently", () => {
			const start = performance.now();

			const results = Array.from({ length: 1000 }, (_, i) =>
				ok(i)
					.map((x) => x * 2)
					.map((x) => x.toString())
					.andThen((x) => {
						const num = Number(x);
						return num % 2 === 0 ? ok(num) : err(new Error("Odd number"));
					}),
			);

			const duration = performance.now() - start;

			expect(results).toHaveLength(1000);

			// All should be successful (all even numbers after * 2)
			results.forEach((result) => {
				expect(result.isOk()).toBe(true);
			});

			expect(duration).toBeLessThan(100); // Should be fast
		});
	});

	describe("Edge Cases", () => {
		it("should handle null and undefined values", () => {
			const nullResult = ok(null);
			const undefinedResult = ok(undefined);
			const zeroResult = ok(0);
			const emptyStringResult = ok("");

			expect(nullResult.isOk()).toBe(true);
			expect(undefinedResult.isOk()).toBe(true);
			expect(zeroResult.isOk()).toBe(true);
			expect(emptyStringResult.isOk()).toBe(true);

			if (nullResult.isOk()) expect(nullResult.value).toBeNull();
			if (undefinedResult.isOk()) expect(undefinedResult.value).toBeUndefined();
			if (zeroResult.isOk()) expect(zeroResult.value).toBe(0);
			if (emptyStringResult.isOk()) expect(emptyStringResult.value).toBe("");
		});

		it("should handle circular references in error objects", () => {
			const circularError: any = new Error("Circular error");
			circularError.self = circularError;

			const result = err(circularError);

			expect(result.isErr()).toBe(true);
			if (result.isErr()) {
				expect(result.error.message).toBe("Circular error");
				expect(result.error.self).toBe(result.error);
			}
		});

		it("should handle deeply nested result chains", () => {
			const deepChain = (depth: number): Result<number, Error> => {
				if (depth <= 0) return ok(0);

				return ok(depth).andThen((d) => {
					const next = deepChain(d - 1);
					if (next.isErr()) return next;
					return ok(d + next.value);
				});
			};

			const result = deepChain(10);

			expect(result.isOk()).toBe(true);
			if (result.isOk()) {
				expect(result.value).toBe(55); // Sum of 1+2+...+10
			}
		});
	});
});
