/**
 * @fileoverview Infrastructure Strategic Facade - Clean Delegation Pattern
 *
 * This facade follows the same clean delegation pattern as enterprise facade.
 * All functionality is delegated to implementation packages with proper fallbacks.
 */

import { getLogger, registerFacade } from "@claude-zen/foundation";

const logger = getLogger("infrastructure");

// Register infrastructure facade with expected packages
registerFacade(
	"infrastructure",
	[
		"@claude-zen/database",
		"@claude-zen/event-system",
		"@claude-zen/load-balancing",
		"@claude-zen/telemetry",
		"@claude-zen/otel-collector",
		"@claude-zen/llm-providers",
	],
	[
		"Multi-backend database abstraction layer",
		"Type-safe event bus and management",
		"Performance optimization and routing",
		"System telemetry and metrics collection",
		"OpenTelemetry collection and processing",
		"LLM provider integrations and routing",
		"Infrastructure coordination and management",
	],
);

// =============================================================================
// STRATEGIC FACADE DELEGATION - Database Systems
// =============================================================================

export const getDatabaseAccess = async () => {
	try {
		const { createDatabaseAccess } = await import("@claude-zen/database");
		return createDatabaseAccess();
	} catch (_error) {
		throw new Error(
			"Database system not available - @claude-zen/database package required",
		);
	}
};

export const createDatabaseConnection = async (config?: any) => {
	try {
		const { DatabaseProvider } = await import("@claude-zen/database");
		return new DatabaseProvider(config);
	} catch (_error) {
		throw new Error(
			"Database provider not available - @claude-zen/database package required",
		);
	}
};

// =============================================================================
// STRATEGIC FACADE DELEGATION - Event Systems
// =============================================================================

export const createEventSystem = async () => {
	try {
		const { createEventBus } = await import("@claude-zen/event-system");
		return createEventBus();
	} catch (_error) {
		throw new Error(
			"Event system not available - @claude-zen/event-system package required",
		);
	}
};

export const getEventSystemAccess = async () => {
	try {
		const { getEventSystem } = await import("@claude-zen/event-system");
		return getEventSystem();
	} catch (_error) {
		throw new Error(
			"Event system not available - @claude-zen/event-system package required",
		);
	}
};

// =============================================================================
// STRATEGIC FACADE DELEGATION - Load Balancing & Performance
// =============================================================================

export const getLoadBalancer = async () => {
	try {
		const { createLoadBalancer } = await import("@claude-zen/load-balancing");
		return createLoadBalancer();
	} catch (_error) {
		throw new Error(
			"Load balancer not available - @claude-zen/load-balancing package required",
		);
	}
};

export const getPerformanceTracker = async () => {
	try {
		const { createPerformanceTracker } = await import(
			"@claude-zen/load-balancing"
		);
		return createPerformanceTracker();
	} catch (_error) {
		throw new Error(
			"Performance tracker not available - @claude-zen/load-balancing package required",
		);
	}
};

export const getTelemetryManager = async () => {
	try {
		const { createTelemetryManager } = await import("@claude-zen/telemetry");
		return createTelemetryManager();
	} catch (_error) {
		throw new Error(
			"Telemetry manager not available - @claude-zen/telemetry package required",
		);
	}
};

// =============================================================================
// STRATEGIC FACADE DELEGATION - LLM Provider Infrastructure
// =============================================================================

export const getLLMProviders = async () => {
	try {
		const { LLMProvider } = await import("@claude-zen/llm-providers");
		return LLMProvider;
	} catch (_error) {
		throw new Error(
			"LLM providers not available - @claude-zen/llm-providers package required",
		);
	}
};

export const createLLMRouter = async (config?: any) => {
	try {
		const { getOptimalProvider, LLM_PROVIDER_CONFIG } = await import("@claude-zen/llm-providers");
		return { getOptimalProvider, providerConfig: LLM_PROVIDER_CONFIG };
	} catch (_error) {
		throw new Error(
			"LLM router not available - @claude-zen/llm-providers package required",
		);
	}
};

// =============================================================================
// STRATEGIC FACADE DELEGATION - Advanced Infrastructure Components
// =============================================================================

// OpenTelemetry Collector Integration
export const getOtelCollector = async () => {
	try {
		const { createOtelCollector } = await import("@claude-zen/otel-collector");
		return createOtelCollector();
	} catch (_error) {
		throw new Error(
			"OTel collector not available - @claude-zen/otel-collector package required",
		);
	}
};

// Service Container Integration - Use foundation's built-in container
export const getServiceContainer = async (name?: string) => {
	try {
		const { createServiceContainer } = await import("@claude-zen/foundation");
		return createServiceContainer(name);
	} catch (_error) {
		throw new Error(
			"Service container not available - @claude-zen/foundation package required",
		);
	}
};

// =============================================================================
// MAIN SYSTEM OBJECT - For programmatic access to all infrastructure capabilities
// =============================================================================

export const infrastructureSystem: any = {
	// Infrastructure modules
	database: () => import("@claude-zen/database").catch(() => ({ default: {} })),
	events: () => Promise.resolve({ default: {} }),
	loadBalancing: () =>
		import("@claude-zen/load-balancing").catch(() => ({ default: {} })),
	telemetry: () => Promise.resolve({ default: {} }),
	llmProviders: () =>
		import("@claude-zen/llm-providers").catch(() => ({ default: {} })),

	// Advanced infrastructure with enhanced fallbacks
	otelCollector: () =>
		import("@claude-zen/otel-collector").catch(() => ({ default: {} })),
	serviceContainer: () =>
		import("@claude-zen/foundation").catch(() => ({ default: {} })),

	// Direct access functions
	getOtelCollector,
	getServiceContainer,
	getDatabaseAccess,
	getLLMProviders,
	createLLMRouter,

	// Utilities
	logger,
	init: async () => {
		logger.info("Infrastructure system initialized");
		return { success: true, message: "Infrastructure ready" };
	},
};

// Default export for convenience
export default infrastructureSystem;

// =============================================================================
// TYPE EXPORTS - For external consumers
// =============================================================================

export type * from "./types";
