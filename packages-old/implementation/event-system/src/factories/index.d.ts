/**
 * @fileoverview Event Manager Factory Exports
 *
 * Re-exports all event manager factories from the adapters directory
 * for convenient access and consistent API.
 */
export { CoordinationEventFactory } from '../adapters/coordination-factory/index';
import { CoordinationEventFactory } from '../adapters/coordination-factory/index';
export type { EventManager, EventManagerFactory, EventManagerConfig, } from '../core/interfaces';
declare const _default: {
    CoordinationEventFactory: typeof CoordinationEventFactory;
};
export default _default;
//# sourceMappingURL=index.d.ts.map