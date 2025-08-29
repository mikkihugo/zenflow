/**
 * @fileoverview Event Coordinator Infrastructure Service
 *
 * Infrastructure layer for event coordination and management.
 * Handles event bus integration, middleware, and cross-system coordination.
 *
 * **Responsibilities: getLogger('EventCoordinator');
/**
 * Event coordination configuration
 */
/**
 * Configuration for event coordination
 */
export interface EventCoordinationConfig {
  /** Enable event bus monitoring */
  enableMonitoring: boolean;
  /** Enable event middleware */
  enableMiddleware: boolean;
  /** Maximum number of listeners per event */
  maxListeners: number;
}

/**
 * Event coordination service for kanban workflows
 */
export class EventCoordinatorService {
  private config: EventCoordinationConfig;
  private eventBus: EventBus<WorkflowKanbanEvents>;
  private initialized = false;

  constructor(
    config: Partial<EventCoordinationConfig> = {},
    eventBus?: EventBus<WorkflowKanbanEvents>
  ) {
    this.config = {
      enableMonitoring: false,
      enableMiddleware: false,
      maxListeners: 100,
      ...config
    };
    this.eventBus = eventBus || new EventBus<WorkflowKanbanEvents>({
      maxListeners: this.config.maxListeners
    });
  }

  async initialize(): Promise<void> {
    try {
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
      logger.info('EventCoordinatorService initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize EventCoordinatorService:', error);
      throw error;
}
}
  /**
   * Get event bus instance
   */
  getEventBus():EventBus<WorkflowKanbanEvents> {
    return this.eventBus;
}
  /**
   * Emit event through coordinator
   */
  async emitEvent<K extends keyof WorkflowKanbanEvents>(
    eventType: K,
    payload: WorkflowKanbanEvents[K]
  ): Promise<void> {
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
    listener: (payload: WorkflowKanbanEvents[K]) => void | Promise<void>
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
    listener: (payload: WorkflowKanbanEvents[K]) => void | Promise<void>
  ): void {
    this.eventBus.off(eventType as string, listener);
    this.metrics.activeListeners = Math.max(0, this.metrics.activeListeners - 1);
    
    logger.debug(`Listener removed for event: ${String(eventType)}`);
  }

  /**
   * Shutdown event coordinator
   */
  async shutdown(): Promise<void> {
    try {
      this.initialized = false;
      logger.info('EventCoordinatorService shutdown complete');
    } catch (error) {
      logger.error('Error during EventCoordinatorService shutdown:', error);
      throw error;
    }
  }

  // =============================================================================
  // PRIVATE INFRASTRUCTURE METHODS
  // =============================================================================
  private setupEventMonitoring(): void {
    // Monitor event bus for high-level metrics
    this.eventBus.on('eventbus:initialized', () => {
      logger.info('Event bus monitoring active');
    });
    // Could add more monitoring events as needed
    logger.debug('Event monitoring setup complete');
  }

  private setupEventMiddleware(): void {
    // Add performance tracking middleware
    this.eventBus.use(async (context, next) => {
      const startTime = Date.now();
      
      try {
        await next();
        
        // Track successful processing
        this.metrics.eventsProcessed++;
        this.updateMetrics(startTime, false);
      } catch (error) {
        // Track failed processing
        this.metrics.eventsErrored++;
        this.updateMetrics(startTime, true);
        throw error;
      }
    });
    
    logger.debug('Event middleware setup complete');
  }

  private updateMetrics(startTime: number, isError: boolean): void {
    const processingTime = Date.now() - startTime;
    
    if (isError) {
      this.metrics.eventsErrored++;
    } else {
      this.metrics.eventsProcessed++;
    }
    
    // Update average processing time
    this.metrics.lastEventProcessingTime = processingTime;
  }
}
