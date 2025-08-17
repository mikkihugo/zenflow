/**
 * @file Brain Package Main Index
 * 
 * Simple AI coordination and prompt optimization:
 * - Easy-to-use BrainCoordinator (main interface)
 * - Neural networks, DSPy integration, learning
 * - Proper error handling and type safety
 */

// 🧠 MAIN INTERFACE - Use this for everything!
export { BrainCoordinator as default } from './brain-coordinator';
export { BrainCoordinator } from './brain-coordinator';
export type { 
  BrainConfig, 
  PromptOptimizationRequest, 
  PromptOptimizationResult 
} from './brain-coordinator';

// Advanced interfaces (for power users)
export { NeuralBridge } from './neural-bridge';
export { DSPyLLMBridge } from './coordination/dspy-llm-bridge';
export { RetrainingMonitor } from './coordination/retraining-monitor';

// Types for advanced usage
export type { NeuralConfig, NeuralNetwork, TrainingData, PredictionResult } from './neural-bridge';
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

// Legacy exports (backward compatibility)
export { NeuralBridge as IntelligenceBridge } from './neural-bridge';
export * from './types';
export * from './models';
export * from './models/presets';
export { createNeuralNetwork, trainNeuralNetwork, predictWithNetwork } from './neural-bridge';