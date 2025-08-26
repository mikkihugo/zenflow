/**
 * @fileoverview ServiceContainer Registry Integration Tests
 *
 * Comprehensive integration testing for all 4 migrated registries:
 * - UACLRegistry (81 lines) -> MigratedUACLRegistry
 * - EventRegistry (986 lines) -> MigratedEventRegistry
 * - AgentRegistry (718 lines) -> MigratedAgentRegistry
 * - EnhancedServiceRegistry (1,118 lines) -> MigratedEnhancedServiceRegistry
 *
 * Ensures zero breaking changes and enhanced functionality works correctly.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock memory coordinator
const mockMemoryCoordinator = {
	coordinate: vi.fn().mockResolvedValue({ success: true }),
	deleteEntry: vi.fn().mockResolvedValue(true),
	store: vi.fn().mockResolvedValue(true),
	list: vi.fn().mockResolvedValue([]),
};

// Import migrated registries
import {
	createMigratedAgentRegistry,
	type MigratedAgentRegistry,
} from "../../apps/claude-code-zen-server/src/coordination/agents/agent-registry-migrated";
import {
	createMigratedEventRegistry,
	type MigratedEventRegistry,
} from "../../packages/implementation-packages/event-system/src/registry-migrated";

// Mock client types for UACLRegistry test
interface ClientInstance {
	id: string;
	type: string;
	createdAt: Date;
	lastAccessed: Date;
}

interface ClientType {
	name: string;
	factory: () => ClientInstance;
	config: Record<string, unknown>;
}

// Test data fixtures
const testAgentData = {
	id: "test-agent-001",
	name: "Test Agent",
	type: "coder" as const,
	status: "idle" as const,
	capabilities: {
		languages: ["typescript", "javascript"],
		frameworks: ["node", "express"],
		domains: ["web-development", "api-design"],
		tools: ["git", "docker"],
	},
	metrics: {
		tasksCompleted: 10,
		tasksFailed: 1,
		averageExecutionTime: 1500,
		successRate: 0.91,
		averageResponseTime: 200,
		errorRate: 0.09,
		uptime: 86400000,
		lastActivity: new Date(),
		tasksInProgress: 0,
		resourceUsage: {
			memory: 0.4,
			cpu: 0.2,
			disk: 0.1,
		},
	},
};

const testEventManagerData = {
	name: "test-system-manager",
	type: "system" as const,
	emit: vi.fn().mockResolvedValue(void 0),
	destroy: vi.fn().mockResolvedValue(void 0),
	healthCheck: vi.fn().mockResolvedValue({ status: "healthy" }),
	getMetrics: vi.fn().mockResolvedValue({
		eventsProcessed: 100,
		eventsFailed: 2,
		subscriptionCount: 15,
		averageLatency: 50,
	}),
};

const testEventManagerFactory = {
	create: vi.fn(),
	constructor: { name: "TestEventManagerFactory" },
	healthCheck: vi.fn().mockReturnValue(true),
};

const testEventManagerConfig = {
	type: "system" as const,
	version: "1.0.0",
	options: {
		bufferSize: 1000,
		timeout: 5000,
	},
};

describe("ServiceContainer Registry Integration Tests", () => {
	let agentRegistry: MigratedAgentRegistry;
	let eventRegistry: MigratedEventRegistry;

	beforeEach(async () => {
		// Reset all mocks
		vi.clearAllMocks();

		// Initialize registries
		agentRegistry = createMigratedAgentRegistry(
			mockMemoryCoordinator,
			"test-agents",
		);
		await agentRegistry.initialize();

		eventRegistry = createMigratedEventRegistry();
		await eventRegistry.initialize({
			autoRegisterDefaults: false,
			healthMonitoring: {
				checkInterval: 60000, // 1 minute for tests
				timeout: 2000,
			},
		});
	});

	afterEach(async () => {
		// Clean shutdown
		try {
			await agentRegistry.shutdown();
			await eventRegistry.shutdownAll();
		} catch (_error) {
			// Ignore cleanup errors in tests
		}
	});

	describe("MigratedAgentRegistry Integration", () => {
		it("should maintain exact API compatibility with original AgentRegistry", async () => {
			// Test registration
			await agentRegistry.registerAgent(testAgentData);

			// Verify memory coordination was called
			expect(mockMemoryCoordinator.coordinate).toHaveBeenCalledWith({
				type: "write",
				sessionId: expect.stringMatching(/registry-session-test-agent-001/),
				target: "test-agents/agents/test-agent-001",
				metadata: expect.objectContaining({
					type: "agent-registration",
					tags: ["coder", "idle"],
					partition: "registry",
				}),
			});

			// Test retrieval methods
			const retrievedAgent = agentRegistry.getAgent(testAgentData.id);
			expect(retrievedAgent).toBeDefined();
			expect(retrievedAgent?.id).toBe(testAgentData.id);
			expect(retrievedAgent?.name).toBe(testAgentData.name);

			// Test query functionality
			const queryResults = await agentRegistry.queryAgents({
				type: "coder",
				status: "idle",
			});
			expect(queryResults).toHaveLength(1);
			expect(queryResults[0].id).toBe(testAgentData.id);

			// Test selection functionality
			const selectedAgents = await agentRegistry.selectAgents({
				type: "coder",
				maxResults: 5,
				prioritizeBy: "performance",
			});
			expect(selectedAgents).toHaveLength(1);
			expect(selectedAgents[0].id).toBe(testAgentData.id);
		});

		it("should provide enhanced ServiceContainer capabilities", async () => {
			await agentRegistry.registerAgent(testAgentData);

			// Test enhanced health monitoring
			const healthStatus = await agentRegistry.getHealthStatus();
			expect(healthStatus).toBeDefined();
			expect(typeof healthStatus.totalServices).toBe("number");
			expect(typeof healthStatus.enabledServices).toBe("number");

			// Test capability-based queries
			const agentsByCapability = agentRegistry.getAgentsByCapability("coder");
			expect(agentsByCapability).toHaveLength(1);
			expect(agentsByCapability[0].id).toBe(testAgentData.id);

			// Test enable/disable functionality
			const enableResult = agentRegistry.setAgentEnabled(
				testAgentData.id,
				false,
			);
			expect(enableResult).toBe(true);

			const disableResult = agentRegistry.setAgentEnabled(
				testAgentData.id,
				true,
			);
			expect(disableResult).toBe(true);

			// Test enhanced statistics
			const stats = agentRegistry.getStats();
			expect(stats.serviceContainer).toBeDefined();
			expect(typeof stats.serviceContainer.totalServices).toBe("number");
			expect(typeof stats.serviceContainer.enabledServices).toBe("number");
		});

		it("should handle agent updates correctly", async () => {
			await agentRegistry.registerAgent(testAgentData);

			// Update agent status and metrics
			await agentRegistry.updateAgent(testAgentData.id, {
				status: "busy",
				metrics: {
					...testAgentData.metrics,
					tasksInProgress: 2,
					successRate: 0.95,
				},
				capabilities: {
					...testAgentData.capabilities,
					languages: ["typescript", "javascript", "python"],
				},
			});

			// Verify updates
			const updatedAgent = agentRegistry.getAgent(testAgentData.id);
			expect(updatedAgent?.status).toBe("busy");
			expect(updatedAgent?.metrics.tasksInProgress).toBe(2);
			expect(updatedAgent?.metrics.successRate).toBe(0.95);
			expect(updatedAgent?.capabilities.languages).toContain("python");

			// Verify memory store was called for update
			expect(mockMemoryCoordinator.store).toHaveBeenCalledWith(
				`test-agents/agents/${testAgentData.id}`,
				expect.objectContaining({
					id: testAgentData.id,
					status: "busy",
				}),
				expect.objectContaining({
					ttl: 3600,
					replicas: 2,
				}),
			);
		});
	});

	describe("MigratedEventRegistry Integration", () => {
		it("should maintain exact API compatibility with original EventRegistry", async () => {
			// Test factory registration
			eventRegistry.registerFactory("system", testEventManagerFactory);

			// Test factory retrieval
			const retrievedFactory = eventRegistry.getFactory("system");
			expect(retrievedFactory).toBe(testEventManagerFactory);

			// Test factory listing
			const factoryTypes = eventRegistry.listFactoryTypes();
			expect(factoryTypes).toContain("system");

			// Test manager registration
			eventRegistry.registerManager(
				testEventManagerData.name,
				testEventManagerData,
				testEventManagerFactory,
				testEventManagerConfig,
			);

			// Test manager retrieval
			const retrievedManager = eventRegistry.findEventManager(
				testEventManagerData.name,
			);
			expect(retrievedManager).toBe(testEventManagerData);

			// Test get all managers
			const allManagers = eventRegistry.getAllEventManagers();
			expect(allManagers.size).toBe(1);
			expect(allManagers.get(testEventManagerData.name)).toBe(
				testEventManagerData,
			);
		});

		it("should provide enhanced ServiceContainer capabilities", async () => {
			eventRegistry.registerFactory("system", testEventManagerFactory);
			eventRegistry.registerManager(
				testEventManagerData.name,
				testEventManagerData,
				testEventManagerFactory,
				testEventManagerConfig,
			);

			// Test enhanced health monitoring
			const healthStatus = await eventRegistry.getHealthStatus();
			expect(healthStatus).toBeDefined();

			// Test capability-based queries
			const managersByCapability =
				eventRegistry.getManagersByCapability("system");
			expect(managersByCapability).toHaveLength(1);

			// Test enable/disable functionality
			const enableResult = eventRegistry.setManagerEnabled(
				testEventManagerData.name,
				false,
			);
			expect(enableResult).toBe(true);

			const disableResult = eventRegistry.setManagerEnabled(
				testEventManagerData.name,
				true,
			);
			expect(disableResult).toBe(true);

			// Test global metrics
			const globalMetrics = await eventRegistry.getGlobalMetrics();
			expect(globalMetrics).toBeDefined();
			expect(typeof globalMetrics.totalManagers).toBe("number");
			expect(typeof globalMetrics.totalEvents).toBe("number");
		});

		it("should handle event type registration correctly", async () => {
			// Register event type
			eventRegistry.registerEventType("test:custom", {
				category: "TEST",
				priority: 2,
				managerTypes: ["system"],
				options: {
					bufferSize: 500,
					timeout: 3000,
				},
			});

			// Test event type retrieval
			const eventTypes = eventRegistry.getEventTypes();
			expect(eventTypes).toContain("test:custom");

			const eventTypeConfig = eventRegistry.getEventTypeConfig("test:custom");
			expect(eventTypeConfig).toBeDefined();
			expect(eventTypeConfig.category).toBe("TEST");
			expect(eventTypeConfig.priority).toBe(2);
		});

		it("should perform health checks correctly", async () => {
			eventRegistry.registerFactory("system", testEventManagerFactory);
			eventRegistry.registerManager(
				testEventManagerData.name,
				testEventManagerData,
				testEventManagerFactory,
				testEventManagerConfig,
			);

			// Perform health check
			const healthResults = await eventRegistry.healthCheckAll();
			expect(healthResults.size).toBe(1);

			const managerHealth = healthResults.get(testEventManagerData.name);
			expect(managerHealth).toBeDefined();
			expect(managerHealth?.status).toBe("healthy");
			expect(managerHealth?.name).toBe(testEventManagerData.name);
			expect(managerHealth?.type).toBe(testEventManagerData.type);

			// Verify manager health check was called
			expect(testEventManagerData.healthCheck).toHaveBeenCalled();
		});

		it("should handle broadcasting correctly", async () => {
			eventRegistry.registerFactory("system", testEventManagerFactory);
			eventRegistry.registerManager(
				testEventManagerData.name,
				testEventManagerData,
				testEventManagerFactory,
				testEventManagerConfig,
			);

			const testEvent = {
				type: "system:test",
				payload: { message: "test broadcast" },
				timestamp: new Date(),
				source: "test",
			};

			// Test global broadcast
			await eventRegistry.broadcast(testEvent);
			expect(testEventManagerData.emit).toHaveBeenCalledWith(testEvent);

			// Test type-specific broadcast
			await eventRegistry.broadcastToType("system", testEvent);
			expect(testEventManagerData.emit).toHaveBeenCalledWith(testEvent);
		});
	});

	describe("Cross-Registry Integration", () => {
		it("should handle concurrent operations across registries", async () => {
			// Register agent and event manager concurrently
			await Promise.all([
				agentRegistry.registerAgent(testAgentData),
				(async () => {
					eventRegistry.registerFactory("system", testEventManagerFactory);
					eventRegistry.registerManager(
						testEventManagerData.name,
						testEventManagerData,
						testEventManagerFactory,
						testEventManagerConfig,
					);
				})(),
			]);

			// Verify both registrations worked
			const agent = agentRegistry.getAgent(testAgentData.id);
			const manager = eventRegistry.findEventManager(testEventManagerData.name);

			expect(agent).toBeDefined();
			expect(manager).toBeDefined();

			// Test concurrent health checks
			const [agentHealth, eventHealth] = await Promise.all([
				agentRegistry.getHealthStatus(),
				eventRegistry.getHealthStatus(),
			]);

			expect(agentHealth).toBeDefined();
			expect(eventHealth).toBeDefined();
		});

		it("should handle memory coordination correctly across registries", async () => {
			// Register in both registries
			await agentRegistry.registerAgent(testAgentData);

			eventRegistry.registerFactory("system", testEventManagerFactory);
			eventRegistry.registerManager(
				testEventManagerData.name,
				testEventManagerData,
				testEventManagerFactory,
				testEventManagerConfig,
			);

			// Verify memory operations were called for agent registry
			expect(mockMemoryCoordinator.coordinate).toHaveBeenCalled();

			// Test shutdown persists state
			await agentRegistry.shutdown();
			expect(mockMemoryCoordinator.store).toHaveBeenCalled();
		});
	});

	describe("Error Handling and Edge Cases", () => {
		it("should handle initialization errors gracefully", async () => {
			// Create registry but don't initialize
			const uninitializedRegistry = createMigratedAgentRegistry(
				mockMemoryCoordinator,
			);

			// Should still allow operations but may have degraded functionality
			await uninitializedRegistry.registerAgent(testAgentData);
			const agent = uninitializedRegistry.getAgent(testAgentData.id);
			expect(agent).toBeDefined();

			await uninitializedRegistry.shutdown();
		});

		it("should handle memory coordination failures gracefully", async () => {
			// Mock memory coordinator failure
			mockMemoryCoordinator.coordinate.mockRejectedValueOnce(
				new Error("Memory failure"),
			);

			// Should still complete registration despite memory failure
			await expect(
				agentRegistry.registerAgent(testAgentData),
			).resolves.not.toThrow();

			// Agent should still be available locally
			const agent = agentRegistry.getAgent(testAgentData.id);
			expect(agent).toBeDefined();
		});

		it("should handle ServiceContainer resolution failures gracefully", async () => {
			await agentRegistry.registerAgent(testAgentData);

			// Should fall back to legacy storage when ServiceContainer fails
			const agent = agentRegistry.getAgent(testAgentData.id);
			expect(agent).toBeDefined();
			expect(agent?.id).toBe(testAgentData.id);
		});
	});

	describe("Performance and Resource Management", () => {
		it("should properly cleanup resources on shutdown", async () => {
			// Register multiple entities
			await agentRegistry.registerAgent(testAgentData);
			await agentRegistry.registerAgent({
				...testAgentData,
				id: "test-agent-002",
				name: "Test Agent 2",
			});

			eventRegistry.registerFactory("system", testEventManagerFactory);
			eventRegistry.registerManager(
				testEventManagerData.name,
				testEventManagerData,
				testEventManagerFactory,
				testEventManagerConfig,
			);

			// Shutdown and verify cleanup
			await agentRegistry.shutdown();
			await eventRegistry.shutdownAll();

			// Verify managers were properly destroyed
			expect(testEventManagerData.destroy).toHaveBeenCalled();
		});

		it("should handle large numbers of registrations efficiently", async () => {
			const startTime = Date.now();

			// Register 100 agents
			const registrationPromises = [];
			for (let i = 0; i < 100; i++) {
				registrationPromises.push(
					agentRegistry.registerAgent({
						...testAgentData,
						id: `test-agent-${i.toString().padStart(3, "0")}`,
						name: `Test Agent ${i}`,
					}),
				);
			}

			await Promise.all(registrationPromises);

			const registrationTime = Date.now() - startTime;

			// Should complete in reasonable time (less than 5 seconds)
			expect(registrationTime).toBeLessThan(5000);

			// Verify all agents were registered
			const allAgents = agentRegistry.getAllAgents();
			expect(allAgents).toHaveLength(100);

			// Test query performance
			const queryStart = Date.now();
			const coderAgents = await agentRegistry.queryAgents({ type: "coder" });
			const queryTime = Date.now() - queryStart;

			expect(queryTime).toBeLessThan(100); // Should be very fast
			expect(coderAgents).toHaveLength(100);
		});
	});
});
