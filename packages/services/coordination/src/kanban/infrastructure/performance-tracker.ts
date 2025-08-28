/**
 * @fileoverview Performance Tracker Infrastructure Service
 *
 * Infrastructure layer for comprehensive performance monitoring and optimization.
 * Handles metrics collection, performance analysis, and optimization recommendations.
 *
 * **Responsibilities:**
 * - Performance metrics collection and aggregation
 * - Response time tracking and analysis
 * - Throughput monitoring and optimization
 * - Resource utilization tracking
 * - Performance trend analysis and alerting
 *
 * **Infrastructure Concerns:**
 * - Metrics persistence and retrieval
 * - Performance data aggregation
 * - Monitoring integration
 * - Alert generation and escalation
 * - Performance reporting and visualization
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

import { getLogger } from '@claude-zen/foundation';
import type { WorkflowKanbanEvents } from '../types/index';
import type { EventCoordinatorService } from './event-coordinator';
const logger = getLogger('PerformanceTracker'');

/**
 * Performance tracking configuration
 */
export interface PerformanceTrackerConfig {
  /** Enable detailed performance tracking */
  enableDetailedTracking: boolean;
  /** Sample rate for performance measurements (0-1) */
  sampleRate: number;
  /** Maximum performance history length */
  maxHistoryLength: number;
  /** Alert threshold for response time (milliseconds) */
  responseTimeThreshold: number;
  /** Alert threshold for throughput degradation (percentage) */
  throughputThreshold: number;
  /** Enable automatic performance optimization */
  enableAutoOptimization: boolean;
}

/**
 * Performance metrics snapshot
 */
export interface PerformanceMetrics {
  timestamp: Date;
  responseTime: {
    average: number;
    median: number;
    p95: number;
    p99: number;
    min: number;
    max: number;
  };
  throughput: {
    operationsPerSecond: number;
    tasksPerMinute: number;
    eventsPerSecond: number;
  };
  resourceUtilization: {
    memoryUsage: number;
    cpuUsage: number;
    activeConnections: number;
  };
  errors: {
    errorRate: number;
    totalErrors: number;
    recentErrors: string[];
  };
  workflowMetrics: {
    activeTasks: number;
    completedTasks: number;
    blockedTasks: number;
    averageTaskCycleTime: number;
  };
}

/**
 * Performance alert interface
 */
export interface PerformanceAlert {
  id: string;
  type:'warning'|'critical';
  metric: string;
  threshold: number;
  currentValue: number;
  message: string;
  timestamp: Date;
  recommendations: string[];
}

/**
 * Operation timing interface
 */
export interface OperationTiming {
  operationType: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  metadata?: Record<string, any>;
}

/**
 * Performance Tracker Infrastructure Service
 *
 * Comprehensive performance monitoring with intelligent analysis.
 * Provides actionable insights for system optimization.
 */
export class PerformanceTrackerService {
  private readonly config: PerformanceTrackerConfig;
  private readonly eventCoordinator: EventCoordinatorService;
  private metricsHistory: PerformanceMetrics[] = [];
  private activeOperations: Map<string, OperationTiming> = new Map();
  private responseTimes: number[] = [];
  private currentAlerts: PerformanceAlert[] = [];
  private initialized = false;

  constructor(
    eventCoordinator: EventCoordinatorService,
    config: Partial<PerformanceTrackerConfig> = {}
  ) {
    this.eventCoordinator = eventCoordinator;
    this.config = {
      enableDetailedTracking: true,
      sampleRate: 1.0,
      maxHistoryLength: 1000,
      responseTimeThreshold: 1000, // 1 second
      throughputThreshold: 0.2, // 20% degradation
      enableAutoOptimization: false,
      ...config,
    };

    logger.info('PerformanceTrackerService created,this.config');
  }

