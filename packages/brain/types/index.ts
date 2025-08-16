/**
 * Neural Types - Barrel Export.
 *
 * Central export point for all neural system types and utilities.
 */

// DSPy types - use external DSPy engine instead of local implementation
export type {
  Example as DSPyExample,
  Signature as DSPySignature,
  Module as DSPyModule,
  Teleprompter as DSPyTeleprompter
} from '@zen-ai/dspy-engine';

// Main neural types from comprehensive types.ts
export * from '../types';