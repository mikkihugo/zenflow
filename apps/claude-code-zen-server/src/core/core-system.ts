/**
 * @fileoverview Core System Coordinator for Claude Code Zen
 *
 * Clean, focused system coordinator that manages core components with a well-architected,
 * single-responsibility design. This module replaces bloated "unified" architectures with
 * a clean dependency injection model and clear component boundaries.
 *
 * Key Features:
 * - Multi-backend memory management (JSON, SQLite, LanceDB)
 * - Document workflow processing (Vision → ADRs → PRDs → Epics → Features → Tasks → Code)
 * - Unified document processing with file-based and database-driven support
 * - Multi-format data export capabilities
 * - Documentation indexing and cross-linking
 * - Multi-interface support (CLI, TUI, Web)
 * - Event-driven architecture with comprehensive observability
 * - Clean component isolation for enhanced testability
 *
 * Architecture Design Principles:
 * - **Single Responsibility**: Each component has one clear, focused purpose
 * - **Clean Dependencies**: Explicit dependency injection without circular imports
 * - **Clear Boundaries**: Well-defined interfaces between system components
 * - **Enhanced Testability**: All components can be tested in complete isolation
 * - **Maintainable Design**: Eliminates bloated "unified" classes
 *
 * Component Architecture:
 * - **BrainCoordinator**: Foundation storage layer with pluggable backends
 * - **WorkflowEngine**: Document processing pipelines and state management
 * - **DocumentProcessor**: Unified document ingestion and transformation
 * - **ExportManager**: Multi-format data export and serialization
 * - **DocumentationManager**: Cross-reference indexing and link management
 * - **InterfaceManager**: Multi-modal user interface coordination
 *
 * @author Claude Code Zen Team
 * @since 1.0.0-alpha.43 (Clean Architecture v2.0.0)
 * @version 1.0.0-alpha.43
 *
 * @see {@link https://nodejs.org/api/events.html} Node.js EventEmitter
 * @see {@link BrainCoordinator} Multi-backend memory management
 * @see {@link WorkflowEngine} Document workflow processing
 * @see {@link DocumentProcessor} Document ingestion and transformation
 *
 * @requires node:events - For event-driven architecture
 * @requires ../config/logging-config.ts - Structured logging configuration
 *
 * @example
 * ```typescript
 * // Production system initialization with comprehensive configuration
 * const coreSystem = new System({
 *   memory: {
 *     backend: 'lancedb',
 *     directory: './data/production',
 *     namespace: 'claude-zen-prod'
 *   },
 *   workflow: {
 *     maxConcurrentWorkflows: 20,
 *     persistWorkflows: true
 *   },
 *   interface: {
 *     defaultMode: 'web',
 *     webPort: 8080
 *   },
 *   documents: {
 *     autoWatch: true,
 *     enableWorkflows: true
 *   },
 *   export: {
 *     defaultFormat: 'json',
 *     outputPath: './exports'
 *   },
 *   documentation: {
 *     autoLink: true,
 *     scanPaths: ['./docs', './src']
 *   }
 * });
 *
 * // Initialize and launch system
 * await coreSystem.initialize();
 * await coreSystem.launch();
 *
 * // Process complex document workflow
 * const workflowResult = await coreSystem.processDocument(
 *   './docs/vision/ai-research-roadmap.md',
 *   { enableADRGeneration: true, createPRDs: true }
 * );
 *
 * // Monitor system health and performance
 * const status = await coreSystem.getSystemStatus();
 * console.log(`System Health: ${status.status}`);
 * console.log(`Active Workflows: ${status.components.workflow.active}`);
 * console.log(`Memory Entries: ${status.components.memory.entries}`);
 *
 * // Access individual components for specialized operations
 * const components = coreSystem.getComponents();
 *
 * // Advanced memory operations
 * await components.memory.store('research-findings', {
 *   topic: 'neural-architecture-search',
 *   findings: ['transformer-efficiency', 'attention-mechanisms'],
 *   confidence: 0.94,
 *   timestamp: Date.now()
 * });
 *
 * // Export system state for analysis
 * await coreSystem.exportSystem('comprehensive-backup', {
 *   format: 'json',
 *   compression: true,
 *   includeMetrics: true,
 *   includeMemoryData: true
 * });
 * ```
 *
 * @migration
 * ## Migration from ApplicationCoordinator
 *
 * **Legacy Pattern (Deprecated):**
 * ```typescript
 * const system = new ApplicationCoordinator(config);
 * await system.initialize();
 * await system.launch();
 * ```
 *
 * **New Clean Architecture Pattern:**
 * ```typescript
 * const system = new System(config);
 * await system.initialize();
 * await system.launch();
 * ```
 *
 * The API maintains compatibility while providing a much cleaner internal architecture.
 */

