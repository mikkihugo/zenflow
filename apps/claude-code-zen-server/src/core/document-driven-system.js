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
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getLogger } from '../config/logging-config';
const logger = getLogger('DocumentDriven');
export class DocumentDrivenSystem extends EventEmitter {
    workspaces = new Map();
    constructor() {
        super();
        this.setupDocumentHandlers();
    }
    /**
     * Initialize system - respects existing document structure.
     */
    async initialize() {
        logger.info('🚀 Initializing Document-Driven Development System');
        logger.info('✅ Document-Driven System ready');
        this.emit('initialized');
    }
    /**
     * Load existing workspace with documents.
     *
     * @param workspacePath
     */
    async loadWorkspace(workspacePath) {
        const workspaceId = `workspace-${Date.now()}`;
        const workspace = {
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
        const context = {
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
    async processVisionaryDocument(workspaceId, docPath) {
        const context = this.workspaces.get(workspaceId);
        if (!context)
            throw new Error(`Workspace ${workspaceId} not found`);
        const docType = this.getDocumentType(docPath);
        const content = await readFile(docPath, 'utf8');
        logger.info(`📄 Processing ${docType} document: ${docPath}`);
        const doc = {
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
    async processVisionDocument(workspaceId, doc) {
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
    async processADR(workspaceId, doc) {
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
    async processPRD(workspaceId, doc) {
        const context = this.workspaces.get(workspaceId);
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
    async processEpic(workspaceId, doc) {
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
    async processFeature(workspaceId, doc) {
        const context = this.workspaces.get(workspaceId);
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
    async processTask(workspaceId, doc) {
        const context = this.workspaces.get(workspaceId);
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
    async scanDocuments(workspaceId) {
        const context = this.workspaces.get(workspaceId);
        const dirs = Object.entries(context.workspace);
        for (const [type, path] of dirs) {
            if (path &&
                existsSync(path) &&
                type !== 'root' &&
                type !== 'implementation') {
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
                }
                catch (error) {
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
     * Extract metadata from document content.
     *
     * @param content
     */
    async extractMetadata(content) {
        // Parse frontmatter or other metadata
        const metadata = {};
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
    setupDocumentWatchers(_workspaceId) {
        // Would implement file watching here
        logger.debug('Document watchers would be set up here');
    }
    /**
     * Setup document processing handlers.
     */
    setupDocumentHandlers() {
        this.on('document:created', this.handleDocumentCreated.bind(this));
        this.on('document:updated', this.handleDocumentUpdated.bind(this));
        this.on('document:deleted', this.handleDocumentDeleted.bind(this));
    }
    async handleDocumentCreated(event) {
        logger.debug(`Document created: ${event.path}`);
        await this.processVisionaryDocument(event.workspaceId, event.path);
    }
    async handleDocumentUpdated(event) {
        logger.debug(`Document updated: ${event.path}`);
        await this.processVisionaryDocument(event.workspaceId, event.path);
    }
    async handleDocumentDeleted(event) {
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
    getWorkspaceDocuments(workspaceId) {
        const context = this.workspaces.get(workspaceId);
        return context ? context.activeDocuments : new Map();
    }
    /**
     * Get all workspaces.
     */
    getWorkspaces() {
        return Array.from(this.workspaces.keys());
    }
}
// Export singleton instance
export const documentDrivenSystem = new DocumentDrivenSystem();
//# sourceMappingURL=document-driven-system.js.map