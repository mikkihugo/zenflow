/**
 * @fileoverview Base Event Module Interface and Implementation
 * 
 * Provides common patterns and interfaces that all domain event modules should implement.
 * Extracted from existing brain and coordination event modules to create unified patterns.
 * 
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 2.1.0
 */

// =============================================================================
// IMPORTS
// =============================================================================

import {
  EventBus,
  getLogger,
  generateUUID,
  recordMetric,
  withTrace,
  ok,
  err,
  Result
} from '@claude-zen/foundation';

import type { Logger } from '@claude-zen/foundation/core';
import type { UUID } from '@claude-zen/foundation/types';

// =============================================================================
// BASE EVENT MODULE TYPES
// =============================================================================

/**
 * Correlation context for tracking related events across module boundaries
 */
export interface CorrelationContext {
  /** Unique identifier for this correlation chain */
  correlationId: UUID;
  
  /** Metadata about the correlation context */
  metadata: Record<string, unknown>;
  
  /** Type of operation that initiated this correlation */
  initiatedBy?: string;
  
  /** Timestamp when correlation was created */
  createdAt?: number;
}

/**
 * Base configuration for all domain event modules
 */
export interface BaseEventModuleConfig {
  /** Unique identifier for the module instance */
  moduleId: string;
  
  /** Human readable name for the module */
  moduleName: string;
  
  /** Version of the event module */
  version: string;
  
  /** List of event patterns this module supports */
  supportedEvents: string[];
  
  /** Human readable description of the module */
  description?: string;
  
  /** Enable correlation tracking */
  enableCorrelation?: boolean;
  
  /** Enable periodic heartbeat monitoring */
  enableHeartbeat?: boolean;
  
  /** Heartbeat interval in milliseconds */
  heartbeatInterval?: number;
  
  /** Additional module-specific metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Module status information
 */
export interface ModuleStatus {
  /** Module identifier */
  moduleId: string;
  
  /** Whether the module is initialized and ready */
  isInitialized: boolean;
  
  /** Number of active event handlers */
  eventHandlerCount: number;
  
  /** Whether correlation tracking is enabled */
  correlationEnabled: boolean;
  
  /** Whether heartbeat monitoring is enabled */
  heartbeatEnabled: boolean;
  
  /** Last heartbeat timestamp */
  lastHeartbeat?: number;
  
  /** Additional status metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Event emission options
 */
export interface EventEmissionOptions {
  /** Correlation context to include with the event */
  correlationContext?: CorrelationContext;
  
  /** Priority level for the event */
  priority?: 'low' | 'medium' | 'high' | 'critical';
  
  /** Whether to wait for acknowledgment */
  waitForAck?: boolean;
  
  /** Timeout for acknowledgment in milliseconds */
  ackTimeout?: number;
}

// =============================================================================
// BASE EVENT MODULE INTERFACE
// =============================================================================

/**
 * Base interface that all domain event modules should implement
 */
export interface IEventModule {
  /**
   * Initialize the event module
   */
  initialize(): Promise<Result<void, Error>>;
  
  /**
   * Shutdown the event module and clean up resources
   */
  shutdown(): Promise<Result<void, Error>>;
  
  /**
   * Register an event handler for a specific event type
   */
  on(eventType: string, handler: Function): void;
  
  /**
   * Remove an event handler for a specific event type
   */
  off(eventType: string, handler: Function): void;
  
  /**
   * Emit an event with optional correlation context
   */
  emit(eventType: string, eventData: any, options?: EventEmissionOptions): void;
  
  /**
   * Create a correlation context for tracking related events
   */
  createCorrelation(type: string, metadata?: Record<string, unknown>): CorrelationContext;
  
  /**
   * Send heartbeat with optional custom data
   */
  sendHeartbeat(customData?: Record<string, unknown>): Promise<void>;
  
  /**
   * Get module status and metrics
   */
  getStatus(): ModuleStatus;
}

// =============================================================================
// BASE EVENT MODULE IMPLEMENTATION
// =============================================================================

/**
 * Base implementation of event module with common functionality
 * 
 * Provides standard initialization, correlation tracking, heartbeat monitoring,
 * and event handling patterns that all domain modules can extend.
 */
export abstract class BaseEventModule implements IEventModule {
  protected readonly config: Required<BaseEventModuleConfig>;
  protected readonly logger: Logger;
  protected readonly eventBus: EventBus;
  
  protected isInitialized = false;
  protected eventHandlers = new Map<string, Set<Function>>();
  protected heartbeatTimer?: NodeJS.Timeout;
  protected lastHeartbeat = 0;
  
