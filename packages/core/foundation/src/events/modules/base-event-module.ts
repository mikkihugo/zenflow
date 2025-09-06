/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @fileoverview Base Event Module Interface and Implementation (Foundation)
 *
 * Provides common patterns and interfaces that all domain event modules should implement,
 * using only foundation-level imports to avoid cross-package dependencies.
 */

import { EventBus } from '../../events/event-bus.js';
import { getLogger, type Logger } from '../../core/logging/logging.service.js';
import { generateUUID } from '../../utils.js';
import { ok, err, Result } from '../../error-handling/index.js';

// Lightweight local shims; real telemetry lives in services/telemetry.
const recordMetric = (__metricName: string, __metricValue: number, __metricAttrs?: Record<string, unknown>) => { /* noop metric shim */ };
async function withTrace<T>(name: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    getLogger('event-module:trace').error(`withTrace(${name}) failed`, { error: (error as Error).message });
    throw error;
  }
}

export interface CorrelationContext {
  correlationId: string;
  metadata: Record<string, unknown>;
  initiatedBy?: string;
  createdAt?: number;
}

export interface BaseEventModuleConfig {
  moduleId: string;
  moduleName: string;
  version: string;
  supportedEvents: string[];
  description?: string;
  enableCorrelation?: boolean;
  enableHeartbeat?: boolean;
  heartbeatInterval?: number;
  metadata?: Record<string, unknown>;
}

export interface ModuleStatus {
  moduleId: string;
  isInitialized: boolean;
  eventHandlerCount: number;
  correlationEnabled: boolean;
  heartbeatEnabled: boolean;
  lastHeartbeat?: number;
  metadata?: Record<string, unknown>;
}

export interface EventEmissionOptions {
  correlationContext?: CorrelationContext;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  waitForAck?: boolean;
  ackTimeout?: number;
}

export interface IEventModule {
  readonly moduleId: string;
  initialize(): Promise<Result<void, Error>>;
  shutdown(): Promise<Result<void, Error>>;
  on(eventType: string, handler: Function): void;
  off(eventType: string, handler: Function): void;
  emit(eventType: string, eventData: any, options?: EventEmissionOptions | CorrelationContext): void;
  createCorrelation(type: string, metadata?: Record<string, unknown>): CorrelationContext;
  sendHeartbeat(customData?: Record<string, unknown>): Promise<void>;
  getStatus(): ModuleStatus;
}

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
      heartbeatInterval: 30000,
      description: `${config.moduleName} Event Module`,
      metadata: {},
      ...config,
    };

    this.logger = getLogger(`event-module:${this.config.moduleId}`);
    this.eventBus = eventBus ?? EventBus.getInstance();
  }

  get moduleId(): string {
    return this.config.moduleId;
  }

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
          supportedEvents: this.config.supportedEvents,
        });

        const domainResult = await this.initializeDomainModule();
        if (domainResult.isErr()) {
          return err(new Error(`Domain initialization failed: ${domainResult.error.message}`));
        }

        this.setupEventForwarding();

        if (this.config.enableHeartbeat) {
          this.startHeartbeat();
        }

        this.isInitialized = true;
        recordMetric('event_module_initialized', 1, {
          moduleId: this.config.moduleId,
          moduleName: this.config.moduleName,
        });
        this.logger.info('Event module initialized successfully');
        return ok();
      } catch (error) {
        return err(new Error(`Event module initialization failed: ${error}`));
      }
    });
  }

  async shutdown(): Promise<Result<void, Error>> {
    if (!this.isInitialized) {
      return ok();
    }
    return await withTrace(`event-module:shutdown:${this.config.moduleId}`, async () => {
      try {
        this.logger.info('Shutting down event module');
        if (this.heartbeatTimer) {
          clearInterval(this.heartbeatTimer);
          this.heartbeatTimer = undefined;
        }
        const domainResult = await this.shutdownDomainModule();
        if (domainResult.isErr()) {
          this.logger.error('Domain shutdown failed', { error: domainResult.error.message });
        }
        this.eventHandlers.clear();
        this.isInitialized = false;
        recordMetric('event_module_shutdown', 1, {
          moduleId: this.config.moduleId,
          moduleName: this.config.moduleName,
        });
        this.logger.info('Event module shutdown complete');
        return ok();
      } catch (error) {
        return err(new Error(`Event module shutdown failed: ${error}`));
      }
    });
  }

  on(eventType: string, handler: Function): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType)!.add(handler);
    this.eventBus.on(eventType, handler as any);
    this.logger.debug('Event handler registered', {
      eventType,
      handlerCount: this.eventHandlers.get(eventType)!.size,
    });
  }

  off(eventType: string, handler: Function): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      this.eventBus.off(eventType, handler as any);
      if (handlers.size === 0) {
        this.eventHandlers.delete(eventType);
      }
      this.logger.debug('Event handler removed', {
        eventType,
        remainingHandlerCount: handlers.size,
      });
    }
  }

  emit(eventType: string, eventData: Record<string, unknown>, options: EventEmissionOptions | CorrelationContext = {}): void {
    if (!this.isInitialized) {
      throw new Error(`Event module ${this.config.moduleId} not initialized`);
    }
  const enrichedEventData: Record<string, unknown> = {
      ...eventData,
      moduleId: this.config.moduleId,
      timestamp: (eventData && eventData['timestamp']) || new Date(),
    };
    const opts = isCorrelationContext(options)
      ? { correlationContext: options }
      : (options as EventEmissionOptions);
    if (opts && (opts as EventEmissionOptions).correlationContext) {
      (enrichedEventData as any)._correlation = (opts as EventEmissionOptions).correlationContext;
    }
    this.eventBus.emit(eventType, enrichedEventData);
    recordMetric('event_module_event_emitted', 1, {
      moduleId: this.config.moduleId,
      eventType,
      priority: (opts as EventEmissionOptions).priority || 'medium',
    });
    this.logger.debug('Event emitted', {
      eventType,
      correlationId: (opts as EventEmissionOptions).correlationContext?.correlationId,
      priority: (opts as EventEmissionOptions).priority,
    });
  }

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
        ...metadata,
      },
    };
  }

  async sendHeartbeat(customData: Record<string, unknown> = {}): Promise<void> {
    if (!this.isInitialized || !this.config.enableHeartbeat) return;
    this.lastHeartbeat = Date.now();
    const heartbeatData = {
      moduleId: this.config.moduleId,
      moduleName: this.config.moduleName,
      timestamp: this.lastHeartbeat,
      status: this.getStatus(),
      ...customData,
    };
    this.emit('system:heartbeat', heartbeatData);
    this.logger.debug('Heartbeat sent', { moduleId: this.config.moduleId, timestamp: this.lastHeartbeat });
  }

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
        ...this.config.metadata,
      },
    };
  }

  protected abstract initializeDomainModule(): Promise<Result<void, Error>>;
  protected abstract shutdownDomainModule(): Promise<Result<void, Error>>;
  protected abstract setupEventForwarding(): void;

  private startHeartbeat(): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = setInterval(async () => {
      try {
        await this.sendHeartbeat();
      } catch (error) {
        this.logger.error('Heartbeat failed', { error: error instanceof Error ? error.message : String(error) });
      }
    }, this.config.heartbeatInterval);
    this.logger.info('Heartbeat started', { interval: this.config.heartbeatInterval });
  }
}

