/**
 * Document Processor - Unified Document Processing System.
 *
 * Clean, focused document processor that consolidates DocumentDrivenSystem and DatabaseDrivenSystem
 * into a single, coherent document processing system. Handles Vision → ADRs → PRDs → Epics → Features → Tasks → Code.
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

import { EventEmitter } from 'node:events';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import type { BaseDocumentEntity } from '../database/entities/document-entities';
import { createLogger } from './logger';
import type { MemorySystem } from './memory-system';
import type { WorkflowEngine } from './workflow-engine';

const logger = createLogger('DocumentProcessor');

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
export class DocumentProcessor extends EventEmitter {
  private memory: MemorySystem;
  private workflowEngine: WorkflowEngine;
  private config: Required<DocumentProcessorConfig>;
  private workspaces: Map<string, ProcessingContext> = new Map();
  private documentWatchers: Map<string, any> = new Map();
  private initialized = false;
  private stats: DocumentStats = {
    totalDocuments: 0,
    byType: {} as Record<DocumentType, number>,
    byStatus: {},
    errors: 0,
  };

  /**
   * Create a new document processor.
   *
   * @param memory - Memory system for persistence.
   * @param workflowEngine - Workflow engine for processing.
   * @param config - Configuration options.
   */
  constructor(
    memory: MemorySystem,
    workflowEngine: WorkflowEngine,
    config: DocumentProcessorConfig = {}
  ) {
    super();
    this.memory = memory;
    this.workflowEngine = workflowEngine;
    this.config = {
      autoWatch: config.autoWatch !== false,
      enableWorkflows: config.enableWorkflows !== false,
      workspaceRoot: config.workspaceRoot || './docs',
      documentDirs: {
        vision: config.documentDirs?.vision || '01-vision',
        adrs: config.documentDirs?.adrs || '02-adrs',
        prds: config.documentDirs?.prds || '03-prds',
        epics: config.documentDirs?.epics || '04-epics',
        features: config.documentDirs?.features || '05-features',
        tasks: config.documentDirs?.tasks || '06-tasks',
        specs: config.documentDirs?.specs || '07-specs',
        ...config.documentDirs,
      },
    };

    this.setupEventHandlers();
  }

  /**
   * Initialize the document processor.
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    logger.info('Initializing document processor');

    // Initialize default workspace if workspace root exists
    if (existsSync(this.config.workspaceRoot)) {
      await this.loadWorkspace(this.config.workspaceRoot);
    }

    this.initialized = true;
    this.emit('initialized');
    logger.info('Document processor ready');
  }

  /**
   * Load or create a document workspace.
   *
   * @param workspacePath - Path to the workspace root.
   * @returns Workspace ID.
   */
  async loadWorkspace(workspacePath: string): Promise<string> {
    const workspaceId = `workspace-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    // Create workspace structure
    const workspace: DocumentWorkspace = {
      root: workspacePath,
      vision: join(workspacePath, this.config.documentDirs.vision!),
      adrs: join(workspacePath, this.config.documentDirs.adrs!),
      prds: join(workspacePath, this.config.documentDirs.prds!),
      epics: join(workspacePath, this.config.documentDirs.epics!),
      features: join(workspacePath, this.config.documentDirs.features!),
      tasks: join(workspacePath, this.config.documentDirs.tasks!),
      specs: join(workspacePath, this.config.documentDirs.specs!),
      implementation: join(workspacePath, 'src'),
    };

    // Create processing context
    const context: ProcessingContext = {
      workspace,
      activeDocuments: new Map(),
      backgroundProcessing: this.config.enableWorkflows,
    };

    this.workspaces.set(workspaceId, context);

    // Create directories if they don't exist
    await this.ensureDirectories(workspace);

    // Load existing documents
    await this.scanDocuments(workspaceId);

    // Setup file watchers if enabled
    if (this.config.autoWatch) {
      this.setupDocumentWatchers(workspaceId);
    }

    logger.info(`Loaded workspace: ${workspacePath} (${context.activeDocuments.size} documents)`);
    this.emit('workspace:loaded', {
      workspaceId,
      path: workspacePath,
      documentCount: context.activeDocuments.size,
    });

    return workspaceId;
  }

  /**
   * Process a document file.
   *
   * @param documentPath - Path to the document file.
   * @param workspaceId - Optional workspace ID (uses default if not provided).
   */
  async processDocument(documentPath: string, workspaceId?: string): Promise<void> {
    await this.ensureInitialized();

    // Find or create workspace
    if (!workspaceId) {
      workspaceId = Array.from(this.workspaces.keys())[0];
      if (!workspaceId) {
        workspaceId = await this.loadWorkspace(dirname(documentPath));
      }
    }

    const context = this.workspaces.get(workspaceId);
    if (!context) {
      throw new Error(`Workspace not found: ${workspaceId}`);
    }

    try {
      const docType = this.getDocumentType(documentPath);
      const content = await readFile(documentPath, 'utf8');
      const metadata = await this.extractMetadata(content);

      logger.info(`Processing ${docType} document: ${documentPath}`);

      const document: Document = {
        type: docType,
        path: documentPath,
        content,
        metadata,
        id: this.generateDocumentId(docType, documentPath),
      };

      // Store in context
      context.activeDocuments.set(documentPath, document);

      // Store in memory system
      await this.memory.storeDocument(docType, document.id!, document);

      // Update statistics
      this.updateStats(document);

      // Route to appropriate processor
      await this.processDocumentByType(workspaceId, document);

      // Trigger workflows if enabled
      if (this.config.enableWorkflows) {
        await this.workflowEngine.processDocumentEvent(
          'document:created',
          document as unknown as BaseDocumentEntity,
          {
            workspaceId,
          } as any
        );
      }

      this.emit('document:processed', {
        workspaceId,
        document,
        suggestedNextSteps: this.getSuggestedNextSteps(docType),
      });
    } catch (error) {
      this.stats.errors++;
      logger.error(`Failed to process document ${documentPath}:`, error);
      throw error;
    }
  }

  /**
   * Create a new document from template.
   *
   * @param type - Document type.
   * @param title - Document title.
   * @param content - Document content.
   * @param workspaceId - Workspace ID.
   * @returns Created document.
   */
  async createDocument(
    type: DocumentType,
    title: string,
    content: string,
    workspaceId?: string
  ): Promise<Document> {
    await this.ensureInitialized();

    if (!workspaceId) {
      workspaceId = Array.from(this.workspaces.keys())[0];
      if (!workspaceId) {
        throw new Error('No workspace available. Load a workspace first.');
      }
    }

    const context = this.workspaces.get(workspaceId);
    if (!context) {
      throw new Error(`Workspace not found: ${workspaceId}`);
    }

    // Generate file path
    const dirPath = this.getDocumentDirectory(context.workspace, type);
    const fileName = `${title.toLowerCase().replace(/\s+/g, '-')}.md`;
    const filePath = join(dirPath, fileName);

    // Create document content with metadata
    const documentContent = this.generateDocumentContent(title, content, type);

    // Write file
    await writeFile(filePath, documentContent, 'utf8');

    // Process the created document
    await this.processDocument(filePath, workspaceId);

    const document = context.activeDocuments.get(filePath);
    if (!document) {
      throw new Error('Failed to create document');
    }

    logger.info(`Created ${type} document: ${title}`);
    return document;
  }

  /**
   * Get document processor statistics.
   *
   * @returns Current statistics.
   */
  async getStats(): Promise<DocumentStats> {
    return { ...this.stats };
  }

  /**
   * Get all documents in a workspace.
   *
   * @param workspaceId - Workspace ID.
   * @returns Map of documents.
   */
  getWorkspaceDocuments(workspaceId: string): Map<string, Document> {
    const context = this.workspaces.get(workspaceId);
    return context ? context.activeDocuments : new Map();
  }

  /**
   * Get all workspace IDs.
   *
   * @returns Array of workspace IDs.
   */
  getWorkspaces(): string[] {
    return Array.from(this.workspaces.keys());
  }

  /**
   * Shutdown the document processor.
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down document processor...');

    // Stop all file watchers
    for (const [_id, watcher] of this.documentWatchers) {
      if (watcher && typeof watcher.close === 'function') {
        watcher.close();
      }
    }
    this.documentWatchers.clear();

    // Clear workspaces
    this.workspaces.clear();

    this.removeAllListeners();
    logger.info('Document processor shutdown complete');
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Setup event handlers.
   */
  private setupEventHandlers(): void {
    this.on('document:created', this.handleDocumentCreated.bind(this));
    this.on('document:updated', this.handleDocumentUpdated.bind(this));
    this.on('document:deleted', this.handleDocumentDeleted.bind(this));
  }

  /**
   * Process document based on its type.
   *
   * @param workspaceId
   * @param document
   */
  private async processDocumentByType(workspaceId: string, document: Document): Promise<void> {
    const context = this.workspaces.get(workspaceId)!;

    switch (document.type) {
      case 'vision':
        context.phase = 'requirements';
        logger.info('🔮 Processing Vision document');
        break;
      case 'adr':
        logger.info('📐 Processing ADR document');
        break;
      case 'prd':
        context.phase = 'design';
        logger.info('📋 Processing PRD document');
        break;
      case 'epic':
        context.phase = 'planning';
        logger.info('🏔️ Processing Epic document');
        break;
      case 'feature':
        context.phase = 'planning';
        logger.info('⭐ Processing Feature document');
        break;
      case 'task':
        context.phase = 'execution';
        logger.info('✅ Processing Task document');
        break;
      case 'spec':
        logger.info('📄 Processing Spec document');
        break;
    }
  }

  /**
   * Scan workspace for existing documents.
   *
   * @param workspaceId
   */
  private async scanDocuments(workspaceId: string): Promise<void> {
    const context = this.workspaces.get(workspaceId)!;
    const dirs = Object.entries(context.workspace);

    for (const [type, dirPath] of dirs) {
      if (dirPath && existsSync(dirPath) && type !== 'root' && type !== 'implementation') {
        try {
          const files = await readdir(dirPath);
          for (const file of files) {
            if (file.endsWith('.md')) {
              const fullPath = join(dirPath, file);
              const docType = this.getDocumentType(fullPath);
              const content = await readFile(fullPath, 'utf8');
              const metadata = await this.extractMetadata(content);

              const document: Document = {
                type: docType,
                path: fullPath,
                content,
                metadata,
                id: this.generateDocumentId(docType, fullPath),
              };

              context.activeDocuments.set(fullPath, document);
              await this.memory.storeDocument(docType, document.id!, document);
              this.updateStats(document);
            }
          }
        } catch (error) {
          logger.warn(`Failed to scan directory ${dirPath}:`, error);
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
  private getDocumentType(path: string): DocumentType {
    if (path.includes('/01-vision/') || path.includes('/vision/')) return 'vision';
    if (path.includes('/02-adrs/') || path.includes('/adrs/')) return 'adr';
    if (path.includes('/03-prds/') || path.includes('/prds/')) return 'prd';
    if (path.includes('/04-epics/') || path.includes('/epics/')) return 'epic';
    if (path.includes('/05-features/') || path.includes('/features/')) return 'feature';
    if (path.includes('/06-tasks/') || path.includes('/tasks/')) return 'task';
    if (path.includes('/07-specs/') || path.includes('/specs/')) return 'spec';
    return 'task'; // default
  }

  /**
   * Get document directory for a type.
   *
   * @param workspace
   * @param type
   */
  private getDocumentDirectory(workspace: DocumentWorkspace, type: DocumentType): string {
    switch (type) {
      case 'vision':
        return workspace.vision!;
      case 'adr':
        return workspace.adrs!;
      case 'prd':
        return workspace.prds!;
      case 'epic':
        return workspace.epics!;
      case 'feature':
        return workspace.features!;
      case 'task':
        return workspace.tasks!;
      case 'spec':
        return workspace.specs!;
      default:
        return workspace.tasks!;
    }
  }

  /**
   * Extract metadata from document content.
   *
   * @param content
   */
  private async extractMetadata(content: string): Promise<DocumentMetadata> {
    const metadata: DocumentMetadata = {};

    // Parse frontmatter or inline metadata
    const lines = content.split('\n');
    for (const line of lines.slice(0, 15)) {
      // Check first 15 lines
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith('- **Author:**') || trimmedLine.startsWith('Author:')) {
        const author = trimmedLine.split(':')[1]?.trim();
        if (author) metadata.author = author;
      }
      if (trimmedLine.startsWith('- **Created:**') || trimmedLine.startsWith('Created:')) {
        const dateStr = trimmedLine.split(':')[1]?.trim();
        if (dateStr) metadata.created = new Date(dateStr);
      }
      if (trimmedLine.startsWith('- **Status:**') || trimmedLine.startsWith('Status:')) {
        const status = trimmedLine.split(':')[1]?.trim();
        if (status) metadata.status = status;
      }
      if (trimmedLine.startsWith('- **Priority:**') || trimmedLine.startsWith('Priority:')) {
        metadata.priority = trimmedLine.split(':')[1]?.trim() as any;
      }
      if (trimmedLine.startsWith('- **Tags:**') || trimmedLine.startsWith('Tags:')) {
        const tagsStr = trimmedLine.split(':')[1]?.trim();
        if (tagsStr) {
          metadata.tags = tagsStr.split(',').map((tag) => tag.trim());
        }
      }
    }

    return metadata;
  }

  /**
   * Generate unique document ID.
   *
   * @param type
   * @param path
   */
  private generateDocumentId(type: DocumentType, path: string): string {
    const filename = basename(path, '.md');
    const timestamp = Date.now().toString(36);
    return `${type}-${filename}-${timestamp}`;
  }

  /**
   * Generate document content with metadata header.
   *
   * @param title
   * @param content
   * @param type
   */
  private generateDocumentContent(title: string, content: string, type: DocumentType): string {
    const now = new Date().toISOString();

    return `# ${title}

- **Type:** ${type}
- **Created:** ${now}
- **Status:** draft
- **Priority:** medium

${content}

---
*Generated by Document Processor*`;
  }

  /**
   * Get suggested next steps for document type.
   *
   * @param documentType
   */
  private getSuggestedNextSteps(documentType: DocumentType): string[] {
    const nextSteps = {
      vision: ['Generate ADRs', 'Create PRDs', 'Define stakeholder requirements'],
      adr: ['Review architectural implications', 'Update related PRDs', 'Validate decisions'],
      prd: ['Generate epics', 'Create user stories', 'Define acceptance criteria'],
      epic: ['Break down into features', 'Estimate effort', 'Plan timeline'],
      feature: ['Create implementation tasks', 'Define test cases', 'Review dependencies'],
      task: ['Begin implementation', 'Write tests', 'Update documentation'],
      spec: ['Review technical approach', 'Validate with stakeholders', 'Begin implementation'],
    };
    return nextSteps[documentType] || [];
  }

  /**
   * Update processing statistics.
   *
   * @param document
   */
  private updateStats(document: Document): void {
    this.stats.totalDocuments++;
    this.stats.byType[document.type] = (this.stats.byType[document.type] || 0) + 1;

    const status = document.metadata?.status || 'unknown';
    this.stats.byStatus[status] = (this.stats.byStatus[status] || 0) + 1;
  }

  /**
   * Ensure workspace directories exist.
   *
   * @param workspace
   */
  private async ensureDirectories(workspace: DocumentWorkspace): Promise<void> {
    const dirs = [
      workspace.vision,
      workspace.adrs,
      workspace.prds,
      workspace.epics,
      workspace.features,
      workspace.tasks,
      workspace.specs,
      workspace.implementation,
    ];

    for (const dir of dirs) {
      if (dir) {
        try {
          await mkdir(dir, { recursive: true });
        } catch (_error) {
          // Directory might already exist, that's ok
        }
      }
    }
  }

  /**
   * Setup file watchers for document changes.
   *
   * @param workspaceId
   */
  private setupDocumentWatchers(workspaceId: string): void {
    // Note: In a real implementation, this would use fs.watch or chokidar
    // For now, we'll just log that watchers would be set up
    logger.debug(`Document watchers would be set up for workspace: ${workspaceId}`);
  }

  /**
   * Ensure the processor is initialized.
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  // ==================== EVENT HANDLERS ====================

  private async handleDocumentCreated(event: any): Promise<void> {
    logger.debug(`Document created: ${event.document.path}`);
  }

  private async handleDocumentUpdated(event: any): Promise<void> {
    logger.debug(`Document updated: ${event.document.path}`);
    // Re-process the document
    await this.processDocument(event.document.path, event.workspaceId);
  }

  private async handleDocumentDeleted(event: any): Promise<void> {
    logger.debug(`Document deleted: ${event.path}`);
    const context = this.workspaces.get(event.workspaceId);
    if (context) {
      context.activeDocuments.delete(event.path);
    }
  }
}
