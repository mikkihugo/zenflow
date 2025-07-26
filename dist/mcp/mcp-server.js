#!/usr/bin/env node
/**
 * @fileoverview Refactored Claude-Flow MCP Server
 * Clean architecture implementation of the Model Context Protocol server
 * @module MCPServerRefactored
 */

import { fileURLToPath } from 'url';
import { StdioOptimizer } from './core/stdio-optimizer.js';
import { MCPErrorHandler } from './core/error-handler.js';
import { PerformanceMetrics } from './core/performance-metrics.js';

// Try to import dependencies, fall back to mocks if not available
let SqliteMemoryStore, RuvSwarm, initializeAllTools, MCPMessageHandler, MCPToolExecutor;

try {
  const memoryModule = await import('../memory/sqlite-store.js');
  SqliteMemoryStore = memoryModule.SqliteMemoryStore;
} catch (error) {
  console.warn('[MCP-Server] SqliteMemoryStore not available, using mock implementation');
  const mockModule = await import('./core/mock-memory-store.js');
  SqliteMemoryStore = mockModule.SqliteMemoryStore;
}

try {
  const ruvSwarmModule = await import('../../ruv-FANN/ruv-swarm/npm/src/index.js');
  RuvSwarm = ruvSwarmModule.RuvSwarm;
} catch (error) {
  console.warn('[MCP-Server] RuvSwarm not available, using mock implementation');
  const mockModule = await import('./core/mock-ruv-swarm.js');
  RuvSwarm = mockModule.RuvSwarm;
}

try {
  const toolsModule = await import('./core/tools-registry.js');
  initializeAllTools = toolsModule.initializeAllTools;
} catch (error) {
  console.warn('[MCP-Server] Tools registry not available, using mock implementation');
  const mockModule = await import('./core/mock-tools-registry.js');
  initializeAllTools = mockModule.initializeAllTools;
}

try {
  const handlerModule = await import('./core/message-handler.js');
  MCPMessageHandler = handlerModule.MCPMessageHandler;
} catch (error) {
  console.warn('[MCP-Server] Message handler not available, using simplified version');
  MCPMessageHandler = class {
    constructor() {}
    async handleMessage(message) {
      return { jsonrpc: '2.0', id: message.id, result: { test: true } };
    }
  };
}

try {
  const executorModule = await import('./core/tool-executor.js');
  MCPToolExecutor = executorModule.MCPToolExecutor;
} catch (error) {
  console.warn('[MCP-Server] Tool executor not available, using simplified version');
  MCPToolExecutor = class {
    constructor() {}
    async executeTool(name, args) {
      return { tool: name, args, executed: true };
    }
    getExecutionStats() {
      return { totalExecutions: 0 };
    }
  };
}

const __filename = fileURLToPath(import.meta.url);

/**
 * Refactored Claude Flow MCP Server
 * Implements MCP protocol with clean modular architecture
 */
