/**
 * USL Coordination Service Helpers.
 *
 * Helper utilities and common operations for coordination service adapters.
 * Provides high-level coordination operations, agent management utilities,
 * session operations, and performance monitoring helpers.
 */
/**
 * @file Interface implementation: coordination-service-helpers.
 */

import { getLogger } from '@claude-zen/foundation'

import type { SessionState } from '../../../coordination/swarm/core/session-manager';
import type { SwarmAgent } from '../../../coordination/swarm/core/swarm-coordinator';
import type { AgentType } from '../../../types/agent-types';
import type { SwarmTopology } from '../../../types/shared-types';

import type { CoordinationServiceAdapter } from './coordination-service-adapter';

// ============================================
// Agent Management Helpers
// ============================================

/**
 * Agent creation helper with intelligent defaults.
 *
 * @param adapter
 * @param config
 * @param config.type
 * @param config.capabilities
 * @param config.specialization
 * @param config.learningEnabled
 * @example
 */
export async function createIntelligentAgent(
  adapter: CoordinationServiceAdapter,
  config: {
    type: AgentType;
    capabilities?: string[];
    specialization?: string;
    learningEnabled?: boolean;
  }
): Promise<unknown> {
  const logger = getLogger('CoordinationHelpers:Agent');

  logger.info(`Creating intelligent agent: ${config?.type}`);

  const enhancedConfig = {
    type: config?.type,
    capabilities:
      config?.capabilities || getDefaultCapabilitiesForType(config?.type),
    specialization: config?.specialization || config?.type,
    learningEnabled: config?.learningEnabled ?? true,
    metadata: {
      created: new Date().toISOString(),
      version: '1.0.0',
      creator: 'coordination-helper',
    },
  };

  try {
    const result = await adapter.execute('agent-create', {
      config: enhancedConfig,
    });

    if (result?.success && config?.learningEnabled) {
      // Initialize learning patterns for the new agent
      setTimeout(async () => {
        try {
          await adapter.execute('cognitive-set', {
            agentId: result?.data?.id,
            pattern: getDefaultCognitivePattern(config?.type),
          });
          logger.debug(`Set cognitive pattern for agent: ${result?.data?.id}`);
        } catch (error) {
          logger.warn(`Failed to set cognitive pattern for agent: ${error}`);
        }
      }, 1000);
    }

    return result?.data;
  } catch (error) {
    logger.error(`Failed to create intelligent agent: ${error}`);
    throw error;
  }
}

/**
 * Batch agent creation with load balancing.
 *
 * @param adapter
 * @param configs
 * @param options
 * @param options.maxConcurrency
 * @param options.staggerDelay
 * @example
 */
export async function createAgentBatch(
  adapter: CoordinationServiceAdapter,
  configs: Array<{
    type: AgentType;
    capabilities?: string[];
    specialization?: string;
  }>,
  options?: {
    maxConcurrency?: number;
    staggerDelay?: number;
  }
): Promise<any[]> {
  const logger = getLogger('CoordinationHelpers:AgentBatch');
  const maxConcurrency = options?.maxConcurrency || 5;
  const staggerDelay = options?.staggerDelay || 100;

  logger.info(
    `Creating batch of ${configs.length} agents with concurrency: ${maxConcurrency}`
  );

  const results: unknown[] = [];

  // Process in batches to avoid overwhelming the system
  for (let i = 0; i < configs.length; i += maxConcurrency) {
    const batch = configs?.slice(i, i + maxConcurrency);

    const batchPromises = batch.map(async (config, index) => {
      // Stagger requests slightly to avoid thundering herd
      if (index > 0 && staggerDelay > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, index * staggerDelay)
        );
      }

      return createIntelligentAgent(adapter, config);
    });

    try {
      const batchResults = await Promise.allSettled(batchPromises);

      batchResults?.forEach((result, index) => {
        if (result?.status === 'fulfilled') {
          results.push(result?.value);
        } else {
          logger.error(
            `Failed to create agent ${i + index}: ${result?.reason}`
          );
          results.push(null);
        }
      });
    } catch (error) {
      logger.error(`Batch creation failed: ${error}`);
      throw error;
    }

    // Small delay between batches
    if (i + maxConcurrency < configs.length) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  const successCount = results.filter((r) => r !== null).length;
  logger.info(
    `Agent batch creation completed: ${successCount}/${configs.length} successful`
  );

  return results;
}

