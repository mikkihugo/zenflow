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

import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { TypedEventBase } from '@claude-zen/foundation';
import { getLogger } from '@claude-zen/foundation'

const logger = getLogger('DocumentDriven');

// Document types in your workflow
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
  vision?: string; // vision/
  adrs?: string; // adrs/
  prds?: string; // prds/
  epics?: string; // epics/
  features?: string; // features/
  tasks?: string; // tasks/
  specs?: string; // specs/ (Maestro addition)
  implementation?: string; // src/
}

export interface WorkflowContext {
  workspace: DocumentWorkspace;
  activeDocuments: Map<string, VisionaryDocument>;
  maestroPhase?:
    | 'requirements'
    | 'research'
    | 'design'
    | 'planning'
    | 'execution'
    | 'validation';
  swarmSupport: boolean; // Background swarm assistance
}

export class DocumentDrivenSystem extends TypedEventBase {
  private workspaces: Map<string, WorkflowContext> = new Map();

  constructor() {
    super();
    this.setupDocumentHandlers();
  }

  /**
   * Initialize system - respects existing document structure.
   */
  async initialize(): Promise<void> {
    logger.info('🚀 Initializing Document-Driven Development System');

    logger.info('✅ Document-Driven System ready');
    this.emit('initialized', { timestamp: new Date() });
  }

  /**
   * Load existing workspace with documents.
   *
   * @param workspacePath
   */
  async loadWorkspace(workspacePath: string): Promise<string> {
    const workspaceId = `workspace-${Date.now()}`;

    const workspace: DocumentWorkspace = {
      root: workspacePath,
      vision: join(workspacePath, 'docs/01-vision'),
      adrs: join(workspacePath, 'docs/02-adrs'),
      prds: join(workspacePath, 'docs/03-prds'),
      epics: join(workspacePath, 'docs/04-epics'),
      features: join(workspacePath, 'docs/05-features'),
      tasks: join(workspacePath, 'docs/06-tasks'),
      specs: join(workspacePath, 'docs/07-specs'), // Maestro's specs
      implementation: join(workspacePath, 'src'),
    };

    const context: WorkflowContext = {
      workspace,
      activeDocuments: new Map(),
      swarmSupport: true,
    };

    this.workspaces.set(workspaceId, context);

    // Load existing documents
    await this.scanDocuments(workspaceId);

    // Setup document watchers for real-time updates
    this.setupDocumentWatchers(workspaceId);

    logger.info(`📁 Loaded workspace: ${workspacePath}`);
    this.emit('workspace:loaded', { workspaceId, path: workspacePath });

    return workspaceId;
  }

  /**
   * Process Visionary document with optional structured approach.
   *
   * @param workspaceId
   * @param docPath
   */
  async processVisionaryDocument(
    workspaceId: string,
    docPath: string
  ): Promise<void> {
    const context = this.workspaces.get(workspaceId);
    if (!context) throw new Error(`Workspace ${workspaceId} not found`);

    const docType = this.getDocumentType(docPath);
    const content = await readFile(docPath, 'utf8');

    logger.info(`📄 Processing ${docType} document: ${docPath}`);

    const doc: VisionaryDocument = {
      type: docType,
      path: docPath,
      content,
      metadata: await this.extractMetadata(content),
    };

    context.activeDocuments.set(docPath, doc);

    // Route to appropriate processor based on document type
    switch (docType) {
      case 'vision':
        await this.processVisionDocument(workspaceId, doc);
        break;
      case 'adr':
        await this.processADR(workspaceId, doc);
        break;
      case 'prd':
        await this.processPRD(workspaceId, doc);
        break;
      case 'epic':
        await this.processEpic(workspaceId, doc);
        break;
      case 'feature':
        await this.processFeature(workspaceId, doc);
        break;
      case 'task':
        await this.processTask(workspaceId, doc);
        break;
    }

    this.emit('document:created', {
      workspaceId,
      path: docPath,
      type: docType,
      document: doc,
    });
  }

  /**
   * Process Vision document - top level strategic document.
   *
   * @param workspaceId
   * @param doc
   */
  private async processVisionDocument(
    workspaceId: string,
    doc: VisionaryDocument
  ): Promise<void> {
    logger.info('🔮 Processing Vision document');

    // Emit event for workflow processing
    this.emit('document:processed', {
      workspaceId,
      document: doc,
      suggestedNextSteps: ['Create ADRs', 'Create PRDs'],
    });
  }

  /**
   * Process ADR (Architecture Decision Record).
   *
   * @param workspaceId
   * @param doc.
   * @param doc
   */
  private async processADR(
    workspaceId: string,
    doc: VisionaryDocument
  ): Promise<void> {
    logger.info('📐 Processing ADR document');

    this.emit('document:processed', {
      workspaceId,
      document: doc,
      suggestedNextSteps: ['Review architecture', 'Update related PRDs'],
    });
  }

  /**
   * Process PRD with structured approach.
   *
   * @param workspaceId
   * @param doc
   */
  private async processPRD(
    workspaceId: string,
    doc: VisionaryDocument
  ): Promise<void> {
    const context = this.workspaces.get(workspaceId)!;

    logger.info('📋 Processing PRD document');

    // Set phase for structured processing
    context.maestroPhase = 'requirements';

    this.emit('document:processed', {
      workspaceId,
      document: doc,
      suggestedNextSteps: ['Generate epics', 'Create user stories'],
    });
  }

