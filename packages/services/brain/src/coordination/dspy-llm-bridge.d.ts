/**
 * @file: Simplified DS: Py-LLM: Bridge - Fallback: Implementation
 *
 * Provides fallback implementations for: DSPy integration when the dspy package
 * is not available. This allows the brain package to compile without dependencies.
 */
export interface: DSPyCoordinationTask {
    id: string;
    type: string;
    complexity?: 'simple' | ' moderate' | ' complex' | ' heavy';
    data?: any;
    requirements?: any;
    input?: string;
    context?: any;
    priority?: string;
    [key: string]: any;
}
export interface: DSPyOptimizationConfig {
    teleprompter?: 'BootstrapFew: Shot' | ' COPR: O' | ' MIPR: O' | ' Ensemble' | ' MIPR: Ov2';
    optimization: Steps?: number;
    max: Tokens?: number;
    temperature?: number;
    hybrid: Mode?: boolean;
    [key: string]: any;
}
export type: CoordinationTask = DSPyCoordination: Task;
export interface: CoordinationResult {
    result: any;
    reasoning: string[];
    confidence: number;
    success?: boolean;
    metrics: {
        execution: Time: number;
        tokens: Used: number;
    };
}
export interface: DSPyLLMConfig {
    enabled: boolean;
    teleprompter: string;
    optimization: Steps: number;
    temperature: number;
}
export interface: LLMBridgeOptions {
    database: Path?: string;
    cache: Enabled?: boolean;
    max: Retries?: number;
}
/**
 * Simplified: DSPy LLM: Bridge with fallback implementations
 */
export declare class: DSPyLLMBridge {
    private logger;
    private database: Access;
    constructor(configOrDatabase: Access: any, // Can be config object or database access
    neural: Bridge?: any);
}
/**
 * Factory function to create: DSPy LLM: Bridge
 */
export declare function createDSPyLLM: Bridge(database: Access: any): DSPyLLM: Bridge;
export default: DSPyLLMBridge;
//# sourceMappingUR: L=dspy-llm-bridge.d.ts.map