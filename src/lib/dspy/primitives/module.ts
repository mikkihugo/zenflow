/**
 * @fileoverview DSPy Module Base Class
 * 
 * Core module interface for DSPy system, providing the foundational architecture
 * for all trainable and executable components. Based on Stanford DSPy's Module class.
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0-alpha.44
 * 
 * @see {@link https://github.com/stanfordnlp/dspy} Stanford DSPy Reference
 */

import type { Example, Prediction, TraceStep, MetricFunction } from '../interfaces/types.js';

/**
 * Usage statistics for language model calls
 */
export interface UsageStats {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost?: number;
}

/**
 * Module parameter interface for optimization
 */
export interface Parameter {
  name: string;
  value: any;
  trainable: boolean;
  metadata?: Record<string, any>;
}

/**
 * Save options for module serialization
 */
export interface SaveOptions {
  compress?: boolean;
  format?: 'json' | 'binary';
  include_history?: boolean;
}

/**
 * Batch processing options
 */
export interface BatchOptions {
  batch_size?: number;
  parallel?: boolean;
  progress?: boolean;
}

/**
 * Module state for serialization/optimization
 */
export interface ModuleState {
  parameters: Parameter[];
  compiled: boolean;
  history: any[];
  metadata?: Record<string, any>;
}

/**
 * Optimization result from SIMBA or other teleprompters
 */
export interface OptimizationResult {
  score: number;
  traces: TraceStep[];
  updated_parameters: Parameter[];
  metadata?: Record<string, any>;
}

/**
 * Base DSPy Module interface
 * 
 * Defines the contract for all DSPy modules including predictors,
 * chains, and custom components. Provides lifecycle management,
 * parameter tracking, and optimization support.
 */
export interface DSPyModule {
  /** Core execution method - must be implemented by subclasses */
  forward(...args: any[]): any;
  
  /** Main execution wrapper with callbacks and tracking */
  __call__(...args: any[]): any;
  
  /** Async version of execution */
  acall(...args: any[]): Promise<any>;
  
  /** Save module state to file */
  save(path: string, options?: SaveOptions): void;
  
  /** Load module state from file */
  load(path: string): void;
  
  /** Create deep copy of module */
  deepcopy(): DSPyModule;
  
  /** Create reset copy (parameters only) */
  reset_copy(): DSPyModule;
  
  /** Get all named parameters */
  named_parameters(): Record<string, Parameter>;
  
  /** Get all parameters as array */
  parameters(): Parameter[];
  
  /** Get all predictor parameters */
  predictors(): Parameter[];
  
  /** Process batch of examples */
  batch(examples: Example[], options?: BatchOptions): Prediction[];
  
  /** Set language model */
  set_lm(lm: any): void;
  
  /** Get current language model */
  get_lm(): any;
  
  /** Execution history */
  history: any[];
  
  /** Callback functions */
  callbacks?: any[];
  
  /** Compilation status */
  _compiled: boolean;
}

/**
 * Base DSPy Module implementation
 * 
 * Provides default implementations for common module functionality.
 * Subclasses must implement the `forward` method.
 * 
 * @example
 * ```typescript
 * class MyPredictor extends BaseModule {
 *   forward(input: string): Prediction {
 *     // Implementation here
 *     return { answer: "response" };
 *   }
 * }
 * 
 * const predictor = new MyPredictor();
 * const result = predictor.__call__("What is 2+2?");
 * ```
 */
export abstract class BaseModule implements DSPyModule {
  protected _compiled: boolean = false;
  public history: any[] = [];
  public callbacks?: any[];
  protected _lm: any = null;
  protected _parameters: Map<string, Parameter> = new Map();

  /**
   * Initialize module with optional callbacks
   * 
   * @param callbacks - Optional callback functions for execution monitoring
   */
  constructor(callbacks?: any[]) {
    this.callbacks = callbacks;
  }

  /**
   * Core execution method - must be implemented by subclasses
   * 
   * @param args - Input arguments
   * @returns - Module output
   */
  abstract forward(...args: any[]): any;

  /**
   * Main execution wrapper with history tracking and callbacks
   * 
   * @param args - Input arguments
   * @returns - Module output
   */
  __call__(...args: any[]): any {
    const startTime = Date.now();
    
    // Pre-execution callbacks
    if (this.callbacks) {
      for (const callback of this.callbacks) {
        if (callback.pre) callback.pre(this, args);
      }
    }

    try {
      // Execute the forward method
      const result = this.forward(...args);
      
      // Track in history
      const execution = {
        inputs: args,
        outputs: result,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime
      };
      this.history.push(execution);

      // Post-execution callbacks
      if (this.callbacks) {
        for (const callback of this.callbacks) {
          if (callback.post) callback.post(this, args, result);
        }
      }

      return result;
    } catch (error) {
      // Error callbacks
      if (this.callbacks) {
        for (const callback of this.callbacks) {
          if (callback.error) callback.error(this, args, error);
        }
      }
      throw error;
    }
  }

