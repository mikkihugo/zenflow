/**
 * @fileoverview Health Monitoring Domain Service
 *
 * Pure domain logic for system health assessment and monitoring.
 * Provides comprehensive health scoring and diagnostic capabilities.
 *
 * **Responsibilities:**
 * - Overall system health calculation
 * - Component-level health assessment
 * - Health trend analysis and alerts
 * - Diagnostic recommendations
 * - Performance threshold monitoring
 *
 * **Health Dimensions:**
 * - WIP Management Health: Capacity utilization and optimization
 * - Flow Health: Throughput and cycle time performance
 * - Bottleneck Health: Constraint identification and resolution
 * - Task Coordination Health: Event processing and responsiveness
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

import { getLogger } from '@claude-zen/foundation';
import type {
  BottleneckReport,
  FlowMetrics,
  HealthCheckResult,
  WorkflowTask,
} from '../types/index';
const logger = getLogger('HealthMonitoring'');

/**
 * Component health assessment
 */
export interface ComponentHealthAssessment {
  component: string;
  health: number; // 0-1 scale
  status:'healthy'|'warning'|'critical';
  issues: string[];
  recommendations: string[];
  trend:'improving'|'declining'|'stable';
}

/**
 * Health monitoring configuration
 */
export interface HealthMonitoringConfig {
  /** Health threshold for warnings */
  warningThreshold: number;
  /** Health threshold for critical alerts */
  criticalThreshold: number;
  /** Maximum history length for trend analysis */
  maxHistoryLength: number;
  /** Minimum data points for trend calculation */
  minTrendDataPoints: number;
}

/**
 * Default health monitoring configuration
 */
const DEFAULT_CONFIG: HealthMonitoringConfig = {
  warningThreshold: 0.7,
  criticalThreshold: 0.3,
  maxHistoryLength: 100,
  minTrendDataPoints: 5,
};

/**
 * Performance metrics for health assessment
 */
export interface PerformanceMetrics {
  averageResponseTime: number;
  operationsPerSecond: number;
  lastOperationTime: number;
  errorRate: number;
}

/**
 * Health Monitoring Domain Service
 *
 * Comprehensive health assessment with trend analysis and alerts.
 * Provides actionable insights for system optimization.
 */
export class HealthMonitoringService {
  private config: HealthMonitoringConfig;
  private healthHistory: HealthCheckResult[] = [];
  private performanceMetrics: PerformanceMetrics;

  constructor(
    config: Partial<HealthMonitoringConfig> = {},
    initialPerformanceMetrics?: Partial<PerformanceMetrics>
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.performanceMetrics = {
      averageResponseTime: 0,
      operationsPerSecond: 0,
      lastOperationTime: Date.now(),
      errorRate: 0,
      ...initialPerformanceMetrics,
    };

    logger.info('HealthMonitoringService initialized,this.config');
  }

  /**
   * Perform comprehensive system health check
   */
  async performHealthCheck(
    allTasks: WorkflowTask[],
    bottleneckReport: BottleneckReport,
    flowMetrics: FlowMetrics| null
  ): Promise<HealthCheckResult> {
    const timestamp = new Date();
    
    logger.debug('Performing health check,{
      totalTasks: allTasks.length,
      bottlenecks: bottleneckReport.bottlenecks.length,
      hasFlowMetrics: !!flowMetrics,
    });

    // Calculate individual component health
    const wipHealth = this.calculateWIPHealth(allTasks);
    const bottleneckHealth = this.calculateBottleneckHealth(bottleneckReport);
    const flowHealth = this.calculateFlowHealth(flowMetrics);
    const coordinationHealth = this.calculateCoordinationHealth();

    // Calculate overall health score
    const componentWeights = {
      wipManagement: 0.25,
      bottleneckDetection: 0.30,
      flowOptimization: 0.25,
      taskCoordination: 0.20,
    };

