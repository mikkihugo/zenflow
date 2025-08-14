import { EventEmitter } from 'node:events';
import { getLogger } from '../config/logging-config.ts';
import { DocumentProcessor } from './document-processor.ts';
import { DocumentationManager } from './documentation-manager.ts';
import { ExportSystem as ExportManager } from './export-manager.ts';
import { InterfaceManager } from './interface-manager.ts';
import { MemorySystem } from './memory-system.ts';
import { WorkflowEngine } from './workflow-engine.ts';
const logger = getLogger('CoreSystem');
export class System extends EventEmitter {
    config;
    status = 'initializing';
    startTime;
    memorySystem;
    workflowEngine;
    documentProcessor;
    exportManager;
    documentationManager;
    interfaceManager;
    initialized = false;
    constructor(config = {}) {
        super();
        this.config = config;
        this.startTime = Date.now();
        this.initializeComponents();
        this.setupEventHandlers();
    }
    initializeComponents() {
        this.memorySystem = new MemorySystem({
            backend: this.config.memory?.backend || 'json',
            path: this.config.memory?.directory || './data/memory',
        });
        this.workflowEngine = new WorkflowEngine(this.memorySystem, {
            maxConcurrentWorkflows: this.config.workflow?.maxConcurrentWorkflows || 10,
            workspaceRoot: './',
            templatesPath: './templates',
            outputPath: './output',
            defaultTimeout: 300000,
            enableMetrics: true,
            enablePersistence: true,
            storageBackend: { type: 'database', config: {} },
        });
        this.documentProcessor = new DocumentProcessor(this.memorySystem, this.workflowEngine, {
            autoWatch: this.config.documents?.autoWatch !== false,
            enableWorkflows: this.config.documents?.enableWorkflows !== false,
        });
        this.exportManager = new ExportManager();
        this.documentationManager = new DocumentationManager(this.memorySystem, {
            autoLink: this.config.documentation?.autoLink !== false,
            scanPaths: this.config.documentation?.scanPaths || ['./docs', './src'],
        });
        this.interfaceManager = new InterfaceManager({
            defaultMode: this.config.interface?.defaultMode || 'auto',
            webPort: this.config.interface?.webPort || 3456,
            coreSystem: this,
        });
        logger.info('Core components initialized with clean architecture');
    }
    setupEventHandlers() {
        this.documentProcessor.on('document:created', async (event) => {
            logger.info(`Document created: ${event.type} - ${event['path']}`);
            if (this.config.documents?.enableWorkflows !== false) {
                await this.workflowEngine.processDocumentEvent('document:created', event['document']);
            }
            await this.documentationManager.indexDocument(event['document']);
        });
        this.workflowEngine.on('workflow:completed', async (event) => {
            logger.info(`Workflow completed: ${event['workflowId']}`);
            if (this.config.export?.defaultFormat) {
                const workflowData = await this.memorySystem.retrieve(`workflow:${event['workflowId']}`);
                if (workflowData) {
                    await this.exportManager.exportData(workflowData, this.config.export.defaultFormat);
                }
            }
        });
        this.memorySystem.on('stored', (event) => {
            logger.debug(`Memory stored: ${event['key']}`);
        });
        logger.info('Event handlers configured');
    }
    async initialize() {
        if (this.initialized)
            return;
        logger.info('🚀 Initializing Core System');
        try {
            this.status = 'initializing';
            this.emit('status:changed', this.status);
            logger.info('Initializing memory system...');
            await this.memorySystem.initialize();
            logger.info('Initializing workflow engine...');
            await this.workflowEngine.initialize();
            logger.info('Initializing document processor...');
            await this.documentProcessor.initialize();
            logger.info('Initializing export manager...');
            await this.exportManager.initialize();
            logger.info('Initializing documentation manager...');
            await this.documentationManager.initialize();
            logger.info('Initializing interface manager...');
            await this.interfaceManager.initialize();
            this.status = 'ready';
            this.initialized = true;
            this.emit('initialized');
            logger.info('✅ Core System ready');
        }
        catch (error) {
            this.status = 'error';
            this.emit('status:changed', this.status);
            logger.error('❌ Failed to initialize Core System:', error);
            throw error;
        }
    }
    async launch() {
        await this.ensureInitialized();
        logger.info('Launching interface...');
        await this.interfaceManager.launch();
    }
    async getSystemStatus() {
        const memoryStats = await this.memorySystem.getStats();
        const workflowMetrics = await this.workflowEngine.getMetrics();
        const documentStats = await this.documentProcessor.getStats();
        const _exportStats = this.exportManager.getExportStats();
        const docStats = await this.documentationManager.getStats();
        const interfaceStats = await this.interfaceManager.getStats();
        return {
            status: this.status,
            version: '2.0.0-clean-architecture',
            components: {
                memory: {
                    status: 'ready',
                    entries: memoryStats.entries,
                },
                workflow: {
                    status: 'ready',
                    active: workflowMetrics.running || 0,
                },
                documents: {
                    status: 'ready',
                    loaded: documentStats.totalDocuments || 0,
                },
                export: {
                    status: 'ready',
                    formats: this.exportManager.getAvailableFormats().length,
                },
                documentation: {
                    status: 'ready',
                    indexed: docStats.indexedDocuments || 0,
                },
                interface: {
                    status: 'ready',
                    mode: interfaceStats.currentMode || 'auto',
                },
            },
            uptime: Date.now() - this.startTime,
            lastUpdate: new Date().toISOString(),
        };
    }
    async processDocument(documentPath) {
        await this.ensureInitialized();
        try {
            logger.info(`Processing document: ${documentPath}`);
            await this.documentProcessor.processDocument(documentPath);
            return { success: true };
        }
        catch (error) {
            logger.error(`Failed to process document ${documentPath}:`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async exportSystemData(format, options = {}) {
        await this.ensureInitialized();
        try {
            const systemStatus = await this.getSystemStatus();
            const exportData = {
                system: systemStatus,
                exportedAt: new Date().toISOString(),
            };
            const result = await this.exportManager.exportData(exportData, format, options);
            return { success: true, filename: result?.filename };
        }
        catch (error) {
            logger.error('Failed to export system data:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async shutdown() {
        logger.info('Shutting down Core System...');
        this.status = 'shutdown';
        this.emit('status:changed', this.status);
        try {
            await this.interfaceManager?.shutdown();
            await this.documentationManager?.shutdown();
            await this.exportManager?.shutdown();
            await this.documentProcessor?.shutdown();
            await this.workflowEngine?.shutdown();
            await this.memorySystem?.shutdown();
            this.removeAllListeners();
            this.emit('shutdown');
            logger.info('Core System shutdown complete');
        }
        catch (error) {
            logger.error('Error during shutdown:', error);
            throw error;
        }
    }
    getComponents() {
        return {
            memory: this.memorySystem,
            workflow: this.workflowEngine,
            documents: this.documentProcessor,
            export: this.exportManager,
            documentation: this.documentationManager,
            interface: this.interfaceManager,
        };
    }
    async ensureInitialized() {
        if (!this.initialized) {
            await this.initialize();
        }
    }
    static async create(config) {
        const system = new System(config);
        await system.initialize();
        return system;
    }
    static async quickStart(config) {
        const system = await System.create(config);
        await system.launch();
        return system;
    }
}
//# sourceMappingURL=core-system.js.map