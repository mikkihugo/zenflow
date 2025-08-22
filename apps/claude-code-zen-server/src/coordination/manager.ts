/**
 * Coordination Manager - Agent coordination and swarm management
 * Handles agent lifecycle, communication, and task distribution.
 * Following Google TypeScript standards with strict typing.
 *
 * Integrates comprehensive @claude-zen packages for enhanced coordination:
 * - @claude-zen/foundation: Core infrastructure, logging, telemetry
 * - @claude-zen/infrastructure: Type-safe event-driven coordination
 * - @claude-zen/intelligence: Intelligent agent selection and resource optimization
 * - @claude-zen/intelligence: Agent health monitoring and task prediction
 * - @claude-zen/neural-ml: High-performance neural computing for agent optimization
 * - @claude-zen/ai-safety: Safety protocols and deception detection
 * - @claude-zen/intelligence: Multi-agent collaboration patterns
 * - @claude-zen/chaos-engineering: System resilience testing
 */
/**
 * @file Coordination system: manager.
 */

import {
  getLogger,
  createCircuitBreaker,
  withRetry,
} from '@claude-zen/foundation';
import type { EventBus, Logger } from '@claude-zen/intelligence';
import {
  getLoadBalancer,
  TypedEventBus,
  createEventBus,
  NeuralML,
  AdaptiveOptimizer,
  NeuralForecastingEngine,
  AISafetyOrchestrator,
  SafetyProtocols,
  CORE_TOKENS,
  inject,
  injectable,
} from '@claude-zen/intelligence';
import { getPerformanceTracker, getChaosEngine } from '@claude-zen/operations';

export interface CoordinationConfig {
  maxAgents: number;
  heartbeatInterval: number;
  timeout: number;
  enableHealthCheck?: boolean;
  // AI-powered coordination features
  enableNeuralOptimization?: boolean;
  enableSafetyMonitoring?: boolean;
  enableLoadBalancing?: boolean;
  enableChaosEngineering?: boolean;
  enableTeamworkPatterns?: boolean;
  // Performance and monitoring
  enableTelemetry?: boolean;
  enableResilience?: boolean;
}

export interface Agent {
  id: string;
  type: string;
  status: 'idle | busy' | 'error | offline';
  capabilities: string[];
  lastHeartbeat: Date;
  taskCount: number;
  created: Date;
  // AI-powered agent features
  healthScore?: number;
  performancePrediction?: number;
  neuralOptimizationLevel?: number;
  safetyRating?: number;
  collaborationRating?: number;
  resilienceScore?: number;
}

export interface Task {
  id: string;
  type: string;
  priority: number;
  assignedAgent?: string;
  status: 'pending | assigned' | 'running | completed' | 'failed';
  created: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Coordination Manager for agent and task management with comprehensive AI integration.
 *
 * @example
 */
@injectable
export class CoordinationManager extends TypedEventBus {
  private config: Required<CoordinationConfig>;
  private agents = new Map<string, Agent>();
  private tasks = new Map<string, Task>();
  private heartbeatTimer?: NodeJS.Timeout;
  private isRunning = false;

  // 🧠 AI-POWERED COORDINATION SYSTEMS
  private foundationLogger = getLogger('CoordinationManager');
  private eventBus: TypedEventBus;
  private loadBalancer: any;
  private agentMonitoring: any;
  private intelligenceSystem: any;
  private taskPredictor: any;
  private neuralML: NeuralML;
  private adaptiveOptimizer: AdaptiveOptimizer;
  private neuralForecasting: NeuralForecastingEngine;
  private aiSafety: AISafetyOrchestrator;
  private safetyProtocols: SafetyProtocols;
  private teamwork: Teamwork;
  private conversationOrchestrator: ConversationOrchestrator;
  private teamworkSystem: TeamworkSystem;
  private chaosEngineering: any;
  private circuitBreaker = createCircuitBreaker({
    timeout: 30000,
    errorThresholdPercentage: 50,
    resetTimeout: 60000,
  });

