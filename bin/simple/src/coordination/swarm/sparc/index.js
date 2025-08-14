import { getLogger } from '../../../config/logging-config.ts';
const logger = getLogger('coordination-swarm-sparc-index');
export { SPARCEngineCore } from './core/sparc-engine.ts';
import { SPARCEngineCore } from './core/sparc-engine.ts';
export { SPARCMCPTools, sparcMCPTools, } from './integrations/mcp-sparc-tools.ts';
export { ProjectManagementIntegration } from './integrations/project-management-integration.ts';
export { SPARCRoadmapManager } from './integrations/roadmap-integration.ts';
export { SpecificationPhaseEngine } from './phases/specification/specification-engine.ts';
export { SWARM_COORDINATION_TEMPLATE } from './templates/swarm-coordination-template.ts';
export class SPARC {
    static instance;
    static getEngine() {
        if (!SPARC.instance) {
            SPARC.instance = new SPARCEngineCore();
        }
        return SPARC.instance;
    }
    static async createProject(name, domain, requirements, complexity = 'moderate') {
        const engine = SPARC.getEngine();
        return engine.initializeProject({
            name,
            domain,
            complexity,
            requirements,
        });
    }
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
    static async getProject(projectId) {
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
//# sourceMappingURL=index.js.map