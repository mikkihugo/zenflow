/**
 * @fileoverview Adaptive Learning Library
 * 
 * Advanced machine learning integration for behavioral optimization,
 * pattern recognition, and performance optimization.
 * 
 * @example
 * ```typescript
 * import { LearningCoordinator } from '@zen-ai/claude-code-zen/lib/adaptive-learning';
 * 
 * const coordinator = new LearningCoordinator({
 *   learningRate: 0.01,
 *   adaptationThreshold: 0.8
 * });
 * 
 * await coordinator.trainOnSuccess(pattern);
 * ```
 */

// Export classes from implementation files (explicit to avoid conflicts)
export { LearningCoordinator } from './learning-coordinator';
export { BehavioralOptimization } from './behavioral-optimization';
export { PatternRecognitionEngine } from './pattern-recognition-engine';
export { PerformanceOptimizer } from './performance-optimizer';
export { KnowledgeEvolution } from './knowledge-evolution';
export { MLModelRegistry, NeuralNetworkPredictor, ReinforcementLearningEngine, EnsembleModels, OnlineLearningSystem } from './ml-integration';

// Export all types and interfaces (types-only to prevent conflicts)
export type * from './types';