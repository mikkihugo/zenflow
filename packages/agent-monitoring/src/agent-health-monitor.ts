/**
 * @fileoverview Agent Health Monitor for Comprehensive Swarm Health Management
 *
 * Advanced health monitoring system for tracking agent performance, detecting degradation,
 * and providing intelligent recovery recommendations. Integrates with the existing
 * coordination system and ruv-swarm capabilities to ensure optimal swarm performance.
 *
 * Key Features:
 * - Real-time health status tracking (healthy, degraded, unhealthy)
 * - Performance metrics monitoring (CPU, memory, task success rate)
 * - Health trend analysis and predictive degradation detection
 * - Automated alerting and notification system
 * - Recovery action recommendations with confidence scoring
 * - Integration with learning and prediction systems
 * - Advanced analytics and reporting capabilities
 *
 * @author Claude Code Zen Team - Health Monitor Developer Agent
 * @since 1.0.0-alpha.43
 * @version 1.0.0
 *
 * @requires ../types.ts - Core coordination types
 * @requires ../../config/logging-config.ts - Logging configuration
 * @requires ./agent-learning-system.ts - Learning system integration
 *
 * @example
 * ```typescript
 * const healthMonitor = new AgentHealthMonitor({
 *   healthCheckInterval: 30000,
 *   alertThresholds: {
 *     cpu: 0.8,
 *     memory: 0.9,
 *     taskFailureRate: 0.3
 *   }
 * });
 *
 * // Monitor agent health
 * healthMonitor.updateAgentHealth('agent-1', {
 *   cpuUsage: 0.65,
 *   memoryUsage: 0.45,
 *   taskSuccessRate: 0.92
 * });
 *
 * // Get health status
 * const status = healthMonitor.getAgentHealth('agent-1');
 * console.log(`Agent health: ${status.status}`);
 * ```
 */

import { getLogger } from '../../config/logging-config';
import type { AgentId, AgentMetrics, AgentStatus } from '../types';
import type { AgentLearningSystem } from './agent-learning-system';

const logger = getLogger('coordination-intelligence-agent-health-monitor');

/**
 * Agent health status enumeration
 */
export type HealthStatus =
  | 'healthy'
  | 'degraded'
  | 'unhealthy'
  | 'critical'
  | 'unknown';

/**
 * Health alert severity levels
 */
export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

/**
 * Agent health metrics interface
 */
export interface AgentHealth {
  agentId: AgentId;
  status: HealthStatus;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage?: number;
  networkLatency?: number;
  taskSuccessRate: number;
  averageResponseTime: number;
  errorRate: number;
  lastSeen: Date;
  uptime: number;
  healthScore: number;
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: Date;
}

/**
 * Health trend analysis data
 */
export interface HealthTrend {
  agentId: AgentId;
  timeWindow: number;
  dataPoints: HealthDataPoint[];
  trend: 'improving' | 'stable' | 'declining';
  slope: number;
  confidence: number;
  prediction: HealthPrediction;
}

/**
 * Individual health data point
 */
export interface HealthDataPoint {
  timestamp: number;
  healthScore: number;
  cpuUsage: number;
  memoryUsage: number;
  taskSuccessRate: number;
  responseTime: number;
  errorRate: number;
}

/**
 * Health prediction interface
 */
export interface HealthPrediction {
  predictedStatus: HealthStatus;
  timeToStatusChange: number; // milliseconds
  confidence: number;
  factors: string[];
  recommendations: RecoveryAction[];
}

/**
 * Recovery action recommendation
 */
export interface RecoveryAction {
  id: string;
  type:
    | 'restart'
    | 'scale_down'
    | 'scale_up'
    | 'optimize'
    | 'maintenance'
    | 'redistribute'
    | 'isolate';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  expectedImpact: string;
  estimatedDuration: number; // milliseconds
  confidence: number;
  prerequisites: string[];
  riskLevel: 'low' | 'medium' | 'high';
  automation: boolean;
  metadata: Record<string, unknown>;
}

/**
 * Health alert interface
 */
export interface HealthAlert {
  id: string;
  agentId: AgentId;
  severity: AlertSeverity;
  type: string;
  message: string;
  details: Record<string, unknown>;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  actions: RecoveryAction[];
}

/**
 * Health monitor configuration
 */
export interface HealthMonitorConfig {
  /** Health check interval in milliseconds */
  healthCheckInterval: number;
  /** Number of historical data points to maintain */
  historyRetention: number;
  /** Alert thresholds for various metrics */
  alertThresholds: {
    cpu: number;
    memory: number;
    diskUsage: number;
    networkLatency: number;
    taskFailureRate: number;
    responseTime: number;
    errorRate: number;
  };
  /** Health score calculation weights */
  healthScoreWeights: {
    cpuUsage: number;
    memoryUsage: number;
    taskSuccessRate: number;
    responseTime: number;
    errorRate: number;
    uptime: number;
  };
  /** Trend analysis configuration */
  trendAnalysis: {
    windowSize: number;
    minDataPoints: number;
    significanceThreshold: number;
  };
  /** Prediction configuration */
  prediction: {
    enabled: boolean;
    horizonMinutes: number;
    updateInterval: number;
  };
  /** Recovery configuration */
  recovery: {
    enableAutoRecovery: boolean;
    maxRecoveryAttempts: number;
    recoveryBackoffMs: number;
  };
  /** Alert configuration */
  alerts: {
    enableAlerting: boolean;
    aggregationWindow: number;
    maxAlertsPerAgent: number;
  };
}

