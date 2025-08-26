/**
 * @file Coordination API - Public Interface for Coordination Layer
 *
 * This file provides the public API for coordination layer to interact with
 * the knowledge package's fact system. The actual implementation remains
 * private within the knowledge package.
 *
 * This maintains the same interface as the old shared-fact-system to ensure
 * compatibility with existing coordination code.
 */
import { knowledgeFactSystem } from './fact-system';
/**
 * Get the coordination fact system instance (read-only access to initialized state)
 */
export function getCoordinationFactSystem() {
  return {
    isInitialized: () => knowledgeFactSystem.isInitialized(),
    getStats: () => knowledgeFactSystem.getStats(),
  };
}
/**
 * Initialize the coordination fact system
 */
export async function initializeCoordinationFactSystem() {
  await knowledgeFactSystem.initialize();
}
/**
 * Store a coordination-specific fact
 */
export async function storeCoordinationFact(fact) {
  return await knowledgeFactSystem.storeFact(fact);
}
/**
 * Query coordination facts based on criteria
 */
export async function queryCoordinationFacts(query = {}) {
  return await knowledgeFactSystem.queryFacts(query);
}
/**
 * Search coordination facts with text-based query
 */
export async function searchCoordinationFacts(searchParams) {
  return await knowledgeFactSystem.searchFacts(searchParams);
}
/**
 * Get coordination facts (convenience function)
 */
export async function getCoordinationFacts(limit = 50) {
  return await knowledgeFactSystem.queryFacts({
    tags: ['coordination'],
    limit,
  });
}
/**
 * Store a coordination event as a fact
 */
export async function storeCoordinationEvent(eventType, eventData, agentId) {
  return await knowledgeFactSystem.storeFact({
    type: 'coordination_event',
    data: {
      eventType,
      eventData,
      agentId,
    },
    source: agentId ? `agent:${agentId}` : 'system',
    confidence: 1.0,
    tags: ['coordination', 'event', eventType],
  });
}
/**
 * Convenience functions for agent integration
 */
export async function storeAgentFact(
  agentId,
  type,
  data,
  confidence = 1.0,
  tags = []
) {
  return await knowledgeFactSystem.storeFact({
    type,
    data,
    source: `agent:${agentId}`,
    confidence,
    tags: ['agent', ...tags],
  });
}
export async function queryAgentFacts(agentId, type, limit = 100) {
  const query = { limit };
  if (agentId) {
    query.source = `agent:${agentId}`;
  }
  if (type) {
    query.type = type;
  }
  return await knowledgeFactSystem.queryFacts(query);
}
/**
 * Search external facts (NPM, GitHub, security, etc.) using foundation fact system
 */
export async function searchExternalFacts(query, sources, limit = 10) {
  return await knowledgeFactSystem.searchExternalFacts(query, sources, limit);
}
/**
 * Get NPM package information using high-performance Rust fact bridge
 */
export async function getNPMPackageInfo(packageName, version) {
  try {
    return await knowledgeFactSystem.getNPMPackageInfo(packageName, version);
  } catch (error) {
    console.error(`Failed to get NPM package info for ${packageName}:`, error);
    return null;
  }
}
/**
 * Get GitHub repository information using high-performance Rust fact bridge
 */
export async function getGitHubRepoInfo(owner, repo) {
  try {
    return await knowledgeFactSystem.getGitHubRepoInfo(owner, repo);
  } catch (error) {
    console.error(
      `Failed to get GitHub repo info for ${owner}/${repo}:`,
      error
    );
    return null;
  }
}
