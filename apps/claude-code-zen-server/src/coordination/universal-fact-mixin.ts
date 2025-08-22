/**
 * @file Universal Fact Mixin - Foundation Fact System Integration
 *
 * Provides a mixin that adds foundation fact system capabilities to any agent class.
 * This allows agents to seamlessly integrate with both coordination facts and
 * external facts (NPM, GitHub, security, etc.) through the foundation fact system.
 */

import { getLogger } from '@claude-zen/foundation';

import('./shared-fact-system';
import {
  sharedFactSystem,
  storeAgentFact,
  queryAgentFacts,
  searchExternalFacts,
  getNPMPackageInfo,
  getGitHubRepoInfo,
} from "./shared-fact-system";

const logger = getLogger('UniversalFactMixin');

/**
 * Enhanced fact-capable interface that agents can implement
 * Includes both coordination facts and external fact access
 */
export interface FactCapable {
  agentId: string;
  storeFact(
    type: string,
    data: any,
    confidence?: number,
    tags?: string[]
  ): Promise<string>;
  queryFacts(query?: FactQuery): Promise<FactEntry[]>;
  getMyFacts(type?: string, limit?: number): Promise<FactEntry[]>;
  shareFact(factId: string, targetAgentId?: string): Promise<boolean>;

  // External fact system access through foundation
  searchExternalFacts(
    query: string,
    sources?: string[],
    limit?: number
  ): Promise<any[]>;
  getNPMPackageInfo(packageName: string, version?: string): Promise<unknown>;
  getGitHubRepoInfo(owner: string, repo: string): Promise<unknown>;
}

/**
 * Fact mixin constructor type
 */
export type FactMixinConstructor<T = {}> = new (args: any[]) => T;

/**
 * Universal fact mixin that adds fact capabilities to any class
 */
export function withFactCapabilities<
  TBase extends FactMixinConstructor<{ agentId: string }>,
>(Base: TBase) {
  return class FactEnhanced extends Base implements FactCapable {
    /**
     * Store a fact associated with this agent
     */
    async storeFact(
      type: string,
      data: any,
      confidence = 1.0,
      tags: string[] = []
    ): Promise<string> {
      try {
        const factId = await storeAgentFact(
          this.agentId,
          type,
          data,
          confidence,
          tags
        );
        logger.debug(`Agent ${this.agentId} stored fact: ${factId} (${type})`);
        return factId;
      } catch (error) {
        logger.error(`Failed to store fact for agent ${this.agentId}:`, error);
        throw error;
      }
    }

    /**
     * Query facts from the shared system
     */
    async queryFacts(query: FactQuery = {}): Promise<FactEntry[]> {
      try {
        return await sharedFactSystem.queryFacts(query);
      } catch (error) {
        logger.error(`Failed to query facts for agent ${this.agentId}:`, error);
        return [];
      }
    }

    /**
     * Get facts stored by this agent
     */
    async getMyFacts(type?: string, limit = 100): Promise<FactEntry[]> {
      try {
        return await queryAgentFacts(this.agentId, type, limit);
      } catch (error) {
        logger.error(`Failed to get facts for agent ${this.agentId}:`, error);
        return [];
      }
    }

    /**
     * Share a fact with another agent (adds sharing metadata)
     */
    async shareFact(factId: string, targetAgentId?: string): Promise<boolean> {
      try {
        const fact = await sharedFactSystem.getFact(factId);
        if (!fact) {
          logger.warn(`Fact ${factId} not found for sharing`);
          return false;
        }

        // Create a sharing event
        await sharedFactSystem.storeFact({
          type: 'fact_sharing',
          data: {
            originalFactId: factId,
            sharedBy: this.agentId,
            sharedWith: targetAgentId || 'all',
            originalFact: fact,
          },
          source: `agent:${this.agentId}`,
          confidence: 1.0,
          tags: ['sharing, collaboration'],
        });

        logger.debug(
          `Agent ${this.agentId} shared fact ${factId} with ${targetAgentId || 'all'}`
        );
        return true;
      } catch (error) {
        logger.error(`Failed to share fact ${factId}:`, error);
        return false;
      }
    }

    /**
     * Store a decision or reasoning fact
     */
    async storeDecision(
      decision: string,
      reasoning: string,
      confidence = 1.0,
      context?: any
    ): Promise<string> {
      return await this.storeFact(
        'decision',
        {
          decision,
          reasoning,
          context,
        },
        confidence,
        ['decision, reasoning']
      );
    }

    /**
     * Store an observation fact
     */
    async storeObservation(
      observation: string,
      category: string,
      confidence = 1.0,
      metadata?: any
    ): Promise<string> {
      return await this.storeFact(
        'observation',
        {
          observation,
          category,
          metadata,
        },
        confidence,
        ['observation', category]
      );
    }

    /**
     * Store a learning or insight fact
     */
    async storeLearning(
      insight: string,
      evidence: any,
      confidence = 1.0,
      applicableContexts: string[] = []
    ): Promise<string> {
      return await this.storeFact(
        'learning',
        {
          insight,
          evidence,
          applicableContexts,
        },
        confidence,
        ['learning, insight', ...applicableContexts]
      );
    }

    /**
     * Get recent decisions made by this agent
     */
    async getRecentDecisions(limit = 10): Promise<FactEntry[]> {
      return await this.queryFacts({
        type: 'decision',
        source: `agent:${this.agentId}`,
        limit,
      });
    }

    /**
     * Get observations in a specific category
     */
    async getObservations(category?: string, limit = 20): Promise<FactEntry[]> {
      const query: FactQuery = {
        type: 'observation',
        source: `agent:${this.agentId}`,
        limit,
      };

      if (category) {
        query.tags = ['observation', category];
      }

      return await this.queryFacts(query);
    }

    /**
     * Get learnings and insights
     */
    async getLearnings(context?: string, limit = 15): Promise<FactEntry[]> {
      const query: FactQuery = {
        type: 'learning',
        source: `agent:${this.agentId}`,
        limit,
      };

      if (context) {
        query.tags = ['learning', context];
      }

      return await this.queryFacts(query);
    }

    /**
     * Subscribe to new facts from other agents
     */
    onNewFacts(callback: (fact: FactEntry) => void): () => void {
      return sharedFactSystem.onFactAdded((fact) => {
        // Only notify about facts from other agents
        if (fact.source !== `agent:${this.agentId}`) {
          callback(fact);
        }
      });
    }

    /**
     * Search external facts using foundation fact system
     */
    async searchExternalFacts(
      query: string,
      sources?: string[],
      limit = 10
    ): Promise<any[]> {
      try {
        logger.debug(
          `Agent ${this.agentId} searching external facts: ${query}`
        );
        return await searchExternalFacts(query, sources, limit);
      } catch (error) {
        logger.error(
          `Failed to search external facts for agent ${this.agentId}:`,
          error
        );
        return [];
      }
    }

    /**
     * Get NPM package information using foundation fact system
     */
    async getNPMPackageInfo(
      packageName: string,
      version?: string
    ): Promise<unknown> {
      try {
        logger.debug(
          `Agent ${this.agentId} getting NPM package: ${packageName}`
        );
        return await getNPMPackageInfo(packageName, version);
      } catch (error) {
        logger.error(
          `Failed to get NPM package info for agent ${this.agentId}:`,
          error
        );
        return null;
      }
    }

    /**
     * Get GitHub repository information using foundation fact system
     */
    async getGitHubRepoInfo(owner: string, repo: string): Promise<unknown> {
      try {
        logger.debug(
          `Agent ${this.agentId} getting GitHub repo: ${owner}/${repo}`
        );
        return await getGitHubRepoInfo(owner, repo);
      } catch (error) {
        logger.error(
          `Failed to get GitHub repo info for agent ${this.agentId}:`,
          error
        );
        return null;
      }
    }
  };
}

/**
 * Simple base class for fact-capable agents
 */
export class FactCapableAgent implements FactCapable {
  constructor(public agentId: string) {}

  async storeFact(
    type: string,
    data: any,
    confidence = 1.0,
    tags: string[] = []
  ): Promise<string> {
    return await storeAgentFact(this.agentId, type, data, confidence, tags);
  }

  async queryFacts(query: FactQuery = {}): Promise<FactEntry[]> {
    return await sharedFactSystem.queryFacts(query);
  }

  async getMyFacts(type?: string, limit = 100): Promise<FactEntry[]> {
    return await queryAgentFacts(this.agentId, type, limit);
  }

  async shareFact(factId: string, targetAgentId?: string): Promise<boolean> {
    const enhanced = withFactCapabilities(
      class {
        constructor(public agentId: string) {}
      }
    ) as any as any;
    const instance = new enhanced(this.agentId);
    return await instance.shareFact(factId, targetAgentId);
  }

  async searchExternalFacts(
    query: string,
    sources?: string[],
    limit?: number
  ): Promise<any[]> {
    return await searchExternalFacts(query, sources, limit || 10);
  }

  async getNPMPackageInfo(
    packageName: string,
    version?: string
  ): Promise<unknown> {
    return await getNPMPackageInfo(packageName, version);
  }

  async getGitHubRepoInfo(owner: string, repo: string): Promise<unknown> {
    return await getGitHubRepoInfo(owner, repo);
  }
}

/**
 * Export the enhanced agent class
 */
export const UniversalFactMixin = withFactCapabilities;

/**
 * Type for fact-enhanced classes
 */
export type FactEnhanced<T> = T & FactCapable;
