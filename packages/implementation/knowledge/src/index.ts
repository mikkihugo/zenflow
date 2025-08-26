/**
 * @fileoverview Knowledge Package - Main exports
 *
 * This package provides collective intelligence, distributed learning,
 * and knowledge management capabilities for the swarm system.
 */

// Public coordination API (fact system implementation is private)
export {
	// Re-export types for coordination layer
	type CoordinationFact,
	type CoordinationFactQuery,
	type FactEntry,
	type FactQuery,
	type FactSearchResult,
	getCoordinationFactSystem,
	getCoordinationFacts,
	getGitHubRepoInfo,
	getNPMPackageInfo,
	initializeCoordinationFactSystem,
	queryAgentFacts,
	queryCoordinationFacts,
	searchCoordinationFacts,
	searchExternalFacts,
	storeAgentFact,
	storeCoordinationEvent,
	storeCoordinationFact,
} from "./coordination-api";
export * from "./intelligent-doc-import";
export * from "./main";
export { BasicKnowledgeManager } from "./main";
