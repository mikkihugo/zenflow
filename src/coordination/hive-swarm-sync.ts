/**
 * Hive-Swarm Synchronization System
 *
 * Maintains real-time awareness between distributed swarms and the central hive mind.
 * Ensures all swarms know about available agents, task distribution, and global state.
 */

import { EventEmitter } from 'node:events';
import type { IEventBus } from '../core/event-bus';
import type { ILogger } from '../core/logger';
import type { AgentState, AgentType } from '../types/agent-types';

export interface HiveRegistry {
  // Global agent registry
  availableAgents: Map<string, GlobalAgentInfo>;

  // Swarm registry
  activeSwarms: Map<string, SwarmInfo>;

  // Task distribution info
  globalTaskQueue: Task[];
  taskAssignments: Map<string, string>; // taskId -> agentId

  // Resource utilization
  globalResources: GlobalResourceMetrics;

  // Hive health
  hiveHealth: HiveHealthMetrics;
}

export interface GlobalAgentInfo extends AgentState {
  swarmId: string;
  hiveMindId: string;
  capabilities: AgentCapability[];
  currentWorkload: number;
  availability: AgentAvailability;
  lastSync: Date;
  networkLatency: number;
}

export interface SwarmInfo {
  id: string;
  hiveMindId: string;
  topology: 'mesh' | 'hierarchical' | 'ring' | 'star';
  agentCount: number;
  activeAgents: number;
  taskQueue: number;
  performance: SwarmPerformanceMetrics;
  lastHeartbeat: Date;
  location?: string; // Geographic or logical location
}

export interface AgentCapability {
  type: string;
  level: number; // 1-10 proficiency
  resources: string[];
  specializations: string[];
}

export interface AgentAvailability {
  status: 'available' | 'busy' | 'reserved' | 'offline';
  currentTasks: number;
  maxConcurrentTasks: number;
  estimatedFreeTime?: Date;
  reservedFor?: string; // Specific swarm or task
}

export interface SwarmPerformanceMetrics {
  averageResponseTime: number;
  tasksCompletedPerMinute: number;
  successRate: number;
  resourceEfficiency: number;
  qualityScore: number;
}

export interface GlobalResourceMetrics {
  totalCPU: number;
  usedCPU: number;
  totalMemory: number;
  usedMemory: number;
  totalAgents: number;
  availableAgents: number;
  busyAgents: number;
  networkBandwidth: number;
}

export interface HiveHealthMetrics {
  overallHealth: number; // 0-100
  consensus: number; // How well swarms agree
  synchronization: number; // How up-to-date everything is
  faultTolerance: number; // Resilience to failures
  loadBalance: number; // Even distribution of work
}

/**
 * Central hive mind synchronization coordinator
 */
export class HiveSwarmCoordinator extends EventEmitter {
  private hiveRegistry: HiveRegistry;
  private syncInterval: number = 3000; // 3 seconds
  private heartbeatInterval: number = 1000; // 1 second

  private syncTimer?: NodeJS.Timeout;
  private heartbeatTimer?: NodeJS.Timeout;
  private connectionHealth = new Map<string, number>(); // swarmId -> health score

  constructor(
    private eventBus: IEventBus,
    private logger?: ILogger
  ) {
    super();

    this.hiveRegistry = {
      availableAgents: new Map(),
      activeSwarms: new Map(),
      globalTaskQueue: [],
      taskAssignments: new Map(),
      globalResources: this.initializeGlobalResources(),
      hiveHealth: this.initializeHiveHealth(),
    };

    this.setupEventHandlers();
  }

