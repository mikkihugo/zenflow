/**
 * @file Sparc processing engine.
 */
import type { ArtifactSet, CompletionValidation, PhaseResult, ProjectSpecification, RefinementFeedback, RefinementResult, SPARCEngine, SPARCPhase, SPARCProject } from '../types/sparc-types.ts';
export declare class SPARCEngineCore implements SPARCEngine {
    private readonly phaseDefinitions;
    private readonly activeProjects;
    private readonly phaseEngines;
    private readonly projectManagement;
    private readonly documentDrivenSystem;
    private readonly workflowEngine;
    private readonly swarmCoordinator;
    private readonly memorySystem;
    private readonly taskCoordinator;
    private readonly taskAPI;
    constructor();
    /**
     * Initialize phase engines for all SPARC phases.
     */
    private initializePhaseEngines;
    /**
     * Initialize a new SPARC project with comprehensive setup and infrastructure integration.
     *
     * @param projectSpec
     */
    initializeProject(projectSpec: ProjectSpecification): Promise<SPARCProject>;
    /**
     * Execute a specific SPARC phase with comprehensive validation.
     *
     * @param project
     * @param phase
     */
    executePhase(project: SPARCProject, phase: SPARCPhase): Promise<PhaseResult>;
    /**
     * Refine implementation based on feedback and metrics.
     *
     * @param project
     * @param feedback
     */
    refineImplementation(project: SPARCProject, feedback: RefinementFeedback): Promise<RefinementResult>;
    /**
     * Generate comprehensive artifact set for the project.
     *
     * @param project
     */
    generateArtifacts(project: SPARCProject): Promise<ArtifactSet>;
    /**
     * Validate project completion and production readiness.
     *
     * @param project
     */
    validateCompletion(project: SPARCProject): Promise<CompletionValidation>;
    private initializePhaseDefinitions;
    private executePhaseLogic;
    private createEmptySpecification;
    private createEmptyPseudocode;
    private createEmptyArchitecture;
    private createEmptyImplementation;
    private createInitialProgress;
    private calculateOverallProgress;
    private determineNextPhase;
    private generatePhaseRecommendations;
    private analyzePerformanceGaps;
    private generateRefinementStrategies;
    private calculateChecksum;
    /**
     * Create vision document for integration with DocumentDrivenSystem.
     *
     * @param project
     * @param spec
     */
    private createVisionDocument;
    /**
     * Execute existing document workflows using UnifiedWorkflowEngine.
     *
     * @param workspaceId
     * @param project
     */
    private executeDocumentWorkflows;
    /**
     * Generate all project management artifacts using existing infrastructure.
     *
     * @param project
     */
    private createAllProjectManagementArtifacts;
    /**
     * Create tasks from SPARC phases using existing TaskAPI.
     *
     * @param project
     */
    private createTasksFromSPARC;
    /**
     * Execute task using swarm coordination.
     *
     * @param _taskId
     * @param project
     * @param phase
     */
    private executeTaskWithSwarm;
    /**
     * Create ADR files using existing workspace structure.
     *
     * @param project
     */
    private createADRFilesWithWorkspace;
    /**
     * Save epics to workspace using existing document structure.
     *
     * @param project
     */
    private saveEpicsToWorkspace;
    /**
     * Save features from workspace using existing document structure.
     *
     * @param project
     */
    private saveFeaturesFromWorkspace;
    /**
     * Create epics from SPARC project phases.
     *
     * @param project
     */
    private createEpicsFromSPARC;
    /**
     * Create features from SPARC project.
     *
     * @param project
     */
    private createFeaturesFromSPARC;
    /**
     * Get SPARC project status for external monitoring.
     *
     * @param projectId
     */
    getSPARCProjectStatus(projectId: string): Promise<{
        project: SPARCProject | null;
        swarmStatus: any;
        infrastructureIntegration: {
            documentWorkflows: boolean;
            taskCoordination: boolean;
            memoryPersistence: boolean;
        };
    }>;
}
//# sourceMappingURL=sparc-engine.d.ts.map