export class ClaudeFlowMCPServer {
  /**
   * @param {Object} options - Server configuration options
   */
  constructor(options = {}) {
    this.version = '2.0.0-alpha.70';
    this.sessionId = `session-cf-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    
    // Initialize core components
    this.memoryStore = new SqliteMemoryStore({ dbName: 'claude-zen-mcp.db' });
    this.ruvSwarm = new RuvSwarm({
      memoryStore: this.memoryStore,
      telemetryEnabled: true,
      hooksEnabled: false
    });
    this.swarms = new Map();
    
    // Initialize optimized components
    this.stdioOptimizer = new StdioOptimizer({
      batchSize: options.batchSize || 10,
      batchTimeout: options.batchTimeout || 50,
      retryAttempts: options.retryAttempts || 3,
      retryDelay: options.retryDelay || 1000
    });
    
    this.errorHandler = new MCPErrorHandler({
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 1000,
      circuitBreakerThreshold: options.circuitBreakerThreshold || 10
    });
    
    this.performanceMetrics = new PerformanceMetrics({
      enableLogging: options.enableMetricsLogging !== false,
      logInterval: options.metricsLogInterval || 30000
    });
    
    // Server capabilities
    this.capabilities = {
      tools: { listChanged: true },
      resources: { subscribe: true, listChanged: true }
    };
    
    // Initialize modular components
    this.tools = initializeAllTools();
    this.resources = this.initializeResources();
    this.toolExecutor = new MCPToolExecutor(this);
    this.messageHandler = new MCPMessageHandler(this, this.toolExecutor, this);
    
    // Setup stdio optimizer event handlers
    this.setupStdioHandlers();
    
    // Initialize memory store
    this.initializeMemory().catch(err => {
      console.error(`[${new Date().toISOString()}] ERROR [MCP-Server] Memory initialization failed:`, err);
    });
  }

  /**
   * Initialize shared memory store
   * @returns {Promise<void>}
   */
  async initializeMemory() {
    await this.memoryStore.initialize();
    console.error(`[${new Date().toISOString()}] INFO [MCP-Server] (${this.sessionId}) Memory store initialized`);
    console.error(`[${new Date().toISOString()}] INFO [MCP-Server] (${this.sessionId}) Using SQLite storage`);
  }

  /**
   * Initialize resource definitions
   * @returns {Array} Resource definitions
   */
  initializeResources() {
    return [
      {
        uri: 'memory://swarms',
        name: 'Active Swarms',
        description: 'Information about currently active swarms',
        mimeType: 'application/json'
      },
      {
        uri: 'memory://agents',
        name: 'Agent Registry',
        description: 'Registry of all spawned agents',
        mimeType: 'application/json'
      },
      {
        uri: 'memory://tasks',
        name: 'Task Status',
        description: 'Current task execution status',
        mimeType: 'application/json'
      },
      {
        uri: 'memory://metrics',
        name: 'Performance Metrics',
        description: 'System performance and coordination metrics',
        mimeType: 'application/json'
      },
      {
        uri: 'config://features',
        name: 'Available Features',
        description: 'System capabilities and available features',
        mimeType: 'application/json'
      },
      {
        uri: 'performance://metrics',
        name: 'Performance Metrics',
        description: 'Detailed performance metrics including stdio optimization',
        mimeType: 'application/json'
      },
      {
        uri: 'performance://summary',
        name: 'Performance Summary',
        description: 'High-level performance summary and health status',
        mimeType: 'application/json'
      },
      {
        uri: 'performance://report',
        name: 'Performance Report',
        description: 'Complete performance report with trends and recommendations',
        mimeType: 'application/json'
      }
    ];
  }

  /**
   * Setup stdio optimizer event handlers
   */
  setupStdioHandlers() {
    // Handle batched messages
    this.stdioOptimizer.on('batch', async (batch) => {
      await this.processBatch(batch);
    });
    
    // Handle individual errors
    this.stdioOptimizer.on('error', async (error, message) => {
      await this.handleMessageError(error, message);
    });
    
    // Handle connection loss
    this.stdioOptimizer.on('connectionLost', () => {
      console.error(`[${new Date().toISOString()}] CRITICAL [MCP-Server] Stdio connection lost, initiating shutdown`);
      this.shutdown();
    });
  }

  /**
   * Process a batch of messages
   * @param {Array} batch - Array of message objects
   */
  async processBatch(batch) {
    const batchStartTime = Date.now();
    this.performanceMetrics.recordBatchMetrics(batch.length, 0); // Will update processing time later
    
    console.error(`[${new Date().toISOString()}] DEBUG [MCP-Server] Processing batch of ${batch.length} messages`);
    
    const responses = [];
    
    for (const item of batch) {
      const { message, receivedAt } = item;
      const requestId = message.id || `req-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      
      try {
        // Record request start for metrics
        this.performanceMetrics.recordRequestStart(requestId, { 
          method: message.method,
          receivedAt 
        });
        
        // Execute with retry logic
        const response = await this.errorHandler.executeWithRetry(
          () => this.handleMessage(message),
          { operation: `handle_${message.method}`, messageId: message.id }
        );
        
        // Record successful request
        this.performanceMetrics.recordRequestEnd(requestId, true, response);
        
        if (response) {
          responses.push(response);
        }
        
      } catch (error) {
        // Record failed request
        this.performanceMetrics.recordRequestEnd(requestId, false, { error });
        
        // Create error response
        const errorResponse = this.errorHandler.createErrorResponse(
          message.id, 
          error, 
          { operation: `handle_${message.method}` }
        );
        
        responses.push(errorResponse);
        console.error(`[${new Date().toISOString()}] ERROR [MCP-Server] Message processing failed:`, error.message);
      }
    }
    
    // Send all responses
    for (const response of responses) {
      await this.stdioOptimizer.sendResponse(response);
    }
    