/**
 * System-wide health summary
 */
export interface SystemHealthSummary {
  totalAgents: number;
  healthyAgents: number;
  degradedAgents: number;
  unhealthyAgents: number;
  criticalAgents: number;
  unknownAgents: number;
  averageHealthScore: number;
  systemHealthScore: number;
  activeAlerts: number;
  criticalAlerts: number;
  recentRecoveries: number;
  topIssues: Array<{
    type: string;
    count: number;
    severity: AlertSeverity;
  }>;
  performanceTrends: {
    cpu: 'improving' | 'stable' | 'declining';
    memory: 'improving' | 'stable' | 'declining';
    taskSuccess: 'improving' | 'stable' | 'declining';
    responseTime: 'improving' | 'stable' | 'declining';
  };
  lastUpdated: Date;
}

/**
 * Agent Health Monitor - Comprehensive Health Management System
 *
 * This system provides real-time monitoring, trend analysis, predictive health detection,
 * and automated recovery recommendations for swarm agents. It integrates with the existing
 * learning system to provide intelligent health optimization.
 *
 * Key capabilities:
 * - Real-time health status tracking and scoring
 * - Predictive degradation detection with confidence levels
 * - Automated alerting with severity classification
 * - Intelligent recovery action recommendations
 * - Historical trend analysis and pattern detection
 * - Integration with learning systems for optimization
 * - System-wide health analytics and reporting
 */
export class AgentHealthMonitor {
  private healthMetrics = new Map<AgentId, AgentHealth>();
  private healthHistory = new Map<AgentId, HealthDataPoint[]>();
  private healthTrends = new Map<AgentId, HealthTrend>();
  private activeAlerts = new Map<string, HealthAlert>();
  private recoveryActions = new Map<AgentId, RecoveryAction[]>();
  private config: HealthMonitorConfig;
  private monitoringTimer?: NodeJS.Timeout;
  private alertCounter = 0;
  private learningSystem?: AgentLearningSystem;
  private lastSystemHealthCheck = 0;

  constructor(
    config: Partial<HealthMonitorConfig> = {},
    learningSystem?: AgentLearningSystem
  ) {
    this.config = {
      healthCheckInterval: 30000, // 30 seconds
      historyRetention: 1000, // Keep 1000 data points
      alertThresholds: {
        cpu: 0.8,
        memory: 0.9,
        diskUsage: 0.85,
        networkLatency: 1000, // ms
        taskFailureRate: 0.3,
        responseTime: 5000, // ms
        errorRate: 0.2,
      },
      healthScoreWeights: {
        cpuUsage: 0.2,
        memoryUsage: 0.25,
        taskSuccessRate: 0.3,
        responseTime: 0.15,
        errorRate: 0.1,
        uptime: 0.0,
      },
      trendAnalysis: {
        windowSize: 50,
        minDataPoints: 10,
        significanceThreshold: 0.1,
      },
      prediction: {
        enabled: true,
        horizonMinutes: 30,
        updateInterval: 300000, // 5 minutes
      },
      recovery: {
        enableAutoRecovery: false,
        maxRecoveryAttempts: 3,
        recoveryBackoffMs: 60000, // 1 minute
      },
      alerts: {
        enableAlerting: true,
        aggregationWindow: 300000, // 5 minutes
        maxAlertsPerAgent: 10,
      },
      ...config,
    };

    this.learningSystem = learningSystem;

    logger.info('🏥 Initializing Agent Health Monitor', {
      config: this.config,
      learningIntegration: !!this.learningSystem,
      timestamp: Date.now(),
    });

    this.startHealthMonitoring();
    logger.info('✅ Agent Health Monitor initialized successfully');
  }

  /**
   * Update agent health metrics
   *
   * @param agentId - The ID of the agent
   * @param metrics - Health metrics to update
   */
  public updateAgentHealth(
    agentId: AgentId,
    metrics: Partial<{
      status?: AgentStatus;
      cpuUsage?: number;
      memoryUsage?: number;
      diskUsage?: number;
      networkLatency?: number;
      taskSuccessRate?: number;
      averageResponseTime?: number;
      errorRate?: number;
      uptime?: number;
    }>
  ): void {
    logger.debug(`🔍 Updating health metrics for agent ${agentId}`, {
      metrics,
      timestamp: Date.now(),
    });

    const currentHealth = this.getOrCreateAgentHealth(agentId);
    const now = new Date();

    // Update metrics
    if (metrics.cpuUsage !== undefined)
      currentHealth.cpuUsage = metrics.cpuUsage;
    if (metrics.memoryUsage !== undefined)
      currentHealth.memoryUsage = metrics.memoryUsage;
    if (metrics.diskUsage !== undefined)
      currentHealth.diskUsage = metrics.diskUsage;
    if (metrics.networkLatency !== undefined)
      currentHealth.networkLatency = metrics.networkLatency;
    if (metrics.taskSuccessRate !== undefined)
      currentHealth.taskSuccessRate = metrics.taskSuccessRate;
    if (metrics.averageResponseTime !== undefined)
      currentHealth.averageResponseTime = metrics.averageResponseTime;
    if (metrics.errorRate !== undefined)
      currentHealth.errorRate = metrics.errorRate;
    if (metrics.uptime !== undefined) currentHealth.uptime = metrics.uptime;

    // Update timestamps
    currentHealth.lastSeen = now;
    currentHealth.lastUpdated = now;

    // Calculate health score
    currentHealth.healthScore = this.calculateHealthScore(currentHealth);

    // Determine health status
    currentHealth.status = this.determineHealthStatus(currentHealth);

    // Add to history
    this.addHealthDataPoint(agentId, currentHealth);

    // Update trend analysis
    this.updateHealthTrend(agentId);

    // Check for alerts
    if (this.config.alerts.enableAlerting) {
      this.checkHealthAlerts(agentId, currentHealth);
    }

    // Integrate with learning system
    if (this.learningSystem) {
      this.integratWithLearningSystem(agentId, currentHealth);
    }

    // Update stored health
    this.healthMetrics.set(agentId, currentHealth);

    logger.debug(`✅ Health updated for agent ${agentId}`, {
      status: currentHealth.status,
      healthScore: currentHealth.healthScore,
      trend: currentHealth.trend,
    });
  }

