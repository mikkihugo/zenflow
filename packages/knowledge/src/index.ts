/**
 * @fileoverview Knowledge Package - Main exports
 * 
 * This package provides collective intelligence, distributed learning,
 * and knowledge management capabilities for the swarm system.
 */

export * from './main';
export * from './intelligent-doc-import';
export { BasicKnowledgeManager } from './main';

// Public coordination API (fact system implementation is private)
export { 
  getCoordinationFactSystem,
  initializeCoordinationFactSystem,
  storeCoordinationFact,
  queryCoordinationFacts,
  searchCoordinationFacts,
  getCoordinationFacts,
  storeCoordinationEvent,
  storeAgentFact,
  queryAgentFacts,
  searchExternalFacts,
  getNPMPackageInfo,
  getGitHubRepoInfo,
  
  // Re-export types for coordination layer
  type CoordinationFact,
  type CoordinationFactQuery,
  type FactEntry,
  type FactQuery,
  type FactSearchResult,
} from './coordination-api';