/**
 * @fileoverview Event Manager Factory Exports
 *
 * Re-exports all event manager factories from the adapters directory
 * for convenient access and consistent API.
 */

// Export available factories from adapters - only those that exist
export { CoordinationEventFactory } from '../adapters/coordination-factory/index';
import { CoordinationEventFactory } from '../adapters/coordination-factory/index';

// Re-export factory types from core interfaces
export type {
  EventManager,
  EventManagerFactory,
  EventManagerConfig,
} from '../core/interfaces';

// Default exports for convenience
export default {
  CoordinationEventFactory,
};