import { getLogger, recordMetric, withTrace, createCircuitBreaker , AgentMonitoring } from '@claude-zen/foundation';
import { EventEmitter } from 'eventemitter3';
import { DocumentProcessor } from './document-processor';
import { DocumentationManager } from './documentation-manager';
import { ExportSystem as ExportManager } from './export-manager';
import { InterfaceManager } from './interface-manager';

import { BrainCoordinator , NeuralML } from '@claude-zen/brain';
import { WorkflowEngine } from '../workflows/workflow-engine';

// 🔥 AI-POWERED ENHANCEMENTS: Comprehensive @claude-zen package integration
import { ChaosEngineering } from '@claude-zen/foundation';
import { 
  initializeCoordinationFactSystem,
  storeCoordinationFact
} from '@claude-zen/knowledge';
import { TypedEventBus, createEventBus } from '@claude-zen/event-system';

/**
 * Export options interface for system state serialization.
 *
 * Configures how system data should be exported, including format options,
 * compression settings, and data inclusion preferences.
 *
 * @interface ExportOptions
 *
 * @property {string} filename - Custom filename for the export (without extension)
 * @property {boolean} compression - Whether to compress the exported data
 * @property {boolean} includeMetrics - Include system performance metrics in export
 * @property {boolean} includeMemoryData - Include complete memory store contents
 * @property {unknown} [key: string] - Additional format-specific options
 *
 * @example
 * ```typescript
 * const exportOptions: ExportOptions = {
 *   filename: 'system-backup-2024',
 *   compression: true,
 *   includeMetrics: true,
 *   includeMemoryData: false, // Exclude memory for privacy
 *   format: 'json',
 *   prettyPrint: true
 * };
 * ```
 */
interface ExportOptions {
  filename?: string;
  compression?: boolean;
  includeMetrics?: boolean;
  includeMemoryData?: boolean;
  [key: string]: unknown;
}

const logger = getLogger('CoreSystem');

