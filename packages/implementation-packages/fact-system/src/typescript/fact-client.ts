/**
 * @fileoverview High-level FACT System Client
 * 
 * Provides a clean TypeScript API for the FACT (Fast Augmented Context Tools) system.
 * Combines high-performance Rust processing with TypeScript coordination and 
 * integrates with the unified database package for storage.
 * 
 * @author Claude Code Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

import { 
  getDatabaseAccess, 
  getLogger,
  type Logger,
  ContextError,
  withRetry,
  Storage,
  getConfig
} from '@claude-zen/foundation';
import { FactBridge } from './fact-bridge';
import type {
  FactSearchQuery,
  FactSearchResult,
  FactSystemConfig,
  GitHubFactResult,
  NPMFactResult,
  SecurityFactResult,
  HexFactResult,
  APIDocumentationFactResult,
  RustCrateFactResult,
  GoModuleFactResult,
  PerlPackageFactResult,
  JavaPackageFactResult,
  GitLabRepoFactResult,
  BitbucketRepoFactResult
} from './types';

const logger = getLogger('FactClient');

/**
 * High-level FACT System client that provides easy access to external facts
 * with high-performance Rust processing and unified database storage.
 */
export class FactClient {
  private bridge: FactBridge;
  private database: any;
  private config: FactSystemConfig;

  constructor(config: FactSystemConfig) {
    this.config = {
      useRustEngine: true,
      cacheSize: 10000,
      cacheTTL: 3600000, // 1 hour
      enableGitHubGraphQL: true,
      enableRealTimeAPIs: true,
      ...config
    };

    this.database = config.database;
    this.bridge = new FactBridge({
      useRustEngine: this.config.useRustEngine || false,
      database: this.database
    });
  }

  /**
   * Initialize the FACT system
   */
  async initialize(): Promise<void> {
    logger.info('Initializing FACT System...');
    
    await this.bridge.initialize();
    
    logger.info('✅ FACT System initialized successfully');
  }

  /**
   * Search for facts - simple SQL query, very fast
   */
  async search(query: FactSearchQuery): Promise<FactSearchResult[]> {
    logger.debug(`Searching facts: ${query.query}`);
    return this.bridge.searchFacts(query);
  }

  /**
   * Get NPM package - fast query
   */
  async getNPMPackage(packageName: string, version?: string): Promise<NPMFactResult> {
    return this.bridge.getNPMFacts(packageName, version);
  }

  /**
   * Get GitHub repository - fast query
   */
  async getGitHubRepository(owner: string, repo: string): Promise<GitHubFactResult> {
    return this.bridge.getGitHubFacts(owner, repo);
  }

  /**
   * Get security advisory - fast query
   */
  async getSecurityAdvisory(cveId: string): Promise<SecurityFactResult> {
    return this.bridge.getSecurityFacts(cveId);
  }

  /**
   * Get Hex package - fast query
   */
  async getHexPackage(packageName: string, version?: string): Promise<HexFactResult> {
    return this.bridge.getHexFacts(packageName, version);
  }

  /**
   * Get API documentation - fast query
   */
  async getAPIDocumentation(apiName: string, endpoint?: string): Promise<APIDocumentationFactResult> {
    return this.bridge.getAPIDocsFacts(apiName, endpoint);
  }

  /**
   * Get Rust crate - fast query (with docs.rs integration)
   */
  async getRustCrate(crateName: string, version?: string): Promise<RustCrateFactResult> {
    return this.bridge.getRustCrateFacts(crateName, version);
  }

  /**
   * Get Go module - fast query
   */
  async getGoModule(modulePath: string, version?: string): Promise<GoModuleFactResult> {
    return this.bridge.getGoModuleFacts(modulePath, version);
  }

  /**
   * Get Perl package - fast query (CPAN)
   */
  async getPerlPackage(packageName: string, version?: string): Promise<PerlPackageFactResult> {
    return this.bridge.getPerlPackageFacts(packageName, version);
  }

  /**
   * Get Java package - fast query (Maven Central)
   */
  async getJavaPackage(groupId: string, artifactId: string, version?: string): Promise<JavaPackageFactResult> {
    return this.bridge.getJavaPackageFacts(groupId, artifactId, version);
  }

  /**
   * Get GitLab repository - fast query
   */
  async getGitLabRepository(projectPath: string): Promise<GitLabRepoFactResult> {
    return this.bridge.getGitLabRepoFacts(projectPath);
  }

  /**
   * Get Bitbucket repository - fast query
   */
  async getBitbucketRepository(workspace: string, repoSlug: string): Promise<BitbucketRepoFactResult> {
    return this.bridge.getBitbucketRepoFacts(workspace, repoSlug);
  }

  /**
   * Clear cache - simple
   */
  async clearCache(): Promise<void> {
    // Clear cache using foundation's KV store
    const kv = await this.database.getKV('facts');
    await kv.clear();
  }

  /**
   * Get system statistics
   */
  async getStats(): Promise<{
    cacheSize: number;
    totalQueries: number;
    cacheHitRate: number;
    rustEngineActive: boolean;
  }> {
    const stats = await this.bridge.getStats();
    
    return {
      ...stats,
      rustEngineActive: this.config.useRustEngine || false
    };
  }


  /**
   * Shutdown the FACT system
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down FACT System...');
    
    await this.bridge.shutdown();
    
    logger.info('✅ FACT System shut down');
  }
}

/**
 * Factory function to create a FACT client with common configurations
 */
export const createFactClient = (config: FactSystemConfig): FactClient => {
  return new FactClient(config);
};

/**
 * Create a FACT client with SQLite storage (good for development)
 */
export const createSQLiteFactClient = async (): Promise<FactClient> => {
  return new FactClient({
    database: getDatabaseAccess(),
    useRustEngine: true,
    enableGitHubGraphQL: true
  });
};

/**
 * Create a FACT client with LanceDB storage (good for vector searches)
 */
export const createLanceDBFactClient = async (): Promise<FactClient> => {
  return new FactClient({
    database: getDatabaseAccess(),
    useRustEngine: true,
    enableGitHubGraphQL: true
  });
};

/**
 * Create a FACT client with Kuzu graph storage (good for relationship queries)
 */
export const createKuzuFactClient = async (): Promise<FactClient> => {
  return new FactClient({
    database: getDatabaseAccess(),
    useRustEngine: true,
    enableGitHubGraphQL: true
  });
};