/**
 * @fileoverview Unified Coordination Package
 * 
 * Consolidated coordination functionality eliminating overlaps between:
 * - SPARC methodology 
 * - SAFe framework
 * - Workflow engines
 * - Task orchestration
 * - Multi-agent teamwork
 * 
 * Domain-based organization for clean separation of concerns.
 */

// =============================================================================
// SPARC METHODOLOGY - Systematic development workflow
// =============================================================================

export * from './sparc';
export * as sparc from './sparc';

// =============================================================================  
// SAFE FRAMEWORK - Scaled Agile Framework integration
// =============================================================================

export * from './safe';
export * as safe from './safe';

// =============================================================================
// WORKFLOWS - Core workflow engine with multi-level orchestration
// =============================================================================

export * from './workflows';
export * as workflows from './workflows';

// =============================================================================
// ORCHESTRATION - Task flow management and coordination
// =============================================================================

export * from './orchestration';
export * as orchestration from './orchestration';

// =============================================================================
// TEAMWORK - Multi-agent conversation and collaboration
// =============================================================================

export * from './teamwork';
export * as teamwork from './teamwork';

// =============================================================================
// AGUI - Autonomous Graphical User Interface for human-in-the-loop approvals
// =============================================================================

export * from './agui';
export * as agui from './agui';

// =============================================================================
// UNIFIED COORDINATION API - High-level coordination interface
// =============================================================================

export interface CoordinationSystem {
  sparc: typeof import('./sparc');
  safe: typeof import('./safe');
  workflows: typeof import('./workflows');
  orchestration: typeof import('./orchestration');
  teamwork: typeof import('./teamwork');
  agui: typeof import('./agui');
}

/**
 * Create unified coordination system with all methodologies
 */
export async function createCoordinationSystem(): Promise<CoordinationSystem> {
  const [sparc, safe, workflows, orchestration, teamwork, agui] = await Promise.all([
    import('./sparc'),
    import('./safe'),
    import('./workflows'),
    import('./orchestration'),
    import('./teamwork'),
    import('./agui')
  ]);

  return {
    sparc,
    safe,
    workflows,
    orchestration,
    teamwork,
    agui
  };
}

// =============================================================================
// PACKAGE METADATA
// =============================================================================

export const COORDINATION_PACKAGE_INFO = {
  name: '@claude-zen/coordination',
  version: '1.0.0',
  description: 'Unified coordination package consolidating SPARC, SAFe, workflows, orchestration, and teamwork',
  domains: [
    'SPARC methodology - Systematic development workflow',
    'SAFe framework - Scaled Agile Framework integration', 
    'Workflows - Core workflow engine with multi-level orchestration',
    'Orchestration - Task flow management and coordination',
    'Teamwork - Multi-agent conversation and collaboration',
    'AGUI - Human-in-the-loop approval gates and task approval workflows'
  ],
  benefits: [
    'Eliminates coordination overlap between packages',
    'Clean domain-based organization',
    'Unified coordination API',
    'Preserved functionality from all source packages',
    'Modular imports for specific domains'
  ]
};