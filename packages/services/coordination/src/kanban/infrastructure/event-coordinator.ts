import { getLogger as _getLogger } from '@claude-zen/foundation';
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
      ...config,
    };
    this.eventBus =
      eventBus ||
      new EventBus<WorkflowKanbanEvents>({
        maxListeners: this.config.maxListeners,
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
    const startTime = Date.now();
    try {
      this.eventBus.emit(eventType, payload);

      // Update metrics
      this.updateMetrics(startTime, false);

      logger.debug(`Event emitted: ${String(eventType)}"Fixed unterminated template"(`Failed to emit event ${String(eventType)}:"Fixed unterminated template"(`Safe emit failed for ${String(eventType)}:"Fixed unterminated template"(`Listener added for _event: ${String(eventType)}"Fixed unterminated template"(`Listener removed for _event: ${String(eventType)}"Fixed unterminated template"