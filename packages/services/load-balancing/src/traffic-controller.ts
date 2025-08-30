/**
 * @fileoverview Traffic Controller - Event-Driven ML Traffic Management
 *
 * Modern event-driven traffic control system using foundation EventBus for
 * intelligent agent routing, capacity scaling, and resource optimization.
 * Orchestrates all load-balancing components through comprehensive event broadcasting.
 *
 * Features:
 * - ML-powered traffic routing decisions
 * - Real-time capacity scaling events
 * - Performance-based agent selection
 * - Bottleneck detection and resolution
 * - Predictive load balancing
 * - Emergency protocol activation
 *
 * ARCHITECTURAL PATTERN:Foundation EventBus with ML traffic coordination.
 */

import { getLogger, type Logger, EventBus } from '@claude-zen/foundation';
import * as ss from 'simple-statistics';

// Load balancing component imports
import { IntelligentRoutingEngine } from '../routing/intelligent-routing-engine';
import { AgentCapacityManager } from '../capacity/agent-capacity-manager';
import { CapacityPredictor } from '../capacity/capacity-predictor';
import { ResourceMonitor } from '../capacity/resource-monitor';
import { AutoScalingStrategy } from '../strategies/auto-scaling-strategy';
import { EmergencyProtocolHandler } from '../optimization/emergency-protocol-handler';
import { NetworkLatencyOptimizer } from '../optimization/network-latency-optimizer';

// Simple no-op implementation for deprecated package
const logger = {
  info: () => void 0,
  warn: () => void 0,
  error: () => void 0,
  debug: () => void 0,
};

export interface SystemMetrics {
  readonly cpuUsage: number;
  readonly memoryUsage: number;
  readonly taskQueueLength: number;
  readonly activeAgents: number;
  readonly averageResponseTime: number;
  readonly errorRate: number;
  readonly throughput: number;
  readonly timestamp: number;
}

export interface TrafficDecision {
  readonly type: 'routing' | ' scaling' | ' optimization' | ' emergency';
  readonly action: string;
  readonly reasoning: string[];
  readonly confidence: number;
  readonly expectedImpact: number;
  readonly timestamp: number;
  readonly parameters: Record<string, unknown>;
}

export interface ScalingDecision {
  readonly action: 'scale_up' | ' scale_down' | ' maintain' | ' optimize';
  readonly targetAgents: number;
  readonly confidence: number;
  readonly reasoning: string;
  readonly urgency: 'low' | ' medium' | ' high' | ' critical';
}

export interface AgentRouting {
  readonly agentId: string;
  readonly taskId: string;
  readonly routingReason: string;
  readonly confidence: number;
  readonly expectedLatency: number;
}

export interface TrafficConfig {
  enablePredictiveScaling?: boolean;
  enableMLRouting?: boolean;
  emergencyThresholds?: {
    cpuCritical: number;
    memoryCritical: number;
    responseTimeCritical: number;
    errorRateCritical: number;
  };
  scalingPolicy?: {
    scaleUpThreshold: number;
    scaleDownThreshold: number;
    cooldownMinutes: number;
    maxAgents: number;
    minAgents: number;
  };
}

/**
 * Traffic event types for foundation EventBus
 */
export interface TrafficEvents {
  'traffic:initialized': {
    config: TrafficConfig;
    timestamp: number;
  };
  'traffic:shutdown': {
    timestamp: number;
  };
  'traffic:agent_routed': {
    routing: AgentRouting;
    metrics: SystemMetrics;
    duration: number;
    timestamp: number;
  };
  'traffic:capacity_scaled': {
    decision: ScalingDecision;
    previousAgents: number;
    newAgents: number;
    timestamp: number;
  };
  'traffic:emergency_activated': {
    trigger: string;
    metrics: SystemMetrics;
    protocolsActivated: string[];
    timestamp: number;
  };
  'traffic:performance_optimized': {
    optimizationType: string;
    improvementMetrics: Record<string, number>;
    timestamp: number;
  };
  'traffic:bottleneck_detected': {
    bottleneckType: string;
    severity: 'low' | ' medium' | ' high' | ' critical';
    affectedAgents: string[];
    recommendedActions: string[];
    timestamp: number;
  };
  'traffic:error': {
    error: string;
    context: Record<string, unknown>;
    timestamp: number;
  };
}

