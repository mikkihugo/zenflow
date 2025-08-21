/**
 * Document Workflow System - Orchestrates document-based development workflows.
 *
 * Provides systematic document workflow coordination:
 * - Document Workflow System orchestrates Vision → ADRs → PRDs → Epics → Features → Tasks → Code
 * - SPARC methodology applied as implementation tool WITHIN Features/Tasks.
 * - Clear naming: Document Workflow = WHAT, SPARC = HOW.
 */
/**
 * @file Document-workflow-system implementation.
 */

import { EventEmitter } from 'eventemitter3';
import { nanoid } from 'nanoid';

import { getLogger } from '@claude-zen/foundation'
import type { DocumentManager } from "../services/document/document-service"

const logger = getLogger('DocumentWorkflowSystem');

/**
 * Document Workflow System - Main orchestrator for document-based development workflows.
 *
 * Coordinates the complete Document Workflow with SPARC integration:
 * Vision → ADRs → PRDs → Epics → Features (+ SPARC) → Tasks (+ SPARC) → Code.
 *
 * @example
 */
export class DocumentWorkflowSystem extends EventEmitter {
  private workflowEngine: ProductWorkflowEngine;
  private documentService: DocumentManager;
  private activeWorkspaces = new Map<string, string>();

  constructor(
    workflowEngine: ProductWorkflowEngine,
    documentService: DocumentManager
  ) {
    super();
    this.workflowEngine = workflowEngine;
    this.documentService = documentService;
  }

  async initialize(): Promise<void> {
    logger.info('Initializing Document Workflow System');

    await this.workflowEngine.initialize();
    await this.documentService.initialize();

    this.emit('initialized');
    logger.info('Document Workflow System ready');
  }

  /**
   * Process a visionary document and trigger complete Product Flow.
   *
   * @param workspaceId
   * @param docPath
   */
  async processVisionaryDocument(
    workspaceId: string,
    docPath: string
  ): Promise<void> {
    logger.info(`🚀 Processing visionary document: ${docPath}`);

    try {
      // Start complete Product Flow workflow
      const result = await this.workflowEngine.startProductWorkflow(
        'complete-product-flow',
        {
          workspaceId,
          variables: { visionDocPath: docPath },
        }
      );

      if (result?.success && result?.workflowId) {
        logger.info(`✅ Product Flow workflow started: ${result?.workflowId}`);
        this.emit('product-flow:started', {
          workflowId: result?.workflowId,
          docPath,
        });
      }
    } catch (error) {
      logger.error(
        `❌ Failed to process visionary document ${docPath}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Load workspace for Product Flow operations.
   *
   * @param workspacePath
   */
  async loadWorkspace(workspacePath: string): Promise<string> {
    const workspaceId = nanoid();
    this.activeWorkspaces.set(workspaceId, workspacePath);

    logger.info(
      `📁 Loaded Product Flow workspace: ${workspaceId} at ${workspacePath}`
    );
    return workspaceId;
  }

  /**
   * Get workspace status and metrics.
   *
   * @param workspaceId
   */
  async getWorkspaceStatus(workspaceId: string): Promise<{
    workspaceId: string;
    path?: string | undefined;
    activeWorkflows: number;
    sparcIntegration: boolean;
  }> {
    const path = this.activeWorkspaces.get(workspaceId);
    const activeWorkflows =
      await this.workflowEngine.getActiveProductWorkflows();

    return {
      workspaceId,
      path,
      activeWorkflows: activeWorkflows.length,
      sparcIntegration: true, // Always enabled in Product Flow System
    };
  }
}
