/**
 * @fileoverview Knowledge Client - Lightweight facade using @claude-zen/knowledge
 * 
 * Provides knowledge management functionality through delegation to specialized
 * @claude-zen/knowledge package for semantic understanding and fact-based reasoning.
 * 
 * REDUCTION: New lightweight implementation using @claude-zen packages
 * 
 * Delegates to:
 * - @claude-zen/knowledge: Knowledge management and semantic understanding  
 * - @claude-zen/foundation: Logging and telemetry
 * - @claude-zen/knowledge: Fact-based reasoning (includes private fact-system)
 * 
 * @author Claude Code Zen Team
 * @since 1.0.0-alpha.44
 * @version 2.1.0
 */

import type { Logger } from '@claude-zen/foundation';
import { getLogger } from '../config/logging-config';

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
 * FACT Integration - Lightweight facade for knowledge management.
 * 
 * Delegates to @claude-zen/knowledge package for semantic understanding
 * and fact-based reasoning with intelligent caching and query optimization.
 */
export class FACTIntegration {
  private logger: Logger;
  private knowledgeManager: any;
  private factSystem: any;
  private config: FACTConfig;
  private initialized = false;

  constructor(config: FACTConfig) {
    this.config = config;
    this.logger = getLogger('FACTIntegration');
  }

  /**
   * Initialize with package delegation - LAZY LOADING
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Delegate to @claude-zen/knowledge for knowledge management
      const { KnowledgeManager } = await import('@claude-zen/knowledge');
      this.knowledgeManager = new KnowledgeManager({
        repoPath: this.config.factRepoPath,
        apiKey: this.config.anthropicApiKey,
        enableCache: this.config.enableCache ?? true,
        cacheConfig: this.config.cacheConfig
      });
      await this.knowledgeManager.initialize();

      // Delegate to @claude-zen/knowledge for fact-based reasoning (includes fact-system)
      const { FactSystem } = await import('@claude-zen/knowledge');
      this.factSystem = new FactSystem({
        knowledgeBase: this.knowledgeManager,
        enableInference: true,
        confidenceThreshold: 0.7
      });
      await this.factSystem.initialize();

      this.initialized = true;
      this.logger.info('FACTIntegration initialized successfully with package delegation');

    } catch (error) {
      this.logger.error('Failed to initialize FACTIntegration:', error);
      // Fallback to minimal implementation for compatibility
      this.knowledgeManager = {
        query: async (query: KnowledgeQuery) => this.fallbackQuery(query),
        search: async (term: string) => this.fallbackSearch(term)
      };
      this.factSystem = {
        reason: async (query: KnowledgeQuery) => this.fallbackReason(query)
      };
      this.initialized = true;
    }
  }

  /**
   * Query knowledge base - Delegates to specialized packages
   */
  async query(query: KnowledgeQuery): Promise<KnowledgeResponse> {
    if (!this.initialized) await this.initialize();

    const startTime = Date.now();
    
    try {
      let response: KnowledgeResponse;

      switch (query.type || 'hybrid') {
        case 'semantic':
          response = await this.knowledgeManager.semanticQuery(query);
          break;
        case 'factual':
          response = await this.factSystem.factualQuery(query);
          break;
        case 'hybrid':
          response = await this.hybridQuery(query);
          break;
        default:
          response = await this.hybridQuery(query);
      }

      response.metadata.processingTime = Date.now() - startTime;
      return response;

    } catch (error) {
      this.logger.error('Knowledge query failed:', error);
      return this.fallbackQuery(query);
    }
  }

  /**
   * Search knowledge base
   */
  async search(term: string, options?: { limit?: number; threshold?: number }): Promise<any[]> {
    if (!this.initialized) await this.initialize();

    try {
      return await this.knowledgeManager.search(term, options);
    } catch (error) {
      this.logger.error('Knowledge search failed:', error);
      return this.fallbackSearch(term);
    }
  }

  /**
   * Hybrid query combining semantic and factual approaches
   */
  private async hybridQuery(query: KnowledgeQuery): Promise<KnowledgeResponse> {
    try {
      // Run both semantic and factual queries in parallel
      const [semanticResult, factualResult] = await Promise.allSettled([
        this.knowledgeManager.semanticQuery(query),
        this.factSystem.factualQuery(query)
      ]);

      // Combine results with weighted scoring
      const responses: KnowledgeResponse[] = [];
      if (semanticResult.status === 'fulfilled') responses.push(semanticResult.value);
      if (factualResult.status === 'fulfilled') responses.push(factualResult.value);

      if (responses.length === 0) {
        return this.fallbackQuery(query);
      }

      // Select best response based on confidence
      const bestResponse = responses.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );

      // Merge sources from all responses
      const allSources = responses.flatMap(r => r.sources);
      const uniqueSources = allSources.filter((source, index, array) => 
        array.findIndex(s => s.id === source.id) === index
      );

      return {
        ...bestResponse,
        sources: uniqueSources,
        metadata: {
          ...bestResponse.metadata,
          queryType: 'hybrid',
          toolsUsed: [...new Set(responses.flatMap(r => r.metadata.toolsUsed))]
        }
      };

    } catch (error) {
      this.logger.error('Hybrid query failed:', error);
      return this.fallbackQuery(query);
    }
  }

  /**
   * Fallback query for compatibility when packages fail
   */
  private async fallbackQuery(query: KnowledgeQuery): Promise<KnowledgeResponse> {
    return {
      answer: `I apologize, but I'm currently unable to process knowledge queries. The query "${query.query}" could not be processed due to system limitations.`,
      confidence: 0.1,
      sources: [],
      metadata: {
        queryType: query.type || 'fallback',
        processingTime: 0,
        toolsUsed: ['fallback']
      }
    };
  }

  /**
   * Fallback search for compatibility
   */
  private async fallbackSearch(term: string): Promise<any[]> {
    this.logger.warn(`Fallback search for term: ${term}`);
    return [];
  }

  /**
   * Fallback reasoning for compatibility
   */
  private async fallbackReason(query: KnowledgeQuery): Promise<KnowledgeResponse> {
    return this.fallbackQuery(query);
  }

  /**
   * Get system configuration
   */
  getConfig(): FACTConfig {
    return { ...this.config };
  }

  /**
   * Check if system is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this.knowledgeManager?.cleanup) {
      await this.knowledgeManager.cleanup();
    }
    if (this.factSystem?.cleanup) {
      await this.factSystem.cleanup();
    }
    this.initialized = false;
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

export const getDefaultFACTIntegration = (config?: FACTConfig): FACTIntegration => {
  if (!defaultInstance && config) {
    defaultInstance = new FACTIntegration(config);
  } else if (!defaultInstance) {
    throw new Error('Default FACT integration not initialized. Provide config on first call.');
  }
  return defaultInstance;
};