  /**
   * Process Epic document.
   *
   * @param workspaceId
   * @param doc
   */
  private async processEpic(
    workspaceId: string,
    doc: VisionaryDocument
  ): Promise<void> {
    logger.info('🏔️ Processing Epic document');

    this.emit('document:processed', {
      workspaceId,
      document: doc,
      suggestedNextSteps: ['Break down into features'],
    });
  }

  /**
   * Process Feature document.
   *
   * @param workspaceId
   * @param doc
   */
  private async processFeature(
    workspaceId: string,
    doc: VisionaryDocument
  ): Promise<void> {
    const context = this.workspaces.get(workspaceId)!;

    logger.info('⭐ Processing Feature document');

    // Set planning phase
    context.maestroPhase = 'planning';

    this.emit('document:processed', {
      workspaceId,
      document: doc,
      suggestedNextSteps: ['Create implementation tasks'],
    });
  }

  /**
   * Process Task document - ready for implementation.
   *
   * @param workspaceId
   * @param doc
   */
  private async processTask(
    workspaceId: string,
    doc: VisionaryDocument
  ): Promise<void> {
    const context = this.workspaces.get(workspaceId)!;

    logger.info('✅ Processing Task document');

    // Set execution phase
    context.maestroPhase = 'execution';

    this.emit('document:processed', {
      workspaceId,
      document: doc,
      suggestedNextSteps: ['Generate implementation code'],
    });
  }

  /**
   * Scan workspace for existing documents.
   *
   * @param workspaceId
   */
  private async scanDocuments(workspaceId: string): Promise<void> {
    const context = this.workspaces.get(workspaceId)!;
    const dirs = Object.entries(context.workspace);

    for (const [type, path] of dirs) {
      if (
        path &&
        existsSync(path) &&
        type !== 'root' &&
        type !== 'implementation'
      ) {
        try {
          const files = await readdir(path);
          for (const file of files) {
            if (file.endsWith('.md')) {
              const fullPath = join(path, file);
              const docType = this.getDocumentType(fullPath);
              const content = await readFile(fullPath, 'utf8');

              context.activeDocuments.set(fullPath, {
                type: docType,
                path: fullPath,
                content,
                metadata: await this.extractMetadata(content),
              });
            }
          }
        } catch (error) {
          logger.warn(`Failed to scan directory ${path}:`, error);
        }
      }
    }

    logger.info(`📚 Loaded ${context.activeDocuments.size} documents`);
  }

  /**
   * Determine document type from path.
   *
   * @param path
   */
  private getDocumentType(path: string): VisionaryDocument['type'] {
    if (path.includes('/01-vision/') || path.includes('/vision/'))
      return 'vision';
    if (path.includes('/02-adrs/') || path.includes('/adrs/')) return 'adr';
    if (path.includes('/03-prds/') || path.includes('/prds/')) return 'prd';
    if (path.includes('/04-epics/') || path.includes('/epics/')) return 'epic';
    if (path.includes('/05-features/') || path.includes('/features/'))
      return 'feature';
    if (path.includes('/06-tasks/') || path.includes('/tasks/')) return 'task';
    if (path.includes('/07-specs/') || path.includes('/specs/')) return 'spec';
    return 'task'; // default
  }

  /**
   * Extract metadata from document content.
   *
   * @param content
   */
  private async extractMetadata(content: string): Promise<unknown> {
    // Parse frontmatter or other metadata
    const metadata: unknown = {};

    // Simple extraction - would be more sophisticated
    const lines = content.split('\n');
    for (const line of lines.slice(0, 10)) {
      if (line.startsWith('Author:'))
        metadata.author = line.substring(7).trim();
      if (line.startsWith('Created:'))
        metadata.created = new Date(line.substring(8).trim());
      if (line.startsWith('Status:'))
        metadata.status = line.substring(7).trim();
      if (line.startsWith('Related:')) {
        metadata.relatedDocs = line
          .substring(8)
          .trim()
          .split(',')
          .map((s) => s.trim());
      }
    }

    return metadata;
  }

  /**
   * Setup file watchers for document changes.
   *
   * @param _workspaceId
   */
  private setupDocumentWatchers(_workspaceId: string): void {
    // Would implement file watching here
    logger.debug('Document watchers would be set up here');
  }

  /**
   * Setup document processing handlers.
   */
  private setupDocumentHandlers(): void {
    this.on('document:created', this.handleDocumentCreated.bind(this));
    this.on('document:updated', this.handleDocumentUpdated.bind(this));
    this.on('document:deleted', this.handleDocumentDeleted.bind(this));
  }

  private async handleDocumentCreated(event: any): Promise<void> {
    logger.debug(`Document created: ${event.path}`);
    await this.processVisionaryDocument(event.workspaceId, event.path);
  }

  private async handleDocumentUpdated(event: any): Promise<void> {
    logger.debug(`Document updated: ${event.path}`);
    await this.processVisionaryDocument(event.workspaceId, event.path);
  }

  private async handleDocumentDeleted(event: any): Promise<void> {
    logger.debug(`Document deleted: ${event.path}`);
    const context = this.workspaces.get(event.workspaceId);
    if (context) {
      context.activeDocuments.delete(event.path);
    }
  }

  /**
   * Get workspace documents.
   *
   * @param workspaceId
   */
  getWorkspaceDocuments(workspaceId: string): Map<string, VisionaryDocument> {
    const context = this.workspaces.get(workspaceId);
    return context ? context.activeDocuments : new Map();
  }

  /**
   * Get all workspaces.
   */
  getWorkspaces(): string[] {
    return Array.from(this.workspaces.keys());
  }
}

// Export singleton instance
export const documentDrivenSystem = new DocumentDrivenSystem();