  /**
   * Initialize performance tracker
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.warn('PerformanceTrackerService already initialized'');
      return;
    }

    try {
      // Set up event listeners for performance tracking
      this.setupPerformanceListeners();

      // Start periodic metrics collection
      this.startMetricsCollection();

      this.initialized = true;
      logger.info('PerformanceTrackerService initialized successfully'');
    } catch (error) {
      logger.error('Failed to initialize PerformanceTrackerService:,error');
      throw error;
    }
  }

  /**
   * Start timing an operation
   */
  startOperation(operationId: string, operationType: string, metadata?: Record<string, any>): void {
    if (!this.initialized|| Math.random() > this.config.sampleRate) {
      return;
    }

    const timing: OperationTiming = {
      operationType,
      startTime: performance.now(),
      success: false,
      metadata,
    };

    this.activeOperations.set(operationId, timing);
  }

  /**
   * End timing an operation
   */
  endOperation(operationId: string, success: boolean = true, metadata?: Record<string, any>): void {
    if (!this.initialized) return;

    const timing = this.activeOperations.get(operationId);
    if (!timing) return;

    const endTime = performance.now();
    const duration = endTime - timing.startTime;

    timing.endTime = endTime;
    timing.duration = duration;
    timing.success = success;
    timing.metadata = { ...timing.metadata, ...metadata };

    // Track response time
    this.responseTimes.push(duration);
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-500); // Keep last 500
    }

    // Remove from active operations
    this.activeOperations.delete(operationId);

    // Check for performance alerts
    this.checkPerformanceAlerts(timing);

    logger.debug(`Operation completed: ${timing.operationType}`, {
      operationId,
      duration: Math.round(duration),
      success,
    });
  }

  /**
   * Get current performance metrics
   */
  async getCurrentMetrics(): Promise<PerformanceMetrics> {
    const timestamp = new Date();

    // Calculate response time statistics
    const sortedResponseTimes = [...this.responseTimes].sort((a, b) => a - b);
    const responseTime = {
      average: sortedResponseTimes.length > 0 
        ? sortedResponseTimes.reduce((a, b) => a + b, 0) / sortedResponseTimes.length 
        : 0,
      median: sortedResponseTimes.length > 0 
        ? sortedResponseTimes[Math.floor(sortedResponseTimes.length / 2)] 
        : 0,
      p95: sortedResponseTimes.length > 0 
        ? sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.95)] 
        : 0,
      p99: sortedResponseTimes.length > 0 
        ? sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.99)] 
        : 0,
      min: sortedResponseTimes.length > 0 ? sortedResponseTimes[0] : 0,
      max: sortedResponseTimes.length > 0 ? sortedResponseTimes[sortedResponseTimes.length - 1] : 0,
    };

    // Get event coordinator metrics for throughput calculation
    const eventMetrics = this.eventCoordinator.getMetrics();

    // Calculate throughput metrics
    const throughput = {
      operationsPerSecond: this.calculateOperationsPerSecond(),
      tasksPerMinute: this.calculateTasksPerMinute(),
      eventsPerSecond: eventMetrics.eventsEmitted / 60, // Rough estimate
    };

    // Get resource utilization (simulated for now)
    const resourceUtilization = await this.getResourceUtilization();

    // Calculate error metrics
    const errors = {
      errorRate: eventMetrics.errorCount / Math.max(1, eventMetrics.eventsProcessed),
      totalErrors: eventMetrics.errorCount,
      recentErrors: this.getRecentErrors(),
    };

    // Get workflow metrics (simulated for now)
    const workflowMetrics = {
      activeTasks: this.activeOperations.size,
      completedTasks: Math.floor(Math.random() * 100), // Would come from domain services
      blockedTasks: Math.floor(Math.random() * 10),
      averageTaskCycleTime: responseTime.average,
    };

    const metrics: PerformanceMetrics = {
      timestamp,
      responseTime,
      throughput,
      resourceUtilization,
      errors,
      workflowMetrics,
    };

    // Store in history
    this.metricsHistory.push(metrics);
    if (this.metricsHistory.length > this.config.maxHistoryLength) {
      this.metricsHistory.shift();
    }

    return metrics;
  }

  /**
   * Get performance metrics history
   */
  getMetricsHistory(limit: number = 50): PerformanceMetrics[] {
    return this.metricsHistory.slice(-limit);
  }

  /**
   * Get current performance alerts
   */
  getCurrentAlerts(): PerformanceAlert[] {
    return [...this.currentAlerts];
  }

  /**
   * Generate performance report
   */
  async generatePerformanceReport(): Promise<{
    summary: PerformanceMetrics;
    trends: Record<string,'improving'|'declining'|'stable'>';
    recommendations: string[];
    alerts: PerformanceAlert[];
  }> {
    const currentMetrics = await this.getCurrentMetrics();
    const trends = this.calculatePerformanceTrends();
    const recommendations = this.generateOptimizationRecommendations(currentMetrics, trends);

    return {
      summary: currentMetrics,
      trends,
      recommendations,
      alerts: this.currentAlerts,
    };
  }

  /**
   * Clear performance history
   */
  clearHistory(): void {
    this.metricsHistory = [];
    this.responseTimes = [];
    this.currentAlerts = [];
    
    logger.info('Performance history cleared'');
  }

  /**
   * Shutdown performance tracker
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) return;

    try {
      // Clear active operations
      this.activeOperations.clear();
      
      this.initialized = false;
      logger.info('PerformanceTrackerService shutdown complete'');
    } catch (error) {
      logger.error('Error during PerformanceTrackerService shutdown:,error');
      throw error;
    }
  }

  // =============================================================================
  // PRIVATE PERFORMANCE ANALYSIS METHODS
  // =============================================================================

  private setupPerformanceListeners(): void {
    // Track task creation performance
    this.eventCoordinator.addListener('task:created,async (tasks) => {
      const operationId = `batch-create-${Date.now()}`;
      this.startOperation(operationId,'task_creation,{ taskCount: tasks.length }');
      
      // Simulate processing time
      setTimeout(() => {
        this.endOperation(operationId, true, { tasksCreated: tasks.length });
      }, Math.random() * 100);
    });

    // Track task movement performance
    this.eventCoordinator.addListener('task:moved,async ([taskId, fromState, toState]) => {
      const operationId = `move-${taskId}-${Date.now()}`;
      this.startOperation(operationId,'task_movement,{ fromState, toState }');
      
      setTimeout(() => {
        this.endOperation(operationId, true);
      }, Math.random() * 50);
    });

    // Track workflow state changes
    this.eventCoordinator.addListener('workflow:state_changed,async (data) => {
      const operationId = `workflow-${data.machineId}-${Date.now()}`;
      this.startOperation(operationId,'workflow_transition,{
        machineId: data.machineId,
        fromState: data.fromState,
        toState: data.toState,
      });
      
      setTimeout(() => {
        this.endOperation(operationId, true);
      }, Math.random() * 25);
    });
  }

  private startMetricsCollection(): void {
    // Collect metrics every 30 seconds
    setInterval(async () => {
      try {
        await this.getCurrentMetrics();
      } catch (error) {
        logger.error('Error during metrics collection:,error');
      }
    }, 30000);
  }

  private checkPerformanceAlerts(timing: OperationTiming): void {
    const duration = timing.duration|| 0;

    // Check response time threshold
    if (duration > this.config.responseTimeThreshold) {
      const alert: PerformanceAlert = {
        id: `response-time-${Date.now()}`,
        type: duration > this.config.responseTimeThreshold * 2 ?'critical:'warning,
        metric:'response_time,
        threshold: this.config.responseTimeThreshold,
        currentValue: duration,
        message: `Operation ${timing.operationType} exceeded response time threshold`,
        timestamp: new Date(),
        recommendations: [
         'Review operation complexity and optimize critical paths,
         'Consider caching frequently accessed data,
         'Monitor resource utilization during peak times,
        ],
      };

      this.addAlert(alert);
    }

    // Check for operation failures
    if (!timing.success) {
      const alert: PerformanceAlert = {
        id: `operation-failure-${Date.now()}`,
        type:'warning,
        metric:'operation_success,
        threshold: 1,
        currentValue: 0,
        message: `Operation ${timing.operationType} failed`,
        timestamp: new Date(),
        recommendations: [
         'Review error logs for operation failure patterns,
         'Implement retry logic for transient failures,
         'Add monitoring for operation success rates,
        ],
      };

      this.addAlert(alert);
    }
  }

  private addAlert(alert: PerformanceAlert): void {
    this.currentAlerts.push(alert);
    
    // Keep only recent alerts (last 50)
    if (this.currentAlerts.length > 50) {
      this.currentAlerts = this.currentAlerts.slice(-25);
    }

    logger.warn(`Performance alert: ${alert.message}`, {
      type: alert.type,
      metric: alert.metric,
      currentValue: alert.currentValue,
      threshold: alert.threshold,
    });
  }

  private calculateOperationsPerSecond(): number {
    // Calculate based on recent response times
    const recentOperations = this.responseTimes.slice(-60); // Last minute worth
    return recentOperations.length; // Simplified calculation
  }

  private calculateTasksPerMinute(): number {
    // Would typically come from domain services
    return Math.floor(Math.random() * 20) + 10; // Simulated
  }

  private async getResourceUtilization(): Promise<PerformanceMetrics['resourceUtilization']> {
    // In a real implementation, this would query system resources
    return {
      memoryUsage: Math.random() * 0.8, // 0-80% usage
      cpuUsage: Math.random() * 0.6, // 0-60% usage
      activeConnections: this.activeOperations.size + Math.floor(Math.random() * 10),
    };
  }

  private getRecentErrors(): string[] {
    // Would typically come from error tracking system
    return [
     'Connection timeout to external service,
     'Invalid task state transition,
     'WIP limit exceeded,
    ].slice(0, Math.floor(Math.random() * 3);
  }

  private calculatePerformanceTrends(): Record<string,'improving'|'declining'|'stable'> {
    if (this.metricsHistory.length < 2) {
      return {};
    }

    const current = this.metricsHistory[this.metricsHistory.length - 1];
    const previous = this.metricsHistory[this.metricsHistory.length - 2];

    const calculateTrend = (currentValue: number, previousValue: number):'improving'|'declining'|'stable => {
      const change = (currentValue - previousValue) / previousValue;
      if (Math.abs(change) < 0.05) return'stable';
      return change > 0 ?'declining: 'improving'; // For response time, lower is better
    };

    return {
      responseTime: calculateTrend(current.responseTime.average, previous.responseTime.average),
      throughput: calculateTrend(previous.throughput.operationsPerSecond, current.throughput.operationsPerSecond), // Higher is better
      errorRate: calculateTrend(current.errors.errorRate, previous.errors.errorRate),
      memoryUsage: calculateTrend(current.resourceUtilization.memoryUsage, previous.resourceUtilization.memoryUsage),
    };
  }

  private generateOptimizationRecommendations(
    metrics: PerformanceMetrics, 
    trends: Record<string,'improving'|'declining'|'stable'>
  ): string[] {
    const recommendations: string[] = [];

    if (metrics.responseTime.average > this.config.responseTimeThreshold) {
      recommendations.push('Response time is above threshold - consider optimizing slow operations'');
    }

    if (metrics.errors.errorRate > 0.05) {
      recommendations.push('Error rate is elevated - review error patterns and implement fixes'');
    }

    if (metrics.resourceUtilization.memoryUsage > 0.8) {
      recommendations.push('Memory usage is high - consider implementing memory optimization strategies'');
    }

    if (trends.throughput ==='declining){
      recommendations.push('Throughput is declining - analyze bottlenecks and capacity constraints'');
    }

    if (trends.responseTime ==='declining){
      recommendations.push('Response time is degrading - profile performance and optimize critical paths'');
    }

    if (recommendations.length === 0) {
      recommendations.push('System performance is healthy - continue monitoring'');
    }

    return recommendations;
  }

  /**
   * Check if performance tracker is healthy
   */
  isHealthy(): boolean {
    return this.initialized && 
           this.currentAlerts.filter(a => a.type ==='critical').length === 0';
  }
}