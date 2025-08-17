/**
 * @fileoverview Base Teleprompter Class - 100% Stanford DSPy API Compatible
 * 
 * Abstract base class for all DSPy teleprompters.
 * Provides the foundation for program optimization and improvement.
 * 
 * @version 1.0.0
 * @author Claude Code Zen Team
 */

import { DSPyModule, Example, Prediction } from '../lib/index.js';

/**
 * Compilation options for teleprompters
 */
export interface CompileOptions {
  /** Training dataset */
  trainset: Example[];
  /** Validation dataset (optional) */
  valset?: Example[];
  /** Teacher program (optional) */
  teacher?: DSPyModule | DSPyModule[];
  /** Additional compilation parameters */
  [key: string]: any;
}

/**
 * Teleprompter metrics interface
 */
export interface TeleprompterMetrics {
  /** Final score achieved */
  score: number;
  /** Number of optimization steps */
  steps: number;
  /** Training time in milliseconds */
  training_time: number;
  /** Additional metrics */
  [key: string]: any;
}

/**
 * Optimization result interface
 */
export interface OptimizationResult {
  /** Optimized program */
  program: DSPyModule;
  /** Optimization metrics */
  metrics: TeleprompterMetrics;
  /** Whether optimization was successful */
  success: boolean;
}

/**
 * Abstract base class for all DSPy teleprompters
 * 
 * This class provides the interface that all teleprompters must implement.
 * It follows the exact API design of Stanford DSPy's Teleprompter class.
 * 
 * @abstract
 */
export abstract class Teleprompter {
  /**
   * Compile and optimize a DSPy program
   * 
   * @param student The student program to optimize
   * @param options Compilation options including trainset, valset, etc.
   * @returns Promise resolving to the optimized program
   */
  abstract compile(student: DSPyModule, options: CompileOptions): Promise<DSPyModule>;

  /**
   * Get teleprompter configuration
   * Optional method for teleprompters to expose their configuration
   */
  getConfig?(): Record<string, any>;

  /**
   * Reset teleprompter state
   * Optional method for stateful teleprompters
   */
  reset?(): void;
}

/**
 * Default export for compatibility
 */
export default Teleprompter;