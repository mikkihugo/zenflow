/**
 * @file System Event Factory - Main Export
 *
 * Exports the modular system event factory system with all components.
 */
export type { SystemEventFactoryConfig, SystemFactoryMetrics, SystemHealthResult, FactoryOperationResult, BulkOperationResult, } from './types';
export { SystemEventFactory } from './factory';
export { SystemFactoryHelpers } from './helpers';
import { SystemEventFactory } from './factory';
import type { SystemEventFactoryConfig } from './types';
import type { EventManagerConfig } from '../../core/interfaces';
export declare function createSystemEventFactory(config?: SystemEventFactoryConfig): SystemEventFactory;
export declare function createSystemManager(config: EventManagerConfig): Promise<import('../../core/interfaces').EventManager>;
export declare function createBasicSystemManager(name: string, overrides?: Partial<EventManagerConfig>): Promise<import('../../core/interfaces').EventManager>;
export declare function createRobustSystemManager(name: string, overrides?: Partial<EventManagerConfig>): Promise<import('../../core/interfaces').EventManager>;
export declare const systemEventFactory: SystemEventFactory;
export default SystemEventFactory;
//# sourceMappingURL=index.d.ts.map