/**
 * Comprehensive system configuration interface with clear, focused options.
 *
 * Defines all configurable aspects of the Claude Code Zen core system,
 * organized by component responsibility for clean architecture boundaries.
 *
 * @interface SystemConfig
 *
 * @property {object} memory - Memory system configuration options
 * @property {object} workflow - Workflow engine configuration options
 * @property {object} interface - User interface management configuration
 * @property {object} documents - Document processing configuration
 * @property {object} export - Data export system configuration
 * @property {object} documentation - Documentation management configuration
 *
 * @example
 * ```typescript
 * const config: SystemConfig = {
 *   memory: {
 *     backend: 'lancedb',
 *     directory: './data/production',
 *     namespace: 'research-project'
 *   },
 *   workflow: {
 *     maxConcurrentWorkflows: 15,
 *     persistWorkflows: true
 *   },
 *   interface: {
 *     defaultMode: 'tui',
 *     webPort: 3000
 *   },
 *   documents: {
 *     autoWatch: true,
 *     enableWorkflows: true
 *   },
 *   export: {
 *     defaultFormat: 'yaml',
 *     outputPath: './exports/research'
 *   },
 *   documentation: {
 *     autoLink: true,
 *     scanPaths: ['./research', './papers', './notes']
 *   }
 * };
 * ```
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
 * Comprehensive system status interface with clear component boundaries.
 *
 * Provides detailed status information for all system components,
 * performance metrics, and operational health indicators.
 *
 * @interface SystemStatus
 *
 * @property {'initializing' | 'ready' | 'error' | 'shutdown'} status - Overall system operational state
 * @property {string} version - Current system version identifier
 * @property {object} components - Status of all core system components
 * @property {number} uptime - System uptime in milliseconds
 * @property {string} lastUpdate - SO timestamp of last status update
 *
 * @example
 * ```typescript
 * const status: SystemStatus = {
 *   status: 'ready',
 *   version: '1.0.0-alpha.43',
 *   components: {
 *     memory: { status: 'ready', entries: 15420 },
 *     workflow: { status: 'ready', active: 3 },
 *     documents: { status: 'ready', loaded: 847 },
 *     export: { status: 'ready', formats: 5 },
 *     documentation: { status: 'ready', indexed: 2341 },
 *     interface: { status: 'ready', mode: 'web' }
 *   },
 *   uptime: 3600000, // 1 hour
 *   lastUpdate: '2024-01-15T10:30:00.000Z'
 * };
 *
 * // Health monitoring usage
 * if (status.status === 'error') {
 *   console.error('System in error state, checking components...');
 *   Object.entries(status.components).forEach(([name, component]) => {
 *     if (component.status !== 'ready') {
 *       console.error(`Component ${name} is ${component.status}`);
 *     }
 *   });
 * }
 * ```
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
 * Clean, focused core system coordinator implementing clean architecture principles.
 *
 * The System class serves as the main entry point and coordinator for all Claude Code Zen
 * components, providing a clean alternative to bloated "unified" architectures. It implements
 * dependency injection, clear component boundaries, and comprehensive lifecycle management.
 *
 * Key Responsibilities:
 * - **Component Coordination**: Manages initialization and lifecycle of all core components
 * - **Dependency Injection**: Provides clean dependency management between components
 * - **Event Orchestration**: Coordinates inter-component communication through events
 * - **System Health**: Monitors component health and provides comprehensive status reporting
 * - **Interface Management**: Coordinates multiple user interface modes (CLI, TUI, Web)
 * - **Workflow Processing**: Orchestrates document processing and workflow execution
 *
 * Architecture Benefits:
 * - Each component has single, well-defined responsibility
 * - Clean dependency injection without circular dependencies
 * - Components can be tested in complete isolation
 * - Clear interfaces between system boundaries
 * - Event-driven coordination for loose coupling
 *
 * @class System
 * @extends {EventEmitter}
 *
 * @param {SystemConfig} config - Comprehensive system configuration options
 *
 * @fires System#initialized - Emitted when system initialization is complete
 * @fires System#launched - Emitted when system launch is successful
 * @fires System#shutdown - Emitted when system shutdown begins
 * @fires System#error - Emitted when system errors occur
 * @fires System#componentReady - Emitted when individual components become ready
 * @fires System#statusUpdate - Emitted when system status changes
 *
 * @example
 * ```typescript
 * // Create system with comprehensive configuration
 * const system = new System({
 *   memory: {
 *     backend: 'lancedb',
 *     directory: './data/research',
 *     namespace: 'ai-research-project'
 *   },
 *   workflow: {
 *     maxConcurrentWorkflows: 12,
 *     persistWorkflows: true
 *   },
 *   interface: {
 *     defaultMode: 'auto',
 *     webPort: 4000
 *   },
 *   documents: {
 *     autoWatch: true,
 *     enableWorkflows: true
 *   }
 * });
 *
 * // Set up event listeners for system monitoring
 * system.on('initialized', () => {
 *   console.log('Core system initialized successfully');
 * });
 *
 * system.on('componentReady', ({ component, status }) => {
 *   console.log(`Component ${component} is now ${status}`);
 * });
 *
 * system.on('error', ({ error, component }) => {
 *   console.error(`System error in ${component}:`, error.message);
 * });
 *
 * // Initialize and launch
 * try {
 *   await system.initialize();
 *   await system.launch();
 *
 *   // Process research documents
 *   const result = await system.processDocument(
 *     './research/neural-architecture-search.md',
 *     {
 *       generateADR: true,
 *       createWorkflows: true,
 *       linkDocumentation: true
 *     }
 *   );
 *
 *   console.log('Document processing result:', result);
 *
 *   // Monitor system health
 *   setInterval(async () => {
 *     const status = await system.getSystemStatus();
 *     if (status.status !== 'ready') {
 *       console.warn('System health check failed:', status);
 *     }
 *   }, 30000); // Every 30 seconds
 *
 * } catch (error) {
 *   console.error('System startup failed:', error);
 *   await system.shutdown();
 * }
 * ```
 *
 * @see {@link SystemConfig} Configuration interface
 * @see {@link SystemStatus} Status reporting interface
 * @see {@link ExportOptions} Export configuration options
 */
