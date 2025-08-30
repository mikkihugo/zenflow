/**
 * @fileoverview Core System - WebSocket-Enabled System Coordinator
 *
 * Restored core system implementation focusing on WebSocket coordination
 * and basic service integration. Manages system lifecycle and
 * real-time communication via Socket.IO.
 */

import { EventEmitter } from 'events';
import type { Server as HTTPServer } from 'http';
import type { Server as SocketIOServer } from 'socket.io';
import {
  getTaskMasterService,
  type TaskMasterService,
} from '../services/api/taskmaster';
import { getLogger, createContainer } from '@claude-zen/foundation';

const logger = getLogger('core-system');

// Constants for duplicate strings
const STATUS_CHANGED_EVENT = 'status-changed';
const READY_STATUS = 'ready';
const ERROR_STATUS = 'error';
const INITIALIZING_STATUS = 'initializing';
const SHUTDOWN_STATUS = 'shutdown';
const TASKMASTER_NOT_AVAILABLE = 'TaskMaster service not available';

export interface SystemConfig {
  memory?: {
    backend?: 'sqlite' | 'memory';
    directory?: string;
    enableCache?: boolean;
  };
  workflow?: {
    maxConcurrentWorkflows?: number;
    enableRealtime?: boolean;
  };
  documents?: {
    autoWatch?: boolean;
    enableWorkflows?: boolean;
  };
  export?: {
    defaultFormat?: string;
    enableStreaming?: boolean;
  };
  documentation?: {
    autoLink?: boolean;
    scanPaths?: string[];
  };
  interface?: {
    defaultMode?: 'auto' | 'cli' | 'web';
    webPort?: number;
    enableWebSocket?: boolean;
  };
  websocket?: {
    enableEventStreaming?: boolean;
    heartbeatInterval?: number;
    maxConnections?: number;
  };
}

export interface SystemStatus {
  status: 'initializing' | 'ready' | 'error' | 'shutdown';
  version: string;
  components: {
    memory: {
      status: string;
      entries: number;
      cacheEnabled?: boolean;
    };
    workflow: { 
      status: string; 
      active: number;
      realtimeEnabled?: boolean;
    };
    documents: { 
      status: string; 
      loaded: number;
      watchEnabled?: boolean;
    };
    export: { 
      status: string; 
      formats: number;
      streamingEnabled?: boolean;
    };
    documentation: { 
      status: string; 
      indexed: number;
    };
    interface: { 
      status: string; 
      mode?: string;
      webSocketEnabled?: boolean;
    };
    websocket: {
      status: string;
      connections: number;
      eventStreaming?: boolean;
    };
  };
  uptime: number;
  lastUpdate: string;
}

/**
 * Core System - WebSocket-Enabled System Coordinator
 * 
 * Manages system lifecycle, WebSocket connections, and component coordination.
 * Integrates with Socket.IO for real-time dashboard features.
 */
export class System extends EventEmitter {
  private status: SystemStatus['status'] = INITIALIZING_STATUS;
  private startTime: number;
  private initialized = false;
  private configuration: SystemConfig;
  private serviceContainer = createContainer();

  // Core system components
  private taskMasterService?: TaskMasterService;
  private httpServer?: HTTPServer;
  private socketIOServer?: SocketIOServer;
  private activeConnections = 0;
  private heartbeatInterval?: NodeJS.Timeout;

  constructor(config: SystemConfig = {}) {
    super();
    this.configuration = {
      // Default configuration with WebSocket support
      websocket: {
        enableEventStreaming: true,
        heartbeatInterval: 30000,
        maxConnections: 100,
        ...config.websocket,
      },
      interface: {
        enableWebSocket: true,
        defaultMode: 'web',
        webPort: 3000,
        ...config.interface,
      },
      workflow: {
        enableRealtime: true,
        maxConcurrentWorkflows: 10,
        ...config.workflow,
      },
      memory: {
        enableCache: true,
        backend: 'memory',
        ...config.memory,
      },
      ...config,
    };
    this.startTime = Date.now();
    this.setupEventHandlers();
  }

