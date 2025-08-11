/**
 * Hook System - Core Infrastructure.
 * Provides safety validation, auto-assignment, performance tracking, and context loading.
 */
/**
 * @file Coordination system: hook-system-core.
 */
import { EventEmitter } from 'node:events';
export type { AgentAssignment as AgentAssignmentResult, AgentContext as ContextLoadingResult, OperationMetrics as PerformanceTrackingResult, ValidationResult as SafetyValidationResult, } from './hook-system.ts';
export * from './hook-system.ts';
export interface HookSystem {
    validateSafety(context: any): Promise<any>;
    assignAgents(context: any): Promise<any>;
    trackPerformance(context: any): Promise<any>;
    loadContext(context: any): Promise<any>;
}
export interface HookConfiguration {
    enabled: boolean;
    timeout: number;
    retries: number;
    fallbackBehavior: 'continue' | 'abort' | 'retry';
}
export interface HookSystemConfig {
    safetyValidation: HookConfiguration;
    agentAssignment: HookConfiguration;
    performanceTracking: HookConfiguration;
    contextLoading: HookConfiguration;
}
/**
 * Default Hook System Implementation.
 *
 * @example
 */
export declare class HookSystem extends EventEmitter implements HookSystem {
    private config;
    constructor(config?: Partial<HookSystemConfig>);
    getConfig(): HookSystemConfig;
    updateConfig(updates: Partial<HookSystemConfig>): void;
}
export declare const hookSystem: HookSystem;
export { HookSystem as DefaultHookSystem };
export default HookSystem;
//# sourceMappingURL=hook-system-core.d.ts.map