/**
 * Traffic Controller - Event-driven ML traffic management system
 *
 * Extends foundation EventBus to provide comprehensive traffic coordination
 * with event broadcasting for all load-balancing operations.
 */
export class TrafficController extends EventBus<TrafficEvents> {
  private config: TrafficConfig;
  private initialized = false;
  private logger: Logger;

  // Load balancing components
  private routingEngine: IntelligentRoutingEngine | null = null;
  private capacityManager: AgentCapacityManager | null = null;
  private capacityPredictor: CapacityPredictor | null = null;
  private resourceMonitor: ResourceMonitor | null = null;
  private autoScaler: AutoScalingStrategy | null = null;
  private emergencyHandler: EmergencyProtocolHandler | null = null;
  private latencyOptimizer: NetworkLatencyOptimizer | null = null;

  // Traffic monitoring and ML data
  private trafficHistory: SystemMetrics[] = [];
  private decisionHistory: TrafficDecision[] = [];

  constructor(config: TrafficConfig = {}) {
    super({
      enableMiddleware: true,
      enableMetrics: true,
      enableLogging: true,
      maxListeners: 100,
    });

    this.config = {
      enablePredictiveScaling: config.enablePredictiveScaling ?? true,
      enableMLRouting: config.enableMLRouting ?? true,
      emergencyThresholds: {
        cpuCritical: 0.95,
        memoryCritical: 0.95,
        responseTimeCritical: 5000,
        errorRateCritical: 0.2,
        ...config.emergencyThresholds,
      },
      scalingPolicy: {
        scaleUpThreshold: 0.75,
        scaleDownThreshold: 0.3,
        cooldownMinutes: 5,
        maxAgents: 50,
        minAgents: 2,
        ...config.scalingPolicy,
      },
    };

    this.logger = getLogger('traffic-controller');
    this.logger.info('🚦 Traffic Controller created - initialization pending');
  }

