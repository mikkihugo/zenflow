/**
 * @file Swarm Batch Coordination
 * Implements concurrent swarm operations following claude-zen patterns.
 * Enables batch agent spawning, task distribution, and coordination.
 */

import { getLogger } from '../../config/logging-config.ts';
import type { AgentType } from '../types.ts';
import type { BatchOperation } from './batch-engine.ts';

const logger = getLogger('SwarmBatch');

export interface SwarmOperation {
  type: 'init' | 'spawn' | 'assign' | 'coordinate' | 'terminate' | 'status';
  swarmId?: string;
  agentType?: AgentType;
  agentCount?: number;
  topology?: 'mesh' | 'hierarchical' | 'ring' | 'star';
  task?: {
    id: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    estimatedDuration?: number;
  };
  coordination?: {
    strategy: 'sequential' | 'parallel' | 'adaptive';
    timeout?: number;
    retryAttempts?: number;
  };
}

export interface SwarmOperationResult {
  operation: SwarmOperation;
  success: boolean;
  result?: {
    swarmId?: string;
    agentIds?: string[];
    taskResults?: Array<{ agentId: string; result: unknown; status: string }>;
    metrics?: {
      executionTime: number;
      successRate: number;
      resourceUtilization: number;
    };
  };
  error?: string;
  executionTime: number;
}

export interface SwarmBatchConfig {
  maxConcurrentSwarms?: number;
  maxAgentsPerSwarm?: number;
  defaultTimeout?: number;
  enableCoordinationOptimization?: boolean;
}

/**
 * Coordinates multiple swarm operations concurrently.
 * Implements claude-zen's swarm batch optimization patterns.
 *
 * @example
 */
export class SwarmBatchCoordinator {
  private readonly config: Required<SwarmBatchConfig>;
  private readonly activeSwarms: Map<string, SwarmState>;

  constructor(config: SwarmBatchConfig = {}) {
    this.config = {
      maxConcurrentSwarms: config?.maxConcurrentSwarms ?? 5,
      maxAgentsPerSwarm: config?.maxAgentsPerSwarm ?? 10,
      defaultTimeout: config?.defaultTimeout ?? 30000,
      enableCoordinationOptimization: config?.enableCoordinationOptimization ?? true,
    };

    this.activeSwarms = new Map();
  }

  /**
   * Execute multiple swarm operations concurrently.
   * Implements claude-zen's batch swarm coordination.
   *
   * @param operations
   */
  async executeBatch(operations: SwarmOperation[]): Promise<SwarmOperationResult[]> {
    logger.info(`Starting batch swarm operations: ${operations.length} operations`);

    // Group operations by type for optimization
    const groupedOps = this.groupOperationsByType(operations);

    const results: SwarmOperationResult[] = [];

    // Execute swarm initialization operations first
    if (groupedOps.init.length > 0) {
      const initResults = await this.executeSwarmInits(groupedOps.init);
      results.push(...initResults);
    }

    // Execute agent spawning operations
    if (groupedOps.spawn.length > 0) {
      const spawnResults = await this.executeAgentSpawning(groupedOps.spawn);
      results.push(...spawnResults);
    }

    // Execute task assignment and coordination operations
    const coordinationOps = [...groupedOps.assign, ...groupedOps.coordinate];

    if (coordinationOps.length > 0) {
      const coordResults = await this.executeCoordinationOperations(coordinationOps);
      results.push(...coordResults);
    }

    // Execute status and termination operations
    const managementOps = [...groupedOps.status, ...groupedOps.terminate];

    if (managementOps.length > 0) {
      const mgmtResults = await this.executeManagementOperations(managementOps);
      results.push(...mgmtResults);
    }

    logger.info(`Completed batch swarm operations: ${results.length} operations processed`);
    return results;
  }