/**
 * Agent performance monitoring and optimization.
 *
 * @param adapter
 * @param agentIds
 * @example
 */
export async function optimizeAgentPerformance(
  adapter: CoordinationServiceAdapter,
  agentIds?: string[]
): Promise<{
  optimized: number;
  recommendations: Array<{
    agentId: string;
    issue: string;
    recommendation: string;
    priority: 'low' | 'medium' | 'high';
  }>;
}> {
  const logger = getLogger('CoordinationHelpers:AgentOptimization');

  // Get agent metrics
  const metricsResult = await adapter.execute('agent-metrics');
  if (!metricsResult?.success) {
    throw new Error('Failed to get agent metrics');
  }

  const allAgentMetrics = metricsResult?.data as Array<{
    agentId: string;
    type: AgentType;
    tasksCompleted: number;
    averageResponseTime: number;
    errorRate: number;
    learningProgress: number;
    lastActivity: Date;
  }>;

  const targetAgents = agentIds
    ? allAgentMetrics.filter((m) => agentIds.includes(m.agentId))
    : allAgentMetrics;

  const recommendations: Array<{
    agentId: string;
    issue: string;
    recommendation: string;
    priority: 'low' | 'medium' | 'high';
  }> = [];

  let optimized = 0;

  for (const metrics of targetAgents) {
    const issues = analyzeAgentPerformance(metrics);

    for (const issue of issues) {
      recommendations.push({
        agentId: metrics.agentId,
        issue: issue.problem,
        recommendation: issue.solution,
        priority: issue.priority,
      });

      // Apply automatic optimizations for high-priority issues
      if (issue.priority === 'high' && issue.autoFix) {
        try {
          await issue.autoFix(adapter, metrics.agentId);
          optimized++;
          logger.info(
            `Auto-optimized agent ${metrics.agentId}: ${issue.problem}`
          );
        } catch (error) {
          logger.warn(
            `Failed to auto-optimize agent ${metrics.agentId}: ${error}`
          );
        }
      }
    }
  }

  logger.info(
    `Agent optimization completed: ${optimized} agents optimized, ${recommendations.length} recommendations`
  );

  return { optimized, recommendations };
}

// ============================================
// Session Management Helpers
// ============================================

/**
 * Create session with intelligent defaults and monitoring.
 *
 * @param adapter
 * @param name
 * @param options
 * @param options.autoCheckpoint
 * @param options.checkpointInterval
 * @param options.maxDuration
 * @example
 */