  /**
   * Initialize the Traffic Controller with EventBus
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.debug('Traffic Controller already initialized');
      return;
    }

    const initStartTime = Date.now();

    try {
      this.logger.info(
        '🚦 Initializing Traffic Controller with foundation EventBus...'
      );

      // Initialize EventBus first
      const eventBusResult = await super.initialize();
      if (eventBusResult.isErr()) {
        throw new Error(
          `EventBus initialization failed:${eventBusResult.error?.message}`
        );
      }

      // Initialize load balancing components
      this.routingEngine = new IntelligentRoutingEngine();
      this.capacityManager = new AgentCapacityManager();
      this.capacityPredictor = new CapacityPredictor();
      this.resourceMonitor = new ResourceMonitor();
      this.autoScaler = new AutoScalingStrategy({});
      this.emergencyHandler = new EmergencyProtocolHandler();
      this.latencyOptimizer = new NetworkLatencyOptimizer();

      // Mark as initialized
      this.initialized = true;
      const duration = Date.now() - initStartTime;

      this.logger.info('✅ Traffic Controller initialized successfully', {
        duration: `${duration}ms`,
        components: 'all-load-balancing-components',
        predictiveScaling: this.config.enablePredictiveScaling,
        mlRouting: this.config.enableMLRouting,
      });

      // Emit initialization event
      await this.emitSafe('traffic:initialized', {
        config: this.config,
        timestamp: Date.now(),
      });
    } catch (error) {
      const duration = Date.now() - initStartTime;
      this.logger.error('❌ Traffic Controller initialization failed', {
        error: error instanceof Error ? error.message : String(error),
        duration: `${duration}ms`,
      });

      // Emit error event
      await this.emitSafe('traffic:error', {
        error: error instanceof Error ? error.message : String(error),
        context: { phase: 'initialization', duration },
        timestamp: Date.now(),
      });

      throw error;
    }
  }

  /**
   * Shutdown the Traffic Controller with event broadcasting
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) return;

    this.logger.info('🚦 Shutting down Traffic Controller...');

    // Emit shutdown event before cleanup
    await this.emitSafe('traffic:shutdown', {
      timestamp: Date.now(),
    });

    this.initialized = false;
    this.routingEngine = null;
    this.capacityManager = null;
    this.capacityPredictor = null;
    this.resourceMonitor = null;
    this.autoScaler = null;
    this.emergencyHandler = null;
    this.latencyOptimizer = null;

    // Allow event loop to process cleanup
    await new Promise((resolve) => setTimeout(resolve, 0));

    this.logger.info('✅ Traffic Controller shutdown complete');
  }

  /**
   * Main traffic control decision making with event broadcasting
   */
  async controlTraffic(metrics: SystemMetrics): Promise<TrafficDecision[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    const startTime = Date.now();
    const decisions: TrafficDecision[] = [];

    try {
      // Record metrics for ML analysis
      this.trafficHistory.push(metrics);
      if (this.trafficHistory.length > 1000) {
        this.trafficHistory = this.trafficHistory.slice(-1000);
      }

      // 1. Check for emergency conditions
      const emergencyDecision = await this.handleEmergencyProtocols(metrics);
      if (emergencyDecision) {
        decisions.push(emergencyDecision);

        await this.emitSafe('traffic:emergency_activated', {
          trigger: emergencyDecision.action,
          metrics,
          protocolsActivated: emergencyDecision.reasoning,
          timestamp: Date.now(),
        });
      }

      // 2. ML-powered traffic routing decisions
      if (this.config.enableMLRouting) {
        const routingDecision = await this.mlRoutingDecision(metrics);
        if (routingDecision) {
          decisions.push(routingDecision);
        }
      }

      // 3. Predictive capacity scaling
      if (this.config.enablePredictiveScaling) {
        const scalingDecision = await this.predictiveScaling(metrics);
        if (scalingDecision) {
          decisions.push(scalingDecision);
        }
      }

      // 4. Performance optimization
      const optimizationDecision = await this.performanceOptimization(metrics);
      if (optimizationDecision) {
        decisions.push(optimizationDecision);

        await this.emitSafe('traffic:performance_optimized', {
          optimizationType: optimizationDecision.action,
          improvementMetrics: optimizationDecision.parameters,
          timestamp: Date.now(),
        });
      }

      // 5. Bottleneck detection
      await this.detectBottlenecks(metrics);

      // Record decisions for ML learning
      for (const decision of decisions) {
        this.decisionHistory.push(decision);
        if (this.decisionHistory.length > 500) {
          this.decisionHistory = this.decisionHistory.slice(-500);
        }
      }

      const duration = Date.now() - startTime;
      this.logger.debug(
        `🚦 Traffic control complete:${decisions.length} decisions made in ${duration}ms`
      );

      return decisions;
    } catch (error) {
      await this.emitSafe('traffic:error', {
        error: error instanceof Error ? error.message : String(error),
        context: { operation: 'traffic_control', metrics },
        timestamp: Date.now(),
      });

      this.logger.error('❌ Traffic control failed: ', error);
      return [];
    }
  }

  /**
   * Route specific task with event broadcasting
   */
  async routeTask(
    taskId: string,
    taskRequirements: any
  ): Promise<string | null> {
    if (!this.initialized || !this.routingEngine) {
      throw new Error('Traffic Controller not initialized');
    }

    const startTime = Date.now();

    try {
      const agentId = await this.routingEngine.selectAgent(taskRequirements);
      const duration = Date.now() - startTime;

      if (agentId) {
        const routing: AgentRouting = {
          agentId,
          taskId,
          routingReason: 'ml-optimized',
          confidence: 0.85,
          expectedLatency: duration,
        };

        await this.emitSafe('traffic:agent_routed', {
          routing,
          metrics:
            this.trafficHistory[this.trafficHistory.length - 1] ||
            ({} as SystemMetrics),
          duration,
          timestamp: Date.now(),
        });

        return agentId;
      }

      return null;
    } catch (error) {
      await this.emitSafe('traffic:error', {
        error: error instanceof Error ? error.message : String(error),
        context: { operation: 'route_task', taskId, taskRequirements },
        timestamp: Date.now(),
      });

      throw error;
    }
  }

