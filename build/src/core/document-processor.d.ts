/**
 * Document Processor - Unified Document Processing System.
 *
 * Clean, focused document processor that consolidates DocumentDrivenSystem and DatabaseDrivenSystem.
 * Into a single, coherent document processing system. Handles Vision → PRDs → Epics → Features → Tasks → Code.
 * ADRs are independent architectural governance documents that constrain and guide implementation..
 *
 * @example
 * ```typescript
 * const processor = new DocumentProcessor(memorySystem, workflowEngine, {
 *   autoWatch: true,
 *   enableWorkflows: true
 * });
 *
 * await processor.initialize();
 * await processor.processDocument('./docs/vision/product-vision.md');
 * ```
 */
/**
 * @file Document-processor implementation.
 */
import { EventEmitter } from 'node:events';
import type { MemorySystem } from './memory-system.ts';
import type { WorkflowEngine } from './workflow-engine.ts';
/**
 * Document types in the processing workflow.
 */
export type DocumentType = 'vision' | 'adr' | 'prd' | 'epic' | 'feature' | 'task' | 'spec';
/**
 * Document processing configuration.
 *
 * @example
 */
export interface DocumentProcessorConfig {
    /** Enable automatic file watching */
    autoWatch?: boolean;
    /** Enable workflow processing */
    enableWorkflows?: boolean;
    /** Workspace root directory */
    workspaceRoot?: string;
    /** Document directory structure */
    documentDirs?: {
        vision?: string;
        adrs?: string;
        prds?: string;
        epics?: string;
        features?: string;
        tasks?: string;
        specs?: string;
    };
}
/**
 * Document metadata.
 *
 * @example
 */
export interface DocumentMetadata {
    /** Document author */
    author?: string;
    /** Creation date */
    created?: Date;
    /** Last updated date */
    updated?: Date;
    /** Document status */
    status?: string;
    /** Related documents */
    relatedDocs?: string[];
    /** Document tags */
    tags?: string[];
    /** Document priority */
    priority?: 'low' | 'medium' | 'high';
}
/**
 * Document representation.
 *
 * @example
 */
export interface Document {
    /** Document type */
    type: DocumentType;
    /** File path */
    path: string;
    /** Document content */
    content?: string;
    /** Document metadata */
    metadata?: DocumentMetadata;
    /** Unique document ID */
    id?: string;
}
/**
 * Workspace structure for document organization.
 *
 * @example
 */
export interface DocumentWorkspace {
    /** Workspace root directory */
    root: string;
    /** Vision documents directory */
    vision?: string;
    /** ADR documents directory */
    adrs?: string;
    /** PRD documents directory */
    prds?: string;
    /** Epic documents directory */
    epics?: string;
    /** Feature documents directory */
    features?: string;
    /** Task documents directory */
    tasks?: string;
    /** Spec documents directory */
    specs?: string;
    /** Implementation directory */
    implementation?: string;
}
/**
 * Document processing context.
 *
 * @example
 */
export interface ProcessingContext {
    /** Workspace configuration */
    workspace: DocumentWorkspace;
    /** Active documents */
    activeDocuments: Map<string, Document>;
    /** Current processing phase */
    phase?: 'requirements' | 'design' | 'planning' | 'execution' | 'validation';
    /** Enable background processing */
    backgroundProcessing: boolean;
}
/**
 * Document processor statistics.
 *
 * @example
 */
export interface DocumentStats {
    /** Total documents processed */
    totalDocuments: number;
    /** Documents by type */
    byType: Record<DocumentType, number>;
    /** Documents by status */
    byStatus: Record<string, number>;
    /** Processing errors */
    errors: number;
}
/**
 * Clean, focused document processor that consolidates file-based and database-driven approaches.
 *
 * @example
 */
export declare class DocumentProcessor extends EventEmitter {
    private memory;
    private workflowEngine;
    private config;
    private workspaces;
    private documentWatchers;
    private initialized;
    private stats;
    /**
     * Create a new document processor.
     *
     * @param memory - Memory system for persistence.
     * @param workflowEngine - Workflow engine for processing.
     * @param config - Configuration options.
     */
    constructor(memory: MemorySystem, workflowEngine: WorkflowEngine, config?: DocumentProcessorConfig);
    /**
     * Initialize the document processor.
     */
    initialize(): Promise<void>;
    /**
     * Load or create a document workspace.
     *
     * @param workspacePath - Path to the workspace root.
     * @returns Workspace ID.
     */
    loadWorkspace(workspacePath: string): Promise<string>;
    /**
     * Process a document file.
     *
     * @param documentPath - Path to the document file.
     * @param workspaceId - Optional workspace ID (uses default if not provided).
     */
    processDocument(documentPath: string, workspaceId?: string): Promise<void>;
    /**
     * Create a new document from template.
     *
     * @param type - Document type.
     * @param title - Document title.
     * @param content - Document content.
     * @param workspaceId - Workspace ID.
     * @returns Created document.
     */
    createDocument(type: DocumentType, title: string, content: string, workspaceId?: string): Promise<Document>;
    /**
     * Get document processor statistics.
     *
     * @returns Current statistics.
     */
    getStats(): Promise<DocumentStats>;
    /**
     * Get all documents in a workspace.
     *
     * @param workspaceId - Workspace ID.
     * @returns Map of documents.
     */
    getWorkspaceDocuments(workspaceId: string): Map<string, Document>;
    /**
     * Get all workspace IDs.
     *
     * @returns Array of workspace IDs.
     */
    getWorkspaces(): string[];
    /**
     * Shutdown the document processor.
     */
    shutdown(): Promise<void>;
    /**
     * Setup event handlers.
     */
    private setupEventHandlers;
    /**
     * Process document based on its type.
     *
     * @param workspaceId
     * @param document
     */
    private processDocumentByType;
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
     * Get document directory for a type.
     *
     * @param workspace
     * @param type
     */
    private getDocumentDirectory;
    /**
     * Extract metadata from document content.
     *
     * @param content
     */
    private extractMetadata;
    /**
     * Generate unique document ID.
     *
     * @param type
     * @param path
     */
    private generateDocumentId;
    /**
     * Generate document content with metadata header.
     *
     * @param title
     * @param content
     * @param type
     */
    private generateDocumentContent;
    /**
     * Get suggested next steps for document type.
     *
     * @param documentType
     */
    private getSuggestedNextSteps;
    /**
     * Update processing statistics.
     *
     * @param document
     */
    private updateStats;
    /**
     * Ensure workspace directories exist.
     *
     * @param workspace
     */
    private ensureDirectories;
    /**
     * Setup file watchers for document changes.
     *
     * @param workspaceId
     */
    private setupDocumentWatchers;
    /**
     * Ensure the processor is initialized.
     */
    private ensureInitialized;
    private handleDocumentCreated;
    private handleDocumentUpdated;
    private handleDocumentDeleted;
}
//# sourceMappingURL=document-processor.d.ts.map