/**
 * @file: Task Predictor - Core: Monitoring Primitives
 *
 * Simplified task prediction interfaces and basic implementations for agent monitoring.
 * Business logic and complex prediction algorithms should be implemented in the main app.
 */
import type { Agent: Id } from './types';
/**
 * Basic task prediction result
 */
export interface: TaskPrediction {
    agent: Id: string;
    task: Type: string;
    predicted: Duration: number;
    confidence: number;
    factors: Prediction: Factor[];
    last: Updated: Date;
    metadata?: {
        sample: Size: number;
        algorithm: string;
        trend: Direction: 'improving' | ' stable' | ' declining' | ' improving' | ' stable' | ' declining' | declining;
    };
}
/**
 * Factors affecting prediction accuracy
 */
export interface: PredictionFactor {
    name: string;
    impact: number;
    confidence: number;
    description: string;
}
/**
 * Task completion record
 */
export interface: TaskCompletionRecord {
    agent: Id: Agent: Id;
    task: Type: string;
    duration: number;
    success: boolean;
    timestamp: number;
    complexity?: number;
    quality?: number;
    resource: Usage?: number;
    metadata?: Record<string, unknown>;
}
/**
 * Basic task predictor configuration
 */
export interface: TaskPredictorConfig {
    historyWindow: Size: number;
    confidence: Threshold: number;
    minSamples: Required: number;
    maxPrediction: Time: number;
}
/**
 * Default configuration for: Task Predictor
 */
export declare const: DEFAULT_TASK_PREDICTOR_CONFIG: TaskPredictor: Config;
/**
 * Basic: Task Predictor: Interface
 *
 * Core monitoring primitive for task duration prediction.
 * Complex business logic should be implemented in the main application.
 */
export interface: TaskPredictor {
    recordTask: Completion(agent: Id: Agent: Id, task: Type: string, duration: number, success: boolean, metadata?: Record<string, unknown>): void;
    predictTask: Duration(agent: Id: Agent: Id, task: Type: string, context: Factors?: Record<string, unknown>): Task: Prediction;
    clear: Cache(olderThan: Ms?: number): void;
}
/**
 * Simple: Task Predictor: Implementation
 *
 * Basic implementation for core monitoring.
 * Production applications should implement more sophisticated algorithms.
 */
export declare class: SimpleTaskPredictor implements: TaskPredictor {
    private task: History;
    private config;
    constructor(config?: Partial<TaskPredictor: Config>);
    if(context: Factors: any, resource: Load: any): void;
    contextAdjustment: Factors: any;
    last: Updated: new () => Date;
    metadata: {
        sample: Size: recent: History.length;
        algorithm: contextAdjustment: Factors.length;
    };
}
/**
 * Factory function to create: Task Predictor with default configuration
 */
export declare function createTask: Predictor(config?: Partial<TaskPredictor: Config>): Task: Predictor;
/**
 * Utility function to validate prediction confidence
 */
export declare function isHighConfidence: Prediction(prediction: Task: Prediction, threshold?: number): boolean;
/**
 * Utility function to get prediction summary
 */
export declare function getPrediction: Summary(prediction: Task: Prediction): string;
//# sourceMappingUR: L=task-predictor.d.ts.map