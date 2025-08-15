/**
 * @file Sparc module exports.
 */

import { getLogger } from '../../../config/logging-config';

const logger = getLogger('coordination-swarm-sparc-index');

/**
 * SPARC Methodology System - Main Export.
 *
 * Comprehensive SPARC (Specification, Pseudocode, Architecture, Refinement, Completion)
 * methodology system for systematic AI-assisted development workflow.
 */

// Core Engine
export { SPARCEngineCore } from './core/sparc-engine';

import { SPARCEngineCore } from './core/sparc-engine';
import type { PhaseResult, SPARCProject } from './types/sparc-types';

// MCP Integration
export {
  SPARCMCPTools,
  sparcMCPTools,
} from './integrations/mcp-sparc-tools';
// Project Management Integration
export { ProjectManagementIntegration } from './integrations/project-management-integration';
export { SPARCRoadmapManager } from './integrations/roadmap-integration';
// Phase Engines
export { SpecificationPhaseEngine } from './phases/specification/specification-engine';
// Templates
export { SWARM_COORDINATION_TEMPLATE } from './templates/swarm-coordination-template';
// Types
export type * from './types/sparc-types';

// Main SPARC facade for easy usage
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
   *
   * @param name
   * @param domain
   * @param requirements
   * @param complexity
   */
  static async createProject(
    name: string,
    domain:
      | 'swarm-coordination'
      | 'neural-networks'
      | 'wasm-integration'
      | 'rest-api'
      | 'memory-systems'
      | 'interfaces'
      | 'general',
    requirements: string[],
    complexity:
      | 'simple'
      | 'moderate'
      | 'high'
      | 'complex'
      | 'enterprise' = 'moderate'
  ) {
    const engine = SPARC.getEngine();
    return engine.initializeProject({
      name,
      domain,
      complexity,
      requirements,
    });
  }

  /**
   * Execute complete SPARC workflow.
   *
   * @param projectId
   */
  static async executeFullWorkflow(projectId: string) {
    const engine = SPARC.getEngine();
    const phases = [
      'specification',
      'pseudocode',
      'architecture',
      'refinement',
      'completion',
    ] as const;

    const results: PhaseResult[] = [];
    for (const phase of phases) {
      try {
        const project = await SPARC.getProject(projectId);
        const result = await engine.executePhase(project, phase);
        results.push(result);
      } catch (error) {
        logger.error(
          `Failed to execute phase ${phase} for project ${projectId}:`,
          error
        );
      }
    }

    return results;
  }

  /**
   * Get project by ID (mock implementation).
   *
   * @param projectId
   */
  private static async getProject(projectId: string): Promise<SPARCProject> {
    // In a real implementation, this would retrieve from storage
    // For now, return a minimal mock project to avoid compilation errors
    return {
      id: projectId,
      name: `Mock Project ${projectId}`,
      domain: 'general',
      specification: {} as any,
      pseudocode: {} as any,
      architecture: {} as any,
      refinements: [],
      implementation: {} as any,
      currentPhase: 'specification',
      progress: {} as any,
      metadata: {} as any,
    } as SPARCProject;
  }
}

export default SPARC;
