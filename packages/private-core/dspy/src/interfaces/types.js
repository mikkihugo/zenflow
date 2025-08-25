/**
 * @fileoverview DSPy Types - Production Grade
 *
 * Core type definitions for DSPy teleprompters and modules.
 * 100% compatible with Stanford DSPy type system.
 *
 * @version 1.0.0
 * @author Claude Code Zen Team
 */
/**
 * Error types for DSPy operations
 */
export class DSPyError extends Error {
  code;
  metadata;
  constructor(message, code = 'DSPY_ERROR', metadata) {
    super(message);
    this.name = 'DSPyError';
    this.code = code;
    this.metadata = metadata ?? {};
  }
}
export class ValidationError extends DSPyError {
  constructor(message, metadata) {
    super(message, 'VALIDATION_ERROR', metadata);
    this.name = 'ValidationError';
  }
}
export class OptimizationError extends DSPyError {
  constructor(message, metadata) {
    super(message, 'OPTIMIZATION_ERROR', metadata);
    this.name = 'OptimizationError';
  }
}
export class ModelError extends DSPyError {
  constructor(message, metadata) {
    super(message, 'MODEL_ERROR', metadata);
    this.name = 'ModelError';
  }
}
// Default export object
export default {
  DSPyError,
  ValidationError,
  OptimizationError,
  ModelError,
};
