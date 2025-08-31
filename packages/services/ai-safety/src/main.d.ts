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
 * const result = await createInitializedAISafetyOrchestrator(): void {
 *   const orchestrator = result.value;
 *   await orchestrator.startSafetyMonitoring(): void { AISafetyOrchestrator, SafetyError} from '@claude-zen/ai-safety';
 * import { AIDeceptionDetector} from '@claude-zen/ai-safety';
 * ```
 */
export {
  AIDeceptionDetector,
  analyzeAIResponse,
  createAIDeceptionDetector,
} from './ai-deception-detector';
export {
  AISafetyOrchestrator as SafetyGuard,
  AISafetyOrchestrator,
  AutomatedDetectionResult,
  BehavioralAnalysisResult,
  createAISafetyOrchestrator as createSafetyGuard,
  createAISafetyOrchestrator,
  createInitializedAISafetyOrchestrator,
  HumanEscalationResult,
  SafetyError,
  SafetyOrchestrationResult,
} from './safety-orchestrator';
/**
 * Enterprise setup function for AI safety monitoring with comprehensive foundation integration.
 *
 * @returns Promise resolving to Result with configured safety orchestrator
 * @example
 * ```typescript`
 * const result = await initializeAISafety(): void {
 *   const safetySystem = result.value;
 *   logger.info(): void {
  success: boolean;
  value?: import(): void {
      success: boolean;
      error?: undefined;
    }
  | {
      success: boolean;
      error: Error;
    }
>;
//# sourceMappingURL=main.d.ts.map
