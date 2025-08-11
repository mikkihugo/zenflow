/**
 * Document-Driven Development System - HIVE SYSTEM CORE.
 *
 * The focused hive system that works with existing document workflows:
 * - Vision → ADRs → PRDs → Epics → Features → Tasks → Code
 * - Background swarm assistance (hidden but available)
 * - Maestro integration where it adds value to document workflow
 * - Respects existing document structure and process.
 */
/**
 * @file Document-driven-system implementation.
 */
import { EventEmitter } from 'node:events';
export interface VisionaryDocument {
    type: 'vision' | 'adr' | 'prd' | 'epic' | 'feature' | 'task' | 'spec';
    path: string;
    content?: string;
    metadata?: {
        author?: string;
        created?: Date;
        updated?: Date;
        status?: string;
        relatedDocs?: string[];
    };
}
export interface DocumentWorkspace {
    root: string;
    vision?: string;
    adrs?: string;
    prds?: string;
    epics?: string;
    features?: string;
    tasks?: string;
    specs?: string;
    implementation?: string;
}
export interface WorkflowContext {
    workspace: DocumentWorkspace;
    activeDocuments: Map<string, VisionaryDocument>;
    maestroPhase?: 'requirements' | 'research' | 'design' | 'planning' | 'execution' | 'validation';
    swarmSupport: boolean;
}
export declare class DocumentDrivenSystem extends EventEmitter {
    private workspaces;
    constructor();
    /**
     * Initialize system - respects existing document structure.
     */
    initialize(): Promise<void>;
    /**
     * Load existing workspace with documents.
     *
     * @param workspacePath
     */
    loadWorkspace(workspacePath: string): Promise<string>;
    /**
     * Process Visionary document with optional structured approach.
     *
     * @param workspaceId
     * @param docPath
     */
    processVisionaryDocument(workspaceId: string, docPath: string): Promise<void>;
    /**
     * Process Vision document - top level strategic document.
     *
     * @param workspaceId
     * @param doc
     */
    private processVisionDocument;
    /**
     * Process ADR (Architecture Decision Record).
     *
     * @param workspaceId
     * @param doc.
     * @param doc
     */
    private processADR;
    /**
     * Process PRD with structured approach.
     *
     * @param workspaceId
     * @param doc
     */
    private processPRD;
    /**
     * Process Epic document.
     *
     * @param workspaceId
     * @param doc
     */
    private processEpic;
    /**
     * Process Feature document.
     *
     * @param workspaceId
     * @param doc
     */
    private processFeature;
    /**
     * Process Task document - ready for implementation.
     *
     * @param workspaceId
     * @param doc
     */
    private processTask;
    /**
     * Scan workspace for existing documents.
     *
     * @param workspaceId
     */
    private scanDocuments;
    /**
     * Determine document type from path.
     *
     * @param path
     */
    private getDocumentType;
    /**
     * Extract metadata from document content.
     *
     * @param content
     */
    private extractMetadata;
    /**
     * Setup file watchers for document changes.
     *
     * @param _workspaceId
     */
    private setupDocumentWatchers;
    /**
     * Setup document processing handlers.
     */
    private setupDocumentHandlers;
    private handleDocumentCreated;
    private handleDocumentUpdated;
    private handleDocumentDeleted;
    /**
     * Get workspace documents.
     *
     * @param workspaceId
     */
    getWorkspaceDocuments(workspaceId: string): Map<string, VisionaryDocument>;
    /**
     * Get all workspaces.
     */
    getWorkspaces(): string[];
}
export declare const documentDrivenSystem: DocumentDrivenSystem;
//# sourceMappingURL=document-driven-system.d.ts.map