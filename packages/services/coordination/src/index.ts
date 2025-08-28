/**
 * @fileoverview Unified Coordination Package
 * 
 * Consolidated coordination functionality eliminating overlaps between: * - SPARC methodology 
 * - SAFe framework
 * - Workflow engines
 * - Task orchestration
 * - Multi-agent teamwork
 * 
 * Domain-based organization for clean separation of concerns.
 */
// =============================================================================
// SPARC METHODOLOGY - Systematic development workflow with event-driven ML
// =============================================================================
export * from './sparc'';
export * as sparc from './sparc'';
// =============================================================================
// EVENT-DRIVEN DSPY - Prompt optimization via events
// =============================================================================
export * from './dspy/event-driven-dspy'';
export * as eventDrivenDSPy from './dspy/event-driven-dspy'';
// =============================================================================
// EVENT-DRIVEN BRAIN - ML coordination via events
// =============================================================================
export * from './brain/event-driven-brain'';
export * as eventDrivenBrain from './brain/event-driven-brain'';
// =============================================================================  
// SAFE FRAMEWORK - Scaled Agile Framework integration
// =============================================================================
export * from './safe'';
export * as safe from './safe'';
// =============================================================================
// WORKFLOWS - Core workflow engine with multi-level orchestration
// =============================================================================
export * from './workflows'';
export * as workflows from './workflows'';
// =============================================================================
// ORCHESTRATION - Task flow management and coordination
// =============================================================================
export * from './orchestration'';
export * as orchestration from './orchestration'';
// =============================================================================
// TEAMWORK - Multi-agent conversation and collaboration
// =============================================================================
export * from './teamwork'';
export * as teamwork from './teamwork'';
// =============================================================================
// TASKMASTER - SAFe 6.0 Event-Driven Workflow Engine
// =============================================================================
export * from './taskmaster/index'';
export * as taskmaster from './taskmaster/index'';
// =============================================================================
// EVENTS - Event coordination and WebSocket hub
// =============================================================================
export * from './events/websocket-hub'';
export * as events from './events/websocket-hub'';
// =============================================================================
// INTEGRATIONS - External service integrations and utilities
// =============================================================================
export * from './integrations'';
export * as integrations from './integrations'';
// =============================================================================
// UNIFIED COORDINATION API - High-level coordination interface
// =============================================================================
export interface CoordinationSystem {
  sparc: await Promise.all([
    import('./sparc'),';
    import('./safe'),';
    import('./workflows'),';
    import('./orchestration'),';
    import('./teamwork'),';
    import('./taskmaster'),';
    import('./events/websocket-hub')';
]);
  return {
    sparc,
    safe,
    workflows,
    orchestration,
    teamwork,
    taskmaster,
    events
};
}
// =============================================================================
// PACKAGE METADATA
// =============================================================================
export const COORDINATION_PACKAGE_INFO = {
  name,  version,  description,  domains: [';
    'SPARC methodology - Systematic development workflow',    'SAFe framework - Scaled Agile Framework integration',    'Workflows - Core workflow engine with multi-level orchestration',    'Orchestration - Task flow management and coordination',    'Teamwork - Multi-agent conversation and collaboration',    'TaskMaster - Enterprise task management with human approval gates and SOC2 compliance')],';
  benefits: [
    'Eliminates coordination overlap between packages',    'Clean domain-based organization',    'Unified coordination API',    'Preserved functionality from all source packages',    'Modular imports for specific domains')];;
};