  /**
   * Get traffic controller status and metrics
   */
  async getTrafficStatus() {
    return {
      initialized: this.initialized,
      componentsLoaded: {
        routingEngine: !!this.routingEngine,
        capacityManager: !!this.capacityManager,
        capacityPredictor: !!this.capacityPredictor,
        resourceMonitor: !!this.resourceMonitor,
        autoScaler: !!this.autoScaler,
        emergencyHandler: !!this.emergencyHandler,
        latencyOptimizer: !!this.latencyOptimizer,
      },
      config: this.config,
      metrics: {
        totalDecisions: this.decisionHistory.length,
        trafficHistoryLength: this.trafficHistory.length,
        averageDecisionConfidence:
          this.decisionHistory.length > 0
            ? ss.mean(this.decisionHistory.map((d) => d.confidence))
            : 0,
      },
    };
  }

  // Private helper methods

  private async handleEmergencyProtocols(
    metrics: SystemMetrics
  ): Promise<TrafficDecision | null> {
    const {
      cpuCritical,
      memoryCritical,
      responseTimeCritical,
      errorRateCritical,
    } = this.config.emergencyThresholds!;

    if (
      metrics.cpuUsage >= cpuCritical ||
      metrics.memoryUsage >= memoryCritical ||
      metrics.averageResponseTime >= responseTimeCritical ||
      metrics.errorRate >= errorRateCritical
    ) {
      return {
        type: 'emergency',
        action: 'emergency_protocol_activated',
        reasoning: [
          `Critical system conditions detected`,
          `CPU:${(metrics.cpuUsage * 100).toFixed(1)}%`,
          `Memory:${(metrics.memoryUsage * 100).toFixed(1)}%`,
          `Response time:${metrics.averageResponseTime}ms`,
          `Error rate:${(metrics.errorRate * 100).toFixed(2)}%`,
          'Activating emergency load redistribution',
        ],
        confidence: 0.95,
        expectedImpact: 0.9,
        timestamp: Date.now(),
        parameters: {
          cpuUsage: metrics.cpuUsage,
          memoryUsage: metrics.memoryUsage,
          responseTime: metrics.averageResponseTime,
          errorRate: metrics.errorRate,
        },
      };
    }

    return null;
  }

  private async mlRoutingDecision(
    metrics: SystemMetrics
  ): Promise<TrafficDecision | null> {
    if (!this.routingEngine) return null;

    // Simple ML routing logic - in production this would use more sophisticated ML
    const routingEfficiency = await this.calculateRoutingEfficiency(metrics);

    if (routingEfficiency < 0.7) {
      return {
        type: 'routing',
        action: 'optimize_ml_routing',
        reasoning: [
          `Routing efficiency below threshold:${(routingEfficiency * 100).toFixed(1)}%`,
          'Implementing ML-based routing optimization',
          'Using performance patterns for intelligent routing',
        ],
        confidence: 0.8,
        expectedImpact: 0.6,
        timestamp: Date.now(),
        parameters: {
          efficiency: routingEfficiency,
          algorithm: 'ml-predictive',
        },
      };
    }

    return null;
  }

  private async predictiveScaling(
    metrics: SystemMetrics
  ): Promise<TrafficDecision | null> {
    if (!this.autoScaler || !this.capacityPredictor) return null;

    const scalingDecision = await this.calculateScalingDecision(metrics);

    if (scalingDecision.action !== 'maintain') {
      const decision: TrafficDecision = {
        type: 'scaling',
        action: scalingDecision.action,
        reasoning: [
          scalingDecision.reasoning,
          `Target agents:${scalingDecision.targetAgents}`,
          `Current agents:${metrics.activeAgents}`,
          `Confidence:${(scalingDecision.confidence * 100).toFixed(1)}%`,
          `Urgency:${scalingDecision.urgency}`,
        ],
        confidence: scalingDecision.confidence,
        expectedImpact: scalingDecision.urgency === 'critical' ? 0.9 : 0.7,
        timestamp: Date.now(),
        parameters: {
          currentAgents: metrics.activeAgents,
          targetAgents: scalingDecision.targetAgents,
          urgency: scalingDecision.urgency,
        },
      };

      // Emit scaling event
      await this.emitSafe('traffic:capacity_scaled', {
        decision: scalingDecision,
        previousAgents: metrics.activeAgents,
        newAgents: scalingDecision.targetAgents,
        timestamp: Date.now(),
      });

      return decision;
    }

    return null;
  }

