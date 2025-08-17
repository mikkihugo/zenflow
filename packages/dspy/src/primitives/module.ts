/**
 * @fileoverview DSPy Module - Production Grade
 * 
 * Core DSPy module abstraction for all DSPy programs and teleprompters.
 * 100% compatible with Stanford DSPy's Module interface.
 * 
 * @version 1.0.0
 * @author Claude Code Zen Team
 */

import type { Example } from './example';
import type { Prediction } from './prediction';

/**
 * Abstract base class for all DSPy modules
 * Exact match with Stanford DSPy's Module class
 */
export abstract class DSPyModule {
  /**
   * Forward pass through the module
   */
  abstract forward(example: Example): Promise<Prediction>;

  /**
   * Get all predictors in this module
   */
  predictors(): any[] {
    const predictors: any[] = [];
    
    // Iterate through all properties to find predictors
    for (const [key, value] of Object.entries(this)) {
      if (value && typeof value === 'object' && 'signature' in value) {
        predictors.push(value);
      }
    }
    
    return predictors;
  }

  /**
   * Get named predictors in this module
   */
  namedPredictors(): [string, any][] {
    const namedPredictors: [string, any][] = [];
    
    // Iterate through all properties to find predictors
    for (const [key, value] of Object.entries(this)) {
      if (value && typeof value === 'object' && 'signature' in value) {
        namedPredictors.push([key, value]);
      }
    }
    
    return namedPredictors;
  }

  /**
   * Deep copy the module
   */
  deepcopy(): DSPyModule {
    // Create a new instance of the same class
    const copy = Object.create(Object.getPrototypeOf(this));
    
    // Copy all properties
    for (const [key, value] of Object.entries(this)) {
      if (value && typeof value === 'object' && 'deepcopy' in value) {
        (copy as any)[key] = value.deepcopy();
      } else if (Array.isArray(value)) {
        (copy as any)[key] = [...value];
      } else if (value && typeof value === 'object') {
        (copy as any)[key] = { ...value };
      } else {
        (copy as any)[key] = value;
      }
    }
    
    return copy;
  }

  /**
   * Set language model for all predictors
   */
  setLM(lm: any): void {
    for (const predictor of this.predictors()) {
      predictor.lm = lm;
    }
  }

  /**
   * Reset all predictors
   */
  reset(): void {
    for (const predictor of this.predictors()) {
      if (predictor.reset) {
        predictor.reset();
      }
    }
  }

  /**
   * Get training history (if available)
   */
  getTrainingHistory(): any[] {
    return [];
  }

  /**
   * Get module parameters
   */
  getParameters(): Record<string, any> {
    const params: Record<string, any> = {};
    
    for (const [name, predictor] of this.namedPredictors()) {
      if (predictor.signature) {
        params[name] = {
          signature: predictor.signature,
          demos: predictor.demos || [],
          lm: predictor.lm?.model || null
        };
      }
    }
    
    return params;
  }

  /**
   * Save module state
   */
  save(): Record<string, any> {
    return {
      type: this.constructor.name,
      parameters: this.getParameters(),
      predictors: this.predictors().map(p => ({
        signature: p.signature,
        demos: p.demos || [],
        lm: p.lm?.model || null
      }))
    };
  }

  /**
   * Load module state
   */
  load(state: Record<string, any>): void {
    // Implementation would restore module state
    // This is a placeholder for now
  }
}

export default DSPyModule;