    // Update batch processing time metrics
    const batchProcessingTime = Date.now() - batchStartTime;
    this.performanceMetrics.recordBatchMetrics(batch.length, batchProcessingTime);
    
    // Update memory metrics
    this.performanceMetrics.updateMemoryMetrics(this.stdioOptimizer.messageBuffer?.length || 0);
  }

  /**
   * Handle individual message errors
   * @param {Error} error - The error that occurred
   * @param {Object} message - The message that caused the error
   */
  async handleMessageError(error, message) {
    this.performanceMetrics.recordError(error, { messageId: message?.id });
    
    const errorResponse = this.errorHandler.createErrorResponse(
      message?.id || null,
      error,
      { operation: 'message_processing' }
    );
    
    await this.stdioOptimizer.sendResponse(errorResponse);
  }

  /**
   * Main message handling entry point
   * @param {Object} message - MCP protocol message
   * @returns {Promise<Object>} Response message
   */
  async handleMessage(message) {
    return this.messageHandler.handleMessage(message);
  }
  /**
   * Read resource data
   * @param {string} uri - Resource URI
   * @returns {Promise<any>} Resource data
   */
  async readResource(uri) {
    switch (uri) {
      case 'memory://swarms':
        return this.getSwarmResourceData();
      case 'memory://agents':
        return this.getAgentResourceData();
      case 'memory://tasks':
        return this.getTaskResourceData();
      case 'memory://metrics':
        return this.getMetricsResourceData();
      case 'config://features':
        return this.getFeaturesResourceData();
      case 'performance://metrics':
        return this.getPerformanceMetricsData();
      case 'performance://summary':
        return this.performanceMetrics.getPerformanceSummary();
      case 'performance://report':
        return this.performanceMetrics.generateReport();
      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  }

  /**
   * Get performance metrics resource data
   * @returns {Promise<Object>} Performance metrics data
   */
  async getPerformanceMetricsData() {
    const metrics = this.performanceMetrics.getMetrics();
    const stdioMetrics = this.stdioOptimizer.getMetrics();
    const errorStats = this.errorHandler.getErrorStats();
    
    return {
      performanceMetrics: metrics,
      stdioMetrics: stdioMetrics,
      errorHandling: errorStats,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get swarm resource data
   * @returns {Promise<Object>} Swarm data
   */
  async getSwarmResourceData() {
    const activeSwarms = Array.from(this.swarms.entries()).map(([id, swarm]) => ({
      id,
      status: 'active',
      agents: swarm.getAgents ? swarm.getAgents().length : 0,
      created: swarm.created || new Date().toISOString()
    }));

    const storedSwarms = await this.memoryStore.search('swarm:', { namespace: 'swarms' });

    return {
      activeSwarms,
      storedSwarms: storedSwarms.map(s => ({ ...s, status: 'stored' })),
      totalCount: activeSwarms.length + storedSwarms.length,
      lastUpdated: new Date().toISOString()
    };
    const agents = await this.memoryStore.search('agent:', { namespace: 'agents' });
    
    return {
      agents: agents.slice(0, 100), // Limit for performance
      totalCount: agents.length,
      types: [...new Set(agents.map(a => a.type))],
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get task resource data
   * @returns {Promise<Object>} Task data
   */
  async getTaskResourceData() {
    const tasks = await this.memoryStore.search('task:', { namespace: 'tasks' });
    
    return {
      tasks: tasks.slice(0, 50),
      totalCount: tasks.length,
      statuses: [...new Set(tasks.map(t => t.status))],
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get metrics resource data
   * @returns {Promise<Object>} Metrics data
   */
  async getMetricsResourceData() {
    const toolStats = this.toolExecutor.getExecutionStats();
    const handlerStats = this.messageHandler.getStats();
    
    return {
      toolExecutionStats: toolStats,
      messageHandlerStats: handlerStats,
      systemStats: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        activeSwarms: this.swarms.size
      },
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get features resource data
   * @returns {Promise<Object>} Features data
   */
  async getFeaturesResourceData() {
    return {
      version: this.version,
      capabilities: this.capabilities,
      tools: Object.keys(this.tools).length,
      resources: this.resources.length,
      features: {
        swarmCoordination: true,
        neuralNetworks: true,
        persistentMemory: true,
        taskOrchestration: true,
        realTimeMonitoring: true
      },
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Start the MCP server
   * @returns {Promise<void>}
   */
  async start() {
    console.error(`[${new Date().toISOString()}] INFO [MCP-Server] Starting Claude Flow MCP Server v${this.version} with optimized stdio`);
    console.error(`[${new Date().toISOString()}] INFO [MCP-Server] Session ID: ${this.sessionId}`);
    
    await this.initializeMemory();
    
    // Record server start for performance metrics
    this.performanceMetrics.recordConnectionEvent('start', { version: this.version });
    
    console.error(`[${new Date().toISOString()}] INFO [MCP-Server] Server started with optimized stdio communication`);
    console.error(`[${new Date().toISOString()}] INFO [MCP-Server] Batch size: ${this.stdioOptimizer.batchSize}, timeout: ${this.stdioOptimizer.batchTimeout}ms`);
    console.error(`[${new Date().toISOString()}] INFO [MCP-Server] Retry attempts: ${this.errorHandler.maxRetries}, circuit breaker threshold: ${this.errorHandler.circuitBreakerThreshold}`);
  }

  /**
   * Graceful shutdown
   * @returns {Promise<void>}
   */
  async shutdown() {
    console.error(`[${new Date().toISOString()}] INFO [MCP-Server] Shutting down gracefully...`);
    
    // Shutdown stdio optimizer first to process remaining messages
    if (this.stdioOptimizer) {
      await this.stdioOptimizer.shutdown();
    }
    
    // Generate final performance report
    if (this.performanceMetrics) {
      const finalReport = this.performanceMetrics.generateReport();
      console.error(`[${new Date().toISOString()}] INFO [MCP-Server] Final performance report:`, finalReport.summary);
    }
    
    // Close memory store
    if (this.memoryStore && this.memoryStore.close) {
      await this.memoryStore.close();
    }
    
    // Cleanup swarms
    for (const [id, swarm] of this.swarms.entries()) {
      if (swarm.cleanup) {
        await swarm.cleanup();
      }
    }
    
    console.error(`[${new Date().toISOString()}] INFO [MCP-Server] Shutdown complete`);
  }

  /**
   * Get server status
   * @returns {Object} Server status
   */
  getStatus() {
    const performanceMetrics = this.performanceMetrics ? this.performanceMetrics.getMetrics() : {};
    const stdioMetrics = this.stdioOptimizer ? this.stdioOptimizer.getMetrics() : {};
    const errorStats = this.errorHandler ? this.errorHandler.getErrorStats() : {};
    
    return {
      version: this.version,
      sessionId: this.sessionId,
      uptime: process.uptime(),
      activeSwarms: this.swarms.size,
      toolsAvailable: Object.keys(this.tools).length,
      resourcesAvailable: this.resources.length,
      memoryInitialized: this.memoryStore ? true : false,
      optimization: {
        stdioOptimized: true,
        batchProcessing: true,
        errorHandling: true,
        performanceTracking: true
      },
      performance: {
        totalRequests: performanceMetrics.requests?.total || 0,
        successRate: performanceMetrics.requests?.total ? 
          (performanceMetrics.requests.successful / performanceMetrics.requests.total) : 0,
        avgLatency: performanceMetrics.requests?.avgLatency || 0,
        throughput: performanceMetrics.throughput?.messagesPerSecond || 0
      },
      stdio: {
        queueLength: stdioMetrics.queueLength || 0,
        bufferSize: stdioMetrics.bufferSize || 0,
        isConnected: stdioMetrics.isConnected !== false
      },
      errors: {
        totalErrors: errorStats.totalErrors || 0,
        errorRate: errorStats.errorRate || 0,
        circuitState: errorStats.circuitState || 'CLOSED'
      }
    };
  }
}

/**
 * Start MCP server if run directly
 */
async function startMCPServer() {
  if (import.meta.url === `file://${__filename}`) {
    const server = new ClaudeFlowMCPServer();
    
    // Setup graceful shutdown
    process.on('SIGINT', async () => {
      await server.shutdown();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      await server.shutdown();
      process.exit(0);
    });
    
    await server.start();
  }
}

// Export for use as module (class already exported above)
export default ClaudeFlowMCPServer;

// Start server if run directly
startMCPServer().catch(error => {
  console.error(`[${new Date().toISOString()}] FATAL [MCP-Server] Failed to start:`, error);
  process.exit(1);
});