  constructor(config: BaseEventModuleConfig, eventBus?: EventBus) {
    this.config = {
      enableCorrelation: true,
      enableHeartbeat: false,
      heartbeatInterval: 30000, // 30 seconds default
      description: `${config.moduleName} Event Module`,
      metadata: {},
      ...config
    };
    
    this.logger = getLogger(`event-module:${this.config.moduleId}`);
    this.eventBus = eventBus ?? EventBus.getInstance();
  }

  /**
   * Initialize the event module with common setup
   */
  async initialize(): Promise<Result<void, Error>> {
    if (this.isInitialized) {
      this.logger.warn('Event module already initialized');
      return ok();
    }

    return await withTrace(`event-module:initialize:${this.config.moduleId}`, async () => {
      try {
        this.logger.info('Initializing event module', {
          moduleId: this.config.moduleId,
          moduleName: this.config.moduleName,
          version: this.config.version,
          supportedEvents: this.config.supportedEvents
        });

        // Perform domain-specific initialization
        const domainResult = await this.initializeDomainModule();
        if (domainResult.isErr()) {
          return err(new Error(`Domain initialization failed: ${domainResult.error.message}`));
        }

        // Setup event forwarding
        this.setupEventForwarding();

        // Start heartbeat if enabled
        if (this.config.enableHeartbeat) {
          this.startHeartbeat();
        }

        this.isInitialized = true;
        
        recordMetric('event_module_initialized', 1, {
          moduleId: this.config.moduleId,
          moduleName: this.config.moduleName
        });

        this.logger.info('Event module initialized successfully');
        return ok();
      } catch (error) {
        return err(new Error(`Event module initialization failed: ${error}`));
      }
    });
  }

  /**
   * Shutdown the event module and clean up resources
   */
  async shutdown(): Promise<Result<void, Error>> {
    if (!this.isInitialized) {
      return ok();
    }

    return await withTrace(`event-module:shutdown:${this.config.moduleId}`, async () => {
      try {
        this.logger.info('Shutting down event module');

        // Stop heartbeat
        if (this.heartbeatTimer) {
          clearInterval(this.heartbeatTimer);
          this.heartbeatTimer = undefined;
        }

        // Perform domain-specific cleanup
        const domainResult = await this.shutdownDomainModule();
        if (domainResult.isErr()) {
          this.logger.error('Domain shutdown failed', { error: domainResult.error.message });
        }

        // Clear event handlers
        this.eventHandlers.clear();
        this.isInitialized = false;
        
        recordMetric('event_module_shutdown', 1, {
          moduleId: this.config.moduleId,
          moduleName: this.config.moduleName
        });

        this.logger.info('Event module shutdown complete');
        return ok();
      } catch (error) {
        return err(new Error(`Event module shutdown failed: ${error}`));
      }
    });
  }

  /**
   * Register an event handler for a specific event type
   */
  on(eventType: string, handler: Function): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    
    this.eventHandlers.get(eventType)!.add(handler);
    this.eventBus.on(eventType, handler);
    
    this.logger.debug('Event handler registered', {
      eventType,
      handlerCount: this.eventHandlers.get(eventType)!.size
    });
  }

  /**
   * Remove an event handler for a specific event type
   */
  off(eventType: string, handler: Function): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      this.eventBus.off(eventType, handler);
      
      if (handlers.size === 0) {
        this.eventHandlers.delete(eventType);
      }
      
