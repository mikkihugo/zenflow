/**
 * @fileoverview Knowledge Package - 100% EVENT-DRIVEN
 *
 * **100% EVENT-BASED KNOWLEDGE MANAGEMENT**
 *
 * Pure event-driven knowledge system with ZERO imports.
 * Listens to brain events and responds with knowledge data via events only.
 *
 * **EVENT-DRIVEN CAPABILITIES:**
 * - 🧠 **Brain Integration**:Responds to brain knowledge requests via events
 * - 📊 **Knowledge Storage**:Stores and retrieves knowledge items via events
 * - 🔍 **Smart Search**:Provides content and semantic search via events
 * - 📈 **Query Processing**:Advanced filtering and pagination via events
 * - 🎯 **Zero Dependencies**:No foundation or database imports
 * - ⚡ **Real-time Stats**:Knowledge analytics via event responses
 *
 * **EVENT ARCHITECTURE:**
 * Brain emits knowledge requests → Knowledge Service responds with data events
 * Pure event coordination with no direct package dependencies.
 *
 * @author Claude Code Zen Team
 * @version 2.0.0-event-driven
 */

// =============================================================================
// PRIMARY EVENT-DRIVEN EXPORTS (ZERO IMPORTS)
// =============================================================================
export {
  createEventDrivenKnowledgeService,
  EventDrivenKnowledgeService,
  EventDrivenKnowledgeService as default,
} from './knowledge-event-driven.js';

// =============================================================================
// LEGACY EXPORTS (WITH IMPORTS - DEPRECATED)
// =============================================================================

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
} from './coordination-api';
// export * from './intelligent-doc-import'; // Temporarily disabled due to compilation issues
export * from './main';
export { BasicKnowledgeManager } from './main';
