/**
 * @fileoverview Natural Language Query Interface for FACT System
 *
 * Provides natural language querying capabilities for the FACT system,
 * converting human language into structured API calls for agentic workflows.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { FactSearchQuery } from './types';
/**
 * Query intent classification
 */
export declare enum QueryIntent {
  NPM_PACKAGE = 'npm-package',
  GITHUB_REPO = 'github-repo',
  SECURITY_CHECK = 'security-check',
  API_DOCS = 'api-docs',
  GENERAL_SEARCH = 'general-search',
  COMPARISON = 'comparison',
  TRENDING = 'trending',
  VULNERABILITY = 'vulnerability',
}
/**
 * Extracted query parameters from natural language
 */
interface ParsedQuery {
  intent: QueryIntent;
  entities: {
    packageNames?: string[];
    repoOwners?: string[];
    repoNames?: string[];
    technologies?: string[];
    keywords?: string[];
    cveIds?: string[];
  };
  modifiers: {
    timeRange?: string;
    sortBy?: string;
    includeMetrics?: boolean;
    securityFocus?: boolean;
    performanceFocus?: boolean;
  };
  confidence: number;
}
/**
 * Natural Language Query processor for FACT system
 */
export declare class NaturalLanguageQuery {
  private patterns;
  constructor();
  /**
   * Process natural language query and convert to structured FACT operations
   */
  processQuery(query: string): Promise<{
    structuredQueries: FactSearchQuery[];
    parsedQuery: ParsedQuery;
    explanation: string;
  }>;
  /**
   * Parse natural language query into structured components
   */
  private parseQuery;
  /**
   * Classify the intent of the query
   */
  private classifyIntent;
  /**
   * Extract named entities from the query
   */
  private extractEntities;
  /**
   * Extract query modifiers
   */
  private extractModifiers;
  /**
   * Convert parsed query to structured FACT queries
   */
  private convertToStructuredQueries;
  /**
   * Generate human-readable explanation of what the system will do
   */
  private generateExplanation;
  /**
   * Initialize regex patterns for intent classification
   */
  private initializePatterns;
  /**
   * Check if query matches any of the given patterns
   */
  private matchesPatterns;
  /**
   * Calculate confidence score for the parsing
   */
  private calculateConfidence;
}
//# sourceMappingURL=natural-language-query.d.ts.map