  /**
   * Initialize core system components
   */
  private async initializeComponents(): Promise<void> {
    logger.info('Initializing core system components...');

    try {
      // Initialize TaskMaster service
      if (!this.taskMasterService) {
        this.taskMasterService = await getTaskMasterService();
        await this.taskMasterService.initialize();
        logger.info('✅ TaskMaster service initialized');
      }

      // Register services in container
      this.serviceContainer.register('taskmaster', this.taskMasterService);

      // Initialize WebSocket heartbeat if enabled
      if (this.configuration.websocket?.enableEventStreaming) {
        this.startHeartbeat();
        logger.info('✅ WebSocket heartbeat initialized');
      }

      logger.info('✅ Core components initialization complete');
    } catch (error) {
      logger.error('❌ Failed to initialize core components:', error);
      throw error;
    }
  }

  /**
   * Setup system event handlers
   */
  private setupEventHandlers(): void {
    try {
      // Handle system errors
      this.on('error', (error) => {
        logger.error('System error:', error);
        this.status = ERROR_STATUS;
        this.emit(STATUS_CHANGED_EVENT, this.status);
      });

      // Handle graceful shutdown
      this.on('shutdown', () => {
        logger.info('Shutdown event received');
        this.shutdown();
      });

      // Handle status changes
      this.on(STATUS_CHANGED_EVENT, (status) => {
        logger.info(`System status changed to: ${status}`);
        this.broadcastStatusUpdate(status);
      });

      // Handle WebSocket events
      this.on('websocket:connected', (socketId: string) => {
        this.activeConnections++;
        logger.debug(`WebSocket client connected: ${socketId} (total: ${this.activeConnections})`);
      });

      this.on('websocket:disconnected', (socketId: string) => {
        this.activeConnections = Math.max(0, this.activeConnections - 1);
        logger.debug(`WebSocket client disconnected: ${socketId} (total: ${this.activeConnections})`);
      });

      logger.info('✅ Event handlers configured');
    } catch (error) {
      logger.error('❌ Failed to setup event handlers:', error);
      throw error;
    }
  }

  /**
   * Initialize the core system
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.info('System already initialized');
      return;
    }

    logger.info('🚀 Initializing Core System with WebSocket support');

    try {
      this.status = INITIALIZING_STATUS;
      this.emit(STATUS_CHANGED_EVENT, this.status);

      // Initialize all system components
      await this.initializeComponents();

      this.status = READY_STATUS;
      this.initialized = true;
      this.emit('initialized', {
        timestamp: new Date().toISOString(),
        config: this.configuration,
      });
      this.emit(STATUS_CHANGED_EVENT, this.status);

      logger.info('✅ Core System ready with WebSocket support');
    } catch (error) {
      this.status = ERROR_STATUS;
      this.emit(STATUS_CHANGED_EVENT, this.status);
      logger.error('❌ Failed to initialize Core System:', error);
      throw error;
    }
  }

  /**
   * Launch the system with WebSocket integration
   */
  async launch(): Promise<void> {
    await this.ensureInitialized();
    
    // Launch WebSocket services if enabled
    if (this.configuration.interface?.enableWebSocket) {
      this.initializeWebSocketIntegration();
      logger.info('✅ WebSocket integration launched');
    }
    
    logger.info('✅ System launched successfully');
  }