  /**
   * Start hive-swarm synchronization
   */
  async start(): Promise<void> {
    this.logger?.info('Starting hive-swarm coordination');

    // Start periodic synchronization
    this.syncTimer = setInterval(() => {
      this.performHiveSync().catch((error) => {
        this.logger?.error('Hive sync failed', { error: error.message });
      });
    }, this.syncInterval);

    // Start heartbeat monitoring
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeats();
      this.checkSwarmHealth();
    }, this.heartbeatInterval);

    this.emit('hive:coordination:started');
  }

  /**
   * Stop hive-swarm synchronization
   */
  async stop(): Promise<void> {
    this.logger?.info('Stopping hive-swarm coordination');

    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = undefined;
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }

    this.emit('hive:coordination:stopped');
  }

  /**
   * Core hive synchronization process
   */
  private async performHiveSync(): Promise<void> {
    try {
      // 1. Collect agent states from all swarms
      await this.collectAgentStates();

      // 2. Update global resource metrics
      await this.updateGlobalResources();

      // 3. Optimize task distribution
      await this.optimizeTaskDistribution();

      // 4. Balance workloads across swarms
      await this.balanceWorkloads();

      // 5. Update swarm performance metrics
      await this.updateSwarmMetrics();

      // 6. Broadcast global state to all swarms
      await this.broadcastGlobalState();

      // 7. Update hive health metrics
      this.updateHiveHealth();

      this.emit('hive:sync:completed', this.getHiveStatus());
    } catch (error) {
      this.logger?.error('Hive sync cycle failed', { error: error.message });
      this.emit('hive:sync:failed', { error: error.message });
    }
  }

  /**
   * Collect agent states from all active swarms
   */
  private async collectAgentStates(): Promise<void> {
    // Request agent states from all swarms
    this.eventBus.emit('hive:request:agent_states', {
      timestamp: Date.now(),
      requestId: this.generateRequestId(),
    });

    // States will be updated via event handlers
  }

  /**
   * Update global resource metrics
   */
  private async updateGlobalResources(): Promise<void> {
    const agents = Array.from(this.hiveRegistry.availableAgents.values());

    this.hiveRegistry.globalResources = {
      totalCPU: agents.reduce((sum, agent) => sum + 100, 0), // Assume 100% per agent
      usedCPU: agents.reduce((sum, agent) => sum + agent.metrics.cpuUsage, 0),
      totalMemory: agents.reduce((sum, agent) => sum + 1000, 0), // Assume 1GB per agent
      usedMemory: agents.reduce((sum, agent) => sum + agent.metrics.memoryUsage, 0),
      totalAgents: agents.length,
      availableAgents: agents.filter((a) => a.availability.status === 'available').length,
      busyAgents: agents.filter((a) => a.availability.status === 'busy').length,
      networkBandwidth: 1000, // Placeholder
    };
  }

  /**
   * Intelligent task distribution across swarms
   */
  private async optimizeTaskDistribution(): Promise<void> {
    const pendingTasks = this.hiveRegistry.globalTaskQueue.filter((t) => !t.assignedAgent);
    const availableAgents = Array.from(this.hiveRegistry.availableAgents.values())
      .filter((agent) => agent.availability.status === 'available')
      .sort((a, b) => a.currentWorkload - b.currentWorkload); // Least loaded first

    for (const task of pendingTasks) {
      const suitableAgent = this.findBestAgentForTask(task, availableAgents);

      if (suitableAgent) {
        // Assign task to agent
        this.hiveRegistry.taskAssignments.set(task.id, suitableAgent.id);
        suitableAgent.availability.status = 'busy';
        suitableAgent.currentWorkload++;

        // Notify the swarm about task assignment
        this.eventBus.emit('hive:task:assigned', {
          taskId: task.id,
          agentId: suitableAgent.id,
          swarmId: suitableAgent.swarmId,
          task: task,
        });

        this.logger?.debug('Task assigned via hive coordination', {
          taskId: task.id,
          agentId: suitableAgent.id,
          swarmId: suitableAgent.swarmId,
        });
      }
    }
  }

  /**
   * Find the best agent for a specific task
   */
  private findBestAgentForTask(
    task: Task,
    availableAgents: GlobalAgentInfo[]
  ): GlobalAgentInfo | null {
    let bestAgent: GlobalAgentInfo | null = null;
    let bestScore = -1;

    for (const agent of availableAgents) {
      const score = this.calculateAgentTaskScore(agent, task);

      if (score > bestScore) {
        bestScore = score;
        bestAgent = agent;
      }
    }

    return bestScore > 0.5 ? bestAgent : null; // Minimum threshold
  }

  /**
   * Calculate how well an agent matches a task
   */
  private calculateAgentTaskScore(agent: GlobalAgentInfo, task: Task): number {
    let score = 0;

    // Capability matching (40% of score)
    const requiredCapabilities = task.requiredCapabilities || [];
    const agentCapabilities = agent.capabilities.map((c) => c.type);
    const capabilityMatch =
      requiredCapabilities.filter((req) => agentCapabilities.includes(req)).length /
      Math.max(requiredCapabilities.length, 1);
    score += capabilityMatch * 0.4;

    // Workload balance (30% of score)
    const workloadScore = 1 - agent.currentWorkload / agent.availability.maxConcurrentTasks;
    score += workloadScore * 0.3;

    // Network latency (20% of score)
    const latencyScore = Math.max(0, 1 - agent.networkLatency / 1000); // Lower latency = higher score
    score += latencyScore * 0.2;

    // Agent performance history (10% of score)
    const performanceScore = agent.metrics.successRate;
    score += performanceScore * 0.1;

    return Math.min(score, 1.0);
  }

  /**
   * Balance workloads across swarms
   */
  private async balanceWorkloads(): Promise<void> {
    const swarms = Array.from(this.hiveRegistry.activeSwarms.values());
    const averageWorkload = swarms.reduce((sum, s) => sum + s.taskQueue, 0) / swarms.length;

    for (const swarm of swarms) {
      if (swarm.taskQueue > averageWorkload * 1.5) {
        // Swarm is overloaded - suggest task redistribution
        this.eventBus.emit('hive:load:rebalance', {
          overloadedSwarmId: swarm.id,
          currentLoad: swarm.taskQueue,
          suggestedReduction: swarm.taskQueue - averageWorkload,
        });
      }
    }
  }

  /**
   * Update swarm performance metrics
   */
  private async updateSwarmMetrics(): Promise<void> {
    for (const [swarmId, swarmInfo] of this.hiveRegistry.activeSwarms) {
      const swarmAgents = Array.from(this.hiveRegistry.availableAgents.values()).filter(
        (agent) => agent.swarmId === swarmId
      );

      if (swarmAgents.length > 0) {
        swarmInfo.performance = {
          averageResponseTime:
            swarmAgents.reduce((sum, a) => sum + a.metrics.responseTime, 0) / swarmAgents.length,
          tasksCompletedPerMinute: swarmAgents.reduce(
            (sum, a) => sum + a.metrics.tasksCompleted,
            0
          ),
          successRate:
            swarmAgents.reduce((sum, a) => sum + a.metrics.successRate, 0) / swarmAgents.length,
          resourceEfficiency:
            1 -
            swarmAgents.reduce((sum, a) => sum + a.metrics.cpuUsage, 0) / swarmAgents.length / 100,
          qualityScore:
            swarmAgents.reduce((sum, a) => sum + a.metrics.codeQuality || 0, 0) /
            swarmAgents.length,
        };
      }
    }
  }

  /**
   * Broadcast global state to all swarms
   */
  private async broadcastGlobalState(): Promise<void> {
    const globalState = {
      timestamp: Date.now(),
      availableAgents: this.hiveRegistry.availableAgents.size,
      activeSwarms: this.hiveRegistry.activeSwarms.size,
      globalResources: this.hiveRegistry.globalResources,
      hiveHealth: this.hiveRegistry.hiveHealth,
      taskDistribution: Array.from(this.hiveRegistry.taskAssignments.entries()),
    };

    this.eventBus.emit('hive:global:state', globalState);
  }

  /**
   * Send heartbeat to all swarms
   */
  private sendHeartbeats(): void {
    this.eventBus.emit('hive:heartbeat', {
      timestamp: Date.now(),
      hiveHealth: this.hiveRegistry.hiveHealth.overallHealth,
      activeSwarms: this.hiveRegistry.activeSwarms.size,
      availableAgents: this.hiveRegistry.availableAgents.size,
    });
  }

  /**
   * Check health of all swarms
   */
  private checkSwarmHealth(): void {
    const now = Date.now();
    const healthThreshold = 30000; // 30 seconds

    for (const [swarmId, swarmInfo] of this.hiveRegistry.activeSwarms) {
      const timeSinceHeartbeat = now - swarmInfo.lastHeartbeat.getTime();

      if (timeSinceHeartbeat > healthThreshold) {
        this.connectionHealth.set(swarmId, 0);
        this.logger?.warn('Swarm health degraded - no recent heartbeat', { swarmId });

        this.eventBus.emit('hive:swarm:unhealthy', {
          swarmId,
          lastHeartbeat: swarmInfo.lastHeartbeat,
          timeSinceHeartbeat,
        });
      } else {
        const healthScore = Math.max(0, 100 - timeSinceHeartbeat / 1000);
        this.connectionHealth.set(swarmId, healthScore);
      }
    }
  }

  /**
   * Update overall hive health metrics
   */
  private updateHiveHealth(): void {
    const swarms = Array.from(this.hiveRegistry.activeSwarms.values());
    const agents = Array.from(this.hiveRegistry.availableAgents.values());

    if (swarms.length === 0 || agents.length === 0) {
      this.hiveRegistry.hiveHealth = this.initializeHiveHealth();
      return;
    }

    // Calculate overall health
    const avgSwarmHealth =
      Array.from(this.connectionHealth.values()).reduce((sum, health) => sum + health, 0) /
      this.connectionHealth.size;

    // Calculate consensus (how well swarms agree on global state)
    const consensus = 85; // Placeholder - would measure actual consensus

    // Calculate synchronization (how up-to-date everything is)
    const avgSyncAge =
      agents.reduce((sum, a) => sum + (Date.now() - a.lastSync.getTime()), 0) / agents.length;
    const synchronization = Math.max(0, 100 - avgSyncAge / 1000 / 60); // Degrade after 1 minute

    // Calculate fault tolerance
    const faultTolerance = Math.min(100, (agents.length / Math.max(swarms.length, 1)) * 10); // More agents per swarm = better

    // Calculate load balance
    const swarmLoads = swarms.map((s) => s.taskQueue);
    const avgLoad = swarmLoads.reduce((sum, load) => sum + load, 0) / swarmLoads.length;
    const maxDeviation = Math.max(...swarmLoads.map((load) => Math.abs(load - avgLoad)));
    const loadBalance = Math.max(0, 100 - (maxDeviation / Math.max(avgLoad, 1)) * 100);

    this.hiveRegistry.hiveHealth = {
      overallHealth:
        (avgSwarmHealth + consensus + synchronization + faultTolerance + loadBalance) / 5,
      consensus,
      synchronization,
      faultTolerance,
      loadBalance,
    };
  }

  /**
   * Set up event handlers for hive-swarm communication
   */
  private setupEventHandlers(): void {
    // Handle swarm registration
    this.eventBus.on('swarm:register', (data) => {
      this.registerSwarm(data);
    });

    // Handle agent registration
    this.eventBus.on('agent:register', (data) => {
      this.registerAgent(data);
    });

    // Handle agent state updates
    this.eventBus.on('agent:state:update', (data) => {
      this.updateAgentState(data);
    });

    // Handle swarm heartbeats
    this.eventBus.on('swarm:heartbeat', (data) => {
      this.handleSwarmHeartbeat(data);
    });

    // Handle task completions
    this.eventBus.on('task:completed', (data) => {
      this.handleTaskCompletion(data);
    });

    // Handle swarm disconnection
    this.eventBus.on('swarm:disconnect', (data) => {
      this.handleSwarmDisconnect(data);
    });
  }

  /**
   * Register a new swarm with the hive
   */
  private registerSwarm(data: any): void {
    const swarmInfo: SwarmInfo = {
      id: data.swarmId,
      hiveMindId: data.hiveMindId || 'default',
      topology: data.topology || 'mesh',
      agentCount: data.agentCount || 0,
      activeAgents: data.activeAgents || 0,
      taskQueue: data.taskQueue || 0,
      performance: data.performance || this.initializeSwarmPerformance(),
      lastHeartbeat: new Date(),
      location: data.location,
    };

    this.hiveRegistry.activeSwarms.set(data.swarmId, swarmInfo);
    this.connectionHealth.set(data.swarmId, 100);

    this.logger?.info('Swarm registered with hive', { swarmId: data.swarmId });
    this.emit('swarm:registered', { swarmId: data.swarmId, swarmInfo });
  }

  /**
   * Register a new agent with the hive
   */
  private registerAgent(data: any): void {
    const agentInfo: GlobalAgentInfo = {
      ...data.agentState,
      swarmId: data.swarmId,
      hiveMindId: data.hiveMindId || 'default',
      availability: data.availability || {
        status: 'available',
        currentTasks: 0,
        maxConcurrentTasks: 5,
      },
      lastSync: new Date(),
      networkLatency: data.networkLatency || 50,
    };

    this.hiveRegistry.availableAgents.set(data.agentState.id, agentInfo);

    this.logger?.debug('Agent registered with hive', {
      agentId: data.agentState.id,
      swarmId: data.swarmId,
    });
  }

  /**
   * Update agent state in hive registry
   */
  private updateAgentState(data: any): void {
    const agent = this.hiveRegistry.availableAgents.get(data.agentId);
    if (agent) {
      Object.assign(agent, data.updates);
      agent.lastSync = new Date();
    }
  }

  /**
   * Handle swarm heartbeat
   */
  private handleSwarmHeartbeat(data: any): void {
    const swarm = this.hiveRegistry.activeSwarms.get(data.swarmId);
    if (swarm) {
      swarm.lastHeartbeat = new Date();
      swarm.agentCount = data.agentCount || swarm.agentCount;
      swarm.activeAgents = data.activeAgents || swarm.activeAgents;
      swarm.taskQueue = data.taskQueue || swarm.taskQueue;

      this.connectionHealth.set(data.swarmId, 100);
    }
  }

  /**
   * Handle task completion
   */
  private handleTaskCompletion(data: any): void {
    // Remove from task assignments
    this.hiveRegistry.taskAssignments.delete(data.taskId);

    // Update agent availability
    const agent = this.hiveRegistry.availableAgents.get(data.agentId);
    if (agent) {
      agent.currentWorkload = Math.max(0, agent.currentWorkload - 1);
      if (agent.currentWorkload === 0) {
        agent.availability.status = 'available';
      }
    }
  }

  /**
   * Handle swarm disconnection
   */
  private handleSwarmDisconnect(data: any): void {
    // Remove swarm
    this.hiveRegistry.activeSwarms.delete(data.swarmId);
    this.connectionHealth.delete(data.swarmId);

    // Remove agents from this swarm
    for (const [agentId, agent] of this.hiveRegistry.availableAgents) {
      if (agent.swarmId === data.swarmId) {
        this.hiveRegistry.availableAgents.delete(agentId);
      }
    }

    this.logger?.warn('Swarm disconnected from hive', { swarmId: data.swarmId });
    this.emit('swarm:disconnected', { swarmId: data.swarmId });
  }

  /**
   * Get current hive status
   */
  getHiveStatus(): HiveStatus {
    return {
      totalSwarms: this.hiveRegistry.activeSwarms.size,
      totalAgents: this.hiveRegistry.availableAgents.size,
      availableAgents: Array.from(this.hiveRegistry.availableAgents.values()).filter(
        (a) => a.availability.status === 'available'
      ).length,
      busyAgents: Array.from(this.hiveRegistry.availableAgents.values()).filter(
        (a) => a.availability.status === 'busy'
      ).length,
      pendingTasks: this.hiveRegistry.globalTaskQueue.length,
      globalResources: this.hiveRegistry.globalResources,
      hiveHealth: this.hiveRegistry.hiveHealth,
      swarmHealthScores: Object.fromEntries(this.connectionHealth),
    };
  }

  // Utility methods
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }

  private initializeGlobalResources(): GlobalResourceMetrics {
    return {
      totalCPU: 0,
      usedCPU: 0,
      totalMemory: 0,
      usedMemory: 0,
      totalAgents: 0,
      availableAgents: 0,
      busyAgents: 0,
      networkBandwidth: 0,
    };
  }

  private initializeHiveHealth(): HiveHealthMetrics {
    return {
      overallHealth: 100,
      consensus: 100,
      synchronization: 100,
      faultTolerance: 100,
      loadBalance: 100,
    };
  }

  private initializeSwarmPerformance(): SwarmPerformanceMetrics {
    return {
      averageResponseTime: 0,
      tasksCompletedPerMinute: 0,
      successRate: 1.0,
      resourceEfficiency: 1.0,
      qualityScore: 0,
    };
  }
}

// Supporting interfaces
interface Task {
  id: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedAgent?: string;
  requiredCapabilities?: string[];
  estimatedDuration?: number;
  deadline?: Date;
}

interface HiveStatus {
  totalSwarms: number;
  totalAgents: number;
  availableAgents: number;
  busyAgents: number;
  pendingTasks: number;
  globalResources: GlobalResourceMetrics;
  hiveHealth: HiveHealthMetrics;
  swarmHealthScores: Record<string, number>;
}

export default HiveSwarmCoordinator;
