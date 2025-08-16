/**
 * @fileoverview Input Validation Utilities for Swarm Service
 *
 * Comprehensive validation functions for all swarm service inputs
 * to ensure data integrity and prevent invalid operations.
 *
 * @author Claude Code Zen Team
 * @version 1.0.0
 * @since 2025-08-14
 */

import {
  SYSTEM_LIMITS,
  ERROR_MESSAGES,
  isValidAgentStatus,
  isValidCognitivePattern,
} from '../coordination/types/constants';
import type {
  AgentConfig,
  SwarmConfig,
  TaskOrchestrationConfig,
} from '../coordination/types/interfaces';

/**
 * Custom validation error class
 */
export class SwarmValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public value?: any
  ) {
    super(message);
    this.name = 'SwarmValidationError';
  }
}

/**
 * Validates swarm configuration
 */
export function validateSwarmConfig(config: SwarmConfig): void {
  if (!config) {
    throw new SwarmValidationError('Swarm configuration is required');
  }

  // Validate topology
  const validTopologies = ['mesh', 'hierarchical', 'ring', 'star'] as const;
  if (!config.topology || !validTopologies.includes(config.topology as any)) {
    throw new SwarmValidationError(
      `Invalid topology. Must be one of: ${validTopologies.join(', ')}`,
      'topology',
      config.topology
    );
  }

  // Validate maxAgents
  if (config.maxAgents !== undefined) {
    if (
      !Number.isInteger(config.maxAgents) ||
      config.maxAgents < SYSTEM_LIMITS.MIN_AGENTS ||
      config.maxAgents > SYSTEM_LIMITS.MAX_AGENTS
    ) {
      throw new SwarmValidationError(
        ERROR_MESSAGES.INVALID_MAX_AGENTS,
        'maxAgents',
        config.maxAgents
      );
    }
  }

  // Validate strategy
  if (config.strategy) {
    const validStrategies = [
      'balanced',
      'specialized',
      'adaptive',
      'parallel',
    ] as const;
    if (!validStrategies.includes(config.strategy as any)) {
      throw new SwarmValidationError(
        `Invalid strategy. Must be one of: ${validStrategies.join(', ')}`,
        'strategy',
        config.strategy
      );
    }
  }
}

/**
 * Validates agent configuration
 */
export function validateAgentConfig(
  config: AgentConfig,
  swarmId?: string
): void {
  if (!config) {
    throw new SwarmValidationError('Agent configuration is required');
  }

  // Validate swarmId if provided
  if (swarmId && (typeof swarmId !== 'string' || swarmId.trim() === '')) {
    throw new SwarmValidationError(
      'Swarm ID must be a non-empty string',
      'swarmId',
      swarmId
    );
  }

  // Validate agent type
  const validTypes = [
    'researcher',
    'coder',
    'analyst',
    'optimizer',
    'coordinator',
    'tester',
  ] as const;
  if (!config.type || !validTypes.includes(config.type as any)) {
    throw new SwarmValidationError(
      `Invalid agent type. Must be one of: ${validTypes.join(', ')}`,
      'type',
      config.type
    );
  }

  // Validate name (optional)
  if (config.name !== undefined) {
    if (typeof config.name !== 'string') {
      throw new SwarmValidationError(
        'Agent name must be a string',
        'name',
        config.name
      );
    }
    if (config.name.length > 100) {
      throw new SwarmValidationError(
        'Agent name must be 100 characters or less',
        'name',
        config.name
      );
    }
  }

  // Validate capabilities (optional)
  if (config.capabilities !== undefined) {
    if (!Array.isArray(config.capabilities)) {
      throw new SwarmValidationError(
        'Agent capabilities must be an array',
        'capabilities',
        config.capabilities
      );
    }

    for (const capability of config.capabilities) {
      if (typeof capability !== 'string') {
        throw new SwarmValidationError(
          'All capabilities must be strings',
          'capabilities',
          capability
        );
      }
    }
  }
}

/**
 * Validates task orchestration configuration
 */
export function validateTaskOrchestrationConfig(
  config: TaskOrchestrationConfig
): void {
  if (!config) {
    throw new SwarmValidationError(
      'Task orchestration configuration is required'
    );
  }

  // Validate task description
  if (!config.task || typeof config.task !== 'string') {
    throw new SwarmValidationError(
      'Task description is required and must be a string',
      'task',
      config.task
    );
  }

  if (config.task.trim().length < SYSTEM_LIMITS.MIN_TASK_DESCRIPTION_LENGTH) {
    throw new SwarmValidationError(
      ERROR_MESSAGES.INVALID_TASK_LENGTH,
      'task',
      config.task
    );
  }

  // Validate strategy
  if (config.strategy) {
    const validStrategies = ['parallel', 'sequential', 'adaptive'] as const;
    if (!validStrategies.includes(config.strategy as any)) {
      throw new SwarmValidationError(
        `Invalid task strategy. Must be one of: ${validStrategies.join(', ')}`,
        'strategy',
        config.strategy
      );
    }
  }

  // Validate priority
  if (config.priority) {
    const validPriorities = ['low', 'medium', 'high', 'critical'] as const;
    if (!validPriorities.includes(config.priority as any)) {
      throw new SwarmValidationError(
        `Invalid priority. Must be one of: ${validPriorities.join(', ')}`,
        'priority',
        config.priority
      );
    }
  }

  // Validate maxAgents
  if (config.maxAgents !== undefined) {
    if (
      !Number.isInteger(config.maxAgents) ||
      config.maxAgents < SYSTEM_LIMITS.MIN_AGENTS ||
      config.maxAgents > SYSTEM_LIMITS.MAX_TASK_AGENTS
    ) {
      throw new SwarmValidationError(
        `maxAgents must be between ${SYSTEM_LIMITS.MIN_AGENTS} and ${SYSTEM_LIMITS.MAX_TASK_AGENTS}`,
        'maxAgents',
        config.maxAgents
      );
    }
  }
}

