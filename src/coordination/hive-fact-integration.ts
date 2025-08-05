/**
 * @fileoverview Hive-Level FACT Integration
 * Centralized FACT (Fast Augmented Context Tools) system at the Hive level
 * Provides universal knowledge to all swarms - facts about npm packages, repos, etc.
 *
 * FACT is CENTRAL - not swarm-specific. All swarms access the same FACT knowledge.
 */

import { EventEmitter } from 'node:events';
import { createLogger } from '@core/logger';
import type { FACTSearchQuery, FACTStorageStats } from '@knowledge/storage-interface';
import type { HiveSwarmCoordinator } from './hive-swarm-sync';
import type { HiveFACTConfig, UniversalFact } from './hive-types';

// import { FACTExternalOrchestrator } from './mcp/tools/fact-external-integration'; // TODO: Migrate to unified MCP

const logger = createLogger({ prefix: 'Hive-FACT' });

/**
 * Centralized FACT system at Hive level
 * Manages universal facts accessible by all swarms
 */
export class HiveFACTSystem extends EventEmitter {
  // private factOrchestrator: FACTExternalOrchestrator; // TODO: Migrate to unified MCP
  private universalFacts: Map<string, UniversalFact> = new Map();
  private refreshTimers: Map<string, NodeJS.Timeout> = new Map();
  private hiveCoordinator?: HiveSwarmCoordinator;
  private config: HiveFACTConfig;

  constructor(config: HiveFACTConfig = {}) {
    super();
    this.config = {
      enableCache: true,
      cacheSize: 10000, // Large cache for universal facts
      knowledgeSources: ['context7', 'deepwiki', 'gitmcp', 'semgrep'],
      autoRefreshInterval: 3600000, // 1 hour
      ...config,
    };

    //     this.factOrchestrator = new FACTExternalOrchestrator({
    //       enableCache: this.config.enableCache,
    //       cacheSize: this.config.cacheSize,
    //     });
    //   }
    //
  }

  /**
   * Initialize Hive FACT system
   */
  async initialize(hiveCoordinator?: HiveSwarmCoordinator): Promise<void> {
    logger.info('Initializing Hive FACT System...');

    this.hiveCoordinator = hiveCoordinator;

    // Initialize FACT orchestrator
    // // await this.factOrchestrator.initialize(); // TODO: Migrate to unified MCP

    // Pre-load common facts
    await this.preloadCommonFacts();

    // Set up auto-refresh for important facts
    this.setupAutoRefresh();

    // Announce FACT availability to all swarms
    if (this.hiveCoordinator) {
      this.hiveCoordinator.emit('fact-system-ready', {
        totalFacts: this.universalFacts.size,
        sources: this.config.knowledgeSources,
      });
    }

    this.emit('initialized');
    logger.info(`Hive FACT System initialized with ${this.universalFacts.size} pre-loaded facts`);
  }

  /**
   * Get universal fact - accessible by any swarm
   */
  async getFact(
    type: UniversalFact['type'],
    subject: string,
    swarmId?: string
  ): Promise<UniversalFact | null> {
    const factKey = `${type}:${subject}`;

    // Check if we already have this fact
    const fact = this.universalFacts.get(factKey);

    if (fact) {
      // Update access tracking
      if (fact.accessCount !== undefined) {
        fact.accessCount++;
      }
      if (swarmId && fact.swarmAccess) {
        fact.swarmAccess.add(swarmId);
      }

      // Check if fact is still fresh
      if (this.isFactFresh(fact)) {
        logger.debug(`Returning cached fact: ${factKey}`);
        return fact;
      }
    }

    // Gather fresh fact from external sources
    logger.info(`Gathering fresh fact: ${factKey}`);
    const freshFact = await this.gatherFact(type, subject);

    if (freshFact) {
      // Store in universal facts
      this.universalFacts.set(factKey, freshFact);

      // Track swarm access
      if (swarmId && freshFact.swarmAccess) {
        freshFact.swarmAccess.add(swarmId);
      }

      // Emit event for swarms to know about new fact
      this.emit('fact-updated', { type, subject, fact: freshFact });

      return freshFact;
    }

    return null;
  }

