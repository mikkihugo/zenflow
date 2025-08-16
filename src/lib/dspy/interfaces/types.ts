/**
 * @fileoverview Core DSPy TypeScript Interfaces
 * 
 * Foundation types for the complete Stanford DSPy ecosystem port.
 * Architecture-first design ensuring clean separation of concerns.
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 */

/**
 * Trace step for execution tracking (stub for future implementation)
 */
export interface TraceStep {
  // To be defined later. For now, it's just a shape.
  // Could include component name, inputs, outputs, etc.
  [key: string]: any;
}

/**
 * Prediction result from DSPy module execution
 */
export type Prediction = Record<string, any>;

/**
 * Metric function signature for evaluating predictions
 */
export type MetricFunction = (
  example: Example,
  prediction: Prediction,
  trace?: TraceStep[]
) => number | boolean;

/**
 * Detailed metric evaluation result
 */
export interface MetricResult {
  score: number;
  passed: boolean;
  details?: Record<string, any>;
}

/**
 * Core Example interface - foundational data structure for DSPy
 * Based on dspy/primitives/example.py
 */
export interface Example {
  // Core data storage (like Python's _store dict)
  readonly data: Record<string, any>;
  
  // Input keys designation
  readonly inputKeys: Set<string> | null;
  
  // Core methods
  withInputs(...keys: string[]): Example;
  inputs(): Example;
  labels(): Example;
  copy(overrides?: Record<string, any>): Example;
  without(...keys: string[]): Example;
  toDict(): Record<string, any>;
  
  // Utility methods
  get(key: string, defaultValue?: any): any;
  keys(includeDspy?: boolean): string[];
  values(includeDspy?: boolean): any[];
  items(includeDspy?: boolean): [string, any][];
}

/**
 * DSPy Module interface - base for all DSPy components
 */
export interface Module {
  // Core execution method
  __call__(...args: any[]): Prediction;
  
  // Module management
  deepcopy(): Module;
  predictors(): Module[];
  namedPredictors(): [string, Module][];
}

/**
 * Base Teleprompter interface for optimization algorithms
 */
export interface Teleprompter {
  compile(options: {
    student: Module;
    trainset: Example[];
    teacher?: Module;
    valset?: Example[];
    metric?: MetricFunction;
  }): Promise<Module>;
}

/**
 * Signature interface for DSPy components
 */
export interface Signature {
  name: string;
  instructions?: string;
  inputFields: Record<string, any>;
  outputFields: Record<string, any>;
}