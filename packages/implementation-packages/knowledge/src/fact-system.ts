/**
 * @file Private Fact System - Knowledge Package Implementation
 *
 * Private fact system within the knowledge package that provides coordination
 * layer integration. This encapsulates fact storage and retrieval within
 * the knowledge domain, using the core fact engine.
 *
 * This system is PRIVATE to the knowledge package and should only be accessed
 * through the knowledge package's public API.
 */

import { getLogger, getDatabaseAccess } from '@claude-zen/foundation';
// Import the high-performance Rust fact bridge from the fact-system package
import { FactBridge } from '@claude-zen/fact-system/bridge';

// Placeholder types for foundation fact system (to be implemented later)
interface FactClient {
  initialize(): Promise<void>;
  store(
    id: string,
    data: { content: unknown; metadata: Record<string, unknown> }
  ): Promise<void>;
  search(query: {
    query: string;
    sources?: string[];
    limit?: number;
  }): Promise<FactSearchResult[]>;
  getNPMPackage?(packageName: string, version?: string): Promise<unknown>;
  getGitHubRepository?(owner: string, repo: string): Promise<unknown>;
}

export interface FactSearchResult {
  id: string;
  content: unknown;
  metadata: Record<string, unknown>;
  score?: number;
}

// Simple in-memory fact client for now
async function createSQLiteFactClient(): Promise<FactClient> {
  return {
    async initialize() {
      // No-op for in-memory implementation
    },
    async store(
      _id: string,
      _data: { content: unknown; metadata: Record<string, unknown> }
    ) {
      // Store in memory (implementation can be enhanced later)
    },
    async search(_query: {
      query: string;
      sources?: string[];
      limit?: number;
    }): Promise<FactSearchResult[]> {
      // Simple search (implementation can be enhanced later)
      return [];
    },
    async getNPMPackage(
      _packageName: string,
      _version?: string
    ): Promise<unknown> {
      // Placeholder implementation
      return null;
    },
    async getGitHubRepository(_owner: string, _repo: string): Promise<unknown> {
      // Placeholder implementation
      return null;
    },
  };
}

const logger = getLogger('KnowledgeFactSystem');

/**
 * Coordination-specific fact entry structure (simplified for coordination layer)
 */
export interface CoordinationFact {
  id: string;
  type: string;
  data: unknown;
  timestamp: Date;
  source: string;
  confidence: number;
  tags: string[];
}

/**
 * Coordination fact query interface (simplified for coordination layer)
 */
export interface CoordinationFactQuery {
  type?: string;
  tags?: string[];
  source?: string;
  minConfidence?: number;
  limit?: number;
}

/**
 * Private fact system implementation within the knowledge package.
 * This class should NOT be exported from the knowledge package's main API.
 */
class KnowledgeFactSystem {
  private factClient: FactClient'' | ''null = null;
  private factBridge: FactBridge;
  private listeners = new Set<(fact: CoordinationFact) => void>();
  private coordinationFacts = new Map<string, CoordinationFact>();
  private initialized = false;

  constructor() {
    // Initialize high-performance Rust FactBridge with production configuration
    // Uses foundation package's database access for SQL, KV, Vector, and Graph storage
    this.factBridge = new FactBridge({
      useRustEngine: true, // Enable Rust for maximum performance
      database: getDatabaseAccess(), // Use foundation's database access
    });
  }

