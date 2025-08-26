/**
 * Neural Types - Barrel Export.
 *
 * Central export point for all neural system types and utilities.
 */

// DSPy types - optional import to avoid circular dependencies
try {
  const dspy = require('@claude-zen/dspy');'
  // Export types only if dspy is available
  if (dspy) {
    module.exports.DSPyExample = dspy.Example;
    module.exports.DSPyPrediction = dspy.Prediction;
    module.exports.DSPyModule = dspy.DSPyModule;
  }
} catch {
  // DSPy not available - provide fallback types
}

// Note: Signature and Teleprompter types will be enabled when those modules are ready

// Main neural types from comprehensive types.ts
export * from '../types';
