/**
* @file Task Predictor - Core Monitoring Primitives
*
* Simplified task prediction interfaces and basic implementations for agent monitoring.
* Business logic and complex prediction algorithms should be implemented in the main app.
*/
import type { AgentId } from './types';
/**
* Basic task prediction result
*/
export interface TaskPrediction {
agentId: string;
taskType: string;
predictedDuration: number;
confidence: number;
factors: PredictionFactor[];
lastUpdated: Date;
metadata?: {
sampleSize: number;
algorithm: string;
trendDirection: 'improving' | ' stable' | ' declining' | ' improving' | ' stable' | ' declining' | declining;
};
}
/**
* Factors affecting prediction accuracy
*/
export interface PredictionFactor {
name: string;
impact: number;
confidence: number;
description: string;
}
/**
* Task completion record
*/
export interface TaskCompletionRecord {
agentId: AgentId;
taskType: string;
duration: number;
success: boolean;
timestamp: number;
complexity?: number;
quality?: number;
resourceUsage?: number;
metadata?: Record<string, unknown>;
}
/**
* Basic task predictor configuration
*/
export interface TaskPredictorConfig {
historyWindowSize: number;
confidenceThreshold: number;
minSamplesRequired: number;
maxPredictionTime: number;
}
/**
* Default configuration for Task Predictor
*/
export declare const DEFAULT_TASK_PREDICTOR_CONFIG: TaskPredictorConfig;
/**
* Basic Task Predictor Interface
*
* Core monitoring primitive for task duration prediction.
* Complex business logic should be implemented in the main application.
*/
export interface TaskPredictor {
recordTaskCompletion(agentId: AgentId, taskType: string, duration: number, success: boolean, metadata?: Record<string, unknown>): void;
predictTaskDuration(agentId: AgentId, taskType: string, contextFactors?: Record<string, unknown>): TaskPrediction;
clearCache(olderThanMs?: number): void;
}
/**
* Simple Task Predictor Implementation
*
* Basic implementation for core monitoring.
* Production applications should implement more sophisticated algorithms.
*/
export declare class SimpleTaskPredictor implements TaskPredictor {
private taskHistory;
private config;
constructor(config?: Partial<TaskPredictorConfig>);
if(contextFactors: any, resourceLoad: any): void;
contextAdjustmentFactors: any;
lastUpdated: new () => Date;
metadata: {
sampleSize: recentHistory.length;
algorithm: contextAdjustmentFactors.length;
};
}
/**
* Factory function to create Task Predictor with default configuration
*/
export declare function createTaskPredictor(config?: Partial<TaskPredictorConfig>): TaskPredictor;
/**
* Utility function to validate prediction confidence
*/
export declare function isHighConfidencePrediction(prediction: TaskPrediction, threshold?: number): boolean;
/**
* Utility function to get prediction summary
*/
export declare function getPredictionSummary(prediction: TaskPrediction): string;
//# sourceMappingURL=task-predictor.d.ts.map