    const overallHealth = 
      wipHealth * componentWeights.wipManagement +
      bottleneckHealth * componentWeights.bottleneckDetection +
      flowHealth * componentWeights.flowOptimization +
      coordinationHealth * componentWeights.taskCoordination;

    // Generate health result
    const healthResult: HealthCheckResult = {
      timestamp,
      overallHealth,
      componentHealth: {
        wipManagement: wipHealth,
        bottleneckDetection: bottleneckHealth,
        flowOptimization: flowHealth,
        taskCoordination: coordinationHealth,
      },
      activeIssues: bottleneckReport.bottlenecks,
      recommendations: this.generateRecommendations(
        overallHealth,
        wipHealth,
        bottleneckHealth,
        flowHealth,
        coordinationHealth
      ),
    };

    // Store in history for trend analysis
    this.healthHistory.push(healthResult);
    if (this.healthHistory.length > this.config.maxHistoryLength) {
      this.healthHistory.shift();
    }

    // Log health status
    const status = this.getHealthStatus(overallHealth);
    logger.info(`System health check complete: ${status}`, {
      overallHealth: Math.round(overallHealth * 100),
      components: {
        wip: Math.round(wipHealth * 100),
        bottlenecks: Math.round(bottleneckHealth * 100),
        flow: Math.round(flowHealth * 100),
        coordination: Math.round(coordinationHealth * 100),
      },
    });

