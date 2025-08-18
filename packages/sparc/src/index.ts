/**
 * @fileoverview SPARC Methodology Package
 * 
 * Clean SPARC implementation with minimal dependencies.
 */

// Core engine
export { SPARCEngineCore } from './core/sparc-engine';
export type { SPARCEngineConfig } from './core/sparc-engine';

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
  SPARCWarning
} from './core/sparc-commander';

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
  SPARCProgress
} from './types';

import { SPARCEngineCore } from './core/sparc-engine';
import type { PhaseResult, SPARCProject, ProjectDomain, ProjectComplexity } from './types';

/**
 * Main SPARC facade for easy usage.
 */
export class SPARC {
  private static instance: SPARCEngineCore;

  /**
   * Get singleton SPARC engine instance.
   */
  static getEngine(): SPARCEngineCore {
    if (!SPARC.instance) {
      SPARC.instance = new SPARCEngineCore();
    }
    return SPARC.instance;
  }

  /**
   * Quick project initialization with SPARC methodology.
   */
  static async createProject(
    name: string,
    domain: ProjectDomain,
    requirements: string[],
    complexity: ProjectComplexity = 'moderate'
  ): Promise<SPARCProject> {
    const engine = SPARC.getEngine();
    return engine.initializeProject({
      name,
      domain,
      complexity,
      requirements
    });
  }

  /**
   * Execute complete SPARC workflow.
   */
  static async executeFullWorkflow(projectId: string): Promise<PhaseResult[]> {
    const engine = SPARC.getEngine();
    const project = engine.getProject(projectId);
    
    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    const phases = ['specification', 'pseudocode', 'architecture', 'refinement', 'completion'] as const;
    const results: PhaseResult[] = [];

    for (const phase of phases) {
      const result = await engine.executePhase(project, phase);
      results.push(result);
      
      if (!result.success) {
        break; // Stop on first failure
      }
    }

    return results;
  }

  /**
   * Get project by ID.
   */
  static getProject(projectId: string): SPARCProject | undefined {
    const engine = SPARC.getEngine();
    return engine.getProject(projectId);
  }

  /**
   * List all projects.
   */
  static listProjects(): SPARCProject[] {
    const engine = SPARC.getEngine();
    return engine.listProjects();
  }
}

export default SPARC;