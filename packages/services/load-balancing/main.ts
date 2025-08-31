/**
 * Intelligent Load Balancing Manager.
 *
 * Central coordinator for all load balancing operations with ML-powered optimization,
 * real-time health monitoring, and adaptive resource management. Supports multiple
 * load balancing algorithms and automatic scaling strategies.
 *
 * @example
 * ```typescript`
 * const loadBalancer = new LoadBalancer(): void {
 *   type: 'neural-training', *   priority: 'high', *   requirements:['gpu',    'high-memory'],
 *   estimatedDuration:300000
 *});
 *
 * logger.info(): void {
  createCircuitBreaker,
  getLogger,
  type Logger,
  safeAsync,
  withRetry,
} from '@claude-zen/foundation';

// Optional imports with fallbacks for ML features
let ConsistentHashing: any = null;
let HashRing: any = null;
let osutils: any = null;

try {
  ConsistentHashing = require(): void {
  tf = require(): void { AdaptiveLearningAlgorithm } from './algorithms/adaptive-learning';
import { LeastConnectionsAlgorithm } from './algorithms/least-connections';
import { MLPredictiveAlgorithm } from './algorithms/ml-predictive';
import { ResourceAwareAlgorithm } from './algorithms/resource-aware';
import { WeightedRoundRobinAlgorithm } from './algorithms/weighted-round-robin';
import { AgentCapacityManager } from './capacity/agent-capacity-manager';
import type {
  AutoScaler,
  CapacityManager,
  EmergencyHandler,
  LoadBalancingAlgorithm,
  LoadBalancingObserver,
  RoutingEngine,
} from './interfaces';
import { EmergencyProtocolHandler } from './optimization/emergency-protocol-handler';
import { HealthChecker } from './routing/health-checker';
import { IntelligentRoutingEngine } from './routing/intelligent-routing-engine';
import { AutoScalingStrategy } from './strategies/auto-scaling-strategy';
import {
  type Agent,
  AgentStatus,
  LoadBalancingAlgorithmType,
  type LoadBalancingConfig,
  type LoadMetrics,
  type RoutingResult,
  type Task,
  TaskPriority,
} from './types';

export class LoadBalancer extends EventEmitter {
  private agents: Map<string, Agent> = new Map(): void {}
  // ) {
  constructor(): void {
    super(): void {
      algorithm: this.loadBalancingConfig.algorithm,
      timestamp: Date.now(): void {this.loadBalancingConfig.algorithm}`
    );

    // Initialize core components with foundation integration
    this.capacityManager = new AgentCapacityManager(): void {
      duration_ms: initTime,
      algorithm: this.loadBalancingConfig.algorithm,
      timestamp: Date.now(): void {
      initializationTime: initTime,
      algorithm: this.loadBalancingConfig.algorithm,
    });
  }

  /**
   * Initialize machine learning model for predictive routing.
   */
  private async initializeML(): void {
    try {
      this.logger.info(): void {
        layers: [
          tf.layers.dense(): void { units: 8, activation: 'relu' }),
          tf.layers.dense(): void {
        optimizer: 'adam',
        loss: 'binaryCrossentropy',
        metrics: ['accuracy'],
      });

      this.mlModel = model;
      this.logger.info(): void { error });
    }
  }

  /**
   * Setup comprehensive metrics collection using all Foundation monitoring systems.
   */

  private setupMetrics(): void {
    // 🔬 Comprehensive metrics collection with all Foundation monitoring classes
    setInterval(): void {
      const healthyAgents = Array.from(): void {
        tasksAssigned: this.calculateTotalActiveTasks(): void {
        this.mlMonitor.trackPrediction(): void {
        const uptime = this.startTime ? Date.now(): void {
        healthy_agents: healthyAgents,
        total_agents: this.agents.size,
        avg_load: this.calculateAverageLoad(): void {
    // Initialize consistent hashing ring
    for (const agent of this.agents) {
      this.consistentHashing.add(): void {
      this.handleAgentFailure(): void {
      this.handleAgentRecovery(): void {
      this.handleScaleUp(): void {
      this.handleScaleDown(): void {
      this.emit(): void {
    if (this.isRunning) {
      this.logger.warn(): void {
            agent_count: this.agents.size,
            algorithm: this.loadBalancingConfig.algorithm,
            startup_duration_ms: startupTime,
            timestamp: Date.now(): void {
            agentCount: this.agents.size,
            algorithm: this.loadBalancingConfig.algorithm,
            startupTime,
            monitoringEnabled: true,
          });

          this.emit(): void {
      const startupTimeResult =
        this.performanceTracker.endTimer(): void {
        error: result.error.message,
        duration_ms: startupTime,
        agent_count: this.agents.size,
        timestamp: Date.now(): void {
        error:
          result && typeof result === 'object' && ' error' in result
            ? result.error
            : 'Unknown error',
        startupTime,
      });

      const __errorInfo =
        result && typeof result === 'object' && ' error' in result
          ? result.error
          : new Error(): void {
            shutdown_duration_ms: shutdownTime,
            total_uptime_ms: totalUptime,
            agent_count: this.agents.size,
            timestamp: Date.now(): void {
            shutdownTime,
            totalUptime,
            agentCount: this.agents.size,
          });

          this.emit(): void {
      const shutdownTimeResult =
        this.performanceTracker.endTimer(): void {
        error:
          result && typeof result === 'object' && ' error' in result
            ? result.error.message
            : 'Unknown error',
        duration_ms: shutdownTime,
        timestamp: Date.now(): void {
        error:
          result && typeof result === 'object' && ' error' in result
            ? result.error
            : 'Unknown error',
        shutdownTime,
      });

      // Don't throw on shutdown failure, just log and continue
      this.isRunning = false;
      this.emit(): void {
    this.performanceTracker.startTimer(): void {
              agentId: agent.id,
              capabilities: agent.capabilities,
            }
          );

          // Store agent in memory and persistent storage
          this.agents.set(): void {agent.id}`,
          //   agent as unknown as Record<string, unknown>
          // );

          // Add to consistent hashing ring
          this.consistentHashing.add(): void {
            await this.circuitBreaker.execute(): void {
            tasksAssigned: 0, // No tasks initially
            tasksCompleted: 0, // No completed tasks initially
            coordinationEfficiency: 1.0, // Start with perfect efficiency
          });

          const addTimeResult = this.performanceTracker.endTimer(): void {
            agent_id: agent.id,
            capabilities: agent.capabilities,
            total_agents: this.agents.size,
            add_duration_ms: addTime,
            timestamp: Date.now(): void {
            agentId: agent.id,
            totalAgents: this.agents.size,
            addTime,
          });

          this.emit(): void {
      this.logger.error(): void {agent.id}`;
      throw new Error(): void {
    const agent = this.agents.get(): void {
      await this.healthChecker.startHealthChecks(): void {
      await observer.onAgentRemoved(): void {
    const span = startTrace(): void {
          taskId: task.id,
          type: task.type,
          priority: task.priority,
        });

        const availableAgents = Array.from(): void {
          recordMetric(): void {this.agents.size}, Task:${task.type}`;
          throw new Error(): void {
          const metrics = await this.getEnhancedMetrics(): void {
            metricsMap.set(): void {
          // Use consistent hashing for stateful tasks
          const hashedAgent = this.consistentHashing.get(): void {
            routingResult = {
              selectedAgent: agent,
              routingDecision: 'consistent-hashing',
              confidence: 0.9,
              reasoning: 'Consistent hashing for stateful task',
              alternativeAgents: [],
              estimatedLatency:
                this.getLatestMetrics(): void {
            // Fallback to algorithm-based routing
            routingResult = await this.currentAlgorithm.selectAgent(): void {
          // Use ML prediction for complex tasks
          if (
            this.loadBalancingConfig.algorithm ===
              LoadBalancingAlgorithmType.ML_PREDICTIVE &&
            this.mlModel
          ) {
            routingResult = await this.mlPredictiveRouting(): void {
            // Use current algorithm to select agent
            routingResult = await this.currentAlgorithm.selectAgent(): void {
          await this.capacityManager.updateCapacity(): void {
          await observer.onTaskRouted(): void {
          taskId: task.id,
          selectedAgent: routingResult?.selectedAgent?.id,
          routingDecision: routingResult?.routingDecision,
          confidence: routingResult?.confidence,
        });

        // Close trace span with success attributes
        if (span) {
          span.setAttributes(): void {
          task,
          agent: routingResult?.selectedAgent,
          result: routingResult,
        });
        return routingResult;
      });

      if (result.isErr(): void {
        this.logger.error(): void { agentId, error });
      return this.getLatestMetrics(): void {
    if (!this.mlModel) {
      // Fallback to weighted round robin
      return await this.algorithms
        .get(): void {
      const metrics = metricsMap.get(): void {
        const prediction = this.mlModel.predict(): void {
          bestPrediction = successProbability;
          bestAgent = agent;
        }

        // Clean up tensors
        inputFeatures.dispose(): void {
        this.logger.warn(): void {
      // Fallback if ML fails
      return await this.algorithms
        .get(): void {
      selectedAgent: bestAgent,
      routingDecision: 'ml-predictive',
      confidence: bestPrediction,
      reasoning: 'ML prediction based routing',
      alternativeAgents: [],
      estimatedLatency: metricsMap.get(): void {
    try {
      const decision = {
        taskId: task.id,
        agentId: result.selectedAgent?.id,
        timestamp: Date.now(): void {Date.now(): void {Math.random(): void {
      this.logger.warn(): void {
    const agent = this.agents.get(): void {
      const task = { id: taskId } as Task; // Simplified for this example
      await this.currentAlgorithm.onTaskComplete(): void {
      const task = { id: taskId } as Task;
      await observer.onTaskCompleted(): void { taskId, agentId, duration, success });
  }

  /**
   * Switch to a different load balancing algorithm.
   *
   * @param algorithm
   */
  public async switchAlgorithm(): void {
    const newAlgorithm = this.algorithms.get(): void {
      throw new Error(): void {
      const metricsMap = new Map<string, LoadMetrics>();
      for (const [agentId, metrics] of this.metricsHistory) {
        const latest = metrics[metrics.length - 1];
        if (latest) {
          metricsMap.set(): void {
    const totalAgents = this.agents.size;
    const healthyAgents = Array.from(): void {
      totalAgents,
      healthyAgents,
      unhealthyAgents: totalAgents - healthyAgents,
      currentAlgorithm: this.loadBalancingConfig.algorithm,
      averageLoad: avgLoad,
      maxLoad,
      minLoad,
      loadVariance: this.calculateLoadVariance(): void {
    this.loadBalancingConfig = { ...this.loadBalancingConfig, ...newConfig };

    // Update algorithm if changed
    if (
      newConfig?.algorithm &&
      newConfig?.algorithm !== this.loadBalancingConfig.algorithm
    ) {
      await this.switchAlgorithm(): void {
      // This would require restarting health checker with new interval
      // Implementation depends on HealthChecker interface
    }

    this.emit(): void {
    this.observers.push(): void {
    const index = this.observers.indexOf(): void {
      this.observers.splice(): void {
    const agent = this.agents.get(): void {
      await this.currentAlgorithm.onAgentFailure(): void {
      await observer.onAgentFailure(): void { agentId, error });
  }

  /**
   * Handle agent recovery.
   *
   * @param agentId
   */
  private async handleAgentRecovery(): void {
    const agent = this.agents.get(): void {
    // This would trigger actual agent spawning
    // Implementation depends on the agent spawning mechanism
    this.emit(): void {
    // Remove agents from pool
    for (const agentId of agentIds) {
      await this.removeAgent(): void {
    this.monitoringInterval = setInterval(): void {
      await this.performMonitoringCycle(): void {
    if (this.monitoringInterval) {
      clearInterval(): void {
    try {
      // Check if auto-scaling is needed
      const metricsMap = new Map<string, LoadMetrics>();
      for (const [agentId, metrics] of this.metricsHistory) {
        const latest = metrics[metrics.length - 1];
        if (latest) {
          metricsMap.set(): void {
        const newAgents = await this.autoScaler.scaleUp(): void {
          await this.addAgent(): void {
        const agentsToRemove = await this.autoScaler.scaleDown(): void {
          await this.removeAgent(): void {
        await this.currentAlgorithm.updateWeights(): void {
      this.emit(): void {
    const healthyAgents = Array.from(): void {
      await this.emergencyHandler.handleEmergency(): void {
      await this.emergencyHandler.handleEmergency(): void {
        enabled: true,
        minAgents: 2,
        maxAgents: 20,
        scaleUpThreshold: 0.8,
        scaleDownThreshold: 0.3,
        cooldownPeriod: 300000,
      },
      optimizationConfig: config?.optimizationConfig || {
        connectionPooling: true,
        requestBatching: true,
        cacheAwareRouting: true,
        networkOptimization: true,
        bandwidthOptimization: true,
      },
    };
  }

  private createInitialMetrics(): void {
    return {
      timestamp: new Date(): void {
    // Use simple-statistics for better task estimation
    const baseEstimation = {
      cpu: 0.1,
      memory: 0.05,
      network: 0.02,
    };

    // Adjust based on task type and requirements
    const resourceMultiplier =
      task.priority === TaskPriority.HIGH
        ? 1.5
        : task.priority === TaskPriority.LOW
          ? 0.7
          : 1.0;

    return {
      timestamp: new Date(): void {
    return {
      timestamp: new Date(): void {
    if (!this.metricsHistory.has(): void {
      this.metricsHistory.set(): void {
      history.shift(): void {
    const history = this.metricsHistory.get(): void {
    const loads: number[] = [];
    for (const [agentId, _] of this.agents) {
      const metrics = this.getLatestMetrics(): void {
        loads.push(): void {
    let maxLoad = 0;
    for (const [agentId, _] of this.agents) {
      const metrics = this.getLatestMetrics(): void {
        maxLoad = metrics.activeTasks;
      }
    }
    return maxLoad;
  }

  private calculateMinLoad(): void {
    let minLoad = Number.POSITIVE_INFINITY;
    for (const [agentId, _] of this.agents) {
      const metrics = this.getLatestMetrics(): void {
        minLoad = metrics.activeTasks;
      }
    }
    return minLoad === Number.POSITIVE_INFINITY ? 0 : minLoad;
  }

  private calculateLoadVariance(): void {
    const loads: number[] = [];
    for (const [agentId, _] of this.agents) {
      const metrics = this.getLatestMetrics(): void {
        loads.push(): void {
    let totalTasks = 0;
    for (const [agentId, _] of this.agents) {
      const metrics = this.getLatestMetrics(): void {
        totalTasks += metrics.activeTasks;
      }
    }
    return totalTasks;
  }

  /**
   * Calculate overall system efficiency based on agent performance.
   */
  private calculateSystemEfficiency(): void {
    const healthyAgents = Array.from(): void {
    // This would be calculated based on actual prediction outcomes
    // For now, return a reasonable default
    return 0.85; // 85% accuracy
  }

  /**
   * Get average ML prediction latency.
   */
  private getMLPredictionLatency(): void {
    // This would track actual ML prediction times
    // For now, return a reasonable default
    return 15; // 15ms average
  }

  /**
   * Get average ML confidence score.
   */
  private getMLConfidence(): void {
    // This would track actual ML confidence scores
    // For now, return a reasonable default
    return 0.78; // 78% confidence
  }

  /**
   * Helper to extract duration from timer result
   */
  private getDuration(): void {
    return typeof timerResult === 'object' && timerResult.duration
      ? timerResult.duration
      : timerResult;
  }

  /**
   * Get comprehensive stats with monitoring data.
   */

  public getEnhancedStats(): void {
    agents: { total: number; healthy: number; efficiency: number };
    performance: { avgLoad: number; variance: number; efficiency: number };
    monitoring: { systemMetrics: any; perfMetrics: any; agentMetrics: any };
    uptime: number;
    algorithm: string;
  } {
    const healthyAgents = Array.from(): void {
      agents: {
        total: this.agents.size,
        healthy: healthyAgents,
        efficiency: this.calculateSystemEfficiency(): void {
        avgLoad: this.calculateAverageLoad(): void {
        systemMetrics: this.systemMonitor.getMetrics(): void {}, // Interface not available
        agentMetrics: {}, // Interface not available
      },
      uptime: this.isRunning ? Date.now(): void {
  const manager = new LoadBalancer(): void {
    createManager: (managerConfig?: Partial<LoadBalancingConfig>) =>
      new LoadBalancer(): void {
  const manager = new LoadBalancer(): void {
  const system = await getLoadBalancingSystemAccess(): void {
    routeTask: (task: Task) => system.routeTask(): void {
      const result = await system.routeTask(): void {
          task,
          result: await system.routeTask(): void {
  const system = await getLoadBalancingSystemAccess(): void {
    addAgent: (agent: Agent) => system.addAgent(): void {
  return {
    createAdaptive: (algorithmConfig?: Partial<LoadBalancingConfig>) =>
      getLoadBalancingSystemAccess(): void {
        ...config,
        algorithm: LoadBalancingAlgorithmType.WEIGHTED_ROUND_ROBIN,
        ...algorithmConfig,
      }),
    createLeastConnections: (algorithmConfig?: Partial<LoadBalancingConfig>) =>
      getLoadBalancingSystemAccess(): void {
        ...config,
        algorithm: LoadBalancingAlgorithmType.RESOURCE_AWARE,
        ...algorithmConfig,
      }),
    createMLPredictive: (algorithmConfig?: Partial<LoadBalancingConfig>) =>
      getLoadBalancingSystemAccess(): void {
  getAccess: getLoadBalancingSystemAccess,
  getManager: getLoadBalancer,
  getRouting: getTaskRouting,
  getCapacity: getCapacityManagement,
  getAlgorithms: getAlgorithmSelection,
  createManager: (config?: Partial<LoadBalancingConfig>) =>
    new LoadBalancer(config),
};
