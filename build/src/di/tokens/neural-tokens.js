/**
 * Neural network tokens for dependency injection.
 * Defines tokens for neural network and AI services.
 */
/**
 * @file Neural-tokens implementation.
 */
import { createToken } from './token-factory.ts';
// Neural network tokens
export const NEURAL_TOKENS = {
    NetworkTrainer: createToken('NetworkTrainer'),
    DataLoader: createToken('DataLoader'),
    OptimizationEngine: createToken('OptimizationEngine'),
    ModelStorage: createToken('ModelStorage'),
    MetricsCollector: createToken('MetricsCollector'),
};
