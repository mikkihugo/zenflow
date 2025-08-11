/**
 * SPARC-Enabled Swarm Coordinator.
 *
 * Integrates SPARC methodology into swarm coordination for implementing.
 * Features and Tasks from the database-driven product flow.
 *
 * Architecture:
 * 1. Receives Features/Tasks from DatabaseDrivenSystem
 * 2. Applies SPARC methodology (Specification → Pseudocode → Architecture → Refinement → Completion)
 * 3. Coordinates agents to implement each SPARC phase
 * 4. Returns completed implementation artifacts.
 */
/**
 * @file sparc-swarm coordination system
 */
import type { FeatureDocumentEntity, TaskDocumentEntity } from '../../../database/entities/product-entities.ts';
import type { SPARCPhase } from '../sparc/types/sparc-types.ts';
import { SwarmCoordinator, type SwarmMetrics } from './swarm-coordinator.ts';
export interface SPARCTask {
    id: string;
    type: 'feature' | 'task';
    sourceDocument: FeatureDocumentEntity | TaskDocumentEntity;
    currentPhase: SPARCPhase;
    phaseProgress: Record<SPARCPhase, SPARCPhaseResult>;
    assignedAgents: Record<SPARCPhase, string[]>;
    status: 'not_started' | 'in_progress' | 'completed' | 'failed';
    priority: 'low' | 'medium' | 'high' | 'critical';
}
export interface SPARCPhaseResult {
    phase: SPARCPhase;
    status: 'not_started' | 'in_progress' | 'completed' | 'failed';
    artifacts: string[];
    metrics: {
        startTime?: Date;
        endTime?: Date;
        agentsInvolved: string[];
        iterationsCount: number;
    };
    validation: {
        passed: boolean;
        score: number;
        feedback: string[];
    };
}
export interface SPARCAgentCapabilities {
    sparcPhases: SPARCPhase[];
    specialization: 'specification' | 'architecture' | 'implementation' | 'testing' | 'general';
    domainExpertise: string[];
}
export interface SPARCSwarmMetrics extends SwarmMetrics {
    sparcTasksTotal: number;
    sparcTasksCompleted: number;
    phaseMetrics: Record<SPARCPhase, {
        tasksProcessed: number;
        averageCompletionTime: number;
        successRate: number;
    }>;
    averageSparcCycleTime: number;
}
/**
 * SPARC-Enhanced Swarm Coordinator.
 *
 * Coordinates swarm agents using SPARC methodology for implementing.
 * database-driven Features and Tasks.
 *
 * @example
 */
export declare class SPARCSwarmCoordinator extends SwarmCoordinator {
    private sparcTasks;
    private sparcMetrics;
    constructor();
    /**
     * Process a Feature using SPARC methodology.
     *
     * @param feature
     */
    processFeatureWithSPARC(feature: FeatureDocumentEntity): Promise<SPARCTask>;
    /**
     * Process a Task using SPARC methodology.
     *
     * @param task
     */
    processTaskWithSPARC(task: TaskDocumentEntity): Promise<SPARCTask>;
    /**
     * Execute complete SPARC cycle for a task.
     *
     * @param sparcTask
     */
    private startSPARCCycle;
    /**
     * Execute a specific SPARC phase using specialized agents.
     *
     * @param sparcTask
     * @param phase
     */
    private executeSPARCPhase;
    /**
     * Execute Specification Phase.
     *
     * @param sparcTask
     * @param agents
     */
    private executeSpecificationPhase;
    /**
     * Execute Pseudocode Phase.
     *
     * @param sparcTask
     * @param agents
     */
    private executePseudocodePhase;
    /**
     * Execute Architecture Phase.
     *
     * @param sparcTask
     * @param agents
     */
    private executeArchitecturePhase;
    /**
     * Execute Refinement Phase.
     *
     * @param sparcTask
     * @param agents
     */
    private executeRefinementPhase;
    /**
     * Execute Completion Phase.
     *
     * @param sparcTask
     * @param agents
     */
    private executeCompletionPhase;
    /**
     * Select specialized agents for a SPARC phase.
     *
     * @param phase
     * @param sparcTask
     * @param _sparcTask
     */
    private selectPhaseAgents;
    /**
     * Get agent types specialized for each SPARC phase.
     *
     * @param phase
     */
    private getPhaseSpecialists;
    /**
     * Validate completion of a SPARC phase.
     *
     * @param sparcTask
     * @param phase
     */
    private validatePhaseCompletion;
    /**
     * Retry a failed SPARC phase.
     *
     * @param sparcTask
     * @param phase
     */
    private retryPhase;
    /**
     * Get SPARC-specific metrics.
     */
    getSPARCMetrics(): SPARCSwarmMetrics;
    /**
     * Get all active SPARC tasks.
     */
    getActiveSPARCTasks(): SPARCTask[];
    /**
     * Get SPARC task by ID.
     *
     * @param taskId
     */
    getSPARCTask(taskId: string): SPARCTask | undefined;
    private setupSPARCEventHandlers;
    private handlePhaseCompleted;
    private handleCycleCompleted;
    private initializePhaseProgress;
    private initializePhaseAgents;
    private initializePhaseMetrics;
    private mapPriority;
    private getPriorityValue;
    private updatePhaseMetrics;
    private updateAverageSparcCycleTime;
    private getDefaultMetrics;
    /**
     * Assign a task to a specific agent.
     *
     * @param agentId
     * @param task
     */
    private assignTaskToAgent;
}
//# sourceMappingURL=sparc-swarm-coordinator.d.ts.map