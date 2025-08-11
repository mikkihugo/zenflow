/**
 * Hooks System - Index
 * Central exports for the hooks system with safety validation,
 * auto-assignment, performance tracking, and context loading.
 */
/**
 * @file Hooks module exports.
 */
export * from './auto-agent-assignment.ts';
export * from './hook-manager.ts';
export { DefaultHookManager } from './hook-manager.ts';
export { DefaultHookSystem, FileOperation as CoreFileOperation, HookSystem, Operation as CoreOperation, RiskLevel as CoreRiskLevel, SecurityRisk as CoreSecurityRisk, ValidationResult as CoreValidationResult, } from './hook-system-core.ts';
export * from './performance-tracker.ts';
export { FileOperation as SafetyFileOperation, FileOperationValidator, Operation as SafetyOperation, RiskLevel as SafetyRiskLevel, SecurityRisk as SafetySecurityRisk, ValidationResult as SafetyValidationResult, } from './safety-validator.ts';
import { DefaultHookManager } from './hook-manager.ts';
export declare function createHookManager(): DefaultHookManager;
export declare const HOOKS_VERSION = "1.0.0";
export declare const HOOKS_FEATURES: readonly ["safety-validation", "auto-agent-assignment", "performance-tracking", "context-loading", "auto-formatting"];
//# sourceMappingURL=index.d.ts.map