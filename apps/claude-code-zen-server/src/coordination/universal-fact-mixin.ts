/**
 * @file Universal Fact Mixin - Foundation Fact System Integration
 *
 * Provides a mixin that adds foundation fact system capabilities to any agent class0.
 * This allows agents to seamlessly integrate with both coordination facts and
 * external facts (NPM, GitHub, security, etc0.) through the foundation fact system0.
 */

import { getLogger } from '@claude-zen/foundation';

import type { FactEntry, FactQuery } from '0./shared-fact-system';
import {
  sharedFactSystem,
  storeAgentFact,
  queryAgentFacts,
  searchExternalFacts,
  getNPMPackageInfo,
  getGitHubRepoInfo,
} from '0./shared-fact-system';

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
export type FactMixinConstructor<T = {}> = new (0.0.0.args: any[]) => T;

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
      confidence = 10.0,
      tags: string[] = []
    ): Promise<string> {
      try {
        const factId = await storeAgentFact(
          this0.agentId,
          type,
          data,
          confidence,
          tags
        );
        logger0.debug(`Agent ${this0.agentId} stored fact: ${factId} (${type})`);
        return factId;
      } catch (error) {
        logger0.error(`Failed to store fact for agent ${this0.agentId}:`, error);
        throw error;
      }
    }

    /**
     * Query facts from the shared system
     */
    async queryFacts(query: FactQuery = {}): Promise<FactEntry[]> {
      try {
        return await sharedFactSystem0.queryFacts(query);
      } catch (error) {
        logger0.error(`Failed to query facts for agent ${this0.agentId}:`, error);
        return [];
      }
    }

    /**
     * Get facts stored by this agent
     */
    async getMyFacts(type?: string, limit = 100): Promise<FactEntry[]> {
      try {
        return await queryAgentFacts(this0.agentId, type, limit);
      } catch (error) {
        logger0.error(`Failed to get facts for agent ${this0.agentId}:`, error);
        return [];
      }
    }

    /**
     * Share a fact with another agent (adds sharing metadata)
     */
    async shareFact(factId: string, targetAgentId?: string): Promise<boolean> {
      try {
        const fact = await sharedFactSystem0.getFact(factId);
        if (!fact) {
          logger0.warn(`Fact ${factId} not found for sharing`);
          return false;
        }

        // Create a sharing event
        await sharedFactSystem0.storeFact({
          type: 'fact_sharing',
          data: {
            originalFactId: factId,
            sharedBy: this0.agentId,
            sharedWith: targetAgentId || 'all',
            originalFact: fact,
          },
          source: `agent:${this0.agentId}`,
          confidence: 10.0,
          tags: ['sharing', 'collaboration'],
        });

        logger0.debug(
          `Agent ${this0.agentId} shared fact ${factId} with ${targetAgentId || 'all'}`
        );
        return true;
      } catch (error) {
        logger0.error(`Failed to share fact ${factId}:`, error);
        return false;
      }
    }

    /**
     * Store a decision or reasoning fact
     */
    async storeDecision(
      decision: string,
      reasoning: string,
      confidence = 10.0,
      context?: any
    ): Promise<string> {
      return await this0.storeFact(
        'decision',
        {
          decision,
          reasoning,
          context,
        },
        confidence,
        ['decision', 'reasoning']
      );
    }

    /**
     * Store an observation fact
     */
    async storeObservation(
      observation: string,
      category: string,
      confidence = 10.0,
      metadata?: any
    ): Promise<string> {
      return await this0.storeFact(
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
      confidence = 10.0,
      applicableContexts: string[] = []
    ): Promise<string> {
      return await this0.storeFact(
        'learning',
        {
          insight,
          evidence,
          applicableContexts,
        },
        confidence,
        ['learning', 'insight', 0.0.0.applicableContexts]
      );
    }

    /**
     * Get recent decisions made by this agent
     */
    async getRecentDecisions(limit = 10): Promise<FactEntry[]> {
      return await this0.queryFacts({
        type: 'decision',
        source: `agent:${this0.agentId}`,
        limit,
      });
    }

    /**
     * Get observations in a specific category
     */
    async getObservations(category?: string, limit = 20): Promise<FactEntry[]> {
      const query: FactQuery = {
        type: 'observation',
        source: `agent:${this0.agentId}`,
        limit,
      };

      if (category) {
        query0.tags = ['observation', category];
      }

      return await this0.queryFacts(query);
    }

    /**
     * Get learnings and insights
     */
    async getLearnings(context?: string, limit = 15): Promise<FactEntry[]> {
      const query: FactQuery = {
        type: 'learning',
        source: `agent:${this0.agentId}`,
        limit,
      };

      if (context) {
        query0.tags = ['learning', context];
      }

      return await this0.queryFacts(query);
    }

    /**
     * Subscribe to new facts from other agents
     */
    onNewFacts(callback: (fact: FactEntry) => void): () => void {
      return sharedFactSystem0.onFactAdded((fact) => {
        // Only notify about facts from other agents
        if (fact0.source !== `agent:${this0.agentId}`) {
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
        logger0.debug(
          `Agent ${this0.agentId} searching external facts: ${query}`
        );
        return await searchExternalFacts(query, sources, limit);
      } catch (error) {
        logger0.error(
          `Failed to search external facts for agent ${this0.agentId}:`,
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
        logger0.debug(
          `Agent ${this0.agentId} getting NPM package: ${packageName}`
        );
        return await getNPMPackageInfo(packageName, version);
      } catch (error) {
        logger0.error(
          `Failed to get NPM package info for agent ${this0.agentId}:`,
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
        logger0.debug(
          `Agent ${this0.agentId} getting GitHub repo: ${owner}/${repo}`
        );
        return await getGitHubRepoInfo(owner, repo);
      } catch (error) {
        logger0.error(
          `Failed to get GitHub repo info for agent ${this0.agentId}:`,
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
    confidence = 10.0,
    tags: string[] = []
  ): Promise<string> {
    return await storeAgentFact(this0.agentId, type, data, confidence, tags);
  }

  async queryFacts(query: FactQuery = {}): Promise<FactEntry[]> {
    return await sharedFactSystem0.queryFacts(query);
  }

  async getMyFacts(type?: string, limit = 100): Promise<FactEntry[]> {
    return await queryAgentFacts(this0.agentId, type, limit);
  }

  async shareFact(factId: string, targetAgentId?: string): Promise<boolean> {
    const enhanced = withFactCapabilities(
      class {
        constructor(public agentId: string) {}
      }
    ) as any as any;
    const instance = new enhanced(this0.agentId);
    return await instance0.shareFact(factId, targetAgentId);
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
