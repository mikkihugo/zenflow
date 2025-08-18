/**
 * @file Shared Fact System - Migration Compatibility Layer
 * 
 * DEPRECATED: This file now re-exports from @claude-zen/knowledge package.
 * 
 * The shared fact system has been moved to the knowledge package as a private
 * implementation. This file maintains backward compatibility for existing code.
 * 
 * New code should import directly from @claude-zen/knowledge:
 * ```typescript
 * import {
 *   getCoordinationFactSystem,
 *   storeCoordinationFact,
 *   queryCoordinationFacts,
 *   searchCoordinationFacts,
 * } from '@claude-zen/knowledge';
 * ```
 */

// Re-export everything from the knowledge package for backward compatibility
export {
  // Main API functions
  getCoordinationFactSystem,
  initializeCoordinationFactSystem,
  storeCoordinationEvent,
  getCoordinationFacts,
  queryCoordinationFacts as queryFacts,
  searchCoordinationFacts as searchFacts,
  storeCoordinationFact as storeFact,
  
  // Convenience functions
  storeAgentFact,
  queryAgentFacts,
  searchExternalFacts,
  getNPMPackageInfo,
  getGitHubRepoInfo,
  
  // Types
  type CoordinationFact as FactEntry,
  type CoordinationFactQuery as FactQuery,
} from '@claude-zen/knowledge';

// Compatibility class for legacy code
export class SharedFactSystem {
  /**
   * Get the coordination fact system instance (compatibility)
   * @deprecated Use getCoordinationFactSystem() from @claude-zen/knowledge instead
   */
  static getInstance() {
    return getCoordinationFactSystem();
  }
  
  /**
   * Check if initialized (compatibility)
   * @deprecated Use getCoordinationFactSystem().isInitialized() instead
   */
  isInitialized(): boolean {
    return getCoordinationFactSystem().isInitialized();
  }
  
  /**
   * Get stats (compatibility) 
   * @deprecated Use getCoordinationFactSystem().getStats() instead
   */
  getStats() {
    return getCoordinationFactSystem().getStats();
  }
}

// Compatibility export for legacy imports
import { 
  getCoordinationFactSystem,
  initializeCoordinationFactSystem,
  storeCoordinationEvent,
  getCoordinationFacts,
  queryCoordinationFacts,
  searchCoordinationFacts,
  storeCoordinationFact,
} from '@claude-zen/knowledge';

// Legacy shared instance
const legacyCompatibility = {
  isInitialized: () => getCoordinationFactSystem().isInitialized(),
  getStats: () => getCoordinationFactSystem().getStats(),
};

/**
 * @deprecated Use getCoordinationFactSystem() from @claude-zen/knowledge instead
 */
export const sharedFactSystem = legacyCompatibility;

/**
 * @deprecated Use initializeCoordinationFactSystem from @claude-zen/knowledge instead
 */
export const initializeCoordinationFactSystem = initializeCoordinationFactSystem;

/**
 * @deprecated Import directly from @claude-zen/knowledge instead
 */
export { storeCoordinationEvent, getCoordinationFacts };