/**
 * @fileoverview Event System Type Definitions
 *
 * Comprehensive type definitions for the event system including
 * event patterns, manager types, and processing strategies.
 */

// Re-export core interfaces
export * from '../core/interfaces-clean';
export type { SystemLifecycleEvent } from '../types';

// Event type patterns for categorization
export const EventTypePatterns = {
  SYSTEM_LIFECYCLE: ['system:startup', 'system:shutdown', 'system:error', 'system:ready'] as const,
  USER_ACTIONS: ['user:login', 'user:logout', 'user:action', 'user:preference'] as const,
  WORKFLOW_EVENTS: ['workflow:start', 'workflow:complete', 'workflow:error', 'workflow:pause'] as const,
  DATABASE_EVENTS: ['db:connect', 'db:disconnect', 'db:query', 'db:error'] as const,
  API_EVENTS: ['api:request', 'api:response', 'api:error', 'api:timeout'] as const,
  NEURAL_EVENTS: ['neural:process', 'neural:complete', 'neural:optimize', 'neural:error'] as const,
  COORDINATION_EVENTS: ['coord:start', 'coord:sync', 'coord:conflict', 'coord:resolve'] as const,
  MONITORING_EVENTS: ['monitor:metric', 'monitor:alert', 'monitor:health', 'monitor:performance'] as const,
} as const;

// Event priority levels
export type EventPriorityLevel = 'critical' | 'high' | 'medium' | 'low';

// Processing strategies
export type ProcessingStrategyType = 'immediate' | 'queued' | 'batched' | 'throttled';
export type ProcessingStrategy = ProcessingStrategyType; // Alias for compatibility

// Missing strategy exports expected by index.ts
export type BackoffStrategy = 'linear' | 'exponential' | 'fixed';
export type ReliabilityLevel = 'high' | 'medium' | 'low';

// Missing config interfaces
export interface ProcessingConfig {
  strategy: ProcessingStrategyType;
  batchSize?: number;
  throttleMs?: number;
  queueSize?: number;
}

export interface RetryConfig {
  attempts: number;
  delay: number;
  backoff: BackoffStrategy;
  maxDelay?: number;
}

export interface HealthConfig {
  enabled?: boolean;
  interval?: number;
  timeout?: number;
}

// Manager type definitions
export type ManagerTypeDefinition = 
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

// Event metadata types
export interface EventMetadata {
  source?: string;
  timestamp?: Date;
  priority?: EventPriorityLevel;
  correlationId?: string;
  tags?: string[];
  context?: Record<string, unknown>;
}

// Event filtering types
export interface EventFilterCriteria {
  types?: string[];
  sources?: string[];
  priorities?: EventPriorityLevel[];
  tags?: string[];
  timeRange?: {
    start: Date;
    end: Date;
  };
  customFilter?: (event: any) => boolean;
}

// Event transformation types
export interface EventTransformation {
  mapper?: (event: any) => any;
  enricher?: (event: any) => Promise<any>;
  validator?: (event: any) => boolean;
  serializer?: (event: any) => string;
  deserializer?: (data: string) => any;
}

// Subscription configuration
export interface SubscriptionConfig {
  eventTypes: string[];
  filter?: EventFilterCriteria;
  transform?: EventTransformation;
  priority?: EventPriorityLevel;
  active?: boolean;
  metadata?: Record<string, unknown>;
}

// Manager configuration
export interface ManagerConfiguration {
  name: string;
  type: ManagerTypeDefinition;
  maxListeners?: number;
  processing: {
    strategy: ProcessingStrategyType;
    batchSize?: number;
    throttleMs?: number;
    queueSize?: number;
  };
  retry?: {
    attempts: number;
    delay: number;
    backoff: 'linear' | 'exponential' | 'fixed';
    maxDelay?: number;
  };
  metadata?: Record<string, unknown>;
}

// Event emission options
export interface EmissionOptions {
  priority?: EventPriorityLevel;
  correlationId?: string;
  timeout?: number;
  retry?: boolean;
  metadata?: Record<string, unknown>;
}

// Batch processing options
export interface BatchProcessingOptions {
  maxBatchSize?: number;
  maxWaitTime?: number;
  priority?: EventPriorityLevel;
  processingMode?: 'parallel' | 'sequential';
}

// Health check types
export interface HealthCheckResult {
  healthy: boolean;
  status: 'ok' | 'degraded' | 'critical';
  details?: {
    uptime?: number;
    eventsProcessed?: number;
    errorRate?: number;
    queueSize?: number;
    subscriptionCount?: number;
  };
  timestamp: Date;
}

// Performance metrics
export interface PerformanceMetrics {
  eventsPerSecond: number;
  averageProcessingTime: number;
  errorRate: number;
  queueUtilization: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
}

// Error types
export interface EventSystemError {
  code: string;
  message: string;
  manager?: string;
  eventId?: string;
  timestamp: Date;
  cause?: Error;
  context?: Record<string, unknown>;
}

// Factory types
export interface FactoryConfiguration {
  defaultType: ManagerTypeDefinition;
  defaultProcessing: ProcessingStrategyType;
  maxManagers?: number;
  cleanupInterval?: number;
  healthCheckInterval?: number;
}