    return healthResult;
  }

  /**
   * Get detailed component health assessments
   */
  async getComponentHealthAssessments(
    allTasks: WorkflowTask[],
    bottleneckReport: BottleneckReport,
    flowMetrics: FlowMetrics| null
  ): Promise<ComponentHealthAssessment[]> {
    const assessments: ComponentHealthAssessment[] = [];

    // WIP Management Assessment
    const wipHealth = this.calculateWIPHealth(allTasks);
    assessments.push({
      component:'WIP Management,
      health: wipHealth,
      status: this.getHealthStatus(wipHealth),
      issues: this.getWIPIssues(allTasks),
      recommendations: this.getWIPRecommendations(wipHealth),
      trend: this.calculateHealthTrend('wipManagement'),
    });

    // Bottleneck Detection Assessment
    const bottleneckHealth = this.calculateBottleneckHealth(bottleneckReport);
    assessments.push({
      component:'Bottleneck Detection,
      health: bottleneckHealth,
      status: this.getHealthStatus(bottleneckHealth),
      issues: bottleneckReport.bottlenecks.map(b => `${{b.severity} bottleneck in ${b.state}}`),
      recommendations: bottleneckReport.recommendations.map(r => r.description),
      trend: this.calculateHealthTrend('bottleneckDetection'),
    });

    // Flow Optimization Assessment
    const flowHealth = this.calculateFlowHealth(flowMetrics);
    assessments.push({
      component:'Flow Optimization,
      health: flowHealth,
      status: this.getHealthStatus(flowHealth),
      issues: this.getFlowIssues(flowMetrics),
      recommendations: this.getFlowRecommendations(flowHealth),
      trend: this.calculateHealthTrend('flowOptimization'),
    });

    // Task Coordination Assessment
    const coordinationHealth = this.calculateCoordinationHealth();
    assessments.push({
      component:'Task Coordination,
      health: coordinationHealth,
      status: this.getHealthStatus(coordinationHealth),
      issues: this.getCoordinationIssues(),
      recommendations: this.getCoordinationRecommendations(coordinationHealth),
      trend: this.calculateHealthTrend('taskCoordination'),
    });

    return assessments;
  }

  /**
   * Update performance metrics for health calculation
   */
  updatePerformanceMetrics(metrics: Partial<PerformanceMetrics>): void {
    this.performanceMetrics = { ...this.performanceMetrics, ...metrics };
    
    logger.debug('Performance metrics updated,{
      responseTime: this.performanceMetrics.averageResponseTime,
      operationsPerSecond: this.performanceMetrics.operationsPerSecond,
      errorRate: this.performanceMetrics.errorRate,
    });
  }

  /**
   * Get health trends over time
   */
  async getHealthTrends(): Promise<{
    overall: number[];
    components: Record<string, number[]>;
    timestamps: Date[];
  }> {
    if (this.healthHistory.length < this.config.minTrendDataPoints) {
      return {
        overall: [],
        components: {
          wipManagement: [],
          bottleneckDetection: [],
          flowOptimization: [],
          taskCoordination: [],
        },
        timestamps: [],
      };
    }

    const recentHistory = this.healthHistory.slice(-20); // Last 20 measurements

    return {
      overall: recentHistory.map(h => h.overallHealth),
      components: {
        wipManagement: recentHistory.map(h => h.componentHealth.wipManagement),
        bottleneckDetection: recentHistory.map(h => h.componentHealth.bottleneckDetection),
        flowOptimization: recentHistory.map(h => h.componentHealth.flowOptimization),
        taskCoordination: recentHistory.map(h => h.componentHealth.taskCoordination),
      },
      timestamps: recentHistory.map(h => h.timestamp),
    };
  }

  // =============================================================================
  // PRIVATE HEALTH CALCULATION METHODS
  // =============================================================================

  private calculateWIPHealth(allTasks: WorkflowTask[]): number {
    // Calculate based on WIP utilization across workflow states
    const workflowStates = ['analysis,'development,'testing,'review,'deployment];
    const overutilizedStates = workflowStates.filter(state => {
      const tasksInState = allTasks.filter(task => task.state === state);
      // Assuming reasonable WIP limits for calculation
      const assumedLimit = this.getAssumedWIPLimit(state);
      return tasksInState.length >= assumedLimit;
    });

    const utilizationHealth = Math.max(0, 1 - overutilizedStates.length / workflowStates.length);
    
    // Factor in blocked tasks
    const blockedTasks = allTasks.filter(task => task.state === 'blocked');
    const blockageHealth = allTasks.length > 0 
      ? Math.max(0, 1 - (blockedTasks.length * 2) / allTasks.length) 
      : 1;

    return (utilizationHealth + blockageHealth) / 2;
  }

  private calculateBottleneckHealth(bottleneckReport: BottleneckReport): number {
    const { bottlenecks } = bottleneckReport;
    
    if (bottlenecks.length === 0) return 1;

    const criticalCount = bottlenecks.filter(b => b.severity ==='critical').length';
    const highCount = bottlenecks.filter(b => b.severity ==='high').length';
    const mediumCount = bottlenecks.filter(b => b.severity ==='medium').length';
    const healthImpact = criticalCount * 0.4 + highCount * 0.25 + mediumCount * 0.1;
    return Math.max(0, 1 - Math.min(1, healthImpact);
  }

  private calculateFlowHealth(flowMetrics: FlowMetrics| null): number {
    if (!flowMetrics) return 0.5; // Neutral health if no metrics

    // Flow efficiency is a good overall indicator
    const efficiency = flowMetrics.flowEfficiency;
    const predictability = flowMetrics.predictability;
    
    // Combine efficiency and predictability for flow health
    return (efficiency * 0.7 + predictability * 0.3);
  }

  private calculateCoordinationHealth(): number {
    const { averageResponseTime, operationsPerSecond, errorRate } = this.performanceMetrics;
    
    // Response time health (lower is better, target < 100ms)
    const responseTimeHealth = averageResponseTime > 0 
      ? Math.max(0, 1 - Math.min(1, averageResponseTime / 200))
      : 1;
    
    // Operations per second health (higher is better, target > 1 ops/sec)
    const throughputHealth = Math.min(1, operationsPerSecond / 10);
    
    // Error rate health (lower is better, target < 5%)
    const errorHealth = Math.max(0, 1 - Math.min(1, errorRate / 0.05);
    
    return (responseTimeHealth * 0.4 + throughputHealth * 0.3 + errorHealth * 0.3);
  }

  private getAssumedWIPLimit(state: string): number {
    // Default WIP limits for health calculation
    const defaultLimits: Record<string, number> = {
      analysis: 5,
      development: 8,
      testing: 6,
      review: 4,
      deployment: 3,
    };
    return defaultLimits[state]|| 5;
  }

  private getHealthStatus(health: number):'healthy'|'warning'|'critical '{
    if (health >= this.config.warningThreshold) return'healthy';
    if (health >= this.config.criticalThreshold) return'warning';
    return'critical';
  }

  private calculateHealthTrend(component: keyof HealthCheckResult['componentHealth']):'improving'|'declining'|'stable '{
    if (this.healthHistory.length < 3) return'stable';
    const recent = this.healthHistory.slice(-3).map(h => h.componentHealth[component]);
    const trend = recent[2] - recent[0];
    
    if (trend > 0.05) return'improving';
    if (trend < -0.05) return'declining';
    return'stable';
  }

  private generateRecommendations(
    overall: number,
    wip: number,
    bottleneck: number,
    flow: number,
    coordination: number
  ): string[] {
    const recommendations: string[] = [];

    if (overall < this.config.criticalThreshold) {
      recommendations.push('System health is critical - immediate attention required'');
    } else if (overall < this.config.warningThreshold) {
      recommendations.push('System health is degraded - optimization recommended'');
    }

    if (wip < this.config.warningThreshold) {
      recommendations.push('WIP limits may need adjustment or process optimization'');
    }

    if (bottleneck < this.config.warningThreshold) {
      recommendations.push('Active bottlenecks require immediate attention'');
    }

    if (flow < this.config.warningThreshold) {
      recommendations.push('Flow efficiency is below optimal - consider process improvements'');
    }

    if (coordination < this.config.warningThreshold) {
      recommendations.push('Task coordination performance needs optimization'');
    }

    if (recommendations.length === 0) {
      recommendations.push('System health is good - continue monitoring'');
    }

    return recommendations;
  }

  private getWIPIssues(allTasks: WorkflowTask[]): string[] {
    const issues: string[] = [];
    const blockedTasks = allTasks.filter(task => task.state === 'blocked');
    
    if (blockedTasks.length > 0) {
      issues.push(`${{blockedTasks.length} tasks are blocked}`);
    }

    return issues;
  }

  private getWIPRecommendations(health: number): string[] {
    if (health < 0.3) {
      return ['Review and adjust WIP limits immediately,'Address blocked tasks];
    } else if (health < 0.7) {
      return ['Monitor WIP utilization trends,'Consider process optimization];
    }
    return ['WIP management is healthy];
  }

  private getFlowIssues(flowMetrics: FlowMetrics| null): string[] {
    const issues: string[] = [];
    
    if (!flowMetrics) {
      issues.push('Flow metrics not available'');
      return issues;
    }

    if (flowMetrics.flowEfficiency < 0.5) {
      issues.push('Low flow efficiency detected'');
    }

    if (flowMetrics.predictability < 0.6) {
      issues.push('High variability in cycle times'');
    }

    return issues;
  }

  private getFlowRecommendations(health: number): string[] {
    if (health < 0.3) {
      return ['Critical flow issues - review entire workflow];
    } else if (health < 0.7) {
      return ['Optimize flow efficiency,'Reduce cycle time variability];
    }
    return ['Flow performance is good];
  }

  private getCoordinationIssues(): string[] {
    const issues: string[] = [];
    
    if (this.performanceMetrics.averageResponseTime > 200) {
      issues.push('High response times detected'');
    }

    if (this.performanceMetrics.operationsPerSecond < 1) {
      issues.push('Low throughput detected'');
    }

    if (this.performanceMetrics.errorRate > 0.05) {
      issues.push('High error rate detected'');
    }

    return issues;
  }

  private getCoordinationRecommendations(health: number): string[] {
    if (health < 0.3) {
      return ['Critical coordination issues - check system resources];
    } else if (health < 0.7) {
      return ['Optimize event processing performance];
    }
    return ['Task coordination is performing well];
  }
}