  /**
   * Group operations by type for intelligent execution order.
   *
   * @param operations
   */
  private groupOperationsByType(
    operations: SwarmOperation[]
  ): Record<SwarmOperation['type'], SwarmOperation[]> {
    const groups: Record<SwarmOperation['type'], SwarmOperation[]> = {
      init: [],
      spawn: [],
      assign: [],
      coordinate: [],
      status: [],
      terminate: [],
    };

    for (const operation of operations) {
      groups[operation.type]?.push(operation);
    }

    return groups;
  }

  /**
   * Execute swarm initialization operations concurrently.
   *
   * @param operations
   */
  private async executeSwarmInits(operations: SwarmOperation[]): Promise<SwarmOperationResult[]> {
    const results: SwarmOperationResult[] = [];

    // Execute swarm inits with controlled concurrency
    const chunks = this.chunkOperations(operations, this.config.maxConcurrentSwarms);

    for (const chunk of chunks) {
      const chunkPromises = chunk.map((op) => this.executeSwarmInit(op));
      const chunkResults = await Promise.allSettled(chunkPromises);

      chunkResults?.forEach((result, index) => {
        if (result?.status === 'fulfilled') {
          results.push(result?.value);
        } else {
          const operation = chunk[index];
          if (operation) {
            results.push(this.createErrorResult(operation, result?.reason));
          }
        }
      });
    }

    return results;
  }

  /**
   * Execute agent spawning operations with batch optimization.
   *
   * @param operations
   */
  private async executeAgentSpawning(
    operations: SwarmOperation[]
  ): Promise<SwarmOperationResult[]> {
    // Group spawning operations by swarm for optimization
    const swarmGroups = new Map<string, SwarmOperation[]>();

    for (const op of operations) {
      const swarmId = op.swarmId || 'default';
      if (!swarmGroups.has(swarmId)) {
        swarmGroups.set(swarmId, []);
      }
      swarmGroups.get(swarmId)?.push(op);
    }

    const results: SwarmOperationResult[] = [];

    // Execute spawning for each swarm concurrently
    const swarmPromises = Array.from(swarmGroups.entries()).map(([swarmId, ops]) =>
      this.executeSwarmAgentSpawning(swarmId, ops)
    );

    const swarmResults = await Promise.allSettled(swarmPromises);

    swarmResults?.forEach((result) => {
      if (result?.status === 'fulfilled') {
        results.push(...result?.value);
      } else {
        // Create error results for failed swarm spawning
        logger.warn('Swarm agent spawning failed:', result?.reason);
      }
    });

    return results;
  }

  /**
   * Execute coordination operations with adaptive strategies.
   *
   * @param operations
   */
  private async executeCoordinationOperations(
    operations: SwarmOperation[]
  ): Promise<SwarmOperationResult[]> {
    const results: SwarmOperationResult[] = [];

    if (this.config.enableCoordinationOptimization) {
      // Optimize coordination order based on dependencies and priorities
      const optimizedOrder = this.optimizeCoordinationOrder(operations);

      for (const operation of optimizedOrder) {
        const result = await this.executeCoordinationOperation(operation);
        results.push(result);
      }
    } else {
      // Execute with controlled concurrency
      const chunks = this.chunkOperations(operations, this.config.maxConcurrentSwarms);

      for (const chunk of chunks) {
        const chunkPromises = chunk.map((op) => this.executeCoordinationOperation(op));
        const chunkResults = await Promise.allSettled(chunkPromises);

        chunkResults?.forEach((result, index) => {
          if (result?.status === 'fulfilled') {
            results.push(result?.value);
          } else {
            const operation = chunk[index];
            if (operation) {
              results.push(this.createErrorResult(operation, result?.reason));
            }
          }
        });
      }
    }

    return results;
  }

