/**
 * Enhanced Hooks System - Index
 * Central exports for the enhanced hooks system with safety validation,
 * auto-assignment, performance tracking, and context loading
 */

export * from './auto-agent-assignment.js';
export * from './enhanced-hook-manager.js';
// Main Manager
export { DefaultEnhancedHookManager } from './enhanced-hook-manager.js';
// Core System
export * from './enhanced-hook-system.js';
export * from './performance-tracker.js';
// Specialized Components
export * from './safety-validator.js';

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
