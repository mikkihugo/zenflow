/**
* Neural Types - Barrel Export.
*
* Central export point for all neural system types and utilities.
*/

// Event-driven policy: do not import optional @claude-zen/dspy directly
// Provide minimal fallback type aliases to avoid compile-time coupling
// Consumers should depend on brain types only
export type DSPyExample = unknown;
export type DSPyPrediction = unknown;
export type DSPyModule = unknown;

// Note:Signature and Teleprompter types will be enabled when those modules are ready

// Main neural types from comprehensive types.ts
export * from '../types';
