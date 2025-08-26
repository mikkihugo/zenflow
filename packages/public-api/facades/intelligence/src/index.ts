/**
 * @fileoverview Intelligence Strategic Facade - Clean Delegation Pattern
 *
 * STRATEGIC FACADE PURPOSE:
 * This facade provides unified access to intelligence capabilities while
 * delegating to real implementation packages when available.
 *
 * DELEGATION ARCHITECTURE:
 * • @claude-zen/brain: Neural coordination and behavioral intelligence
 * • @claude-zen/memory: Memory systems and storage
 * • @claude-zen/ai-safety: AI safety monitoring and protocols
 * • @claude-zen/knowledge: Knowledge management and semantic processing
 * • @claude-zen/teamwork: Agent collaboration and coordination
 * • @claude-zen/llm-providers: LLM provider integrations
 *
 * STANDARD FACADE PATTERN:
 * All facades follow the same architectural pattern:
 * 1. registerFacade() - Register with facade status manager
 * 2. Import from foundation utilities
 * 3. Export all module implementations (with fallbacks)
 * 4. Export main system object for programmatic access
 * 5. Export types for external consumers
 *
 * @author Claude Code Zen Team
 * @since 2.1.0 (Strategic Architecture v2.0.0)
 * @version 1.0.0
 */

import { getLogger, registerFacade } from "@claude-zen/foundation";

const logger = getLogger("intelligence");

// Register intelligence facade with expected packages
registerFacade(
	"intelligence",
	[
		"@claude-zen/brain",
		"@claude-zen/memory",
		"@claude-zen/ai-safety",
		"@claude-zen/knowledge",
		"@claude-zen/teamwork",
		"@claude-zen/llm-providers",
	],
	[
		"Neural coordination and behavioral intelligence",
		"Memory systems and persistent storage",
		"AI safety monitoring and protocols",
		"Knowledge management and semantic processing",
		"Agent collaboration and coordination",
		"LLM provider integrations and management",
		"Intelligence coordination and management",
	],
);

// =============================================================================
// STRATEGIC FACADE DELEGATION - Brain Systems
// =============================================================================

export const getBrainSystem = async () => {
	try {
		const { createBrainSystem } = await import("@claude-zen/brain");
		return createBrainSystem();
	} catch (_error) {
		throw new Error(
			"Brain system not available - @claude-zen/brain package required",
		);
	}
};

export const createNeuralCoordinator = async (config?: any) => {
	try {
		const { NeuralCoordinator } = await import("@claude-zen/brain");
		return new NeuralCoordinator(config);
	} catch (_error) {
		throw new Error(
			"Neural coordinator not available - @claude-zen/brain package required",
		);
	}
};

// =============================================================================
// STRATEGIC FACADE DELEGATION - Memory Systems
// =============================================================================

export const getMemorySystem = async () => {
	try {
		const { createMemorySystem } = await import("@claude-zen/memory");
		return createMemorySystem();
	} catch (_error) {
		throw new Error(
			"Memory system not available - @claude-zen/memory package required",
		);
	}
};

export const createMemoryManager = async (config?: any) => {
	try {
		const { MemoryManager } = await import("@claude-zen/memory");
		return new MemoryManager(config);
	} catch (_error) {
		throw new Error(
			"Memory manager not available - @claude-zen/memory package required",
		);
	}
};

// =============================================================================
// STRATEGIC FACADE DELEGATION - AI Safety
// =============================================================================

export const getAISafetyMonitor = async (config?: any) => {
	try {
		const { createSafetyMonitor } = await import("@claude-zen/ai-safety");
		return createSafetyMonitor(config);
	} catch (_error) {
		throw new Error(
			"AI safety monitor not available - @claude-zen/ai-safety package required",
		);
	}
};

export const createDeceptionDetector = async (config?: any) => {
	try {
		const { DeceptionDetector } = await import("@claude-zen/ai-safety");
		return new DeceptionDetector(config);
	} catch (_error) {
		throw new Error(
			"Deception detector not available - @claude-zen/ai-safety package required",
		);
	}
};

// =============================================================================
// STRATEGIC FACADE DELEGATION - Knowledge Systems
// =============================================================================

export const getKnowledgeBase = async () => {
	try {
		const { createKnowledgeBase } = await import("@claude-zen/knowledge");
		return createKnowledgeBase();
	} catch (_error) {
		throw new Error(
			"Knowledge base not available - @claude-zen/knowledge package required",
		);
	}
};

export const createFactSystem = async (config?: any) => {
	try {
		const { FactSystem } = await import("@claude-zen/knowledge");
		return new FactSystem(config);
	} catch (_error) {
		throw new Error(
			"Fact system not available - @claude-zen/knowledge package required",
		);
	}
};

// =============================================================================
// STRATEGIC FACADE DELEGATION - Teamwork Systems
// =============================================================================

export const getTeamworkOrchestrator = async () => {
	try {
		const { createTeamworkOrchestrator } = await import("@claude-zen/teamwork");
		return createTeamworkOrchestrator();
	} catch (_error) {
		throw new Error(
			"Teamwork orchestrator not available - @claude-zen/teamwork package required",
		);
	}
};

export const createAgentCoordinator = async (config?: any) => {
	try {
		const { AgentCoordinator } = await import("@claude-zen/teamwork");
		return new AgentCoordinator(config);
	} catch (_error) {
		throw new Error(
			"Agent coordinator not available - @claude-zen/teamwork package required",
		);
	}
};

// =============================================================================
// STRATEGIC FACADE DELEGATION - LLM Providers
// =============================================================================

export const getLLMProvider = async (
	type: "claude-code" | "cursor-cli" | "gemini-cli" = "claude-code",
) => {
	try {
		const { createLLMProvider } = await import("@claude-zen/llm-providers");
		return createLLMProvider(type);
	} catch (_error) {
		throw new Error(
			"LLM providers not available - @claude-zen/llm-providers package required",
		);
	}
};

export const createClaudeProvider = async (config?: any) => {
	try {
		const { createLLMProvider } = await import("@claude-zen/llm-providers");
		return createLLMProvider("claude-code", config);
	} catch (_error) {
		throw new Error(
			"Claude provider not available - @claude-zen/llm-providers package required",
		);
	}
};

// =============================================================================
// MAIN SYSTEM OBJECT - For programmatic access to all intelligence capabilities
// =============================================================================

export const intelligenceSystem = {
	// Intelligence modules
	brain: () => import("@claude-zen/brain").catch(() => ({ default: {} })),
	memory: () => import("@claude-zen/memory").catch(() => ({ default: {} })),
	aiSafety: () =>
		import("@claude-zen/ai-safety").catch(() => ({ default: {} })),
	knowledge: () =>
		import("@claude-zen/knowledge").catch(() => ({ default: {} })),
	teamwork: () => import("@claude-zen/teamwork").catch(() => ({ default: {} })),
	llmProviders: () =>
		import("@claude-zen/llm-providers").catch(() => ({ default: {} })),

	// Direct access functions
	getBrainSystem,
	getMemorySystem,
	getAISafetyMonitor,
	getKnowledgeBase,
	getTeamworkOrchestrator,
	getLLMProvider,

	// Utilities
	logger,
	init: async () => {
		logger.info("Intelligence system initialized");
		return { success: true, message: "Intelligence ready" };
	},
};

// =============================================================================
// TYPE EXPORTS - For external consumers
// =============================================================================

export type * from "./types";

// Default export for convenience
export default intelligenceSystem;
