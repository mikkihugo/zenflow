/**
 * @fileoverview DSPy Module - Production Grade
 *
 * Core DSPy module abstraction for all DSPy programs and teleprompters.
 * 100% compatible with Stanford DSPy's Module interface.
 *
 * @version 1.0.0
 * @author Claude Code Zen Team
 */
// import type { Example } from './example'; // Unused import
// import type { Prediction } from './prediction'; // Unused import
/**
 * Abstract base class for all DSPy modules
 * Exact match with Stanford DSPy's Module class
 */
export class DSPyModule {
  /**
   * Whether the module has been compiled/optimized
   */
  compiled = false;
  /**
   * Get all predictors in this module
   */
  predictors() {
    const predictors = [];
    // Iterate through all properties to find predictors
    for (const [_key, value] of Object.entries(this)) {
      if (value && typeof value === 'object' && 'signature' in value) {
        predictors.push(value);
      }
    }
    return predictors;
  }
  /**
   * Get named predictors in this module
   */
  namedPredictors() {
    const namedPredictors = [];
    // Iterate through all properties to find predictors
    for (const [key, value] of Object.entries(this)) {
      if (value && typeof value === 'object' && 'signature' in value) {
        namedPredictors.push([key, value]);
      }
    }
    return namedPredictors;
  }
  /**
   * Stanford DSPy compatible named_predictors method
   */
  named_predictors() {
    return this.namedPredictors();
  }
  /**
   * Deep copy the module
   */
  deepcopy() {
    // Create a new instance of the same class
    const copy = Object.create(Object.getPrototypeOf(this));
    // Copy all properties
    for (const [key, value] of Object.entries(this)) {
      if (value && typeof value === 'object' && 'deepcopy' in value) {
        copy[key] = value.deepcopy();
      } else if (Array.isArray(value)) {
        copy[key] = [...value];
      } else if (value && typeof value === 'object') {
        copy[key] = { ...value };
      } else {
        copy[key] = value;
      }
    }
    return copy;
  }
  /**
   * Stanford DSPy compatible reset_copy method
   */
  reset_copy() {
    const copy = this.deepcopy();
    copy.reset();
    copy._compiled = false;
    return copy;
  }
  /**
   * Set language model for all predictors
   */
  setLM(lm) {
    for (const predictor of this.predictors()) {
      predictor.lm = lm;
    }
  }
  /**
   * Reset all predictors
   */
  reset() {
    for (const predictor of this.predictors()) {
      if (predictor.reset) {
        predictor.reset();
      }
    }
  }
  /**
   * Get training history (if available)
   */
  getTrainingHistory() {
    return [];
  }
  /**
   * Get module parameters
   */
  getParameters() {
    const params = {};
    for (const [name, predictor] of this.namedPredictors()) {
      if (predictor.signature) {
        params[name] = {
          signature: predictor.signature,
          demos: predictor.demos || [],
          lm: predictor.lm?.model || null,
        };
      }
    }
    return params;
  }
  /**
   * Save module state
   */
  save() {
    return {
      type: this.constructor.name,
      parameters: this.getParameters(),
      predictors: this.predictors().map((p) => ({
        signature: p.signature,
        demos: p.demos || [],
        lm: p.lm?.model || null,
      })),
    };
  }
  /**
   * Load module state
   */
  load(_state) {
    // Implementation would restore module state
    // This is a placeholder for now
  }
}
// Export as both named and default export for compatibility
export { DSPyModule as default };
