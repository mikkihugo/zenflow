/**
 * @fileoverview Event Manager Factory Exports
 *
 * Re-exports all event manager factories from the adapters directory
 * for convenient access and consistent API.
 */

// Export all factories from adapters
export { SystemEventManagerFactory } from '../adapters/system-event-factory';
export { CoordinationEventManagerFactory } from '../adapters/coordination-event-factory';
export { CommunicationEventFactory } from '../adapters/communication-event-factory';
export { MonitoringEventFactory } from '../adapters/monitoring-event-factory';
export { MemoryEventManagerFactory } from '../adapters/memory-event-factory';
export { DatabaseEventManagerFactory } from '../adapters/database-event-factory';
export { NeuralEventManagerFactory } from '../adapters/neural-event-factory';
export { InterfaceEventManagerFactory } from '../adapters/interface-event-factory';
export { WorkflowEventManagerFactory } from '../adapters/workflow-event-factory';

// Re-export factory types from core interfaces
export type {
  EventManagerFactory,
  EventManagerConfig,
} from '../core/interfaces';
