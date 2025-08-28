/**
 * @fileoverview Event Coordinator Infrastructure Service
 *
 * Infrastructure layer for event coordination and management.
 * Handles event bus integration, middleware, and cross-system coordination.
 *
 * **Responsibilities:**
 * - Event bus management and lifecycle
 * - Event emission and subscription coordination
 * - Cross-system event routing
 * - Event middleware and filtering
 * - Event monitoring and metrics
 *
 * **Infrastructure Concerns:**
 * - Foundation EventBus integration
 * - Event serialization and deserialization
 * - Error handling and recovery
 * - Performance monitoring
 * - Event replay and persistence (future)
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

import { getLogger, EventBus } from '@claude-zen/foundation';
import type { WorkflowKanbanEvents } from '../types/index';
const logger = getLogger('EventCoordinator'');

/**
 * Event coordination configuration
 */
export interface EventCoordinationConfig {
  /** Enable event bus monitoring */
  enableMonitoring: boolean;
  /** Enable event middleware processing */
  enableMiddleware: boolean;
  /** Maximum listeners per event type */
  maxListeners: number;
  /** Event batch size for high-throughput scenarios */
  batchSize: number;
  /** Event buffer timeout in milliseconds */
  bufferTimeout: number;
}

/**
 * Event coordination metrics
 */
export interface EventCoordinationMetrics {
  eventsEmitted: number;
  eventsProcessed: number;
  averageProcessingTime: number;
  errorCount: number;
  activeListeners: number;
  lastEventTime: Date;
}

/**
 * Event Coordinator Infrastructure Service
 *
 * Manages event bus lifecycle and cross-system event coordination.
 * Provides infrastructure support for domain events.
 */
export class EventCoordinatorService {
  private readonly config: EventCoordinationConfig;
  private readonly eventBus: EventBus<WorkflowKanbanEvents>;
  private metrics: EventCoordinationMetrics;
  private initialized = false;

  constructor(
    config: Partial<EventCoordinationConfig> = {},
    eventBus?: EventBus<WorkflowKanbanEvents>
  ) {
    this.config = {
      enableMonitoring: true,
      enableMiddleware: true,
      maxListeners: 50,
      batchSize: 10,
      bufferTimeout: 1000,
      ...config,
    };

    this.eventBus = eventBus|| new EventBus<WorkflowKanbanEvents>({
      maxListeners: this.config.maxListeners,
      enableMetrics: this.config.enableMonitoring,
      enableMiddleware: this.config.enableMiddleware,
      enableLogging: false, // We handle our own logging
    });

    this.metrics = {
      eventsEmitted: 0,
      eventsProcessed: 0,
      averageProcessingTime: 0,
      errorCount: 0,
      activeListeners: 0,
      lastEventTime: new Date(),
    };

    logger.info('EventCoordinatorService created,this.config');
  }

  /**
   * Initialize event coordinator
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.warn('EventCoordinatorService already initialized'');
      return;
    }

    try {
      // Initialize event bus
      const result = await this.eventBus.initialize();
      if (result.isErr()) {
        throw result.error;
      }

      // Set up monitoring if enabled
      if (this.config.enableMonitoring) {
        this.setupEventMonitoring();
      }

      // Set up middleware if enabled
      if (this.config.enableMiddleware) {
        this.setupEventMiddleware();
      }

      this.initialized = true;
      logger.info('EventCoordinatorService initialized successfully'');
    } catch (error) {
      logger.error('Failed to initialize EventCoordinatorService:,error');
      throw error;
    }
  }

  /**
   * Get event bus instance
   */
  getEventBus(): EventBus<WorkflowKanbanEvents> {
    return this.eventBus;
  }

