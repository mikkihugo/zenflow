/**
 * THE COLLECTIVE Cube Synchronization System.
 *
 * Maintains real-time awareness between distributed cubes and THE COLLECTIVE central hub.
 * Ensures all cubes know about available agents, task distribution, and collective state.
 *
 * Borg Architecture: THE COLLECTIVE ↔ CUBES ↔ SWARMS ↔ DRONES
 */
/**
 * @file THE COLLECTIVE coordination system: collective-cube-sync.
 */

import { EventEmitter } from 'eventemitter3';
import type { EventBus, Logger } from '../core/interfaces/base-interfaces';
import type { CollectiveFACTSystemInterface } from './shared-types';

// Type alias for backward compatibility
type CollectiveFACTSystem = CollectiveFACTSystemInterface;

import type {
  CollectiveHealthMetrics,
  Task as CollectiveTask,
  CubeInfo,
  CubePerformanceMetrics,
  GlobalAgentInfo,
  GlobalResourceMetrics,
} from './collective-types';

export interface CollectiveRegistry {
  // Global drone registry
  availableDrones: Map<string, GlobalAgentInfo>;

  // Cube registry
  activeCubes: Map<string, CubeInfo>;

  // Task distribution info
  globalTaskQueue: CollectiveTask[];
  taskAssignments: Map<string, string>; // taskId -> droneId

  // Resource utilization
  globalResources: GlobalResourceMetrics;

  // Collective health
  collectiveHealth: CollectiveHealthMetrics;
}

// Import CollectiveFACT from integration module
import { initializeCoordinationFactSystem as initializeCollectiveFACT } from './shared-fact-system';

/**
 * Central COLLECTIVE synchronization coordinator.
 *
 * THE COLLECTIVE serves as the neural hub coordinating all Cubes, Queens, and Drones.
 *
 * @example
 */
export class CollectiveCubeCoordinator extends EventEmitter {
  private collectiveRegistry: CollectiveRegistry;
  private syncInterval: number = 3000; // 3 seconds
  private heartbeatInterval: number = 1000; // 1 second

  private syncTimer: NodeJS.Timeout | undefined;
  private heartbeatTimer: NodeJS.Timeout | undefined;
  private connectionHealth = new Map<string, number>(); // swarmId -> health score
  private collectiveFact: CollectiveFACTSystem | undefined;

  constructor(
    private eventBus: EventBus,
    private logger?: Logger
  ) {
    super();

    this.collectiveRegistry = {
      availableDrones: new Map(),
      activeCubes: new Map(),
      globalTaskQueue: [],
      taskAssignments: new Map(),
      globalResources: this.initializeGlobalResources(),
      collectiveHealth: this.initializeCollectiveHealth(),
    };

    this.setupEventHandlers();
  }

  /**
   * Initialize the hive coordinator.
   * Required by HiveSwarmCoordinatorInterface.
   */
  async initialize(): Promise<void> {
    await this.start();
  }