  constructor(
    config: CoordinationConfig,
    @inject(CORE_TOKENS.Logger) private _logger: Logger,
    @inject(CORE_TOKENS.EventBus) private _eventBus: EventBus
  ) {
    super();

    this.config = {
      maxAgents: config?.maxAgents,
      heartbeatInterval: config?.heartbeatInterval,
      timeout: config?.timeout,
      enableHealthCheck: config?.enableHealthCheck !== false,
      enableNeuralOptimization: config?.enableNeuralOptimization !== false,
      enableSafetyMonitoring: config?.enableSafetyMonitoring !== false,
      enableLoadBalancing: config?.enableLoadBalancing !== false,
      enableChaosEngineering: config?.enableChaosEngineering !== false,
      enableTeamworkPatterns: config?.enableTeamworkPatterns !== false,
      enableTelemetry: config?.enableTelemetry !== false,
      enableResilience: config?.enableResilience !== false,
    };

    this.initializeAISystems;
    this.setupEventHandlers;
    this._logger.info('CoordinationManager initialized');
    this.foundationLogger.info(
      '🧠 AI-powered coordination manager initialized with comprehensive package integration'
    );
  }

  /**
   * Initialize all AI-powered coordination systems.
   */
  private async initializeAISystems(): Promise<void> {
    try {
      // Initialize event system for type-safe coordination
      this.eventBus = createEventBus();

      // Initialize load balancing for intelligent agent selection
      if (this.config.enableLoadBalancing) {
        this.loadBalancer = await getLoadBalancer({
          strategy: 'ml-predictive',
          enablePredictiveAnalytics: true,
          enableCapacityManagement: true,
        });
      }

      // Initialize agent monitoring for health and performance prediction
      this.agentMonitoring = await getPerformanceTracker();
      this.intelligenceSystem = {}; // Placeholder for facade integration
      this.taskPredictor = {}; // Placeholder for facade integration
      await Promise.all([
        this.agentMonitoring?.initialize,
        this.intelligenceSystem?.initialize,
        this.taskPredictor?.initialize,
      ]);

      // Initialize neural ML for high-performance optimization
      if (this.config.enableNeuralOptimization) {
        this.neuralML = new NeuralML({ enableRustBackend: true });
        this.adaptiveOptimizer = new AdaptiveOptimizer({
          optimizationType: 'coordination-management',
          adaptationRate: .1,
          enableRustAcceleration: true,
        });
        this.neuralForecasting = new NeuralForecastingEngine({
          enableMatrixOperations: true,
          activationFunction: 'sigmoid',
        });
        await Promise.all([
          this.neuralML?.initialize,
          this.adaptiveOptimizer?.initialize,
          this.neuralForecasting?.initialize,
        ]);
      }

      // Initialize AI safety for coordination monitoring
      if (this.config.enableSafetyMonitoring) {
        this.aiSafety = new AISafetyOrchestrator();
        this.safetyProtocols = new SafetyProtocols();
        await Promise.all([
          (this.aiSafety as any)?.startSafetyMonitoring,
          this.safetyProtocols?.initialize,
        ]);
      }

      // Initialize teamwork for multi-agent collaboration
      if (this.config.enableTeamworkPatterns) {
        this.teamwork = new Teamwork({
          multiAgentCollaboration: true,
          coordinationPatterns: true,
        });
        this.conversationOrchestrator = new ConversationOrchestrator({
          maxParticipants: this.config.maxAgents,
          enableConsensus: true,
        });
        this.teamworkSystem = new TeamworkSystem({
          collaborationEnabled: true,
          conflictResolution: true,
        });
        await Promise.all([
          this.teamwork?.initialize,
          this.conversationOrchestrator?.initialize,
          this.teamworkSystem?.initialize,
        ]);
      }

      // Initialize chaos engineering for resilience testing via operations facade
      if (this.config.enableChaosEngineering) {
        try {
          this.chaosEngineering = await getChaosEngine({
            enableChaosExperiments: true,
            enableResilienceTesting: true,
            enableFailureSimulation: true,
          });
        } catch (error) {
          this.logger.warn(
            'Chaos engineering not available, continuing without it',
            error
          );
          this.chaosEngineering = null;
        }
      }

      this.foundationLogger.info(
        '✅ All AI coordination systems initialized successfully'
      );

      if (this.config.enableTelemetry) {
        // recordMetric('coordination_ai_systems_initialized', 1, {
        this.foundationLogger.info('coordination_ai_systems_initialized', {
          loadBalancing: this.config.enableLoadBalancing,
          neuralOptimization: this.config.enableNeuralOptimization,
          safetyMonitoring: this.config.enableSafetyMonitoring,
          teamworkPatterns: this.config.enableTeamworkPatterns,
          chaosEngineering: this.config.enableChaosEngineering,
        });
      }
    } catch (error) {
      this.foundationLogger.error(
        '❌ Failed to initialize AI coordination systems:',
        error
      );
      throw error;
    }
  }

