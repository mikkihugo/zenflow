/**
 * @file Coordination Interface Types
 * Core interface definitions for coordination layer components
 */
/**
 * Priority levels for tasks and operations
 */
export type Priority = 'low' | 'medium' | 'high' | 'critical';
/**
 * Risk level assessment
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
/**
 * Server instance interface - wraps Express.Server with additional metadata
 */
export interface ServerInstance {
    id: string;
    status: 'starting' | 'running' | 'stopping' | 'stopped' | 'error';
    port?: number;
    host?: string;
    uptime?: number;
    close?: (callback?: (err?: Error) => void) => void;
    on?: (event: string, listener: (...args: unknown[]) => void) => void;
}
/**
 * Base error interface
 */
export interface BaseError {
    code: string;
    message: string;
    details?: unknown;
    timestamp: Date;
}
/**
 * Test result interface - flexible for comprehensive testing
 */
export interface TestResult {
    id?: string;
    name?: string;
    status?: 'passed' | 'failed' | 'skipped' | 'pending';
    success: boolean;
    duration?: number;
    error?: BaseError | string;
    details?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}
/**
 * Command result interface - flexible for CLI execution results
 */
export interface CommandResult {
    success: boolean;
    message?: string;
    data?: unknown;
    error?: BaseError;
    timestamp: Date;
    stdout?: string;
    stderr?: string;
}
/**
 * Base API response interface
 */
export interface BaseApiResponse {
    success: boolean;
    message?: string;
    data?: unknown;
    error?: BaseError;
    timestamp: Date;
    requestId?: string;
}
/**
 * Basic neural configuration for coordination components
 */
export interface NeuralConfig {
    modelType: 'feedforward' | 'recurrent' | 'transformer';
    layers: number[];
    activations: string[];
    learningRate: number;
    batchSize?: number;
    epochs?: number;
}
/**
 * Neural network interface for coordination layer
 */
export interface NeuralNetworkInterface {
    id: string;
    config: NeuralConfig;
    isInitialized: boolean;
    /**
     * Initialize the neural network
     */
    initialize(config: NeuralConfig): Promise<void>;
    /**
     * Train the network with data
     */
    train(inputs: number[][], outputs: number[][]): Promise<{
        finalError: number;
        epochsCompleted: number;
        duration: number;
        converged: boolean;
    }>;
    /**
     * Predict output for given input
     */
    predict(inputs: number[]): Promise<number[]>;
    /**
     * Get network status
     */
    getStatus(): {
        isReady: boolean;
        accuracy?: number;
        lastTrained?: Date;
    };
    /**
     * Destroy the network and cleanup resources
     */
    destroy(): Promise<void>;
    /**
     * Export network configuration and weights
     */
    export?(): Promise<{
        weights: number[][];
        biases: number[][];
        config: NeuralConfig;
    }>;
    /**
     * Import network configuration and weights
     */
    import?(data: {
        weights: number[][];
        biases: number[][];
        config: NeuralConfig;
    }): Promise<void>;
    /**
     * Get performance metrics (optional method)
     */
    getMetrics?(): Promise<{
        accuracy?: number;
        precision?: number;
        recall?: number;
        f1Score?: number;
        lastTrainingTime?: number;
        inferenceTime?: number;
    }>;
}
/**
 * WASM neural binding interface for coordination
 */
export interface WasmNeuralBinding {
    /**
     * Load WASM module
     */
    loadWasm(): Promise<WebAssembly.Module | Record<string, unknown>>;
    /**
     * Check if WASM is available
     */
    isWasmAvailable(): boolean;
    /**
     * Get WASM capabilities
     */
    getWasmCapabilities(): string[];
    /**
     * Create neural network instance
     */
    createNeuralNetwork(config: NeuralConfig): Promise<NeuralNetworkInterface>;
}
//# sourceMappingURL=interfaces.d.ts.map