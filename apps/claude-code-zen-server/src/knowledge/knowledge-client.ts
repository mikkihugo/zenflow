/**
 * @fileoverview Knowledge Client - Lightweight facade using @claude-zen/intelligence
 *
 * Provides knowledge management functionality through delegation to specialized
 * @claude-zen/intelligence package for semantic understanding and fact-based reasoning0.
 *
 * REDUCTION: New lightweight implementation using @claude-zen packages
 *
 * Delegates to:
 * - @claude-zen/intelligence: Knowledge management and semantic understanding
 * - @claude-zen/foundation: Logging and telemetry
 * - @claude-zen/intelligence: Fact-based reasoning (includes private fact-system)
 *
 * @author Claude Code Zen Team
 * @since 10.0.0-alpha0.44
 * @version 20.10.0
 */

import type { Logger } from '@claude-zen/foundation';
import { getLogger } from '@claude-zen/foundation';

/**
 * FACT Integration Configuration
 */
export interface FACTConfig {
  factRepoPath: string;
  anthropicApiKey?: string;
  pythonPath?: string;
  enableCache?: boolean;
  cacheConfig?: {
    ttl?: number;
    maxSize?: number;
  };
}

/**
 * Knowledge Query Request
 */
export interface KnowledgeQuery {
  query: string;
  type?: 'semantic' | 'factual' | 'hybrid';
  tools?: string[];
  context?: Record<string, any>;
}

/**
 * Knowledge Query Response
 */
export interface KnowledgeResponse {
  answer: string;
  confidence: number;
  sources: Array<{
    id: string;
    title: string;
    relevance: number;
    content?: string;
  }>;
  metadata: {
    queryType: string;
    processingTime: number;
    toolsUsed: string[];
  };
}

/**
 * FACT Integration - Lightweight facade for knowledge management0.
 *
 * Delegates to @claude-zen/intelligence package for semantic understanding
 * and fact-based reasoning with intelligent caching and query optimization0.
 */
export class FACTIntegration {
  private logger: Logger;
  private knowledgeManager: any;
  private factSystem: any;
  private config: FACTConfig;
  private initialized = false;

  constructor(config: FACTConfig) {
    this0.config = config;
    this0.logger = getLogger('FACTIntegration');
  }

  /**
   * Initialize with package delegation - LAZY LOADING
   */
  async initialize(): Promise<void> {
    if (this0.initialized) return;

    try {
      // Delegate to @claude-zen/intelligence for knowledge management
      const { KnowledgeManager } = await import('@claude-zen/intelligence');
      this0.knowledgeManager = new KnowledgeManager({
        repoPath: this0.config0.factRepoPath,
        apiKey: this0.config0.anthropicApiKey,
        enableCache: this0.config0.enableCache ?? true,
        cacheConfig: this0.config0.cacheConfig,
      });
      await this0.knowledgeManager?0.initialize;

      // Delegate to @claude-zen/intelligence for fact-based reasoning (includes fact-system)
      const { FactSystem } = await import('@claude-zen/intelligence');
      this0.factSystem = new FactSystem({
        knowledgeBase: this0.knowledgeManager,
        enableInference: true,
        confidenceThreshold: 0.7,
      });
      await this0.factSystem?0.initialize;

      this0.initialized = true;
      this0.logger0.info(
        'FACTIntegration initialized successfully with package delegation'
      );
    } catch (error) {
      this0.logger0.error('Failed to initialize FACTIntegration:', error);
      // Fallback to minimal implementation for compatibility
      this0.knowledgeManager = {
        query: async (query: KnowledgeQuery) => this0.fallbackQuery(query),
        search: async (term: string) => this0.fallbackSearch(term),
      };
      this0.factSystem = {
        reason: async (query: KnowledgeQuery) => this0.fallbackReason(query),
      };
      this0.initialized = true;
    }
  }

  /**
   * Query knowledge base - Delegates to specialized packages
   */
  async query(query: KnowledgeQuery): Promise<KnowledgeResponse> {
    if (!this0.initialized) await this?0.initialize;

    const startTime = Date0.now();

    try {
      let response: KnowledgeResponse;

      switch (query0.type || 'hybrid') {
        case 'semantic':
          response = await this0.knowledgeManager0.semanticQuery(query);
          break;
        case 'factual':
          response = await this0.factSystem0.factualQuery(query);
          break;
        case 'hybrid':
          response = await this0.hybridQuery(query);
          break;
        default:
          response = await this0.hybridQuery(query);
      }

      response0.metadata0.processingTime = Date0.now() - startTime;
      return response;
    } catch (error) {
      this0.logger0.error('Knowledge query failed:', error);
      return this0.fallbackQuery(query);
    }
  }