  /**
   * Execute management operations (status, terminate).
   *
   * @param operations.
   * @param operations
   */
  private async executeManagementOperations(
    operations: SwarmOperation[]
  ): Promise<SwarmOperationResult[]> {
    const results: SwarmOperationResult[] = [];

    // Execute management operations with high concurrency (they're typically lightweight)
    const chunks = this.chunkOperations(operations, this.config.maxConcurrentSwarms * 2);

    for (const chunk of chunks) {
      const chunkPromises = chunk.map((op) => this.executeManagementOperation(op));
      const chunkResults = await Promise.allSettled(chunkPromises);

      chunkResults?.forEach((result, index) => {
        if (result?.status === 'fulfilled') {
          results.push(result?.value);
        } else {
          const operation = chunk[index];
          if (operation) {
            results.push(this.createErrorResult(operation, result?.reason));
          }
        }
      });
    }

    return results;
  }

  /**
   * Execute individual swarm initialization.
   *
   * @param operation
   */
  private async executeSwarmInit(operation: SwarmOperation): Promise<SwarmOperationResult> {
    const startTime = Date.now();

    try {
      const swarmId = this.generateSwarmId();
      const topology = operation.topology || 'hierarchical';

      // Initialize swarm state
      const swarmState: SwarmState = {
        id: swarmId,
        topology,
        agents: [],
        status: 'initializing',
        createdAt: Date.now(),
        lastActivity: Date.now(),
      };

      this.activeSwarms.set(swarmId, swarmState);

      // Simulate swarm initialization (replace with actual implementation)
      await this.simulateOperation(100);

      swarmState.status = 'active';

      return {
        operation,
        success: true,
        result: {
          swarmId,
          metrics: {
            executionTime: Date.now() - startTime,
            successRate: 1.0,
            resourceUtilization: 0.1,
          },
        },
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      return this.createErrorResult(operation, error, startTime);
    }
  }

  /**
   * Execute agent spawning for a specific swarm.
   *
   * @param swarmId
   * @param operations
   */
  private async executeSwarmAgentSpawning(
    swarmId: string,
    operations: SwarmOperation[]
  ): Promise<SwarmOperationResult[]> {
    const results: SwarmOperationResult[] = [];
    const swarmState = this.activeSwarms.get(swarmId);

    if (!swarmState) {
      return operations.map((op) =>
        this.createErrorResult(op, new Error(`Swarm ${swarmId} not found`))
      );
    }

    // Batch spawn agents for efficiency
    const agentTypes = operations.map((op) => op.agentType).filter(Boolean) as AgentType[];
    const totalAgents = operations.reduce((sum, op) => sum + (op.agentCount || 1), 0);

    if (totalAgents > this.config.maxAgentsPerSwarm) {
      throw new Error(
        `Requested ${totalAgents} agents exceeds limit of ${this.config.maxAgentsPerSwarm}`
      );
    }

    const startTime = Date.now();

    try {
      // Simulate batch agent spawning
      const spawnedAgents = await this.batchSpawnAgents(swarmId, agentTypes);

      // Update swarm state
      swarmState.agents.push(...spawnedAgents);
      swarmState.lastActivity = Date.now();

      // Create results for each operation
      for (const operation of operations) {
        const agentCount = operation.agentCount || 1;
        const relevantAgents = spawnedAgents.slice(0, agentCount);

        results.push({
          operation,
          success: true,
          result: {
            swarmId,
            agentIds: relevantAgents.map((a) => a.id),
            metrics: {
              executionTime: Date.now() - startTime,
              successRate: 1.0,
              resourceUtilization: agentCount * 0.1,
            },
          },
          executionTime: Date.now() - startTime,
        });
      }
    } catch (error) {
      return operations.map((op) => this.createErrorResult(op, error, startTime));
    }

    return results;
  }

  /**
   * Execute coordination operation.
   *
   * @param operation
   */
  private async executeCoordinationOperation(
    operation: SwarmOperation
  ): Promise<SwarmOperationResult> {
    const startTime = Date.now();

    try {
      const swarmId = operation.swarmId || 'default';
      const swarmState = this.activeSwarms.get(swarmId);

      if (!swarmState) {
        throw new Error(`Swarm ${swarmId} not found`);
      }

      // Execute task coordination
      const taskResults = await this.coordinateTask(swarmState, operation);

      swarmState.lastActivity = Date.now();

      return {
        operation,
        success: true,
        result: {
          swarmId,
          taskResults,
          metrics: {
            executionTime: Date.now() - startTime,
            successRate:
              taskResults.length > 0
                ? taskResults?.filter((r) => r.status === 'completed').length / taskResults.length
                : 0,
            resourceUtilization: swarmState.agents.length * 0.2,
          },
        },
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      return this.createErrorResult(operation, error, startTime);
    }
  }

  /**
   * Execute management operation (status, terminate).
   *
   * @param operation
   */
  private async executeManagementOperation(
    operation: SwarmOperation
  ): Promise<SwarmOperationResult> {
    const startTime = Date.now();

    try {
      switch (operation.type) {
        case 'status':
          return await this.getSwarmStatus(operation, startTime);
        case 'terminate':
          return await this.terminateSwarm(operation, startTime);
        default:
          throw new Error(`Unknown management operation: ${operation.type}`);
      }
    } catch (error) {
      return this.createErrorResult(operation, error, startTime);
    }
  }

  /**
   * Optimize coordination order based on priorities and dependencies.
   *
   * @param operations
   */
  private optimizeCoordinationOrder(operations: SwarmOperation[]): SwarmOperation[] {
    // Sort by priority (critical first) and estimated duration
    return operations.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const aPriority = priorityOrder[a.task?.priority || 'medium'];
      const bPriority = priorityOrder[b.task?.priority || 'medium'];

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      // Secondary sort by estimated duration (shorter first)
      const aDuration = a.task?.estimatedDuration || 1000;
      const bDuration = b.task?.estimatedDuration || 1000;
      return aDuration - bDuration;
    });
  }

