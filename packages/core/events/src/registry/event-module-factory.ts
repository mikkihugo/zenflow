/**
 * @fileoverview Event Module Factory
 * 
 * Factory for creating event modules that integrate with foundation's event registry
 * Simplifies event registration and management for packages using the unified event system.
 */

import { 
  EventBus,
  registerEventModule, 
  sendModuleHeartbeat,
  type BaseEvent 
} from '@claude-zen/foundation';
import { globalEventCoordinator } from '../coordination/event-coordinator.js';
import { 
  createCorrelationContext,
  correlateEvent,
  type CorrelationContext,
  type CorrelatedEvent
} from '../saga/correlation-tracker.js';

// =============================================================================
// EVENT MODULE CONFIGURATION
// =============================================================================

/**
 * Configuration for creating an event module
 */
export interface EventModuleConfig {
  moduleId: string;
  moduleName: string;
  moduleType: 'brain' | 'document-intelligence' | 'coordination' | 'system' | 'web-interface';
  version: string;
  supportedEvents: string[];
  description?: string;
  metadata?: Record<string, unknown>;
  enableHeartbeat?: boolean;
  heartbeatInterval?: number;
  enableCorrelation?: boolean;
}

/**
 * Event module instance created by factory
 */
export interface EventModule {
  moduleId: string;
  moduleName: string;
  eventBus: EventBus;
  
  // Event emission with correlation
  emit<T extends BaseEvent>(eventName: string, event: T, correlationContext?: CorrelationContext): void;
  
  // Event listening
  on(eventName: string, handler: (event: any) => void | Promise<void>): void;
  off(eventName: string, handler?: Function): void;
  
  // Correlation utilities
  createCorrelation(initiatedBy: string, metadata?: Record<string, unknown>): CorrelationContext;
  correlateEvent<T extends BaseEvent>(event: T, context: CorrelationContext): T & CorrelatedEvent;
  
  // Heartbeat management
  sendHeartbeat(customData?: Record<string, unknown>): Promise<void>;
  
  // Module lifecycle
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
}

// =============================================================================
// EVENT MODULE IMPLEMENTATION
// =============================================================================

/**
 * Standard event module implementation
 */
class StandardEventModule implements EventModule {
  public readonly moduleId: string;
  public readonly moduleName: string;
  public readonly eventBus: EventBus;
  
  private config: EventModuleConfig;
  private heartbeatTimer?: NodeJS.Timeout;
  private startTime: number = Date.now();
  private eventEmissionCount: number = 0;
  private eventReceptionCount: number = 0;

  constructor(config: EventModuleConfig, eventBus?: EventBus) {
    this.config = config;
    this.moduleId = config.moduleId;
    this.moduleName = config.moduleName;
    this.eventBus = eventBus || EventBus.getInstance();
  }

  /**
   * Initialize the event module
   */
  async initialize(): Promise<void> {
    // Register with foundation's event registry
    await registerEventModule({
      moduleId: this.config.moduleId,
      moduleName: this.config.moduleName,
      moduleType: this.config.moduleType,
      supportedEvents: this.config.supportedEvents,
      metadata: {
        version: this.config.version,
        description: this.config.description,
        startTime: this.startTime,
        correlationEnabled: this.config.enableCorrelation,
        ...this.config.metadata,
      },
    });

    // Start heartbeat if enabled
    if (this.config.enableHeartbeat) {
      this.startHeartbeat();
    }

    // Register with event coordinator for unified coordination
    this.eventBus.emit('event-coordinator:module-registered', {
      moduleId: this.config.moduleId,
      moduleName: this.config.moduleName,
      moduleType: this.config.moduleType,
      supportedEvents: this.config.supportedEvents,
    });
  }

