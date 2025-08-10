/**
 * Core System - Main System Coordinator.
 *
 * Clean, focused system coordinator that manages core components without bloated "unified" architecture.
 * Follows single responsibility principle and provides a clean dependency injection model.
 *
 * ## Architecture Overview
 *
 * The CoreSystem replaces the bloated ApplicationCoordinator with a clean, focused architecture:
 * - **MemorySystem**: Multi-backend memory management (JSON, SQLite, LanceDB)
 * - **WorkflowEngine**: Document workflow processing (Vision → ADRs → PRDs → Epics → Features → Tasks → Code)
 * - **DocumentProcessor**: Unified document processing (consolidates file-based and database-driven)
 * - **ExportManager**: Data export in multiple formats
 * - **DocumentationManager**: Documentation indexing and linking.
 * - **InterfaceManager**: Multi-interface support (CLI, TUI, Web).
 *
 * ## Key Improvements
 *
 * 1. **Single Responsibility**: Each component has a clear, focused purpose
 * 2. **Clean Dependencies**: Explicit dependency injection without circular imports
 * 3. **Better Separation**: Clear boundaries between systems
 * 4. **Easier Testing**: Components can be tested in isolation
 * 5. **Maintainable**: No more bloated "unified" classes.
 *
 * ## Migration Guide
 *
 * **Old (ApplicationCoordinator):**.
 * ```typescript
 * const system = new ApplicationCoordinator(config);
 * await system.initialize();
 * await system.launch();
 * ```
 *
 * **New (CoreSystem):**
 * ```typescript
 * const system = new CoreSystem(config);
 * await system.initialize();
 * await system.launch();
 * ```
 *
 * The API is compatible, but the internal architecture is much cleaner.
 *
 * @example
 * ```typescript
 * // Basic usage
 * const coreSystem = new CoreSystem({
 *   memory: { backend: 'sqlite', directory: './data' },
 *   workflow: { maxConcurrentWorkflows: 10 },
 *   interface: { defaultMode: 'web', webPort: 3000 }
 * });
 *
 * await coreSystem.initialize();
 * await coreSystem.launch();
 *
 * // Process a document
 * await coreSystem.processDocument('./docs/vision/product-vision.md');
 *
 * // Get system status
 * const status = await coreSystem.getSystemStatus();
 * console.log(`System status: ${status.status}`);
 *
 * // Access individual components
 * const components = coreSystem.getComponents();
 * await components.memory.store('key', { data: 'value' });
 * ```
 * @since 2.0.0-clean-architecture
 */
/**
 * @file core-system implementation
 */



import { EventEmitter } from 'node:events';
import { DocumentProcessor } from './document-processor';
import { DocumentationManager } from './documentation-manager';
import { ExportSystem as ExportManager } from './export-manager';
import { InterfaceManager } from './interface-manager';
import { createLogger } from './logger';
import { MemorySystem } from './memory-system';
import { WorkflowEngine } from './workflow-engine';

const logger = createLogger('CoreSystem');

/**
 * Core system configuration with clear, focused options.
 *
 * @example
 */
export interface SystemConfig {
  // Memory configuration
  memory?: {
    backend?: 'lancedb' | 'sqlite' | 'json';
    directory?: string;
    namespace?: string;
  };

  // Workflow configuration
  workflow?: {
    maxConcurrentWorkflows?: number;
    persistWorkflows?: boolean;
  };

  // Interface configuration
  interface?: {
    defaultMode?: 'auto' | 'cli' | 'tui' | 'web';
    webPort?: number;
  };

  // Document processing
  documents?: {
    autoWatch?: boolean;
    enableWorkflows?: boolean;
  };

  // Export configuration
  export?: {
    defaultFormat?: string;
    outputPath?: string;
  };

  // Documentation
  documentation?: {
    autoLink?: boolean;
    scanPaths?: string[];
  };
}

/**
 * System status with clear component boundaries.
 *
 * @example
 */
export interface SystemStatus {
  status: 'initializing' | 'ready' | 'error' | 'shutdown';
  version: string;
  components: {
    memory: { status: string; entries: number };
    workflow: { status: string; active: number };
    documents: { status: string; loaded: number };
    export: { status: string; formats: number };
    documentation: { status: string; indexed: number };
    interface: { status: string; mode?: string };
  };
  uptime: number;
  lastUpdate: string;
}

/**
 * Clean, focused core system without bloated "unified" architecture.
 *
 * @example
 */
export class System extends EventEmitter {
  private config: SystemConfig;
  private status: SystemStatus['status'] = 'initializing';
  private startTime: number;

  // Core components with clear responsibilities
  private memorySystem!: MemorySystem;
  private workflowEngine!: WorkflowEngine;
  private documentProcessor!: DocumentProcessor;
  private exportManager!: ExportManager;
  private documentationManager!: DocumentationManager;
  private interfaceManager!: InterfaceManager;

  private initialized = false;

  constructor(config: SystemConfig = {}) {
    super();
    this.config = config;
    this.startTime = Date.now();

    // Initialize components with clear dependencies
    this.initializeComponents();
    this.setupEventHandlers();
  }

