/**
 * @fileoverview AI Safety Package - Professional Tree-Shakable Exports
 *
 * Unified AI safety system for deception detection and intervention.
 * Built on proven coordination patterns with comprehensive safety monitoring.
 *
 * Key Features:
 * - Tree-shakable exports for optimal bundle size
 * - Professional naming conventions
 * - Separate entry points for different safety systems
 * - Type-only exports clearly separated
 *
 * @example Importing specific components
 * ```typescript
 * import { SafetyGuard, AIDeceptionDetector } from '@claude-zen/ai-safety';
 * import { initializeAISafety } from '@claude-zen/ai-safety';
 * ```
 *
 * @example Using separate entry points (more optimal)
 * ```typescript
 * import { AIDeceptionDetector } from '@claude-zen/ai-safety/detection';
 * import { SafetyGuard } from '@claude-zen/ai-safety/orchestrator';
 * ```
 */

// =============================================================================
// PRIMARY ENTRY POINT - Main safety guard
// =============================================================================
export { AISafetyOrchestrator as SafetyGuard } from './safety-orchestrator';
export { createAISafetyOrchestrator as createSafetyGuard } from './safety-orchestrator';

// =============================================================================
// DECEPTION DETECTION - AI behavior analysis
// =============================================================================
export {
  AIDeceptionDetector,
  analyzeAIResponse,
  createAIDeceptionDetector,
} from './ai-deception-detector';

// =============================================================================
// SAFETY ORCHESTRATION - Coordinated safety systems
// =============================================================================
export {
  AISafetyOrchestrator,
  createAISafetyOrchestrator,
} from './safety-orchestrator';

// =============================================================================
// CONVENIENCE FUNCTIONS - Quick setup and emergency controls
// =============================================================================

/**
 * Quick setup function for AI safety monitoring.
 *
 * @returns Promise resolving to configured safety orchestrator
 * @example
 * ```typescript
 * const safetySystem = await initializeAISafety();
 * ```
 */
export async function initializeAISafety() {
  const { createAISafetyOrchestrator } = await import(
    './safety-orchestrator'
  );
  const orchestrator = createAISafetyOrchestrator();

  // Start monitoring immediately
  await orchestrator.startSafetyMonitoring();

  return orchestrator;
}

/**
 * Emergency safety shutdown for all AI systems.
 *
 * @returns Promise resolving when shutdown is complete
 * @example
 * ```typescript
 * await emergencySafetyShutdown();
 * ```
 */
export async function emergencySafetyShutdown() {
  // This would coordinate with all safety systems
  console.log('🛑 EMERGENCY SAFETY SHUTDOWN INITIATED');
}

// =============================================================================
// TYPE DEFINITIONS - Interfaces and types (tree-shakable)
// =============================================================================

// Deception detection types
export type {
  AIInteractionData,
  DeceptionAlert,
} from './ai-deception-detector';

// Safety orchestration types (SafetyMetrics is defined here)
export type {
  SafetyMetrics,
} from './safety-orchestrator';

// =============================================================================
// PLACEHOLDER TYPES - Safety system types (future implementation)
// =============================================================================

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