  /**
   * Initialize the fact system using Rust fact bridge
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Initialize the high-performance Rust fact bridge
      await this.factBridge.initialize();
      logger.info('✅ Rust fact bridge initialized successfully');

      // Initialize TypeScript fallback client for when Rust bridge fails
      this.factClient = await createSQLiteFactClient();
      await this.factClient.initialize();

      this.initialized = true;
      logger.info(
        '✅ Knowledge fact system initialized with Rust engine + TypeScript fallback'
      );
    } catch (error) {
      logger.error('Failed to initialize knowledge fact system:', error);
      throw error;
    }
  }

  /**
   * Store a coordination-specific fact
   */
  async storeFact(
    fact: Omit<CoordinationFact, 'id''' | '''timestamp'>
  ): Promise<string> {
    await this.ensureInitialized();

    const factEntry: CoordinationFact = {
      id: `coord-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...fact,
    };

    // Store in local coordination cache
    this.coordinationFacts.set(factEntry.id, factEntry);

    // Store in foundation fact system if available
    if (this.factClient) {
      try {
        await this.factClient.store(factEntry.id, {
          content: factEntry.data,
          metadata: {
            type: factEntry.type,
            source: factEntry.source,
            confidence: factEntry.confidence,
            tags: factEntry.tags,
            timestamp: factEntry.timestamp.toISOString(),
          },
        });
      } catch (error) {
        logger.warn('Failed to store fact in foundation system:', error);
      }
    }

    // Notify listeners
    this.notifyListeners(factEntry);

    return factEntry.id;
  }

  /**
   * Retrieve facts based on query
   */
  async queryFacts(
    query: CoordinationFactQuery = {}
  ): Promise<CoordinationFact[]> {
    await this.ensureInitialized();

    let results = Array.from(this.coordinationFacts.values())();

    // Apply filters
    if (query.type) {
      results = results.filter((fact) => fact.type === query.type);
    }
    if (query.source) {
      results = results.filter((fact) => fact.source === query.source);
    }
    if (query.tags?.length) {
      results = results.filter((fact) =>
        query.tags!.some((tag) => fact.tags.includes(tag))
      );
    }
    if (query.minConfidence !== undefined) {
      results = results.filter(
        (fact) => fact.confidence >= query.minConfidence!
      );
    }

    // Sort by confidence and timestamp
    results.sort((a, b) => {
      const confidenceDiff = b.confidence - a.confidence;
      if (confidenceDiff !== 0) return confidenceDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    // Apply limit
    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    return results;
  }

  /**
   * Get a specific fact by ID
   */
  async getFact(id: string): Promise<CoordinationFact'' | ''null> {
    await this.ensureInitialized();
    return this.coordinationFacts.get(id)'' | '''' | ''null;
  }