  /**
   * Emit event with optional correlation
   */
  emit<T extends BaseEvent>(
    eventName: string, 
    event: T, 
    correlationContext?: CorrelationContext
  ): void {
    let finalEvent: T | (T & CorrelatedEvent) = event;

    // Add correlation if context provided and correlation is enabled
    if (correlationContext && this.config.enableCorrelation) {
      finalEvent = correlateEvent(event, correlationContext, {
        initiatedBy: this.config.moduleType as any,
        triggeringEvent: eventName,
        relatedEvents: [],
      });
    }

    // Ensure event has required fields
    if (!finalEvent.requestId) {
      finalEvent.requestId = `${this.config.moduleId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    if (!finalEvent.timestamp) {
      finalEvent.timestamp = Date.now();
    }

    this.eventBus.emit(eventName, finalEvent);
    this.eventEmissionCount++;
  }

  /**
   * Listen to events
   */
  on(eventName: string, handler: (event: any) => void | Promise<void>): void {
    this.eventBus.on(eventName, (event: any) => {
      this.eventReceptionCount++;
      handler(event);
    });
  }

  /**
   * Stop listening to events
   */
  off(eventName: string, handler?: Function): void {
    this.eventBus.off(eventName, handler);
  }

  /**
   * Create correlation context
   */
  createCorrelation(
    initiatedBy?: string, 
    metadata?: Record<string, unknown>
  ): CorrelationContext {
    return createCorrelationContext({
      initiatedBy: (initiatedBy as any) || this.config.moduleType,
      metadata: {
        moduleId: this.config.moduleId,
        moduleName: this.config.moduleName,
        ...metadata,
      },
    });
  }

  /**
   * Correlate an event
   */
  correlateEvent<T extends BaseEvent>(
    event: T, 
    context: CorrelationContext
  ): T & CorrelatedEvent {
    return correlateEvent(event, context, {
      initiatedBy: this.config.moduleType as any,
      triggeringEvent: 'manual-correlation',
      relatedEvents: [],
    });
  }

  /**
   * Send heartbeat
   */
  async sendHeartbeat(customData?: Record<string, unknown>): Promise<void> {
    await sendModuleHeartbeat(this.config.moduleId, {
      uptime: Date.now() - this.startTime,
      status: 'active',
      eventEmissionCount: this.eventEmissionCount,
      eventReceptionCount: this.eventReceptionCount,
      memoryUsage: process.memoryUsage().heapUsed,
      ...customData,
    });
  }

  /**
   * Start automatic heartbeat
   */
  private startHeartbeat(): void {
    const interval = this.config.heartbeatInterval || 30000; // 30 seconds default
    
    this.heartbeatTimer = setInterval(async () => {
      try {
        await this.sendHeartbeat();
      } catch (error) {
        console.warn(`Heartbeat failed for module ${this.config.moduleId}:`, error);
      }
    }, interval);
  }

  /**
   * Shutdown the module
   */
  async shutdown(): Promise<void> {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }

    // Send final heartbeat
    if (this.config.enableHeartbeat) {
      try {
        await sendModuleHeartbeat(this.config.moduleId, {
          uptime: Date.now() - this.startTime,
          status: 'shutdown',
          eventEmissionCount: this.eventEmissionCount,
          eventReceptionCount: this.eventReceptionCount,
          shutdownTime: Date.now(),
        });
      } catch (error) {
        console.warn(`Final heartbeat failed for module ${this.config.moduleId}:`, error);
      }
    }

    // Notify event coordinator
    this.eventBus.emit('event-coordinator:module-shutdown', {
      moduleId: this.config.moduleId,
      uptime: Date.now() - this.startTime,
    });
  }
}

// =============================================================================
// EVENT MODULE FACTORY
// =============================================================================

/**
 * Factory for creating event modules with standard configuration
 */
export class EventModuleFactory {
  /**
   * Create a brain event module
   */
  static createBrainModule(config: Omit<EventModuleConfig, 'moduleType'>): EventModule {
    return new StandardEventModule({
      ...config,
      moduleType: 'brain',
      enableCorrelation: true,
      enableHeartbeat: true,
      supportedEvents: [
        'brain:coordination:*',
        'brain:document-intelligence:*',
        'brain:analysis:*',
        'brain:optimization:*',
        ...config.supportedEvents,
      ],
    });
  }

  /**
   * Create a document intelligence event module
   */
  static createDocumentIntelligenceModule(config: Omit<EventModuleConfig, 'moduleType'>): EventModule {
    return new StandardEventModule({
      ...config,
      moduleType: 'document-intelligence',
      enableCorrelation: true,
      enableHeartbeat: true,
      supportedEvents: [
        'document-intelligence:coordination:*',
        'document-intelligence:brain:*',
        'document-intelligence:import:*',
        'document-intelligence:processing:*',
        ...config.supportedEvents,
      ],
    });
  }

  /**
   * Create a coordination event module
   */
  static createCoordinationModule(config: Omit<EventModuleConfig, 'moduleType'>): EventModule {
    return new StandardEventModule({
      ...config,
      moduleType: 'coordination',
      enableCorrelation: true,
      enableHeartbeat: true,
      supportedEvents: [
        'coordination:brain:*',
        'coordination:document-intelligence:*',
        'coordination:safe:*',
        'coordination:sparc:*',
        'coordination:workflow:*',
        ...config.supportedEvents,
      ],
    });
  }

  /**
   * Create a web interface event module
   */
  static createWebInterfaceModule(config: Omit<EventModuleConfig, 'moduleType'>): EventModule {
    return new StandardEventModule({
      ...config,
      moduleType: 'web-interface',
      enableCorrelation: true,
      enableHeartbeat: false, // Web interface typically doesn't need heartbeat
      supportedEvents: [
        'web-interface:user:*',
        'web-interface:safe:*',
        'web-interface:document:*',
        ...config.supportedEvents,
      ],
    });
  }

  /**
   * Create a custom event module
   */
  static createCustomModule(config: EventModuleConfig): EventModule {
    return new StandardEventModule(config);
  }
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Quick setup for brain package event integration
 */
export function createBrainEventModule(
  moduleId: string,
  version: string = '1.0.0'
): EventModule {
  return EventModuleFactory.createBrainModule({
    moduleId,
    moduleName: `Brain Service ${moduleId}`,
    version,
    supportedEvents: [],
    description: 'Brain service event module with coordination capabilities',
  });
}

/**
 * Quick setup for document intelligence package event integration
 */
export function createDocumentIntelligenceEventModule(
  moduleId: string,
  version: string = '1.0.0'
): EventModule {
  return EventModuleFactory.createDocumentIntelligenceModule({
    moduleId,
    moduleName: `Document Intelligence Service ${moduleId}`,
    version,
    supportedEvents: [],
    description: 'Document intelligence service for external document import',
  });
}

/**
 * Quick setup for coordination package event integration
 */
export function createCoordinationEventModule(
  moduleId: string,
  version: string = '1.0.0'
): EventModule {
  return EventModuleFactory.createCoordinationModule({
    moduleId,
    moduleName: `Coordination Service ${moduleId}`,
    version,
    supportedEvents: [],
    description: 'Coordination service for cross-package workflow orchestration',
  });
}