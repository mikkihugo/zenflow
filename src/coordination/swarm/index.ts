// Swarm Coordination - Core Swarm Functionality
/**
 * @file Swarm module exports.
 */

export * from './chaos-engineering/chaos-engineering';
export { default as ChaosEngineering } from './chaos-engineering/chaos-engineering';
// export * from './claude-zen/claude-zen-enhanced';
// export { default as ClaudeFlowEnhanced } from './claude-zen/claude-zen-enhanced';
export * from './cognitive-patterns/cognitive-pattern-evolution';
export { CognitivePatternEvolution as default } from './cognitive-patterns/cognitive-pattern-evolution';
export * from './connection-management/connection-state-manager';
export { default as ConnectionManager } from './connection-management/connection-state-manager';
export * from './core/index';
// Main swarm exports
export { default as SwarmCore } from './core/index';
// SPARC Methodology for Swarm Implementation (excluding conflicting type exports)
export {
  ProjectManagementIntegration,
  SPARC,
  SPARCEngineCore,
  SPARCMCPTools,
  SPARCRoadmapManager,
  SpecificationPhaseEngine,
  SWARM_COORDINATION_TEMPLATE,
  sparcMCPTools,
} from './sparc/index';
