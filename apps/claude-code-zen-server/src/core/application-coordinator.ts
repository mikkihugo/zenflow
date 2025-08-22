/**
 * Application Coordinator - Main Integration Hub.
 *
 * Brings together all core systems without plugin architecture:
 * - Interface Launcher (CLI//Web)
 * - Memory System (existing)
 * - Workflow Engine
 * - Export Manager
 * - Documentation Linker.
 * - Document-Driven System.
 *
 * Supports the hive document workflow: Vision → ADRs → PRDs → Epics → Features → Tasks → Code.
 */
/**
 * @file Application coordination system.
 */

import { DocumentDrivenSystem } from '@claude-zen/document-processing';
import { DocumentationLinker } from '@claude-zen/documentation';
import { WorkflowEngine } from '@claude-zen/enterprise';
import { ExportSystem as ExportManager } from '@claude-zen/exporters';
import { getLogger, TypedEventBase } from '@claude-zen/foundation';
import { BrainCoordinator, MemoryManager } from '@claude-zen/intelligence';
import { InterfaceLauncher } from '@claude-zen/interfaces';

const logger = getLogger('ApplicationCoordinator');

export interface ApplicationCoordinatorConfig {
  // Interface configuration
  interface?: {
    defaultMode?: 'auto'' | ''cli'' | '''' | ''web');
    webPort?: number;
    enableRealTime?: boolean;
    theme?: 'dark'' | ''light');
  };

  // Memory configuration
  memory?: {
    directory?: string;
    namespace?: string;
    enableCache?: boolean;
    enableVectorStorage?: boolean;
  };

  // Workflow configuration
  workflow?: {
    maxConcurrentWorkflows?: number;
    persistWorkflows?: boolean;
    enableVisualization?: boolean;
  };

  // Export configuration
  export?: {
    defaultFormat?: string;
    outputPath?: string;
    enableCompression?: boolean;
  };

  // Documentation configuration
  documentation?: {
    documentationPaths?: string[];
    codePaths?: string[];
    enableAutoLinking?: boolean;
  };

  // Document workspace configuration
  workspace?: {
    root?: string;
    autoDetect?: boolean;
    enableWatching?: boolean;
  };
}

export interface SystemStatus {
  status: 'initializing'' | ''ready'' | ''error'' | ''shutdown');
  version: string;
  components: {
    interface: { status: string; mode?: string; url?: string };
    memory: { status: string; sessions: number; size: number };
    workflow: { status: string; activeWorkflows: number };
    export: { status: string; availableFormats: number };
    documentation: { status: string; documentsIndexed: number };
    workspace: {
      status: string;
      workspaceId?: string;
      documentsLoaded: number;
    };
  };
  uptime: number;
  lastUpdate: string;
}

export class ApplicationCoordinator extends TypedEventBase {
  private configuration: ApplicationCoordinatorConfig;
  private status: SystemStatus['status'] = 'initializing');
  private startTime: number;

  // Core components - using definite assignment assertion since they're initialized in constructor
  private interfaceLauncher!: InterfaceLauncher;
  private documentSystem!: DocumentDrivenSystem;
  private workflowEngine!: WorkflowEngine;
  private exportSystem!: ExportManager;
  private documentationLinker!: DocumentationLinker;
  private memorySystem!: BrainCoordinator;
  private memoryManager!: MemoryManager;

  // State
  private activeWorkspaceId?: string;
  private initialized = false;

  constructor(config: ApplicationCoordinatorConfig = {}) {
    super();
    this.configuration = config;
    this.startTime = Date.now();

    // Initialize core components
    this.initializeComponents;

    // Setup event handlers
    this.setupEventHandlers;
  }

  /**
   * Initialize all core components.
   */
  private initializeComponents(): void {
    // Memory system (existing)
    this.memorySystem = new BrainCoordinator({
      backend: 'json', // Default to JSON backend
      path: this.configuration.memory?.directory'' | '''' | ''"./data/memory",
    });

    this.memoryManager = new MemoryManager({
      backendConfig: {
        type:'json',
        path: this.configuration.memory?.directory'' | '''' | ''"./data/memory",
      },
      enableCache: this.configuration.memory?.enableCache !== false,
      enableVectorStorage:
        this.configuration.memory?.enableVectorStorage !== false,
    });

    // Workflow engine
    this.workflowEngine = new WorkflowEngine(this.memorySystem, {
      maxConcurrentWorkflows:
        this.configuration.workflow?.maxConcurrentWorkflows'' | '''' | ''10,
      workspaceRoot: "./",
      templatesPath: "./templates",
      outputPath: "./output",
      defaultTimeout: 300000,
      enableMetrics: true,
      enablePersistence: true,
      storageBackend: { type:'database', config: {} },
    });

    // Export system
    this.exportSystem = new ExportManager();

    // Documentation linker
    this.documentationLinker = new DocumentationLinker({
      documentationPaths: this.configuration.documentation?.documentationPaths,
      codePaths: this.configuration.documentation?.codePaths,
      enableAutoLinking:
        this.configuration.documentation?.enableAutoLinking !== false,
    });

    // Document-driven system
    this.documentSystem = new DocumentDrivenSystem();

    // Interface launcher
    this.interfaceLauncher = InterfaceLauncher?.getInstance()

    logger.info('Core components initialized');
  }

  /**
   * Setup event handlers for component communication.
   */
  private setupEventHandlers(): void {
    // Document system events
    this.documentSystem.on('document:created', async (event) => {
      logger.info(`Document created: ${event.type} - ${event.path}`);

      // Trigger workflows for new documents
      try {
        const workflowIds = await this.workflowEngine.processDocumentEvent(
          'document:created',
          event.document
        );

        if (workflowIds.length > 0) {
          logger.info(
            `Started ${workflowIds.length} workflows for new document`
          );
        }
      } catch (error) {
        logger.error('Failed to process document creation event:', error);
      }
    });

    this.documentSystem.on('workspace:loaded', (event) => {
      this.activeWorkspaceId = event.workspaceId;
      logger.info(`Workspace loaded: ${event.path}`);
    });

    // Workflow engine events
    this.workflowEngine.on('workflow:completed', async (event: any) => {
      logger.info(`Workflow completed: ${event.workflowId}`);

      // Auto-export workflow results if configured
      if (this.configuration.export?.defaultFormat) {
        try {
          const workflowData = await this.memorySystem.retrieve(
            `workflow:${event.workflowId}`
          );
          if (workflowData) {
            const exportOptions = {
              ...(this.configuration.export.outputPath !== undefined && {
                outputPath: this.configuration.export.outputPath,
              }),
              filename: `workflow_${event.workflowId}_result`,
            };
            await this.exportSystem.exportData(
              workflowData,
              this.configuration.export.defaultFormat,
              exportOptions
            );
          }
        } catch (error) {
          logger.warn('Failed to auto-export workflow result:', error);
        }
      }
    });

    // Export system events
    this.exportSystem.on('export:success', (result) => {
      logger.info(`Export completed: ${result?.filename} (${result?.format})`);
    });

    // Memory system events (if supported)
    if ('on' in this.memorySystem) {
      this.memorySystem.on('stored', (event) => {
        logger.debug(`Memory stored: ${event.namespace}:${event.key}`);
      });
    }

    // Documentation linker events
    this.documentationLinker.on('document:indexed', (doc) => {
      logger.debug(`Documentation indexed: ${doc.title}`);
    });

    logger.info('Event handlers configured');
  }

  /**
   * Initialize the entire unified system.
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    logger.info('🚀 Initializing Unified Core System');

    try {
      this.status = 'initializing');
      this.emit('status:changed', this.status);

      // Initialize components in order
      logger.info('Initializing memory system...');
      await this.memorySystem?.initialize()
      await this.memoryManager?.initialize()

      logger.info('Initializing workflow engine...');
      await this.workflowEngine?.initialize()

      logger.info('Initializing documentation linker...');
      await this.documentationLinker?.initialize()

      logger.info('Initializing document-driven system...');
      await this.documentSystem?.initialize()

      // Load workspace if configured
      if (this.configuration.workspace?.root) {
        logger.info(`Loading workspace: ${this.configuration.workspace.root}`);
        this.activeWorkspaceId = await this.documentSystem.loadWorkspace(
          this.configuration.workspace.root
        );
      } else if (this.configuration.workspace?.autoDetect) {
        // Try to auto-detect workspace
        const workspaceRoot = this.detectWorkspaceRoot;
        if (workspaceRoot) {
          logger.info(`Auto-detected workspace: ${workspaceRoot}`);
          this.activeWorkspaceId =
            await this.documentSystem.loadWorkspace(workspaceRoot);
        }
      }

      this.status = 'ready');
      this.initialized = true;

      this.emit('initialized', {});
      logger.info('✅ Unified Core System ready');
    } catch (error) {
      this.status = 'error');
      this.emit('status:changed', this.status);
      logger.error('❌ Failed to initialize Unified Core System:', error);
      throw error;
    }
  }

  /**
   * Launch the interface (CLI//Web based on config and environment).
   */
  async launch(): Promise<void> {
    await this.ensureInitialized;

    logger.info('Launching unified interface...');

    const launchOptions = {
      ...(this.configuration.interface?.defaultMode !== 'auto' &&
        this.configuration.interface?.defaultMode !== undefined && {
          forceMode: this.configuration.interface.defaultMode,
        }),
      ...(this.configuration.interface?.webPort !== undefined && {
        webPort: this.configuration.interface.webPort,
      }),
      verbose: false,
      silent: false,
      config: {
        ...(this.configuration.interface?.theme !== undefined && {
          theme: this.configuration.interface.theme,
        }),
        ...(this.configuration.interface?.enableRealTime !== undefined && {
          realTime: this.configuration.interface.enableRealTime,
        }),
        coreSystem: this, // Pass reference to access all systems
      },
    };

    try {
      await this.interfaceLauncher.launch(launchOptions);
    } catch (error) {
      logger.error('Failed to launch interface:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive system status.
   */
  async getSystemStatus(): Promise<SystemStatus> {
    const memoryStats = await this.memorySystem?.getStats()
    const workflowMetrics = { running: 0 }; // await this.workflowEngine?.getWorkflowMetrics()
    const _exportStats = {
      totalExports: 0,
      successfulExports: 0,
      failedExports: 0,
      totalSize: 0,
    }; // this.exportSystem?.getExportStats()

    return {
      status: this.status,
      version: '2..0-alpha.73',
      components: {
        interface: {
          status: 'ready',
          mode: 'auto', // Would be determined by actual interface
        },
        memory: {
          status: 'ready',
          sessions: memoryStats.namespaces'' | '''' | ''0,
          size: memoryStats.size,
        },
        workflow: {
          status:'ready',
          activeWorkflows: workflowMetrics.running'' | '''' | ''0,
        },
        export: {
          status:'ready',
          availableFormats: this.exportSystem?.getAvailableFormats.length,
        },
        documentation: {
          status: 'ready',
          documentsIndexed:
            this.documentationLinker?.getDocumentationIndex.size,
        },
        workspace: {
          status: this.activeWorkspaceId ? 'ready' : 'none',
          ...(this.activeWorkspaceId !== undefined && {
            workspaceId: this.activeWorkspaceId,
          }),
          documentsLoaded: 0, // Would be calculated from document system
        },
      },
      uptime: Date.now() - this.startTime,
      lastUpdate: new Date()?.toISOString,
    };
  }

  /**
   * Process a document through the entire workflow.
   *
   * @param documentPath
   */
  async processDocument(documentPath: string): Promise<{
    success: boolean;
    workflowIds: string[];
    error?: string;
  }> {
    await this.ensureInitialized;

    try {
      logger.info(`Processing document: ${documentPath}`);

      // Process through document system
      await this.documentSystem.processVisionaryDocument(
        this.activeWorkspaceId'' | '''' | '''default',
        documentPath
      );

      return {
        success: true,
        workflowIds: [], // Would be populated by workflow engine
      };
    } catch (error) {
      logger.error(`Failed to process document ${documentPath}:`, error);
      return {
        success: false,
        workflowIds: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Export system data in specified format.
   *
   * @param format
   * @param options
   */
  async exportSystemData(
    format: string,
    options: any = {}
  ): Promise<{
    success: boolean;
    filename?: string;
    error?: string;
  }> {
    await this.ensureInitialized;

    try {
      const systemStatus = await this.getSystemStatus;
      const workflowHistory = await this.workflowEngine?.getWorkflowHistory()
      const documentationReport =
        await this.documentationLinker?.generateDocumentationReport()

      const systemData = {
        system: systemStatus,
        workflows: workflowHistory,
        documentation: documentationReport,
        exportedAt: new Date()?.toISOString,
      };

      const result = await this.exportSystem.exportSystemStatus(
        systemData,
        format,
        options
      );

      return {
        success: result?.success,
        filename: result?.filename,
      };
    } catch (error) {
      logger.error('Failed to export system data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate comprehensive system report.
   */
  async generateSystemReport(): Promise<string> {
    await this.ensureInitialized;

    const status = await this.getSystemStatus;
    const docReport =
      await this.documentationLinker?.generateDocumentationReport()
    const exportStats = this.exportSystem?.getExportStats()

    const report: string[] = [];

    report.push('# Claude Code Zen - System Report');
    report.push(`Generated: ${new Date()?.toISOString}`);
    report.push(`Version: ${status.version}`);
    report.push(`Uptime: ${Math.round(status.uptime / 1000)}s`);
    report.push('');

    report.push('## System Status');
    report.push(`Overall Status: ${status.status}`);
    report.push('');

    report.push('### Components');
    for (const [component, info] of Object.entries(status.components)) {
      report.push(`- **${component}**: ${info.status}`);
      if ('sessions' in info) report.push(`  - Sessions: ${info.sessions}`);
      if ('activeWorkflows' in info)
        report.push(`  - Active Workflows: ${info.activeWorkflows}`);
      if ('documentsIndexed' in info)
        report.push(`  - Documents Indexed: ${info.documentsIndexed}`);
    }
    report.push('');

    report.push('## Export Statistics');
    report.push(`- Total Exports: ${exportStats.totalExports}`);
    report.push(`- Successful: ${exportStats.successfulExports}`);
    report.push(`- Failed: ${exportStats.failedExports}`);
    report.push(`- Total Size: ${Math.round(exportStats.totalSize / 1024)}KB`);
    report.push('');

    report.push('## Documentation Analysis');
    report.push(docReport);

    return report.join('\n');
  }

  /**
   * Shutdown the entire system gracefully.
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down Unified Core System...');

    this.status = 'shutdown');
    this.emit('status:changed', this.status);

    try {
      // Shutdown components in reverse order
      if (this.memorySystem) {
        await this.memorySystem?.shutdown();
      }

      // Clear event listeners
      this.removeAllListeners;

      this.emit('shutdown', {});
      logger.info('Unified Core System shutdown complete');
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
      memoryManager: this.memoryManager,
      workflow: this.workflowEngine,
      export: this.exportSystem,
      documentation: this.documentationLinker,
      documentSystem: this.documentSystem,
    };
  }

  /**
   * Utility methods.
   */
  private detectWorkspaceRoot(): string'' | ''null {
    // Simple workspace detection logic
    const candidates = ["./docs", "./adrs", "./prds", "."];

    for (const candidate of candidates) {
      try {
        const fs = require('node:fs');
        if (fs.existsSync(candidate)) {
          return candidate;
        }
      } catch {}
    }

    return null;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize;
    }
  }

  /**
   * Static factory method for easy initialization.
   *
   * @param config
   */
  static async create(
    config?: ApplicationCoordinatorConfig
  ): Promise<ApplicationCoordinator> {
    const system = new ApplicationCoordinator(config);
    await system?.initialize()
    return system;
  }

  /**
   * Quick start method that initializes and launches.
   *
   * @param config
   */
  static async quickStart(
    config?: ApplicationCoordinatorConfig
  ): Promise<ApplicationCoordinator> {
    const system = await ApplicationCoordinator.create(config);
    await system?.launch()
    return system;
  }
}
