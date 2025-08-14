/**
 * @file Shared FACT System Implementation
 * Universal access to CollectiveFACTSystem across all hierarchy levels
 * 
 * This module ensures that ALL hierarchy levels (Cubes, Matrons, Queens, SwarmCommanders, Agents)
 * access the SAME CollectiveFACTSystem instance - implementing true "manuals of the internet" sharing.
 * 
 * NO LEVEL-SPECIFIC STORAGE: All levels share the same knowledge base.
 */

import { EventEmitter } from 'node:events';
import { getLogger } from '../config/logging-config.ts';
import { CollectiveFACTSystem, getCollectiveFACT, initializeCollectiveFACT } from './collective-fact-integration.ts';
import type { CollectiveFACTConfig } from './collective-types.ts';

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
    'security-advisories'
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
    logger.info('Initializing SHARED CollectiveFACTSystem for all hierarchy levels...');
    
    // Initialize the shared FACT system once for all hierarchy levels
    sharedFact = await initializeCollectiveFACT(SHARED_FACT_CONFIG);
    
    logger.info('✅ SHARED CollectiveFACTSystem initialized - universal access active');
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
      logger.error(`Failed to initialize shared FACT for ${this.constructor.name}:`, error);
      throw error;
    }
  }
  
  /**
   * Get shared FACT system instance
   */
  protected getSharedFACT(): CollectiveFACTSystem {
    if (!this.factSystem) {
      throw new Error(`Shared FACT not initialized for ${this.constructor.name}`);
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
    
    return results.map(r => ({
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
    
    logger.debug(`📝 ${this.constructor.name} stored shared knowledge: ${type}:${subject}`);
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
  
  logger.info('✅ Level-specific FACT storage cleanup complete - shared access enforced');
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
    
    return results.map(r => ({
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