  /**
   * Async version of execution
   * 
   * @param args - Input arguments
   * @returns - Promise resolving to module output
   */
  async acall(...args: any[]): Promise<any> {
    // For now, just wrap sync call - can be overridden for true async modules
    return this.__call__(...args);
  }

  /**
   * Save module state to file
   * 
   * @param path - File path to save to
   * @param options - Save options
   */
  save(path: string, options?: SaveOptions): void {
    const state: ModuleState = {
      parameters: this.parameters(),
      compiled: this._compiled,
      history: options?.include_history ? this.history : [],
      metadata: {
        className: this.constructor.name,
        saved: new Date().toISOString()
      }
    };

    // In a real implementation, this would write to filesystem
    // For now, we'll store in a static registry for testing
    BaseModule.savedStates.set(path, state);
  }

  /**
   * Load module state from file
   * 
   * @param path - File path to load from
   */
  load(path: string): void {
    const state = BaseModule.savedStates.get(path);
    if (!state) {
      throw new Error(`No saved state found at path: ${path}`);
    }

    // Restore parameters
    this._parameters.clear();
    for (const param of state.parameters) {
      this._parameters.set(param.name, param);
    }

    this._compiled = state.compiled;
    if (state.metadata?.saved) {
      // Could restore additional metadata here
    }
  }

  /**
   * Create deep copy of module
   * 
   * @returns - Deep copy of this module
   */
  deepcopy(): DSPyModule {
    // Use class constructor to create proper new instance
    const constructor = this.constructor as new (...args: any[]) => DSPyModule;
    const copy = new constructor();
    
    // Deep copy parameters
    if (this._parameters instanceof Map) {
      copy['_parameters'] = new Map();
      for (const [key, param] of this._parameters) {
        copy['_parameters'].set(key, {
          name: param.name,
          value: param.value,
          trainable: param.trainable,
          metadata: param.metadata ? { ...param.metadata } : undefined
        });
      }
    }

    // Copy other properties
    for (const key in this) {
      if (this.hasOwnProperty(key) && key !== '_parameters' && key !== 'history' && key !== '_compiled') {
        const value = this[key];
        if (Array.isArray(value)) {
          copy[key] = [...value];
        } else if (value && typeof value === 'object' && !(value instanceof Map)) {
          copy[key] = { ...value };
        } else {
          copy[key] = value;
        }
      }
    }

    // Reset history and compiled state
    copy['history'] = [];
    copy['_compiled'] = false;

    return copy;
  }

  /**
   * Create reset copy (parameters only)
   * 
   * @returns - Reset copy with same parameters but fresh state
   */
  reset_copy(): DSPyModule {
    const copy = this.deepcopy();
    copy.history = [];
    copy._compiled = false;
    return copy;
  }

  /**
   * Get all named parameters
   * 
   * @returns - Object mapping parameter names to parameters
   */
  named_parameters(): Record<string, Parameter> {
    const result: Record<string, Parameter> = {};
    for (const [name, param] of this._parameters) {
      result[name] = param;
    }
    return result;
  }

  /**
   * Get all parameters as array
   * 
   * @returns - Array of all parameters
   */
  parameters(): Parameter[] {
    return Array.from(this._parameters.values());
  }

  /**
   * Get all predictor parameters
   * 
   * @returns - Array of predictor parameters
   */
  predictors(): Parameter[] {
    return this.parameters().filter(p => p.metadata?.type === 'predictor');
  }

  /**
   * Process batch of examples
   * 
   * @param examples - Array of examples to process
   * @param options - Batch processing options
   * @returns - Array of predictions
   */
  batch(examples: Example[], options?: BatchOptions): Prediction[] {
    const batchSize = options?.batch_size || examples.length;
    const results: Prediction[] = [];

    for (let i = 0; i < examples.length; i += batchSize) {
      const batch = examples.slice(i, i + batchSize);
      
      for (const example of batch) {
        const inputs = example.inputs();
        const result = this.__call__(inputs);
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Set language model
   * 
   * @param lm - Language model instance
   */
  set_lm(lm: any): void {
    this._lm = lm;
  }

  /**
   * Get current language model
   * 
   * @returns - Current language model
   */
  get_lm(): any {
    return this._lm;
  }

  /**
   * Add a parameter to the module
   * 
   * @param name - Parameter name
   * @param value - Parameter value
   * @param trainable - Whether parameter is trainable
   * @param metadata - Optional metadata
   */
  protected addParameter(
    name: string, 
    value: any, 
    trainable: boolean = true, 
    metadata?: Record<string, any>
  ): void {
    this._parameters.set(name, {
      name,
      value,
      trainable,
      metadata
    });
  }

  /**
   * Update a parameter value
   * 
   * @param name - Parameter name
   * @param value - New value
   */
  protected updateParameter(name: string, value: any): void {
    const param = this._parameters.get(name);
    if (param) {
      param.value = value;
    }
  }

  /**
   * Get compilation status
   */
  get compiled(): boolean {
    return this._compiled;
  }

  /**
   * Set compilation status
   */
  set compiled(value: boolean) {
    this._compiled = value;
  }

  // Static registry for saved states (for testing)
  private static savedStates = new Map<string, ModuleState>();
}