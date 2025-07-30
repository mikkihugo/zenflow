/**
 * Event System Types
 * Comprehensive event-driven architecture for system-wide coordination
 */

import type { Identifiable } from './core';

// =============================================================================
// EVENT CORE TYPES
// =============================================================================

export type EventCategory =
  | 'system'
  | 'queen'
  | 'swarm'
  | 'hive'
  | 'neural'
  | 'coordination'
  | 'memory'
  | 'plugin'
  | 'api'
  | 'database'
  | 'security'
  | 'performance'
  | 'user'
  | 'custom';

export type EventSeverity = 'debug' | 'info' | 'warning' | 'error' | 'critical' | 'emergency';

export type EventStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'timeout';

export type DeliveryGuarantee = 'at-most-once' | 'at-least-once' | 'exactly-once';

export type EventPattern = 'unicast' | 'broadcast' | 'multicast' | 'anycast';

// =============================================================================
// EVENT DEFINITION
// =============================================================================

export interface SystemEvent extends Identifiable {
  // Event identificationtype = ============================================================================
// EVENT BUS
// =============================================================================

export interface EventBus extends TypedEventEmitter<_EventBusEvents> {
  // Event publication
  publish(event = ============================================================================
// EVENT SUBSCRIPTION
// =============================================================================

export interface EventSubscription extends Identifiable {name = > Promise<void>
reject = > Promise<void>
defer = > Promise<void>
}

export interface EventHandlerResult {success = ============================================================================
// EVENT STREAMS
// =============================================================================

export interface EventStream extends Identifiable {name = ============================================================================
// EVENT TOPICS
// =============================================================================

export interface EventTopic extends Identifiable {name = ============================================================================
// EVENT QUERIES
// =============================================================================

export interface EventQuery {
  // Time range
  startTime?: Date;
  endTime?: Date;
  
  // Filtersfilters = ============================================================================
// EVENT MONITORING
// =============================================================================

export interface EventBusMetrics {
  // Throughput metricseventsPublished = ============================================================================
// EVENT LOGGING
// =============================================================================

export interface EventLogger {
  debug(message = > void;
  recordTime(name = ============================================================================
// EVENT BUS EVENTS
// =============================================================================

export interface EventBusEvents {
  // Publication events
  'event-published': (event = > void;
  'event-delivery-failed': (event = > void;
  'event-expired': (event = > void;
  
  // Subscription events
  'subscription-created': (subscription = > void;
  'subscription-deleted': (subscriptionId = > void;
  'subscription-failed': (subscriptionId = > void;
  'subscription-recovered': (subscriptionId = > void;
  
  // Processing events
  'event-processed': (event = > void;
  'event-processing-failed': (event = > void;
  'dead-letter-received': (event = > void;
  
  // Stream events
  'stream-created': (stream = > void;
  'stream-started': (streamId = > void;
  'stream-stopped': (streamId = > void;
  'stream-failed': (streamId = > void;
  'checkpoint-created': (streamId = > void;
  
  // Topic events
  'topic-created': (topic = > void;
  'topic-deleted': (topicId = > void;
  'partition-leader-changed': (topicId = > void;
  'partition-offline': (topicId = > void;
  
  // System events
  'bus-started': () => void;
  'bus-stopped': () => void;
  'bus-paused': () => void;
  'bus-resumed': () => void;
  'performance-degraded': (metric = > void;
  'capacity-warning': (component = > void;
  'health-check-failed': (component = > void;
}
