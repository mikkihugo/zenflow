/**
 * Hooks System - Index
 * Central exports for the hooks system with safety validation,
 * auto-assignment, performance tracking, and context loading.
 */
/**
 * @file Hooks module exports.
 */
// Auto agent assignment
export * from './auto-agent-assignment.ts';
// Main Manager
export * from './hook-manager.ts';
export { DefaultHookManager } from './hook-manager.ts';
// Core System - explicit exports to avoid conflicts
export { DefaultHookSystem, HookSystem, } from './hook-system-core.ts';
// Performance tracking
export * from './performance-tracker.ts';
// Safety validation - explicit exports with prefixes
export { FileOperationValidator, } from './safety-validator.ts';
// Import for convenience function
import { DefaultHookManager } from './hook-manager.ts';
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
];