  /**
   * Start coordination services with AI-powered enhancements.
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this._logger?.info('Starting CoordinationManager...');
    this.foundationLogger.info(
      '🚀 Starting AI-powered coordination manager...'
    );

    try {
      await withTrace('coordination-manager-start', async () => {
        await (this.circuitBreaker as any).fire(async () => {
          // Initialize AI systems if not already done
          await this.initializeAISystems;

          if (this.config.enableHealthCheck) {
            this.startHeartbeatMonitoring;
          }

          // Start AI-powered event monitoring
          this.startAIEventMonitoring;

          this.isRunning = true;
          this.emit('started', { timestamp: new Date() });

          if (this.config.enableTelemetry) {
            this.foundationLogger.info('coordination_manager_started', {
              aiSystems: 'enabled',
              timestamp: Date.now(),
            });
          }
        });
      });

      this._logger?.info('CoordinationManager started');
      this.foundationLogger.info(
        '✅ AI-powered coordination manager started successfully'
      );
    } catch (error) {
      this.foundationLogger.error(
        '❌ Failed to start coordination manager:',
        error
      );
      throw error;
    }
  }

  /**
   * Stop coordination services with graceful AI system shutdown.
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this._logger?.info('Stopping CoordinationManager...');
    this.foundationLogger.info(
      '🛑 Gracefully stopping AI-powered coordination manager...'
    );

    try {
      await withTrace('coordination-manager-stop', async () => {
        // Stop heartbeat monitoring
        if (this.heartbeatTimer) {
          clearInterval(this.heartbeatTimer);
          (this as any).heartbeatTimer = undefined;
        }

        // Graceful shutdown of AI systems
        const shutdownPromises: Promise<void>[] = [];

        if (this.chaosEngineering) {
          try {
            shutdownPromises.push(this.chaosEngineering?.shutdown());
          } catch (error) {
            this.logger.warn('Chaos engineering shutdown failed', error);
          }
        }

        if (this.teamworkSystem) {
          shutdownPromises.push(this.teamworkSystem?.shutdown());
        }

        if (this.conversationOrchestrator) {
          shutdownPromises.push(this.conversationOrchestrator?.shutdown());
        }

        if (this.teamwork) {
          shutdownPromises.push(this.teamwork?.shutdown());
        }

        if (this.safetyProtocols) {
          shutdownPromises.push(this.safetyProtocols?.shutdown());
        }

        if (this.aiSafety) {
          shutdownPromises.push(this.aiSafety?.shutdown());
        }

        if (this.neuralForecasting) {
          shutdownPromises.push(this.neuralForecasting?.shutdown());
        }

        if (this.adaptiveOptimizer) {
          shutdownPromises.push(this.adaptiveOptimizer?.shutdown());
        }

        if (this.neuralML) {
          shutdownPromises.push(this.neuralML?.shutdown());
        }

        if (this.taskPredictor) {
          shutdownPromises.push(this.taskPredictor?.shutdown());
        }

        if (this.intelligenceSystem) {
          shutdownPromises.push(this.intelligenceSystem?.shutdown());
        }

        if (this.agentMonitoring) {
          shutdownPromises.push(this.agentMonitoring?.shutdown());
        }

        if (this.loadBalancer) {
          shutdownPromises.push(this.loadBalancer?.shutdown());
        }

        // Wait for all AI systems to shutdown gracefully
        await withRetry(() => Promise.all(shutdownPromises), {
          retries: 3,
          minTimeout: 1000,
        });

        this.isRunning = false;
        this.emit('stopped', { timestamp: new Date() });

        if (this.config.enableTelemetry) {
          this.foundationLogger.info('coordination_manager_stopped', {
            aiSystems: 'gracefully-shutdown',
            timestamp: Date.now(),
          });
        }
      });

      this._logger?.info('CoordinationManager stopped');
      this.foundationLogger.info(
        '✅ AI-powered coordination manager stopped gracefully'
      );
    } catch (error) {
      this.foundationLogger.error(
        '❌ Error during coordination manager shutdown:',
        error
      );
      this._logger?.error('Error stopping CoordinationManager:', error);
      throw error;
    }
  }

  /**
   * Register an agent.
   *
   * @param agentConfig
   * @param agentConfig.id
   * @param agentConfig.type
   * @param agentConfig.capabilities
   */
  async registerAgent(agentConfig: {
    id: string;
    type: string;
    capabilities: string[];
  }): Promise<void> {
    if (this.agents.size >= this.config.maxAgents) {
      throw new Error('Maximum agents limit reached');
    }

    const agent: Agent = {
      id: agentConfig?.id,
      type: agentConfig?.type,
      status: 'idle',
      capabilities: agentConfig?.capabilities,
      lastHeartbeat: new Date(),
      taskCount: 0,
      created: new Date(),
    };

    this.agents.set(agent.id, agent);
    this._logger?.info(`Agent registered: ${agent.id}`, { type: agent.type });
    this.emit('agentRegistered', agent);
  }