  /**
   * Search facts with text-based query (for compatibility with legacy code)
   */
  async searchFacts(searchParams: {
    query: string;
    type?: string;
    limit?: number;
  }): Promise<CoordinationFact[]> {
    await this.ensureInitialized();

    const { query, type, limit = 10 } = searchParams;

    // First try text-based search in stored coordination facts
    let results = Array.from(this.coordinationFacts.values())();

    // Filter by type if specified
    if (type) {
      results = results.filter((fact) => fact.type === type);
    }

    // Simple text search in fact data and tags
    const searchTerms = query.toLowerCase().split(' ');
    results = results.filter((fact) => {
      const searchableText = [
        JSON.stringify(fact.data).toLowerCase(),
        fact.type.toLowerCase(),
        fact.source.toLowerCase(),
        ...fact.tags.map((tag) => tag.toLowerCase()),
      ].join(' ');

      return searchTerms.some((term) => searchableText.includes(term));
    });

    // Sort by confidence and timestamp
    results.sort((a, b) => {
      const confidenceDiff = b.confidence - a.confidence;
      if (confidenceDiff !== 0) return confidenceDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    // Limit results
    results = results.slice(0, limit);

    // If we don't have enough local results, try external search via Rust bridge
    if (results.length < limit / 2) {
      try {
        // Use high-performance Rust fact bridge for external search
        const searchQuery = {
          query,
          factTypes: type
            ? [type as 'npm-package''' | '''github-repo''' | '''security-advisory']
            : undefined,
          limit: limit - results.length,
        };

        const externalResults = await this.factBridge.searchFacts(searchQuery);
        // Convert external results to CoordinationFact format
        for (const extResult of externalResults) {
          results.push({
            id: `ext-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: type'' | '''' | ''extResult.factType'' | '''' | '''external-knowledge',
            data: extResult.metadata'' | '''' | ''extResult,
            timestamp: new Date(),
            source:'rust-fact-bridge',
            confidence: extResult.score'' | '''' | ''0.8,
            tags: ['external', 'search', 'rust-bridge'],
          });
        }
      } catch (error) {
        logger.warn(
          'Rust bridge search failed, trying foundation fallback:',
          error
        );

        // Foundation fallback
        try {
          const fallbackResults = await this.searchExternalFacts(
            query,
            undefined,
            limit - results.length
          );
          for (const extResult of fallbackResults) {
            results.push({
              id: `ext-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: type'' | '''' | '''external-knowledge',
              data: extResult,
              timestamp: new Date(),
              source: 'foundation-fallback',
              confidence: 0.7,
              tags: ['external', 'search', 'fallback'],
            });
          }
        } catch (fallbackError) {
          logger.warn('Foundation fallback also failed:', fallbackError);
        }
      }
    }

    return results;
  }

  /**
   * Search external facts using Rust fact bridge (with foundation fallback)
   */
  async searchExternalFacts(
    query: string,
    sources?: string[],
    limit = 10
  ): Promise<FactSearchResult[]> {
    await this.ensureInitialized();

    if (!this.factClient) {
      logger.warn('Foundation fact client not available for external search');
      return [];
    }

    try {
      const searchQuery = {
        query,
        sources,
        limit,
      };

      return await this.factClient.search(searchQuery);
    } catch (error) {
      logger.error('Failed to search external facts:', error);
      return [];
    }
  }

  /**
   * Subscribe to fact changes
   */
  subscribe(listener: (fact: CoordinationFact) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Clear coordination facts
   */
  async clear(): Promise<void> {
    this.coordinationFacts.clear();
    logger.info('Cleared coordination facts');
  }

  /**
   * Check if the fact system is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get NPM package information via high-performance Rust fact bridge
   */
  async getNPMPackageInfo(packageName: string, version?: string) {
    await this.ensureInitialized();

    try {
      // First try Rust fact bridge for maximum performance
      const npmResult = await this.factBridge.getNPMFacts(packageName, version);
      logger.info(
        `✅ NPM package info retrieved via Rust bridge: ${packageName}`
      );
      return npmResult;
    } catch (error) {
      logger.warn(
        `Rust bridge NPM lookup failed for ${packageName}, trying foundation fallback:`,
        error
      );

      // Foundation fallback
      if (this.factClient) {
        try {
          return await this.factClient.getNPMPackage?.(packageName, version);
        } catch (fallbackError) {
          logger.error(
            `Foundation NPM lookup also failed for ${packageName}:`,
            fallbackError
          );
        }
      } else {
        logger.warn('Foundation fact client not available for NPM lookup');
      }

      return null;
    }
  }

  /**
   * Get GitHub repository information via high-performance Rust fact bridge
   */
  async getGitHubRepoInfo(owner: string, repo: string) {
    await this.ensureInitialized();

    try {
      // First try Rust fact bridge for maximum performance
      const githubResult = await this.factBridge.getGitHubFacts(owner, repo);
      logger.info(
        `✅ GitHub repo info retrieved via Rust bridge: ${owner}/${repo}`
      );
      return githubResult;
    } catch (error) {
      logger.warn(
        `Rust bridge GitHub lookup failed for ${owner}/${repo}, trying foundation fallback:`,
        error
      );

      // Foundation fallback
      if (this.factClient) {
        try {
          return await this.factClient.getGitHubRepository?.(owner, repo);
        } catch (fallbackError) {
          logger.error(
            `Foundation GitHub lookup also failed for ${owner}/${repo}:`,
            fallbackError
          );
        }
      } else {
        logger.warn('Foundation fact client not available for GitHub lookup');
      }

      return null;
    }
  }

  /**
   * Get foundation fact client for advanced operations (internal use only)
   */
  getFoundationFactClient(): FactClient'' | ''null {
    return this.factClient;
  }

  /**
   * Get coordination system statistics
   */
  getStats(): {
    totalFacts: number;
    factsByType: Record<string, number>;
    factsBySource: Record<string, number>;
    averageConfidence: number;
  } {
    const facts = Array.from(this.coordinationFacts.values())();
    const factsByType: Record<string, number> = {};
    const factsBySource: Record<string, number> = {};
    let totalConfidence = 0;

    for (const fact of facts) {
      factsByType[fact.type] = (factsByType[fact.type]'' | '''' | ''0) + 1;
      factsBySource[fact.source] = (factsBySource[fact.source]'' | '''' | ''0) + 1;
      totalConfidence += fact.confidence;
    }

    return {
      totalFacts: facts.length,
      factsByType,
      factsBySource,
      averageConfidence: facts.length > 0 ? totalConfidence / facts.length : 0,
    };
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Notify listeners of new facts
   */
  private notifyListeners(fact: CoordinationFact): void {
    for (const listener of this.listeners) {
      try {
        listener(fact);
      } catch (error) {
        logger.error('Error notifying fact listener:', error);
      }
    }
  }
}

// Create a single private instance (not exported)
const knowledgeFactSystem = new KnowledgeFactSystem();

export { knowledgeFactSystem };