  /**
   * Get agent health status
   *
   * @param agentId - The ID of the agent
   * @returns Agent health information or null if not found
   */
  public getAgentHealth(agentId: AgentId): AgentHealth | null {
    const health = this.healthMetrics.get(agentId);
    if (!health) {
      logger.warn(`⚠️ No health data found for agent ${agentId}`);
      return null;
    }

    logger.debug(`📊 Retrieved health data for agent ${agentId}`, {
      status: health.status,
      healthScore: health.healthScore,
    });

    return { ...health }; // Return a copy
  }

  /**
   * Get list of healthy agents
   *
   * @returns Array of agent Ds that are healthy
   */
  public getHealthyAgents(): AgentId[] {
    const healthyAgents = Array.from(this.healthMetrics.entries())
      .filter(([_, health]) => health.status === 'healthy')
      .map(([agentId, _]) => agentId);

    logger.debug(`🟢 Found ${healthyAgents.length} healthy agents`);
    return healthyAgents;
  }

  /**
   * Get list of degraded agents
   *
   * @returns Array of agent Ds that are degraded
   */
  public getDegradedAgents(): AgentId[] {
    const degradedAgents = Array.from(this.healthMetrics.entries())
      .filter(([_, health]) => health.status === 'degraded')
      .map(([agentId, _]) => agentId);

    logger.debug(`🟡 Found ${degradedAgents.length} degraded agents`);
    return degradedAgents;
  }

  /**
   * Get list of unhealthy agents
   *
   * @returns Array of agent Ds that are unhealthy
   */
  public getUnhealthyAgents(): AgentId[] {
    const unhealthyAgents = Array.from(this.healthMetrics.entries())
      .filter(
        ([_, health]) =>
          health.status === 'unhealthy' || health.status === 'critical'
      )
      .map(([agentId, _]) => agentId);

    logger.debug(`🔴 Found ${unhealthyAgents.length} unhealthy agents`);
    return unhealthyAgents;
  }

  /**
   * Get health trend analysis for an agent
   *
   * @param agentId - The ID of the agent
   * @returns Health trend analysis or null if insufficient data
   */
  public getHealthTrend(agentId: AgentId): HealthTrend | null {
    const trend = this.healthTrends.get(agentId);
    if (!trend) {
      logger.warn(`⚠️ No trend data available for agent ${agentId}`);
      return null;
    }

    logger.debug(`📈 Retrieved trend analysis for agent ${agentId}`, {
      trend: trend.trend,
      confidence: trend.confidence,
    });

    return { ...trend };
  }

  /**
   * Get recovery recommendations for an agent
   *
   * @param agentId - The ID of the agent
   * @returns Array of recovery actions
   */
  public getRecoveryRecommendations(agentId: AgentId): RecoveryAction[] {
    const health = this.healthMetrics.get(agentId);
    if (!health) {
      logger.warn(
        `⚠️ No health data for recovery recommendations: agent ${agentId}`
      );
      return [];
    }

    const actions = this.generateRecoveryActions(agentId, health);
    this.recoveryActions.set(agentId, actions);

    logger.debug(
      `💡 Generated ${actions.length} recovery recommendations for agent ${agentId}`
    );
    return actions;
  }

  /**
   * Get active alerts for an agent
   *
   * @param agentId - The ID of the agent (optional)
   * @returns Array of active alerts
   */
  public getActiveAlerts(agentId?: AgentId): HealthAlert[] {
    const alerts = Array.from(this.activeAlerts.values()).filter(
      (alert) => !alert.resolved && (!agentId || alert.agentId === agentId)
    );

    logger.debug(
      `🚨 Found ${alerts.length} active alerts${agentId ? ` for agent ${agentId}` : ''}`
    );
    return alerts;
  }

