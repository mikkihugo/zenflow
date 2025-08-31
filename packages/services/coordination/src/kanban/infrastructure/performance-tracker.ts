/**
 * @fileoverview Performance Tracker Infrastructure Service
 *
 * Infrastructure layer for comprehensive performance monitoring and optimization.
 * Handles metrics collection, performance analysis, and optimization recommendations.
 */

import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('PerformanceTracker');

/**
 * Performance tracking configuration
 */
export interface PerformanceTrackerConfig {
  /** Enable detailed performance tracking */
  enableDetailedTracking: boolean;
}

export interface PerformanceMetrics {
  operationId: string;
  operationType: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success?: boolean;
  metadata?: Record<string, any>;
}

export class PerformanceTrackerService {
  private activeOperations: Map<string, PerformanceMetrics> = new Map();
  private responseTimes: number[] = [];
  private currentAlerts: string[] = [];
  private initialized = false;
  private eventCoordinator: any;
  private config: PerformanceTrackerConfig;

  constructor(eventCoordinator: any) {
    this.eventCoordinator = eventCoordinator;
    this.config = {
      enableDetailedTracking: true,
    };
    try {
      this.initialized = true;
      logger.info('PerformanceTrackerService initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize PerformanceTrackerService:', error);
      throw error;
    }
  }

  /**
   * Start timing an operation
   */
  startOperation(
    operationId: string,
    operationType: string,
    metadata?: Record<string, any>
  ): void {
    if (!this.initialized) return;
    
    const timing: PerformanceMetrics = {
      operationId,
      operationType,
      startTime: performance.now(),
      metadata: metadata || {}
    };
    
    this.activeOperations.set(operationId, timing);
    logger.debug(`Started tracking operation: ${operationId}`);
  }

  /**
   * End timing an operation
   */
  endOperation(
    operationId: string,
    success: boolean = true,
    metadata?: Record<string, any>
  ): void {
    if (!this.initialized) return;
    
    const timing = this.activeOperations.get(operationId);
    if (!timing) return;
    
    const endTime = performance.now();
    const duration = endTime - timing.startTime;
    
    timing.endTime = endTime;
    timing.duration = duration;
    timing.success = success;
    timing.metadata = { ...timing.metadata, ...metadata };
    
    this.responseTimes.push(duration);
    this.activeOperations.delete(operationId);
    
    logger.debug(`Completed operation: ${operationId} in ${duration.toFixed(2)}ms`);
    
    // Trigger performance analysis
    this.analyzePerformance(timing);
  }

  /**
   * Analyze performance metrics
   */
  private analyzePerformance(timing: PerformanceMetrics): void {
    if (timing.duration && timing.duration > 1000) {
      logger.warn(`Slow operation detected: ${timing.operationId} took ${timing.duration.toFixed(2)}ms`);
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): {
    activeOperations: number;
    averageResponseTime: number;
    totalOperations: number;
  } {
    const averageResponseTime = this.responseTimes.length > 0 
      ? this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length
      : 0;

    return {
      activeOperations: this.activeOperations.size,
      averageResponseTime,
      totalOperations: this.responseTimes.length
    };
  }

  /**
   * Clear performance data
   */
  clearMetrics(): void {
    this.responseTimes = [];
    this.currentAlerts = [];
    logger.info('Performance metrics cleared');
  }
}