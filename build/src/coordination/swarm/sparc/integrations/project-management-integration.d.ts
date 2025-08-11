/**
 * @file Coordination system: project-management-integration.
 */
import { MemorySystem } from '../../../../core/memory-system.ts';
import type { WorkflowEngine } from '../../../../core/workflow-engine.ts';
import type { SPARCProject } from '../types/sparc-types.ts';
export interface Task {
    id: string;
    title: string;
    component: string;
    description: string;
    status: 'todo' | 'in_progress' | 'completed' | 'blocked';
    priority: number;
    estimated_hours: number;
    actual_hours: number | null;
    dependencies: string[];
    acceptance_criteria: string[];
    notes: string;
    assigned_to: string;
    created_date: string;
    completed_date: string | null;
    sparc_project_id?: string;
}
export interface ADR {
    id: string;
    title: string;
    status: 'proposed' | 'accepted' | 'deprecated' | 'superseded';
    context: string;
    decision: string;
    consequences: string[];
    date: string;
    sparc_project_id?: string;
    phase: 'specification' | 'architecture' | 'refinement' | 'completion';
}
export interface PRD {
    id: string;
    title: string;
    version: string;
    overview: string;
    objectives: string[];
    success_metrics: string[];
    user_stories: UserStory[];
    functional_requirements: string[];
    non_functional_requirements: string[];
    constraints: string[];
    dependencies: string[];
    timeline: string;
    stakeholders: string[];
    sparc_project_id?: string;
}
export interface UserStory {
    id: string;
    title: string;
    description: string;
    acceptance_criteria: string[];
    priority: 'high' | 'medium' | 'low';
    effort_estimate: number;
}
export interface Feature {
    id: string;
    title: string;
    description: string;
    epic_id?: string;
    user_stories: string[];
    status: 'backlog' | 'planned' | 'in_progress' | 'completed';
    sparc_project_id?: string;
}
export interface Epic {
    id: string;
    title: string;
    description: string;
    features: string[];
    business_value: string;
    timeline: {
        start_date: string;
        end_date: string;
    };
    status: 'draft' | 'approved' | 'in_progress' | 'completed';
    sparc_project_id?: string;
}
export interface RoadmapItem {
    id: string;
    title: string;
    description: string;
    type: 'epic' | 'feature' | 'initiative';
    quarter: string;
    effort_estimate: number;
    business_value: 'high' | 'medium' | 'low';
    dependencies: string[];
    status: 'planned' | 'in_progress' | 'completed' | 'blocked';
    sparc_project_id?: string;
}
export interface Roadmap {
    id: string;
    title: string;
    description: string;
    timeframe: {
        start_quarter: string;
        end_quarter: string;
    };
    items: RoadmapItem[];
    last_updated: string;
}
/**
 * Project Management Integration Service.
 *
 * Integrates SPARC methodology with existing Claude-Zen infrastructure:
 * - Uses existing TaskAPI and EnhancedTaskTool for task management
 * - Integrates with TaskDistributionEngine for task coordination
 * - Leverages existing ADR infrastructure.
 * - Extends existing tasks.json format.
 *
 * @example
 */
