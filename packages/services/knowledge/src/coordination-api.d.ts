/**
 * @file Coordination API - Public Interface for Coordination Layer
 *
 * This file provides the public API for coordination layer to interact with
 * the knowledge package's fact system. The actual implementation remains')./fact-system';
export type { CoordinationFact, CoordinationFactQuery, FactSearchResult};
export type FactEntry = CoordinationFact;
export type FactQuery = CoordinationFactQuery;
/**
 * Get the coordination fact system instance (read-only access to initialized state)
 */
export declare function getCoordinationFactSystem(): void {
  isInitialized:() => boolean;
  getStats:() => {
    totalFacts: number;
    factsByType: Record<string, number>;
    factsBySource: Record<string, number>;
    averageConfidence: number;
};
};
/**
 * Initialize the coordination fact system
 */
export declare function initializeCoordinationFactSystem(): void {
  query: string;
  type?:string;
  limit?:number;
}):Promise<CoordinationFact[]>;
/**
 * Get coordination facts (convenience function)
 */
export declare function getCoordinationFacts(
  limit?:number
):Promise<CoordinationFact[]>;
/**
 * Store a coordination event as a fact
 */
export declare function storeCoordinationEvent(
  eventType: string,
  eventData: unknown,
  agentId?:string
):Promise<string>;
/**
 * Convenience functions for agent integration
 */
export declare function storeAgentFact(
  agentId: string,
  type: string,
  data: unknown,
  confidence?:number,
  tags?:string[]
):Promise<string>;
export declare function queryAgentFacts(
  agentId?:string,
  type?:string,
  limit?:number
):Promise<CoordinationFact[]>;
/**
 * Search external facts (NPM, GitHub, security, etc.) using foundation fact system
 */
export declare function searchExternalFacts(
  query: string,
  sources?:string[],
  limit?:number
):Promise<FactSearchResult[]>;
/**
 * Get NPM package information using high-performance Rust fact bridge
 */
export declare function getNPMPackageInfo(
  packageName: string,
  version?:string
):Promise<unknown>;
/**
 * Get GitHub repository information using high-performance Rust fact bridge
 */
export declare function getGitHubRepoInfo(
  owner: string,
  repo: string
):Promise<unknown>;
//# sourceMappingURL=coordination-api.d.ts.map
