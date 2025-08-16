/**
 * @file Brain Package Main Index
 * 
 * Optimized brain package using shared infrastructure:
 * - @zen-ai/shared for logging, config, DI
 * - Proper error handling and type safety
 * - Clean separation of concerns
 */

// Main neural bridge (core functionality)
export { NeuralBridge } from './neural-bridge';
export type { NeuralConfig, NeuralNetwork, TrainingData, PredictionResult } from './neural-bridge';

// Backward compatibility alias
export { NeuralBridge as IntelligenceBridge } from './neural-bridge';

// Core types and interfaces
export * from './types';

// Neural models and presets
export * from './models';

// Advanced model presets (JavaScript configurations)
export * from './models/presets';

// Coordination and feedback systems
export { RetrainingMonitor } from './coordination/retraining-monitor';
export { DSPyLLMBridge } from './coordination/dspy-llm-bridge';
export type { 
  RetrainingConfig, 
  RetrainingTrigger, 
  RetrainingResult
} from './coordination/retraining-monitor';
export type {
  CoordinationTask,
  CoordinationResult,
  DSPyLLMConfig
} from './coordination/dspy-llm-bridge';

// Convenience functions
export { createNeuralNetwork, trainNeuralNetwork, predictWithNetwork } from './neural-bridge';