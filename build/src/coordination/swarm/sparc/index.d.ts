/**
 * @file Sparc module exports.
 */
/**
 * SPARC Methodology System - Main Export.
 *
 * Comprehensive SPARC (Specification, Pseudocode, Architecture, Refinement, Completion)
 * methodology system for systematic AI-assisted development workflow.
 */
export { SPARCEngineCore } from './core/sparc-engine.ts';
import { SPARCEngineCore } from './core/sparc-engine.ts';
import type { PhaseResult, SPARCProject } from './types/sparc-types.ts';
export { SPARCMCPTools, sparcMCPTools } from './integrations/mcp-sparc-tools.ts';
export { ProjectManagementIntegration } from './integrations/project-management-integration.ts';
export { SPARCRoadmapManager } from './integrations/roadmap-integration.ts';
export { SpecificationPhaseEngine } from './phases/specification/specification-engine.ts';
export { SWARM_COORDINATION_TEMPLATE } from './templates/swarm-coordination-template.ts';
export type * from './types/sparc-types.ts';
export declare class SPARC {
    private static instance;
    /**
     * Get singleton SPARC engine instance.
     */
    static getEngine(): SPARCEngineCore;
    /**
     * Quick project initialization with SPARC methodology.
     *
     * @param name
     * @param domain
     * @param requirements
     * @param complexity
     */
    static createProject(name: string, domain: 'swarm-coordination' | 'neural-networks' | 'wasm-integration' | 'rest-api' | 'memory-systems' | 'interfaces' | 'general', requirements: string[], complexity?: 'simple' | 'moderate' | 'high' | 'complex' | 'enterprise'): Promise<SPARCProject>;
    /**
     * Execute complete SPARC workflow.
     *
     * @param projectId
     */
    static executeFullWorkflow(projectId: string): Promise<PhaseResult[]>;
    /**
     * Get project by ID (mock implementation).
     *
     * @param projectId
     */
    private static getProject;
}
export default SPARC;
//# sourceMappingURL=index.d.ts.map