  /**
   * Start hive-swarm synchronization.
   */
  async start(): Promise<void> {
    this.logger?.info('Starting collective-cube coordination');

    // Initialize HiveFACT system for universal knowledge
    try {
      this.collectiveFact = await initializeCollectiveFACT(
        {
          enableCache: true,
          cacheSize: 10000,
          knowledgeSources: ['context7', 'deepwiki', 'gitmcp', 'semgrep'],
          autoRefreshInterval: 3600000, // 1 hour
        },
        this
      );

      this.logger?.info('HiveFACT system initialized for universal knowledge');
    } catch (error) {
      this.logger?.error('Failed to initialize HiveFACT:', error);
    }

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
   * Shutdown the hive coordinator.
   * Required by HiveSwarmCoordinatorInterface.
   */
  async shutdown(): Promise<void> {
    await this.stop();
  }

  /**
   * Stop hive-swarm synchronization.
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

    // Shutdown CollectiveFACT
    if (this.collectiveFact) {
      await this.collectiveFact.shutdown?.();
      this.collectiveFact = undefined;
    }

    this.emit('hive:coordination:stopped');
  }

  /**
   * Core hive synchronization process.
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
      this.logger?.error('Hive sync cycle failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      this.emit('hive:sync:failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Collect agent states from all active swarms.
   */
  private async collectAgentStates(): Promise<void> {
    // Request agent states from all swarms
    (this.eventBus as any).emit('hive:request:agent_states', {
      timestamp: Date.now(),
      requestId: this.generateRequestId(),
    });

    // States will be updated via event handlers
  }

  /**
   * Update global resource metrics.
   */
  private async updateGlobalResources(): Promise<void> {
    const agents = Array.from(this.collectiveRegistry.availableDrones.values());

    this.collectiveRegistry.globalResources = {
      totalCPU: agents.reduce((sum, _agent) => sum + 100, 0), // Assume 100% per agent
      usedCPU: agents.reduce(
        (sum, agent) => sum + (agent.metrics?.cpuUsage ?? 0),
        0
      ),
      totalMemory: agents.reduce((sum, _agent) => sum + 1000, 0), // Assume 1GB per agent
      usedMemory: agents.reduce(
        (sum, agent) => sum + ((agent as any).metrics?.memoryUsage ?? 0),
        0
      ),
      totalAgents: agents.length,
      availableAgents: agents.filter(
        (a) => (a as any).availability?.status === 'available'
      ).length,
      busyAgents: agents.filter((a) => (a as any).availability?.status === 'busy').length,
      networkBandwidth: 1000, // Placeholder
    };
  }

  /**
   * Intelligent task distribution across swarms.
   */
  private async optimizeTaskDistribution(): Promise<void> {
    const pendingTasks = this.collectiveRegistry.globalTaskQueue.filter(
      (t: any) => t.assignedAgents?.length === 0
    );
    const availableAgents = Array.from(
      this.collectiveRegistry.availableDrones.values()
    )
      .filter((agent: any) => agent.availability?.status === 'available')
      .sort((a: any, b: any) => a.currentWorkload - b.currentWorkload); // Least loaded first

    for (const task of pendingTasks) {
      const suitableAgent = this.findBestAgentForTask(
        task,
        availableAgents
      ) as any as any as any as any;

      if (suitableAgent) {
        // Assign task to agent
        this.collectiveRegistry.taskAssignments.set(task.id, (suitableAgent as any).id);
        (suitableAgent as any).availability.status = 'busy';
        (suitableAgent as any).currentWorkload++;

        // Notify the swarm about task assignment
        (this.eventBus as any).emit('hive:task:assigned', {
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
   * Find the best agent for a specific task.
   *
   * @param task
   * @param availableAgents
   */
  private findBestAgentForTask(
    task: CollectiveTask,
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
   * Calculate how well an agent matches a task.
   *
   * @param agent
   * @param task
   */
  private calculateAgentTaskScore(
    agent: GlobalAgentInfo,
    task: CollectiveTask
  ): number {
    let score = 0;

    // Capability matching (40% of score)
    const requiredCapabilities = task.requirements.capabilities || [];
    const agentCapabilities = agent.capabilities.map((c) => c.type);
    const capabilityMatch =
      requiredCapabilities.filter((req) => agentCapabilities.includes(req))
        .length / Math.max(requiredCapabilities.length, 1);
    score += capabilityMatch * 0.4;

    // Workload balance (30% of score)
    const workloadScore =
      1 - agent.currentWorkload / agent.availability.maxConcurrentTasks;
    score += workloadScore * 0.3;

    // Network latency (20% of score)
    const latencyScore = Math.max(0, 1 - agent.networkLatency / 1000); // Lower latency = higher score
    score += latencyScore * 0.2;

    // Agent performance history (10% of score)
    const performanceScore = agent.metrics?.successRate || 0;
    score += performanceScore * 0.1;

    return Math.min(score, 1.0);
  }

  /**
   * Balance workloads across swarms.
   */
  private async balanceWorkloads(): Promise<void> {
    const swarms = Array.from(this.collectiveRegistry.activeCubes.values());
    const averageWorkload =
      swarms.reduce((sum, s: any) => sum + (s.taskQueue || 0), 0) / swarms.length;

    for (const swarm of swarms) {
      if ((swarm as any).taskQueue > averageWorkload * 1.5) {
        // Swarm is overloaded - suggest task redistribution
        (this.eventBus as any).emit('hive:load:rebalance', {
          overloadedSwarmId: (swarm as any).id,
          currentLoad: (swarm as any).taskQueue,
          suggestedReduction: (swarm as any).taskQueue - averageWorkload,
        });
      }
    }
  }

  /**
   * Update swarm performance metrics.
   */
  private async updateSwarmMetrics(): Promise<void> {
    for (const [swarmId, swarmInfo] of this.collectiveRegistry.activeCubes) {
      const swarmAgents = Array.from(
        this.collectiveRegistry.availableDrones.values()
      ).filter((agent: any) => agent.swarmId === swarmId);

      if (swarmAgents.length > 0) {
        (swarmInfo as any).performance = {
          averageResponseTime:
            swarmAgents.reduce(
              (sum, a: any) => sum + (a.metrics?.responseTime ?? 0),
              0
            ) / swarmAgents.length,
          tasksCompletedPerMinute: swarmAgents.reduce(
            (sum, a: any) => sum + (a.metrics?.tasksCompleted ?? 0),
            0
          ),
          successRate:
            swarmAgents.reduce(
              (sum, a: any) => sum + (a.metrics?.successRate ?? 0),
              0
            ) / swarmAgents.length,
          resourceEfficiency:
            1 -
            swarmAgents.reduce(
              (sum, a: any) => sum + (a.metrics?.cpuUsage ?? 0),
              0
            ) /
              swarmAgents.length /
              100,
          qualityScore:
            swarmAgents.reduce(
              (sum, a: any) => sum + (a.metrics?.codeQuality ?? 0),
              0
            ) / swarmAgents.length,
        };
      }
    }
  }

  /**
   * Broadcast global state to all swarms.
   */
  private async broadcastGlobalState(): Promise<void> {
    const globalState = {
      timestamp: Date.now(),
      availableAgents: this.collectiveRegistry.availableDrones.size,
      activeSwarms: this.collectiveRegistry.activeCubes.size,
      globalResources: this.collectiveRegistry.globalResources,
      hiveHealth: this.collectiveRegistry.collectiveHealth,
      taskDistribution: Array.from(this.collectiveRegistry.taskAssignments.entries()),
    };

    (this.eventBus as any).emit('hive:global:state', globalState);
  }

  /**
   * Send heartbeat to all swarms.
   */
  private sendHeartbeats(): void {
    (this.eventBus as any).emit('hive:heartbeat', {
      timestamp: Date.now(),
      hiveHealth: this.collectiveRegistry.collectiveHealth.overallStatus,
      activeSwarms: this.collectiveRegistry.activeCubes.size,
      availableAgents: this.collectiveRegistry.availableDrones.size,
    });
  }

  /**
   * Check health of all swarms.
   */
  private checkSwarmHealth(): void {
    const now = Date.now();
    const healthThreshold = 30000; // 30 seconds

    for (const [swarmId, swarmInfo] of this.collectiveRegistry.activeCubes) {
      const timeSinceHeartbeat = now - ((swarmInfo as any).lastHeartbeat?.getTime() || now);

      if (timeSinceHeartbeat > healthThreshold) {
        this.connectionHealth.set(swarmId, 0);
        this.logger?.warn('Swarm health degraded - no recent heartbeat', {
          swarmId,
        });

        (this.eventBus as any).emit('hive:swarm:unhealthy', {
          swarmId,
          lastHeartbeat: (swarmInfo as any).lastHeartbeat,
          timeSinceHeartbeat,
        });
      } else {
        const healthScore = Math.max(0, 100 - timeSinceHeartbeat / 1000);
        this.connectionHealth.set(swarmId, healthScore);
      }
    }
  }

  /**
   * Update overall hive health metrics.
   */
  private updateHiveHealth(): void {
    const swarms = Array.from(this.collectiveRegistry.activeCubes.values());
    const agents = Array.from(this.collectiveRegistry.availableDrones.values());

    if (swarms.length === 0 || agents.length === 0) {
      this.collectiveRegistry.collectiveHealth =
        this.initializeCollectiveHealth();
      return;
    }

    // Calculate overall health
    const avgSwarmHealth =
      Array.from(this.connectionHealth.values()).reduce(
        (sum, health) => sum + health,
        0
      ) / this.connectionHealth.size;

    // Calculate consensus (how well swarms agree on global state)
    const consensus = 85; // Placeholder - would measure actual consensus

    // Calculate synchronization (how up-to-date everything is)
    const avgSyncAge =
      agents.reduce((sum, a) => sum + (Date.now() - ((a as any).lastSync?.getTime() || 0)), 0) /
      agents.length;
    const synchronization = Math.max(0, 100 - avgSyncAge / 1000 / 60); // Degrade after 1 minute

    // Calculate fault tolerance
    const faultTolerance = Math.min(
      100,
      (agents.length / Math.max(swarms.length, 1)) * 10
    ); // More agents per swarm = better

    // Calculate load balance
    const swarmLoads = swarms.map((s) => (s as any).taskQueue || 0);
    const avgLoad =
      swarmLoads.reduce((sum, load) => sum + load, 0) / swarmLoads.length;
    const maxDeviation = Math.max(
      ...swarmLoads.map((load) => Math.abs(load - avgLoad))
    );
    const loadBalance = Math.max(
      0,
      100 - (maxDeviation / Math.max(avgLoad, 1)) * 100
    );

    this.collectiveRegistry.collectiveHealth = {
      overallStatus: (avgSwarmHealth + consensus + synchronization + faultTolerance + loadBalance) / 5 > 80 ? 'optimal' : 'degraded',
      activeCubes: this.collectiveRegistry.activeCubes.size,
      totalDrones: this.collectiveRegistry.availableDrones.size,
      totalQueens: 0,
      totalMatrons: 0,
      systemLoad: (avgSwarmHealth + consensus + synchronization + faultTolerance + loadBalance) / 500,
      consensusHealth: consensus / 100,
      networkLatency: 50,
      lastAssimilation: new Date(),
      borgEfficiency: Math.min(1.0, (avgSwarmHealth + consensus + synchronization + faultTolerance + loadBalance) / 500),
    };
  }

  /**
   * Set up event handlers for hive-swarm communication.
   */
  private setupEventHandlers(): void {
    // Handle swarm registration
    (this.eventBus as any).on('swarm:register', (data: unknown) => {
      this.registerSwarmLegacy(data);
    });

    // Handle agent registration
    (this.eventBus as any).on('agent:register', (data: unknown) => {
      this.registerAgent(data);
    });

    // Handle agent state updates
    (this.eventBus as any).on('agent:state:update', (data: unknown) => {
      this.updateAgentState(data);
    });

    // Handle swarm heartbeats
    (this.eventBus as any).on('swarm:heartbeat', (data: unknown) => {
      this.handleSwarmHeartbeat(data);
    });

    // Handle task completions
    this.eventBus.on('task:completed', (data) => {
      this.handleTaskCompletion(data);
    });

    // Handle swarm disconnection
    (this.eventBus as any).on('swarm:disconnect', (data: unknown) => {
      this.handleSwarmDisconnect(data);
    });

    // Handle FACT requests from swarms
    (this.eventBus as any).on('swarm:fact:request', async (data: unknown) => {
      try {
        const result = await this.requestUniversalFact(
          (data as any)?.swarmId,
          (data as any)?.factType,
          (data as any)?.subject
        );

        (this.eventBus as any).emit('swarm:fact:response', {
          requestId: (data as any)?.requestId,
          swarmId: (data as any)?.swarmId,
          factType: (data as any)?.factType,
          subject: (data as any)?.subject,
          content: result,
          success: true,
        });
      } catch (error) {
        (this.eventBus as any).emit('swarm:fact:response', {
          requestId: (data as any)?.requestId,
          swarmId: (data as any)?.swarmId,
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false,
        });
      }
    });

    // Handle FACT updates from HiveFACT
    if (this.collectiveFact) {
      (this.collectiveFact as any).on('fact-updated', (data: unknown) => {
        // Notify all swarms about updated facts
        (this.eventBus as any).emit('hive:fact:updated', data);
      });

      (this.collectiveFact as any).on('fact-refreshed', (data: unknown) => {
        // Notify interested swarms about refreshed facts
        (this.eventBus as any).emit('hive:fact:refreshed', data);
      });
    }
  }

  /**
   * Register a new swarm with the hive.
   *
   * @param data
   */
  private registerSwarmLegacy(data: unknown): void {
    const swarmInfo: any = {
      id: (data as any)?.swarmId,
      hiveMindId: (data as any)?.hiveMindId || 'default',
      topology: (data as any)?.topology || 'mesh',
      agentCount: (data as any)?.agentCount || 0,
      activeAgents: (data as any)?.activeAgents || 0,
      taskQueue: (data as any)?.taskQueue || 0,
      performance: (data as any)?.performance || this.initializeSwarmPerformance(),
      lastHeartbeat: new Date(),
      location: (data as any)?.location,
    };

    this.collectiveRegistry.activeCubes.set((data as any)?.swarmId, swarmInfo);
    this.connectionHealth.set((data as any)?.swarmId, 100);

    this.logger?.info('Swarm registered with hive', { swarmId: (data as any)?.swarmId });
    this.emit('swarm:registered', { swarmId: (data as any)?.swarmId, swarmInfo });
  }

  /**
   * Register a new agent with the hive.
   *
   * @param data
   */
  private registerAgent(data: unknown): void {
    const agentInfo: GlobalAgentInfo = {
      ...(data as any)?.agentState,
      swarmId: (data as any)?.swarmId,
      hiveMindId: (data as any)?.hiveMindId || 'default',
      availability: (data as any)?.availability || {
        status: 'available',
        currentTasks: 0,
        maxConcurrentTasks: 5,
      },
      lastSync: new Date(),
      networkLatency: (data as any)?.networkLatency || 50,
    };

    this.collectiveRegistry.availableDrones.set((data as any)?.agentState?.id, agentInfo);

    this.logger?.debug('Agent registered with hive', {
      agentId: (data as any)?.agentState?.id,
      swarmId: (data as any)?.swarmId,
    });
  }

  /**
   * Update agent state in hive registry.
   *
   * @param data
   */
  private updateAgentState(data: unknown): void {
    const agent = this.collectiveRegistry.availableDrones.get((data as any)?.agentId);
    if (agent) {
      Object.assign(agent, (data as any)?.updates);
      (agent as any).lastSync = new Date();
    }
  }

  /**
   * Handle swarm heartbeat.
   *
   * @param data
   */
  private handleSwarmHeartbeat(data: unknown): void {
    const swarm = this.collectiveRegistry.activeCubes.get((data as any)?.swarmId);
    if (swarm) {
      (swarm as any).lastHeartbeat = new Date();
      (swarm as any).agentCount = (data as any)?.agentCount || (swarm as any).agentCount;
      (swarm as any).activeAgents = (data as any)?.activeAgents || (swarm as any).activeAgents;
      (swarm as any).taskQueue = (data as any)?.taskQueue || (swarm as any).taskQueue;

      this.connectionHealth.set((data as any)?.swarmId, 100);
    }
  }

  /**
   * Handle task completion.
   *
   * @param data
   */
  private handleTaskCompletion(data: unknown): void {
    // Remove from task assignments
    this.collectiveRegistry.taskAssignments.delete((data as any)?.taskId);

    // Update agent availability
    const agent = this.collectiveRegistry.availableDrones.get((data as any)?.agentId);
    if (agent) {
      (agent as any).currentWorkload = Math.max(0, (agent as any).currentWorkload - 1);
      if ((agent as any).currentWorkload === 0) {
        agent.availability.status = 'available';
      }
    }
  }

  /**
   * Handle swarm disconnection.
   *
   * @param data
   */
  private handleSwarmDisconnect(data: unknown): void {
    // Remove swarm
    this.collectiveRegistry.activeCubes.delete((data as any)?.swarmId);
    this.connectionHealth.delete((data as any)?.swarmId);

    // Remove agents from this swarm
    for (const [agentId, agent] of this.collectiveRegistry.availableDrones) {
      if (agent.swarmId === (data as any)?.swarmId) {
        this.collectiveRegistry.availableDrones.delete(agentId);
      }
    }

    this.logger?.warn('Swarm disconnected from hive', {
      swarmId: (data as any)?.swarmId,
    });
    this.emit('swarm:disconnected', { swarmId: (data as any)?.swarmId });
  }

  /**
   * Get current hive status.
   */
  getHiveStatus(): any {
    return {
      totalSwarms: this.collectiveRegistry.activeCubes.size,
      totalAgents: this.collectiveRegistry.availableDrones.size,
      availableAgents: Array.from(
        this.collectiveRegistry.availableDrones.values()
      ).filter((a) => a.availability.status === 'available').length,
      busyAgents: Array.from(this.collectiveRegistry.availableDrones.values()).filter(
        (a) => a.availability.status === 'busy'
      ).length,
      pendingTasks: this.collectiveRegistry.globalTaskQueue.length,
      globalResources: this.collectiveRegistry.globalResources,
      hiveHealth: this.collectiveRegistry.collectiveHealth,
      swarmHealthScores: Object.fromEntries(this.connectionHealth),
    };
  }

  /**
   * Get HiveFACT system for universal knowledge access.
   */
  getHiveFACT(): any | undefined {
    return this.collectiveFact;
  }

  /**
   * Request universal fact from HiveFACT
   * Used by swarms to access universal knowledge.
   *
   * @param swarmId
   * @param factType
   * @param subject
   */
  async requestUniversalFact(
    swarmId: string,
    factType:
      | 'npm-package'
      | 'github-repo'
      | 'api-docs'
      | 'security-advisory'
      | 'general',
    subject: string
  ): Promise<unknown> {
    if (!this.collectiveFact) {
      throw new Error('CollectiveFACT not initialized');
    }

    const fact = await this.collectiveFact.getFact?.(factType, subject, swarmId);

    if (fact) {
      this.logger?.debug('Universal fact requested', {
        swarmId,
        factType,
        subject,
        accessCount: fact.accessCount,
        swarmsUsing: fact.swarmAccess.size,
      });

      return fact.content;
    }

    return null;
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

  private initializeCollectiveHealth(): CollectiveHealthMetrics {
    return {
      overallStatus: 'optimal',
      activeCubes: 0,
      totalDrones: 0,
      totalQueens: 0,
      totalMatrons: 0,
      systemLoad: 0,
      consensusHealth: 1.0,
      networkLatency: 0,
      lastAssimilation: new Date(),
      borgEfficiency: 1.0,
    };
  }

  private initializeSwarmPerformance(): CubePerformanceMetrics {
    return {
      tasksCompleted: 0,
      avgProcessingTime: 0,
      errorRate: 0,
      resourceUtilization: 0,
      efficiency: 1.0,
      borgRating: 'optimal',
    };
  }

  // Interface compatibility methods required by HiveSwarmCoordinatorInterface

  /**
   * Register a swarm with the hive coordinator.
   */
  async registerSwarm(swarmInfo: any): Promise<void> {
    this.collectiveRegistry.activeCubes.set(swarmInfo.id, swarmInfo);
    this.logger?.info(`Registered swarm: ${swarmInfo.id}`);
    this.emit('swarm:registered', swarmInfo);
  }

  /**
   * Unregister a swarm from the hive coordinator.
   */
  async unregisterSwarm(swarmId: string): Promise<void> {
    const swarmInfo = this.collectiveRegistry.activeCubes.get(swarmId);
    if (swarmInfo) {
      this.collectiveRegistry.activeCubes.delete(swarmId);
      this.logger?.info(`Unregistered swarm: ${swarmId}`);
      this.emit('swarm:unregistered', swarmInfo);
    }
  }

  /**
   * Get information about a specific swarm.
   */
  async getSwarmInfo(swarmId: string): Promise<any | null> {
    return this.collectiveRegistry.activeCubes.get(swarmId) || null;
  }

  /**
   * Get information about all registered swarms.
   */
  async getAllSwarms(): Promise<any[]> {
    return Array.from(this.collectiveRegistry.activeCubes.values());
  }

  /**
   * Distribute a task across the swarm network.
   */
  async distributeTask(task: CollectiveTask): Promise<void> {
    this.collectiveRegistry.globalTaskQueue.push(task);
    await this.optimizeTaskDistribution();
    this.emit('task:distributed', task);
  }

  /**
   * Get list of all global agents.
   */
  async getGlobalAgents(): Promise<GlobalAgentInfo[]> {
    return Array.from(this.collectiveRegistry.availableDrones.values());
  }

  /**
   * Get hive health metrics.
   */
  async getCollectiveHealth(): Promise<CollectiveHealthMetrics> {
    return this.collectiveRegistry.collectiveHealth;
  }

  /**
   * Get metrics for a specific swarm.
   */
  async getSwarmMetrics(swarmId: string): Promise<CubePerformanceMetrics> {
    const swarm = this.collectiveRegistry.activeCubes.get(swarmId);
    return swarm?.performance || this.initializeSwarmPerformance();
  }

  /**
   * Get global resource metrics.
   */
  async getGlobalResourceMetrics(): Promise<GlobalResourceMetrics> {
    return this.collectiveRegistry.globalResources;
  }

  /**
   * Notify about FACT updates (optional interface method).
   */
  notifyFACTUpdate?(fact: unknown): void {
    this.emit('fact:updated', fact);
  }

  /**
   * Request FACT search (optional interface method).
   */
  async requestFACTSearch?(query: unknown): Promise<any[]> {
    if (this.collectiveFact) {
      return await this.collectiveFact.searchFacts?.(query) || [];
    }
    return [];
  }
}

// Supporting interfaces
interface HiveStatus {
  totalSwarms: number;
  totalAgents: number;
  availableAgents: number;
  busyAgents: number;
  pendingTasks: number;
  globalResources: GlobalResourceMetrics;
  hiveHealth: CollectiveHealthMetrics;
  swarmHealthScores: Record<string, number>;
}

export default CollectiveCubeCoordinator;
