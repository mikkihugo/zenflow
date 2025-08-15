/**
 * @fileoverview Enhanced Zen Swarm Strategy using comprehensive zen-swarm-orchestrator
 *
 * This strategy leverages the complete zen-swarm ecosystem from zen-swarm-orchestrator
 * to provide advanced coordination capabilities including:
 * - Neural network integration
 * - DAA (Decentralized Autonomous Agents)
 * - A2A (Agent-to-Agent) protocol
 * - Advanced topologies and load balancing
 * - Persistence and memory management
 * - WASM performance optimization
 *
 * @author Claude Code Zen Team
 * @since 1.0.0-alpha.43
 * @version 1.0.0
 */

import { getLogger } from '../../config/logging-config';
import type { SwarmAgent } from '../../types/shared-types';
import type { SwarmStrategy } from '../types';
import { ZenOrchestratorIntegration } from '../../zen-orchestrator-integration.js';
import { AgentLearningSystem } from '../intelligence/agent-learning-system';
import { TaskPredictor } from '../intelligence/task-predictor';
import { AgentHealthMonitor } from '../intelligence/agent-health-monitor';

const logger = getLogger('coordination-strategies-zen-swarm-strategy');

/**
 * Enhanced Zen Swarm Strategy with comprehensive orchestration and intelligence capabilities.
 *
 * This strategy provides:
 * - Advanced neural network coordination
 * - DAA autonomous agent management
 * - A2A protocol for agent communication
 * - Multi-topology support (mesh, hierarchical, star, ring)
 * - Intelligent load balancing and auto-scaling
 * - Persistent memory and state management
 * - WASM-accelerated performance
 *
 * Intelligence Features:
 * - Dynamic learning rate adaptation via AgentLearningSystem
 * - Task duration prediction with ensemble methods via TaskPredictor
 * - Comprehensive health monitoring and alerting via AgentHealthMonitor
 * - Real-time performance tracking and optimization
 * - Predictive degradation detection and recovery recommendations
 * - Cross-system integration for enhanced decision making
 */
export class ZenSwarmStrategy implements SwarmStrategy {
  private orchestrator: ZenOrchestratorIntegration;
  private agents: Map<string, SwarmAgent> = new Map();
  private agentCounter = 0;
  private isInitialized = false;

  // Intelligence Systems
  private learningSystem: AgentLearningSystem;
  private taskPredictor: TaskPredictor;
  private healthMonitor: AgentHealthMonitor;

  constructor(config?: {
    topology?: 'mesh' | 'hierarchical' | 'star' | 'ring';
    maxAgents?: number;
    enableNeural?: boolean;
    enableDAA?: boolean;
    enableA2A?: boolean;
    enablePersistence?: boolean;
  }) {
    logger.info('🚀 Initializing Enhanced Zen Swarm Strategy', { config });

    this.orchestrator = new ZenOrchestratorIntegration({
      // Core configuration
      host: 'localhost',
      port: 4003,
      storage_path: '.zen/swarm-collective',
      enabled: true,

      // A2A Protocol configuration
      a2a_server_port: 4005,
      heartbeat_timeout_sec: 300,
      message_timeout_ms: 30000,
      use_websocket_transport: config?.enableA2A !== false,
      websocket_port: 4006,

      // Neural Stack configuration
      enable_zen_neural: config?.enableNeural !== false,
      enable_zen_forecasting: true,
      enable_zen_compute: true,
      gpu_enabled: false, // Can be enabled for GPU acceleration

      // Quantum Computing (experimental)
      enable_quantum: false,
    });

    // Initialize Intelligence Systems
    this.learningSystem = new AgentLearningSystem({
      baseLearningRate: 0.1,
      adaptationThreshold: 0.8,
      performanceWindowSize: 100,
      enableDynamicAdaptation: true,
      enableNeuralAnalysis: config?.enableNeural !== false,
    });

    this.taskPredictor = new TaskPredictor(
      {
        historyWindowSize: 100,
        confidenceThreshold: 0.7,
        enableEnsemblePrediction: true,
        enableComplexityAnalysis: true,
        enableCapabilityMatching: true,
      },
      this.learningSystem
    );

    this.healthMonitor = new AgentHealthMonitor(
      {
        healthCheckInterval: 30000,
        alertThresholds: {
          cpu: 0.8,
          memory: 0.9,
          diskUsage: 0.85,
          networkLatency: 1000,
          taskFailureRate: 0.3,
          responseTime: 5000,
          errorRate: 0.2,
        },
      },
      this.learningSystem
    );

    logger.info('🧠 Intelligence systems initialized', {
      learningSystem: true,
      taskPredictor: true,
      healthMonitor: true,
    });
  }

