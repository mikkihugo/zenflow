/**
 * @file Sparc module exports.
 */
import { getLogger } from '../../../config/logging-config.ts';
const logger = getLogger('coordination-swarm-sparc-index');
/**
 * SPARC Methodology System - Main Export.
 *
 * Comprehensive SPARC (Specification, Pseudocode, Architecture, Refinement, Completion)
 * methodology system for systematic AI-assisted development workflow.
 */
// Core Engine
export { SPARCEngineCore } from './core/sparc-engine.ts';
import { SPARCEngineCore } from './core/sparc-engine.ts';
// MCP Integration
export { SPARCMCPTools, sparcMCPTools } from './integrations/mcp-sparc-tools.ts';
// Project Management Integration
export { ProjectManagementIntegration } from './integrations/project-management-integration.ts';
export { SPARCRoadmapManager } from './integrations/roadmap-integration.ts';
// Phase Engines
export { SpecificationPhaseEngine } from './phases/specification/specification-engine.ts';
// Templates
export { SWARM_COORDINATION_TEMPLATE } from './templates/swarm-coordination-template.ts';
// Main SPARC facade for easy usage
export class SPARC {
    static instance;
    /**
     * Get singleton SPARC engine instance.
     */
    static getEngine() {
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
    static async createProject(name, domain, requirements, complexity = 'moderate') {
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
    static async executeFullWorkflow(projectId) {
        const engine = SPARC.getEngine();
        const phases = [
            'specification',
            'pseudocode',
            'architecture',
            'refinement',
            'completion',
        ];
        const results = [];
        for (const phase of phases) {
            try {
                const project = await SPARC.getProject(projectId);
                const result = await engine.executePhase(project, phase);
                results.push(result);
            }
            catch (error) {
                logger.error(`Failed to execute phase ${phase} for project ${projectId}:`, error);
            }
        }
        return results;
    }
    /**
     * Get project by ID (mock implementation).
     *
     * @param projectId
     */
    static async getProject(projectId) {
        // In a real implementation, this would retrieve from storage
        // For now, return a minimal mock project to avoid compilation errors
        return {
            id: projectId,
            name: `Mock Project ${projectId}`,
            domain: 'general',
            specification: {},
            pseudocode: {},
            architecture: {},
            refinements: [],
            implementation: {},
            currentPhase: 'specification',
            progress: {},
            metadata: {},
        };
    }
}
export default SPARC;
