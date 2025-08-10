/**
 * Hooks System - Index
 * Central exports for the hooks system with safety validation,
 * auto-assignment, performance tracking, and context loading.
 */
/**
 * @file Hooks module exports.
 */

// Main Manager
export * from './hook-manager';
export { DefaultHookManager } from './hook-manager';

// Core System - explicit exports to avoid conflicts
export {
  HookSystem,
  DefaultHookSystem,
  FileOperation as CoreFileOperation,
  Operation as CoreOperation,
  RiskLevel as CoreRiskLevel,
  SecurityRisk as CoreSecurityRisk,
  ValidationResult as CoreValidationResult
} from './hook-system-core';

// Performance tracking
export * from './performance-tracker';

// Safety validation - explicit exports with prefixes
export {
  FileOperationValidator,
  FileOperation as SafetyFileOperation,
  Operation as SafetyOperation,
  RiskLevel as SafetyRiskLevel,
  SecurityRisk as SafetySecurityRisk,
  ValidationResult as SafetyValidationResult
} from './safety-validator';

// Auto agent assignment
export * from './auto-agent-assignment';

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
