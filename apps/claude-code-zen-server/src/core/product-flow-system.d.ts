/**
 * Product Flow System - RENAMED from document-driven-system.ts.
 *
 * MISSION ACCOMPLISHED: Clean Product Flow naming
 * - Product Flow System orchestrates Vision → ADRs → PRDs → Epics → Features → Tasks → Code
 * - SPARC methodology applied as implementation tool WITHIN Features/Tasks.
 * - Clear naming: Product Flow = WHAT, SPARC = HOW.
 */
/**
 * @file Product-flow-system implementation.
 */
import { EventEmitter } from 'node:events';
import type { DocumentManager } from "../services/document/document-service";
/**
 * Product Flow System - Main orchestrator for business workflow.
 *
 * Coordinates the complete Product Flow with SPARC integration:
 * Vision → ADRs → PRDs → Epics → Features (+ SPARC) → Tasks (+ SPARC) → Code.
 *
 * @example
 */
export declare class ProductFlowSystem extends EventEmitter {
    private workflowEngine;
    private documentService;
    private activeWorkspaces;
    constructor(workflowEngine: ProductWorkflowEngine, documentService: DocumentManager);
    initialize(): Promise<void>;
    /**
     * Process a visionary document and trigger complete Product Flow.
     *
     * @param workspaceId
     * @param docPath
     */
    processVisionaryDocument(workspaceId: string, docPath: string): Promise<void>;
    /**
     * Load workspace for Product Flow operations.
     *
     * @param workspacePath
     */
    loadWorkspace(workspacePath: string): Promise<string>;
    /**
     * Get workspace status and metrics.
     *
     * @param workspaceId
     */
    getWorkspaceStatus(workspaceId: string): Promise<{
        workspaceId: string;
        path?: string | undefined;
        activeWorkflows: number;
        sparcIntegration: boolean;
    }>;
}
//# sourceMappingURL=product-flow-system.d.ts.map