  private async performanceOptimization(
    metrics: SystemMetrics
  ): Promise<TrafficDecision | null> {
    if (!this.latencyOptimizer) return null;

    // Simple performance optimization logic
    if (metrics.averageResponseTime > 2000 || metrics.throughput < 50) {
      return {
        type: 'optimization',
        action: 'performance_optimization',
        reasoning: [
          `Performance degradation detected`,
          `Response time:${metrics.averageResponseTime}ms`,
          `Throughput:${metrics.throughput} tasks/min`,
          'Implementing latency and throughput optimization',
        ],
        confidence: 0.75,
        expectedImpact: 0.5,
        timestamp: Date.now(),
        parameters: {
          responseTime: metrics.averageResponseTime,
          throughput: metrics.throughput,
          optimizationType: 'latency-throughput',
        },
      };
    }

    return null;
  }

  private async detectBottlenecks(metrics: SystemMetrics): Promise<void> {
    const bottlenecks: string[] = [];
    let severity: 'low' | ' medium' | ' high' | ' critical' = ' low';

    if (metrics.taskQueueLength > 100) {
      bottlenecks.push('high_queue_length');
      severity = metrics.taskQueueLength > 500 ? 'critical' : ' high';
    }

    if (metrics.errorRate > 0.1) {
      bottlenecks.push('high_error_rate');
      severity = metrics.errorRate > 0.2 ? 'critical' : ' high';
    }

    if (bottlenecks.length > 0) {
      await this.emitSafe('traffic:bottleneck_detected', {
        bottleneckType: bottlenecks.join(',    '),
        severity,
        affectedAgents: [], // Would be populated with actual agent data
        recommendedActions: [
          'Increase agent capacity',
          'Implement circuit breakers',
          'Review task distribution',
        ],
        timestamp: Date.now(),
      });
    }
  }

  private async calculateRoutingEfficiency(
    metrics: SystemMetrics
  ): Promise<number> {
    // Simple routing efficiency calculation
    const timeEfficiency = Math.max(0, 1 - metrics.averageResponseTime / 5000);
    const errorEfficiency = Math.max(0, 1 - metrics.errorRate);
    const queueEfficiency = Math.max(0, 1 - metrics.taskQueueLength / 200);

    return (timeEfficiency + errorEfficiency + queueEfficiency) / 3;
  }

  private async calculateScalingDecision(
    metrics: SystemMetrics
  ): Promise<ScalingDecision> {
    const { scaleUpThreshold, scaleDownThreshold, maxAgents, minAgents } =
      this.config.scalingPolicy!;

    // Calculate system pressure
    const cpuPressure = metrics.cpuUsage;
    const memoryPressure = metrics.memoryUsage;
    const queuePressure = Math.min(1, metrics.taskQueueLength / 100);

    const overallPressure = (cpuPressure + memoryPressure + queuePressure) / 3;

    if (
      overallPressure >= scaleUpThreshold &&
      metrics.activeAgents < maxAgents
    ) {
      const targetAgents = Math.min(
        maxAgents,
        Math.ceil(metrics.activeAgents * 1.5)
      );
      return {
        action: 'scale_up',
        targetAgents,
        confidence: 0.8,
        reasoning: `High system pressure: ${(overallPressure * 100).toFixed(1)}%`,
        urgency: overallPressure > 0.9 ? 'critical' : ' high',
      };
    }

    if (
      overallPressure <= scaleDownThreshold &&
      metrics.activeAgents > minAgents
    ) {
      const targetAgents = Math.max(
        minAgents,
        Math.floor(metrics.activeAgents * 0.7)
      );
      return {
        action: 'scale_down',
        targetAgents,
        confidence: 0.7,
        reasoning: `Low system pressure: ${(overallPressure * 100).toFixed(1)}%`,
        urgency: 'low',
      };
    }

    return {
      action: 'maintain',
      targetAgents: metrics.activeAgents,
      confidence: 0.6,
      reasoning: 'System pressure within acceptable range',
      urgency: 'low',
    };
  }
}

// Export for backward compatibility with existing code
export const AutonomousCoordinator = TrafficController;

export default TrafficController;
