/**
 * @file Shared Fact System - Migration Compatibility Layer
 *
 * DEPRECATED: This file now re-exports from @claude-zen/intelligence package.
 *
 * The shared fact system has been moved to the knowledge package as a private
 * implementation. This file maintains backward compatibility for existing code.
 *
 * New code should import directly from @claude-zen/intelligence:
 * ``'typescript
 * import {
  * getCoordinationFactSystem,
  * storeCoordinationFact,
  * queryCoordinationFacts,
  * searchCoordinationFacts,
  *
} from '@claude-zen/intelligence';
 * ``'
 */

// Re-export everything from the knowledge package for backward compatibility
// Compatibility export for legacy imports
import {
  getCoordinationFactSystem,
  initializeCoordinationFactSystem,
  storeCoordinationEvent,
  getCoordinationFacts

} from '@claude-zen/intelligence';

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
  type CoordinationFactQuery as FactQuery

} from '@claude-zen/intelligence';

// Compatibility class for legacy code
export class SharedFactSystem {
  /**
   * Get the coordination fact system instance (compatibility)
   * @deprecated Use getCoordinationFactSystem() from @claude-zen/intelligence instead
   */
  static getInstance() {
    return getCoordinationFactSystem()
}

  /**
   * Check if initialized (compatibility)
   * @deprecated Use getCoordinationFactSystem()?.isInitialized instead
   */
  isInitialized(): boolean  {
  return getCoordinationFactSystem()?.isInitialized() ?? false

}

  /**
   * Get stats (compatibility)
   * @deprecated Use getCoordinationFactSystem()?.getStats instead
   */
  getStats() {
    return getCoordinationFactSystem()?.getStats()
}

  /**
   * Search facts (compatibility)
   * @deprecated Use searchCoordinationFacts from @claude-zen/intelligence instead
   */
  async searchFacts(query: any): Promise<any[]>  {
    // Import search function and use it
    const { searchCoordinationFacts } = await import(
      '@claude-zen/intelligence;
    );
    r'turn searchCoordinationFacts(query)
}
}

// Legacy shared instance
const legacyCompatibility = {
  isInitialized: () => getCoordinationFactSystem()?.isInitialized(),
  getStats: () => getCoordinationFactSystem()?.getStats()

};

/**
 * @deprecated Use getCoordinationFactSystem(; from @claude-zen/intelligence instead
 */
export const sharedFactSystem = legacyCompatibility;

/**
 * @deprecated Use initializeCoordinationFactSystem from @claude-zen/intelligence instead
 */
export { initializeCoordinationFactSystem };

/**
 * @deprecated Import directly from @claude-zen/intelligence instead
 */
export {
  storeCoordinationEvent,
  getCoordinationFacts

};