export async function createManagedSession(
  adapter: CoordinationServiceAdapter,
  name: string,
  options?: {
    autoCheckpoint?: boolean;
    checkpointInterval?: number;
    maxDuration?: number;
  }
): Promise<{
  sessionId: string;
  monitoringId: string;
}> {
  const logger = getLogger('CoordinationHelpers:Session');

  logger.info(`Creating managed session: ${name}`);

  // Create the session
  const sessionResult = await adapter.execute('session-create', { name });
  if (!sessionResult?.success) {
    throw new Error(
      `Failed to create session: ${sessionResult?.error?.message}`
    );
  }

  const sessionId = sessionResult?.data as string;
  const monitoringId = `monitor-${sessionId}`;

  // Set up automatic checkpointing if requested
  if (options?.autoCheckpoint) {
    const interval = options?.checkpointInterval || 300000; // 5 minutes

    const checkpointTimer = setInterval(async () => {
      try {
        await adapter.execute('session-checkpoint', {
          sessionId,
          description: `Auto-checkpoint at ${new Date().toISOString()}`,
        });
        logger.debug(`Auto-checkpoint created for session: ${sessionId}`);
      } catch (error) {
        logger.warn(
          `Auto-checkpoint failed for session ${sessionId}: ${error}`
        );
      }
    }, interval);

    // Store timer for cleanup
    (global as any)[`checkpoint-timer-${sessionId}`] = checkpointTimer;
  }

  // Set up session expiration if requested
  if (options?.maxDuration) {
    setTimeout(async () => {
      try {
        logger.info(
          `Session ${sessionId} reached max duration, creating final checkpoint`
        );
        await adapter.execute('session-checkpoint', {
          sessionId,
          description: 'Final checkpoint before expiration',
        });

        // Clean up timers
        const checkpointTimer = (global as any)[
          `checkpoint-timer-${sessionId}`
        ];
        if (checkpointTimer) {
          clearInterval(checkpointTimer);
          delete (global as any)[`checkpoint-timer-${sessionId}`];
        }
      } catch (error) {
        logger.error(
          `Failed to create final checkpoint for session ${sessionId}: ${error}`
        );
      }
    }, options?.maxDuration);
  }

  return { sessionId, monitoringId };
}

/**
 * Session health monitoring and recovery.
 *
 * @param adapter
 * @param sessionIds
 * @example
 */
export async function monitorSessionHealth(
  adapter: CoordinationServiceAdapter,
  sessionIds?: string[]
): Promise<{
  healthy: string[];
  unhealthy: string[];
  recovered: string[];
  failed: string[];
}> {
  const logger = getLogger('CoordinationHelpers:SessionHealth');

  // Get all sessions if none specified
  let targetSessions: string[];

  if (sessionIds) {
    targetSessions = sessionIds;
  } else {
    const sessionsResult = await adapter.execute('session-list');
    if (!sessionsResult?.success) {
      throw new Error('Failed to list sessions');
    }

    const sessions = sessionsResult?.data as SessionState[];
    targetSessions = sessions.map((s) => s.id);
  }

  const healthy: string[] = [];
  const unhealthy: string[] = [];
  const recovered: string[] = [];
  const failed: string[] = [];

  for (const sessionId of targetSessions) {
    try {
      const statsResult = await adapter.execute('session-stats', { sessionId });

      if (statsResult?.success) {
        const stats = statsResult?.data;
        const isHealthy = assessSessionHealth(stats);

        if (isHealthy) {
          healthy.push(sessionId);
        } else {
          unhealthy.push(sessionId);

          // Attempt recovery
          logger.info(
            `Attempting recovery for unhealthy session: ${sessionId}`
          );
          try {
            await adapter.execute('session-save', { sessionId });
            recovered.push(sessionId);
            logger.info(`Successfully recovered session: ${sessionId}`);
          } catch (recoveryError) {
            failed.push(sessionId);
            logger.error(
              `Failed to recover session ${sessionId}: ${recoveryError}`
            );
          }
        }
      } else {
        unhealthy.push(sessionId);
        failed.push(sessionId);
      }
    } catch (error) {
      logger.error(`Error checking session ${sessionId}: ${error}`);
      unhealthy.push(sessionId);
      failed.push(sessionId);
    }
  }

  logger.info(
    `Session health check: ${healthy.length} healthy, ${unhealthy.length} unhealthy, ${recovered.length} recovered, ${failed.length} failed`
  );

  return { healthy, unhealthy, recovered, failed };
}

// ============================================
// Swarm Coordination Helpers
// ============================================

/**
 * Intelligent swarm coordination with adaptive topology.
 *
 * @param adapter
 * @param agents
 * @param options
 * @param options.targetLatency
 * @param options.minSuccessRate
 * @param options.adaptiveTopology
 * @example
 */
