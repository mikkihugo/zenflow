/**
 * @file Universal FACT Mixin
 * Provides shared FACT access capabilities to any class in the hierarchy.
 *
 * This mixin ensures ALL hierarchy levels (Cubes, Matrons, Queens, SwarmCommanders, Agents)
 * can access the shared FACT system using consistent patterns.
 */

import { getLogger } from '../config/logging-config.ts';
import type { CollectiveFACTSystem } from './collective-fact-integration.ts';
import {
  getUniversalFACTAccess,
  type UniversalFACTAccess,
} from './shared-fact-access.ts';

const logger = getLogger('Universal-FACT-Mixin');

/**
 * Universal FACT capabilities interface.
 * Can be mixed into any hierarchy level class.
 */
export interface UniversalFACTCapabilities {
  /** Get shared FACT system access */
  getSharedFACTSystem(): Promise<CollectiveFACTSystem>;

  /** Search facts using shared system */
  searchSharedFacts(query: unknown): Promise<unknown[]>;

  /** Store fact in shared system */
  storeSharedFact(fact: unknown): Promise<void>;

  /** Get NPM package facts */
  getSharedNPMFacts(packageName: string, version?: string): Promise<unknown>;

  /** Get GitHub repository facts */
  getSharedGitHubFacts(owner: string, repo: string): Promise<unknown>;

  /** Get API documentation facts */
  getSharedAPIFacts(api: string, endpoint?: string): Promise<unknown>;

  /** Get security advisory facts */
  getSharedSecurityFacts(cve: string): Promise<unknown>;
}

/**
 * Mixin function to add universal FACT capabilities to any class.
 *
 * @param hierarchyLevel - The hierarchy level using this mixin
 * @returns Mixin class with universal FACT capabilities
 */
export function withUniversalFACT<T extends new (...args: unknown[]) => object>(
  hierarchyLevel: 'Cube' | 'Matron' | 'Queen' | 'SwarmCommander' | 'Agent'
) {
  return function <U extends T>(BaseClass: U) {
    return class extends BaseClass implements UniversalFACTCapabilities {
      private _sharedFactSystem: CollectiveFACTSystem | null = null;

      /**
       * Get shared FACT system access.
       * Lazy-loaded and cached for performance.
       */
      public async getSharedFACTSystem(): Promise<CollectiveFACTSystem> {
        if (!this._sharedFactSystem) {
          logger.debug(
            `${hierarchyLevel} initializing shared FACT system access`
          );
          this._sharedFactSystem = await getUniversalFACTAccess(hierarchyLevel);
          logger.debug(`✅ ${hierarchyLevel} shared FACT system access ready`);
        }
        return this._sharedFactSystem;
      }

      /**
       * Search facts using shared system.
       * Unified interface for all hierarchy levels.
       */
      public async searchSharedFacts(query: {
        query?: string;
        type?: string;
        limit?: number;
        domains?: string[];
      }): Promise<unknown[]> {
        try {
          const factSystem = await this.getSharedFACTSystem();
          const results = await factSystem.searchFacts(query);

          logger.debug(
            `${hierarchyLevel} searched shared facts: ${results.length} results`
          );
          return results;
        } catch (error) {
          logger.error(`${hierarchyLevel} shared fact search failed:`, error);
          throw error;
        }
      }

      /**
       * Store fact in shared system.
       * Available to all hierarchy levels.
       */
      public async storeSharedFact(fact: {
        id?: string;
        type: string;
        subject: string;
        content: unknown;
        source: string;
        confidence: number;
      }): Promise<void> {
        try {
          const factSystem = await this.getSharedFACTSystem();

          // Convert to UniversalFact format
          const universalFact = {
            id: fact.id || `${fact.type}:${fact.subject}:${Date.now()}`,
            type: fact.type as any,
            category: 'shared',
            subject: fact.subject,
            content: fact.content,
            source: fact.source,
            confidence: fact.confidence,
            timestamp: Date.now(),
            metadata: {
              source: fact.source,
              timestamp: Date.now(),
              confidence: fact.confidence,
              addedBy: hierarchyLevel,
            },
            accessCount: 0,
            cubeAccess: new Set<string>(),
            swarmAccess: new Set<string>(),
          };

          await factSystem.storeFact(universalFact);

          logger.debug(
            `✅ ${hierarchyLevel} stored shared fact: ${fact.subject}`
          );
        } catch (error) {
          logger.error(`${hierarchyLevel} shared fact storage failed:`, error);
          throw error;
        }
      }

      /**
       * Get NPM package facts using shared system.
       */
      public async getSharedNPMFacts(
        packageName: string,
        version?: string
      ): Promise<unknown> {
        try {
          const factSystem = await this.getSharedFACTSystem();
          const result = await factSystem.getNPMPackageFacts(
            packageName,
            version
          );

          logger.debug(
            `✅ ${hierarchyLevel} retrieved NPM facts for: ${packageName}`
          );
          return result.content;
        } catch (error) {
          logger.error(`${hierarchyLevel} NPM fact retrieval failed:`, error);
          throw error;
        }
      }

      /**
       * Get GitHub repository facts using shared system.
       */
      public async getSharedGitHubFacts(
        owner: string,
        repo: string
      ): Promise<unknown> {
        try {
          const factSystem = await this.getSharedFACTSystem();
          const result = await factSystem.getGitHubRepoFacts(owner, repo);

          logger.debug(
            `✅ ${hierarchyLevel} retrieved GitHub facts for: ${owner}/${repo}`
          );
          return result.content;
        } catch (error) {
          logger.error(
            `${hierarchyLevel} GitHub fact retrieval failed:`,
            error
          );
          throw error;
        }
      }

      /**
       * Get API documentation facts using shared system.
       */
      public async getSharedAPIFacts(
        api: string,
        endpoint?: string
      ): Promise<unknown> {
        try {
          const factSystem = await this.getSharedFACTSystem();
          const result = await factSystem.getAPIDocsFacts(api, endpoint);

          logger.debug(`✅ ${hierarchyLevel} retrieved API facts for: ${api}`);
          return result.content;
        } catch (error) {
          logger.error(`${hierarchyLevel} API fact retrieval failed:`, error);
          throw error;
        }
      }

      /**
       * Get security advisory facts using shared system.
       */
      public async getSharedSecurityFacts(cve: string): Promise<unknown> {
        try {
          const factSystem = await this.getSharedFACTSystem();
          const result = await factSystem.getSecurityAdvisoryFacts(cve);

          logger.debug(
            `✅ ${hierarchyLevel} retrieved security facts for: ${cve}`
          );
          return result.content;
        } catch (error) {
          logger.error(
            `${hierarchyLevel} security fact retrieval failed:`,
            error
          );
          throw error;
        }
      }
    };
  };
}