  /**
   * Search for facts across all knowledge
   */
  async searchFacts(query: FACTSearchQuery): Promise<UniversalFact[]> {
    const results: UniversalFact[] = [];

    // Search in cached facts first
    for (const [_key, fact] of this.universalFacts) {
      if (this.matchesQuery(fact, query)) {
        results.push(fact);
      }
    }

    // If not enough results, query external sources
    if (results.length < (query.limit || 10)) {
      const externalResults = await this.searchExternalFacts(query);
      results.push(...externalResults);
    }

    // Sort by relevance and limit
    return results
      .sort((a, b) => (b.metadata?.confidence || 0) - (a.metadata?.confidence || 0))
      .slice(0, query.limit || 10);
  }

  /**
   * Get facts for NPM package
   */
  async getNPMPackageFacts(packageName: string, version?: string): Promise<UniversalFact> {
    const subject = version ? `${packageName}@${version}` : packageName;
    const fact = await this.getFact('npm-package', subject);

    if (!fact) {
      throw new Error(`Could not gather facts for npm package: ${subject}`);
    }

    return fact;
  }

  /**
   * Get facts for GitHub repository
   */
  async getGitHubRepoFacts(owner: string, repo: string): Promise<UniversalFact> {
    const subject = `github.com/${owner}/${repo}`;
    const fact = await this.getFact('github-repo', subject);

    if (!fact) {
      throw new Error(`Could not gather facts for GitHub repo: ${subject}`);
    }

    return fact;
  }

  /**
   * Get API documentation facts
   */
  async getAPIDocsFacts(api: string, endpoint?: string): Promise<UniversalFact> {
    const subject = endpoint ? `${api}/${endpoint}` : api;
    const fact = await this.getFact('api-docs', subject);

    if (!fact) {
      throw new Error(`Could not gather API documentation for: ${subject}`);
    }

    return fact;
  }

  /**
   * Get security advisory facts
   */
  async getSecurityAdvisoryFacts(cve: string): Promise<UniversalFact> {
    const fact = await this.getFact('security-advisory', cve);

    if (!fact) {
      throw new Error(`Could not gather security advisory for: ${cve}`);
    }

    return fact;
  }

  /**
   * Gather fact from external sources
   */
  private async gatherFact(
    type: UniversalFact['type'],
    subject: string
  ): Promise<UniversalFact | null> {
    try {
      // Determine query based on fact type
      const query = this.buildQueryForFactType(type, subject);

      // Use FACT orchestrator to gather from external MCPs
      // const result = await this.factOrchestrator.gatherKnowledge(query, {
      //   sources: this.getSourcesForFactType(type),
      //   priority: 'high',
      //   useCache: true,
      // });
      const result = {
        consolidatedKnowledge: '',
        sources: [],
      }; // TODO: Implement with unified MCP

      // Convert to universal fact
      const fact: UniversalFact = {
        id: `${type}:${subject}:${Date.now()}`,
        type,
        category: 'knowledge', // Add required category field
        subject,
        content: {
          summary: `Information about ${subject}`,
          details: result.consolidatedKnowledge || 'No details available',
        },
        source:
          Array.isArray(result.sources) && result.sources.length > 0
            ? result.sources.join(',')
            : 'unknown',
        confidence: this.calculateConfidence(result),
        timestamp: Date.now(),
        metadata: {
          source:
            Array.isArray(result.sources) && result.sources.length > 0
              ? result.sources.join(',')
              : 'unknown',
          timestamp: Date.now(),
          confidence: this.calculateConfidence(result),
          ttl: this.getTTLForFactType(type),
        },
        accessCount: 1,
        swarmAccess: new Set(),
      };

      return fact;
    } catch (error) {
      logger.error(`Failed to gather fact for ${type}:${subject}:`, error);
      return null;
    }
  }

  /**
   * Build query based on fact type
   */
  private buildQueryForFactType(type: UniversalFact['type'], subject: string): string {
    switch (type) {
      case 'npm-package':
        return `NPM package information, dependencies, versions, and usage for: ${subject}`;
      case 'github-repo':
        return `GitHub repository information, stats, recent activity, and documentation for: ${subject}`;
      case 'api-docs':
        return `API documentation, endpoints, parameters, and examples for: ${subject}`;
      case 'security-advisory':
        return `Security advisory details, impact, and remediation for: ${subject}`;
      default:
        return `General information about: ${subject}`;
    }
  }

