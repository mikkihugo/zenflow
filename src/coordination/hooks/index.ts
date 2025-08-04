/**
 * Hooks System - Index
 * Central exports for the hooks system with safety validation,
 * auto-assignment, performance tracking, and context loading
 */

export * from './auto-agent-assignment';
export * from './hook-manager';
// Main Manager
export { DefaultHookManager } from './hook-manager';
// Core System
export * from './hook-system-core';
export * from './performance-tracker';
// Specialized Components
export * from './safety-validator';

// Import for convenience function
import { DefaultHookManager } from './hook-manager';

// Convenience factory function
export function createHookManager() {
  return new DefaultHookManager();
}

// Version and metadata
export const HOOKS_VERSION = '1.0.0';
export const HOOKS_FEATURES = [
  'safety-validation',
  'auto-agent-assignment',
  'performance-tracking',
  'context-loading',
  'auto-formatting',
] as const;
