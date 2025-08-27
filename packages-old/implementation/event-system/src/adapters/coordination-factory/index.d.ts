/**
 * @file Coordination Event Factory - Main Export
 *
 * Exports the modular coordination event factory system with all components.
 */
export type { CoordinationEventFactoryConfig, CoordinationFactoryMetrics, CoordinationHealthResult, FactoryOperationResult, BulkOperationResult, } from './types';
export { CoordinationEventFactory } from './factory';
export { CoordinationFactoryHelpers } from './helpers';
import { CoordinationEventFactory } from './factory';
import type { CoordinationEventFactoryConfig } from './types';
import type { CoordinationEventAdapterConfig } from '../coordination';
export declare function createCoordinationEventFactory(config?: CoordinationEventFactoryConfig): CoordinationEventFactory;
export declare function createCoordinationAdapter(config: CoordinationEventAdapterConfig): Promise<import('../../core/interfaces').EventManager>;
export declare function createSwarmCoordinationAdapter(name: string, overrides?: Partial<CoordinationEventAdapterConfig>): Promise<import('../../core/interfaces').EventManager>;
export declare function createAgentManagementAdapter(name: string, overrides?: Partial<CoordinationEventAdapterConfig>): Promise<import('../../core/interfaces').EventManager>;
export declare function createTaskOrchestrationAdapter(name: string, overrides?: Partial<CoordinationEventAdapterConfig>): Promise<import('../../core/interfaces').EventManager>;
export declare function createProtocolManagementAdapter(name: string, overrides?: Partial<CoordinationEventAdapterConfig>): Promise<import('../../core/interfaces').EventManager>;
export declare function createComprehensiveCoordinationAdapter(name: string, overrides?: Partial<CoordinationEventAdapterConfig>): Promise<import('../../core/interfaces').EventManager>;
export declare const coordinationEventFactory: CoordinationEventFactory;
export default CoordinationEventFactory;
//# sourceMappingURL=index.d.ts.map