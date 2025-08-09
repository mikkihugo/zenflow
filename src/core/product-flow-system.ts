/**
 * Product Flow System - RENAMED from document-driven-system.ts.
 *
 * MISSION ACCOMPLISHED: Clean Product Flow naming
 * - Product Flow System orchestrates Vision → ADRs → PRDs → Epics → Features → Tasks → Code
 * - SPARC methodology applied as implementation tool WITHIN Features/Tasks
 * - Clear naming: Product Flow = WHAT, SPARC = HOW.
 */

import { EventEmitter } from 'node:events';
import { nanoid } from 'nanoid';
import type { ProductWorkflowEngine } from '../coordination/orchestration/product-workflow-engine';
import type { DocumentManager } from '../database/managers/document-manager';
import { createLogger } from './logger';

const logger = createLogger('ProductFlowSystem');

/**
 * Product Flow System - Main orchestrator for business workflow.
 *
 * Coordinates the complete Product Flow with SPARC integration:
 * Vision → ADRs → PRDs → Epics → Features (+ SPARC) → Tasks (+ SPARC) → Code.
 *
 * @example
 */
export class ProductFlowSystem extends EventEmitter {
  private workflowEngine: ProductWorkflowEngine;
  private documentService: DocumentManager;
  private activeWorkspaces = new Map<string, string>();

  constructor(workflowEngine: ProductWorkflowEngine, documentService: DocumentManager) {
    super();
    this.workflowEngine = workflowEngine;
    this.documentService = documentService;
  }

  async initialize(): Promise<void> {
    logger.info('Initializing Product Flow System');

    await this.workflowEngine.initialize();
    await this.documentService.initialize();

    this.emit('initialized');
    logger.info('Product Flow System ready');
  }

  /**
   * Process a visionary document and trigger complete Product Flow.
   *
   * @param workspaceId
   * @param docPath
   */
  async processVisionaryDocument(workspaceId: string, docPath: string): Promise<void> {
    logger.info(`🚀 Processing visionary document: ${docPath}`);

    try {
      // Start complete Product Flow workflow
      const result = await this.workflowEngine.startProductWorkflow('complete-product-flow', {
        workspaceId,
        variables: { visionDocPath: docPath },
      });

      if (result.success && result.workflowId) {
        logger.info(`✅ Product Flow workflow started: ${result.workflowId}`);
        this.emit('product-flow:started', { workflowId: result.workflowId, docPath });
      }
    } catch (error) {
      logger.error(`❌ Failed to process visionary document ${docPath}:`, error);
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

    logger.info(`📁 Loaded Product Flow workspace: ${workspaceId} at ${workspacePath}`);
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
    const activeWorkflows = await this.workflowEngine.getActiveProductWorkflows();

    return {
      workspaceId,
      path,
      activeWorkflows: activeWorkflows.length,
      sparcIntegration: true, // Always enabled in Product Flow System
    };
  }
}
