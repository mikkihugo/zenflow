/**
 * @fileoverview Event Module Framework Exports
 * 
 * Central export point for the unified domain event module framework.
 * Provides base patterns, factory functions, and domain-specific modules
 * for brain, coordination, and custom domains.
 * 
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 2.1.0
 */

// =============================================================================
// BASE EVENT MODULE FRAMEWORK
// =============================================================================

// Base interfaces and implementations
export {
  BaseEventModule,
  type IEventModule,
  type BaseEventModuleConfig,
  type CorrelationContext,
  type EventEmissionOptions,
  type ModuleStatus,
  createCorrelationContext,
  eventMatches,
  validateEventModuleConfig
} from './base-event-module.js';

// Event module factory
export {
  EventModuleFactory,
  createBrainEventModule,
  createCoordinationEventModule,
  type BrainModuleConfig,
  type CoordinationModuleConfig,
  type CustomDomainModuleConfig
} from './event-module-factory.js';

// =============================================================================
// DOMAIN-SPECIFIC EVENT MODULES
// =============================================================================

// Unified Brain Event Module
export {
  UnifiedBrainEventModule,
  createUnifiedBrainEventModule,
  createExternalServiceUnifiedBrainEventModule,
  type UnifiedBrainEventModuleConfig,
  type SafeWorkflowSupportOptions,
  type SparcPhaseTransitionOptions,
  type DocumentImportOptions,
  type ImportWorkflowOptions,
  type BrainSagaStep
} from './brain-event-module.js';

// Unified Coordination Event Module
export {
  UnifiedCoordinationEventModule,
  createUnifiedCoordinationEventModule,
  createDefaultUnifiedCoordinationEventModule,
  type UnifiedCoordinationEventModuleConfig,
  type AgentState,
  type CoordinationTask,
  type DocumentImportOrchestrationRequest,
  type ResourceAllocationRequest,
  type TaskMasterApprovalRequest,
  type PIPlanningCoordinationRequest,
  type SPARCCoordinationRequest
} from './coordination-event-module.js';

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Create a brain event module using the factory (convenience function)
 */
export function createBrainModule(config: BrainModuleConfig, eventBus?: import('@claude-zen/foundation').EventBus) {
  return EventModuleFactory.createBrainModule(config, eventBus);
}

/**
 * Create a coordination event module using the factory (convenience function)
 */
export function createCoordinationModule(config: CoordinationModuleConfig, eventBus?: import('@claude-zen/foundation').EventBus) {
  return EventModuleFactory.createCoordinationModule(config, eventBus);
}

/**
 * Create a custom domain event module using the factory (convenience function)
 */
export function createCustomModule(config: CustomDomainModuleConfig, eventBus?: import('@claude-zen/foundation').EventBus) {
  return EventModuleFactory.createCustomModule(config, eventBus);
}