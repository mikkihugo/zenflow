/**
 * @file Monitoring Event Factory - Main Export
 *
 * Exports the modular monitoring event factory system with all components.
 */
export type { MonitoringEventFactoryConfig, MonitoringFactoryMetrics, MonitoringHealthResult, FactoryOperationResult, BulkOperationResult, } from './types';
export { MonitoringEventFactory } from './factory';
export { MonitoringFactoryHelpers } from './helpers';
import { MonitoringEventFactory } from './factory';
import type { MonitoringEventFactoryConfig } from './types';
import type { EventManagerConfig } from '../../core/interfaces';
export declare function createMonitoringEventFactory(config?: MonitoringEventFactoryConfig): MonitoringEventFactory;
export declare function createMonitoringManager(config: EventManagerConfig): Promise<import('../../core/interfaces').EventManager>;
export declare function createBasicMonitoringManager(name: string, overrides?: Partial<EventManagerConfig>): Promise<import('../../core/interfaces').EventManager>;
export declare function createAdvancedMonitoringManager(name: string, overrides?: Partial<EventManagerConfig>): Promise<import('../../core/interfaces').EventManager>;
export declare const monitoringEventFactory: MonitoringEventFactory;
export default MonitoringEventFactory;
//# sourceMappingURL=index.d.ts.map