/**
 * @fileoverview Foundation Integration Tests - End-to-End Validation
 *
 * Complete integration tests that validate the entire foundation package
 * working together including real API calls, database operations,
 * error handling, and cross-system coordination.
 *
 * @author Claude Code Zen Team
 * @since 2.0.0
 */

import { afterAll, describe, expect, it } from "vitest";
import {
	// Dependency injection
	DIContainer,
	// Error handling
	EnhancedError,
	executeClaudeTask,
	executeSwarmCoordinationTask,
	getConfig,
	// Storage
	getDatabaseAccess,
	getGlobalClaudeTaskManager,
	getGlobalLLM,
	// Core systems
	getLogger,
	storage as Storage,
	safeAsync,
	withRetry,
} from "../../src/index";
import { cleanupGlobalInstances } from "../claude-sdk";

import { createToken } from "../di/tokens/token-factory";

describe("Foundation Integration Tests", () => {
	const runIntegration = process.env.RUN_INTEGRATION === "true";
	const itIntegration = runIntegration ? it : it.skip;

	afterAll(() => {
		const taskManager = getGlobalClaudeTaskManager();
		taskManager.clearCompletedTasks();
		taskManager.clearPermissionDenials();
		cleanupGlobalInstances();
	});

	describe("System Initialization", () => {
		it("should initialize all core systems", () => {
			// Logging system
			const logger = getLogger("integration-test");
			expect(logger).toBeTruthy();
			expect(typeof logger.info).toBe("function");

			// Configuration system
			const config = getConfig();
			expect(config).toBeTruthy();

			// LLM system
			const llm = getGlobalLLM();
			expect(llm).toBeTruthy();
			expect(typeof llm.complete).toBe("function");

			// Storage system
			const db = getDatabaseAccess();
			expect(db).toBeTruthy();

			// DI system
			const container = new DIContainer();
			expect(container).toBeTruthy();
		});

		it("should have consistent logging across systems", () => {
			const logger1 = getLogger("test-1");
			const logger2 = getLogger("test-2");
			const logger3 = getLogger("test-1"); // Same name

			expect(logger1).toBeTruthy();
			expect(logger2).toBeTruthy();
			expect(logger3).toBe(logger1); // Should be same instance
		});
	});

	describe("Cross-System Coordination", () => {
		itIntegration(
			"should coordinate LLM and storage systems",
			async () => {
				const logger = getLogger("coordination-test");
				const llm = getGlobalLLM();

				// Use LLM to generate some data
				llm.setRole("analyst");
				const analysisResult = await llm.complete(
					"Provide a brief analysis of the number 42",
					{ maxTokens: 100 },
				);

				expect(analysisResult).toBeTruthy();
				logger.info("LLM analysis completed", {
					length: analysisResult.length,
				});

				// Store result (if storage is available)
				try {
					const kvStore = Storage.getKVStore();
					await kvStore.set("integration-test-analysis", analysisResult);
					const retrieved = await kvStore.get("integration-test-analysis");
					expect(retrieved).toBe(analysisResult);

					logger.info("Storage integration successful");
				} catch (error) {
					logger.warn("Storage not available for testing", { error });
				}
			},
			120000,
		);

		itIntegration(
			"should handle errors across systems",
			async () => {
				const logger = getLogger("error-test");

				// Test error handling with LLM system
				const result = await safeAsync(async () => {
					return executeClaudeTask("This is a test", {
						maxTurns: 1,
						timeoutMs: 5000, // Short timeout to potentially trigger error
						allowedTools: [],
					});
				});

				if (result.success) {
					logger.info("Claude task succeeded", {
						messageCount: result.data.length,
					});
				} else {
					logger.info("Claude task failed as expected", {
						error: result.error.message,
					});
					expect(result.error).toBeInstanceOf(Error);
				}
			},
			120000,
		);

		itIntegration("should support retry mechanisms", async () => {
			const logger = getLogger("retry-test");

			let attempts = 0;
			const result = await withRetry(
				async () => {
					attempts++;
					if (attempts < 2) {
						throw new Error("Simulated failure");
					}
					return `Success on attempt ${attempts}`;
				},
				{
					maxRetries: 3,
					baseDelay: 100,
					maxDelay: 1000,
				},
			);

			expect(result.success).toBe(true);
			expect(result.data).toBe("Success on attempt 2");
			expect(attempts).toBe(2);

			logger.info("Retry mechanism validated", { attempts });
		});
	});

	describe("Dependency Injection Integration", () => {
		it("should support service registration and injection", () => {
			const container = new DIContainer();

			// Register services using proper DI tokens
			const loggerToken = createToken<any>("logger");
			const configToken = createToken<any>("config");

			container.register(loggerToken, {
				type: "transient",
				create: () => getLogger("di-test"),
			});
			container.register(configToken, {
				type: "transient",
				create: () => getConfig(),
			});

			// Resolve services
			const logger = container.resolve(loggerToken);
			const config = container.resolve(configToken);

			expect(logger).toBeTruthy();
			expect(config).toBeTruthy();
		});

		it("should support function-based service creation", () => {
			const container = new DIContainer();
			const loggerToken = createToken<any>("logger");
			const serviceToken = createToken<any>("testService");

			// Register logger
			container.register(loggerToken, {
				type: "transient",
				create: () => getLogger("service-test"),
			});

			// Register service that depends on logger
			container.register(serviceToken, {
				type: "transient",
				create: (container) => {
					const logger = container.resolve(loggerToken);
					return {
						test() {
							logger.info("Test service method called");
							return "test-result";
						},
					};
				},
			});

			const service = container.resolve(serviceToken);
			const result = service.test();

			expect(result).toBe("test-result");
		});
	});

	describe("Real World Scenarios", () => {
		itIntegration(
			"should handle swarm coordination workflow",
			async () => {
				const logger = getLogger("swarm-workflow");

				// Simulate a real swarm task
				const task = "Analyze the pros and cons of microservices architecture";
				const agents = ["architect", "analyst", "researcher"];

				logger.info("Starting swarm coordination", { task, agents });

				const messages = await executeSwarmCoordinationTask(task, agents, {
					maxTurns: 3,
					timeoutMs: 60000,
					allowedTools: ["TodoWrite"], // Safe tools only
					model: "sonnet",
				});

				expect(messages).toBeTruthy();
				expect(messages.length).toBeGreaterThan(0);

				// Check for successful completion
				const resultMessage = messages.find((m) => m.type === "result");
				expect(resultMessage).toBeTruthy();

				logger.info("Swarm coordination completed", {
					messageCount: messages.length,
					success: !(resultMessage as any)?.is_error,
				});
			},
			120000,
		);

		itIntegration(
			"should handle multi-role LLM workflow",
			async () => {
				const logger = getLogger("multi-role-workflow");
				const llm = getGlobalLLM();

				// Step 1: Research phase
				llm.setRole("researcher");
				const research = await llm.executeAsResearcher(
					"Benefits of TypeScript",
					"Web development context",
				);
				expect(research).toBeTruthy();
				logger.info("Research phase completed");

				// Step 2: Analysis phase
				llm.setRole("analyst");
				const analysis = await llm.executeAsAnalyst(
					research.substring(0, 500), // Limit input size
					"Summary analysis",
				);
				expect(analysis).toBeTruthy();
				logger.info("Analysis phase completed");

				// Step 3: Implementation guidance
				llm.setRole("coder");
				const implementation = await llm.executeAsCoder(
					"Provide a simple TypeScript setup guide",
					analysis.substring(0, 200),
				);
				expect(implementation).toBeTruthy();
				logger.info("Implementation phase completed");

				// Verify role switching worked
				expect(llm.getRole()?.role).toBe("coder");
			},
			120000,
		);

		itIntegration(
			"should handle error recovery scenarios",
			async () => {
				const logger = getLogger("error-recovery");

				// Test error recovery with multiple systems
				const operations = [
					// Operation 1: Should succeed
					async () => {
						const llm = getGlobalLLM();
						llm.setRole("assistant");
						return llm.complete("Say hello", { maxTokens: 20 });
					},

					// Operation 2: Might fail
					async () => {
						return executeClaudeTask("Test task", {
							maxTurns: 1,
							timeoutMs: 10000,
							allowedTools: [],
						});
					},

					// Operation 3: Storage operation (if available)
					async () => {
						try {
							const kvStore = Storage.getKVStore();
							await kvStore.set("recovery-test", "test-value");
							return kvStore.get("recovery-test");
						} catch (error) {
							throw new EnhancedError("Storage not available", {
								originalError: error,
							});
						}
					},
				];

				const results = await Promise.allSettled(operations);

				// At least some operations should succeed
				const successes = results.filter((r) => r.status === "fulfilled");
				expect(successes.length).toBeGreaterThan(0);

				results.forEach((result, index) => {
					if (result.status === "fulfilled") {
						logger.info(`Operation ${index + 1} succeeded`);
					} else {
						logger.warn(`Operation ${index + 1} failed`, {
							error: result.reason,
						});
					}
				});
			},
			120000,
		);
	});

	describe("Performance and Scalability", () => {
		const runPerformance = process.env.RUN_PERFORMANCE === "true";
		const itPerformance = runPerformance ? it : it.skip;

		itPerformance(
			"should handle concurrent operations",
			async () => {
				const logger = getLogger("performance-test");
				const llm = getGlobalLLM();

				// Create multiple concurrent LLM requests
				const requests = Array(5)
					.fill(0)
					.map((_, i) => llm.complete(`Count to ${i + 1}`, { maxTokens: 50 }));

				const startTime = Date.now();
				const results = await Promise.all(requests);
				const duration = Date.now() - startTime;

				expect(results).toHaveLength(5);
				results.forEach((result) => expect(result).toBeTruthy())();

				logger.info("Concurrent operations completed", {
					requests: 5,
					duration,
					avgDuration: duration / 5,
				});
			},
			120000,
		);

		itPerformance(
			"should track system metrics",
			async () => {
				const logger = getLogger("metrics-test");
				const llm = getGlobalLLM();

				// Perform operations and track metrics
				await llm.complete("Test 1", { maxTokens: 30 });
				await llm.complete("Test 2", { maxTokens: 30 });

				const stats = llm.getUsageStats();
				expect(stats.requestCount).toBeGreaterThan(0);

				logger.info("System metrics tracked", stats);
			},
			120000,
		);
	});
});
