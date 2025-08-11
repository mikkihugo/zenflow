/**
 * Agent Interface Adapter - Compatibility Layer.
 *
 * This module provides adapter functions to bridge the interface differences.
 * Between the base Agent interface and coordination-specific requirements..
 *
 * @file Agent interface compatibility adapter.
 */
import type { Agent as CoordinationAgent, Task as CoordinationTask } from '../../../types';
import type { Agent as BaseAgent, Task as BaseTask } from '../types/agent-types';
/**
 * Adapter function to convert base Agent to coordination Agent.
 *
 * @param baseAgent
 * @example
 */
export declare function adaptAgentForCoordination(baseAgent: BaseAgent): CoordinationAgent;
/**
 * Adapter function to convert coordination Task to base Task.
 *
 * @param coordinationTask
 * @example
 */
export declare function adaptTaskForExecution(coordinationTask: CoordinationTask): BaseTask;
/**
 * Type-safe agent execution with adaptation.
 *
 * @param agent
 * @param task
 * @example
 */
export declare function executeTaskWithAgent(agent: BaseAgent | CoordinationAgent, task: CoordinationTask): Promise<any>;
/**
 * Create agent pool entry with proper typing.
 *
 * @param agent
 * @example
 */
export declare function createAgentPoolEntry(agent: BaseAgent): any;
//# sourceMappingURL=agent-adapter.d.ts.map