  /**
   * Get system-wide health summary
   *
   * @returns System health summary
   */
  public getSystemHealthSummary(): SystemHealthSummary {
    const allHealth = Array.from(this.healthMetrics.values());
    const now = new Date();

    // Count agents by status
    const statusCounts = {
      healthy: 0,
      degraded: 0,
      unhealthy: 0,
      critical: 0,
      unknown: 0,
    };

    for (const health of allHealth) {
      statusCounts[health.status] = (statusCounts[health.status] || 0) + 1;
    }

    // Calculate averages
    const averageHealthScore =
      allHealth.length > 0
        ? allHealth.reduce((sum, h) => sum + h.healthScore, 0) /
          allHealth.length
        : 0;

    // Calculate system health score (weighted by agent health and distribution)
    const systemHealthScore = this.calculateSystemHealthScore(
      allHealth,
      statusCounts
    );

    // Count alerts
    const activeAlerts = Array.from(this.activeAlerts.values()).filter(
      (a) => !a.resolved
    );
    const criticalAlerts = activeAlerts.filter(
      (a) => a.severity === 'critical'
    ).length;

    // Analyze performance trends
    const performanceTrends = this.analyzeSystemPerformanceTrends();

    // Get top issues
    const topIssues = this.getTopHealthIssues();

    const summary: SystemHealthSummary = {
      totalAgents: allHealth.length,
      healthyAgents: statusCounts.healthy,
      degradedAgents: statusCounts.degraded,
      unhealthyAgents: statusCounts.unhealthy,
      criticalAgents: statusCounts.critical,
      unknownAgents: statusCounts.unknown,
      averageHealthScore,
      systemHealthScore,
      activeAlerts: activeAlerts.length,
      criticalAlerts,
      recentRecoveries: this.countRecentRecoveries(),
      topIssues,
      performanceTrends,
      lastUpdated: now,
    };

    logger.info('📊 Generated system health summary', {
      totalAgents: summary.totalAgents,
      systemHealthScore: summary.systemHealthScore,
      activeAlerts: summary.activeAlerts,
    });

    return summary;
  }

