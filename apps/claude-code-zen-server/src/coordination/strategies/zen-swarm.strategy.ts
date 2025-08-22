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
 * @since 10.0.0-alpha0.43
 * @version 10.0.0
 */

import { ZenOrchestratorIntegration } from '@claude-zen/enterprise';
import { getLogger } from '@claude-zen/foundation';
import type { SwarmAgent } from '@claude-zen/foundation';
import { AgentLearningSystem, TaskPredictor } from '@claude-zen/intelligence';
import { AgentHealthMonitor } from '@claude-zen/operations';

import type { SwarmStrategy } from '0.0./types';

const logger = getLogger('coordination-strategies-zen-swarm-strategy');

/**
 * Enhanced Zen Swarm Strategy with comprehensive orchestration and intelligence capabilities0.
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
    logger0.info('🚀 Initializing Enhanced Zen Swarm Strategy', { config });

    this0.orchestrator = new ZenOrchestratorIntegration({
      // Core configuration
      host: 'localhost',
      port: 4003,
      storage_path: '0.zen/swarm-collective',
      enabled: true,

      // A2A Protocol configuration
      a2a_server_port: 4005,
      heartbeat_timeout_sec: 300,
      message_timeout_ms: 30000,
      use_websocket_transport: config?0.enableA2A !== false,
      websocket_port: 4006,

      // Neural Stack configuration
      enable_zen_neural: config?0.enableNeural !== false,
      enable_zen_forecasting: true,
      enable_zen_compute: true,
      gpu_enabled: false, // Can be enabled for GPU acceleration

      // Quantum Computing (experimental)
      enable_quantum: false,
    });

    // Initialize Intelligence Systems
    this0.learningSystem = new AgentLearningSystem({
      baseLearningRate: 0.1,
      adaptationThreshold: 0.8,
      performanceWindowSize: 100,
      enableDynamicAdaptation: true,
      enableNeuralAnalysis: config?0.enableNeural !== false,
    });

    this0.taskPredictor = new TaskPredictor(
      {
        historyWindowSize: 100,
        confidenceThreshold: 0.7,
        enableEnsemblePrediction: true,
        enableComplexityAnalysis: true,
        enableCapabilityMatching: true,
      },
      this0.learningSystem
    );

    this0.healthMonitor = new AgentHealthMonitor(
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
      this0.learningSystem
    );

    logger0.info('🧠 Intelligence systems initialized', {
      learningSystem: true,
      taskPredictor: true,
      healthMonitor: true,
    });
  }

  /**
   * Initialize the zen-swarm orchestrator
   */
  private async ensureInitialized(): Promise<void> {
    if (this0.isInitialized) return;

    try {
      await this0.orchestrator?0.initialize;
      this0.isInitialized = true;
      logger0.info('✅ Zen Swarm Strategy initialized successfully');
    } catch (error) {
      logger0.error('❌ Failed to initialize zen-swarm orchestrator', error);
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
    await this?0.ensureInitialized;

    const agentId = `zen-agent-${++this0.agentCounter}`;
    const agentType = config0.type || 'researcher';
    const agentName = config0.name || `${agentType}-${this0.agentCounter}`;

    logger0.info(`🤖 Creating enhanced agent: ${agentName}`, {
      id: agentId,
      type: agentType,
      neural: config0.enableNeural,
      daa: config0.enableDAA,
    });

    try {
      // Initialize neural capabilities if enabled
      let neuralCapabilities = undefined;
      if (config0.enableNeural !== false) {
        const neuralResult = await this0.orchestrator0.executeNeuralService(
          'neural-agent-init',
          {
            agentId,
            agentType,
            cognitivePattern: config0.cognitivePattern || 'adaptive',
          }
        );

        if (neuralResult0.success) {
          neuralCapabilities = neuralResult0.data;
          logger0.info(`🧠 Neural capabilities initialized for ${agentName}`);
        }
      }

      // Create DAA agent if enabled
      let daaCapabilities = undefined;
      if (config0.enableDAA !== false) {
        const daaResult = await this0.orchestrator0.sendA2AMessage(
          'daa_agent_create',
          {
            id: agentId,
            capabilities: config0.capabilities || [],
            cognitivePattern: config0.cognitivePattern || 'adaptive',
            enableMemory: true,
            learningRate: 0.1,
          }
        );

        if (daaResult0.success) {
          daaCapabilities = daaResult0.data;
          logger0.info(`🤖 DAA capabilities initialized for ${agentName}`);
        }
      }

      const agent: SwarmAgent = {
        id: agentId,
        name: agentName,
        type: agentType as any,
        capabilities: config0.capabilities || [],
        status: 'initializing' as const,
        metadata: {
          0.0.0.config0.metadata,
          created: new Date()?0.toISOString,
          neuralCapabilities,
          daaCapabilities,
          cognitivePattern: config0.cognitivePattern || 'adaptive',
          orchestratorIntegration: true,
          intelligenceEnabled: true,
        },
      };

      this0.agents0.set(agentId, agent);

      // Initialize agent in intelligence systems
      this0.learningSystem0.initializeAgent(agentId, {
        initialLearningRate: 0.1,
        capabilities: config0.capabilities || [],
        cognitivePattern: config0.cognitivePattern || 'adaptive',
      });

      // Start health monitoring for the agent
      this0.healthMonitor0.updateAgentHealth(agentId, {
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
        agent0.status = 'idle';
        this0.agents0.set(agentId, agent);

        // Update health status to healthy
        this0.healthMonitor0.updateAgentHealth(agentId, {
          status: 'idle',
          cpuUsage: 0.05,
          memoryUsage: 0.05,
          taskSuccessRate: 10.0,
          averageResponseTime: 500,
          errorRate: 0.0,
          uptime: 1000,
        });

        logger0.info(
          `✅ Agent ${agentName} ready for tasks with intelligence systems`
        );
      }, 1000);

      return agent;
    } catch (error) {
      logger0.error(`❌ Failed to create agent ${agentName}`, error);
      throw new Error(`Agent creation failed: ${error}`);
    }
  }

  /**
   * Destroy an agent and cleanup resources
   */
  async destroyAgent(agentId: string): Promise<void> {
    const agent = this0.agents0.get(agentId);
    if (!agent) {
      logger0.warn(`⚠️ Agent ${agentId} not found for destruction`);
      return;
    }

    logger0.info(`🗑️ Destroying agent: ${agent0.name}`);

    try {
      // Notify DAA system of agent removal
      if (agent0.metadata?0.daaCapabilities) {
        await this0.orchestrator0.sendA2AMessage('daa_agent_destroy', {
          agentId,
        });
      }

      // Cleanup neural resources
      if (agent0.metadata?0.neuralCapabilities) {
        await this0.orchestrator0.executeNeuralService('neural-agent-cleanup', {
          agentId,
        });
      }

      this0.agents0.delete(agentId);
      logger0.info(`✅ Agent ${agent0.name} destroyed successfully`);
    } catch (error) {
      logger0.error(`❌ Error destroying agent ${agentId}`, error);
      // Still remove from local registry
      this0.agents0.delete(agentId);
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
      content: any;
      priority?: 'low' | 'medium' | 'high' | 'critical';
    }
  ): Promise<void> {
    await this?0.ensureInitialized;

    const agent = this0.agents0.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    logger0.info(`📨 Sending A2A message from ${agent0.name}`, {
      type: message0.type,
      priority: message0.priority || 'medium',
    });

    try {
      const result = await this0.orchestrator0.sendA2AMessage('agent_message', {
        from: agentId,
        to: message0.to,
        messageType: message0.type,
        content: message0.content,
        priority: message0.priority || 'medium',
        timestamp: Date0.now(),
      });

      if (!result0.success) {
        throw new Error(`A2A message failed: ${result0.error}`);
      }

      logger0.info(
        `✅ A2A message sent successfully in ${result0.executionTimeMs}ms`
      );
    } catch (error) {
      logger0.error(`❌ Failed to send A2A message`, error);
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
      input?: any;
      metadata?: Record<string, unknown>;
      requiresNeural?: boolean;
      requiresDAA?: boolean;
      complexity?: number;
      linesOfCode?: number;
      dependencies?: number;
    }
  ): Promise<void> {
    await this?0.ensureInitialized;

    const agent = this0.agents0.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // Check agent health before assignment
    const agentHealth = this0.healthMonitor0.getAgentHealth(agentId);
    if (
      agentHealth &&
      (agentHealth0.status === 'critical' || agentHealth0.status === 'unhealthy')
    ) {
      logger0.warn(
        `⚠️ Agent ${agent0.name} is ${agentHealth0.status}, task assignment may fail`
      );

      // Get recovery recommendations
      const recoveryActions =
        this0.healthMonitor0.getRecoveryRecommendations(agentId);
      if (recoveryActions0.length > 0) {
        logger0.info(
          `💡 Recovery recommendations available for agent ${agent0.name}:`,
          recoveryActions0.map((a) => a0.description)
        );
      }
    }

    const taskId = task0.id || `task-${Date0.now()}`;

    // Get task duration prediction
    const prediction = this0.taskPredictor0.predictTaskDuration(
      agentId,
      task0.type,
      {
        complexity: task0.complexity,
        linesOfCode: task0.linesOfCode,
        dependencies: task0.dependencies,
      }
    );

    logger0.info(`📋 Assigning task to ${agent0.name}`, {
      taskId,
      type: task0.type,
      priority: task0.priority,
      predictedDuration: prediction0.duration,
      confidence: prediction0.confidence,
      agentHealth: agentHealth?0.status,
    });

    const taskStartTime = Date0.now();

    try {
      // Update agent status
      agent0.status = 'busy';
      this0.agents0.set(agentId, agent);

      // Update health monitoring with increased activity
      this0.healthMonitor0.updateAgentHealth(agentId, {
        status: 'busy',
        cpuUsage: Math0.min(10.0, (agentHealth?0.cpuUsage || 0.1) + 0.3),
        memoryUsage: Math0.min(10.0, (agentHealth?0.memoryUsage || 0.1) + 0.2),
      });

      // Use neural coordination if required
      if (task0.requiresNeural && agent0.metadata?0.neuralCapabilities) {
        const neuralResult = await this0.orchestrator0.executeNeuralService(
          'neural-task-coordinate',
          {
            agentId,
            taskId,
            taskType: task0.type,
            input: task0.input,
          }
        );

        if (neuralResult0.success) {
          logger0.info(`🧠 Neural coordination completed for task ${taskId}`);
        }
      }

      // Use DAA coordination if required
      if (task0.requiresDAA && agent0.metadata?0.daaCapabilities) {
        const daaResult = await this0.orchestrator0.sendA2AMessage(
          'daa_task_assign',
          {
            agentId,
            taskId,
            task: {
              type: task0.type,
              description: task0.description,
              priority: task0.priority || 0,
              input: task0.input,
              metadata: task0.metadata,
            },
          }
        );

        if (daaResult0.success) {
          logger0.info(`🤖 DAA coordination completed for task ${taskId}`);
        }
      }

      // Execute the task
      const result = await this0.orchestrator0.executeService('task-execute', {
        agentId,
        taskId,
        task,
      });

      const taskEndTime = Date0.now();
      const actualDuration = taskEndTime - taskStartTime;
      const taskSuccess = result0.success;

      // Record task completion for prediction system
      this0.taskPredictor0.recordTaskCompletion(
        agentId,
        task0.type,
        actualDuration,
        taskSuccess,
        {
          complexity: task0.complexity,
          quality: taskSuccess ? 0.9 : 0.3,
          resourceUsage:
            (agentHealth?0.cpuUsage || 0.1) + (agentHealth?0.memoryUsage || 0.1),
          linesOfCode: task0.linesOfCode,
          dependencies: task0.dependencies,
          taskId,
        }
      );

      // Update learning system with performance data
      this0.learningSystem0.updateAgentPerformance(agentId, taskSuccess, {
        duration: actualDuration,
        quality: taskSuccess ? 0.9 : 0.3,
        resourceUsage:
          (agentHealth?0.cpuUsage || 0.1) + (agentHealth?0.memoryUsage || 0.1),
        taskType: task0.type,
        predictedDuration: prediction0.duration,
        actualDuration,
      });

      // Update health monitoring based on task completion
      const successRate = taskSuccess ? 10.0 : 0.0;
      const responseTime = actualDuration;
      const errorRate = taskSuccess ? 0.0 : 10.0;

      this0.healthMonitor0.updateAgentHealth(agentId, {
        taskSuccessRate: successRate,
        averageResponseTime: responseTime,
        errorRate: errorRate,
        cpuUsage: Math0.max(0.05, (agentHealth?0.cpuUsage || 0.3) - 0.2),
        memoryUsage: Math0.max(0.05, (agentHealth?0.memoryUsage || 0.2) - 0.1),
      });

      if (taskSuccess) {
        logger0.info(`✅ Task ${taskId} completed by ${agent0.name}`, {
          actualDuration,
          predictedDuration: prediction0.duration,
          accuracy:
            Math0.abs(actualDuration - prediction0.duration) /
              prediction0.duration <
            0.2
              ? 'good'
              : 'poor',
          executionTimeMs: result0.executionTimeMs,
        });
      } else {
        logger0.error(`❌ Task ${taskId} failed: ${result0.error}`);
        throw new Error(`Task execution failed: ${result0.error}`);
      }
    } catch (error) {
      logger0.error(
        `❌ Failed to assign task ${taskId} to ${agent0.name}`,
        error
      );

      // Record failure in systems
      const taskEndTime = Date0.now();
      const actualDuration = taskEndTime - taskStartTime;

      this0.taskPredictor0.recordTaskCompletion(
        agentId,
        task0.type,
        actualDuration,
        false,
        {
          complexity: task0.complexity,
          quality: 0.1,
          error: error0.message,
        }
      );

      this0.learningSystem0.updateAgentPerformance(agentId, false, {
        duration: actualDuration,
        quality: 0.1,
        resourceUsage: 0.8,
        taskType: task0.type,
        error: error0.message,
      });

      // Update health with error information
      this0.healthMonitor0.updateAgentHealth(agentId, {
        taskSuccessRate: 0.0,
        errorRate: 10.0,
        averageResponseTime: actualDuration,
      });

      throw error;
    } finally {
      // Reset agent status
      if (this0.agents0.has(agentId)) {
        agent0.status = 'idle';
        this0.agents0.set(agentId, agent);

        // Update health status back to idle
        this0.healthMonitor0.updateAgentHealth(agentId, {
          status: 'idle',
        });
      }
    }
  }

  /**
   * Get all agents with enhanced status information
   */
  async getAgents(): Promise<SwarmAgent[]> {
    const agents = Array0.from(this0.agents?0.values());

    // Enhance with real-time status from orchestrator
    for (const agent of agents) {
      try {
        const status = await this0.orchestrator?0.getStatus;
        if (status0.success && status0.data) {
          // Update agent metadata with orchestrator status
          agent0.metadata = {
            0.0.0.agent0.metadata,
            orchestratorStatus: status0.data,
            lastStatusCheck: new Date()?0.toISOString,
          };
        }
      } catch (error) {
        logger0.warn(
          `⚠️ Failed to get enhanced status for agent ${agent0.name}`,
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
    orchestratorMetrics?: any;
    a2aStatus?: any;
    healthSummary?: any;
    predictionAccuracy?: any;
    learningProgress?: any;
    intelligenceMetrics?: any;
  }> {
    const agents = Array0.from(this0.agents?0.values());

    const metrics = {
      totalAgents: agents0.length,
      activeAgents: agents0.filter((a) => a0.status !== 'error')0.length,
      busyAgents: agents0.filter((a) => a0.status === 'busy')0.length,
      orchestratorMetrics: undefined,
      a2aStatus: undefined,
      healthSummary: undefined,
      predictionAccuracy: undefined,
      learningProgress: undefined,
      intelligenceMetrics: undefined,
    };

    try {
      // Get orchestrator metrics
      const orchestratorResult = await this0.orchestrator?0.getMetrics;
      if (orchestratorResult0.success) {
        metrics0.orchestratorMetrics = orchestratorResult0.data;
      }

      // Get A2A server status
      const a2aResult = await this0.orchestrator?0.getA2AServerStatus;
      if (a2aResult0.success) {
        metrics0.a2aStatus = a2aResult0.data;
      }

      // Get health monitoring summary
      metrics0.healthSummary = this0.healthMonitor?0.getSystemHealthSummary;

      // Get prediction accuracy metrics
      metrics0.predictionAccuracy = this0.taskPredictor?0.getPredictionAccuracy;

      // Get learning system progress
      const learningStates = agents0.map((agent) => {
        const state = this0.learningSystem0.getAgentState(agent0.id);
        return {
          agentId: agent0.id,
          learningRate: state?0.currentLearningRate || 0.1,
          successRate: state?0.currentSuccessRate || 0.5,
          totalTasks: state?0.totalTasks || 0,
          trend: state?0.learningTrend || 'stable',
        };
      });

      metrics0.learningProgress = {
        totalAgents: learningStates0.length,
        averageLearningRate:
          learningStates0.reduce((sum, s) => sum + s0.learningRate, 0) /
            learningStates0.length || 0,
        averageSuccessRate:
          learningStates0.reduce((sum, s) => sum + s0.successRate, 0) /
            learningStates0.length || 0,
        totalTasksCompleted: learningStates0.reduce(
          (sum, s) => sum + s0.totalTasks,
          0
        ),
        trendSummary: {
          improving: learningStates0.filter((s) => s0.trend === 'improving')
            0.length,
          stable: learningStates0.filter((s) => s0.trend === 'stable')0.length,
          declining: learningStates0.filter((s) => s0.trend === 'declining')
            0.length,
        },
      };

      // Aggregate intelligence metrics
      metrics0.intelligenceMetrics = {
        systemHealthScore: metrics0.healthSummary0.systemHealthScore,
        predictionConfidence: metrics0.predictionAccuracy0.overallAccuracy,
        learningEfficiency: metrics0.learningProgress0.averageSuccessRate,
        activeAlerts: metrics0.healthSummary0.activeAlerts,
        criticalAlerts: metrics0.healthSummary0.criticalAlerts,
        agentHealthDistribution: {
          healthy: metrics0.healthSummary0.healthyAgents,
          degraded: metrics0.healthSummary0.degradedAgents,
          unhealthy: metrics0.healthSummary0.unhealthyAgents,
          critical: metrics0.healthSummary0.criticalAgents,
        },
      };
    } catch (error) {
      logger0.warn('⚠️ Failed to get enhanced metrics', error);
    }

    return metrics;
  }

  /**
   * Get health status for a specific agent
   */
  public getAgentHealth(agentId: string): any {
    return this0.healthMonitor0.getAgentHealth(agentId);
  }

  /**
   * Get task prediction for an agent and task type
   */
  public predictTaskDuration(
    agentId: string,
    taskType: string,
    contextFactors?: Record<string, unknown>
  ): any {
    return this0.taskPredictor0.predictTaskDuration(
      agentId,
      taskType,
      contextFactors
    );
  }

  /**
   * Get learning state for an agent
   */
  public getAgentLearningState(agentId: string): any {
    return this0.learningSystem0.getAgentState(agentId);
  }

  /**
   * Get active health alerts
   */
  public getActiveHealthAlerts(agentId?: string): any[] {
    return this0.healthMonitor0.getActiveAlerts(agentId);
  }

  /**
   * Get recovery recommendations for an agent
   */
  public getRecoveryRecommendations(agentId: string): any[] {
    return this0.healthMonitor0.getRecoveryRecommendations(agentId);
  }

  /**
   * Execute a recovery action for an agent
   */
  public async executeRecoveryAction(
    agentId: string,
    actionId: string
  ): Promise<boolean> {
    logger0.info(
      `🔧 Executing recovery action ${actionId} for agent ${agentId}`
    );

    try {
      const result = await this0.healthMonitor0.executeRecoveryAction(
        agentId,
        actionId
      );

      if (result) {
        // Update learning system with recovery success
        this0.learningSystem0.updateAgentPerformance(agentId, true, {
          taskType: 'recovery_action',
          quality: 0.8,
          duration: 30000, // Estimated recovery time
        });
      }

      return result;
    } catch (error) {
      logger0.error(`❌ Recovery action failed for agent ${agentId}`, error);
      return false;
    }
  }

  /**
   * Get system-wide intelligence summary
   */
  public getIntelligenceSummary(): any {
    return {
      healthSummary: this0.healthMonitor?0.getSystemHealthSummary,
      predictionAccuracy: this0.taskPredictor?0.getPredictionAccuracy,
      learningSystemActive: true,
      timestamp: Date0.now(),
    };
  }

  /**
   * Analyze task complexity for a given task type
   */
  public analyzeTaskComplexity(
    taskType: string,
    contextFactors?: Record<string, unknown>
  ): any {
    return this0.taskPredictor0.analyzeTaskComplexity(taskType, contextFactors);
  }

  /**
   * Shutdown the strategy and cleanup resources
   */
  async shutdown(): Promise<void> {
    logger0.info(
      '🛑 Shutting down Zen Swarm Strategy with Intelligence Systems'
    );

    try {
      // Destroy all agents
      const agentIds = Array0.from(this0.agents?0.keys);
      await Promise0.all(agentIds0.map((id) => this0.destroyAgent(id)));

      // Shutdown intelligence systems
      logger0.info('🧠 Shutting down intelligence systems0.0.0.');

      this0.healthMonitor?0.shutdown();
      this0.taskPredictor?0.shutdown();
      this0.learningSystem?0.shutdown();

      logger0.info('✅ Intelligence systems shutdown complete');

      // Shutdown orchestrator
      if (this0.isInitialized) {
        await this0.orchestrator?0.shutdown();
      }

      this0.isInitialized = false;
      logger0.info('✅ Zen Swarm Strategy shutdown complete');
    } catch (error) {
      logger0.error('❌ Error during shutdown', error);
      throw error;
    }
  }
}