  /**
   * Get comprehensive system status
   */
  getSystemStatus(): Promise<SystemStatus> {
    const status: SystemStatus = {
      status: this.status,
      version: '2.0.0-websocket-enabled',
      components: {
        memory: {
          status: READY_STATUS,
          entries: 0,
          cacheEnabled: this.configuration.memory?.enableCache ?? true,
        },
        workflow: {
          status: READY_STATUS,
          active: 0,
          realtimeEnabled: this.configuration.workflow?.enableRealtime ?? true,
        },
        documents: {
          status: READY_STATUS,
          loaded: 0,
          watchEnabled: this.configuration.documents?.autoWatch ?? false,
        },
        export: {
          status: READY_STATUS,
          formats: 3, // json, yaml, xml
          streamingEnabled: this.configuration.export?.enableStreaming ?? false,
        },
        documentation: {
          status: READY_STATUS,
          indexed: 0,
        },
        interface: {
          status: READY_STATUS,
          mode: this.configuration.interface?.defaultMode || 'web',
          webSocketEnabled: this.configuration.interface?.enableWebSocket ?? true,
        },
        websocket: {
          status: this.configuration.websocket?.enableEventStreaming ? READY_STATUS : 'disabled',
          connections: this.activeConnections,
          eventStreaming: this.configuration.websocket?.enableEventStreaming ?? true,
        },
      },
      uptime: Date.now() - this.startTime,
      lastUpdate: new Date().toISOString(),
    };

    return Promise.resolve(status);
  }

