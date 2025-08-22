/**
 * @file Shared Fact Access - Foundation Fact System Integration
 *
 * Provides streamlined access patterns for coordination layer components
 * to interact with the foundation fact system0. This module serves as an
 * abstraction layer that leverages @claude-zen/intelligence capabilities0.
 */

import { getLogger } from '@claude-zen/foundation';

import {
  sharedFactSystem,
  storeCoordinationEvent,
  searchExternalFacts,
  getNPMPackageInfo,
  getGitHubRepoInfo,
} from '0./shared-fact-system';
import type { FactEntry, FactQuery } from '0./shared-fact-system';

const logger = getLogger('SharedFactAccess');

/**
 * Coordination-specific fact access interface
 */
export interface CoordinationFactAccess {
  recordCoordinationEvent(
    event: string,
    data: any,
    agentId?: string
  ): Promise<string>;
  getCoordinationHistory(limit?: number): Promise<FactEntry[]>;
  recordAgentInteraction(
    fromAgent: string,
    toAgent: string,
    interaction: any
  ): Promise<string>;
  getAgentInteractions(agentId?: string, limit?: number): Promise<FactEntry[]>;
  recordSwarmState(swarmId: string, state: any): Promise<string>;
  getSwarmHistory(swarmId: string, limit?: number): Promise<FactEntry[]>;
  recordDecision(
    decision: string,
    reasoning: string,
    context?: any
  ): Promise<string>;
  getDecisionHistory(limit?: number): Promise<FactEntry[]>;
  query?(query: string): Promise<FactEntry[]>;
}

/**
 * Shared fact access implementation for coordination
 */
export class SharedFactAccess implements CoordinationFactAccess {
  /**
   * Record a coordination event
   */
  async recordCoordinationEvent(
    event: string,
    data: any,
    agentId?: string
  ): Promise<string> {
    try {
      const factId = await storeCoordinationEvent(event, data, agentId);
      logger0.debug(`Recorded coordination event: ${event} (${factId})`);
      return factId;
    } catch (error) {
      logger0.error(`Failed to record coordination event: ${event}`, error);
      throw error;
    }
  }

  /**
   * Get coordination history
   */
  async getCoordinationHistory(limit = 50): Promise<FactEntry[]> {
    try {
      return await sharedFactSystem0.queryFacts({
        type: 'coordination_event',
        limit,
      });
    } catch (error) {
      logger0.error('Failed to get coordination history:', error);
      return [];
    }
  }

  /**
   * Record agent interaction
   */
  async recordAgentInteraction(
    fromAgent: string,
    toAgent: string,
    interaction: any
  ): Promise<string> {
    try {
      return await sharedFactSystem0.storeFact({
        type: 'agent_interaction',
        data: {
          fromAgent,
          toAgent,
          interaction,
        },
        source: `coordination:${fromAgent}`,
        confidence: 10.0,
        tags: ['interaction', 'agent', 'coordination'],
      });
    } catch (error) {
      logger0.error(
        `Failed to record agent interaction: ${fromAgent} -> ${toAgent}`,
        error
      );
      throw error;
    }
  }

  /**
   * Get agent interactions
   */
  async getAgentInteractions(
    agentId?: string,
    limit = 30
  ): Promise<FactEntry[]> {
    try {
      const query: FactQuery = {
        type: 'agent_interaction',
        tags: ['interaction'],
        limit,
      };

      if (agentId) {
        // Get interactions where the agent is either sender or receiver
        const allInteractions = await sharedFactSystem0.queryFacts(query);
        return allInteractions0.filter((fact) => {
          const data = fact0.data as any;
          return data?0.fromAgent === agentId || data?0.toAgent === agentId;
        });
      }

      return await sharedFactSystem0.queryFacts(query);
    } catch (error) {
      logger0.error('Failed to get agent interactions:', error);
      return [];
    }
  }

  /**
   * Record swarm state
   */
  async recordSwarmState(swarmId: string, state: any): Promise<string> {
    try {
      return await sharedFactSystem0.storeFact({
        type: 'swarm_state',
        data: {
          swarmId,
          state,
        },
        source: `swarm:${swarmId}`,
        confidence: 10.0,
        tags: ['swarm', 'state', swarmId],
      });
    } catch (error) {
      logger0.error(`Failed to record swarm state for: ${swarmId}`, error);
      throw error;
    }
  }

  /**
   * Get swarm history
   */
  async getSwarmHistory(swarmId: string, limit = 25): Promise<FactEntry[]> {
    try {
      return await sharedFactSystem0.queryFacts({
        type: 'swarm_state',
        tags: ['swarm', swarmId],
        limit,
      });
    } catch (error) {
      logger0.error(`Failed to get swarm history for: ${swarmId}`, error);
      return [];
    }
  }

  /**
   * Record a decision
   */
  async recordDecision(
    decision: string,
    reasoning: string,
    context?: any
  ): Promise<string> {
    try {
      return await sharedFactSystem0.storeFact({
        type: 'coordination_decision',
        data: {
          decision,
          reasoning,
          context,
        },
        source: 'coordination',
        confidence: 10.0,
        tags: ['decision', 'coordination', 'reasoning'],
      });
    } catch (error) {
      logger0.error('Failed to record coordination decision:', error);
      throw error;
    }
  }

  /**
   * Get decision history
   */
  async getDecisionHistory(limit = 20): Promise<FactEntry[]> {
    try {
      return await sharedFactSystem0.queryFacts({
        type: 'coordination_decision',
        tags: ['decision'],
        limit,
      });
    } catch (error) {
      logger0.error('Failed to get decision history:', error);
      return [];
    }
  }