  /**
   * Initialize the zen-swarm orchestrator
   */
  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.orchestrator.initialize();
      this.isInitialized = true;
      logger.info('✅ Zen Swarm Strategy initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize zen-swarm orchestrator', error);
      throw new Error(`Zen Swarm initialization failed: ${error}`);
    }
  }

  /**
   * Create an enhanced agent with neural and DAA capabilities
   */
  async createAgent(config: {
    name?: string;
    type?: string;
    capabilities?: string[];
    metadata?: Record<string, unknown>;
    enableNeural?: boolean;
    enableDAA?: boolean;
    cognitivePattern?:
      | 'convergent'
      | 'divergent'
      | 'lateral'
      | 'systems'
      | 'critical'
      | 'adaptive';
  }): Promise<SwarmAgent> {
    await this.ensureInitialized();

    const agentId = `zen-agent-${++this.agentCounter}`;
    const agentType = config.type || 'researcher';
    const agentName = config.name || `${agentType}-${this.agentCounter}`;

    logger.info(`🤖 Creating enhanced agent: ${agentName}`, {
      id: agentId,
      type: agentType,
      neural: config.enableNeural,
      daa: config.enableDAA,
    });

    try {
      // Initialize neural capabilities if enabled
      let neuralCapabilities = undefined;
      if (config.enableNeural !== false) {
        const neuralResult = await this.orchestrator.executeNeuralService(
          'neural-agent-init',
          {
            agentId,
            agentType,
            cognitivePattern: config.cognitivePattern || 'adaptive',
          }
        );

        if (neuralResult.success) {
          neuralCapabilities = neuralResult.data;
          logger.info(`🧠 Neural capabilities initialized for ${agentName}`);
        }
      }

      // Create DAA agent if enabled
      let daaCapabilities = undefined;
      if (config.enableDAA !== false) {
        const daaResult = await this.orchestrator.sendA2AMessage(
          'daa_agent_create',
          {
            id: agentId,
            capabilities: config.capabilities || [],
            cognitivePattern: config.cognitivePattern || 'adaptive',
            enableMemory: true,
            learningRate: 0.1,
          }
        );

        if (daaResult.success) {
          daaCapabilities = daaResult.data;
          logger.info(`🤖 DAA capabilities initialized for ${agentName}`);
        }
      }

      const agent: SwarmAgent = {
        id: agentId,
        name: agentName,
        type: agentType as any,
        capabilities: config.capabilities || [],
        status: 'initializing' as const,
        metadata: {
          ...config.metadata,
          created: new Date().toISOString(),
          neuralCapabilities,
          daaCapabilities,
          cognitivePattern: config.cognitivePattern || 'adaptive',
          orchestratorIntegration: true,
          intelligenceEnabled: true,
        },
      };

      this.agents.set(agentId, agent);

      // Initialize agent in intelligence systems
      this.learningSystem.initializeAgent(agentId, {
        initialLearningRate: 0.1,
        capabilities: config.capabilities || [],
        cognitivePattern: config.cognitivePattern || 'adaptive',
      });

      // Start health monitoring for the agent
      this.healthMonitor.updateAgentHealth(agentId, {
        status: 'initializing',
        cpuUsage: 0.1,
        memoryUsage: 0.1,
        taskSuccessRate: 0.5,
        averageResponseTime: 1000,
        errorRate: 0.0,
        uptime: 0,
      });

      // Start the agent
      setTimeout(async () => {
        agent.status = 'idle';
        this.agents.set(agentId, agent);

        // Update health status to healthy
        this.healthMonitor.updateAgentHealth(agentId, {
          status: 'idle',
          cpuUsage: 0.05,
          memoryUsage: 0.05,
          taskSuccessRate: 1.0,
          averageResponseTime: 500,
          errorRate: 0.0,
          uptime: 1000,
        });

        logger.info(
          `✅ Agent ${agentName} ready for tasks with intelligence systems`
        );
      }, 1000);

      return agent;
    } catch (error) {
      logger.error(`❌ Failed to create agent ${agentName}`, error);
      throw new Error(`Agent creation failed: ${error}`);
    }
  }

  /**
   * Destroy an agent and cleanup resources
   */
  async destroyAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      logger.warn(`⚠️ Agent ${agentId} not found for destruction`);
      return;
    }

    logger.info(`🗑️ Destroying agent: ${agent.name}`);

    try {
      // Notify DAA system of agent removal
      if (agent.metadata?.daaCapabilities) {
        await this.orchestrator.sendA2AMessage('daa_agent_destroy', {
          agentId,
        });
      }

      // Cleanup neural resources
      if (agent.metadata?.neuralCapabilities) {
        await this.orchestrator.executeNeuralService('neural-agent-cleanup', {
          agentId,
        });
      }

      this.agents.delete(agentId);
      logger.info(`✅ Agent ${agent.name} destroyed successfully`);
    } catch (error) {
      logger.error(`❌ Error destroying agent ${agentId}`, error);
      // Still remove from local registry
      this.agents.delete(agentId);
    }
  }

  /**
   * Send enhanced A2A protocol messages between agents
   */
  async sendMessage(
    agentId: string,
    message: {
      to?: string;
      type: string;
      content: unknown;
      priority?: 'low' | 'medium' | 'high' | 'critical';
    }
  ): Promise<void> {
    await this.ensureInitialized();

    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    logger.info(`📨 Sending A2A message from ${agent.name}`, {
      type: message.type,
      priority: message.priority || 'medium',
    });

    try {
      const result = await this.orchestrator.sendA2AMessage('agent_message', {
        from: agentId,
        to: message.to,
        messageType: message.type,
        content: message.content,
        priority: message.priority || 'medium',
        timestamp: Date.now(),
      });

      if (!result.success) {
        throw new Error(`A2A message failed: ${result.error}`);
      }

      logger.info(
        `✅ A2A message sent successfully in ${result.executionTimeMs}ms`
      );
    } catch (error) {
      logger.error(`❌ Failed to send A2A message`, error);
      throw error;
    }
  }

  /**
   * Assign task to agent with neural and DAA coordination, task prediction, and health monitoring
   */
  async assignTaskToAgent(
    agentId: string,
    task: {
      id?: string;
      type: string;
      description: string;
      priority?: number;
      input?: unknown;
      metadata?: Record<string, unknown>;
      requiresNeural?: boolean;
      requiresDAA?: boolean;
      complexity?: number;
      linesOfCode?: number;
      dependencies?: number;
    }
  ): Promise<void> {
    await this.ensureInitialized();

    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // Check agent health before assignment
    const agentHealth = this.healthMonitor.getAgentHealth(agentId);
    if (
      agentHealth &&
      (agentHealth.status === 'critical' || agentHealth.status === 'unhealthy')
    ) {
      logger.warn(
        `⚠️ Agent ${agent.name} is ${agentHealth.status}, task assignment may fail`
      );

      // Get recovery recommendations
      const recoveryActions =
        this.healthMonitor.getRecoveryRecommendations(agentId);
      if (recoveryActions.length > 0) {
        logger.info(
          `💡 Recovery recommendations available for agent ${agent.name}:`,
          recoveryActions.map((a) => a.description)
        );
      }
    }

    const taskId = task.id || `task-${Date.now()}`;

    // Get task duration prediction
    const prediction = this.taskPredictor.predictTaskDuration(
      agentId,
      task.type,
      {
        complexity: task.complexity,
        linesOfCode: task.linesOfCode,
        dependencies: task.dependencies,
      }
    );

    logger.info(`📋 Assigning task to ${agent.name}`, {
      taskId,
      type: task.type,
      priority: task.priority,
      predictedDuration: prediction.duration,
      confidence: prediction.confidence,
      agentHealth: agentHealth?.status,
    });

    const taskStartTime = Date.now();

    try {
      // Update agent status
      agent.status = 'busy';
      this.agents.set(agentId, agent);

      // Update health monitoring with increased activity
      this.healthMonitor.updateAgentHealth(agentId, {
        status: 'busy',
        cpuUsage: Math.min(1.0, (agentHealth?.cpuUsage || 0.1) + 0.3),
        memoryUsage: Math.min(1.0, (agentHealth?.memoryUsage || 0.1) + 0.2),
      });

      // Use neural coordination if required
      if (task.requiresNeural && agent.metadata?.neuralCapabilities) {
        const neuralResult = await this.orchestrator.executeNeuralService(
          'neural-task-coordinate',
          {
            agentId,
            taskId,
            taskType: task.type,
            input: task.input,
          }
        );

        if (neuralResult.success) {
          logger.info(`🧠 Neural coordination completed for task ${taskId}`);
        }
      }

      // Use DAA coordination if required
      if (task.requiresDAA && agent.metadata?.daaCapabilities) {
        const daaResult = await this.orchestrator.sendA2AMessage(
          'daa_task_assign',
          {
            agentId,
            taskId,
            task: {
              type: task.type,
              description: task.description,
              priority: task.priority || 0,
              input: task.input,
              metadata: task.metadata,
            },
          }
        );

        if (daaResult.success) {
          logger.info(`🤖 DAA coordination completed for task ${taskId}`);
        }
      }

      // Execute the task
      const result = await this.orchestrator.executeService('task-execute', {
        agentId,
        taskId,
        task,
      });

      const taskEndTime = Date.now();
      const actualDuration = taskEndTime - taskStartTime;
      const taskSuccess = result.success;

      // Record task completion for prediction system
      this.taskPredictor.recordTaskCompletion(
        agentId,
        task.type,
        actualDuration,
        taskSuccess,
        {
          complexity: task.complexity,
          quality: taskSuccess ? 0.9 : 0.3,
          resourceUsage:
            (agentHealth?.cpuUsage || 0.1) + (agentHealth?.memoryUsage || 0.1),
          linesOfCode: task.linesOfCode,
          dependencies: task.dependencies,
          taskId,
        }
      );

      // Update learning system with performance data
      this.learningSystem.updateAgentPerformance(agentId, taskSuccess, {
        duration: actualDuration,
        quality: taskSuccess ? 0.9 : 0.3,
        resourceUsage:
          (agentHealth?.cpuUsage || 0.1) + (agentHealth?.memoryUsage || 0.1),
        taskType: task.type,
        predictedDuration: prediction.duration,
        actualDuration,
      });

      // Update health monitoring based on task completion
      const successRate = taskSuccess ? 1.0 : 0.0;
      const responseTime = actualDuration;
      const errorRate = taskSuccess ? 0.0 : 1.0;

      this.healthMonitor.updateAgentHealth(agentId, {
        taskSuccessRate: successRate,
        averageResponseTime: responseTime,
        errorRate: errorRate,
        cpuUsage: Math.max(0.05, (agentHealth?.cpuUsage || 0.3) - 0.2),
        memoryUsage: Math.max(0.05, (agentHealth?.memoryUsage || 0.2) - 0.1),
      });

      if (taskSuccess) {
        logger.info(`✅ Task ${taskId} completed by ${agent.name}`, {
          actualDuration,
          predictedDuration: prediction.duration,
          accuracy:
            Math.abs(actualDuration - prediction.duration) /
              prediction.duration <
            0.2
              ? 'good'
              : 'poor',
          executionTimeMs: result.executionTimeMs,
        });
      } else {
        logger.error(`❌ Task ${taskId} failed: ${result.error}`);
        throw new Error(`Task execution failed: ${result.error}`);
      }
    } catch (error) {
      logger.error(
        `❌ Failed to assign task ${taskId} to ${agent.name}`,
        error
      );

      // Record failure in systems
      const taskEndTime = Date.now();
      const actualDuration = taskEndTime - taskStartTime;

      this.taskPredictor.recordTaskCompletion(
        agentId,
        task.type,
        actualDuration,
        false,
        {
          complexity: task.complexity,
          quality: 0.1,
          error: error.message,
        }
      );

      this.learningSystem.updateAgentPerformance(agentId, false, {
        duration: actualDuration,
        quality: 0.1,
        resourceUsage: 0.8,
        taskType: task.type,
        error: error.message,
      });

      // Update health with error information
      this.healthMonitor.updateAgentHealth(agentId, {
        taskSuccessRate: 0.0,
        errorRate: 1.0,
        averageResponseTime: actualDuration,
      });

      throw error;
    } finally {
      // Reset agent status
      if (this.agents.has(agentId)) {
        agent.status = 'idle';
        this.agents.set(agentId, agent);

        // Update health status back to idle
        this.healthMonitor.updateAgentHealth(agentId, {
          status: 'idle',
        });
      }
    }
  }

  /**
   * Get all agents with enhanced status information
   */
  async getAgents(): Promise<SwarmAgent[]> {
    const agents = Array.from(this.agents.values());

    // Enhance with real-time status from orchestrator
    for (const agent of agents) {
      try {
        const status = await this.orchestrator.getStatus();
        if (status.success && status.data) {
          // Update agent metadata with orchestrator status
          agent.metadata = {
            ...agent.metadata,
            orchestratorStatus: status.data,
            lastStatusCheck: new Date().toISOString(),
          };
        }
      } catch (error) {
        logger.warn(
          `⚠️ Failed to get enhanced status for agent ${agent.name}`,
          error
        );
      }
    }

    return agents;
  }

  /**
   * Get comprehensive swarm metrics with intelligence data
   */
  async getMetrics(): Promise<{
    totalAgents: number;
    activeAgents: number;
    busyAgents: number;
    orchestratorMetrics?: unknown;
    a2aStatus?: unknown;
    healthSummary?: unknown;
    predictionAccuracy?: unknown;
    learningProgress?: unknown;
    intelligenceMetrics?: unknown;
  }> {
    const agents = Array.from(this.agents.values());

    const metrics = {
      totalAgents: agents.length,
      activeAgents: agents.filter((a) => a.status !== 'error').length,
      busyAgents: agents.filter((a) => a.status === 'busy').length,
      orchestratorMetrics: undefined,
      a2aStatus: undefined,
      healthSummary: undefined,
      predictionAccuracy: undefined,
      learningProgress: undefined,
      intelligenceMetrics: undefined,
    };

    try {
      // Get orchestrator metrics
      const orchestratorResult = await this.orchestrator.getMetrics();
      if (orchestratorResult.success) {
        metrics.orchestratorMetrics = orchestratorResult.data;
      }

      // Get A2A server status
      const a2aResult = await this.orchestrator.getA2AServerStatus();
      if (a2aResult.success) {
        metrics.a2aStatus = a2aResult.data;
      }

      // Get health monitoring summary
      metrics.healthSummary = this.healthMonitor.getSystemHealthSummary();

      // Get prediction accuracy metrics
      metrics.predictionAccuracy = this.taskPredictor.getPredictionAccuracy();

      // Get learning system progress
      const learningStates = agents.map((agent) => {
        const state = this.learningSystem.getAgentState(agent.id);
        return {
          agentId: agent.id,
          learningRate: state?.currentLearningRate || 0.1,
          successRate: state?.currentSuccessRate || 0.5,
          totalTasks: state?.totalTasks || 0,
          trend: state?.learningTrend || 'stable',
        };
      });

      metrics.learningProgress = {
        totalAgents: learningStates.length,
        averageLearningRate:
          learningStates.reduce((sum, s) => sum + s.learningRate, 0) /
            learningStates.length || 0,
        averageSuccessRate:
          learningStates.reduce((sum, s) => sum + s.successRate, 0) /
            learningStates.length || 0,
        totalTasksCompleted: learningStates.reduce(
          (sum, s) => sum + s.totalTasks,
          0
        ),
        trendSummary: {
          improving: learningStates.filter((s) => s.trend === 'improving')
            .length,
          stable: learningStates.filter((s) => s.trend === 'stable').length,
          declining: learningStates.filter((s) => s.trend === 'declining')
            .length,
        },
      };

      // Aggregate intelligence metrics
      metrics.intelligenceMetrics = {
        systemHealthScore: metrics.healthSummary.systemHealthScore,
        predictionConfidence: metrics.predictionAccuracy.overallAccuracy,
        learningEfficiency: metrics.learningProgress.averageSuccessRate,
        activeAlerts: metrics.healthSummary.activeAlerts,
        criticalAlerts: metrics.healthSummary.criticalAlerts,
        agentHealthDistribution: {
          healthy: metrics.healthSummary.healthyAgents,
          degraded: metrics.healthSummary.degradedAgents,
          unhealthy: metrics.healthSummary.unhealthyAgents,
          critical: metrics.healthSummary.criticalAgents,
        },
      };
    } catch (error) {
      logger.warn('⚠️ Failed to get enhanced metrics', error);
    }

    return metrics;
  }

  /**
   * Get health status for a specific agent
   */
  public getAgentHealth(agentId: string): any {
    return this.healthMonitor.getAgentHealth(agentId);
  }

  /**
   * Get task prediction for an agent and task type
   */
  public predictTaskDuration(
    agentId: string,
    taskType: string,
    contextFactors?: Record<string, unknown>
  ): any {
    return this.taskPredictor.predictTaskDuration(
      agentId,
      taskType,
      contextFactors
    );
  }

  /**
   * Get learning state for an agent
   */
  public getAgentLearningState(agentId: string): any {
    return this.learningSystem.getAgentState(agentId);
  }

  /**
   * Get active health alerts
   */
  public getActiveHealthAlerts(agentId?: string): unknown[] {
    return this.healthMonitor.getActiveAlerts(agentId);
  }

  /**
   * Get recovery recommendations for an agent
   */
  public getRecoveryRecommendations(agentId: string): unknown[] {
    return this.healthMonitor.getRecoveryRecommendations(agentId);
  }

  /**
   * Execute a recovery action for an agent
   */
  public async executeRecoveryAction(
    agentId: string,
    actionId: string
  ): Promise<boolean> {
    logger.info(
      `🔧 Executing recovery action ${actionId} for agent ${agentId}`
    );

    try {
      const result = await this.healthMonitor.executeRecoveryAction(
        agentId,
        actionId
      );

      if (result) {
        // Update learning system with recovery success
        this.learningSystem.updateAgentPerformance(agentId, true, {
          taskType: 'recovery_action',
          quality: 0.8,
          duration: 30000, // Estimated recovery time
        });
      }

      return result;
    } catch (error) {
      logger.error(`❌ Recovery action failed for agent ${agentId}`, error);
      return false;
    }
  }

  /**
   * Get system-wide intelligence summary
   */
  public getIntelligenceSummary(): any {
    return {
      healthSummary: this.healthMonitor.getSystemHealthSummary(),
      predictionAccuracy: this.taskPredictor.getPredictionAccuracy(),
      learningSystemActive: true,
      timestamp: Date.now(),
    };
  }

  /**
   * Analyze task complexity for a given task type
   */
  public analyzeTaskComplexity(
    taskType: string,
    contextFactors?: Record<string, unknown>
  ): any {
    return this.taskPredictor.analyzeTaskComplexity(taskType, contextFactors);
  }

  /**
   * Shutdown the strategy and cleanup resources
   */
  async shutdown(): Promise<void> {
    logger.info(
      '🛑 Shutting down Zen Swarm Strategy with Intelligence Systems'
    );

    try {
      // Destroy all agents
      const agentIds = Array.from(this.agents.keys());
      await Promise.all(agentIds.map((id) => this.destroyAgent(id)));

      // Shutdown intelligence systems
      logger.info('🧠 Shutting down intelligence systems...');

      this.healthMonitor.shutdown();
      this.taskPredictor.shutdown();
      this.learningSystem.shutdown();

      logger.info('✅ Intelligence systems shutdown complete');

      // Shutdown orchestrator
      if (this.isInitialized) {
        await this.orchestrator.shutdown();
      }

      this.isInitialized = false;
      logger.info('✅ Zen Swarm Strategy shutdown complete');
    } catch (error) {
      logger.error('❌ Error during shutdown', error);
      throw error;
    }
  }
}
