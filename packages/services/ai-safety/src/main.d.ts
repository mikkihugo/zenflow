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
 * ```typescript`
 * import { createInitializedAISafetyOrchestrator} from '@claude-zen/ai-safety';
 *
 * const result = await createInitializedAISafetyOrchestrator();
 * if (result.success) {
 *   const orchestrator = result.value;
 *   await orchestrator.startSafetyMonitoring();
 *}
 * ```
 *
 * @example Tree-shakable imports
 * ```typescript`
 * import { AISafetyOrchestrator, SafetyError} from '@claude-zen/ai-safety';
 * import { AIDeceptionDetector} from '@claude-zen/ai-safety';
 * ```
 */
export { AIDeceptionDetector, analyzeAIResponse, createAIDeceptionDetector, } from './ai-deception-detector';
export { AISafetyOrchestrator as SafetyGuard, AISafetyOrchestrator, AutomatedDetectionResult, BehavioralAnalysisResult, createAISafetyOrchestrator as createSafetyGuard, createAISafetyOrchestrator, createInitializedAISafetyOrchestrator, HumanEscalationResult, SafetyError, SafetyOrchestrationResult } from './safety-orchestrator';
/**
 * Enterprise setup function for AI safety monitoring with comprehensive foundation integration.
 *
 * @returns Promise resolving to Result with configured safety orchestrator
 * @example
 * ```typescript`
 * const result = await initializeAISafety();
 * if (result.success) {
 *   const safetySystem = result.value;
 *   console.log('Enterprise AI Safety initialized successfully');
 *} else {
 *   console.error('Failed to initialize AI Safety: ', result.error);
' *}
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
 * ```typescript`
 * const result = await emergencySafetyShutdown();
 * if (result.success) {
 *   console.log('Emergency shutdown completed successfully');
 *} else {
 *   console.error('Emergency shutdown failed: ', result.error);
' *}
 * ```
 */
export declare function emergencySafetyShutdown(): Promise<{
    success: boolean;
    error?: undefined;
} | {
    success: boolean;
    error: Error;
}>;
//# sourceMappingURL=main.d.ts.map