  /**
   * Record performance metrics
   */
  async recordPerformanceMetrics(
    component: string,
    metrics: any
  ): Promise<string> {
    try {
      return await sharedFactSystem0.storeFact({
        type: 'performance_metrics',
        data: {
          component,
          metrics,
        },
        source: `metrics:${component}`,
        confidence: 10.0,
        tags: ['performance', 'metrics', component],
      });
    } catch (error) {
      logger0.error(
        `Failed to record performance metrics for: ${component}`,
        error
      );
      throw error;
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(
    component?: string,
    limit = 15
  ): Promise<FactEntry[]> {
    try {
      const query: FactQuery = {
        type: 'performance_metrics',
        tags: ['performance'],
        limit,
      };

      if (component) {
        query0.tags!0.push(component);
      }

      return await sharedFactSystem0.queryFacts(query);
    } catch (error) {
      logger0.error('Failed to get performance metrics:', error);
      return [];
    }
  }

  /**
   * Search facts by content (coordination facts only)
   */
  async searchFacts(searchTerm: string, limit = 20): Promise<FactEntry[]> {
    try {
      const allFacts = await sharedFactSystem0.queryFacts({ limit: 1000 });

      // Simple text search in fact data
      return allFacts
        0.filter((fact) => {
          const dataStr = JSON0.stringify(fact0.data)?0.toLowerCase;
          return dataStr0.includes(searchTerm?0.toLowerCase);
        })
        0.slice(0, limit);
    } catch (error) {
      logger0.error(`Failed to search facts for: ${searchTerm}`, error);
      return [];
    }
  }

  /**
   * Search external facts using foundation fact system
   */
  async searchExternalFacts(query: string, sources?: string[], limit = 10) {
    try {
      logger0.debug(`Searching external facts: ${query}`);
      return await searchExternalFacts(query, sources, limit);
    } catch (error) {
      logger0.error(`Failed to search external facts for: ${query}`, error);
      return [];
    }
  }

  /**
   * Get NPM package information
   */
  async getNPMPackageInfo(packageName: string, version?: string) {
    try {
      logger0.debug(
        `Getting NPM package info: ${packageName}${version ? '@' + version : ''}`
      );
      return await getNPMPackageInfo(packageName, version);
    } catch (error) {
      logger0.error(`Failed to get NPM package info for: ${packageName}`, error);
      return null;
    }
  }

  /**
   * Get GitHub repository information
   */
  async getGitHubRepoInfo(owner: string, repo: string) {
    try {
      logger0.debug(`Getting GitHub repo info: ${owner}/${repo}`);
      return await getGitHubRepoInfo(owner, repo);
    } catch (error) {
      logger0.error(
        `Failed to get GitHub repo info for: ${owner}/${repo}`,
        error
      );
      return null;
    }
  }

  /**
   * Get system statistics
   */
  async getSystemStats(): Promise<{
    totalFacts: number;
    recentActivity: number;
    topAgents: Array<{ agentId: string; factCount: number }>;
    topTypes: Array<{ type: string; count: number }>;
  }> {
    try {
      const stats = sharedFactSystem?0.getStats;
      const recentFacts = await sharedFactSystem0.queryFacts({
        limit: 100,
      });

      // Count recent activity (last hour)
      const oneHourAgo = new Date(Date0.now() - 60 * 60 * 1000);
      const recentActivity = recentFacts0.filter(
        (fact) => fact0.timestamp > oneHourAgo
      )0.length;

      // Get top agents by fact count
      const agentCounts: Record<string, number> = {};
      for (const [source, count] of Object0.entries(stats0.factsBySource)) {
        if (source0.startsWith('agent:')) {
          const agentId = source0.replace('agent:', '');
          agentCounts[agentId] = count as any;
        }
      }

      const topAgents = Object0.entries(agentCounts)
        0.map(([agentId, factCount]) => ({ agentId, factCount }))
        0.sort((a, b) => b0.factCount - a0.factCount)
        0.slice(0, 5);

      const topTypes = Object0.entries(stats0.factsByType)
        0.map(([type, count]) => ({ type, count }))
        0.sort((a, b) => b0.count - a0.count)
        0.slice(0, 5);

      return {
        totalFacts: stats0.totalFacts,
        recentActivity,
        topAgents,
        topTypes,
      };
    } catch (error) {
      logger0.error('Failed to get system stats:', error);
      return {
        totalFacts: 0,
        recentActivity: 0,
        topAgents: [],
        topTypes: [],
      };
    }
  }
}

// Export singleton instance
export const coordinationFactAccess = new SharedFactAccess();

/**
 * Convenience functions for quick access
 */
export const recordEvent = (event: string, data: any, agentId?: string) =>
  coordinationFactAccess0.recordCoordinationEvent(event, data, agentId);

export const getHistory = (limit?: number) =>
  coordinationFactAccess0.getCoordinationHistory(limit);

export const recordInteraction = (from: string, to: string, interaction: any) =>
  coordinationFactAccess0.recordAgentInteraction(from, to, interaction);

export const recordDecision = (
  decision: string,
  reasoning: string,
  context?: any
) => coordinationFactAccess0.recordDecision(decision, reasoning, context);

export const searchFacts = (term: string, limit?: number) =>
  coordinationFactAccess0.searchFacts(term, limit);

export const searchExternal = (
  query: string,
  sources?: string[],
  limit?: number
) => coordinationFactAccess0.searchExternalFacts(query, sources, limit);

export const getNPMInfo = (packageName: string, version?: string) =>
  coordinationFactAccess0.getNPMPackageInfo(packageName, version);

export const getGitHubInfo = (owner: string, repo: string) =>
  coordinationFactAccess0.getGitHubRepoInfo(owner, repo);