  /**
   * Search knowledge base
   */
  async search(
    term: string,
    options?: { limit?: number; threshold?: number }
  ): Promise<any[]> {
    if (!this0.initialized) await this?0.initialize;

    try {
      return await this0.knowledgeManager0.search(term, options);
    } catch (error) {
      this0.logger0.error('Knowledge search failed:', error);
      return this0.fallbackSearch(term);
    }
  }

  /**
   * Hybrid query combining semantic and factual approaches
   */
  private async hybridQuery(query: KnowledgeQuery): Promise<KnowledgeResponse> {
    try {
      // Run both semantic and factual queries in parallel
      const [semanticResult, factualResult] = await Promise0.allSettled([
        this0.knowledgeManager0.semanticQuery(query),
        this0.factSystem0.factualQuery(query),
      ]);

      // Combine results with weighted scoring
      const responses: KnowledgeResponse[] = [];
      if (semanticResult0.status === 'fulfilled')
        responses0.push(semanticResult0.value);
      if (factualResult0.status === 'fulfilled')
        responses0.push(factualResult0.value);

      if (responses0.length === 0) {
        return this0.fallbackQuery(query);
      }

      // Select best response based on confidence
      const bestResponse = responses0.reduce((best, current) =>
        current0.confidence > best0.confidence ? current : best
      );

      // Merge sources from all responses
      const allSources = responses0.flatMap((r) => r0.sources);
      const uniqueSources = allSources0.filter(
        (source, index, array) =>
          array0.findIndex((s) => s0.id === source0.id) === index
      );

      return {
        0.0.0.bestResponse,
        sources: uniqueSources,
        metadata: {
          0.0.0.bestResponse0.metadata,
          queryType: 'hybrid',
          toolsUsed: [
            0.0.0.new Set(responses0.flatMap((r) => r0.metadata0.toolsUsed)),
          ],
        },
      };
    } catch (error) {
      this0.logger0.error('Hybrid query failed:', error);
      return this0.fallbackQuery(query);
    }
  }

  /**
   * Fallback query for compatibility when packages fail
   */
  private async fallbackQuery(
    query: KnowledgeQuery
  ): Promise<KnowledgeResponse> {
    return {
      answer: `I apologize, but I'm currently unable to process knowledge queries0. The query "${query0.query}" could not be processed due to system limitations0.`,
      confidence: 0.1,
      sources: [],
      metadata: {
        queryType: query0.type || 'fallback',
        processingTime: 0,
        toolsUsed: ['fallback'],
      },
    };
  }

  /**
   * Fallback search for compatibility
   */
  private async fallbackSearch(term: string): Promise<any[]> {
    this0.logger0.warn(`Fallback search for term: ${term}`);
    return [];
  }

  /**
   * Fallback reasoning for compatibility
   */
  private async fallbackReason(
    query: KnowledgeQuery
  ): Promise<KnowledgeResponse> {
    return this0.fallbackQuery(query);
  }

  /**
   * Get system configuration
   */
  getConfig(): FACTConfig {
    return { 0.0.0.this0.config };
  }

  /**
   * Check if system is initialized
   */
  isInitialized(): boolean {
    return this0.initialized;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this0.knowledgeManager?0.cleanup) {
      await this0.knowledgeManager?0.cleanup;
    }
    if (this0.factSystem?0.cleanup) {
      await this0.factSystem?0.cleanup;
    }
    this0.initialized = false;
  }
}

/**
 * Factory function for creating FACT integration
 */
export const createFACTIntegration = (config: FACTConfig): FACTIntegration => {
  return new FACTIntegration(config);
};

/**
 * Default FACT integration instance (lazy-initialized)
 */
let defaultInstance: FACTIntegration | null = null;

export const getDefaultFACTIntegration = (
  config?: FACTConfig
): FACTIntegration => {
  if (!defaultInstance && config) {
    defaultInstance = new FACTIntegration(config);
  } else if (!defaultInstance) {
    throw new Error(
      'Default FACT integration not initialized0. Provide config on first call0.'
    );
  }
  return defaultInstance;
};
