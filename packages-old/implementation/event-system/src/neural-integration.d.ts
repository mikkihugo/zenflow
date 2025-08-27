/**
 * @file Neural Integration
 *
 * Simple neural integration stubs for the event system.
 */
export interface NeuralIntegrationConfig {
    enabled?: boolean;
    modelPath?: string;
}
/**
 * Neural integration manager.
 */
export declare class NeuralIntegrationManager {
    private config;
    constructor(config?: NeuralIntegrationConfig);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    isEnabled(): boolean;
}
export default NeuralIntegrationManager;
export interface NeuralEventConfig {
    enabled?: boolean;
    modelPath?: string;
    optimizationLevel?: 'basic' | 'full' | 'constrained';
}
export interface EventClassification {
    category: string;
    confidence: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
}
export interface NeuralEventProcessor {
    processEvent(event: unknown): Promise<unknown>;
    classifyEvent(event: unknown): Promise<EventClassification>;
    optimizeProcessing(config: NeuralEventConfig): Promise<void>;
}
export declare function createNeuralEventProcessor(config?: NeuralEventConfig): NeuralEventProcessor;
export declare function createHighPerformanceNeuralProcessor(config?: NeuralEventConfig): NeuralEventProcessor;
export declare function createFullNeuralProcessor(config?: NeuralEventConfig): NeuralEventProcessor;
//# sourceMappingURL=neural-integration.d.ts.map