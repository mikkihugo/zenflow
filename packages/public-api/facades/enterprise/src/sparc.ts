/**
 * @fileoverview SPARC Strategic Facade - Pure Delegation Only
 *
 * STRATEGIC FACADE PURPOSE:
 * This facade provides unified access to SPARC methodology capabilities
 * through pure delegation to @claude-zen/sparc implementation package.
 *
 * PURE DELEGATION PATTERN:
 * ✅ ONLY imports from @claude-zen/sparc implementation package
 * ✅ ONLY re-exports types and interfaces
 * ✅ ONLY provides delegation functions
 * ✅ Throws errors when implementation package not available
 *
 * @author Claude Code Zen Team
 * @since 2.1.0 (Strategic Architecture v2.0.0)
 * @version 1.0.0
 */

import { getLogger } from "@claude-zen/foundation";

const logger = getLogger("sparc-facade");

// ============================================================================
// TYPE RE-EXPORTS - Full compatibility with SPARC package
// ============================================================================

// Core SPARC types - Export from real package when available
export type SPARCPhase =
	| "specification"
	| "pseudocode"
	| "architecture"
	| "refinement"
	| "completion";
export type ProjectComplexity =
	| "simple"
	| "moderate"
	| "high"
	| "complex"
	| "enterprise";
export type ProjectDomain =
	| "swarm-coordination"
	| "neural-networks"
	| "wasm-integration"
	| "rest-api"
	| "memory-systems"
	| "interfaces"
	| "general";

// Re-export all SPARC types from implementation package
export type {
	ArchitecturalDecision,
	ProjectScope,
	QualityMetrics,
	SPARCConfig,
	SPARCPhaseResult,
	SPARCResult,
} from "@claude-zen/sparc";

// =============================================================================
// PURE DELEGATION FUNCTIONS - No implementations, only delegation
// =============================================================================

/**
 * createSPARCMethodology - Create SPARC methodology instance
 * Delegates to @claude-zen/sparc implementation package
 */
export const createSPARCMethodology = async (config?: any) => {
	try {
		const { SPARCMethodology } = await import("@claude-zen/sparc");
		return new SPARCMethodology(config);
	} catch (error) {
		logger.error("SPARC package not available:", error);
		throw new Error(
			"SPARC methodology not available - @claude-zen/sparc package required",
		);
	}
};

/**
 * getSPARCEngine - Get SPARC processing engine
 * Delegates to @claude-zen/sparc implementation package
 */
export const getSPARCEngine = async (config?: any) => {
	try {
		const { createSPARCEngine } = await import("@claude-zen/sparc");
		return createSPARCEngine(config);
	} catch (error) {
		logger.error("SPARC package not available:", error);
		throw new Error(
			"SPARC engine not available - @claude-zen/sparc package required",
		);
	}
};

/**
 * createSPARCProject - Create SPARC project instance
 * Delegates to @claude-zen/sparc implementation package
 */
export const createSPARCProject = async (projectConfig: any) => {
	try {
		const { createProject } = await import("@claude-zen/sparc");
		return createProject(projectConfig);
	} catch (error) {
		logger.error("SPARC package not available:", error);
		throw new Error(
			"SPARC project creation not available - @claude-zen/sparc package required",
		);
	}
};

// =============================================================================
// SPARC ANALYSIS DELEGATION
// =============================================================================

export const analyzeSPARCComplexity = async (requirements: string) => {
	try {
		const { analyzeComplexity } = await import("@claude-zen/sparc");
		return analyzeComplexity(requirements);
	} catch (_error) {
		throw new Error(
			"SPARC complexity analysis not available - @claude-zen/sparc package required",
		);
	}
};

export const generateSPARCPhases = async (projectScope: any) => {
	try {
		const { generatePhases } = await import("@claude-zen/sparc");
		return generatePhases(projectScope);
	} catch (_error) {
		throw new Error(
			"SPARC phase generation not available - @claude-zen/sparc package required",
		);
	}
};

// =============================================================================
// LEGACY COMPATIBILITY - Removed implementations
// =============================================================================

// Legacy SPARCMethodology class removed - use createSPARCMethodology() function
export const SPARCMethodology = class {
	constructor() {
		throw new Error(
			"SPARCMethodology class removed - use createSPARCMethodology() function",
		);
	}
};
