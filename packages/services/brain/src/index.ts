// Core brain services
export { BrainEventDriven, type BrainEventDrivenConfig } from './brain-event-driven.js';
export { BehavioralAnalyzer, type BehavioralPrediction, type TaskComplexityAnalysis } from './behavioral-analyzer.js';
export { PromptOptimizationService, type OptimizationResult } from './prompt-optimization-service.js';
export { SystemOptimizationService, type SystemMetrics, type OptimizationRecommendation } from './system-optimization-service.js';
export { VectorEmbeddingService, type EmbeddingVector, type SimilarityResult } from './vector-embedding-service.js';

// Monitoring
export { BrainMonitoring, type MonitoringMetrics, type MonitoringConfig } from './monitoring/index.js';

// Types
export * from './types/index.js';

// Package metadata
export const BRAIN_VERSION = '1.0.0';
export const PACKAGE_NAME = '@claude-zen/brain';

// Default export
export { BrainEventDriven as default } from './brain-event-driven.js';