export function createCorrelationContext(
  initiatedByOrOptions: string | { initiatedBy: string; metadata?: Record<string, unknown> },
  metadata: Record<string, unknown> = {}
): CorrelationContext {
  const initiatedBy = typeof initiatedByOrOptions === 'string' ? initiatedByOrOptions : initiatedByOrOptions.initiatedBy;
  const meta = typeof initiatedByOrOptions === 'string' ? metadata : (initiatedByOrOptions.metadata || {});
  return { correlationId: generateUUID(), initiatedBy, createdAt: Date.now(), metadata: meta };
}

function isCorrelationContext(obj: unknown): obj is CorrelationContext {
  return !!obj && typeof obj === 'object' && 'correlationId' in (obj as any);
}

export function eventMatches(eventType: string, pattern: string): boolean {
  // Convert simple wildcard pattern to regex once (could be cached if needed)
  const regexPattern = pattern.replace(/[-/\\^$+?.()|[\]{}]/g, r => `\\${r}`).replace(/\*/g, '.*');
  return new RegExp(`^${regexPattern}$`).test(eventType);
}

export function validateEventModuleConfig(config: BaseEventModuleConfig): Result<void, Error> {
  if (!config.moduleId || config.moduleId.trim() === '') return err(new Error('moduleId is required and cannot be empty'));
  if (!config.moduleName || config.moduleName.trim() === '') return err(new Error('moduleName is required and cannot be empty'));
  if (!config.version || config.version.trim() === '') return err(new Error('version is required and cannot be empty'));
  if (!Array.isArray(config.supportedEvents) || config.supportedEvents.length === 0) return err(new Error('supportedEvents must be a non-empty array'));
  if (config.heartbeatInterval !== undefined && config.heartbeatInterval < 1000) return err(new Error('heartbeatInterval must be at least 1000ms'));
  return ok();
}