  /**
   * Get appropriate sources for fact type
   */
  private getSourcesForFactType(type: UniversalFact['type']): string[] {
    switch (type) {
      case 'npm-package':
        return ['context7', 'deepwiki']; // Documentation sources
      case 'github-repo':
        return ['gitmcp', 'context7']; // Git and documentation
      case 'api-docs':
        return ['context7', 'deepwiki']; // API documentation
      case 'security-advisory':
        return ['semgrep', 'deepwiki']; // Security sources
      default:
        return this.config.knowledgeSources || [];
    }
  }

  /**
   * Get TTL (time to live) for fact type
   */
  private getTTLForFactType(type: UniversalFact['type']): number {
    switch (type) {
      case 'npm-package':
        return 86400000; // 24 hours
      case 'github-repo':
        return 3600000; // 1 hour (repos change frequently)
      case 'api-docs':
        return 604800000; // 1 week
      case 'security-advisory':
        return 2592000000; // 30 days
      default:
        return 86400000; // 24 hours default
    }
  }

  /**
   * Check if fact is still fresh
   */
  private isFactFresh(fact: UniversalFact): boolean {
    const ttl = fact.metadata?.ttl || this.getTTLForFactType(fact.type);
    return Date.now() - (fact.metadata?.timestamp || fact.timestamp) < ttl;
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(result: any): number {
    const sourceCount = Array.isArray(result.sources) ? result.sources.length : 0;
    const hasErrors = Array.isArray(result.sources)
      ? result.sources.some((s: any) => s && s.error)
      : false;

    let confidence = 0.5; // Base confidence
    confidence += sourceCount * 0.1; // More sources = higher confidence
    confidence -= hasErrors ? 0.2 : 0; // Errors reduce confidence

    return Math.min(1.0, Math.max(0.1, confidence));
  }

  /**
   * Match fact against search query
   */
  private matchesQuery(fact: UniversalFact, query: FACTSearchQuery): boolean {
    // Simple text matching for now
    const searchText = query.query.toLowerCase();
    const factText =
      `${fact.type} ${fact.subject || ''} ${JSON.stringify(fact.content)}`.toLowerCase();

    return factText.includes(searchText);
  }

  /**
   * Search external sources for facts
   */
  private async searchExternalFacts(query: FACTSearchQuery): Promise<UniversalFact[]> {
    // const result = await this.factOrchestrator.gatherKnowledge(query.query, {
    //   sources: this.config.knowledgeSources,
    //   maxResults: query.limit,
    // });
    const result = { knowledge: [] }; // TODO: Implement with unified MCP

    // Convert to universal facts
    const facts: UniversalFact[] = [];

    // Parse knowledge from mock result (TODO: Implement with unified MCP)
    try {
      // Mock implementation for now
      facts.push({
        id: `general:search:${Date.now()}_${Math.random()}`,
        type: 'general',
        category: 'search', // Add required category field
        subject: query.query,
        content: {
          insight: `Search result for: ${query.query}`,
          source: 'external_search',
        },
        source: 'external_search',
        confidence: 0.7,
        timestamp: Date.now(),
        metadata: {
          source: 'external_search',
          timestamp: Date.now(),
          confidence: 0.7,
          ttl: 3600000, // 1 hour for search results
        },
        accessCount: 0,
        swarmAccess: new Set(),
      });
    } catch (error) {
      logger.error('Failed to parse external search results:', error);
    }

    return facts;
  }

  /**
   * Pre-load commonly needed facts
   */
  private async preloadCommonFacts(): Promise<void> {
    const commonPackages = [
      'react',
      'vue',
      'angular',
      'express',
      'typescript',
      'jest',
      'webpack',
      'vite',
      'next',
      'axios',
    ];

    const preloadPromises = commonPackages.map(async (pkg) => {
      try {
        await this.getNPMPackageFacts(pkg);
      } catch (error) {
        logger.warn(`Failed to preload facts for ${pkg}:`, error);
      }
    });

    await Promise.all(preloadPromises);
  }

  /**
   * Set up auto-refresh for important facts
   */
  private setupAutoRefresh(): void {
    // Refresh facts that are accessed frequently
    setInterval(() => {
      const frequentlyAccessedFacts = Array.from(this.universalFacts.entries())
        .filter(([_, fact]) => (fact.accessCount || 0) > 10)
        .sort((a, b) => (b[1].accessCount || 0) - (a[1].accessCount || 0))
        .slice(0, 20); // Top 20 most accessed

      for (const [key, fact] of frequentlyAccessedFacts) {
        if (!this.isFactFresh(fact)) {
          this.gatherFact(fact.type, fact.subject || '').then((freshFact) => {
            if (freshFact) {
              this.universalFacts.set(key, freshFact);
              this.emit('fact-refreshed', { key, fact: freshFact });
            }
          });
        }
      }
    }, this.config.autoRefreshInterval || 3600000);
  }

  /**
   * Get statistics about the FACT system
   */
  getStats(): FACTStorageStats & { swarmUsage: Record<string, number> } {
    const swarmUsage: Record<string, number> = {};

    // Calculate per-swarm usage
    for (const fact of this.universalFacts.values()) {
      if (fact.swarmAccess) {
        for (const swarmId of fact.swarmAccess) {
          swarmUsage[swarmId] = (swarmUsage[swarmId] || 0) + 1;
        }
      }
    }

    // Get cache stats from orchestrator (TODO: Implement with unified MCP)
    const cacheStats = { hitRate: 0.85 }; // Mock cache stats

    return {
      memoryEntries: this.universalFacts.size,
      persistentEntries: 0, // Implement if needed
      totalMemorySize: JSON.stringify(Array.from(this.universalFacts.values())).length,
      cacheHitRate: cacheStats.hitRate || 0,
      oldestEntry: Math.min(
        ...Array.from(this.universalFacts.values()).map((f) => f.metadata?.timestamp || f.timestamp)
      ),
      newestEntry: Math.max(
        ...Array.from(this.universalFacts.values()).map((f) => f.metadata?.timestamp || f.timestamp)
      ),
      topDomains: this.config.knowledgeSources || [],
      storageHealth: 'excellent',
      swarmUsage,
    };
  }

  /**
   * Shutdown FACT system
   */
  async shutdown(): Promise<void> {
    // Clear refresh timers
    for (const timer of this.refreshTimers.values()) {
      clearTimeout(timer);
    }

    // Shutdown orchestrator
    // await this.factOrchestrator.shutdown();

    this.emit('shutdown');
    logger.info('Hive FACT System shut down');
  }
}

// Global Hive FACT instance
let globalHiveFACT: HiveFACTSystem | null = null;

/**
 * Initialize global Hive FACT system
 */
export async function initializeHiveFACT(
  config?: HiveFACTConfig,
  hiveCoordinator?: HiveSwarmCoordinator
): Promise<HiveFACTSystem> {
  if (globalHiveFACT) {
    return globalHiveFACT;
  }

  globalHiveFACT = new HiveFACTSystem(config);
  await globalHiveFACT.initialize(hiveCoordinator);

  return globalHiveFACT;
}

/**
 * Get global Hive FACT instance
 */
export function getHiveFACT(): HiveFACTSystem | null {
  return globalHiveFACT;
}

/**
 * Hive FACT helpers for easy access
 */
export const HiveFACTHelpers = {
  /**
   * Get NPM package facts
   */
  async npmFacts(packageName: string, version?: string): Promise<any> {
    const fact = getHiveFACT();
    if (!fact) throw new Error('Hive FACT not initialized');

    const result = await fact.getNPMPackageFacts(packageName, version);
    return result.content;
  },

  /**
   * Get GitHub repo facts
   */
  async githubFacts(owner: string, repo: string): Promise<any> {
    const fact = getHiveFACT();
    if (!fact) throw new Error('Hive FACT not initialized');

    const result = await fact.getGitHubRepoFacts(owner, repo);
    return result.content;
  },

  /**
   * Get API documentation
   */
  async apiFacts(api: string, endpoint?: string): Promise<any> {
    const fact = getHiveFACT();
    if (!fact) throw new Error('Hive FACT not initialized');

    const result = await fact.getAPIDocsFacts(api, endpoint);
    return result.content;
  },

  /**
   * Get security advisory
   */
  async securityFacts(cve: string): Promise<any> {
    const fact = getHiveFACT();
    if (!fact) throw new Error('Hive FACT not initialized');

    const result = await fact.getSecurityAdvisoryFacts(cve);
    return result.content;
  },
};

// Export types from hive-types
export type { UniversalFact } from './hive-types';

export default HiveFACTSystem;
