/**
 * @fileoverview Knowledge Package - Main exports
 *
 * This package provides collective intelligence, distributed learning,
 * and knowledge management capabilities for the swarm system.
 */
export * from './main';
export * from './intelligent-doc-import';
export { BasicKnowledgeManager} from './main';
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
  type CoordinationFact,
  type CoordinationFactQuery,
  type FactEntry,
  type FactQuery,
  type FactSearchResult,
} from './coordination-api';
//# sourceMappingURL=index.d.ts.map
