/**
 * @file AI Safety Module - Entry Point.
 *
 * Unified AI safety system for deception detection and intervention.
 * Built on proven fix:zen:compile coordination patterns.
 */

// Types
export type { AIInteractionData, DeceptionAlert } from './ai-deception-detector.ts';
export {
  AIDeceptionDetector,
  analyzeAIResponse,
  createAIDeceptionDetector,
} from './ai-deception-detector.ts';
export { AISafetyOrchestrator, createAISafetyOrchestrator } from './safety-orchestrator.ts';

/**
 * Quick setup function for AI safety monitoring.
 *
 * @example
 */
export async function initializeAISafety() {
  const { createAISafetyOrchestrator } = await import('./safety-orchestrator.ts');
  const orchestrator = createAISafetyOrchestrator();

  // Start monitoring immediately
  await orchestrator.startSafetyMonitoring();

  return orchestrator;
}

/**
 * Emergency safety shutdown.
 *
 * @example
 */
export async function emergencySafetyShutdown() {
  // This would coordinate with all safety systems
  console.log('🛑 EMERGENCY SAFETY SHUTDOWN INITIATED');
}