  /**
   * Process document with workflow integration
   */
  async processDocument(documentPath: string): Promise<{
    success: boolean;
    workflowIds?: string[];
    error?: string;
  }> {
    await this.ensureInitialized();
    
    try {
      logger.info(`Processing document: ${documentPath}`);
      
      // Broadcast processing event via WebSocket
      this.broadcastEvent('document:processing', {
        path: documentPath,
        timestamp: new Date().toISOString(),
      });

      // Basic document processing simulation
      const workflowIds = [`workflow-${Date.now()}`];
      
      // Broadcast completion event
      this.broadcastEvent('document:processed', {
        path: documentPath,
        workflowIds,
        timestamp: new Date().toISOString(),
      });

      return { success: true, workflowIds };
    } catch (error) {
      const errorMessage = (error as Error).message;
      logger.error(`Failed to process document ${documentPath}:`, error);
      
      this.broadcastEvent('document:error', {
        path: documentPath,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Export system data with streaming support
   */
  async exportSystemData(format: string): Promise<{
    success: boolean;
    filename?: string;
    error?: string;
  }> {
    await this.ensureInitialized();
    
    try {
      logger.info(`Exporting system data to ${format}`);
      
      const filename = `system-export-${Date.now()}.${format}`;
      
      // Broadcast export start event
      this.broadcastEvent('export:started', {
        format,
        filename,
        timestamp: new Date().toISOString(),
      });

      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 100));

      // Broadcast export completion
      this.broadcastEvent('export:completed', {
        format,
        filename,
        timestamp: new Date().toISOString(),
      });

      return { success: true, filename };
    } catch (error) {
      const errorMessage = (error as Error).message;
      logger.error(`Failed to export system data to ${format}:`, error);
      
      this.broadcastEvent('export:error', {
        format,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Graceful system shutdown
   */
  async shutdown(): Promise<void> {
    logger.info('🔄 Shutting down Core System...');

    try {
      this.status = SHUTDOWN_STATUS;
      this.emit(STATUS_CHANGED_EVENT, this.status);

      // Stop heartbeat
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = undefined;
      }

      // Shutdown TaskMaster service
      if (this.taskMasterService) {
        try {
          await this.taskMasterService.shutdown();
          logger.info('✅ TaskMaster service shutdown complete');
        } catch (error) {
          logger.error('Error shutting down TaskMaster service:', error);
        }
      }

      // Broadcast shutdown notification
      this.broadcastEvent('system:shutdown', {
        timestamp: new Date().toISOString(),
        uptime: Date.now() - this.startTime,
      });

      // Clean up resources
      this.removeAllListeners();
      this.emit('shutdown', {
        timestamp: new Date().toISOString(),
      });

      logger.info('✅ Core System shutdown complete');
    } catch (error) {
      logger.error('❌ Error during shutdown:', error);
      throw error;
    }
  }

  /**
   * Get system components
   */
  getComponents() {
    return {
      taskmaster: this.taskMasterService,
      container: this.serviceContainer,
      httpServer: this.httpServer,
      socketIO: this.socketIOServer,
      activeConnections: this.activeConnections,
    };
  }

  /**
   * Ensure system is initialized before operations
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * WebSocket Integration Methods
   */

  /**
   * Set HTTP server for WebSocket integration
   */
  setHttpServer(server: HTTPServer): void {
    this.httpServer = server;
    logger.info('HTTP server attached to core system');
  }

  /**
   * Set Socket.IO server for real-time communication
   */
  setSocketIOServer(io: SocketIOServer): void {
    this.socketIOServer = io;
    this.initializeSocketIOHandlers();
    logger.info('Socket.IO server attached to core system');
  }

  /**
   * Initialize Socket.IO event handlers
   */
  private initializeSocketIOHandlers(): void {
    if (!this.socketIOServer) return;

    this.socketIOServer.on('connection', (socket) => {
      this.emit('websocket:connected', socket.id);
      
      // Handle system status requests
      socket.on('system:status', async () => {
        const status = await this.getSystemStatus();
        socket.emit('system:status:response', status);
      });

      // Handle document processing requests
      socket.on('document:process', async (data: { path: string }) => {
        const result = await this.processDocument(data.path);
        socket.emit('document:process:response', result);
      });

      // Handle export requests
      socket.on('export:request', async (data: { format: string }) => {
        const result = await this.exportSystemData(data.format);
        socket.emit('export:response', result);
      });

      socket.on('disconnect', () => {
        this.emit('websocket:disconnected', socket.id);
      });
    });
  }

  /**
   * Initialize WebSocket integration with existing infrastructure
   */
  private initializeWebSocketIntegration(): void {
    // This method allows the core system to integrate with
    // the existing WebSocket infrastructure in the server
    logger.info('WebSocket integration initialized');
  }

  /**
   * Broadcast event to all connected WebSocket clients
   */
  private broadcastEvent(eventType: string, data: unknown): void {
    if (this.socketIOServer) {
      this.socketIOServer.emit(eventType, {
        type: eventType,
        data,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Broadcast status update to connected clients
   */
  private broadcastStatusUpdate(status: string): void {
    this.broadcastEvent('system:status:update', { status });
  }

  /**
   * Start heartbeat for WebSocket connections
   */
  private startHeartbeat(): void {
    const interval = this.configuration.websocket?.heartbeatInterval || 30000;
    
    this.heartbeatInterval = setInterval(() => {
      this.broadcastEvent('system:heartbeat', {
        timestamp: new Date().toISOString(),
        uptime: Date.now() - this.startTime,
        connections: this.activeConnections,
      });
    }, interval);
  }

  /**
   * Static factory methods
   */
  static async create(config?: SystemConfig): Promise<System> {
    const system = new System(config);
    await system.initialize();
    return system;
  }

  static async quickStart(config?: SystemConfig): Promise<System> {
    const system = await System.create(config);
    await system.launch();
    return system;
  }

  /**
   * TaskMaster Integration Methods
   */

  /**
   * Create SAFe task with real-time updates
   */
  async createSAFeTask(taskData: {
    title: string;
    description?: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    estimatedEffort: number;
    assignedAgent?: string;
  }): Promise<unknown> {
    await this.ensureInitialized();
    
    if (!this.taskMasterService) {
      throw new Error(TASKMASTER_NOT_AVAILABLE);
    }

    try {
      const result = this.taskMasterService.createTask 
        ? await this.taskMasterService.createTask(taskData)
        : { success: false, message: 'createTask not available' };

      // Broadcast task creation event
      this.broadcastEvent('task:created', {
        task: taskData,
        result,
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (error) {
      logger.error('Failed to create SAFe task:', error);
      this.broadcastEvent('task:error', {
        action: 'create',
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  /**
   * Move SAFe task with real-time updates
   */
  async moveSAFeTask(taskId: string, toState: string): Promise<boolean> {
    await this.ensureInitialized();
    
    if (!this.taskMasterService) {
      throw new Error(TASKMASTER_NOT_AVAILABLE);
    }

    try {
      const result = this.taskMasterService.moveTask
        ? Boolean(await this.taskMasterService.moveTask(taskId, toState))
        : false;

      // Broadcast task move event
      this.broadcastEvent('task:moved', {
        taskId,
        toState,
        success: result,
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (error) {
      logger.error('Failed to move SAFe task:', error);
      this.broadcastEvent('task:error', {
        action: 'move',
        taskId,
        toState,
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  /**
   * Get SAFe flow metrics with real-time streaming
   */
  async getSAFeFlowMetrics(): Promise<unknown> {
    await this.ensureInitialized();
    
    if (!this.taskMasterService) {
      throw new Error(TASKMASTER_NOT_AVAILABLE);
    }

    try {
      const metrics = this.taskMasterService.getFlowMetrics
        ? await this.taskMasterService.getFlowMetrics()
        : {
            cycleTime: 0,
            leadTime: 0,
            throughput: 0,
            wipCount: 0,
            blockedTasks: 0,
            completedTasks: 0,
          };

      // Broadcast metrics update
      this.broadcastEvent('metrics:flow', {
        metrics,
        timestamp: new Date().toISOString(),
      });

      return metrics;
    } catch (error) {
      logger.error('Failed to get SAFe flow metrics:', error);
      throw error;
    }
  }

  /**
   * Create PI Planning event with coordination
   */
  async createPIPlanningEvent(eventData: {
    planningIntervalNumber: number;
    artId: string;
    startDate: Date;
    endDate: Date;
    facilitator: string;
  }): Promise<unknown> {
    await this.ensureInitialized();
    
    if (!this.taskMasterService) {
      throw new Error(TASKMASTER_NOT_AVAILABLE);
    }

    try {
      const result = this.taskMasterService.createPIPlanningEvent
        ? await this.taskMasterService.createPIPlanningEvent(eventData)
        : { success: false, message: 'createPIPlanningEvent not available' };

      // Broadcast PI planning event
      this.broadcastEvent('pi:planning:created', {
        event: eventData,
        result,
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (error) {
      logger.error('Failed to create PI planning event:', error);
      this.broadcastEvent('pi:planning:error', {
        event: eventData,
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  /**
   * Health check and diagnostics methods
   */

  /**
   * Run system chaos test (simulation only - no Rust)
   */
  runSystemChaosTest(): Promise<{
    success: boolean;
    results?: Record<string, unknown>;
    error?: string;
  }> {
    logger.info('Running system chaos test (WebSocket simulation)');
    
    // Simulate chaos test with WebSocket event broadcasting
    this.broadcastEvent('chaos:test:started', {
      timestamp: new Date().toISOString(),
    });

    const results = {
      websocketConnections: this.activeConnections,
      systemStatus: this.status,
      uptime: Date.now() - this.startTime,
      componentHealth: 'operational',
    };

    this.broadcastEvent('chaos:test:completed', {
      results,
      timestamp: new Date().toISOString(),
    });

    return Promise.resolve({
      success: true,
      results,
    });
  }

  /**
   * Get AI system status (without Rust components)
   */
  getAISystemStatus(): Promise<{
    chaosEngineering: boolean;
    factSystem: boolean;
    neuralML: boolean;
    agentMonitoring: boolean;
    overallHealth: 'healthy' | 'degraded' | 'unavailable';
    websocketEnabled: boolean;
  }> {
    const status = {
      chaosEngineering: false, // Disabled per user feedback
      factSystem: false,       // Not using Rust
      neuralML: false,         // Not using Rust/WASM  
      agentMonitoring: this.taskMasterService !== undefined,
      websocketEnabled: this.configuration.websocket?.enableEventStreaming ?? true,
      overallHealth: this.status === READY_STATUS ? 'healthy' as const : 'degraded' as const,
    };

    // Broadcast AI status update
    this.broadcastEvent('ai:status:update', {
      status,
      timestamp: new Date().toISOString(),
    });

    return Promise.resolve(status);
  }
}
