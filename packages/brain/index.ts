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

// Convenience functions
export { createNeuralNetwork, trainNeuralNetwork, predictWithNetwork } from './neural-bridge';