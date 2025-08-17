/**
 * @file Database-driven SPARC coordination integration.
 */
/**
 * SPARC Database-Driven Coordination Integration.
 *
 * Integrates SPARC methodology with database-driven coordination for SwarmCommander:
 * - Database entities for real-time agent coordination
 * - TaskAPI & TaskCoordinator for swarm task distribution
 * - Memory system for persistent coordination state
 * - NO file operations - pure database coordination
 */
import { MemorySystem } from '../../../../core/memory-system';
import { CoordinationDao } from '../../../../database/dao/coordination.dao';
import type { Task as DatabaseTask } from '../../../../database/entities/product-entities';
import type { SPARCProject } from '../types/sparc-types';
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
/**
 * Database-Driven SPARC Coordination Service.
 *
 * Coordinates SPARC methodology with database-driven swarm management:
 * - TaskAPI and TaskCoordinator for real-time task distribution
 * - Database entities for persistent coordination state
 * - Memory system for cross-session coordination
 * - SwarmCommander integration for agent assignment
 *
 * @example
 * const coordination = new ProjectManagementIntegration();
 * await coordination.updateDatabaseWithSPARC(project);
 * const tasks = await coordination.getTasksForSwarmAssignment();
 */
export declare class ProjectManagementIntegration {
    private readonly taskTool;
    private readonly memorySystem;
    private readonly coordinationDao;
    private readonly logger?;
    constructor(memorySystem?: MemorySystem, coordinationDao?: CoordinationDao<any>, logger?: unknown);
    /**
     * Database-driven SPARC coordination for SwarmCommander.
     *
     * Updates database entities with SPARC context for real-time agent coordination.
     * No file operations - pure database coordination for swarm task assignment.
     *
     * @param project SPARC project to integrate
     * @param coordinationOptions Configuration for coordination behavior
     */
    updateDatabaseWithSPARC(project: SPARCProject, coordinationOptions?: {
        updateTasks?: boolean;
        createEpicFeatures?: boolean;
        enableMemoryStorage?: boolean;
    }): Promise<{
        tasksUpdated: number;
        entitiesCreated: number;
        coordinationMemoryKeys: string[];
    }>;
    /**
     * Get tasks ready for SwarmCommander assignment.
     *
     * Queries database for tasks with SPARC metadata for agent coordination.
     */
    getTasksForSwarmAssignment(filters?: {
        sparcProjectId?: string;
        domain?: string;
        phase?: string;
        status?: string;
    }): Promise<DatabaseTask[]>;
    /**
     * Updates existing tasks with SPARC project metadata in database.
     */
    private updateTasksWithSPARCMetadata;
    /**
     * Creates database entities (Features, Epics) from SPARC project.
     */
    private createDatabaseEntitiesFromSPARC;
    /**
     * Store coordination state in memory system for cross-session persistence.
     */
    private storeCoordinationInMemory;
    updateTasksWithSPARC(project: SPARCProject): Promise<void>;
    createADRFiles(project: SPARCProject): Promise<void>;
    createPRDFile(project: SPARCProject): Promise<void>;
    /**
     * Generate tasks from SPARC project for coordination.
     */
    private generateTasksFromSPARC;
    /**
     * Generate tasks for a specific SPARC phase.
     */
    private generateTasksForPhase;
    /**
     * Generate Features from SPARC project.
     */
    private createFeaturesFromSPARC;
    /**
     * Generate ADRs from SPARC project.
     */
    private generateADRFromSPARC;
    /**
     * Generate PRD from SPARC project.
     */
    private generatePRDFromSPARC;
    /**
     * Format ADR content for storage.
     */
    private formatADRContent;
    /**
     * Format PRD content for storage.
     */
    private formatPRDContent;
    private mapSPARCStatusToTaskStatus;
    private mapSPARCStatusToFeatureStatus;
    private mapSPARCStatusToEpicStatus;
    private calculateTaskPriority;
    private estimateTaskHours;
    private getTaskDependencies;
    private extractBusinessValue;
}
//# sourceMappingURL=project-management-integration.d.ts.map