export async function coordinateIntelligentSwarm(
  adapter: CoordinationServiceAdapter,
  agents: SwarmAgent[],
  options?: {
    targetLatency?: number;
    minSuccessRate?: number;
    adaptiveTopology?: boolean;
  }
): Promise<{
  coordination: unknown;
  topology: SwarmTopology;
  performance: {
    latency: number;
    successRate: number;
    throughput: number;
  };
}> {
  const logger = getLogger('CoordinationHelpers:IntelligentSwarm');
  const targetLatency = options?.targetLatency || 100; // ms
  const minSuccessRate = options?.minSuccessRate || 0.9;
  const adaptiveTopology = options?.adaptiveTopology ?? true;

  logger.info(`Coordinating intelligent swarm with ${agents.length} agents`);

  let bestTopology: SwarmTopology = 'mesh';
  let bestPerformance = {
    latency: Number.POSITIVE_INFINITY,
    successRate: 0,
    throughput: 0,
  };
  let bestCoordination: unknown;

  // Try different topologies if adaptive mode is enabled
  const topologies: SwarmTopology[] = adaptiveTopology
    ? ['mesh', 'hierarchical', 'star', 'ring']
    : ['mesh'];

  for (const topology of topologies) {
    try {
      logger.debug(`Testing topology: ${topology}`);

      const coordinationResult = await adapter.execute('swarm-coordinate', {
        agents,
        topology,
      });

      if (coordinationResult?.success) {
        const coordination = coordinationResult?.data;
        const performance = {
          latency: coordination.averageLatency,
          successRate: coordination.successRate,
          throughput:
            coordination.agentsCoordinated /
            (coordination.averageLatency / 1000),
        };

        // Check if this topology meets our requirements and is better
        if (
          performance.successRate >= minSuccessRate &&
          performance.latency <= targetLatency &&
          (performance.successRate > bestPerformance.successRate ||
            (performance.successRate === bestPerformance.successRate &&
              performance.latency < bestPerformance.latency))
        ) {
          bestTopology = topology;
          bestPerformance = performance;
          bestCoordination = coordination;

          logger.info(
            `Found better topology ${topology}: latency=${performance.latency}ms, success=${performance.successRate}`
          );
        }
      }
    } catch (error) {
      logger.warn(`Failed to test topology ${topology}: ${error}`);
    }
  }

  // If no topology met requirements, use the best we found
  if (!bestCoordination) {
    logger.warn(
      'No topology met performance requirements, using mesh as fallback'
    );
    const coordinationResult = await adapter.execute('swarm-coordinate', {
      agents,
      topology: 'mesh',
    });

    if (coordinationResult?.success) {
      bestCoordination = coordinationResult?.data;
      bestTopology = 'mesh';
      bestPerformance = {
        latency: bestCoordination.averageLatency,
        successRate: bestCoordination.successRate,
        throughput:
          bestCoordination.agentsCoordinated /
          (bestCoordination.averageLatency / 1000),
      };
    } else {
      throw new Error('Failed to coordinate swarm with any topology');
    }
  }

  logger.info(
    `Intelligent swarm coordination completed with topology: ${bestTopology}`
  );

  return {
    coordination: bestCoordination,
    topology: bestTopology,
    performance: bestPerformance,
  };
}

/**
 * Swarm load balancing and task distribution.
 *
 * @param adapter
 * @param tasks
 * @param options
 * @param options.strategy
 * @param options.maxTasksPerAgent
 * @example
 */
