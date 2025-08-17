/**
 * @fileoverview Shared FACT System - Universal Knowledge Access for THE COLLECTIVE
 * 
 * Implementation of the shared FACT (Federated Agent Context Technology) system
 * that provides universal knowledge access across all hierarchy levels within
 * THE COLLECTIVE. This system acts as the "manuals of the internet" - a shared
 * knowledge base accessible to all levels without access restrictions.
 * 
 * ## Knowledge Sharing Philosophy
 * 
 * The FACT system implements **true knowledge democracy**:
 * - **Universal Access**: All hierarchy levels access the SAME knowledge base
 * - **No Hierarchical Restrictions**: Agents and Queens have identical access
 * - **Shared Intelligence**: Knowledge learned by one level benefits all levels
 * - **Real-time Synchronization**: Updates propagate instantly across all levels
 * 
 * ## Architecture Overview
 * 
 * ```
 * THE COLLECTIVE (Neural Hub) ───┬─── SHARED FACT SYSTEM
 *     ↓                        │
 * CUBES (Domain Specialists) ───┼─── Same Knowledge Base
 *     ↓                        │
 * CUBE MATRONS ───────────┼─── Universal Access
 *     ↓                        │
 * QUEEN COORDINATORS ───────┼─── Instant Updates
 *     ↓                        │
 * SWARMCOMMANDERS ────────┼─── Real-time Sync
 *     ↓                        │
 * AGENTS/DRONES ──────────┼─── Equal Access Rights
 * ```
 * 
 * ## Knowledge Sources Integration
 * 
 * The FACT system aggregates knowledge from multiple sources:
 * - **Context7**: Advanced context understanding
 * - **DeepWiki**: Deep Wikipedia integration
 * - **GitMCP**: Git repository insights
 * - **Semgrep**: Code security patterns
 * - **Rust FACT Core**: High-performance fact processing
 * - **GitHub GraphQL**: Repository metadata and insights
 * - **NPM Registry**: Package information and dependencies
 * - **Security Advisories**: Vulnerability and security data
 * 
 * ## Performance Characteristics
 * 
 * - **Cache Size**: 100,000 entries shared across all levels
 * - **Auto-Refresh**: 30-minute update cycles for fresh data
 * - **Concurrent Access**: Thread-safe access for multiple hierarchy levels
 * - **Memory Efficiency**: Single instance serves all coordination levels
 * 
 * ## Usage Patterns
 * 
 * ### For Strategic Levels (Queens, Matrons)
 * ```typescript
 * // Strategic analysis using shared knowledge
 * const architecturalPatterns = await factSystem.searchFacts({
 *   query: 'microservices architecture patterns',
 *   type: 'architectural-guidance',
 *   limit: 10
 * });
 * ```
 * 
 * ### For Tactical Levels (SwarmCommanders)
 * ```typescript
 * // Task coordination with knowledge context
 * const implementationGuidance = await factSystem.searchFacts({
 *   query: 'React TypeScript best practices',
 *   type: 'implementation-guidance',
 *   limit: 5
 * });
 * ```
 * 
 * ### For Execution Levels (Agents)
 * ```typescript
 * // Direct implementation support
 * const codeExamples = await factSystem.searchFacts({
 *   query: 'async/await error handling',
 *   type: 'code-examples',
 *   limit: 3
 * });
 * ```
 * 
 * ## Integration with Hierarchy Levels
 * 
 * All hierarchy levels that need FACT access extend `SharedFACTCapable`:
 * - Automatic initialization on class instantiation
 * - Consistent API across all hierarchy levels
 * - Event-driven coordination for knowledge updates
 * - Error handling and resilience patterns
 * 
 * @example
 * ```typescript
 * // Base usage for any hierarchy level
 * export class MyHierarchyLevel extends SharedFACTCapable {
 *   async initialize() {
 *     await this.initializeSharedFACT();
 *     
 *     // Now can access shared knowledge
 *     const knowledge = await this.searchSharedFacts({
 *       query: 'my search query',
 *       limit: 10
 *     });
 *   }
 * }
 * 
 * // Direct access (for standalone usage)
 * const factSystem = await getSharedCollectiveFACT();
 * const results = await factSystem.searchFacts({ query: 'nodejs performance' });
 * ```
 * 
 * @author Claude Code Zen Team
 * @since 2.0.0
 * @version 2.0.0
 * 
 * @see {@link CollectiveFACTSystem} Core FACT system implementation
 * @see {@link SharedFACTCapable} Base class for FACT-enabled hierarchy levels
 * @see {@link TheCollective} Top-level coordination system
 * 
 * @module SharedFACTSystem
 * @namespace TheCollective.FACT
 */

import { EventEmitter } from 'node:events';
import { getLogger } from '../config/logging-config';
import {
  CollectiveFACTSystem,
  getCollectiveFACT,
  initializeCollectiveFACT,
} from './collective-fact-integration';
import type { CollectiveFACTConfig } from './collective-types';

const logger = getLogger('SharedFACTSystem');

/**
 * Shared FACT system configuration optimized for all hierarchy levels
 */
const SHARED_FACT_CONFIG: CollectiveFACTConfig = {
  enableCache: true,
  cacheSize: 100000, // Large cache shared across all levels
  knowledgeSources: [
    'context7',
    'deepwiki',
    'gitmcp',
    'semgrep',
    'rust-fact-core',
    'github-graphql',
    'npm-registry',
    'security-advisories',
  ],
  autoRefreshInterval: 1800000, // 30 minutes
};

/**
 * Get or initialize the shared CollectiveFACTSystem.
 * This ensures ALL hierarchy levels access the same FACT database.
 *
 * @returns Promise<CollectiveFACTSystem> - The shared FACT system instance
 */