  /**
   * Emit event through coordinator
   */
  async emitEvent<K extends keyof WorkflowKanbanEvents>(
    eventType: K,
    payload: WorkflowKanbanEvents[K]
  ): Promise<void> {
    if (!this.initialized) {
      throw new Error('EventCoordinator not initialized'');
    }

    const startTime = Date.now();

    try {
      this.eventBus.emit(eventType, payload);
      
      // Update metrics
      this.updateMetrics(startTime, false);
      
      logger.debug(`Event emitted: ${String(eventType)}`, { payload });
    } catch (error) {
      this.updateMetrics(startTime, true);
      logger.error(`Failed to emit event ${String(eventType)}:`, error);
      throw error;
    }
  }

  /**
   * Emit event safely with error handling
   */
  async emitEventSafe<K extends keyof WorkflowKanbanEvents>(
    eventType: K,
    payload: WorkflowKanbanEvents[K]
  ): Promise<boolean> {
    try {
      await this.emitEvent(eventType, payload);
      return true;
    } catch (error) {
      logger.error(`Safe emit failed for ${String(eventType)}:`, error);
      return false;
    }
  }

  /**
   * Add event listener
   */
  addListener<K extends keyof WorkflowKanbanEvents>(
    eventType: K,
    listener: (payload: WorkflowKanbanEvents[K]) => void| Promise<void>
  ): void {
    this.eventBus.on(eventType as string, listener);
    this.metrics.activeListeners++;
    
    logger.debug(`Listener added for event: ${String(eventType)}`);
  }

  /**
   * Remove event listener
   */
  removeListener<K extends keyof WorkflowKanbanEvents>(
    eventType: K,
    listener: (payload: WorkflowKanbanEvents[K]) => void| Promise<void>
  ): void {
    this.eventBus.off(eventType as string, listener);
    this.metrics.activeListeners = Math.max(0, this.metrics.activeListeners - 1);
    
    logger.debug(`Listener removed for event: ${String(eventType)}`);
  }

  /**
   * Get coordination metrics
   */
  getMetrics(): EventCoordinationMetrics {
    // Merge with event bus metrics if available
    const busMetrics = this.eventBus.getMetrics();
    
    return {
      ...this.metrics,
      eventsEmitted: busMetrics.eventCount|| this.metrics.eventsEmitted,
      activeListeners: busMetrics.listenerCount|| this.metrics.activeListeners,
      averageProcessingTime: busMetrics.avgProcessingTime|| this.metrics.averageProcessingTime,
      errorCount: busMetrics.errorCount|| this.metrics.errorCount,
    };
  }

  /**
   * Reset coordination metrics
   */
  resetMetrics(): void {
    this.metrics = {
      eventsEmitted: 0,
      eventsProcessed: 0,
      averageProcessingTime: 0,
      errorCount: 0,
      activeListeners: 0,
      lastEventTime: new Date(),
    };
    
    this.eventBus.resetMetrics();
    logger.info('Event coordination metrics reset'');
  }

  /**
   * Get event bus statistics
   */
  getEventBusStats(): { eventNames: string[]; listenerCount: number } {
    return this.eventBus.getStats();
  }

  /**
   * Shutdown event coordinator
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) return;

    try {
      // Remove all listeners
      this.eventBus.removeAllListeners();
      
      this.initialized = false;
      logger.info('EventCoordinatorService shutdown complete'');
    } catch (error) {
      logger.error('Error during EventCoordinatorService shutdown:,error');
      throw error;
    }
  }

  // =============================================================================
  // PRIVATE INFRASTRUCTURE METHODS
  // =============================================================================

  private setupEventMonitoring(): void {
    // Monitor event bus for high-level metrics
    this.eventBus.on('eventbus:initialized,() => {
      logger.info('Event bus monitoring active'');
    });

    // Could add more monitoring events as needed
    logger.debug('Event monitoring setup complete'');
  }

  private setupEventMiddleware(): void {
    // Add performance tracking middleware
    this.eventBus.use(async (context, next) => {
      const startTime = Date.now();
      
      try {
        await next();
        
        // Track successful processing
        this.metrics.eventsProcessed++;
        this.updateProcessingTime(Date.now() - startTime);
        
      } catch (error) {
        this.metrics.errorCount++;
        logger.error(`Event middleware error for ${String(context.event)}:`, error);
        throw error;
      }
    });

    // Add logging middleware for debugging
    if (logger.isDebugEnabled?.()) {
      this.eventBus.use(async (context, next) => {
        logger.debug(`Processing event: ${String(context.event)}`, {
          timestamp: new Date(context.timestamp).toISOString(),
          payload: context.payload,
        });
        
        await next();
      });
    }

    logger.debug('Event middleware setup complete'');
  }

  private updateMetrics(startTime: number, isError: boolean): void {
    this.metrics.eventsEmitted++;
    this.metrics.lastEventTime = new Date();
    
    if (isError) {
      this.metrics.errorCount++;
    } else {
      this.metrics.eventsProcessed++;
      this.updateProcessingTime(Date.now() - startTime);
    }
  }

  private updateProcessingTime(processingTime: number): void {
    const totalTime = this.metrics.averageProcessingTime * (this.metrics.eventsProcessed - 1) + processingTime;
    this.metrics.averageProcessingTime = totalTime / this.metrics.eventsProcessed;
  }

  /**
   * Check if event coordinator is healthy
   */
  isHealthy(): boolean {
    return this.initialized && this.metrics.errorCount < 100; // Allow some errors
  }

  /**
   * Get health summary
   */
  getHealthSummary(): {
    healthy: boolean;
    initialized: boolean;
    metrics: EventCoordinationMetrics;
    issues: string[];
  } {
    const issues: string[] = [];
    
    if (!this.initialized) {
      issues.push('Event coordinator not initialized'');
    }
    
    if (this.metrics.errorCount > 50) {
      issues.push('High error count detected'');
    }
    
    if (this.metrics.averageProcessingTime > 100) {
      issues.push('High event processing latency'');
    }

    return {
      healthy: this.isHealthy(),
      initialized: this.initialized,
      metrics: this.getMetrics(),
      issues,
    };
  }
}