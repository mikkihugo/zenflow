/**
 * Database-Driven Development System.
 *
 * REPLACES file-based DocumentDrivenSystem with pure database architecture
 * Handles Vision → ADRs → PRDs → Epics → Features → Tasks → Code via database entities.
 * Integrates with existing DatabaseCoordinator and UnifiedWorkflowEngine.
 */
/**
 * @file Database-driven-system implementation.
 */
import { EventEmitter } from 'node:events';
import type { BaseDocumentEntity, ProductProjectEntity, VisionDocumentEntity } from '../database/entities/product-entities.ts';
import type { DocumentManager } from '../database/managers/document-manager.ts';
import type { DocumentType } from '../types/workflow-types.ts';
import type { WorkflowEngine } from './workflow-engine.ts';
export interface DatabaseWorkspaceContext {
    workspaceId: string;
    projectId: string;
    activeDocuments: Map<string, BaseDocumentEntity>;
    workflowEngine: WorkflowEngine;
    documentService: DocumentManager;
}
export interface DocumentProcessingOptions {
    autoGenerateRelationships?: boolean;
    startWorkflows?: boolean;
    generateSearchIndex?: boolean;
    notifyListeners?: boolean;
}
/**
 * Database-Driven Development System.
 *
 * Pure database operations - NO file system interactions.
 * All documents are database entities with export capabilities.
 *
 * @example
 */
export declare class DatabaseDrivenSystem extends EventEmitter {
    private workspaces;
    private documentService;
    private workflowEngine;
    constructor(documentService: DocumentManager, workflowEngine: WorkflowEngine);
    /**
     * Initialize database-driven system.
     */
    initialize(): Promise<void>;
    /**
     * Create new project workspace.
     *
     * @param projectSpec
     * @param projectSpec.name
     * @param projectSpec.domain
     * @param projectSpec.description
     * @param projectSpec.complexity
     * @param projectSpec.author
     */
    createProjectWorkspace(projectSpec: {
        name: string;
        domain: string;
        description: string;
        complexity?: 'simple' | 'moderate' | 'complex' | 'enterprise';
        author: string;
    }): Promise<string>;
    /**
     * Load existing project workspace.
     *
     * @param projectId
     */
    loadProjectWorkspace(projectId: string): Promise<string>;
    /**
     * Process document entity with database-driven workflow.
     *
     * @param workspaceId
     * @param document
     * @param options
     */
    processDocumentEntity(workspaceId: string, document: BaseDocumentEntity, options?: DocumentProcessingOptions): Promise<void>;
    /**
     * Create vision document for project.
     *
     * @param workspaceId
     * @param visionSpec
     * @param visionSpec.title
     * @param visionSpec.businessObjectives
     * @param visionSpec.successCriteria
     * @param visionSpec.stakeholders
     * @param visionSpec.timeline
     * @param visionSpec.timeline.start_date
     * @param visionSpec.timeline.target_completion
     * @param visionSpec.timeline.milestones
     * @param options
     */
    createVisionDocument(workspaceId: string, visionSpec: {
        title: string;
        businessObjectives: string[];
        successCriteria: string[];
        stakeholders: string[];
        timeline?: {
            start_date?: Date;
            target_completion?: Date;
            milestones?: Array<{
                name: string;
                date: Date;
                description: string;
            }>;
        };
    }, options?: DocumentProcessingOptions): Promise<VisionDocumentEntity>;
    /**
     * Generate documents from existing documents (e.g., PRDs from Vision).
     *
     * @param workspaceId
     * @param sourceDocumentId
     * @param targetType
     * @param options
     */
    generateDocumentsFromSource(workspaceId: string, sourceDocumentId: string, targetType: DocumentType, options?: DocumentProcessingOptions): Promise<BaseDocumentEntity[]>;
    /**
     * Get workspace status and progress.
     *
     * @param workspaceId
     */
    getWorkspaceStatus(workspaceId: string): Promise<{
        workspace: DatabaseWorkspaceContext;
        project: ProductProjectEntity;
        documents: {
            total: number;
            byType: Record<string, number>;
            byStatus: Record<string, number>;
        };
        progress: {
            overall: number;
            byPhase: Record<string, number>;
        };
    }>;
    /**
     * Export workspace documents to files (optional capability).
     *
     * @param workspaceId
     * @param outputPath
     * @param _format
     */
    exportWorkspaceToFiles(workspaceId: string, outputPath: string, _format?: 'markdown' | 'json'): Promise<string[]>;
    private setupEventHandlers;
    private handleDocumentProcessed;
    private handleWorkspaceCreated;
    private handleWorkspaceLoaded;
    private getSuggestedNextSteps;
    private generateVisionContent;
    private generatePRDsFromVision;
    private generateEpicsFromPRD;
    private generateFeaturesFromEpic;
    private generateTasksFromFeature;
    private calculatePhaseProgress;
    /**
     * Get all workspaces.
     */
    getWorkspaces(): string[];
    /**
     * Get workspace documents (legacy compatibility).
     *
     * @param workspaceId
     */
    getWorkspaceDocuments(workspaceId: string): Map<string, BaseDocumentEntity>;
}
export declare function createDatabaseDrivenSystem(documentService: DocumentManager, workflowEngine: WorkflowEngine): DatabaseDrivenSystem;
//# sourceMappingURL=database-driven-system.d.ts.map