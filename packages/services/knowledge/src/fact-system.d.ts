/**
 * @file Private Fact System - Knowledge Package Implementation
 *
 * Private fact system within the knowledge package that provides coordination
 * layer integration. This encapsulates fact storage and retrieval within
 * the knowledge domain, using the core fact engine.
 *
 * This system is PRIVATE to the knowledge package and should only be accessed
 * through the knowledge package's public API.')s main API.')id|timestamp''>):Promise<string>;')  /**
   * Retrieve facts based on query
   */
  queryFacts(): void {
    query: string;
    type?:string;
    limit?:number;
}):Promise<CoordinationFact[]>;
  /**
   * Search external facts using Rust fact bridge (with foundation fallback)
   */
  searchExternalFacts(): void {
    totalFacts: number;
    factsByType: Record<string, number>;
    factsBySource: Record<string, number>;
    averageConfidence: number;
};
  private ensureInitialized;
  /**
   * Notify listeners of new facts
   */
  private notifyListeners;
}
declare const knowledgeFactSystem: KnowledgeFactSystem;
export { knowledgeFactSystem};
//# sourceMappingURL=fact-system.d.ts.map
