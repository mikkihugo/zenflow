/**
 * UEL Shared Types and Utilities - Breaks Circular Dependencies
 *
 * Shared functionality between uel-singleton.ts and system-integrations.ts
 * to eliminate the circular import.
 */


/**
 * UEL Enhanced Event Bus Interface.
 *
 * Enhanced event bus interface that extends traditional EventEmitter patterns
 * with UEL-specific features including event history, coordination capabilities,
 * and distributed event management.
 */
export interface UELEnhancedEventBus {
  /**
   * Emit an event with data to all registered listeners.
   *
   * @param event - Event name or type to emit
   * @param data - Event data payload
   * @returns Promise that resolves when event emission is complete
   * @throws {Error} If event emission fails
   */
  emit(event: string, data: unknown): Promise<void>;

  /**
   * Register an event handler for a specific event type.
   *
   * @param event - Event name or type to listen for
   * @param handler - Function to handle the event data
   * @throws {Error} If handler registration fails
   */
  on(event: string, handler: (data: unknown) => void): void;

  /**
   * Register a one-time event handler for a specific event type.
   *
   * @param event - Event name or type to listen for
   * @param handler - Function to handle the event data (called only once)
   * @throws {Error} If handler registration fails
   */
  once(event: string, handler: (data: unknown) => void): void;

  /**
   * Remove an event handler for a specific event type.
   *
   * @param event - Event name or type to stop listening for
   * @param handler - The handler function to remove
   * @returns boolean indicating if handler was found and removed
   */
  off(event: string, handler: (data: unknown) => void): boolean;

  /**
   * Remove all event handlers for a specific event type.
   *
   * @param event - Event name or type to clear all handlers for
   * @returns number of handlers that were removed
   */
  removeAllListeners(event?: string): number;

  /**
   * Get the current number of listeners for an event type.
   *
   * @param event - Event name or type to count listeners for
   * @returns number of registered listeners
   */
  listenerCount(event: string): number;

  /**
   * Get all registered event types.
   *
   * @returns array of event names that have registered listeners
   */
  eventNames(): string[];
}

/**
 * UEL Event Bus Factory Configuration.
 *
 * Configuration options for creating UEL enhanced event buses.
 */
export interface UELEventBusConfig {
  name: string;
  maxListeners?: number;
  enableHistory?: boolean;
  historySize?: number;
  enableCoordination?: boolean;
  enableDistributed?: boolean;
  processingStrategy?: 'immediate' | 'queued' | 'batched';
  batchSize?: number;
  queueSize?: number;
}

/**
 * UEL System Integration Configuration.
 *
 * Configuration for integrating with existing system components.
 */
export interface UELSystemIntegrationConfig {
  integrationMode: 'passive' | 'active';
  preserveExistingHandlers: boolean;
  migrationStrategy: 'gradual' | 'immediate';
  fallbackToOriginal: boolean;
  enableCompatibilityLayer: boolean;
}

/**
 * UEL Event History Entry.
 *
 * Represents a historical event entry in the UEL event history.
 */
export interface UELEventHistoryEntry {
  id: string;
  event: string;
  data: unknown;
  timestamp: Date;
  source?: string;
  correlationId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * UEL Coordination Status.
 *
 * Status information for event coordination across distributed systems.
 */
export interface UELCoordinationStatus {
  isCoordinating: boolean;
  coordinationId?: string;
  participants: string[];
  status: 'initializing' | 'active' | 'degraded' | 'failed';
  lastSync?: Date;
}

/**
 * Factory function type for creating UEL enhanced event buses.
 */
export type UELEventBusFactory = (config: UELEventBusConfig) => Promise<UELEnhancedEventBus>;

/**
 * System integration function type for integrating UEL with existing systems.
 */
export type UELSystemIntegrator = (
  config: UELSystemIntegrationConfig
) => Promise<{
  success: boolean;
  eventBus: UELEnhancedEventBus;
  originalComponents: Map<string, unknown>;
}>;

// Utility functions
export const UELSharedUtils = {
  /**
   * Generate a unique event ID.
   */
  generateEventId: (): string => `uel_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,

  /**
   * Generate a correlation ID for event tracking.
   */
  generateCorrelationId: (): string => `corr_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,

  /**
   * Validate event name format.
   */
  validateEventName: (eventName: string): boolean => typeof eventName === 'string' && 
           eventName.length > 0 && 
           /^[\w.:-]+$/.test(eventName),

  /**
   * Extract event category from event name.
   */
  extractEventCategory: (eventName: string): string => {
    const parts = eventName.split(':');
    return parts.length > 1 ? parts[0] : 'general';
  },

  /**
   * Create default UEL event bus configuration.
   */
  createDefaultConfig: (name: string): UELEventBusConfig => ({
    name,
    maxListeners: 100,
    enableHistory: true,
    historySize: 1000,
    enableCoordination: false,
    enableDistributed: false,
    processingStrategy: 'immediate',
    batchSize: 10,
    queueSize: 1000,
  }),
} as const;

// Constants
export const UEL_CONSTANTS = {
  DEFAULT_MAX_LISTENERS: 100,
  DEFAULT_HISTORY_SIZE: 1000,
  DEFAULT_BATCH_SIZE: 10,
  DEFAULT_QUEUE_SIZE: 1000,
  EVENT_NAME_PATTERN: /^[\w.:-]+$/,
  MAX_EVENT_NAME_LENGTH: 128,
  MAX_CORRELATION_ID_LENGTH: 64,
} as const;

// Error classes
export class UELError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'UELError';
  }
}

export class UELEventBusError extends UELError {
  constructor(message: string, public readonly eventBusName: string) {
    super(message, 'EVENT_BUS_ERROR');
    this.name = 'UELEventBusError';
  }
}

export class UELIntegrationError extends UELError {
  constructor(message: string, public readonly component: string) {
    super(message, 'INTEGRATION_ERROR');
    this.name = 'UELIntegrationError';
  }
}