/**
 * Convenience mixins for specific hierarchy levels.
 */
export const withCubeFACT = withUniversalFACT('Cube');
export const withMatronFACT = withUniversalFACT('Matron');
export const withQueenFACT = withUniversalFACT('Queen');
export const withSwarmCommanderFACT = withUniversalFACT('SwarmCommander');
export const withAgentFACT = withUniversalFACT('Agent');

/**
 * Type guard to check if an object has universal FACT capabilities.
 */
export function hasUniversalFACTCapabilities(
  obj: unknown
): obj is UniversalFACTCapabilities {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'getSharedFACTSystem' in obj &&
    'searchSharedFacts' in obj &&
    'storeSharedFact' in obj
  );
}

/**
 * Abstract base class with universal FACT capabilities.
 * Can be extended by any hierarchy level class.
 */
export abstract class UniversalFACTBase implements UniversalFACTCapabilities {
  private _sharedFactSystem: CollectiveFACTSystem | null = null;
  protected abstract hierarchyLevel:
    | 'Cube'
    | 'Matron'
    | 'Queen'
    | 'SwarmCommander'
    | 'Agent';

  public async getSharedFACTSystem(): Promise<CollectiveFACTSystem> {
    if (!this._sharedFactSystem) {
      logger.debug(
        `${this.hierarchyLevel} initializing shared FACT system access`
      );
      this._sharedFactSystem = await getUniversalFACTAccess(
        this.hierarchyLevel
      );
      logger.debug(`✅ ${this.hierarchyLevel} shared FACT system access ready`);
    }
    return this._sharedFactSystem;
  }

  public async searchSharedFacts(query: unknown): Promise<unknown[]> {
    try {
      const factSystem = await this.getSharedFACTSystem();
      const results = await factSystem.searchFacts(query as any);

      logger.debug(
        `${this.hierarchyLevel} searched shared facts: ${results.length} results`
      );
      return results;
    } catch (error) {
      logger.error(`${this.hierarchyLevel} shared fact search failed:`, error);
      throw error;
    }
  }

  public async storeSharedFact(fact: unknown): Promise<void> {
    try {
      const factSystem = await this.getSharedFACTSystem();
      await factSystem.storeFact(fact as any);

      logger.debug(`✅ ${this.hierarchyLevel} stored shared fact`);
    } catch (error) {
      logger.error(`${this.hierarchyLevel} shared fact storage failed:`, error);
      throw error;
    }
  }

  public async getSharedNPMFacts(
    packageName: string,
    version?: string
  ): Promise<unknown> {
    try {
      const factSystem = await this.getSharedFACTSystem();
      const result = await factSystem.getNPMPackageFacts(packageName, version);

      logger.debug(
        `✅ ${this.hierarchyLevel} retrieved NPM facts for: ${packageName}`
      );
      return result.content;
    } catch (error) {
      logger.error(`${this.hierarchyLevel} NPM fact retrieval failed:`, error);
      throw error;
    }
  }

  public async getSharedGitHubFacts(
    owner: string,
    repo: string
  ): Promise<unknown> {
    try {
      const factSystem = await this.getSharedFACTSystem();
      const result = await factSystem.getGitHubRepoFacts(owner, repo);

      logger.debug(
        `✅ ${this.hierarchyLevel} retrieved GitHub facts for: ${owner}/${repo}`
      );
      return result.content;
    } catch (error) {
      logger.error(
        `${this.hierarchyLevel} GitHub fact retrieval failed:`,
        error
      );
      throw error;
    }
  }

  public async getSharedAPIFacts(
    api: string,
    endpoint?: string
  ): Promise<unknown> {
    try {
      const factSystem = await this.getSharedFACTSystem();
      const result = await factSystem.getAPIDocsFacts(api, endpoint);

      logger.debug(`✅ ${this.hierarchyLevel} retrieved API facts for: ${api}`);
      return result.content;
    } catch (error) {
      logger.error(`${this.hierarchyLevel} API fact retrieval failed:`, error);
      throw error;
    }
  }

  public async getSharedSecurityFacts(cve: string): Promise<unknown> {
    try {
      const factSystem = await this.getSharedFACTSystem();
      const result = await factSystem.getSecurityAdvisoryFacts(cve);

      logger.debug(
        `✅ ${this.hierarchyLevel} retrieved security facts for: ${cve}`
      );
      return result.content;
    } catch (error) {
      logger.error(
        `${this.hierarchyLevel} security fact retrieval failed:`,
        error
      );
      throw error;
    }
  }
}

export default withUniversalFACT;
