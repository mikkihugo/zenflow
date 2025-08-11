/**
 * @file Coordination system: swarm-coordination-integration.
 */
import type { AgentType } from '../../../../types/agent-types.ts';
import type { SPARCPhase, SPARCProject } from '../types/sparc-types.ts';
export declare const SPARC_AGENT_TYPES: AgentType[];
export interface SPARCSwarmTask {
    sparcProjectId: string;
    phase: SPARCPhase;
    taskType: 'analysis' | 'design' | 'implementation' | 'testing' | 'documentation';
    agentType: AgentType;
    priority: 'low' | 'medium' | 'high' | 'critical';
    dependencies: string[];
    estimatedEffort: number;
}
/**
 * Coordinates SPARC development using existing swarm intelligence.
 *
 * @example
 */
export declare class SPARCSwarmCoordinator {
    private taskCoordinator;
    private taskAPI;
    private activeSPARCSwarms;
    private logger?;
    constructor(logger?: any);
    /**
     * Create a swarm for SPARC project development.
     *
     * @param project
     */
    initializeSPARCSwarm(project: SPARCProject): Promise<string>;
    /**
     * Execute SPARC phase using coordinated swarm.
     *
     * @param projectId
     * @param phase
     */
    executeSPARCPhase(projectId: string, phase: SPARCPhase): Promise<{
        success: boolean;
        results: Map<AgentType, any>;
    }>;
    /**
     * Get appropriate agents for each SPARC phase.
     *
     * @param phase
     */
    private getPhaseAgents;
    /**
     * Generate phase-specific prompts for agents.
     *
     * @param project
     * @param phase
     * @param agentType
     */
    private generatePhasePrompt;
    /**
     * Get expected output for each phase and agent combination.
     *
     * @param phase
     * @param agentType
     */
    private getPhaseExpectedOutput;
    /**
     * Get required tools for each phase and agent.
     *
     * @param _phase
     * @param agentType
     */
    private getRequiredTools;
    /**
     * Get timeout for each phase in minutes.
     *
     * @param phase
     */
    private getPhaseTimeout;
    /**
     * Monitor SPARC swarm progress.
     *
     * @param projectId
     */
    getSPARCSwarmStatus(projectId: string): Promise<{
        swarmId: string;
        activeTasks: number;
        completedTasks: number;
        phase: SPARCPhase;
        progress: number;
    }>;
    /**
     * Terminate SPARC swarm and cleanup resources.
     *
     * @param projectId
     */
    terminateSPARCSwarm(projectId: string): Promise<void>;
    /**
     * Get status of a specific task.
     *
     * @param _taskId
     */
    private getTaskStatus;
    /**
     * Cancel a specific task.
     *
     * @param taskId
     */
    private cancelTask;
}
//# sourceMappingURL=swarm-coordination-integration.d.ts.map