export declare class ProjectManagementIntegration {
    private readonly projectRoot;
    private readonly tasksFile;
    private readonly adrDir;
    private readonly prdDir;
    private readonly featuresFile;
    private readonly epicsFile;
    private readonly roadmapFile;
    private readonly taskTool;
    private readonly taskDistributor;
    private readonly logger?;
    private documentDrivenSystem;
    private workflowEngine;
    private memorySystem;
    constructor(projectRoot?: string, workflowEngine?: WorkflowEngine, memorySystem?: MemorySystem, logger?: any);
    /**
     * Initialize sophisticated infrastructure integration.
     */
    initialize(): Promise<void>;
    /**
     * Enhanced comprehensive project management artifacts using existing infrastructure.
     *
     * @param project
     * @param artifactTypes
     */
    createAllProjectManagementArtifacts(project: SPARCProject, artifactTypes?: string[]): Promise<{
        tasks: Task[];
        adrs: ADR[];
        prd: PRD;
        epics: Epic[];
        features: Feature[];
        workspaceId: string;
        workflowResults: any;
    }>;
    /**
     * Create vision document from SPARC project using DocumentDrivenSystem patterns.
     *
     * @param project
     * @param _workspaceId
     */
    private createVisionDocumentFromSPARC;
    /**
     * Execute document workflows using UnifiedWorkflowEngine.
     *
     * @param workspaceId
     * @param visionDocument
     * @param visionDocument.path
     * @param visionDocument.content
     */
    private executeDocumentWorkflows;
    /**
     * Generate tasks from SPARC project using existing task infrastructure.
     *
     * @param project
     */
    generateTasksFromSPARC(project: SPARCProject): Promise<Task[]>;
    /**
     * Update existing tasks with SPARC project information using TaskAPI.
     *
     * @param project
     */
    updateTasksWithSPARC(project: SPARCProject): Promise<void>;
    /**
     * Create tasks using enhanced task distribution engine.
     *
     * @param project
     */
    distributeTasksWithCoordination(project: SPARCProject): Promise<void>;
    /**
     * Generate ADR from SPARC architecture decisions.
     *
     * @param project
     */
    generateADRFromSPARC(project: SPARCProject): Promise<ADR[]>;
    /**
     * Generate PRD from SPARC specification.
     *
     * @param project
     */
    generatePRDFromSPARC(project: SPARCProject): Promise<PRD>;
    private generatePhasePrompt;
    private getOptimalAgentForPhase;
    private getPhaseExpectedOutput;
    private getPhaseTools;
    private getPhasePriority;
    private getPhaseTimeout;
    private convertPriorityToNumber;
    private convertNumberToPriority;
    private generateEpicDescription;
    private calculateBusinessValue;
    private calculateEpicEndDate;
    private generateFeaturesFromPhases;
    private generateFeaturesFromRequirements;
    private getFeatureStatusFromProject;
    /**
     * Create ADR files from SPARC project using existing template structure.
     *
     * @param project
     */
    createADRFiles(project: SPARCProject): Promise<void>;
    /**
     * Create PRD file from SPARC project with enhanced integration.
     *
     * @param project
     */
    createPRDFile(project: SPARCProject): Promise<void>;
    /**
     * Create or update epics file from SPARC project.
     *
     * @param project
     */
    createEpicsFromSPARC(project: SPARCProject): Promise<Epic[]>;
    /**
     * Create or update features file from SPARC project.
     *
     * @param project
     */
    createFeaturesFromSPARC(project: SPARCProject): Promise<Feature[]>;
    /**
     * Create comprehensive project management artifacts.
     *
     * @param project
     * @param phase
     */
    private getPhaseDescription;
    private getPhaseEstimatedHours;
    private getPhaseAcceptanceCriteria;
    private formatArchitectureDecision;
    private extractArchitectureConsequences;
    private generateUserStoriesFromRequirements;
    private calculateProjectTimeline;
    private formatADRContent;
    private formatPRDContent;
    /**
     * Enhanced ADR creation using existing template structure and workspace management.
     *
     * @param adrs
     * @param workspaceId
     */
    createADRFilesWithWorkspace(adrs: ADR[], workspaceId: string): Promise<string[]>;
    /**
     * Save epics to workspace using document-driven system.
     *
     * @param epics
     * @param workspaceId
     */
    saveEpicsToWorkspace(epics: Epic[], workspaceId: string): Promise<void>;
    /**
     * Save features to workspace using document-driven system.
     *
     * @param features
     * @param workspaceId
     */
    saveFeaturesFromWorkspace(features: Feature[], workspaceId: string): Promise<void>;
}
//# sourceMappingURL=project-management-integration.d.ts.map