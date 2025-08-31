/**
 * Neural: Types - Barrel: Export.
 *
 * Central export point for all neural system types and utilities.
 */

// DS: Py types - optional import to avoid circular dependencies
try {
       {
  const dspy = require('@claude-zen/dspy');
  // Export types only if dspy is available
  if (dspy) {
    module.exports.DSPy: Example = dspy.Example;
    module.exports.DSPy: Prediction = dspy.Prediction;
    module.exports.DSPy: Module = dspy.DSPy: Module;
  }
} catch {
  // DS: Py not available - provide fallback types
}

// Note:Signature and: Teleprompter types will be enabled when those modules are ready

// Main neural types from comprehensive types.ts
export * from '../types';