// Migration types
export interface MigrationOptions {
  preserveExistingListeners?: boolean;
  migrationMode?: 'passive' | 'active';
  backupEvents?: boolean;
  validateAfterMigration?: boolean;
}

// Export common type guards
export const TypeGuards = {
  isEventPriority: (value: unknown): value is EventPriorityLevel => typeof value === 'string' && ['critical', 'high', 'medium', 'low'].includes(value),

  isProcessingStrategy: (value: unknown): value is ProcessingStrategyType => typeof value === 'string' && ['immediate', 'queued', 'batched', 'throttled'].includes(value),

  isManagerType: (value: unknown): value is ManagerTypeDefinition => {
    const validTypes = ['system', 'coordination', 'communication', 'monitoring', 'interface', 'neural', 'database', 'memory', 'workflow', 'custom'];
    return typeof value === 'string' && validTypes.includes(value);
  },

  hasEventMetadata: (event: any): event is { metadata: EventMetadata } => event && typeof event === 'object' && 'metadata' in event,
} as const;

// Export utility functions
// Additional missing config interfaces
export interface MonitoringConfig {
  enabled?: boolean;
  interval?: number;
  metrics?: string[];
}

// Base event interface
export interface BaseEvent {
  type: string;
  timestamp: Date;
}

// Event types should come from their respective domain packages
// These are just type re-exports to maintain compatibility

// Coordination events - using local interface for now
export interface CoordinationEvent extends BaseEvent {
  type: 'coordination';
  operationId: string;
}

// Communication events - using local interface for now
export interface CommunicationEvent extends BaseEvent {
  type: 'communication';
  protocol: string;
}

// Monitoring events - using local interface for now
export interface MonitoringEvent extends BaseEvent {
  type: 'monitoring';
  metric: string;
}

// Neural events - using local interface for now
export interface NeuralEvent extends BaseEvent {
  type: 'neural';
  operation: string;
}

// Database events - using local interface for now
export interface DatabaseEvent extends BaseEvent {
  type: 'database';
  operation: string;
}

// Memory events - using local interface for now
export interface MemoryEvent extends BaseEvent {
  type: 'memory';
  operation: string;
}

// Workflow events - using local interface for now
export interface WorkflowEvent extends BaseEvent {
  type: 'workflow';
  workflowId: string;
}

// Safe events - using local interface for now
export interface SafeEvent extends BaseEvent {
  type: 'safe';
  component: string;
}

// These are local to event system - keep as stubs for now
export interface InterfaceEvent extends BaseEvent {
  type: 'interface';
  component: string;
}

export interface OrchestrationEvent extends BaseEvent {
  type: 'orchestration';
  phase: string;
}

export interface MemoryOrchestrationEvent extends BaseEvent {
  type: 'memory-orchestration';
  operation: string;
}

export interface UELEvent extends BaseEvent {
  type: 'uel';
  component: string;
}

// Missing topology and protocol types
export interface CoordinationTopology {
  nodes: string[];
  connections: Record<string, string[]>;
}

export interface CommunicationProtocol {
  name: string;
  version: string;
}

// Missing status and result types
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';
export interface SubscriptionInfo {
  id: string;
  eventTypes: string[];
  active: boolean;
}

export interface ProcessingError extends Error {
  code: string;
  eventId?: string;
}

export interface EventSubscriptionError extends Error {
  subscriptionId: string;
  eventType: string;
}

export interface EventResult {
  success: boolean;
  eventId: string;
  timestamp: Date;
}

export interface EventProcessingResult extends EventResult {
  processingTime: number;
  status: ProcessingStatus;
}

export interface EventSubscriptionResult {
  subscriptionId: string;
  success: boolean;
  error?: string;
}

export interface EventSubscription {
  id: string;
  eventTypes: string[];
  active: boolean;
}

// Add missing error interface
export interface EventError extends Error {
  code: string;
  eventId?: string;
}

// Add missing constants and categories
export const EventCategories = {
  SYSTEM: 'system',
  COORDINATION: 'coordination', 
  COMMUNICATION: 'communication',
  MONITORING: 'monitoring',
  WORKFLOW: 'workflow',
  NEURAL: 'neural',
  DATABASE: 'database',
  MEMORY: 'memory',
} as const;

export const EventPriorityMap = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,  
  LOW: 3,
} as const;

export const EventConstants = {
  MAX_LISTENERS: 100,
  DEFAULT_TIMEOUT: 5000,
  RETRY_ATTEMPTS: 3,
} as const;

export const UELTypeGuards = TypeGuards;

export const EventUtils = {
  generateEventId: (): string => `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  
  generateCorrelationId: (): string => `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  
  createTimestamp: (): Date => new Date(),
  
  validateEventType: (type: string): boolean => typeof type === 'string' && type.length > 0 && /^[\w:-]+$/i.test(type),
  
  extractEventCategory: (type: string): string => {
    const parts = type.split(':');
    return parts.length > 1 ? parts[0] : 'general';
  },
} as const;