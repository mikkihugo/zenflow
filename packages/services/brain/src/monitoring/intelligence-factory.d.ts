/**
 * @fileoverview Intelligence System Factory Functions
 *
 * Factory functions for creating different intelligence system configurations
 */
import { CompleteIntelligenceSystem} from './intelligence-system';
import type { IntelligenceSystemConfig} from './types';
/**
 * Create a basic intelligence system with minimal features
 */
export declare function createBasicIntelligenceSystem():CompleteIntelligenceSystem;
/**
 * Create a production-ready intelligence system with all features
 */
export declare function createProductionIntelligenceSystem():CompleteIntelligenceSystem;
/**
 * Create a custom intelligence system with provided configuration
 */
export declare function createIntelligenceSystem(config:IntelligenceSystemConfig): CompleteIntelligenceSystem;
//# sourceMappingURL=intelligence-factory.d.ts.map