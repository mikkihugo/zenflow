/**
 * @file AI Safety Module - Entry Point.
 *
 * Unified AI safety system for deception detection and intervention.
 * Built on proven fix:zen:compile coordination patterns.
 */
export type { AIInteractionData, DeceptionAlert } from './ai-deception-detector.ts';
export { AIDeceptionDetector, analyzeAIResponse, createAIDeceptionDetector, } from './ai-deception-detector.ts';
export { AISafetyOrchestrator, createAISafetyOrchestrator } from './safety-orchestrator.ts';
/**
 * Quick setup function for AI safety monitoring.
 *
 * @example
 */
export declare function initializeAISafety(): Promise<import("./safety-orchestrator.ts").AISafetyOrchestrator>;
/**
 * Emergency safety shutdown.
 *
 * @example
 */
export declare function emergencySafetyShutdown(): Promise<void>;
//# sourceMappingURL=index.d.ts.map