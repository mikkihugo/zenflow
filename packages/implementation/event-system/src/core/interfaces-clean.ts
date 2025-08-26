/**
 * @file UEL (Unified Event Layer) Core Interfaces - Clean Version
 * 
 * Provides unified abstractions for all event management implementations
 */

export type EventPriority = 'critical' | 'high' | 'medium' | 'low';
export type EventProcessingStrategy = 'immediate' | 'queued' | 'batched' | 'throttled';

export interface SystemEvent {
  id: string;
  timestamp: Date;
  source: string;
  type: string;
  payload: Record<string, unknown>;
  priority?: EventPriority;
  metadata?: Record<string, unknown>;
  correlationId?: string;
  parentEventId?: string;
  sequence?: number;
}

export type EventListener<T extends SystemEvent = SystemEvent> = (
  event: T
) => void | Promise<void>;

export interface EventFilter {
  types?: string[];
  sources?: string[];
  priorities?: EventPriority[];
  metadata?: Record<string, unknown>;
  customFilter?: (event: SystemEvent) => boolean;
}

export interface EventTransform {
  mapper?: (event: SystemEvent) => SystemEvent;
  enricher?: (event: SystemEvent) => Promise<SystemEvent>;
  validator?: (event: SystemEvent) => boolean;
}

export interface EventRetryConfig {
  attempts: number;
  delay: number;
  backoff: 'linear' | 'exponential' | 'fixed';
  maxDelay?: number;
  retryCondition?: (error: unknown, event: SystemEvent) => boolean;
}

export interface EventManagerConfig {
  name: string;
  type: EventManagerType;
  maxListeners?: number;
  processing: {
    strategy: EventProcessingStrategy;
    batchSize?: number;
    throttleMs?: number;
    queueSize?: number;
  };
  retry?: EventRetryConfig;
  metadata?: Record<string, unknown>;
}

export interface EventSubscription<T extends SystemEvent = SystemEvent> {
  id: string;
  eventTypes: string[];
  listener: EventListener<T>;
  filter?: EventFilter;
  transform?: EventTransform;
  priority: EventPriority;
  created: Date;
  active: boolean;
  metadata?: Record<string, unknown>;
}

export interface EventManager {
  readonly config: EventManagerConfig;
  readonly name: string;
  readonly type: EventManagerType;

  // Lifecycle
  start(): Promise<void>;
  stop(): Promise<void>;
  restart(): Promise<void>;
  isRunning(): boolean;

  // Event emission
  emit<T extends SystemEvent>(event: T): Promise<void>;
  emitBatch<T extends SystemEvent>(events: T[]): Promise<void>;

  // Event subscription
  subscribe<T extends SystemEvent>(
    eventTypes: string | string[],
    listener: EventListener<T>
  ): string;
  unsubscribe(subscriptionId: string): boolean;
  unsubscribeAll(eventType?: string): number;

  // Health and cleanup
  destroy(): Promise<void>;
}

export interface EventManagerFactory<TConfig extends EventManagerConfig = EventManagerConfig> {
  create(config: TConfig): Promise<EventManager>;
  createMultiple(configs: TConfig[]): Promise<EventManager[]>;
  get(name: string): EventManager | undefined;
  list(): EventManager[];
  has(name: string): boolean;
  remove(name: string): Promise<boolean>;
}

export type EventManagerType = 
  | 'system'
  | 'coordination'
  | 'communication'
  | 'monitoring'
  | 'interface'
  | 'neural'
  | 'database'
  | 'memory'
  | 'workflow'
  | 'custom';

export const EventManagerTypes = {
  SYSTEM: 'system' as const,
  COORDINATION: 'coordination' as const,
  COMMUNICATION: 'communication' as const,
  MONITORING: 'monitoring' as const,
  INTERFACE: 'interface' as const,
  NEURAL: 'neural' as const,
  DATABASE: 'database' as const,
  MEMORY: 'memory' as const,
  WORKFLOW: 'workflow' as const,
  CUSTOM: 'custom' as const,
} as const;

// Error classes
export class EventError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly manager: string,
    public readonly eventId?: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'EventError';
  }
}

export class EventSubscriptionError extends EventError {
  constructor(manager: string, subscriptionId: string, cause?: Error) {
    super(
      `Event subscription failed for manager: ${manager}`,
      'SUBSCRIPTION_ERROR',
      manager,
      subscriptionId,
      cause
    );
    this.name = 'EventSubscriptionError';
  }
}

export class EventEmissionError extends EventError {
  constructor(manager: string, eventId: string, cause?: Error) {
    super(
      `Event emission failed for manager: ${manager}`,
      'EMISSION_ERROR',
      manager,
      eventId,
      cause
    );
    this.name = 'EventEmissionError';
  }
}

// Type guards
export const EventTypeGuards = {
  isEventManagerType: (value: unknown): value is EventManagerType => (
      typeof value === 'string' &&
      Object.values(EventManagerTypes).includes(value as EventManagerType)
    ),

  isEventPriority: (value: unknown): value is EventPriority => (
      typeof value === 'string' &&
      ['critical', 'high', 'medium', 'low'].includes(value)
    ),

  isSystemEvent: (value: unknown): value is SystemEvent => (
      value !== null &&
      typeof value === 'object' &&
      typeof (value as any).id === 'string' &&
      (value as any).timestamp instanceof Date &&
      typeof (value as any).source === 'string' &&
      typeof (value as any).type === 'string' &&
      typeof (value as any).payload === 'object'
    ),
} as const;

// Configuration presets
export const EventManagerPresets = {
  REAL_TIME: {
    processing: {
      strategy: 'immediate' as EventProcessingStrategy,
      queueSize: 1000,
    },
  },
  BATCH_PROCESSING: {
    processing: {
      strategy: 'batched' as EventProcessingStrategy,
      batchSize: 100,
      queueSize: 10000,
    },
  },
  HIGH_THROUGHPUT: {
    processing: {
      strategy: 'queued' as EventProcessingStrategy,
      queueSize: 50000,
    },
  },
} as const;

// Re-exports for compatibility
export type { SystemLifecycleEvent } from '../types';