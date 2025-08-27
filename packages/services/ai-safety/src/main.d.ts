/**
 * @fileoverview AI Safety Package - Enterprise Foundation Integration
 *
 * Professional AI safety system leveraging comprehensive @claude-zen/foundation utilities.
 * Transformed to match memory package pattern with battle-tested enterprise architecture.
 *
 * Foundation Integration:
 * - Result pattern for type-safe error handling
 * - Circuit breakers for resilience
 * - Performance tracking and telemetry
 * - Storage abstraction with KeyValueStore
 * - Error aggregation and comprehensive logging
 * - Dependency injection with TSyringe
 * - Structured validation and type safety
 *
 * ENHANCEMENT: Basic → Comprehensive foundation integration
 * PATTERN: Matches memory, knowledge, event-system, teamwork, brain packages
 *
 * @example Enterprise usage with Result pattern
 * ```typescript
 * import { createInitializedAISafetyOrchestrator } from '@claude-zen/ai-safety';
 *
 * const result = await createInitializedAISafetyOrchestrator();
 * if (result.success) {
 *   const orchestrator = result.value;
 *   await orchestrator.startSafetyMonitoring();
 * }
 * ```
 *
 * @example Tree-shakable imports
 * ```typescript
 * import { AISafetyOrchestrator, SafetyError } from '@claude-zen/ai-safety';
 * import { AIDeceptionDetector } from '@claude-zen/ai-safety';
 * ```
 */
export { AIDeceptionDetector, analyzeAIResponse, createAIDeceptionDetector, } from './ai-deception-detector';
export { AISafetyOrchestrator as SafetyGuard, AISafetyOrchestrator, AutomatedDetectionResult, BehavioralAnalysisResult, createAISafetyOrchestrator as createSafetyGuard, createAISafetyOrchestrator, createInitializedAISafetyOrchestrator, HumanEscalationResult, SafetyError, SafetyOrchestrationResult, } from './safety-orchestrator';
/**
 * Enterprise setup function for AI safety monitoring with comprehensive foundation integration.
 *
 * @returns Promise resolving to Result with configured safety orchestrator
 * @example
 * ```typescript
 * const result = await initializeAISafety();
 * if (result.success) {
 *   const safetySystem = result.value;
 *   console.log('Enterprise AI Safety initialized successfully');
 * } else {
 *   console.error('Failed to initialize AI Safety:', result.error);
 * }
 * ```
 */
export declare function initializeAISafety(): Promise<{
    success: boolean;
    value?: import("./safety-orchestrator").AISafetyOrchestrator;
    error?: import("./safety-orchestrator").SafetyError;
}>;
/**
 * Enterprise emergency safety shutdown with comprehensive cleanup.
 *
 * @returns Promise resolving to Result indicating success or failure
 * @example
 * ```typescript
 * const result = await emergencySafetyShutdown();
 * if (result.success) {
 *   console.log('Emergency shutdown completed successfully');
 * } else {
 *   console.error('Emergency shutdown failed:', result.error);
 * }
 * ```
 */
export declare function emergencySafetyShutdown(): Promise<{
    success: boolean;
    error?: undefined;
} | {
    success: boolean;
    error: Error;
}>;
export type { AIInteractionData, DeceptionAlert, } from './ai-deception-detector';
export type { SafetyMetrics } from './safety-orchestrator';
/** Safety configuration interface */
export interface SafetyConfig {
    enabled: boolean;
    strictMode?: boolean;
    interventionThreshold?: number;
    escalationTimeout?: number;
}
/** Safety event interface */
export interface SafetyEvent {
    type: 'alert' | 'intervention' | 'escalation' | 'shutdown';
    timestamp: number;
    agentId?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    data: Record<string, any>;
}
/** Risk level enum */
export type RiskLevel = 'minimal' | 'low' | 'medium' | 'high' | 'critical' | 'extreme';
/** Safety status enum */
export type SafetyStatus = 'safe' | 'monitoring' | 'warning' | 'alert' | 'intervention' | 'emergency';
/** Intervention action interface */
export interface InterventionAction {
    type: 'pause' | 'restrict' | 'terminate' | 'escalate';
    target: string;
    reason: string;
    timestamp: number;
    success: boolean;
}
export declare function getAISafetySystemAccess(_config?: SafetyConfig): Promise<any>;
export declare function getSafetyOrchestrator(config?: SafetyConfig): Promise<any>;
export declare function getDeceptionDetection(_config?: any): Promise<any>;
export declare function getSafetyMonitoring(config?: SafetyConfig): Promise<any>;
export declare function getSafetyIntervention(config?: SafetyConfig): Promise<any>;
export declare const aiSafetySystem: {
    getAccess: typeof getAISafetySystemAccess;
    getOrchestrator: typeof getSafetyOrchestrator;
    getDetection: typeof getDeceptionDetection;
    getMonitoring: typeof getSafetyMonitoring;
    getIntervention: typeof getSafetyIntervention;
    initialize: typeof initializeAISafety;
    emergencyShutdown: typeof emergencySafetyShutdown;
};
//# sourceMappingURL=main.d.ts.map