/**
 * Validates agent ID
 */
export function validateAgentId(agentId: string): void {
  if (!agentId || typeof agentId !== 'string' || agentId.trim() === '') {
    throw new SwarmValidationError(
      'Agent ID must be a non-empty string',
      'agentId',
      agentId
    );
  }
}

/**
 * Validates task ID
 */
export function validateTaskId(taskId: string): void {
  if (!taskId || typeof taskId !== 'string' || taskId.trim() === '') {
    throw new SwarmValidationError(
      'Task ID must be a non-empty string',
      'taskId',
      taskId
    );
  }
}

/**
 * Validates swarm ID
 */
export function validateSwarmId(swarmId: string): void {
  if (!swarmId || typeof swarmId !== 'string' || swarmId.trim() === '') {
    throw new SwarmValidationError(
      'Swarm ID must be a non-empty string',
      'swarmId',
      swarmId
    );
  }
}

/**
 * Validates training iterations
 */
export function validateTrainingIterations(iterations: number): void {
  if (
    !Number.isInteger(iterations) ||
    iterations < SYSTEM_LIMITS.MIN_TRAINING_ITERATIONS ||
    iterations > SYSTEM_LIMITS.MAX_TRAINING_ITERATIONS
  ) {
    throw new SwarmValidationError(
      ERROR_MESSAGES.INVALID_TRAINING_ITERATIONS,
      'iterations',
      iterations
    );
  }
}

/**
 * Validates monitoring parameters
 */
export function validateMonitoringParams(
  duration?: number,
  interval?: number
): void {
  if (duration !== undefined) {
    if (
      !Number.isFinite(duration) ||
      duration <= 0 ||
      duration > SYSTEM_LIMITS.MAX_MONITORING_DURATION_SECONDS
    ) {
      throw new SwarmValidationError(
        `Monitoring duration must be between 1 and ${SYSTEM_LIMITS.MAX_MONITORING_DURATION_SECONDS} seconds`,
        'duration',
        duration
      );
    }
  }

  if (interval !== undefined) {
    if (!Number.isFinite(interval) || interval <= 0 || interval > 60) {
      throw new SwarmValidationError(
        'Monitoring interval must be between 1 and 60 seconds',
        'interval',
        interval
      );
    }
  }
}

/**
 * Validates filter parameter for agent listing
 */
export function validateAgentFilter(filter: string): void {
  const validFilters = ['all', 'active', 'idle', 'busy'] as const;
  if (!validFilters.includes(filter as any)) {
    throw new SwarmValidationError(
      `Invalid agent filter. Must be one of: ${validFilters.join(', ')}`,
      'filter',
      filter
    );
  }
}

/**
 * Validates metric type parameter
 */
export function validateMetricType(metric: string): void {
  const validMetrics = [
    'all',
    'cpu',
    'memory',
    'tasks',
    'performance',
  ] as const;
  if (!validMetrics.includes(metric as any)) {
    throw new SwarmValidationError(
      `Invalid metric type. Must be one of: ${validMetrics.join(', ')}`,
      'metric',
      metric
    );
  }
}

/**
 * Validates result format parameter
 */
export function validateResultFormat(format: string): void {
  const validFormats = ['summary', 'detailed', 'raw'] as const;
  if (!validFormats.includes(format as any)) {
    throw new SwarmValidationError(
      `Invalid result format. Must be one of: ${validFormats.join(', ')}`,
      'format',
      format
    );
  }
}

/**
 * Validates feature category parameter
 */
export function validateFeatureCategory(category: string): void {
  const validCategories = [
    'all',
    'wasm',
    'simd',
    'memory',
    'platform',
  ] as const;
  if (!validCategories.includes(category as any)) {
    throw new SwarmValidationError(
      `Invalid feature category. Must be one of: ${validCategories.join(', ')}`,
      'category',
      category
    );
  }
}

/**
 * Validates benchmark type parameter
 */
export function validateBenchmarkType(type: string): void {
  const validTypes = ['all', 'wasm', 'swarm', 'agent', 'task'] as const;
  if (!validTypes.includes(type as any)) {
    throw new SwarmValidationError(
      `Invalid benchmark type. Must be one of: ${validTypes.join(', ')}`,
      'type',
      type
    );
  }
}

/**
 * Validates memory detail level parameter
 */
export function validateMemoryDetail(detail: string): void {
  const validDetails = ['summary', 'detailed', 'by-agent'] as const;
  if (!validDetails.includes(detail as any)) {
    throw new SwarmValidationError(
      `Invalid memory detail level. Must be one of: ${validDetails.join(', ')}`,
      'detail',
      detail
    );
  }
}

/**
 * Validates cognitive pattern parameter
 */
export function validateCognitivePattern(pattern: string): void {
  const validPatterns = [
    'all',
    'convergent',
    'divergent',
    'lateral',
    'systems',
    'critical',
    'abstract',
  ] as const;
  if (!validPatterns.includes(pattern as any)) {
    throw new SwarmValidationError(
      `Invalid cognitive pattern. Must be one of: ${validPatterns.join(', ')}`,
      'pattern',
      pattern
    );
  }
}
