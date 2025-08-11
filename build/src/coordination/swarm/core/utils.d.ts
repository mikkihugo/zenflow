/**
 * Utility functions for ZenSwarm.
 */
/**
 * @file Coordination system: utils.
 */
import type { AgentType, CognitiveProfile, SwarmTopology, TaskPriority } from './types.ts';
/**
 * Generate a unique ID for agents, tasks, and messages.
 *
 * @param prefix
 * @example
 */
export declare function generateId(prefix?: string): string;
/**
 * Create a default cognitive profile based on agent type.
 *
 * @param type
 * @example
 */
export declare function getDefaultCognitiveProfile(type: AgentType): CognitiveProfile;
/**
 * Calculate cognitive diversity score between two profiles.
 *
 * @param profile1
 * @param profile2
 * @example
 */
export declare function calculateCognitiveDiversity(profile1: CognitiveProfile, profile2: CognitiveProfile): number;
/**
 * Determine optimal topology based on swarm characteristics.
 *
 * @param agentCount
 * @param taskComplexity
 * @param coordinationNeeds
 * @example
 */
export declare function recommendTopology(agentCount: number, taskComplexity: 'low' | 'medium' | 'high', coordinationNeeds: 'minimal' | 'moderate' | 'extensive'): SwarmTopology;
/**
 * Convert task priority to numeric value for sorting.
 *
 * @param priority
 * @example
 */
export declare function priorityToNumber(priority: TaskPriority): number;
/**
 * Format swarm metrics for display.
 *
 * @param metrics
 * @param metrics.totalTasks
 * @param metrics.completedTasks
 * @param metrics.failedTasks
 * @param metrics.averageCompletionTime
 * @param metrics.throughput
 * @example
 */
export declare function formatMetrics(metrics: {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    averageCompletionTime: number;
    throughput: number;
}): string;
/**
 * Validate swarm options.
 *
 * @param options
 * @example
 */
export declare function validateSwarmOptions(options: any): string[];
/**
 * Deep clone an object.
 *
 * @param obj
 * @example
 */
export declare function deepClone<T>(obj: T): T;
/**
 * Retry a function with exponential backoff.
 *
 * @param fn
 * @param maxRetries
 * @param initialDelay
 * @example
 */
export declare function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries?: number, initialDelay?: number): Promise<T>;
//# sourceMappingURL=utils.d.ts.map