  /**
   * Resolve a health alert
   *
   * @param alertId - The ID of the alert to resolve
   * @param resolution - Resolution details
   */
  public resolveAlert(alertId: string, resolution?: string): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) {
      logger.warn(`⚠️ Alert not found: ${alertId}`);
      return false;
    }

    alert.resolved = true;
    alert.resolvedAt = new Date();
    if (resolution) {
      alert.details.resolution = resolution;
    }

    logger.info(`✅ Alert resolved: ${alertId}`, {
      agentId: alert.agentId,
      type: alert.type,
      resolution,
    });

    return true;
  }

  /**
   * Execute a recovery action for an agent
   *
   * @param agentId - The ID of the agent
   * @param actionId - The ID of the recovery action
   * @returns Promise resolving to success status
   */
  public async executeRecoveryAction(
    agentId: AgentId,
    actionId: string
  ): Promise<boolean> {
    const actions = this.recoveryActions.get(agentId);
    const action = actions?.find((a) => a.id === actionId);

    if (!action) {
      logger.warn(
        `⚠️ Recovery action not found: ${actionId} for agent ${agentId}`
      );
      return false;
    }

    logger.info(
      `🔧 Executing recovery action: ${action.type} for agent ${agentId}`,
      {
        description: action.description,
        priority: action.priority,
      }
    );

    try {
      // This would integrate with actual agent management system
      // For now, we simulate the action
      await this.simulateRecoveryAction(agentId, action);

      logger.info(
        `✅ Recovery action completed: ${actionId} for agent ${agentId}`
      );
      return true;
    } catch (error) {
      logger.error(
        `❌ Recovery action failed: ${actionId} for agent ${agentId}`,
        error
      );
      return false;
    }
  }

  /**
   * Start health monitoring timer
   */
  private startHealthMonitoring(): void {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
    }

    this.monitoringTimer = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);

    logger.debug('⏰ Health monitoring timer started', {
      interval: this.config.healthCheckInterval,
    });
  }

  /**
   * Perform periodic health check on all agents
   */
  private performHealthCheck(): void {
    const now = Date.now();

    // Check for stale agents
    for (const [agentId, health] of this.healthMetrics) {
      const timeSinceLastSeen = now - health.lastSeen.getTime();

      if (timeSinceLastSeen > this.config.healthCheckInterval * 2) {
        // Agent hasn't been seen recently
        health.status = 'unknown';
        health.healthScore = Math.max(0, health.healthScore - 0.1);
        health.lastUpdated = new Date(now);

        logger.warn(`⚠️ Agent appears stale: ${agentId}`, {
          timeSinceLastSeen,
          currentStatus: health.status,
        });
      }
    }

    // Update system-wide trends if needed
    if (
      now - this.lastSystemHealthCheck >
      this.config.prediction.updateInterval
    ) {
      this.updateSystemHealthTrends();
      this.lastSystemHealthCheck = now;
    }

    logger.debug('🔍 Periodic health check completed', {
      totalAgents: this.healthMetrics.size,
      timestamp: now,
    });
  }

  /**
   * Get or create agent health record
   */
  private getOrCreateAgentHealth(agentId: AgentId): AgentHealth {
    let health = this.healthMetrics.get(agentId);

    if (!health) {
      const now = new Date();
      health = {
        agentId,
        status: 'unknown',
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0,
        networkLatency: 0,
        taskSuccessRate: 0,
        averageResponseTime: 0,
        errorRate: 0,
        lastSeen: now,
        uptime: 0,
        healthScore: 0.5, // Neutral starting score
        trend: 'stable',
        lastUpdated: now,
      };

      this.healthMetrics.set(agentId, health);
      this.healthHistory.set(agentId, []);

      logger.debug(`🆕 Created new health record for agent ${agentId}`);
    }

    return health;
  }

  /**
   * Calculate health score based on metrics
   */
  private calculateHealthScore(health: AgentHealth): number {
    const weights = this.config.healthScoreWeights;

    // Normalize metrics to 0-1 range where 1 is optimal
    const normalizedCpu = Math.max(0, 1 - health.cpuUsage);
    const normalizedMemory = Math.max(0, 1 - health.memoryUsage);
    const normalizedTaskSuccess = health.taskSuccessRate;
    const normalizedResponseTime = Math.max(
      0,
      1 - health.averageResponseTime / 10000
    ); // 10s max
    const normalizedErrorRate = Math.max(0, 1 - health.errorRate);
    const normalizedUptime = Math.min(1, health.uptime / (24 * 60 * 60 * 1000)); // 24h max

    const score =
      normalizedCpu * weights.cpuUsage +
      normalizedMemory * weights.memoryUsage +
      normalizedTaskSuccess * weights.taskSuccessRate +
      normalizedResponseTime * weights.responseTime +
      normalizedErrorRate * weights.errorRate +
      normalizedUptime * weights.uptime;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Determine health status based on health score and metrics
   */
  private determineHealthStatus(health: AgentHealth): HealthStatus {
    const thresholds = this.config.alertThresholds;

    // Critical conditions
    if (
      health.cpuUsage > 0.95 ||
      health.memoryUsage > 0.98 ||
      health.errorRate > 0.5
    ) {
      return 'critical';
    }

    // Unhealthy conditions
    if (
      health.healthScore < 0.3 ||
      health.cpuUsage > thresholds.cpu ||
      health.memoryUsage > thresholds.memory ||
      health.errorRate > thresholds.errorRate
    ) {
      return 'unhealthy';
    }

    // Degraded conditions
    if (
      health.healthScore < 0.6 ||
      health.taskSuccessRate < 1 - thresholds.taskFailureRate ||
      health.averageResponseTime > thresholds.responseTime
    ) {
      return 'degraded';
    }

    // Healthy
    if (health.healthScore >= 0.7) {
      return 'healthy';
    }

    return 'unknown';
  }

  /**
   * Add health data point to history
   */
  private addHealthDataPoint(agentId: AgentId, health: AgentHealth): void {
    const history = this.healthHistory.get(agentId) || [];

    const dataPoint: HealthDataPoint = {
      timestamp: Date.now(),
      healthScore: health.healthScore,
      cpuUsage: health.cpuUsage,
      memoryUsage: health.memoryUsage,
      taskSuccessRate: health.taskSuccessRate,
      responseTime: health.averageResponseTime,
      errorRate: health.errorRate,
    };

    history.push(dataPoint);

    // Maintain history size
    if (history.length > this.config.historyRetention) {
      history.shift();
    }

    this.healthHistory.set(agentId, history);
  }

  /**
   * Update health trend analysis
   */
  private updateHealthTrend(agentId: AgentId): void {
    const history = this.healthHistory.get(agentId);
    if (!history || history.length < this.config.trendAnalysis.minDataPoints) {
      return;
    }

    const windowSize = Math.min(
      this.config.trendAnalysis.windowSize,
      history.length
    );
    const recentData = history.slice(-windowSize);

    // Calculate trend slope using linear regression
    const n = recentData.length;
    const sumX = recentData.reduce((sum, _, i) => sum + i, 0);
    const sumY = recentData.reduce((sum, point) => sum + point.healthScore, 0);
    const sumXY = recentData.reduce(
      (sum, point, i) => sum + i * point.healthScore,
      0
    );
    const sumXX = recentData.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const trend =
      Math.abs(slope) < this.config.trendAnalysis.significanceThreshold
        ? 'stable'
        : slope > 0
          ? 'improving'
          : 'declining';

    // Calculate confidence based on data consistency
    const variance = this.calculateVariance(
      recentData.map((p) => p.healthScore)
    );
    const confidence = Math.max(0.1, Math.min(1, 1 - variance));

    // Generate prediction
    const prediction = this.generateHealthPrediction(
      agentId,
      recentData,
      slope,
      confidence
    );

    const healthTrend: HealthTrend = {
      agentId,
      timeWindow: windowSize,
      dataPoints: recentData,
      trend,
      slope,
      confidence,
      prediction,
    };

    this.healthTrends.set(agentId, healthTrend);

    // Update agent health trend
    const health = this.healthMetrics.get(agentId);
    if (health) {
      health.trend = trend;
    }
  }

  /**
   * Generate health prediction
   */
  private generateHealthPrediction(
    agentId: AgentId,
    recentData: HealthDataPoint[],
    slope: number,
    confidence: number
  ): HealthPrediction {
    const currentScore = recentData[recentData.length - 1].healthScore;
    const horizonMs = this.config.prediction.horizonMinutes * 60 * 1000;

    // Project health score forward
    const projectedScore = Math.max(
      0,
      Math.min(1, currentScore + slope * this.config.trendAnalysis.windowSize)
    );

    let predictedStatus: HealthStatus = 'unknown';
    if (projectedScore >= 0.7) predictedStatus = 'healthy';
    else if (projectedScore >= 0.6) predictedStatus = 'degraded';
    else if (projectedScore >= 0.3) predictedStatus = 'unhealthy';
    else predictedStatus = 'critical';

    // Estimate time to status change
    const currentHealth = this.healthMetrics.get(agentId);
    let timeToStatusChange = horizonMs;

    if (
      currentHealth &&
      currentHealth.status !== predictedStatus &&
      Math.abs(slope) > 0.001
    ) {
      const scoreThresholds = {
        healthy: 0.7,
        degraded: 0.6,
        unhealthy: 0.3,
        critical: 0,
      };
      const targetScore =
        scoreThresholds[predictedStatus as keyof typeof scoreThresholds];
      const scoreDiff = Math.abs(targetScore - currentScore);
      timeToStatusChange = Math.min(
        horizonMs,
        (scoreDiff / Math.abs(slope)) * this.config.healthCheckInterval
      );
    }

    // Identify contributing factors
    const factors: string[] = [];
    const lastPoint = recentData[recentData.length - 1];

    if (lastPoint.cpuUsage > this.config.alertThresholds.cpu)
      factors.push('High CPU usage');
    if (lastPoint.memoryUsage > this.config.alertThresholds.memory)
      factors.push('High memory usage');
    if (lastPoint.taskSuccessRate < 0.7) factors.push('Low task success rate');
    if (lastPoint.responseTime > this.config.alertThresholds.responseTime)
      factors.push('High response time');
    if (lastPoint.errorRate > this.config.alertThresholds.errorRate)
      factors.push('High error rate');

    // Generate recommendations based on prediction
    const recommendations = this.generateRecoveryActions(
      agentId,
      currentHealth!
    );

    return {
      predictedStatus,
      timeToStatusChange,
      confidence,
      factors,
      recommendations,
    };
  }

  /**
   * Check for health alerts
   */
  private checkHealthAlerts(agentId: AgentId, health: AgentHealth): void {
    const thresholds = this.config.alertThresholds;
    const alerts: Omit<HealthAlert, 'id'>[] = [];

    // CPU usage alert
    if (health.cpuUsage > thresholds.cpu) {
      alerts.push({
        agentId,
        severity: health.cpuUsage > 0.95 ? 'critical' : 'warning',
        type: 'high_cpu_usage',
        message: `High CPU usage: ${(health.cpuUsage * 100).toFixed(1)}%`,
        details: { cpuUsage: health.cpuUsage, threshold: thresholds.cpu },
        timestamp: new Date(),
        resolved: false,
        actions: [],
      });
    }

    // Memory usage alert
    if (health.memoryUsage > thresholds.memory) {
      alerts.push({
        agentId,
        severity: health.memoryUsage > 0.98 ? 'critical' : 'error',
        type: 'high_memory_usage',
        message: `High memory usage: ${(health.memoryUsage * 100).toFixed(1)}%`,
        details: {
          memoryUsage: health.memoryUsage,
          threshold: thresholds.memory,
        },
        timestamp: new Date(),
        resolved: false,
        actions: [],
      });
    }

    // Task failure rate alert
    const taskFailureRate = 1 - health.taskSuccessRate;
    if (taskFailureRate > thresholds.taskFailureRate) {
      alerts.push({
        agentId,
        severity: taskFailureRate > 0.5 ? 'critical' : 'error',
        type: 'high_task_failure_rate',
        message: `High task failure rate: ${(taskFailureRate * 100).toFixed(1)}%`,
        details: { taskFailureRate, threshold: thresholds.taskFailureRate },
        timestamp: new Date(),
        resolved: false,
        actions: [],
      });
    }

    // Response time alert
    if (health.averageResponseTime > thresholds.responseTime) {
      alerts.push({
        agentId,
        severity:
          health.averageResponseTime > thresholds.responseTime * 2
            ? 'error'
            : 'warning',
        type: 'high_response_time',
        message: `High response time: ${health.averageResponseTime.toFixed(0)}ms`,
        details: {
          responseTime: health.averageResponseTime,
          threshold: thresholds.responseTime,
        },
        timestamp: new Date(),
        resolved: false,
        actions: [],
      });
    }

    // Error rate alert
    if (health.errorRate > thresholds.errorRate) {
      alerts.push({
        agentId,
        severity: health.errorRate > 0.5 ? 'critical' : 'error',
        type: 'high_error_rate',
        message: `High error rate: ${(health.errorRate * 100).toFixed(1)}%`,
        details: {
          errorRate: health.errorRate,
          threshold: thresholds.errorRate,
        },
        timestamp: new Date(),
        resolved: false,
        actions: [],
      });
    }

    // Create alerts
    for (const alertData of alerts) {
      const alertId = `alert-${++this.alertCounter}-${Date.now()}`;
      const alert: HealthAlert = { id: alertId, ...alertData };

      // Generate recovery actions for this alert
      alert.actions = this.generateRecoveryActions(agentId, health);

      this.activeAlerts.set(alertId, alert);

      logger.warn(
        `🚨 Health alert created: ${alert.type} for agent ${agentId}`,
        {
          severity: alert.severity,
          message: alert.message,
        }
      );
    }
  }

  /**
   * Generate recovery actions for an agent
   */
  private generateRecoveryActions(
    agentId: AgentId,
    health: AgentHealth
  ): RecoveryAction[] {
    const actions: RecoveryAction[] = [];
    let actionCounter = 0;

    // High CPU usage recovery
    if (health.cpuUsage > this.config.alertThresholds.cpu) {
      actions.push({
        id: `recovery-${agentId}-cpu-${++actionCounter}`,
        type: 'optimize',
        priority: health.cpuUsage > 0.95 ? 'critical' : 'high',
        description: 'Optimize CPU-intensive operations and reduce workload',
        expectedImpact: `Reduce CPU usage by 20-40%`,
        estimatedDuration: 30000, // 30 seconds
        confidence: 0.8,
        prerequisites: ['Agent must be responsive'],
        riskLevel: 'low',
        automation: true,
        metadata: { currentCpu: health.cpuUsage, targetCpu: 0.7 },
      });
    }

    // High memory usage recovery
    if (health.memoryUsage > this.config.alertThresholds.memory) {
      actions.push({
        id: `recovery-${agentId}-memory-${++actionCounter}`,
        type: 'optimize',
        priority: health.memoryUsage > 0.98 ? 'critical' : 'high',
        description: 'Clear memory caches and optimize memory usage',
        expectedImpact: `Reduce memory usage by 15-30%`,
        estimatedDuration: 15000, // 15 seconds
        confidence: 0.9,
        prerequisites: ['Memory cleanup tools available'],
        riskLevel: 'low',
        automation: true,
        metadata: { currentMemory: health.memoryUsage, targetMemory: 0.8 },
      });
    }

    // Poor task performance recovery
    if (health.taskSuccessRate < 0.7) {
      actions.push({
        id: `recovery-${agentId}-tasks-${++actionCounter}`,
        type: 'scale_down',
        priority: 'medium',
        description: 'Reduce task load and focus on easier tasks',
        expectedImpact: `Improve task success rate to 80-90%`,
        estimatedDuration: 60000, // 1 minute
        confidence: 0.7,
        prerequisites: ['Task queue management available'],
        riskLevel: 'medium',
        automation: false,
        metadata: {
          currentSuccessRate: health.taskSuccessRate,
          targetSuccessRate: 0.85,
        },
      });
    }

    // High response time recovery
    if (health.averageResponseTime > this.config.alertThresholds.responseTime) {
      actions.push({
        id: `recovery-${agentId}-latency-${++actionCounter}`,
        type: 'optimize',
        priority: 'medium',
        description:
          'Optimize response time through caching and async processing',
        expectedImpact: `Reduce response time by 30-50%`,
        estimatedDuration: 45000, // 45 seconds
        confidence: 0.75,
        prerequisites: ['Performance optimization tools available'],
        riskLevel: 'low',
        automation: true,
        metadata: {
          currentResponseTime: health.averageResponseTime,
          targetResponseTime: 2000,
        },
      });
    }

    // Critical health recovery
    if (health.status === 'critical') {
      actions.push({
        id: `recovery-${agentId}-restart-${++actionCounter}`,
        type: 'restart',
        priority: 'critical',
        description: 'Restart agent to recover from critical state',
        expectedImpact: `Reset agent to healthy state`,
        estimatedDuration: 120000, // 2 minutes
        confidence: 0.95,
        prerequisites: ['Agent restart capability available'],
        riskLevel: 'high',
        automation: false,
        metadata: { reason: 'critical_health_status' },
      });
    }

    return actions;
  }

  /**
   * Integrate with learning system
   */
  private integratWithLearningSystem(
    agentId: AgentId,
    health: AgentHealth
  ): void {
    if (!this.learningSystem) return;

    // Update learning system with health-based performance
    const success = health.taskSuccessRate > 0.7 && health.healthScore > 0.6;

    this.learningSystem.updateAgentPerformance(agentId, success, {
      duration: health.averageResponseTime,
      quality: health.healthScore,
      resourceUsage: (health.cpuUsage + health.memoryUsage) / 2,
      taskType: 'health_monitoring',
    });
  }

  /**
   * Calculate system health score
   */
  private calculateSystemHealthScore(
    allHealth: AgentHealth[],
    statusCounts: Record<string, number>
  ): number {
    if (allHealth.length === 0) return 0;

    const totalAgents = allHealth.length;
    const healthyWeight = 1.0;
    const degradedWeight = 0.6;
    const unhealthyWeight = 0.2;
    const criticalWeight = 0.0;

    const weightedScore =
      (statusCounts.healthy * healthyWeight +
        statusCounts.degraded * degradedWeight +
        statusCounts.unhealthy * unhealthyWeight +
        statusCounts.critical * criticalWeight) /
      totalAgents;

    return Math.max(0, Math.min(1, weightedScore));
  }

  /**
   * Analyze system performance trends
   */
  private analyzeSystemPerformanceTrends(): SystemHealthSummary['performanceTrends'] {
    const allTrends = Array.from(this.healthTrends.values());

    if (allTrends.length === 0) {
      return {
        cpu: 'stable',
        memory: 'stable',
        taskSuccess: 'stable',
        responseTime: 'stable',
      };
    }

    // Aggregate trends by metric
    const cpuTrends = allTrends.map((t) => t.slope); // Simplified - would analyze CPU-specific data
    const memoryTrends = allTrends.map((t) => t.slope);
    const taskTrends = allTrends.map((t) => t.slope);
    const responseTrends = allTrends.map((t) => t.slope);

    const getOverallTrend = (slopes: number[]) => {
      const avgSlope =
        slopes.reduce((sum, slope) => sum + slope, 0) / slopes.length;
      return Math.abs(avgSlope) < 0.01
        ? 'stable'
        : avgSlope > 0
          ? 'improving'
          : 'declining';
    };

    return {
      cpu: getOverallTrend(cpuTrends),
      memory: getOverallTrend(memoryTrends),
      taskSuccess: getOverallTrend(taskTrends),
      responseTime: getOverallTrend(responseTrends),
    };
  }

  /**
   * Get top health issues
   */
  private getTopHealthIssues(): Array<{
    type: string;
    count: number;
    severity: AlertSeverity;
  }> {
    const issueMap = new Map<
      string,
      { count: number; severity: AlertSeverity }
    >();

    for (const alert of this.activeAlerts.values()) {
      if (!alert.resolved) {
        const existing = issueMap.get(alert.type);
        if (existing) {
          existing.count++;
          // Keep the highest severity
          if (
            this.getSeverityWeight(alert.severity) >
            this.getSeverityWeight(existing.severity)
          ) {
            existing.severity = alert.severity;
          }
        } else {
          issueMap.set(alert.type, { count: 1, severity: alert.severity });
        }
      }
    }

    return Array.from(issueMap.entries())
      .map(([type, data]) => ({ type, ...data }))
      .sort((a, b) => {
        // Sort by severity first, then by count
        const severityDiff =
          this.getSeverityWeight(b.severity) -
          this.getSeverityWeight(a.severity);
        return severityDiff !== 0 ? severityDiff : b.count - a.count;
      })
      .slice(0, 10); // Top 10 issues
  }

  /**
   * Get severity weight for sorting
   */
  private getSeverityWeight(severity: AlertSeverity): number {
    const weights = { info: 1, warning: 2, error: 3, critical: 4 };
    return weights[severity] || 0;
  }

  /**
   * Count recent recoveries
   */
  private countRecentRecoveries(): number {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    let count = 0;

    for (const alert of this.activeAlerts.values()) {
      if (
        alert.resolved &&
        alert.resolvedAt &&
        alert.resolvedAt.getTime() > oneHourAgo
      ) {
        count++;
      }
    }

    return count;
  }

  /**
   * Calculate variance of an array
   */
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;

    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const squaredDiffs = values.map((value) => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  /**
   * Update system-wide health trends
   */
  private updateSystemHealthTrends(): void {
    // Update predictions for all agents
    for (const agentId of this.healthMetrics.keys()) {
      this.updateHealthTrend(agentId);
    }

    logger.debug('🔮 System-wide health trends updated');
  }

  /**
   * Simulate recovery action execution
   */
  private async simulateRecoveryAction(
    agentId: AgentId,
    action: RecoveryAction
  ): Promise<void> {
    // Simulate execution time
    await new Promise((resolve) =>
      setTimeout(resolve, Math.min(action.estimatedDuration, 5000))
    );

    // Simulate success/failure based on confidence
    const success = Math.random() < action.confidence;

    if (!success) {
      throw new Error(
        `Recovery action ${action.type} failed for agent ${agentId}`
      );
    }

    // In a real implementation, this would:
    // - Execute actual recovery commands
    // - Monitor execution progress
    // - Update agent state
    // - Report results
  }

  /**
   * Shutdown the health monitor
   */
  public shutdown(): void {
    logger.info('🛑 Shutting down Agent Health Monitor');

    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = undefined;
    }

    // Clear data structures
    this.healthMetrics.clear();
    this.healthHistory.clear();
    this.healthTrends.clear();
    this.activeAlerts.clear();
    this.recoveryActions.clear();

    logger.info('✅ Agent Health Monitor shutdown complete');
  }
}

