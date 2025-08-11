/**
 * @file Coordination system: swarm-coordination-integration.
 */
import { getLogger } from '../../../../config/logging-config.ts';
const logger = getLogger('coordination-swarm-sparc-integrations-swarm-coordination-integration');
/**
 * SPARC Swarm Coordination Integration.
 *
 * Integrates SPARC methodology with Claude-Zen's sophisticated swarm coordination system.
 * Enables distributed SPARC development using existing agent types and coordination protocols.
 */
import { TaskAPI } from '../../../../interfaces/api';
import { TaskCoordinator } from '../../task-coordinator';
// SPARC-specific agent types from existing 147+ agent types
export const SPARC_AGENT_TYPES = [
    'coordinator',
    'coder',
    'requirements-engineer',
    'system-architect',
    'performance-tester',
    'unit-tester',
    'security-architect',
    'documenter',
];
/**
 * Coordinates SPARC development using existing swarm intelligence.
 *
 * @example
 */
export class SPARCSwarmCoordinator {
    taskCoordinator;
    taskAPI;
    activeSPARCSwarms;
    logger;
    constructor(logger) {
        this.taskCoordinator = TaskCoordinator.getInstance();
        this.taskAPI = new TaskAPI();
        this.activeSPARCSwarms = new Map();
        this.logger = logger;
    }
    /**
     * Create a swarm for SPARC project development.
     *
     * @param project
     */
    async initializeSPARCSwarm(project) {
        const swarmId = `sparc-${project.id}`;
        const agentTasks = new Set();
        // Phase-specific agent assignments using existing coordination
        const phaseAgents = this.getPhaseAgents(project.currentPhase);
        for (const agentType of phaseAgents) {
            const taskConfig = {
                description: `SPARC ${project.currentPhase} phase for ${project.name}`,
                prompt: this.generatePhasePrompt(project, project.currentPhase, agentType),
                subagent_type: agentType,
                use_claude_subagent: true,
                domain_context: `SPARC methodology - ${project.domain}`,
                expected_output: this.getPhaseExpectedOutput(project.currentPhase, agentType),
                tools_required: this.getRequiredTools(project.currentPhase, agentType),
                priority: 'high',
                dependencies: [],
                timeout_minutes: this.getPhaseTimeout(project.currentPhase),
            };
            const taskId = await TaskAPI.createTask({
                type: `${agentType}-${project.currentPhase}`,
                description: taskConfig?.description,
                priority: 3,
            });
            agentTasks.add(taskId.id || taskId.toString());
        }
        this.activeSPARCSwarms.set(swarmId, agentTasks);
        return swarmId;
    }
    /**
     * Execute SPARC phase using coordinated swarm.
     *
     * @param projectId
     * @param phase
     */
    async executeSPARCPhase(projectId, phase) {
        const swarmId = `sparc-${projectId}`;
        const results = new Map();
        const phaseAgents = this.getPhaseAgents(phase);
        // Track swarm execution for SPARC phase
        this.logger?.info('SPARC Phase Execution Started', {
            projectId,
            phase,
            swarmId,
            agentCount: phaseAgents.length,
        });
        // Execute tasks in parallel using existing coordination
        const taskPromises = phaseAgents.map(async (agentType) => {
            const taskConfig = {
                description: `Execute ${phase} phase with ${agentType}`,
                prompt: this.generatePhasePrompt({ id: projectId }, phase, agentType),
                subagent_type: agentType,
                use_claude_subagent: true,
                domain_context: 'SPARC methodology execution',
                priority: 'high',
                timeout_minutes: this.getPhaseTimeout(phase),
            };
            try {
                const result = await this.taskCoordinator.executeTask(taskConfig);
                results?.set(agentType, result);
                return result?.success;
            }
            catch (error) {
                logger.error(`SPARC phase execution failed for ${agentType}:`, error);
                return false;
            }
        });
        const successes = await Promise.all(taskPromises);
        const allSuccessful = successes.every((success) => success);
        return { success: allSuccessful, results };
    }
    /**
     * Get appropriate agents for each SPARC phase.
     *
     * @param phase
     */
    getPhaseAgents(phase) {
        const phaseAgentMap = {
            specification: ['requirements-engineer', 'coordinator', 'documenter'],
            pseudocode: ['coder', 'system-architect', 'coordinator'],
            architecture: ['system-architect', 'performance-tester', 'security-architect', 'coordinator'],
            refinement: ['performance-tester', 'security-architect', 'unit-tester', 'coder'],
            completion: ['coder', 'unit-tester', 'documenter', 'coordinator'],
        };
        return phaseAgentMap[phase] || ['coordinator'];
    }
    /**
     * Generate phase-specific prompts for agents.
     *
     * @param project
     * @param phase
     * @param agentType
     */
    generatePhasePrompt(project, phase, agentType) {
        const basePrompt = `You are a ${agentType} working on SPARC methodology ${phase} phase for "${project.name}".`;
        const phasePrompts = {
            specification: {
                'requirements-analyst': `${basePrompt} Analyze requirements and create detailed specifications.`,
                'sparc-coordinator': `${basePrompt} Coordinate specification phase activities.`,
                'documentation-specialist': `${basePrompt} Document requirements and specifications.`,
            },
            pseudocode: {
                'implementer-sparc-coder': `${basePrompt} Create detailed pseudocode and algorithm design.`,
                'system-architect': `${basePrompt} Design system structure and component interactions.`,
                'sparc-coordinator': `${basePrompt} Coordinate pseudocode development activities.`,
            },
            architecture: {
                'system-architect': `${basePrompt} Design comprehensive system architecture.`,
                'performance-engineer': `${basePrompt} Analyze performance requirements and optimization opportunities.`,
                'security-engineer': `${basePrompt} Design security architecture and identify threats.`,
                'sparc-coordinator': `${basePrompt} Coordinate architecture design activities.`,
            },
            refinement: {
                'performance-engineer': `${basePrompt} Optimize performance and identify bottlenecks.`,
                'security-engineer': `${basePrompt} Enhance security measures and conduct threat analysis.`,
                'test-engineer': `${basePrompt} Design comprehensive testing strategy.`,
                'implementer-sparc-coder': `${basePrompt} Refine implementation based on feedback.`,
            },
            completion: {
                'implementer-sparc-coder': `${basePrompt} Generate production-ready code implementation.`,
                'test-engineer': `${basePrompt} Create comprehensive test suites and validation.`,
                'documentation-specialist': `${basePrompt} Create complete project documentation.`,
                'sparc-coordinator': `${basePrompt} Coordinate completion phase and final validation.`,
            },
        };
        return phasePrompts[phase]?.[agentType] || `${basePrompt} Execute ${phase} phase tasks.`;
    }
    /**
     * Get expected output for each phase and agent combination.
     *
     * @param phase
     * @param agentType
     */
    getPhaseExpectedOutput(phase, agentType) {
        const outputMap = {
            'specification-requirements-analyst': 'Detailed requirements specification document',
            'specification-sparc-coordinator': 'Phase coordination summary and next steps',
            'pseudocode-implementer-sparc-coder': 'Detailed pseudocode with algorithm analysis',
            'architecture-system-architect': 'Comprehensive system architecture design',
            'refinement-performance-engineer': 'Performance optimization recommendations',
            'completion-implementer-sparc-coder': 'Production-ready code implementation',
        };
        return outputMap[`${phase}-${agentType}`] || `${phase} phase deliverable`;
    }
    /**
     * Get required tools for each phase and agent.
     *
     * @param _phase
     * @param agentType
     */
    getRequiredTools(_phase, agentType) {
        const baseTools = ['file_operations', 'code_analysis', 'documentation'];
        const agentTools = {
            coder: [...baseTools, 'code_generation', 'testing'],
            'system-architect': [...baseTools, 'design_tools', 'modeling'],
            'performance-tester': [...baseTools, 'profiling', 'benchmarking'],
            'security-architect': [...baseTools, 'security_analysis', 'threat_modeling'],
            'unit-tester': [...baseTools, 'testing_frameworks', 'test_automation'],
            'requirements-engineer': [...baseTools, 'requirements_analysis'],
            documenter: [...baseTools, 'documentation_generators'],
            coordinator: [...baseTools, 'project_management', 'coordination'],
        };
        return agentTools[agentType] || baseTools;
    }
    /**
     * Get timeout for each phase in minutes.
     *
     * @param phase
     */
    getPhaseTimeout(phase) {
        const timeouts = {
            specification: 60, // 1 hour
            pseudocode: 90, // 1.5 hours
            architecture: 120, // 2 hours
            refinement: 90, // 1.5 hours
            completion: 180, // 3 hours
        };
        return timeouts[phase] || 60;
    }
    /**
     * Monitor SPARC swarm progress.
     *
     * @param projectId
     */
    async getSPARCSwarmStatus(projectId) {
        const swarmId = `sparc-${projectId}`;
        const tasks = this.activeSPARCSwarms.get(swarmId) || new Set();
        // Get task statuses from TaskAPI
        let completedTasks = 0;
        for (const taskId of tasks) {
            try {
                // Check if task is completed (in a real implementation, this would call TaskAPI)
                const taskStatus = await this.getTaskStatus(taskId);
                if (taskStatus === 'completed') {
                    completedTasks++;
                }
            }
            catch (error) {
                this.logger?.warn('Failed to get task status', { taskId, error: error.message });
            }
        }
        return {
            swarmId,
            activeTasks: tasks.size,
            completedTasks,
            phase: 'specification', // Would come from project state
            progress: tasks.size > 0 ? (completedTasks / tasks.size) * 100 : 0,
        };
    }
    /**
     * Terminate SPARC swarm and cleanup resources.
     *
     * @param projectId
     */
    async terminateSPARCSwarm(projectId) {
        const swarmId = `sparc-${projectId}`;
        const tasks = this.activeSPARCSwarms.get(swarmId);
        if (tasks) {
            // Cancel active tasks
            for (const taskId of tasks) {
                try {
                    await this.cancelTask(taskId);
                    this.logger?.info('SPARC task cancelled', { taskId, swarmId });
                }
                catch (error) {
                    this.logger?.warn('Failed to cancel SPARC task', { taskId, error: error.message });
                }
            }
            this.activeSPARCSwarms.delete(swarmId);
        }
    }
    /**
     * Get status of a specific task.
     *
     * @param _taskId
     */
    async getTaskStatus(_taskId) {
        // In a real implementation, this would call the TaskAPI
        // For now, return a mock status based on task age or other criteria
        return 'completed'; // Simplified implementation
    }
    /**
     * Cancel a specific task.
     *
     * @param taskId
     */
    async cancelTask(taskId) {
        // In a real implementation, this would call the TaskAPI to cancel the task
        this.logger?.debug('Task cancellation requested', { taskId });
    }
}