      this.logger.debug('Event handler removed', {
        eventType,
        remainingHandlerCount: handlers.size
      });
    }
  }

  /**
   * Emit an event with optional correlation context
   */
  emit(eventType: string, eventData: any, options: EventEmissionOptions = {}): void {
    if (!this.isInitialized) {
      throw new Error(`Event module ${this.config.moduleId} not initialized`);
    }

    const enrichedEventData = {
      ...eventData,
      moduleId: this.config.moduleId,
      timestamp: eventData.timestamp || Date.now()
    };

    if (options.correlationContext) {
      enrichedEventData._correlation = options.correlationContext;
    }

    this.eventBus.emit(eventType, enrichedEventData);
    
    recordMetric('event_module_event_emitted', 1, {
      moduleId: this.config.moduleId,
      eventType,
      priority: options.priority || 'medium'
    });
    
    this.logger.debug('Event emitted', {
      eventType,
      correlationId: options.correlationContext?.correlationId,
      priority: options.priority
    });
  }

  /**
   * Create a correlation context for tracking related events
   */
  createCorrelation(type: string, metadata: Record<string, unknown> = {}): CorrelationContext {
    if (!this.config.enableCorrelation) {
      throw new Error('Correlation tracking is disabled for this module');
    }

    return {
      correlationId: generateUUID(),
      initiatedBy: type,
      createdAt: Date.now(),
      metadata: {
        moduleId: this.config.moduleId,
        moduleName: this.config.moduleName,
        ...metadata
      }
    };
  }

  /**
   * Send heartbeat with optional custom data
   */
  async sendHeartbeat(customData: Record<string, unknown> = {}): Promise<void> {
    if (!this.isInitialized || !this.config.enableHeartbeat) {
      return;
    }

    this.lastHeartbeat = Date.now();
    
    const heartbeatData = {
      moduleId: this.config.moduleId,
      moduleName: this.config.moduleName,
      timestamp: this.lastHeartbeat,
      status: this.getStatus(),
      ...customData
    };

    this.emit('system:heartbeat', heartbeatData);
    
    this.logger.debug('Heartbeat sent', {
      moduleId: this.config.moduleId,
      timestamp: this.lastHeartbeat
    });
  }

  /**
   * Get module status and metrics
   */
  getStatus(): ModuleStatus {
    return {
      moduleId: this.config.moduleId,
      isInitialized: this.isInitialized,
      eventHandlerCount: Array.from(this.eventHandlers.values()).reduce((sum, set) => sum + set.size, 0),
      correlationEnabled: this.config.enableCorrelation,
      heartbeatEnabled: this.config.enableHeartbeat,
      lastHeartbeat: this.lastHeartbeat || undefined,
      metadata: {
        moduleName: this.config.moduleName,
        version: this.config.version,
        supportedEvents: this.config.supportedEvents,
        ...this.config.metadata
      }
    };
  }

  // =============================================================================
  // ABSTRACT METHODS (Domain-Specific Implementation Required)
  // =============================================================================

  /**
   * Initialize domain-specific functionality
   * 
   * @abstract
   * @returns Promise that resolves with success/error result
   */
  protected abstract initializeDomainModule(): Promise<Result<void, Error>>;

  /**
   * Shutdown domain-specific functionality
   * 
   * @abstract
   * @returns Promise that resolves with success/error result
   */
  protected abstract shutdownDomainModule(): Promise<Result<void, Error>>;

  /**
   * Setup domain-specific event forwarding and handlers
   * 
   * @abstract
   */
  protected abstract setupEventForwarding(): void;

  // =============================================================================
  // PROTECTED UTILITY METHODS
  // =============================================================================

  /**
   * Validate that the module is initialized before operations
   */
  protected ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error(`Event module ${this.config.moduleId} not initialized. Call initialize() first.`);
    }
  }

  /**
   * Check if an event type is supported by this module
   */
  protected isEventSupported(eventType: string): boolean {
    return this.config.supportedEvents.some(pattern => {
      // Convert glob-like patterns to regex
      const regexPattern = pattern.replace(/\*/g, '.*');
      const regex = new RegExp(`^${regexPattern}$`);
      return regex.test(eventType);
    });
  }

  /**
   * Start periodic heartbeat timer
   */
  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    this.heartbeatTimer = setInterval(async () => {
      try {
        await this.sendHeartbeat();
      } catch (error) {
        this.logger.error('Heartbeat failed', {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }, this.config.heartbeatInterval);

    this.logger.info('Heartbeat started', {
      interval: this.config.heartbeatInterval
    });
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Create a correlation context for external use
 */
export function createCorrelationContext(
  initiatedBy: string,
  metadata: Record<string, unknown> = {}
): CorrelationContext {
  return {
    correlationId: generateUUID(),
    initiatedBy,
    createdAt: Date.now(),
    metadata
  };
}

/**
 * Check if an event matches a pattern (supports wildcards)
 */
export function eventMatches(eventType: string, pattern: string): boolean {
  const regexPattern = pattern.replace(/\*/g, '.*');
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(eventType);
}

/**
 * Validate event module configuration
 */
export function validateEventModuleConfig(config: BaseEventModuleConfig): Result<void, Error> {
  if (!config.moduleId || config.moduleId.trim() === '') {
    return err(new Error('moduleId is required and cannot be empty'));
  }
  
  if (!config.moduleName || config.moduleName.trim() === '') {
    return err(new Error('moduleName is required and cannot be empty'));
  }
  
  if (!config.version || config.version.trim() === '') {
    return err(new Error('version is required and cannot be empty'));
  }
  
  if (!Array.isArray(config.supportedEvents) || config.supportedEvents.length === 0) {
    return err(new Error('supportedEvents must be a non-empty array'));
  }
  
  if (config.heartbeatInterval !== undefined && config.heartbeatInterval < 1000) {
    return err(new Error('heartbeatInterval must be at least 1000ms'));
  }
  
  return ok();
}