/**
 * Default configuration for Agent Health Monitor
 */
export const DEFAULT_HEALTH_MONITOR_CONFIG: HealthMonitorConfig = {
  healthCheckInterval: 30000,
  historyRetention: 1000,
  alertThresholds: {
    cpu: 0.8,
    memory: 0.9,
    diskUsage: 0.85,
    networkLatency: 1000,
    taskFailureRate: 0.3,
    responseTime: 5000,
    errorRate: 0.2,
  },
  healthScoreWeights: {
    cpuUsage: 0.2,
    memoryUsage: 0.25,
    taskSuccessRate: 0.3,
    responseTime: 0.15,
    errorRate: 0.1,
    uptime: 0.0,
  },
  trendAnalysis: {
    windowSize: 50,
    minDataPoints: 10,
    significanceThreshold: 0.1,
  },
  prediction: {
    enabled: true,
    horizonMinutes: 30,
    updateInterval: 300000,
  },
  recovery: {
    enableAutoRecovery: false,
    maxRecoveryAttempts: 3,
    recoveryBackoffMs: 60000,
  },
  alerts: {
    enableAlerting: true,
    aggregationWindow: 300000,
    maxAlertsPerAgent: 10,
  },
};

/**
 * Factory function to create Agent Health Monitor with default configuration
 */
export function createAgentHealthMonitor(
  config?: Partial<HealthMonitorConfig>,
  learningSystem?: AgentLearningSystem
): AgentHealthMonitor {
  return new AgentHealthMonitor(config, learningSystem);
}