  /**
   * Unregister an agent.
   *
   * @param agentId
   */
  async unregisterAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return;
    }

    this.agents.delete(agentId);
    this._logger?.info(`Agent unregistered: ${agentId}`);
    this.emit('agentUnregistered', { agentId });
  }

  /**
   * Submit a task for execution.
   *
   * @param taskConfig
   * @param taskConfig.id
   * @param taskConfig.type
   * @param taskConfig.priority
   * @param taskConfig.requiredCapabilities
   * @param taskConfig.metadata
   */
  async submitTask(taskConfig: {
    id: string;
    type: string;
    priority: number;
    requiredCapabilities?: string[];
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    const task: Task = {
      id: taskConfig?.id,
      type: taskConfig?.type,
      priority: taskConfig?.priority,
      status: 'pending',
      created: new Date(),
      ...(taskConfig?.metadata && { metadata: taskConfig?.metadata }),
    };

    this.tasks.set(task.id, task);
    this._logger?.info(`Task submitted: ${task.id}`, { type: task.type });

    // Try to assign task immediately
    await this.assignTask(task, taskConfig?.requiredCapabilities || []);
  }

  /**
   * Get available agents.
   */
  getAvailableAgents(): Agent[] {
    return Array.from(this.agents?.values()).filter(
      (agent) => agent.status === 'idle || agent.status === busy'
    );
  }

  /**
   * Get agents by capability.
   *
   * @param capability
   */
  getAgentsByCapability(capability: string): Agent[] {
    return Array.from(this.agents?.values()).filter((agent) =>
      agent.capabilities.includes(capability)
    );
  }

  /**
   * Get pending tasks.
   */
  getPendingTasks(): Task[] {
    return Array.from(this.tasks?.values()).filter(
      (task) => task.status === 'pending'
    );
  }

  /**
   * Update agent heartbeat.
   *
   * @param agentId
   */
  updateAgentHeartbeat(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.lastHeartbeat = new Date();
      if (agent.status === 'offline') {
        agent.status = 'idle';
        this.emit('agentOnline', { agentId });
      }
    }
  }

  /**
   * Update task status.
   *
   * @param taskId
   * @param status
   */
  updateTaskStatus(taskId: string, status: Task['status']): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = status;
      this.emit('taskStatusChanged', { taskId, status });

      if (
        (status === 'completed || status === failed') && // Free up the assigned agent
        task.assignedAgent
      ) {
        const agent = this.agents.get(task.assignedAgent);
        if (agent && agent.status === 'busy') {
          agent.status = 'idle';
          agent.taskCount = Math.max(0, agent.taskCount - 1);
        }
      }
    }
  }

  /**
   * Get comprehensive coordination statistics with AI insights.
   */
  async getStats(): Promise<{
    totalAgents: number;
    availableAgents: number;
    busyAgents: number;
    offlineAgents: number;
    totalTasks: number;
    pendingTasks: number;
    runningTasks: number;
    completedTasks: number;
    // AI-powered statistics
    averageHealthScore?: number;
    averagePerformancePrediction?: number;
    neuralOptimizationActive?: boolean;
    safetyMonitoringActive?: boolean;
    loadBalancingActive?: boolean;
    teamworkPatternsActive?: boolean;
    chaosEngineeringActive?: boolean;
    aiSystemsStatus?: string;
  }> {
    const agents = Array.from(this.agents?.values());
    const tasks = Array.from(this.tasks?.values());

    const basicStats = {
      totalAgents: agents.length,
      availableAgents: agents.filter((a) => a.status === 'idle').length,
      busyAgents: agents.filter((a) => a.status === 'busy').length,
      offlineAgents: agents.filter((a) => a.status === 'offline').length,
      totalTasks: tasks.length,
      pendingTasks: tasks.filter((t) => t.status === 'pending').length,
      runningTasks: tasks.filter((t) => t.status === 'running').length,
      completedTasks: tasks.filter((t) => t.status === 'completed').length,
    };

    // Calculate AI-powered statistics
    const healthScores = agents
      .map((a) => a.healthScore)
      .filter((score) => score !== undefined) as number[];
    const performancePredictions = agents
      .map((a) => a.performancePrediction)
      .filter((pred) => pred !== undefined) as number[];

    const aiStats = {
      averageHealthScore:
        healthScores.length > 0
          ? healthScores.reduce((a, b) => a + b, 0) / healthScores.length
          : undefined,
      averagePerformancePrediction:
        performancePredictions.length > 0
          ? performancePredictions.reduce((a, b) => a + b, 0) /
            performancePredictions.length
          : undefined,
      neuralOptimizationActive:
        this.config.enableNeuralOptimization && !!this.neuralML,
      safetyMonitoringActive:
        this.config.enableSafetyMonitoring && !!this.aiSafety,
      loadBalancingActive:
        this.config.enableLoadBalancing && !!this.loadBalancer,
      teamworkPatternsActive:
        this.config.enableTeamworkPatterns && !!this.teamwork,
      chaosEngineeringActive:
        this.config.enableChaosEngineering && !!this.chaosEngineering,
      aiSystemsStatus: this.isRunning ? 'active : inactive',
    };

    // Record comprehensive metrics
    if (this.config.enableTelemetry) {
      this.foundationLogger.info('coordination_stats_generated', {
        totalAgents: basicStats.totalAgents,
        availableAgents: basicStats.availableAgents,
        aiSystemsActive: Object.values()(aiStats).filter(Boolean).length,
        timestamp: Date.now(),
      });
    }

    return { ...basicStats, ...aiStats };
  }

  private setupEventHandlers(): void {
    if (this._eventBus) {
      this._eventBus.on('agent:heartbeat', (data: any) => {
        this.updateAgentHeartbeat(data?.agentId);
      });

      this._eventBus.on('task:completed', (data: any) => {
        this.updateTaskStatus(data?.taskId, 'completed');
      });

      this._eventBus.on('task:failed', (data: any) => {
        this.updateTaskStatus(data?.taskId, 'failed');
      });
    }
  }

  private startHeartbeatMonitoring(): void {
    this.heartbeatTimer = setInterval(() => {
      this.checkAgentHeartbeats;
    }, this.config.heartbeatInterval);
  }

  private checkAgentHeartbeats(): void {
    const now = Date.now();
    const timeoutMs = this.config.timeout;

    for (const agent of Array.from(this.agents?.values())) {
      const lastHeartbeatTime = agent.lastHeartbeat?.getTime()
      if (now - lastHeartbeatTime > timeoutMs && agent.status !== 'offline') {
        agent.status = 'offline';
        this._logger?.warn(`Agent went offline: ${agent.id}`);
        this.emit('agentOffline', { agentId: agent.id });
      }
    }
  }

  /**
   * Start AI-powered event monitoring for enhanced coordination.
   */
  private startAIEventMonitoring(): void {
    if (!this.eventBus) return;

    // Monitor agent health with AI predictions
    this.eventBus.on('agent:health', async (data: any) => {
      if (this.agentMonitoring) {
        const healthScore = await this.agentMonitoring.assessAgentHealth(
          data.agentId
        );
        const agent = this.agents.get(data.agentId);
        if (agent) {
          agent.healthScore = healthScore;
        }
      }
    });

    // Monitor task performance with neural predictions
    this.eventBus.on('task:performance', async (data: any) => {
      if (this.taskPredictor) {
        const prediction = await this.taskPredictor.predictTaskPerformance({
          taskType: data.taskType,
          agentId: data.agentId,
          complexity: data.complexity || 'medium',
        });
        this.foundationLogger.debug(
          `Task performance prediction: ${prediction.expectedScore}`
        );
      }
    });

    // Monitor safety with AI detection
    this.eventBus.on('coordination:safety', async (data: any) => {
      if (this.safetyProtocols) {
        const safetyCheck = await (
          this.safetyProtocols as any
        ).validateCoordinationSafety(data);
        if (!safetyCheck.isSafe) {
          this.foundationLogger.warn(
            'Safety concern detected in coordination:',
            safetyCheck.concerns
          );
        }
      }
    });

    this.foundationLogger.info('🔍 AI event monitoring started');
  }

  /**
   * AI-powered task assignment with neural optimization and load balancing.
   */
  private async assignTask(
    task: Task,
    requiredCapabilities: string[]
  ): Promise<void> {
    try {
      await withTrace('task-assignment', async () => {
        // Find suitable agents with AI-enhanced filtering
        const suitableAgents = Array.from(this.agents?.values()).filter(
          (agent) =>
            agent.status === 'idle' &&
            (requiredCapabilities.length === 0 ||
              requiredCapabilities.some((cap) =>
                agent.capabilities.includes(cap)
              ))
        );

        if (suitableAgents.length === 0) {
          this._logger?.warn(`No suitable agents found for task: ${task.id}`);
          this.foundationLogger.warn(
            `📋 No suitable agents available for task ${task.id}`
          );
          return;
        }

        // AI-POWERED AGENT SELECTION with multiple optimization factors
        let selectedAgent: Agent | undefined;

        if (this.config.enableLoadBalancing && this.loadBalancer) {
          // Use AI load balancer for optimal agent selection
          const loadBalancingResult =
            await this.loadBalancer.selectOptimalAgent({
              availableAgents: suitableAgents.map((a) => ({
                id: a.id,
                currentLoad: a.taskCount,
                capabilities: a.capabilities,
                healthScore: a.healthScore || 1.0,
              })),
              taskRequirements: {
                capabilities: requiredCapabilities,
                priority: task.priority,
                estimatedDuration: 300, // 5 minutes default
              },
            });
          selectedAgent = suitableAgents.find(
            (a) => a.id === loadBalancingResult.selectedAgentId
          );
          this.foundationLogger.info(
            `🎯 Load balancer selected agent: ${selectedAgent?.id}`
          );
        }

        if (
          !selectedAgent &&
          this.config.enableNeuralOptimization &&
          this.adaptiveOptimizer
        ) {
          // Use neural ML for advanced agent selection optimization
          const features = suitableAgents.map((agent) => [
            agent.taskCount,
            agent.healthScore || 1.0,
            agent.performancePrediction || .8,
            agent.collaborationRating || .8,
            agent.resilienceScore || .8,
            requiredCapabilities.length > 0
              ? requiredCapabilities.filter((cap) =>
                  agent.capabilities.includes(cap)
                ).length / requiredCapabilities.length
              : 1.0,
            task.priority / 1.0, // Normalize priority
            Date.now() - agent.lastHeartbeat?.getTime < 60000 ? 1.0 : .5, // Recent heartbeat
            agent.capabilities.length / 1.0, // Capability diversity
            1.0 - agent.taskCount / this.config.maxAgents, // Inverse load factor
          ]);

          const optimizedSelection =
            await this.adaptiveOptimizer.optimizeSelection({
              features,
              selectionCriteria: 'coordination-agent-selection',
            });

          if (
            optimizedSelection.selectedIndex >= 0 &&
            optimizedSelection.selectedIndex < suitableAgents.length
          ) {
            selectedAgent = suitableAgents[optimizedSelection.selectedIndex];
            this.foundationLogger.info(
              `🧠 Neural optimizer selected agent: ${selectedAgent.id} (score: ${optimizedSelection.optimizationScore})`
            );
          }
        }

        if (!selectedAgent) {
          // Fallback to traditional load balancing
          suitableAgents.sort((a, b) => {
            // Multi-factor sorting: task count, health score, performance prediction
            const scoreA =
              a.taskCount * .4 +
              (1 - (a.healthScore || 1.0)) * .3 +
              (1 - (a.performancePrediction || .8)) * .3;
            const scoreB =
              b.taskCount * .4 +
              (1 - (b.healthScore || 1.0)) * .3 +
              (1 - (b.performancePrediction || .8)) * .3;
            return scoreA - scoreB;
          });
          selectedAgent = suitableAgents[0];
          this.foundationLogger.info(
            `⚖️ Traditional balancer selected agent: ${selectedAgent?.id}`
          );
        }

        if (!selectedAgent) {
          this._logger?.error(`Unexpected: No agent found after filtering`);
          this.foundationLogger.error(
            `🚨 Critical: No agent could be selected for task ${task.id}`
          );
          return;
        }

        // ASSIGN TASK with AI monitoring
        task.assignedAgent = selectedAgent.id;
        task.status = 'assigned';
        selectedAgent.status = 'busy';
        selectedAgent.taskCount++;

        // Update AI systems with assignment information
        if (this.config.enableNeuralOptimization && this.neuralForecasting) {
          // Generate neural performance forecast for this assignment
          const forecast = await this.neuralForecasting.generateForecast({
            agentId: selectedAgent.id,
            taskType: task.type,
            taskPriority: task.priority,
            historicalPerformance: selectedAgent.performancePrediction || .8,
          });
          this.foundationLogger.debug(
            `📈 Neural forecast for assignment: ${forecast.expectedPerformance}`
          );
        }

        // Safety validation
        if (this.config.enableSafetyMonitoring && this.aiSafety) {
          await (this.aiSafety as any).validateAssignment({
            taskId: task.id,
            agentId: selectedAgent.id,
            taskType: task.type,
            agentCapabilities: selectedAgent.capabilities,
          });
        }

        // Record telemetry
        if (this.config.enableTelemetry) {
          this.foundationLogger.info('task_assigned', {
            taskId: task.id,
            agentId: selectedAgent.id,
            selectionMethod: this.config.enableLoadBalancing
              ? 'ai-load-balancer'
              : this.config.enableNeuralOptimization
                ? 'neural-optimizer'
                : 'traditional',
            taskPriority: task.priority,
            agentHealthScore: selectedAgent.healthScore || 'unknown',
          });
        }

        // Emit events for coordination tracking
        this.emit('taskAssigned', {
          taskId: task.id,
          agentId: selectedAgent.id,
        });
        this.eventBus?.emit('coordination:task-assigned', {
          taskId: task.id,
          agentId: selectedAgent.id,
          timestamp: Date.now(),
          selectionOptimized:
            this.config.enableNeuralOptimization ||
            this.config.enableLoadBalancing,
        });

        this._logger?.info(`Task assigned: ${task.id} -> ${selectedAgent.id}`);
        this.foundationLogger.info(
          `✅ AI-optimized task assignment: ${task.id} → ${selectedAgent.id}`
        );
      });
    } catch (error) {
      this.foundationLogger.error(
        '🚨 Failed to assign task with AI optimization:',
        error
      );
      this._logger?.error(`Failed to assign task ${task.id}:`, error);

      // Fallback to simple assignment
      const fallbackAgent = Array.from(this.agents?.values())
        .filter((agent) => agent.status === 'idle')
        .sort((a, b) => a.taskCount - b.taskCount)[0];

      if (fallbackAgent) {
        task.assignedAgent = fallbackAgent.id;
        task.status = 'assigned';
        fallbackAgent.status = 'busy';
        fallbackAgent.taskCount++;
        this.foundationLogger.info(
          `🔄 Fallback assignment: ${task.id} → ${fallbackAgent.id}`
        );
      }
    }
  }

  /**
   * Get AI system health status for monitoring.
   */
  async getAISystemHealth(): Promise<{
    loadBalancer: boolean;
    agentMonitoring: boolean;
    neuralML: boolean;
    aiSafety: boolean;
    teamwork: boolean;
    chaosEngineering: boolean;
    overallHealth: 'healthy | degraded' | 'critical';
  }> {
    const health = {
      loadBalancer: !!this.loadBalancer && this.config.enableLoadBalancing,
      agentMonitoring: !!this.agentMonitoring,
      neuralML: !!this.neuralML && this.config.enableNeuralOptimization,
      aiSafety: !!this.aiSafety && this.config.enableSafetyMonitoring,
      teamwork: !!this.teamwork && this.config.enableTeamworkPatterns,
      chaosEngineering:
        !!this.chaosEngineering && this.config.enableChaosEngineering,
      overallHealth: 'healthy' as const,
    };

    const healthyCount = Object.values()(health).filter(Boolean).length - 1; // Exclude overallHealth
    const totalSystems = 6;

    if (healthyCount < totalSystems * .5) {
      health.overallHealth = 'critical' as any;
    } else if (healthyCount < totalSystems * .8) {
      health.overallHealth = 'degraded' as any;
    }

    return health;
  }

  /**
   * Trigger chaos engineering test if enabled.
   */
  async runChaosTest(): Promise<{
    success: boolean;
    results?: any;
    error?: string;
  }> {
    try {
      // Initialize chaos engineering if not already done
      if (!this.chaosEngineering && this.config.enableChaosEngineering) {
        this.chaosEngineering = await getChaosEngine({
          enableChaosExperiments: true,
          enableResilienceTesting: true,
          enableFailureSimulation: true,
        });
      }

      if (!this.chaosEngineering) {
        return { success: false, error: 'Chaos engineering not available' };
      }

      const results = await this.chaosEngineering.runExperiment({
        name: 'coordination-resilience-test',
        target: 'coordination-manager',
        duration: 30000, // 30 seconds
        intensity: 'low',
      });

      this.foundationLogger.info(
        '🔥 Chaos engineering test completed:',
        results
      );
      return { success: true, results };
    } catch (error) {
      this.foundationLogger.error('❌ Chaos engineering test failed:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Chaos engineering not available',
      };
    }
  }
}

export default CoordinationManager;