export async function distributeSwarmTasks(
  adapter: CoordinationServiceAdapter,
  tasks: Array<{
    id: string;
    type: string;
    requirements: string[];
    priority: number;
    estimatedDuration?: number;
  }>,
  options?: {
    strategy?: 'round-robin' | 'least-loaded' | 'capability-match';
    maxTasksPerAgent?: number;
  }
): Promise<{
  assignments: Array<{
    taskId: string;
    agentId: string;
    estimatedCompletion: Date;
  }>;
  unassigned: string[];
  loadBalance: {
    [agentId: string]: number;
  };
}> {
  const logger = getLogger('CoordinationHelpers:TaskDistribution');
  const strategy = options?.strategy || 'capability-match';
  const maxTasksPerAgent = options?.maxTasksPerAgent || 10;

  logger.info(`Distributing ${tasks.length} tasks using strategy: ${strategy}`);

  // Get available agents
  const agentsResult = await adapter.execute('swarm-agents');
  if (!agentsResult?.success) {
    throw new Error('Failed to get swarm agents');
  }

  const agents = agentsResult?.data as SwarmAgent[];
  const availableAgents = agents.filter(
    (agent) => agent.status === 'idle' || agent.status === 'busy'
  );

  if (availableAgents.length === 0) {
    throw new Error('No available agents for task distribution');
  }

  const assignments: Array<{
    taskId: string;
    agentId: string;
    estimatedCompletion: Date;
  }> = [];

  const unassigned: string[] = [];
  const agentTaskCounts: { [agentId: string]: number } = {};

  // Initialize agent task counts
  availableAgents.forEach((agent) => {
    agentTaskCounts[agent.id] = 0;
  });

  // Sort tasks by priority (highest first)
  const sortedTasks = [...tasks].sort((a, b) => b.priority - a.priority);

  for (const task of sortedTasks) {
    let selectedAgent: SwarmAgent | null = null;

    switch (strategy) {
      case 'capability-match':
        selectedAgent = findBestCapabilityMatch(
          availableAgents,
          task,
          agentTaskCounts,
          maxTasksPerAgent
        );
        break;

      case 'least-loaded':
        selectedAgent = findLeastLoadedAgent(
          availableAgents,
          agentTaskCounts,
          maxTasksPerAgent
        );
        break;

      case 'round-robin':
        selectedAgent = findRoundRobinAgent(
          availableAgents,
          agentTaskCounts,
          maxTasksPerAgent
        );
        break;
    }

    if (selectedAgent) {
      try {
        const assignResult = await adapter.execute('swarm-assign-task', {
          task,
        });

        if (assignResult?.success && selectedAgent?.id) {
          agentTaskCounts[selectedAgent.id]++;

          const estimatedDuration = task.estimatedDuration || 30000; // 30 seconds default
          const estimatedCompletion = new Date(Date.now() + estimatedDuration);

          assignments.push({
            taskId: task.id,
            agentId: selectedAgent.id,
            estimatedCompletion,
          });

          logger.debug(`Assigned task ${task.id} to agent ${selectedAgent.id}`);
        } else {
          unassigned.push(task.id);
          logger.warn(
            `Failed to assign task ${task.id}: ${assignResult?.error?.message}`
          );
        }
      } catch (error) {
        unassigned.push(task.id);
        logger.error(`Error assigning task ${task.id}: ${error}`);
      }
    } else {
      unassigned.push(task.id);
      logger.warn(`No suitable agent found for task ${task.id}`);
    }
  }

  logger.info(
    `Task distribution completed: ${assignments.length} assigned, ${unassigned.length} unassigned`
  );

  return {
    assignments,
    unassigned,
    loadBalance: agentTaskCounts,
  };
}

// ============================================
// Performance Monitoring Helpers
// ============================================

/**
 * Comprehensive coordination performance analysis.
 *
 * @param adapter
 * @param timeWindow
 * @param _timeWindow
 * @example
 */
