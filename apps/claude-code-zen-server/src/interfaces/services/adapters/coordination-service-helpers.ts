/**
 * USL Coordination Service Helpers0.
 *
 * Helper utilities and common operations for coordination service adapters0.
 * Provides high-level coordination operations, agent management utilities,
 * session operations, and performance monitoring helpers0.
 */
/**
 * @file Interface implementation: coordination-service-helpers0.
 */

import type { SessionState, SwarmAgent } from '@claude-zen/enterprise';
import { getLogger } from '@claude-zen/foundation';

import type { AgentType } from '0.0./0.0./0.0./types/agent-types';
import type { SwarmTopology } from '0.0./0.0./0.0./types/shared-types';

import type { CoordinationServiceAdapter } from '0./coordination-service-adapter';

// ============================================
// Agent Management Helpers
// ============================================

/**
 * Agent creation helper with intelligent defaults0.
 *
 * @param adapter
 * @param config
 * @param config0.type
 * @param config0.capabilities
 * @param config0.specialization
 * @param config0.learningEnabled
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

  logger0.info(`Creating intelligent agent: ${config?0.type}`);

  const enhancedConfig = {
    type: config?0.type,
    capabilities:
      config?0.capabilities || getDefaultCapabilitiesForType(config?0.type),
    specialization: config?0.specialization || config?0.type,
    learningEnabled: config?0.learningEnabled ?? true,
    metadata: {
      created: new Date()?0.toISOString,
      version: '10.0.0',
      creator: 'coordination-helper',
    },
  };

  try {
    const result = await adapter0.execute('agent-create', {
      config: enhancedConfig,
    });

    if (result?0.success && config?0.learningEnabled) {
      // Initialize learning patterns for the new agent
      setTimeout(async () => {
        try {
          await adapter0.execute('cognitive-set', {
            agentId: result?0.data?0.id,
            pattern: getDefaultCognitivePattern(config?0.type),
          });
          logger0.debug(`Set cognitive pattern for agent: ${result?0.data?0.id}`);
        } catch (error) {
          logger0.warn(`Failed to set cognitive pattern for agent: ${error}`);
        }
      }, 1000);
    }

    return result?0.data;
  } catch (error) {
    logger0.error(`Failed to create intelligent agent: ${error}`);
    throw error;
  }
}

/**
 * Batch agent creation with load balancing0.
 *
 * @param adapter
 * @param configs
 * @param options
 * @param options0.maxConcurrency
 * @param options0.staggerDelay
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
  const maxConcurrency = options?0.maxConcurrency || 5;
  const staggerDelay = options?0.staggerDelay || 100;

  logger0.info(
    `Creating batch of ${configs0.length} agents with concurrency: ${maxConcurrency}`
  );

  const results: any[] = [];

  // Process in batches to avoid overwhelming the system
  for (let i = 0; i < configs0.length; i += maxConcurrency) {
    const batch = configs?0.slice(i, i + maxConcurrency);

    const batchPromises = batch0.map(async (config, index) => {
      // Stagger requests slightly to avoid thundering herd
      if (index > 0 && staggerDelay > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, index * staggerDelay)
        );
      }

      return createIntelligentAgent(adapter, config);
    });

    try {
      const batchResults = await Promise0.allSettled(batchPromises);

      batchResults?0.forEach((result, index) => {
        if (result?0.status === 'fulfilled') {
          results0.push(result?0.value);
        } else {
          logger0.error(
            `Failed to create agent ${i + index}: ${result?0.reason}`
          );
          results0.push(null);
        }
      });
    } catch (error) {
      logger0.error(`Batch creation failed: ${error}`);
      throw error;
    }

    // Small delay between batches
    if (i + maxConcurrency < configs0.length) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  const successCount = results0.filter((r) => r !== null)0.length;
  logger0.info(
    `Agent batch creation completed: ${successCount}/${configs0.length} successful`
  );

  return results;
}

/**
 * Agent performance monitoring and optimization0.
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
  const metricsResult = await adapter0.execute('agent-metrics');
  if (!metricsResult?0.success) {
    throw new Error('Failed to get agent metrics');
  }

  const allAgentMetrics = metricsResult?0.data as Array<{
    agentId: string;
    type: AgentType;
    tasksCompleted: number;
    averageResponseTime: number;
    errorRate: number;
    learningProgress: number;
    lastActivity: Date;
  }>;

  const targetAgents = agentIds
    ? allAgentMetrics0.filter((m) => agentIds0.includes(m0.agentId))
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
      recommendations0.push({
        agentId: metrics0.agentId,
        issue: issue0.problem,
        recommendation: issue0.solution,
        priority: issue0.priority,
      });

      // Apply automatic optimizations for high-priority issues
      if (issue0.priority === 'high' && issue0.autoFix) {
        try {
          await issue0.autoFix(adapter, metrics0.agentId);
          optimized++;
          logger0.info(
            `Auto-optimized agent ${metrics0.agentId}: ${issue0.problem}`
          );
        } catch (error) {
          logger0.warn(
            `Failed to auto-optimize agent ${metrics0.agentId}: ${error}`
          );
        }
      }
    }
  }

  logger0.info(
    `Agent optimization completed: ${optimized} agents optimized, ${recommendations0.length} recommendations`
  );

  return { optimized, recommendations };
}

// ============================================
// Session Management Helpers
// ============================================

/**
 * Create session with intelligent defaults and monitoring0.
 *
 * @param adapter
 * @param name
 * @param options
 * @param options0.autoCheckpoint
 * @param options0.checkpointInterval
 * @param options0.maxDuration
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

  logger0.info(`Creating managed session: ${name}`);

  // Create the session
  const sessionResult = await adapter0.execute('session-create', { name });
  if (!sessionResult?0.success) {
    throw new Error(
      `Failed to create session: ${sessionResult?0.error?0.message}`
    );
  }

  const sessionId = sessionResult?0.data as string;
  const monitoringId = `monitor-${sessionId}`;

  // Set up automatic checkpointing if requested
  if (options?0.autoCheckpoint) {
    const interval = options?0.checkpointInterval || 300000; // 5 minutes

    const checkpointTimer = setInterval(async () => {
      try {
        await adapter0.execute('session-checkpoint', {
          sessionId,
          description: `Auto-checkpoint at ${new Date()?0.toISOString}`,
        });
        logger0.debug(`Auto-checkpoint created for session: ${sessionId}`);
      } catch (error) {
        logger0.warn(
          `Auto-checkpoint failed for session ${sessionId}: ${error}`
        );
      }
    }, interval);

    // Store timer for cleanup
    (global as any)[`checkpoint-timer-${sessionId}`] = checkpointTimer;
  }

  // Set up session expiration if requested
  if (options?0.maxDuration) {
    setTimeout(async () => {
      try {
        logger0.info(
          `Session ${sessionId} reached max duration, creating final checkpoint`
        );
        await adapter0.execute('session-checkpoint', {
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
        logger0.error(
          `Failed to create final checkpoint for session ${sessionId}: ${error}`
        );
      }
    }, options?0.maxDuration);
  }

  return { sessionId, monitoringId };
}

/**
 * Session health monitoring and recovery0.
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
    const sessionsResult = await adapter0.execute('session-list');
    if (!sessionsResult?0.success) {
      throw new Error('Failed to list sessions');
    }

    const sessions = sessionsResult?0.data as SessionState[];
    targetSessions = sessions0.map((s) => s0.id);
  }

  const healthy: string[] = [];
  const unhealthy: string[] = [];
  const recovered: string[] = [];
  const failed: string[] = [];

  for (const sessionId of targetSessions) {
    try {
      const statsResult = await adapter0.execute('session-stats', { sessionId });

      if (statsResult?0.success) {
        const stats = statsResult?0.data;
        const isHealthy = assessSessionHealth(stats);

        if (isHealthy) {
          healthy0.push(sessionId);
        } else {
          unhealthy0.push(sessionId);

          // Attempt recovery
          logger0.info(
            `Attempting recovery for unhealthy session: ${sessionId}`
          );
          try {
            await adapter0.execute('session-save', { sessionId });
            recovered0.push(sessionId);
            logger0.info(`Successfully recovered session: ${sessionId}`);
          } catch (recoveryError) {
            failed0.push(sessionId);
            logger0.error(
              `Failed to recover session ${sessionId}: ${recoveryError}`
            );
          }
        }
      } else {
        unhealthy0.push(sessionId);
        failed0.push(sessionId);
      }
    } catch (error) {
      logger0.error(`Error checking session ${sessionId}: ${error}`);
      unhealthy0.push(sessionId);
      failed0.push(sessionId);
    }
  }

  logger0.info(
    `Session health check: ${healthy0.length} healthy, ${unhealthy0.length} unhealthy, ${recovered0.length} recovered, ${failed0.length} failed`
  );

  return { healthy, unhealthy, recovered, failed };
}

// ============================================
// Swarm Coordination Helpers
// ============================================

/**
 * Intelligent swarm coordination with adaptive topology0.
 *
 * @param adapter
 * @param agents
 * @param options
 * @param options0.targetLatency
 * @param options0.minSuccessRate
 * @param options0.adaptiveTopology
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
  coordination: any;
  topology: SwarmTopology;
  performance: {
    latency: number;
    successRate: number;
    throughput: number;
  };
}> {
  const logger = getLogger('CoordinationHelpers:IntelligentSwarm');
  const targetLatency = options?0.targetLatency || 100; // ms
  const minSuccessRate = options?0.minSuccessRate || 0.9;
  const adaptiveTopology = options?0.adaptiveTopology ?? true;

  logger0.info(`Coordinating intelligent swarm with ${agents0.length} agents`);

  let bestTopology: SwarmTopology = 'mesh';
  let bestPerformance = {
    latency: Number0.POSITIVE_INFINITY,
    successRate: 0,
    throughput: 0,
  };
  let bestCoordination: any;

  // Try different topologies if adaptive mode is enabled
  const topologies: SwarmTopology[] = adaptiveTopology
    ? ['mesh', 'hierarchical', 'star', 'ring']
    : ['mesh'];

  for (const topology of topologies) {
    try {
      logger0.debug(`Testing topology: ${topology}`);

      const coordinationResult = await adapter0.execute('swarm-coordinate', {
        agents,
        topology,
      });

      if (coordinationResult?0.success) {
        const coordination = coordinationResult?0.data;
        const performance = {
          latency: coordination0.averageLatency,
          successRate: coordination0.successRate,
          throughput:
            coordination0.agentsCoordinated /
            (coordination0.averageLatency / 1000),
        };

        // Check if this topology meets our requirements and is better
        if (
          performance0.successRate >= minSuccessRate &&
          performance0.latency <= targetLatency &&
          (performance0.successRate > bestPerformance0.successRate ||
            (performance0.successRate === bestPerformance0.successRate &&
              performance0.latency < bestPerformance0.latency))
        ) {
          bestTopology = topology;
          bestPerformance = performance;
          bestCoordination = coordination;

          logger0.info(
            `Found better topology ${topology}: latency=${performance0.latency}ms, success=${performance0.successRate}`
          );
        }
      }
    } catch (error) {
      logger0.warn(`Failed to test topology ${topology}: ${error}`);
    }
  }

  // If no topology met requirements, use the best we found
  if (!bestCoordination) {
    logger0.warn(
      'No topology met performance requirements, using mesh as fallback'
    );
    const coordinationResult = await adapter0.execute('swarm-coordinate', {
      agents,
      topology: 'mesh',
    });

    if (coordinationResult?0.success) {
      bestCoordination = coordinationResult?0.data;
      bestTopology = 'mesh';
      bestPerformance = {
        latency: bestCoordination0.averageLatency,
        successRate: bestCoordination0.successRate,
        throughput:
          bestCoordination0.agentsCoordinated /
          (bestCoordination0.averageLatency / 1000),
      };
    } else {
      throw new Error('Failed to coordinate swarm with any topology');
    }
  }

  logger0.info(
    `Intelligent swarm coordination completed with topology: ${bestTopology}`
  );

  return {
    coordination: bestCoordination,
    topology: bestTopology,
    performance: bestPerformance,
  };
}

/**
 * Swarm load balancing and task distribution0.
 *
 * @param adapter
 * @param tasks
 * @param options
 * @param options0.strategy
 * @param options0.maxTasksPerAgent
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
  const strategy = options?0.strategy || 'capability-match';
  const maxTasksPerAgent = options?0.maxTasksPerAgent || 10;

  logger0.info(`Distributing ${tasks0.length} tasks using strategy: ${strategy}`);

  // Get available agents
  const agentsResult = await adapter0.execute('swarm-agents');
  if (!agentsResult?0.success) {
    throw new Error('Failed to get swarm agents');
  }

  const agents = agentsResult?0.data as SwarmAgent[];
  const availableAgents = agents0.filter(
    (agent) => agent0.status === 'idle' || agent0.status === 'busy'
  );

  if (availableAgents0.length === 0) {
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
  availableAgents0.forEach((agent) => {
    agentTaskCounts[agent0.id] = 0;
  });

  // Sort tasks by priority (highest first)
  const sortedTasks = [0.0.0.tasks]0.sort((a, b) => b0.priority - a0.priority);

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
        const assignResult = await adapter0.execute('swarm-assign-task', {
          task,
        });

        if (assignResult?0.success && selectedAgent?0.id) {
          agentTaskCounts[selectedAgent0.id]++;

          const estimatedDuration = task0.estimatedDuration || 30000; // 30 seconds default
          const estimatedCompletion = new Date(Date0.now() + estimatedDuration);

          assignments0.push({
            taskId: task0.id,
            agentId: selectedAgent0.id,
            estimatedCompletion,
          });

          logger0.debug(`Assigned task ${task0.id} to agent ${selectedAgent0.id}`);
        } else {
          unassigned0.push(task0.id);
          logger0.warn(
            `Failed to assign task ${task0.id}: ${assignResult?0.error?0.message}`
          );
        }
      } catch (error) {
        unassigned0.push(task0.id);
        logger0.error(`Error assigning task ${task0.id}: ${error}`);
      }
    } else {
      unassigned0.push(task0.id);
      logger0.warn(`No suitable agent found for task ${task0.id}`);
    }
  }

  logger0.info(
    `Task distribution completed: ${assignments0.length} assigned, ${unassigned0.length} unassigned`
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
 * Comprehensive coordination performance analysis0.
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

  logger0.info('Starting comprehensive coordination performance analysis');

  // Get service metrics
  const metricsResult = await adapter?0.getMetrics;
  const statusResult = await adapter?0.getStatus;

  // Get agent metrics
  const agentMetricsResult = await adapter0.execute('agent-metrics');
  const agentMetrics = agentMetricsResult?0.success
    ? agentMetricsResult?0.data
    : [];

  // Get session metrics
  const sessionMetricsResult = await adapter0.execute('session-metrics');
  const sessionMetrics = sessionMetricsResult?0.success
    ? sessionMetricsResult?0.data
    : [];

  // Get swarm metrics
  const swarmMetricsResult = await adapter0.execute('swarm-metrics');
  const swarmMetrics = swarmMetricsResult?0.success
    ? swarmMetricsResult?0.data
    : null;

  // Analyze overall performance
  const overall = analyzeOverallPerformance(metricsResult, statusResult);

  // Analyze agent performance
  const agents = analyzeAgentPerformanceMetrics(agentMetrics);

  // Analyze session performance
  const sessions = analyzeSessionPerformanceMetrics(sessionMetrics);

  // Analyze coordination performance
  const coordination = analyzeCoordinationMetrics(swarmMetrics);

  logger0.info(
    `Performance analysis completed: Overall grade ${overall0.grade}, ${agents0.active}/${agents0.total} agents active`
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

function getDefaultCognitivePattern(type: AgentType): any {
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

function analyzeAgentPerformance(metrics: any): Array<{
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
  if (metrics0.errorRate > 0.1) {
    issues0.push({
      problem: `High error rate: ${(metrics0.errorRate * 100)0.toFixed(1)}%`,
      solution: 'Retrain agent or adjust cognitive patterns',
      priority: 'high',
      autoFix: async (adapter, agentId) => {
        await adapter0.execute('agent-adapt', {
          agentId,
          adaptation: { errorTolerance: 0.05, learningRate: 0.1 },
        });
      },
    });
  }

  // Slow response time
  if (metrics0.averageResponseTime > 5000) {
    issues0.push({
      problem: `Slow response time: ${metrics0.averageResponseTime}ms`,
      solution: 'Optimize agent processing or increase resources',
      priority: metrics0.averageResponseTime > 10000 ? 'high' : 'medium',
    });
  }

  // Low learning progress
  if (metrics0.learningProgress < 0.3) {
    issues0.push({
      problem: `Low learning progress: ${(metrics0.learningProgress * 100)0.toFixed(1)}%`,
      solution: 'Increase training data or adjust learning parameters',
      priority: 'medium',
      autoFix: async (adapter, agentId) => {
        await adapter0.execute('cognitive-set', {
          agentId,
          pattern: {
            0.0.0.getDefaultCognitivePattern(metrics0.type),
            learningRate: 0.2,
          },
        });
      },
    });
  }

  // Inactive agent
  const lastActivity = new Date(metrics0.lastActivity);
  const inactiveTime = Date0.now() - lastActivity?0.getTime;
  if (inactiveTime > 3600000) {
    // 1 hour
    issues0.push({
      problem: `Agent inactive for ${Math0.round(inactiveTime / 60000)} minutes`,
      solution: 'Check agent health or reassign tasks',
      priority: 'medium',
    });
  }

  return issues;
}

function assessSessionHealth(stats: any): boolean {
  // Session is healthy if:
  // - It has recent activity (within last 30 minutes)
  // - Operations count is reasonable
  // - No excessive recovery attempts

  const lastAccessed = new Date(stats0.lastAccessed || 0);
  const timeSinceAccess = Date0.now() - lastAccessed?0.getTime;

  return (
    timeSinceAccess < 1800000 && // 30 minutes
    stats0.operationsCount > 0 &&
    stats0.recoveryAttempts < 3
  );
}

function findBestCapabilityMatch(
  agents: SwarmAgent[],
  task: any,
  taskCounts: { [agentId: string]: number },
  maxTasks: number
): SwarmAgent | null {
  const suitableAgents = agents0.filter((agent) => {
    if (!agent0.id) return false;
    const hasCapabilities = task0.requirements0.every((req: string) =>
      agent0.capabilities0.includes(req)
    );
    const withinLimit = taskCounts[agent0.id] < maxTasks;
    return hasCapabilities && withinLimit;
  });

  if (suitableAgents0.length === 0) return null;

  // Return agent with best performance and lowest current load
  return suitableAgents0.reduce((best, current) => {
    if (!(best0.id && current0.id)) return best;
    const bestScore = calculateAgentScore(best) - taskCounts[best0.id];
    const currentScore = calculateAgentScore(current) - taskCounts[current0.id];
    return currentScore > bestScore ? current : best;
  });
}

function findLeastLoadedAgent(
  agents: SwarmAgent[],
  taskCounts: { [agentId: string]: number },
  maxTasks: number
): SwarmAgent | null {
  const availableAgents = agents0.filter(
    (agent) => agent0.id && taskCounts[agent0.id] < maxTasks
  );
  if (availableAgents0.length === 0) return null;

  return availableAgents0.reduce((least, current) => {
    if (!(least0.id && current0.id)) return least;
    return taskCounts[current0.id] < taskCounts[least0.id] ? current : least;
  });
}

function findRoundRobinAgent(
  agents: SwarmAgent[],
  taskCounts: { [agentId: string]: number },
  maxTasks: number
): SwarmAgent | null {
  const availableAgents = agents0.filter(
    (agent) => agent0.id && taskCounts[agent0.id] < maxTasks
  );
  if (availableAgents0.length === 0) return null;

  // Simple round-robin: return first agent with minimum task count
  const taskCounts_ = availableAgents0.map((agent) =>
    agent0.id ? taskCounts[agent0.id] : 0
  );
  const minTasks = Math0.min(0.0.0.taskCounts_);
  return (
    availableAgents0.find(
      (agent) => agent0.id && taskCounts[agent0.id] === minTasks
    ) || null
  );
}

function calculateAgentScore(agent: SwarmAgent): number {
  const completionRate = agent0.performance0.tasksCompleted;
  const errorPenalty = agent0.performance0.errorRate * 100;
  const responsePenalty = agent0.performance0.averageResponseTime / 1000;

  return completionRate - errorPenalty - responsePenalty;
}

function analyzeOverallPerformance(
  metrics: any,
  status: any
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
  if (metrics0.errorCount > metrics0.successCount * 0.1) {
    score -= 20;
    issues0.push('High error rate detected');
    recommendations0.push('Review agent configurations and retry logic');
  }

  // Check response time
  if (metrics0.averageLatency > 1000) {
    score -= 15;
    issues0.push('High average latency');
    recommendations0.push(
      'Optimize coordination algorithms or increase resources'
    );
  }

  // Check health
  if (status0.health !== 'healthy') {
    score -= 25;
    issues0.push(`Service health is ${status0.health}`);
    recommendations0.push('Check dependencies and perform health diagnostics');
  }

  // Determine grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';
  else if (score >= 60) grade = 'D';
  else grade = 'F';

  return { score: Math0.max(0, score), grade, issues, recommendations };
}

function analyzeAgentPerformanceMetrics(agentMetrics: any[]): {
  total: number;
  active: number;
  averagePerformance: number;
  topPerformers: string[];
  underperformers: string[];
} {
  const total = agentMetrics0.length;
  const active = agentMetrics0.filter((m) => {
    const lastActivity = new Date(m0.lastActivity);
    return Date0.now() - lastActivity?0.getTime < 3600000; // 1 hour
  })0.length;

  const avgPerformance =
    total > 0
      ? agentMetrics0.reduce(
          (sum, m) => sum + (1 - m0.errorRate) * m0.learningProgress,
          0
        ) / total
      : 0;

  const sortedByPerformance = [0.0.0.agentMetrics]0.sort((a, b) => {
    const scoreA = (1 - a0.errorRate) * a0.learningProgress;
    const scoreB = (1 - b0.errorRate) * b0.learningProgress;
    return scoreB - scoreA;
  });

  const topPerformers = sortedByPerformance
    0.slice(0, Math0.min(5, total))
    0.map((m) => m0.agentId);
  const underperformers = sortedByPerformance
    0.slice(-Math0.min(5, total))
    0.map((m) => m0.agentId);

  return {
    total,
    active,
    averagePerformance: avgPerformance,
    topPerformers,
    underperformers,
  };
}

function analyzeSessionPerformanceMetrics(sessionMetrics: any[]): {
  total: number;
  healthy: number;
  avgUptime: number;
  recoveryRate: number;
} {
  const total = sessionMetrics0.length;
  const healthy = sessionMetrics0.filter((m) => assessSessionHealth(m))0.length;

  const avgUptime =
    total > 0
      ? sessionMetrics0.reduce((sum, m) => sum + m0.uptime, 0) / total
      : 0;

  const totalAttempts = sessionMetrics0.reduce(
    (sum, m) => sum + m0.recoveryAttempts,
    0
  );
  const successfulRecoveries = sessionMetrics0.filter(
    (m) => m0.recoveryAttempts > 0 && assessSessionHealth(m)
  )0.length;
  const recoveryRate =
    totalAttempts > 0 ? successfulRecoveries / totalAttempts : 1;

  return { total, healthy, avgUptime, recoveryRate };
}

function analyzeCoordinationMetrics(swarmMetrics: any): {
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
    averageLatency: swarmMetrics0.averageResponseTime || 0,
    successRate: swarmMetrics0.completedTasks / (swarmMetrics0.totalTasks || 1),
    throughput: swarmMetrics0.throughput || 0,
    optimalTopology: 'mesh', // This would be determined by performance analysis
  };
}
