/**
 * @fileoverview SPARC Methodology Package
 *
 * Clean SPARC implementation with minimal dependencies.
 */

// Core engine (commented out - missing implementation)
// export { SPARCEngineCore } from './core/sparc-engine';
// export type { SPARCEngineConfig } from './core/sparc-engine';

// Production SPARC Commander (Full Implementation)
export { SPARCCommander } from './core/sparc-commander';
export type {
  SPARCProject as SPARCCommanderProject,
  SPARCPhase as SPARCCommanderPhase,
  SPARCDeliverable,
  QualityGate,
  QualityCriteria,
  PhaseMetrics,
  DeliverableMetrics,
  ProjectContext,
  SPARCConfiguration,
  PhaseConfiguration,
  MethodologyResult,
  ProjectMetrics,
  SPARCError,
  SPARCWarning,
} from './core/sparc-commander';

// SAFe-SPARC Integration Workflow (Production Implementation)
export { SafeSparcWorkflow } from './core/safe-sparc-workflow';
export type {
  SafeSparcWorkflowConfig,
  EpicProposal,
  PortfolioDecision,
  SparcArtifacts,
  SparcExecutionContext,
  SparcExecutionResult,
} from './core/safe-sparc-workflow';

// SAFe 6.0 Development Manager (Flow-Based Enterprise Development)
export {
  Safe6DevelopmentManager,
  createSafe6DevelopmentManager,
  createSafe6SolutionTrainManager,
  createSafe6BusinessAgilityManager,
} from './safe6-development-manager';
export type {
  Safe6DevelopmentManagerConfig,
  FlowSystem,
  FlowMetrics,
  SolutionTrain,
  Capability,
  Enabler,
  Feature,
  Safe6DevelopmentTeam,
  TeamMember,
  Safe6DevelopmentCoordinationResult,
} from './safe6-development-manager';

// Types
export type {
  SPARCProject,
  SPARCPhase,
  PhaseResult,
  ProjectComplexity,
  ProjectDomain,
  ProjectSpecification,
  ProjectPseudocode,
  AlgorithmPseudocode,
  DataStructure,
  WorkflowPseudocode,
  ProjectArchitecture,
  ArchitectureComponent,
  ComponentRelationship,
  ProjectRefinement,
  ProjectImplementation,
  SPARCProgress,
} from './types';

// import { SPARCEngineCore } from './core/sparc-engine';
// import type { PhaseResult, SPARCProject, ProjectDomain, ProjectComplexity } from './types';

/**
 * Main SPARC facade for easy usage.
 * Note: SPARCEngineCore implementation pending - using SPARCCommander for now
 */
export class SPARC {
  // private static instance: SPARCEngineCore;

  /**
   * Get singleton SPARC engine instance.
   * Note: Implementation pending
   */
  static getEngine(): any {
    throw new Error(
      'SPARCEngineCore implementation pending - use SPARCCommander instead''
    );
  }

  /**
   * Quick project initialization with SPARC methodology.
   * Note: Implementation pending
   */
  static async createProject(
    name: string,
    domain: any,
    requirements: string[],
    complexity: any = 'moderate''
  ): Promise<any> {
    throw new Error(
      'SPARCEngineCore implementation pending - use SPARCCommander instead''
    );
  }

  /**
   * Execute complete SPARC workflow.
   * Note: Implementation pending
   */
  static async executeFullWorkflow(projectId: string): Promise<any[]> {
    throw new Error(
      'SPARCEngineCore implementation pending - use SPARCCommander instead''
    );
  }

  /**
   * Get project by ID.
   * Note: Implementation pending
   */
  static getProject(projectId: string): any {
    throw new Error(
      'SPARCEngineCore implementation pending - use SPARCCommander instead''
    );
  }

  /**
   * List all projects.
   * Note: Implementation pending
   */
  static listProjects(): any[] {
    throw new Error(
      'SPARCEngineCore implementation pending - use SPARCCommander instead''
    );
  }
}

export default SPARC;