  /**
   * Initialize all core components with proper dependency injection.
   */
  private initializeComponents(): void {
    // Memory system - foundation component
    this.memorySystem = new MemorySystem({
      backend: this.config.memory?.backend || 'json',
      path: this.config.memory?.directory || './data/memory',
    });

    // Workflow engine - depends on memory
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

    // Document processor - depends on memory and workflow
    this.documentProcessor = new DocumentProcessor(this.memorySystem, this.workflowEngine, {
      autoWatch: this.config.documents?.autoWatch !== false,
      enableWorkflows: this.config.documents?.enableWorkflows !== false,
    });

    // Export manager - standalone
    this.exportManager = new ExportManager();

    // Documentation manager - depends on memory
    this.documentationManager = new DocumentationManager(this.memorySystem, {
      autoLink: this.config.documentation?.autoLink !== false,
      scanPaths: this.config.documentation?.scanPaths || ['./docs', './src'],
    });

    // Interface manager - coordinates with all systems
    this.interfaceManager = new InterfaceManager({
      defaultMode: this.config.interface?.defaultMode || 'auto',
      webPort: this.config.interface?.webPort || 3456,
      coreSystem: this, // Provide access to all systems
    });

    logger.info('Core components initialized with clean architecture');
  }

  /**
   * Setup event handlers for component communication.
   */
  private setupEventHandlers(): void {
    // Document processor events
    this.documentProcessor.on('document:created', async (event) => {
      logger.info(`Document created: ${event.type} - ${event["path"]}`);

      // Trigger workflows if enabled
      if (this.config.documents?.enableWorkflows !== false) {
        await this.workflowEngine.processDocumentEvent('document:created', event["document"]);
      }

      // Update documentation index
      await this.documentationManager.indexDocument(event["document"]);
    });

    // Workflow engine events
    this.workflowEngine.on('workflow:completed', async (event) => {
      logger.info(`Workflow completed: ${event["workflowId"]}`);

      // Auto-export if configured
      if (this.config.export?.defaultFormat) {
        const workflowData = await this.memorySystem.retrieve(`workflow:${event["workflowId"]}`);
        if (workflowData) {
          await this.exportManager.exportData(workflowData, this.config.export.defaultFormat);
        }
      }
    });

    // Memory system events
    this.memorySystem.on('stored', (event) => {
      logger.debug(`Memory stored: ${event["key"]}`);
    });

    logger.info('Event handlers configured');
  }

  /**
   * Initialize the entire system.
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    logger.info('🚀 Initializing Core System');

    try {
      this.status = 'initializing';
      this.emit('status:changed', this.status);

      // Initialize components in dependency order
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
    } catch (error) {
      this.status = 'error';
      this.emit('status:changed', this.status);
      logger.error('❌ Failed to initialize Core System:', error);
      throw error;
    }
  }

  /**
   * Launch the interface.
   */
  async launch(): Promise<void> {
    await this.ensureInitialized();
    logger.info('Launching interface...');
    await this.interfaceManager.launch();
  }

  /**
   * Get comprehensive system status.
   */
  async getSystemStatus(): Promise<SystemStatus> {
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

  /**
   * Process a document through the system.
   *
   * @param documentPath
   */
  async processDocument(documentPath: string): Promise<{
    success: boolean;
    workflowIds?: string[];
    error?: string;
  }> {
    await this.ensureInitialized();

    try {
      logger.info(`Processing document: ${documentPath}`);
      await this.documentProcessor.processDocument(documentPath);
      return { success: true };
    } catch (error) {
      logger.error(`Failed to process document ${documentPath}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Export system data.
   *
   * @param format
   * @param options
   */
  async exportSystemData(
    format: string,
    options: any = {}
  ): Promise<{ success: boolean; filename?: string; error?: string }> {
    await this.ensureInitialized();

    try {
      const systemStatus = await this.getSystemStatus();
      const exportData = {
        system: systemStatus,
        exportedAt: new Date().toISOString(),
      };

      const result = await this.exportManager.exportData(exportData, format, options);
      return { success: true, filename: result?.filename };
    } catch (error) {
      logger.error('Failed to export system data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Shutdown the system gracefully.
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down Core System...');

    this.status = 'shutdown';
    this.emit('status:changed', this.status);

    try {
      // Shutdown components in reverse order
      await this.interfaceManager?.shutdown();
      await this.documentationManager?.shutdown();
      await this.exportManager?.shutdown();
      await this.documentProcessor?.shutdown();
      await this.workflowEngine?.shutdown();
      await this.memorySystem?.shutdown();

      this.removeAllListeners();
      this.emit('shutdown');
      logger.info('Core System shutdown complete');
    } catch (error) {
      logger.error('Error during shutdown:', error);
      throw error;
    }
  }

  /**
   * Get access to core components (for interface integration).
   */
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

  /**
   * Utility methods.
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Static factory method for easy initialization.
   *
   * @param config
   */
  static async create(config?: SystemConfig): Promise<System> {
    const system = new System(config);
    await system.initialize();
    return system;
  }

  /**
   * Quick start method that initializes and launches.
   *
   * @param config
   */
  static async quickStart(config?: SystemConfig): Promise<System> {
    const system = await System.create(config);
    await system.launch();
    return system;
  }
}