  /**
   * Coordinate task execution within a swarm.
   *
   * @param swarmState
   * @param operation
   */
  private async coordinateTask(
    swarmState: SwarmState,
    operation: SwarmOperation
  ): Promise<Array<{ agentId: string; result: unknown; status: string }>> {
    const strategy = operation.coordination?.strategy || 'parallel';
    const timeout = operation.coordination?.timeout || this.config.defaultTimeout;

    // Execute task coordination based on strategy
    const taskResults: Array<{ agentId: string; result: unknown; status: string }> = [];

    if (strategy === 'parallel') {
      // Execute all agent tasks in parallel with timeout
      const promises = swarmState.agents.map(async (agent) => {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), timeout)
        );

        try {
          const result = await Promise.race([
            this.executeTaskOnAgent(agent.id, operation),
            timeoutPromise,
          ]);
          return { agentId: agent.id, result, status: 'completed' };
        } catch (error) {
          return { agentId: agent.id, result: error, status: 'failed' };
        }
      });

      const results = await Promise.allSettled(promises);
      taskResults?.push(
        ...results.map((r) =>
          r.status === 'fulfilled'
            ? r.value
            : { agentId: 'unknown', result: r.reason, status: 'failed' }
        )
      );
    } else {
      // Sequential execution for other strategies
      for (const agent of swarmState.agents) {
        try {
          const result = await this.executeTaskOnAgent(agent.id, operation);
          taskResults?.push({ agentId: agent.id, result, status: 'completed' });
        } catch (error) {
          taskResults?.push({ agentId: agent.id, result: error, status: 'failed' });
        }
      }
    }

    for (const agent of swarmState.agents) {
      await this.simulateOperation(Math.random() * 200);

      taskResults?.push({
        agentId: agent.id,
        result: { taskId: operation.task?.id, completed: true },
        status: Math.random() > 0.1 ? 'completed' : 'failed', // 90% success rate
      });
    }

    return taskResults;
  }

  /**
   * Batch spawn agents efficiently.
   *
   * @param swarmId
   * @param agentTypes
   */
  private async batchSpawnAgents(swarmId: string, agentTypes: AgentType[]): Promise<Agent[]> {
    const agents: Agent[] = [];

    // Simulate batch agent creation
    for (const agentType of agentTypes) {
      await this.simulateOperation(50); // Faster than individual spawning

      agents.push({
        id: this.generateAgentId(),
        type: agentType,
        swarmId,
        status: 'active',
        createdAt: Date.now(),
      });
    }

    return agents;
  }

  /**
   * Get swarm status.
   *
   * @param operation
   * @param startTime
   */
  private async getSwarmStatus(
    operation: SwarmOperation,
    startTime: number
  ): Promise<SwarmOperationResult> {
    const swarmId = operation.swarmId || 'default';
    const swarmState = this.activeSwarms.get(swarmId);

    if (!swarmState) {
      throw new Error(`Swarm ${swarmId} not found`);
    }

    return {
      operation,
      success: true,
      result: {
        swarmId,
        metrics: {
          executionTime: Date.now() - startTime,
          successRate: 1.0,
          resourceUtilization: swarmState.agents.length * 0.05,
        },
      },
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * Terminate swarm.
   *
   * @param operation
   * @param startTime
   */
  private async terminateSwarm(
    operation: SwarmOperation,
    startTime: number
  ): Promise<SwarmOperationResult> {
    const swarmId = operation.swarmId || 'default';

    if (this.activeSwarms.has(swarmId)) {
      this.activeSwarms.delete(swarmId);
    }

    await this.simulateOperation(100);

    return {
      operation,
      success: true,
      result: {
        swarmId,
        metrics: {
          executionTime: Date.now() - startTime,
          successRate: 1.0,
          resourceUtilization: 0,
        },
      },
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * Utility methods.
   *
   * @param operations
   * @param chunkSize
   */
  private chunkOperations<T>(operations: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < operations.length; i += chunkSize) {
      chunks.push(operations.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private createErrorResult(
    operation: SwarmOperation,
    error: unknown,
    startTime?: number
  ): SwarmOperationResult {
    const executionTime = startTime ? Date.now() - startTime : 0;
    return {
      operation,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      executionTime,
    };
  }

  private generateSwarmId(): string {
    return `swarm-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  private generateAgentId(): string {
    return `agent-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  private async simulateOperation(duration: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, duration));
  }

  /**
   * Execute task on a specific agent.
   *
   * @param agentId
   * @param operation
   */
  private async executeTaskOnAgent(agentId: string, operation: SwarmOperation): Promise<unknown> {
    // Simulate task execution on agent
    await this.simulateOperation(Math.random() * 300 + 100);

    return {
      agentId,
      taskId: operation.task?.id || 'unknown',
      result: `Task completed by ${agentId}`,
      timestamp: Date.now(),
    };
  }

  /**
   * Convert SwarmOperation to BatchOperation for use with BatchEngine.
   *
   * @param swarmOps
   */
  static createBatchOperations(swarmOps: SwarmOperation[]): BatchOperation[] {
    return swarmOps.map((swarmOp, index) => ({
      id: `swarm-${index}-${swarmOp.type}-${Date.now()}`,
      type: 'swarm',
      operation: swarmOp.type,
      params: {
        swarmId: swarmOp.swarmId,
        agentType: swarmOp.agentType,
        agentCount: swarmOp.agentCount,
        topology: swarmOp.topology,
        task: swarmOp.task,
        coordination: swarmOp.coordination,
      },
    }));
  }

  /**
   * Get active swarms count.
   */
  getActiveSwarms(): number {
    return this.activeSwarms.size;
  }

  /**
   * Get total active agents across all swarms.
   */
  getTotalActiveAgents(): number {
    let total = 0;
    for (const swarm of Array.from(this.activeSwarms.values())) {
      total += swarm.agents.length;
    }
    return total;
  }
}

// Supporting interfaces
interface SwarmState {
  id: string;
  topology: string;
  agents: Agent[];
  status: 'initializing' | 'active' | 'terminated';
  createdAt: number;
  lastActivity: number;
}

interface Agent {
  id: string;
  type: AgentType;
  swarmId: string;
  status: string;
  createdAt: number;
}
