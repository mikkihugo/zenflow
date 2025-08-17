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
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { getLogger } from '../config/logging-config';
const logger = getLogger('DocumentProcessor');
/**
 * Clean, focused document processor that consolidates file-based and database-driven approaches.
 *
 * @example
 */
export class DocumentProcessor extends EventEmitter {
    memory;
    workflowEngine; // Dynamic import to break circular dependency
    config;
    workspaces = new Map();
    documentWatchers = new Map();
    initialized = false;
    stats = {
        totalDocuments: 0,
        byType: {},
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
    constructor(memory, workflowEngine, config = {}) {
        super();
        this.memory = memory;
        this.workflowEngine = workflowEngine;
        this.config = {
            autoWatch: config?.autoWatch !== false,
            enableWorkflows: config?.enableWorkflows !== false,
            workspaceRoot: config?.workspaceRoot || './docs',
            documentDirs: {
                vision: config?.documentDirs?.vision || '01-vision',
                adrs: config?.documentDirs?.adrs || '02-adrs',
                prds: config?.documentDirs?.prds || '03-prds',
                epics: config?.documentDirs?.epics || '04-epics',
                features: config?.documentDirs?.features || '05-features',
                tasks: config?.documentDirs?.tasks || '06-tasks',
                specs: config?.documentDirs?.specs || '07-specs',
                ...config?.documentDirs,
            },
        };
        this.setupEventHandlers();
    }
    /**
     * Initialize the document processor.
     */
    async initialize() {
        if (this.initialized)
            return;
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
    async loadWorkspace(workspacePath) {
        const workspaceId = `workspace-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        // Create workspace structure
        const workspace = {
            root: workspacePath,
            vision: join(workspacePath, this.config.documentDirs.vision),
            adrs: join(workspacePath, this.config.documentDirs.adrs),
            prds: join(workspacePath, this.config.documentDirs.prds),
            epics: join(workspacePath, this.config.documentDirs.epics),
            features: join(workspacePath, this.config.documentDirs.features),
            tasks: join(workspacePath, this.config.documentDirs.tasks),
            specs: join(workspacePath, this.config.documentDirs.specs),
            implementation: join(workspacePath, 'src'),
        };
        // Create processing context
        const context = {
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
    async processDocument(documentPath, workspaceId) {
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
            const document = {
                type: docType,
                path: documentPath,
                content,
                metadata,
                id: this.generateDocumentId(docType, documentPath),
            };
            // Store in context
            context.activeDocuments.set(documentPath, document);
            // Store in memory system
            await this.memory.storeDocument(docType, document.id, document);
            // Update statistics
            this.updateStats(document);
            // Route to appropriate processor
            await this.processDocumentByType(workspaceId, document);
            // Trigger workflows if enabled
            if (this.config.enableWorkflows && this.workflowEngine) {
                try {
                    await this.workflowEngine.processDocumentEvent('document:created', document, {
                        workspaceId,
                    });
                }
                catch (error) {
                    logger.warn('Workflow processing failed:', error);
                }
            }
            this.emit('document:processed', {
                workspaceId,
                document,
                suggestedNextSteps: this.getSuggestedNextSteps(docType),
            });
        }
        catch (error) {
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
    async createDocument(type, title, content, workspaceId) {
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
    async getStats() {
        return { ...this.stats };
    }
    /**
     * Get all documents in a workspace.
     *
     * @param workspaceId - Workspace ID.
     * @returns Map of documents.
     */
    getWorkspaceDocuments(workspaceId) {
        const context = this.workspaces.get(workspaceId);
        return context ? context.activeDocuments : new Map();
    }
    /**
     * Get all workspace IDs.
     *
     * @returns Array of workspace IDs.
     */
    getWorkspaces() {
        return Array.from(this.workspaces.keys());
    }
    /**
     * Shutdown the document processor.
     */
    async shutdown() {
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
    setupEventHandlers() {
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
    async processDocumentByType(workspaceId, document) {
        const context = this.workspaces.get(workspaceId);
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
    async scanDocuments(workspaceId) {
        const context = this.workspaces.get(workspaceId);
        const dirs = Object.entries(context.workspace);
        for (const [type, dirPath] of dirs) {
            if (dirPath &&
                existsSync(dirPath) &&
                type !== 'root' &&
                type !== 'implementation') {
                try {
                    const files = await readdir(dirPath);
                    for (const file of files) {
                        if (file.endsWith('.md')) {
                            const fullPath = join(dirPath, file);
                            const docType = this.getDocumentType(fullPath);
                            const content = await readFile(fullPath, 'utf8');
                            const metadata = await this.extractMetadata(content);
                            const document = {
                                type: docType,
                                path: fullPath,
                                content,
                                metadata,
                                id: this.generateDocumentId(docType, fullPath),
                            };
                            context.activeDocuments.set(fullPath, document);
                            await this.memory.storeDocument(docType, document.id, document);
                            this.updateStats(document);
                        }
                    }
                }
                catch (error) {
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
    getDocumentType(path) {
        if (path.includes('/01-vision/') || path.includes('/vision/'))
            return 'vision';
        if (path.includes('/02-adrs/') || path.includes('/adrs/'))
            return 'adr';
        if (path.includes('/03-prds/') || path.includes('/prds/'))
            return 'prd';
        if (path.includes('/04-epics/') || path.includes('/epics/'))
            return 'epic';
        if (path.includes('/05-features/') || path.includes('/features/'))
            return 'feature';
        if (path.includes('/06-tasks/') || path.includes('/tasks/'))
            return 'task';
        if (path.includes('/07-specs/') || path.includes('/specs/'))
            return 'spec';
        return 'task'; // default
    }
    /**
     * Get document directory for a type.
     *
     * @param workspace
     * @param type
     */
    getDocumentDirectory(workspace, type) {
        switch (type) {
            case 'vision':
                return workspace.vision;
            case 'adr':
                return workspace.adrs;
            case 'prd':
                return workspace.prds;
            case 'epic':
                return workspace.epics;
            case 'feature':
                return workspace.features;
            case 'task':
                return workspace.tasks;
            case 'spec':
                return workspace.specs;
            default:
                return workspace.tasks;
        }
    }
    /**
     * Extract metadata from document content.
     *
     * @param content
     */
    async extractMetadata(content) {
        const metadata = {};
        // Parse frontmatter or inline metadata
        const lines = content.split('\n');
        for (const line of lines.slice(0, 15)) {
            // Check first 15 lines
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('- **Author:**') ||
                trimmedLine.startsWith('Author:')) {
                const author = trimmedLine.split(':')[1]?.trim();
                if (author)
                    metadata.author = author;
            }
            if (trimmedLine.startsWith('- **Created:**') ||
                trimmedLine.startsWith('Created:')) {
                const dateStr = trimmedLine.split(':')[1]?.trim();
                if (dateStr)
                    metadata.created = new Date(dateStr);
            }
            if (trimmedLine.startsWith('- **Status:**') ||
                trimmedLine.startsWith('Status:')) {
                const status = trimmedLine.split(':')[1]?.trim();
                if (status)
                    metadata.status = status;
            }
            if (trimmedLine.startsWith('- **Priority:**') ||
                trimmedLine.startsWith('Priority:')) {
                metadata.priority = trimmedLine.split(':')[1]?.trim();
            }
            if (trimmedLine.startsWith('- **Tags:**') ||
                trimmedLine.startsWith('Tags:')) {
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
    generateDocumentId(type, path) {
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
    generateDocumentContent(title, content, type) {
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
    getSuggestedNextSteps(documentType) {
        const nextSteps = {
            vision: [
                'Create PRDs',
                'Define stakeholder requirements',
                'Conduct stakeholder alignment',
            ],
            adr: [
                'Review architectural implications',
                'Update related PRDs',
                'Validate decisions',
            ],
            prd: [
                'Generate epics',
                'Create user stories',
                'Define acceptance criteria',
            ],
            epic: ['Break down into features', 'Estimate effort', 'Plan timeline'],
            feature: [
                'Create implementation tasks',
                'Define test cases',
                'Review dependencies',
            ],
            task: ['Begin implementation', 'Write tests', 'Update documentation'],
            spec: [
                'Review technical approach',
                'Validate with stakeholders',
                'Begin implementation',
            ],
        };
        return nextSteps[documentType] || [];
    }
    /**
     * Update processing statistics.
     *
     * @param document
     */
    updateStats(document) {
        this.stats.totalDocuments++;
        this.stats.byType[document.type] =
            (this.stats.byType[document.type] || 0) + 1;
        const status = document.metadata?.status || 'unknown';
        this.stats.byStatus[status] = (this.stats.byStatus[status] || 0) + 1;
    }
    /**
     * Ensure workspace directories exist.
     *
     * @param workspace
     */
    async ensureDirectories(workspace) {
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
                }
                catch (_error) {
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
    setupDocumentWatchers(workspaceId) {
        // Note: In a real implementation, this would use fs.watch or chokidar
        // For now, we'll just log that watchers would be set up
        logger.debug(`Document watchers would be set up for workspace: ${workspaceId}`);
    }
    /**
     * Ensure the processor is initialized.
     */
    async ensureInitialized() {
        if (!this.initialized) {
            await this.initialize();
        }
    }
    // ==================== EVENT HANDLERS ====================
    async handleDocumentCreated(event) {
        logger.debug(`Document created: ${event.document.path}`);
    }
    async handleDocumentUpdated(event) {
        logger.debug(`Document updated: ${event.document.path}`);
        // Re-process the document
        await this.processDocument(event.document.path, event.workspaceId);
    }
    async handleDocumentDeleted(event) {
        logger.debug(`Document deleted: ${event.path}`);
        const context = this.workspaces.get(event.workspaceId);
        if (context) {
            context.activeDocuments.delete(event.path);
        }
    }
}
//# sourceMappingURL=document-processor.js.map