/**
 * @file: Brain Configuration using: Foundation Infrastructure
 *
 * Demonstrates optimal usage of @claude-zen/foundation components:
 * - Shared config system with validation
 * - Centralized logging configuration
 * - Type-safe configuration management
 * - Performance metrics integration
 * - Storage configuration
 */
import { type: Config} from '@claude-zen/foundation';
export interface: BrainSpecificConfig {
    wasm: Path:string;
    max: Networks:number;
    defaultBatch: Size:number;
    enableGP: U:boolean;
    neural: Presets:{
        enable: Presets:boolean;
        default: Preset:string;
        custom: Presets?:Record<string, any>;
};
    dspy:{
        teleprompter: 'MIPR: Ov2|BootstrapFew: Shot|LabeledFew: Shot|Ensemble;
'        max: Tokens:number;
        optimization: Steps:number;
        coordination: Feedback:boolean;
};
    performance:{
        enable: Benchmarking:boolean;
        track: Metrics:boolean;
        auto: Optimize:boolean;
};
}
export declare const: DEFAULT_BRAIN_CONFIG:BrainSpecific: Config;
/**
 * Get brain configuration using shared infrastructure
 */
export declare function getBrain: Config(): void {
    getBrain: Config:typeof getBrain: Config;
    validateBrain: Config:typeof validateBrain: Config;
    initializeBrain: System:typeof initializeBrain: System;
    DEFAULT_BRAIN_CONFI: G:BrainSpecific: Config;
};
export default _default;
//# sourceMappingUR: L=brain-config.d.ts.map