/**
 * Intelligence Facade - Strategic facade providing access to intelligence implementations.
 *
 * This facade delegates to actual intelligence implementations:
 * - Brain systems (via @claude-zen/brain)
 * - Teamwork coordination (via @claude-zen/teamwork) 
 * - Knowledge management (via @claude-zen/knowledge)
 */

import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('intelligence-facade');

/**
 * Brain system facade with lazy loading
 */
export async function getBrainSystem() {
  try {
    // Lazy load brain implementation
    const { BrainCoordinator } = await import('@claude-zen/brain');
    return new BrainCoordinator();
  } catch (error) {
    logger.warn('Brain implementation not available, using fallback:', error);
    return createBrainFallback();
  }
}

/**
 * Teamwork system facade with lazy loading
 */
export async function getTeamworkSystem() {
  try {
    // Lazy load teamwork implementation
    const { TeamworkOrchestrator } = await import('@claude-zen/teamwork');
    return new TeamworkOrchestrator();
  } catch (error) {
    logger.warn('Teamwork implementation not available, using fallback:', error);
    return createTeamworkFallback();
  }
}

/**
 * Knowledge system facade with lazy loading
 */
export async function getKnowledgeSystem() {
  try {
    // Lazy load knowledge implementation
    const { KnowledgeBase } = await import('@claude-zen/knowledge');
    return new KnowledgeBase();
  } catch (error) {
    logger.warn('Knowledge implementation not available, using fallback:', error);
    return createKnowledgeFallback();
  }
}

/**
 * Fallback brain implementation
 */
function createBrainFallback() {
  logger.info('Using brain fallback implementation');
  return {
    optimize: async (prompt: string) => ({ prompt, strategy: 'basic', confidence: 0.5 }),
    analyze: async (task: any) => ({ complexity: 0.5, recommendations: [] }),
    getHealth: async () => ({ isHealthy: true, hasWarnings: false }),
  };
}

/**
 * Fallback teamwork implementation
 */
function createTeamworkFallback() {
  logger.info('Using teamwork fallback implementation');
  return {
    coordinate: async (agents: any[]) => ({ success: true, results: [] }),
    orchestrate: async (task: any) => ({ success: true, result: null }),
  };
}

/**
 * Fallback knowledge implementation
 */
function createKnowledgeFallback() {
  logger.info('Using knowledge fallback implementation');
  return {
    store: async (key: string, value: any) => ({ success: true }),
    retrieve: async (key: string) => ({ success: false, data: null }),
    search: async (query: string) => ({ success: true, results: [] }),
  };
}

// Export types for compatibility
export type BrainSystem = Awaited<ReturnType<typeof getBrainSystem>>;
export type TeamworkSystem = Awaited<ReturnType<typeof getTeamworkSystem>>;
export type KnowledgeSystem = Awaited<ReturnType<typeof getKnowledgeSystem>>;