export class System extends EventEmitter {
  private config: SystemConfig;
  private status: SystemStatus['status'] = 'initializing';
  private startTime: number;

  // Core components with clear responsibilities
  private memorySystem!: BrainCoordinator;
  private workflowEngine!: WorkflowEngine;
  private documentProcessor!: DocumentProcessor;
  private exportManager!: ExportManager;
  private documentationManager!: DocumentationManager;
  private interfaceManager!: InterfaceManager;
  
  // 🧠 AI-POWERED ENHANCEMENTS: Advanced coordination systems
  private chaosEngineering?: ChaosEngineering;
  private factSystemInitialized = false;
  private neuralML?: NeuralML;
  private agentMonitoring?: AgentMonitoring;
  private aiEventBus?: TypedEventBus;
  private systemCircuitBreaker = createCircuitBreaker({
    timeout: 30000,
    errorThresholdPercentage: 50,
    resetTimeout: 60000
  });

  private initialized = false;

  constructor(config: SystemConfig = {}) {
    super();
    this.config = config;
    this.startTime = Date.now();

    // Fix EventEmitter memory leak warnings
    this.setMaxListeners(20);

    // Initialize components with clear dependencies
    this.initializeComponents();
    this.setupEventHandlers();
  }

  /**
   * Initialize all core components with proper dependency injection and AI enhancements.
   */
  private initializeComponents(): void {
    // Memory system - foundation component
    this.memorySystem = new BrainCoordinator({
      backend: this.config.memory?.backend || 'json',
      path: this.config.memory?.directory || './data/memory',
    });

    // Workflow engine - depends on memory
    this.workflowEngine = new WorkflowEngine(this.memorySystem, {
      maxConcurrentWorkflows:
        this.config.workflow?.maxConcurrentWorkflows || 10,
      workspaceRoot: './',
      templatesPath: './templates',
      outputPath: './output',
      defaultTimeout: 300000,
      enableMetrics: true,
      enablePersistence: true,
      storageBackend: { type: 'database', config: {} },
    });

    // Document processor - depends on memory and workflow
    this.documentProcessor = new DocumentProcessor(
      this.memorySystem,
      this.workflowEngine,
      {
        autoWatch: this.config.documents?.autoWatch !== false,
        enableWorkflows: this.config.documents?.enableWorkflows !== false,
      }
    );

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
    
    // 🧠 AI-POWERED ENHANCEMENTS: Initialize advanced coordination systems
    this.initializeAIEnhancements();

    logger.info('Core components initialized with clean architecture and AI enhancements');
  }
  
