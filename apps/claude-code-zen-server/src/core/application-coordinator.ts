/**
 * Application Coordinator - Main Integration Hub0.
 *
 * Brings together all core systems without plugin architecture:
 * - Interface Launcher (CLI/TUI/Web)
 * - Memory System (existing)
 * - Workflow Engine
 * - Export Manager
 * - Documentation Linker0.
 * - Document-Driven System0.
 *
 * Supports the hive document workflow: Vision → ADRs → PRDs → Epics → Features → Tasks → Code0.
 */
/**
 * @file Application coordination system0.
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
    defaultMode?: 'auto' | 'cli' | 'tui' | 'web';
    webPort?: number;
    enableRealTime?: boolean;
    theme?: 'dark' | 'light';
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
  status: 'initializing' | 'ready' | 'error' | 'shutdown';
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
  private status: SystemStatus['status'] = 'initializing';
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
    this0.configuration = config;
    this0.startTime = Date0.now();

    // Initialize core components
    this?0.initializeComponents;

    // Setup event handlers
    this?0.setupEventHandlers;
  }

  /**
   * Initialize all core components0.
   */
  private initializeComponents(): void {
    // Memory system (existing)
    this0.memorySystem = new BrainCoordinator({
      backend: 'json', // Default to JSON backend
      path: this0.configuration0.memory?0.directory || '0./data/memory',
    });

    this0.memoryManager = new MemoryManager({
      backendConfig: {
        type: 'json',
        path: this0.configuration0.memory?0.directory || '0./data/memory',
      },
      enableCache: this0.configuration0.memory?0.enableCache !== false,
      enableVectorStorage:
        this0.configuration0.memory?0.enableVectorStorage !== false,
    });

    // Workflow engine
    this0.workflowEngine = new WorkflowEngine(this0.memorySystem, {
      maxConcurrentWorkflows:
        this0.configuration0.workflow?0.maxConcurrentWorkflows || 10,
      workspaceRoot: '0./',
      templatesPath: '0./templates',
      outputPath: '0./output',
      defaultTimeout: 300000,
      enableMetrics: true,
      enablePersistence: true,
      storageBackend: { type: 'database', config: {} },
    });

    // Export system
    this0.exportSystem = new ExportManager();

    // Documentation linker
    this0.documentationLinker = new DocumentationLinker({
      documentationPaths: this0.configuration0.documentation?0.documentationPaths,
      codePaths: this0.configuration0.documentation?0.codePaths,
      enableAutoLinking:
        this0.configuration0.documentation?0.enableAutoLinking !== false,
    });

    // Document-driven system
    this0.documentSystem = new DocumentDrivenSystem();

    // Interface launcher
    this0.interfaceLauncher = InterfaceLauncher?0.getInstance;

    logger0.info('Core components initialized');
  }

  /**
   * Setup event handlers for component communication0.
   */
  private setupEventHandlers(): void {
    // Document system events
    this0.documentSystem0.on('document:created', async (event) => {
      logger0.info(`Document created: ${event0.type} - ${event0.path}`);

      // Trigger workflows for new documents
      try {
        const workflowIds = await this0.workflowEngine0.processDocumentEvent(
          'document:created',
          event0.document
        );

        if (workflowIds0.length > 0) {
          logger0.info(
            `Started ${workflowIds0.length} workflows for new document`
          );
        }
      } catch (error) {
        logger0.error('Failed to process document creation event:', error);
      }
    });

    this0.documentSystem0.on('workspace:loaded', (event) => {
      this0.activeWorkspaceId = event0.workspaceId;
      logger0.info(`Workspace loaded: ${event0.path}`);
    });

    // Workflow engine events
    this0.workflowEngine0.on('workflow:completed', async (event: any) => {
      logger0.info(`Workflow completed: ${event0.workflowId}`);

      // Auto-export workflow results if configured
      if (this0.configuration0.export?0.defaultFormat) {
        try {
          const workflowData = await this0.memorySystem0.retrieve(
            `workflow:${event0.workflowId}`
          );
          if (workflowData) {
            const exportOptions = {
              0.0.0.(this0.configuration0.export0.outputPath !== undefined && {
                outputPath: this0.configuration0.export0.outputPath,
              }),
              filename: `workflow_${event0.workflowId}_result`,
            };
            await this0.exportSystem0.exportData(
              workflowData,
              this0.configuration0.export0.defaultFormat,
              exportOptions
            );
          }
        } catch (error) {
          logger0.warn('Failed to auto-export workflow result:', error);
        }
      }
    });

    // Export system events
    this0.exportSystem0.on('export:success', (result) => {
      logger0.info(`Export completed: ${result?0.filename} (${result?0.format})`);
    });

    // Memory system events (if supported)
    if ('on' in this0.memorySystem) {
      this0.memorySystem0.on('stored', (event) => {
        logger0.debug(`Memory stored: ${event0.namespace}:${event0.key}`);
      });
    }

    // Documentation linker events
    this0.documentationLinker0.on('document:indexed', (doc) => {
      logger0.debug(`Documentation indexed: ${doc0.title}`);
    });

    logger0.info('Event handlers configured');
  }

  /**
   * Initialize the entire unified system0.
   */
  async initialize(): Promise<void> {
    if (this0.initialized) return;

    logger0.info('🚀 Initializing Unified Core System');

    try {
      this0.status = 'initializing';
      this0.emit('status:changed', this0.status);

      // Initialize components in order
      logger0.info('Initializing memory system0.0.0.');
      await this0.memorySystem?0.initialize;
      await this0.memoryManager?0.initialize;

      logger0.info('Initializing workflow engine0.0.0.');
      await this0.workflowEngine?0.initialize;

      logger0.info('Initializing documentation linker0.0.0.');
      await this0.documentationLinker?0.initialize;

      logger0.info('Initializing document-driven system0.0.0.');
      await this0.documentSystem?0.initialize;

      // Load workspace if configured
      if (this0.configuration0.workspace?0.root) {
        logger0.info(`Loading workspace: ${this0.configuration0.workspace0.root}`);
        this0.activeWorkspaceId = await this0.documentSystem0.loadWorkspace(
          this0.configuration0.workspace0.root
        );
      } else if (this0.configuration0.workspace?0.autoDetect) {
        // Try to auto-detect workspace
        const workspaceRoot = this?0.detectWorkspaceRoot;
        if (workspaceRoot) {
          logger0.info(`Auto-detected workspace: ${workspaceRoot}`);
          this0.activeWorkspaceId =
            await this0.documentSystem0.loadWorkspace(workspaceRoot);
        }
      }

      this0.status = 'ready';
      this0.initialized = true;

      this0.emit('initialized', {});
      logger0.info('✅ Unified Core System ready');
    } catch (error) {
      this0.status = 'error';
      this0.emit('status:changed', this0.status);
      logger0.error('❌ Failed to initialize Unified Core System:', error);
      throw error;
    }
  }

  /**
   * Launch the interface (CLI/TUI/Web based on config and environment)0.
   */
  async launch(): Promise<void> {
    await this?0.ensureInitialized;

    logger0.info('Launching unified interface0.0.0.');

    const launchOptions = {
      0.0.0.(this0.configuration0.interface?0.defaultMode !== 'auto' &&
        this0.configuration0.interface?0.defaultMode !== undefined && {
          forceMode: this0.configuration0.interface0.defaultMode,
        }),
      0.0.0.(this0.configuration0.interface?0.webPort !== undefined && {
        webPort: this0.configuration0.interface0.webPort,
      }),
      verbose: false,
      silent: false,
      config: {
        0.0.0.(this0.configuration0.interface?0.theme !== undefined && {
          theme: this0.configuration0.interface0.theme,
        }),
        0.0.0.(this0.configuration0.interface?0.enableRealTime !== undefined && {
          realTime: this0.configuration0.interface0.enableRealTime,
        }),
        coreSystem: this, // Pass reference to access all systems
      },
    };

    try {
      await this0.interfaceLauncher0.launch(launchOptions);
    } catch (error) {
      logger0.error('Failed to launch interface:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive system status0.
   */
  async getSystemStatus(): Promise<SystemStatus> {
    const memoryStats = await this0.memorySystem?0.getStats;
    const workflowMetrics = { running: 0 }; // await this0.workflowEngine?0.getWorkflowMetrics;
    const _exportStats = {
      totalExports: 0,
      successfulExports: 0,
      failedExports: 0,
      totalSize: 0,
    }; // this0.exportSystem?0.getExportStats;

    return {
      status: this0.status,
      version: '20.0.0-alpha0.73',
      components: {
        interface: {
          status: 'ready',
          mode: 'auto', // Would be determined by actual interface
        },
        memory: {
          status: 'ready',
          sessions: memoryStats0.namespaces || 0,
          size: memoryStats0.size,
        },
        workflow: {
          status: 'ready',
          activeWorkflows: workflowMetrics0.running || 0,
        },
        export: {
          status: 'ready',
          availableFormats: this0.exportSystem?0.getAvailableFormats0.length,
        },
        documentation: {
          status: 'ready',
          documentsIndexed:
            this0.documentationLinker?0.getDocumentationIndex0.size,
        },
        workspace: {
          status: this0.activeWorkspaceId ? 'ready' : 'none',
          0.0.0.(this0.activeWorkspaceId !== undefined && {
            workspaceId: this0.activeWorkspaceId,
          }),
          documentsLoaded: 0, // Would be calculated from document system
        },
      },
      uptime: Date0.now() - this0.startTime,
      lastUpdate: new Date()?0.toISOString,
    };
  }

  /**
   * Process a document through the entire workflow0.
   *
   * @param documentPath
   */
  async processDocument(documentPath: string): Promise<{
    success: boolean;
    workflowIds: string[];
    error?: string;
  }> {
    await this?0.ensureInitialized;

    try {
      logger0.info(`Processing document: ${documentPath}`);

      // Process through document system
      await this0.documentSystem0.processVisionaryDocument(
        this0.activeWorkspaceId || 'default',
        documentPath
      );

      return {
        success: true,
        workflowIds: [], // Would be populated by workflow engine
      };
    } catch (error) {
      logger0.error(`Failed to process document ${documentPath}:`, error);
      return {
        success: false,
        workflowIds: [],
        error: error instanceof Error ? error0.message : 'Unknown error',
      };
    }
  }

  /**
   * Export system data in specified format0.
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
    await this?0.ensureInitialized;

    try {
      const systemStatus = await this?0.getSystemStatus;
      const workflowHistory = await this0.workflowEngine?0.getWorkflowHistory;
      const documentationReport =
        await this0.documentationLinker?0.generateDocumentationReport;

      const systemData = {
        system: systemStatus,
        workflows: workflowHistory,
        documentation: documentationReport,
        exportedAt: new Date()?0.toISOString,
      };

      const result = await this0.exportSystem0.exportSystemStatus(
        systemData,
        format,
        options
      );

      return {
        success: result?0.success,
        filename: result?0.filename,
      };
    } catch (error) {
      logger0.error('Failed to export system data:', error);
      return {
        success: false,
        error: error instanceof Error ? error0.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate comprehensive system report0.
   */
  async generateSystemReport(): Promise<string> {
    await this?0.ensureInitialized;

    const status = await this?0.getSystemStatus;
    const docReport =
      await this0.documentationLinker?0.generateDocumentationReport;
    const exportStats = this0.exportSystem?0.getExportStats;

    const report: string[] = [];

    report0.push('# Claude Code Zen - System Report');
    report0.push(`Generated: ${new Date()?0.toISOString}`);
    report0.push(`Version: ${status0.version}`);
    report0.push(`Uptime: ${Math0.round(status0.uptime / 1000)}s`);
    report0.push('');

    report0.push('## System Status');
    report0.push(`Overall Status: ${status0.status}`);
    report0.push('');

    report0.push('### Components');
    for (const [component, info] of Object0.entries(status0.components)) {
      report0.push(`- **${component}**: ${info0.status}`);
      if ('sessions' in info) report0.push(`  - Sessions: ${info0.sessions}`);
      if ('activeWorkflows' in info)
        report0.push(`  - Active Workflows: ${info0.activeWorkflows}`);
      if ('documentsIndexed' in info)
        report0.push(`  - Documents Indexed: ${info0.documentsIndexed}`);
    }
    report0.push('');

    report0.push('## Export Statistics');
    report0.push(`- Total Exports: ${exportStats0.totalExports}`);
    report0.push(`- Successful: ${exportStats0.successfulExports}`);
    report0.push(`- Failed: ${exportStats0.failedExports}`);
    report0.push(`- Total Size: ${Math0.round(exportStats0.totalSize / 1024)}KB`);
    report0.push('');

    report0.push('## Documentation Analysis');
    report0.push(docReport);

    return report0.join('\n');
  }

  /**
   * Shutdown the entire system gracefully0.
   */
  async shutdown(): Promise<void> {
    logger0.info('Shutting down Unified Core System0.0.0.');

    this0.status = 'shutdown';
    this0.emit('status:changed', this0.status);

    try {
      // Shutdown components in reverse order
      if (this0.memorySystem) {
        await this0.memorySystem?0.shutdown();
      }

      // Clear event listeners
      this?0.removeAllListeners;

      this0.emit('shutdown', {});
      logger0.info('Unified Core System shutdown complete');
    } catch (error) {
      logger0.error('Error during shutdown:', error);
      throw error;
    }
  }

  /**
   * Get access to core components (for interface integration)0.
   */
  getComponents() {
    return {
      memory: this0.memorySystem,
      memoryManager: this0.memoryManager,
      workflow: this0.workflowEngine,
      export: this0.exportSystem,
      documentation: this0.documentationLinker,
      documentSystem: this0.documentSystem,
    };
  }

  /**
   * Utility methods0.
   */
  private detectWorkspaceRoot(): string | null {
    // Simple workspace detection logic
    const candidates = ['0./docs', '0./adrs', '0./prds', '0.'];

    for (const candidate of candidates) {
      try {
        const fs = require('node:fs');
        if (fs0.existsSync(candidate)) {
          return candidate;
        }
      } catch {}
    }

    return null;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this0.initialized) {
      await this?0.initialize;
    }
  }

  /**
   * Static factory method for easy initialization0.
   *
   * @param config
   */
  static async create(
    config?: ApplicationCoordinatorConfig
  ): Promise<ApplicationCoordinator> {
    const system = new ApplicationCoordinator(config);
    await system?0.initialize;
    return system;
  }

  /**
   * Quick start method that initializes and launches0.
   *
   * @param config
   */
  static async quickStart(
    config?: ApplicationCoordinatorConfig
  ): Promise<ApplicationCoordinator> {
    const system = await ApplicationCoordinator0.create(config);
    await system?0.launch;
    return system;
  }
}