export async function analyzeCoordinationPerformance(
  adapter: CoordinationServiceAdapter,
  _timeWindow?: number // milliseconds
): Promise<{
  overall: {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    issues: string[];
    recommendations: string[];
  };
  agents: {
    total: number;
    active: number;
    averagePerformance: number;
    topPerformers: string[];
    underperformers: string[];
  };
  sessions: {
    total: number;
    healthy: number;
    avgUptime: number;
    recoveryRate: number;
  };
  coordination: {
    averageLatency: number;
    successRate: number;
    throughput: number;
    optimalTopology: SwarmTopology;
  };
}> {
  const logger = getLogger('CoordinationHelpers:PerformanceAnalysis');

  logger.info('Starting comprehensive coordination performance analysis');

  // Get service metrics
  const metricsResult = await adapter.getMetrics();
  const statusResult = await adapter.getStatus();

  // Get agent metrics
  const agentMetricsResult = await adapter.execute('agent-metrics');
  const agentMetrics = agentMetricsResult?.success
    ? agentMetricsResult?.data
    : [];

  // Get session metrics
  const sessionMetricsResult = await adapter.execute('session-metrics');
  const sessionMetrics = sessionMetricsResult?.success
    ? sessionMetricsResult?.data
    : [];

  // Get swarm metrics
  const swarmMetricsResult = await adapter.execute('swarm-metrics');
  const swarmMetrics = swarmMetricsResult?.success
    ? swarmMetricsResult?.data
    : null;

  // Analyze overall performance
  const overall = analyzeOverallPerformance(metricsResult, statusResult);

  // Analyze agent performance
  const agents = analyzeAgentPerformanceMetrics(agentMetrics);

  // Analyze session performance
  const sessions = analyzeSessionPerformanceMetrics(sessionMetrics);

  // Analyze coordination performance
  const coordination = analyzeCoordinationMetrics(swarmMetrics);

  logger.info(
    `Performance analysis completed: Overall grade ${overall.grade}, ${agents.active}/${agents.total} agents active`
  );

  return {
    overall,
    agents,
    sessions,
    coordination,
  };
}

// ============================================
// Private Helper Functions
// ============================================

function getDefaultCapabilitiesForType(type: AgentType): string[] {
  const capabilityMap: Record<string, string[]> = {
    researcher: ['search', 'analysis', 'documentation', 'data-gathering'],
    coder: ['programming', 'debugging', 'testing', 'code-review'],
    analyst: [
      'data-analysis',
      'pattern-recognition',
      'reporting',
      'visualization',
    ],
    coordinator: [
      'task-management',
      'scheduling',
      'communication',
      'monitoring',
    ],
    tester: ['testing', 'validation', 'quality-assurance', 'bug-detection'],
    architect: ['system-design', 'architecture', 'planning', 'documentation'],
  };

  return capabilityMap[type] || ['general-purpose'];
}

function getDefaultCognitivePattern(type: AgentType): unknown {
  const patternMap: Record<string, unknown> = {
    researcher: { focus: 'exploration', creativity: 0.8, precision: 0.7 },
    coder: { focus: 'implementation', creativity: 0.6, precision: 0.9 },
    analyst: { focus: 'analysis', creativity: 0.5, precision: 0.9 },
    coordinator: { focus: 'orchestration', creativity: 0.4, precision: 0.8 },
    tester: { focus: 'validation', creativity: 0.3, precision: 0.95 },
    architect: { focus: 'design', creativity: 0.9, precision: 0.8 },
  };

  return (
    patternMap[type] || { focus: 'general', creativity: 0.5, precision: 0.7 }
  );
}

