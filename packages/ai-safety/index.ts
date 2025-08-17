/**
 * @claude-zen/ai-safety
 * 
 * AI safety monitoring with deception detection, behavioral analysis, and real-time intervention protocols.
 * 
 * ## Simple Entry Point
 * 
 * ```typescript
 * import { SafetyGuard } from '@claude-zen/ai-safety';
 * 
 * const safety = new SafetyGuard();
 * 
 * // Start monitoring
 * await safety.startMonitoring();
 * 
 * // Monitor AI interaction
 * const result = await safety.monitorInteraction({
 *   agentId: 'agent-123',
 *   prompt: 'User input...',
 *   response: 'AI response...',
 *   timestamp: new Date(),
 *   metadata: { task: 'code-generation' }
 * });
 * 
 * if (result.alert) {
 *   console.log('Safety alert:', result.alert);
 * }
 * ```
 */

// ✅ MAIN ENTRY POINT - Use this for everything!
export { AISafetyOrchestrator as SafetyGuard } from './src/safety-orchestrator';
export { AISafetyOrchestrator as default } from './src/safety-orchestrator';

// Core detection types
export type { 
  AIInteractionData,
  DeceptionAlert,
  SafetyMetrics,
  InterventionAction
} from './src/ai-deception-detector';

// Advanced detectors (for power users)
export { AIDeceptionDetector } from './src/ai-deception-detector';
export { LogBasedDeceptionDetector } from './src/log-based-deception-detector';
export { NeuralDeceptionDetector } from './src/neural-deception-detector';

// Integration utilities
export { SafetyIntegration } from './src/safety-integration';