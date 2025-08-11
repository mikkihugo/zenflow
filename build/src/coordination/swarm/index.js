// Swarm Coordination - Core Swarm Functionality
/**
 * @file Swarm module exports.
 */
export * from './chaos-engineering/chaos-engineering.ts';
export { default as ChaosEngineering } from './chaos-engineering/chaos-engineering.ts';
// export * from './claude-zen/claude-zen-enhanced';
// export { default as ClaudeFlowEnhanced } from './claude-zen/claude-zen-enhanced';
export * from './cognitive-patterns/cognitive-pattern-evolution.ts';
export { CognitivePatternEvolution as default } from './cognitive-patterns/cognitive-pattern-evolution.ts';
export * from './connection-management/connection-state-manager.ts';
export { default as ConnectionManager } from './connection-management/connection-state-manager.ts';
export * from './core/index.ts';
// Main swarm exports
export { default as SwarmCore } from './core/index.ts';
// SPARC Methodology for Swarm Implementation (excluding conflicting type exports)
export { ProjectManagementIntegration, SPARC, SPARCEngineCore, SPARCMCPTools, SPARCRoadmapManager, SpecificationPhaseEngine, SWARM_COORDINATION_TEMPLATE, sparcMCPTools, } from './sparc/index.ts';