function analyzeAgentPerformance(metrics: unknown): Array<{
  problem: string;
  solution: string;
  priority: 'low' | 'medium' | 'high';
  autoFix?: (
    adapter: CoordinationServiceAdapter,
    agentId: string
  ) => Promise<void>;
}> {
  const issues: Array<{
    problem: string;
    solution: string;
    priority: 'low' | 'medium' | 'high';
    autoFix?: (
      adapter: CoordinationServiceAdapter,
      agentId: string
    ) => Promise<void>;
  }> = [];

  // High error rate
  if (metrics.errorRate > 0.1) {
    issues.push({
      problem: `High error rate: ${(metrics.errorRate * 100).toFixed(1)}%`,
      solution: 'Retrain agent or adjust cognitive patterns',
      priority: 'high',
      autoFix: async (adapter, agentId) => {
        await adapter.execute('agent-adapt', {
          agentId,
          adaptation: { errorTolerance: 0.05, learningRate: 0.1 },
        });
      },
    });
  }

  // Slow response time
  if (metrics.averageResponseTime > 5000) {
    issues.push({
      problem: `Slow response time: ${metrics.averageResponseTime}ms`,
      solution: 'Optimize agent processing or increase resources',
      priority: metrics.averageResponseTime > 10000 ? 'high' : 'medium',
    });
  }

  // Low learning progress
  if (metrics.learningProgress < 0.3) {
    issues.push({
      problem: `Low learning progress: ${(metrics.learningProgress * 100).toFixed(1)}%`,
      solution: 'Increase training data or adjust learning parameters',
      priority: 'medium',
      autoFix: async (adapter, agentId) => {
        await adapter.execute('cognitive-set', {
          agentId,
          pattern: {
            ...getDefaultCognitivePattern(metrics.type),
            learningRate: 0.2,
          },
        });
      },
    });
  }

  // Inactive agent
  const lastActivity = new Date(metrics.lastActivity);
  const inactiveTime = Date.now() - lastActivity.getTime();
  if (inactiveTime > 3600000) {
    // 1 hour
    issues.push({
      problem: `Agent inactive for ${Math.round(inactiveTime / 60000)} minutes`,
      solution: 'Check agent health or reassign tasks',
      priority: 'medium',
    });
  }

  return issues;
}

function assessSessionHealth(stats: unknown): boolean {
  // Session is healthy if:
  // - It has recent activity (within last 30 minutes)
  // - Operations count is reasonable
  // - No excessive recovery attempts

  const lastAccessed = new Date(stats.lastAccessed || 0);
  const timeSinceAccess = Date.now() - lastAccessed.getTime();

  return (
    timeSinceAccess < 1800000 && // 30 minutes
    stats.operationsCount > 0 &&
    stats.recoveryAttempts < 3
  );
}

function findBestCapabilityMatch(
  agents: SwarmAgent[],
  task: unknown,
  taskCounts: { [agentId: string]: number },
  maxTasks: number
): SwarmAgent | null {
  const suitableAgents = agents.filter((agent) => {
    if (!agent.id) return false;
    const hasCapabilities = task.requirements.every((req: string) =>
      agent.capabilities.includes(req)
    );
    const withinLimit = taskCounts[agent.id] < maxTasks;
    return hasCapabilities && withinLimit;
  });

  if (suitableAgents.length === 0) return null;

  // Return agent with best performance and lowest current load
  return suitableAgents.reduce((best, current) => {
    if (!(best.id && current.id)) return best;
    const bestScore = calculateAgentScore(best) - taskCounts[best.id];
    const currentScore = calculateAgentScore(current) - taskCounts[current.id];
    return currentScore > bestScore ? current : best;
  });
}

function findLeastLoadedAgent(
  agents: SwarmAgent[],
  taskCounts: { [agentId: string]: number },
  maxTasks: number
): SwarmAgent | null {
  const availableAgents = agents.filter(
    (agent) => agent.id && taskCounts[agent.id] < maxTasks
  );
  if (availableAgents.length === 0) return null;

  return availableAgents.reduce((least, current) => {
    if (!(least.id && current.id)) return least;
    return taskCounts[current.id] < taskCounts[least.id] ? current : least;
  });
}

function findRoundRobinAgent(
  agents: SwarmAgent[],
  taskCounts: { [agentId: string]: number },
  maxTasks: number
): SwarmAgent | null {
  const availableAgents = agents.filter(
    (agent) => agent.id && taskCounts[agent.id] < maxTasks
  );
  if (availableAgents.length === 0) return null;

  // Simple round-robin: return first agent with minimum task count
  const taskCounts_ = availableAgents.map((agent) =>
    agent.id ? taskCounts[agent.id] : 0
  );
  const minTasks = Math.min(...taskCounts_);
  return (
    availableAgents.find(
      (agent) => agent.id && taskCounts[agent.id] === minTasks
    ) || null
  );
}

