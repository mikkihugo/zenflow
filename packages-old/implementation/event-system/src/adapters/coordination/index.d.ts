/**
 * @file Coordination Event System - Main Export
 *
 * Exports the modular coordination event adapter system with all components.
 */
export type { CoordinationEventAdapterConfig, CoordinationEventMetrics, CoordinationCorrelation, CoordinationHealthEntry, WrappedCoordinationComponent, } from './types';
export { CoordinationEventAdapter } from './adapter';
export { CoordinationEventHelpers, CoordinationEventUtils } from './helpers';
export { CoordinationEventExtractor } from './extractor';
import { CoordinationEventAdapter } from './adapter';
import type { CoordinationEventAdapterConfig } from './types';
export declare function createCoordinationEventAdapter(config: CoordinationEventAdapterConfig): CoordinationEventAdapter;
export declare function createDefaultCoordinationEventAdapterConfig(name: string, overrides?: Partial<CoordinationEventAdapterConfig>): CoordinationEventAdapterConfig;
export default CoordinationEventAdapter;
//# sourceMappingURL=index.d.ts.map