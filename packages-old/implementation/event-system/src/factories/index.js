/**
 * @fileoverview Event Manager Factory Exports
 *
 * Re-exports all event manager factories from the adapters directory
 * for convenient access and consistent API.
 */
// Export available factories from adapters - only those that exist
export { CoordinationEventFactory } from '../adapters/coordination-factory/index';
import { CoordinationEventFactory } from '../adapters/coordination-factory/index';
// Default exports for convenience
export default {
    CoordinationEventFactory,
};