function calculateAgentScore(agent: SwarmAgent): number {
  const completionRate = agent.performance.tasksCompleted;
  const errorPenalty = agent.performance.errorRate * 100;
  const responsePenalty = agent.performance.averageResponseTime / 1000;

  return completionRate - errorPenalty - responsePenalty;
}

function analyzeOverallPerformance(
  metrics: unknown,
  status: unknown
): {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Check error rate
  if (metrics.errorCount > metrics.successCount * 0.1) {
    score -= 20;
    issues.push('High error rate detected');
    recommendations.push('Review agent configurations and retry logic');
  }

  // Check response time
  if (metrics.averageLatency > 1000) {
    score -= 15;
    issues.push('High average latency');
    recommendations.push(
      'Optimize coordination algorithms or increase resources'
    );
  }

  // Check health
  if (status.health !== 'healthy') {
    score -= 25;
    issues.push(`Service health is ${status.health}`);
    recommendations.push('Check dependencies and perform health diagnostics');
  }

  // Determine grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';
  else if (score >= 60) grade = 'D';
  else grade = 'F';

  return { score: Math.max(0, score), grade, issues, recommendations };
}

function analyzeAgentPerformanceMetrics(agentMetrics: unknown[]): {
  total: number;
  active: number;
  averagePerformance: number;
  topPerformers: string[];
  underperformers: string[];
} {
  const total = agentMetrics.length;
  const active = agentMetrics.filter((m) => {
    const lastActivity = new Date(m.lastActivity);
    return Date.now() - lastActivity.getTime() < 3600000; // 1 hour
  }).length;

  const avgPerformance =
    total > 0
      ? agentMetrics.reduce(
          (sum, m) => sum + (1 - m.errorRate) * m.learningProgress,
          0
        ) / total
      : 0;

  const sortedByPerformance = [...agentMetrics].sort((a, b) => {
    const scoreA = (1 - a.errorRate) * a.learningProgress;
    const scoreB = (1 - b.errorRate) * b.learningProgress;
    return scoreB - scoreA;
  });

  const topPerformers = sortedByPerformance
    .slice(0, Math.min(5, total))
    .map((m) => m.agentId);
  const underperformers = sortedByPerformance
    .slice(-Math.min(5, total))
    .map((m) => m.agentId);

  return {
    total,
    active,
    averagePerformance: avgPerformance,
    topPerformers,
    underperformers,
  };
}

function analyzeSessionPerformanceMetrics(sessionMetrics: unknown[]): {
  total: number;
  healthy: number;
  avgUptime: number;
  recoveryRate: number;
} {
  const total = sessionMetrics.length;
  const healthy = sessionMetrics.filter((m) => assessSessionHealth(m)).length;

  const avgUptime =
    total > 0
      ? sessionMetrics.reduce((sum, m) => sum + m.uptime, 0) / total
      : 0;

  const totalAttempts = sessionMetrics.reduce(
    (sum, m) => sum + m.recoveryAttempts,
    0
  );
  const successfulRecoveries = sessionMetrics.filter(
    (m) => m.recoveryAttempts > 0 && assessSessionHealth(m)
  ).length;
  const recoveryRate =
    totalAttempts > 0 ? successfulRecoveries / totalAttempts : 1;

  return { total, healthy, avgUptime, recoveryRate };
}

function analyzeCoordinationMetrics(swarmMetrics: unknown): {
  averageLatency: number;
  successRate: number;
  throughput: number;
  optimalTopology: SwarmTopology;
} {
  if (!swarmMetrics) {
    return {
      averageLatency: 0,
      successRate: 0,
      throughput: 0,
      optimalTopology: 'mesh',
    };
  }

  return {
    averageLatency: swarmMetrics.averageResponseTime || 0,
    successRate: swarmMetrics.completedTasks / (swarmMetrics.totalTasks || 1),
    throughput: swarmMetrics.throughput || 0,
    optimalTopology: 'mesh', // This would be determined by performance analysis
  };
}
