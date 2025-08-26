/**
 * @fileoverview SPARC Methodology Package;
 *
 * Clean SPARC implementation with minimal dependencies.
 */

// Core engine (commented out - missing implementation)
// export { SPARCEngineCore } from './core/sparc-engine';
// export type { SPARCEngineConfig } from './core/sparc-engine;

// TEMPORARILY DISABLED - syntax issues in safe-sparc-workflow.ts'
// export type {
//   EpicProposal,
//   PortfolioDecision,
//   SafeSparcWorkflowConfig,
//   SparcArtifacts,
//   SparcExecutionContext,
//   SparcExecutionResult,
}
// } from './core/safe-sparc-workflow';
// SAFe-SPARC Integration Workflow (Production Implementation)
// TEMPORARILY DISABLED - syntax issues in safe-sparc-workflow.ts;
// export { SafeSparcWorkflow } from './core/safe-sparc-workflow'
export type {
  DeliverableMetrics,
  MethodologyResult,
  PhaseConfiguration,
  PhaseMetrics,
  ProjectContext,
  ProjectMetrics,
  QualityCriteria,
  QualityGate,
  SPARCConfiguration,
  SPARCDeliverable,
  SPARCError,
  SPARCPhase as SPARCCommanderPhase,
  SPARCProject as SPARCCommanderProject,
  SPARCWarning,
} from './core/sparc-commander';
// Production SPARC Commander (Full Implementation)
export { SPARCCommander } from './core/sparc-commander'
export type {
  Capability,
  Enabler,
  Feature,
  FlowMetrics,
  FlowSystem,
  Safe6DevelopmentCoordinationResult,
  Safe6DevelopmentManagerConfig,
  Safe6DevelopmentTeam,
  SolutionTrain,
  TeamMember,
} from './safe6-development-manager';
// SAFe 6.0 Development Manager (Flow-Based Enterprise Development)
export {
  createSafe6BusinessAgilityManager,
  createSafe6DevelopmentManager,
  createSafe6SolutionTrainManager,
  Safe6DevelopmentManager,
} from './safe6-development-manager';

// Types'
export type {
  AlgorithmPseudocode,
  ArchitectureComponent,
  ComponentRelationship,
  DataStructure,
  PhaseResult,
  ProjectArchitecture,
  ProjectComplexity,
  ProjectDomain,
  ProjectImplementation,
  ProjectPseudocode,
  ProjectRefinement,
  ProjectSpecification,
  SPARCPhase,
  SPARCProgress,
  SPARCProject,
  WorkflowPseudocode,
} from './types';

// import { SPARCEngineCore } from './core/sparc-engine'
// import type { PhaseResult, SPARCProject, ProjectDomain, ProjectComplexity } from './types';

/**
 * Main SPARC facade for easy usage.
 * Note: SPARCEngineCore implementation pending - using SPARCCommander for now
 */
export class SPARC {
  // private static instance: 'SPARCEngineCore'
  /**
   * Get singleton SPARC engine instance.
   * Note: Implementation pending
   */
  static getEngine(): any {
    throw new Error(
      SPARCEngineCore implementation pending - use SPARCCommander instead
    )';
  }

  /**
   * Quick project initialization with SPARC methodology.
   * Note: Implementation pending
   */
  static async createProject(
    _name: string,
    _domain: 'any',
    _requirements: string[],
    _complexity: any = 'moderate'
  ): Promise<any> {
    throw new Error(
      SPARCEngineCore implementation pending - use SPARCCommander instead
    )';
  }

  /**
   * Execute complete SPARC workflow.
   * Note: Implementation pending
   */
  static async executeFullWorkflow(_projectId: string): Promise<any[]> {
    throw new Error(
      'SPARCEngineCore implementation pending - use SPARCCommander instead'
    );
  }

  /**
   * Get project by ID.
   * Note: Implementation pending
   */
  static getProject(_projectId: string): any {
    throw new Error(
      SPARCEngineCore implementation pending - use SPARCCommander instead
    )';
  }

  /**
   * List all projects.
   * Note: Implementation pending
   */
  static listProjects(): any[] {
    throw new Error(
      'SPARCEngineCore implementation pending - use SPARCCommander instead'
    );
  }

export default SPARC;

