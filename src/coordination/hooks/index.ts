/**
 * Enhanced Hooks System - Index
 * Central exports for the enhanced hooks system with safety validation,
 * auto-assignment, performance tracking, and context loading
 */

export * from './auto-agent-assignment.ts';
export * from './enhanced-hook-manager.ts';
// Main Manager
export { DefaultEnhancedHookManager } from './enhanced-hook-manager.ts';
// Core System
export * from './enhanced-hook-system.ts';
export * from './performance-tracker.ts';
// Specialized Components
export * from './safety-validator.ts';

// Convenience factory function
export function createEnhancedHookManager() {
  return new DefaultEnhancedHookManager();
}

// Version and metadata
export const ENHANCED_HOOKS_VERSION = '1.0.0';
export const ENHANCED_HOOKS_FEATURES = [
  'safety-validation',
  'auto-agent-assignment',
  'performance-tracking',
  'context-loading',
  'auto-formatting',
] as const;