export async function getSharedCollectiveFACT(): Promise<CollectiveFACTSystem> {
  let sharedFact = getCollectiveFACT();

  if (!sharedFact) {
    logger.info(
      'Initializing SHARED CollectiveFACTSystem for all hierarchy levels...'
    );

    // Initialize the shared FACT system once for all hierarchy levels
    sharedFact = await initializeCollectiveFACT(SHARED_FACT_CONFIG);

    logger.info(
      '✅ SHARED CollectiveFACTSystem initialized - universal access active'
    );
  }

  return sharedFact;
}

/**
 * Base class for hierarchy levels that need FACT access.
 * Provides common shared FACT functionality.
 * Includes EventEmitter functionality for coordination.
 */
export abstract class SharedFACTCapable extends EventEmitter {
  protected factSystem?: CollectiveFACTSystem;

  /**
   * Initialize shared FACT system access for this hierarchy level
   */
  protected async initializeSharedFACT(): Promise<void> {
    try {
      this.factSystem = await getSharedCollectiveFACT();

      // Log successful integration
      const levelName = this.constructor.name;
      logger.info(`🔗 ${levelName} connected to SHARED CollectiveFACTSystem`);
    } catch (error) {
      logger.error(
        `Failed to initialize shared FACT for ${this.constructor.name}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get shared FACT system instance
   */
  protected getSharedFACT(): CollectiveFACTSystem {
    if (!this.factSystem) {
      throw new Error(
        `Shared FACT not initialized for ${this.constructor.name}`
      );
    }
    return this.factSystem;
  }

  /**
   * Access shared ADRs (Architecture Decision Records) across all levels
   */
  protected async getSharedADRs(query: string): Promise<any[]> {
    const fact = this.getSharedFACT();
    const results = await fact.searchFacts({
      query: `ADR architecture decision ${query}`,
      type: 'architecture-decision',
      limit: 10,
    });

    return results.map((r) => ({
      id: r.metadata?.factId,
      title: query,
      content: r.result,
      source: r.metadata?.source,
      timestamp: r.metadata?.timestamp,
    }));
  }

  /**
   * Store shared knowledge accessible to all hierarchy levels
   */
  protected async storeSharedKnowledge(
    type: string,
    subject: string,
    content: any,
    metadata?: any
  ): Promise<void> {
    const fact = this.getSharedFACT();

    await fact.storeFact({
      id: `${type}:${subject}:${Date.now()}`,
      type: type as any,
      category: 'knowledge',
      subject,
      content,
      source: `${this.constructor.name}-shared`,
      confidence: 0.9,
      timestamp: Date.now(),
      metadata: {
        ...metadata,
        sharedBy: this.constructor.name,
        universalAccess: true,
      },
      accessCount: 0,
      cubeAccess: new Set(),
      swarmAccess: new Set(),
    });

    logger.debug(
      `📝 ${this.constructor.name} stored shared knowledge: ${type}:${subject}`
    );
  }
}

/**
 * Remove level-specific FACT storage directories.
 * This enforces the shared FACT principle by removing fragmented storage.
 */
export async function removeLevelSpecificFACTStorage(): Promise<void> {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');

  const levelSpecificPaths = [
    '.claude-zen/fact/swarm-commander',
    '.claude-zen/fact/queen-coordinator',
    '.claude-zen/fact/dev-cube-matron',
    '.claude-zen/fact/ops-cube-matron',
    '.claude-zen/fact/agents',
  ];

  for (const levelPath of levelSpecificPaths) {
    try {
      const fullPath = path.resolve(process.cwd(), levelPath);
      await fs.rm(fullPath, { recursive: true, force: true });
      logger.info(`🗑️  Removed level-specific FACT storage: ${levelPath}`);
    } catch (error) {
      // Ignore if directory doesn't exist
      logger.debug(`Level-specific path doesn't exist (OK): ${levelPath}`);
    }
  }

  logger.info(
    '✅ Level-specific FACT storage cleanup complete - shared access enforced'
  );
}

/**
 * Universal FACT helpers for all hierarchy levels
 */
export const UniversalFACTHelpers = {
  /**
   * Search shared knowledge accessible to all levels
   */
  async searchSharedKnowledge(query: string, type?: string): Promise<any[]> {
    const fact = await getSharedCollectiveFACT();
    return await fact.searchFacts({ query, type: type as any, limit: 20 });
  },

  /**
   * Get NPM package facts (shared across all levels)
   */
  async getNPMFacts(packageName: string, version?: string): Promise<any> {
    const fact = await getSharedCollectiveFACT();
    return await fact.npmFacts(packageName, version);
  },

  /**
   * Get GitHub repository facts (shared across all levels)
   */
  async getGitHubFacts(owner: string, repo: string): Promise<any> {
    const fact = await getSharedCollectiveFACT();
    return await fact.githubFacts(owner, repo);
  },

  /**
   * Get shared ADRs across all hierarchy levels
   */
  async getUniversalADRs(domain: string): Promise<any[]> {
    const fact = await getSharedCollectiveFACT();
    const results = await fact.searchFacts({
      query: `architecture decision record ADR ${domain}`,
      type: 'architecture-decision',
      limit: 15,
    });

    return results.map((r) => ({
      domain,
      title: `ADR - ${domain}`,
      content: r.result,
      source: r.metadata?.source,
      confidence: r.metadata?.confidence,
      timestamp: r.metadata?.timestamp,
      universalAccess: true,
    }));
  },
};

export default {
  getSharedCollectiveFACT,
  SharedFACTCapable,
  removeLevelSpecificFACTStorage,
  UniversalFACTHelpers,
};
