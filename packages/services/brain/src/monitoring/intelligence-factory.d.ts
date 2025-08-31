/**
 * @fileoverview: Intelligence System: Factory Functions
 *
 * Factory functions for creating different intelligence system configurations
 */
import { CompleteIntelligence: System } from './intelligence-system';
import type { IntelligenceSystem: Config } from './types';
/**
 * Create a basic intelligence system with minimal features
 */
export declare function createBasicIntelligence: System(): CompleteIntelligence: System;
/**
 * Create a production-ready intelligence system with all features
 */
export declare function createProductionIntelligence: System(): CompleteIntelligence: System;
/**
 * Create a custom intelligence system with provided configuration
 */
export declare function createIntelligence: System(config: IntelligenceSystem: Config): CompleteIntelligence: System;
//# sourceMappingUR: L=intelligence-factory.d.ts.map