  /**
   * Initialize AI-powered enhancements for the core system.
   */
  private initializeAIEnhancements(): void {
    try {
      // Event bus for AI coordination
      this.aiEventBus = createEventBus();
      
      // Chaos engineering for system resilience
      this.chaosEngineering = new ChaosEngineering({
        enabled: true,
        resilience: { failureInjection: true, recoveryTesting: true }
      });
      
      // Initialize knowledge system with high-performance Rust bridge
      await initializeCoordinationFactSystem();
      this.factSystemInitialized = true;
      logger.info('✅ Knowledge system initialized with Rust bridge + TypeScript fallback');
      
      // Neural ML for document processing optimization
      this.neuralML = new NeuralML({
        enableRustBackend: true,
        enableGPUAcceleration: false // Safe default
      });
      
      // Agent monitoring for system health
      this.agentMonitoring = new AgentMonitoring({
        healthMonitoring: true,
        performancePrediction: true,
        taskPrediction: false // Not needed for core system
      });
      
      logger.info('🧠 AI enhancements initialized: chaos engineering, fact system, neural ML, agent monitoring');
      
    } catch (error) {
      logger.warn('Failed to initialize some AI enhancements:', error);
      // Continue without AI enhancements if they fail
    }
  }

  /**
   * Setup event handlers for component communication.
   */
  private setupEventHandlers(): void {
    // Document processor events
    this.documentProcessor.on('document:created', async (event) => {
      logger.info(`Document created: ${event.type} - ${event['path']}`);

      // Trigger workflows if enabled
      if (this.config.documents?.enableWorkflows !== false) {
        await this.workflowEngine.processDocumentEvent(
          'document:created',
          event['document']
        );
      }

      // Update documentation index
      await this.documentationManager.indexDocument(event['document']);
    });

    // Workflow engine events
    this.workflowEngine.on('workflow:completed', async (event: unknown) => {
      logger.info(`Workflow completed: ${event['workflowId']}`);

      // Auto-export if configured
      if (this.config.export?.defaultFormat) {
        const workflowData = await this.memorySystem.retrieve(
          `workflow:${event['workflowId']}`
        );
        if (workflowData) {
          await this.exportManager.exportData(
            workflowData,
            this.config.export.defaultFormat
          );
        }
      }
    });

    // Memory system events
    this.memorySystem.on('stored', (event) => {
      logger.debug(`Memory stored: ${event['key']}`);
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
      
      // 🧠 Initialize AI enhancements with circuit breaker protection
      logger.info('🧠 Initializing AI enhancement systems...');
      await this.initializeAISystemsAsync();

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
    options: ExportOptions = {}
  ): Promise<{ success: boolean; filename?: string; error?: string }> {
    await this.ensureInitialized();

    try {
      const systemStatus = await this.getSystemStatus();
      const exportData = {
        system: systemStatus,
        exportedAt: new Date().toISOString(),
      };

      const result = await this.exportManager.exportData(
        exportData,
        format,
        options
      );
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
      // Shutdown AI enhancements first
      logger.info('🧠 Shutting down AI enhancement systems...');
      await this.shutdownAISystemsAsync();
      
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
      // 🧠 AI-POWERED ENHANCEMENTS
      chaosEngineering: this.chaosEngineering,
      factSystemInitialized: this.factSystemInitialized,
      neuralML: this.neuralML,
      agentMonitoring: this.agentMonitoring,
      aiEventBus: this.aiEventBus,
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
   * Initialize AI enhancement systems asynchronously with resilience.
   */
  private async initializeAISystemsAsync(): Promise<void> {
    try {
      await withTrace('ai-systems-initialization', async () => {
        await this.systemCircuitBreaker.fire(async () => {
          const initPromises: Promise<void>[] = [];
          
          if (this.chaosEngineering) {
            initPromises.push(this.chaosEngineering.initialize());
          }
          
          // Knowledge system already initialized during main initialization
          
          if (this.neuralML) {
            initPromises.push(this.neuralML.initialize());
          }
          
          if (this.agentMonitoring) {
            initPromises.push(this.agentMonitoring.initialize());
          }
          
          await Promise.all(initPromises);
          
          // Setup AI event monitoring
          this.setupAIEventHandlers();
          
          recordMetric('core_system_ai_initialized', 1, {
            systems: ['chaos-engineering', 'fact-system', 'neural-ml', 'agent-monitoring'].join(','),
            timestamp: Date.now()
          });
        });
      });
      
      logger.info('✅ AI enhancement systems initialized successfully');
      
    } catch (error) {
      logger.warn('Some AI enhancement systems failed to initialize:', error);
      // Continue without failing the entire system
    }
  }
  
  /**
   * Setup AI-powered event handlers for enhanced coordination.
   */
  private setupAIEventHandlers(): void {
    if (!this.aiEventBus) return;
    
    // Document processing with fact validation
    this.aiEventBus.on('document:processed', async (data: any) => {
      if (this.factSystemInitialized) {
        try {
          // Store document fact via knowledge system
          await storeCoordinationFact({
            type: 'document_processed',
            data: {
              content: data.content,
              source: data.documentPath
            },
            source: 'core-system',
            confidence: 1.0,
            tags: ['document', 'processed']
          });
          logger.debug(`Document processed and stored in knowledge system`);
        } catch (error) {
          logger.warn('Knowledge system storage failed:', error);
        }
      }
    });
    
    // Neural optimization for workflow performance
    this.aiEventBus.on('workflow:performance', async (data: any) => {
      if (this.neuralML) {
        try {
          const optimization = await this.neuralML.optimizeWorkflow({
            workflowType: data.workflowType,
            performanceMetrics: data.metrics,
            historicalData: data.history
          });
          logger.debug(`Neural workflow optimization: ${optimization.improvementFactor}x faster`);
        } catch (error) {
          logger.warn('Neural optimization failed:', error);
        }
      }
    });
    
    logger.info('🔍 AI event handlers configured');
  }
  
  /**
   * Shutdown AI enhancement systems gracefully.
   */
  private async shutdownAISystemsAsync(): Promise<void> {
    try {
      const shutdownPromises: Promise<void>[] = [];
      
      if (this.agentMonitoring) {
        shutdownPromises.push(this.agentMonitoring.shutdown());
      }
      
      if (this.neuralML) {
        shutdownPromises.push(this.neuralML.shutdown());
      }
      
      // Knowledge system handles shutdown automatically
      
      if (this.chaosEngineering) {
        shutdownPromises.push(this.chaosEngineering.shutdown());
      }
      
      await Promise.all(shutdownPromises);
      
      recordMetric('core_system_ai_shutdown', 1, {
        timestamp: Date.now()
      });
      
      logger.info('✅ AI enhancement systems shutdown gracefully');
      
    } catch (error) {
      logger.error('Error shutting down AI enhancement systems:', error);
      // Continue with shutdown even if AI systems fail
    }
  }
  
  /**
   * Run chaos engineering test on the core system.
   */
  async runSystemChaosTest(): Promise<{ success: boolean; results?: any; error?: string }> {
    if (!this.chaosEngineering) {
      return { success: false, error: 'Chaos engineering not available' };
    }
    
    try {
      const results = await this.chaosEngineering.runExperiment({
        name: 'core-system-resilience-test',
        target: 'core-system',
        duration: 30000,
        intensity: 'low'
      });
      
      logger.info('🔥 Core system chaos test completed:', results);
      return { success: true, results };
      
    } catch (error) {
      logger.error('❌ Core system chaos test failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  /**
   * Get AI system status for monitoring.
   */
  async getAISystemStatus(): Promise<{
    chaosEngineering: boolean;
    factSystem: boolean;
    neuralML: boolean;
    agentMonitoring: boolean;
    overallHealth: 'healthy' | 'degraded' | 'unavailable';
  }> {
    const status = {
      chaosEngineering: !!this.chaosEngineering,
      factSystemInitialized: this.factSystemInitialized,
      neuralML: !!this.neuralML,
      agentMonitoring: !!this.agentMonitoring,
      overallHealth: 'healthy' as const
    };
    
    const availableSystems = Object.values(status).filter(Boolean).length - 1;
    const totalSystems = 4;
    
    if (availableSystems === 0) {
      status.overallHealth = 'unavailable';
    } else if (availableSystems < totalSystems * 0.75) {
      status.overallHealth = 'degraded';
    }
    
    return status;
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
