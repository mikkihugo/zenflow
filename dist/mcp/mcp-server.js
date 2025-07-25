#!/usr/bin/env node
/**
 * @fileoverview Refactored Claude-Flow MCP Server
 * Clean architecture implementation of the Model Context Protocol server
 * @module MCPServerRefactored
 */

import { fileURLToPath } from 'url';
import { SqliteMemoryStore } from '../memory/sqlite-store.js';
import { RuvSwarm } from '../../ruv-FANN/ruv-swarm/npm/src/index.js';
import { initializeAllTools } from './core/tools-registry.js';
import { MCPMessageHandler } from './core/message-handler.js';
import { MCPToolExecutor } from './core/tool-executor.js';

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
      }
    ];
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
      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
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
  }

  /**
   * Get agent resource data
   * @returns {Promise<Object>} Agent data
   */
  async getAgentResourceData() {
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
    console.error(`[${new Date().toISOString()}] INFO [MCP-Server] Starting Claude Flow MCP Server v${this.version}`);
    console.error(`[${new Date().toISOString()}] INFO [MCP-Server] Session ID: ${this.sessionId}`);
    
    await this.initializeMemory();
    
    // Setup stdin/stdout communication for MCP
    process.stdin.on('data', async (data) => {
      const lines = data.toString().trim().split('\n');
      
      for (const line of lines) {
        if (!line.trim()) continue;
        
        try {
          const message = JSON.parse(line);
          const response = await this.handleMessage(message);
          
          if (response) {
            process.stdout.write(JSON.stringify(response) + '\n');
          }
        } catch (error) {
          console.error(`[${new Date().toISOString()}] ERROR [MCP-Server] Message processing failed:`, error);
          
          // Send error response if possible
          try {
            const parsed = JSON.parse(line);
            const errorResponse = {
              jsonrpc: '2.0',
              id: parsed.id,
              error: {
                code: -32603,
                message: `Internal error: ${error.message}`
              }
            };
            process.stdout.write(JSON.stringify(errorResponse) + '\n');
          } catch (parseError) {
            // Unable to parse original message for error response
          }
        }
      }
    });

    console.error(`[${new Date().toISOString()}] INFO [MCP-Server] Server started and listening for messages`);
  }

  /**
   * Graceful shutdown
   * @returns {Promise<void>}
   */
  async shutdown() {
    console.error(`[${new Date().toISOString()}] INFO [MCP-Server] Shutting down gracefully...`);
    
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
    return {
      version: this.version,
      sessionId: this.sessionId,
      uptime: process.uptime(),
      activeSwarms: this.swarms.size,
      toolsAvailable: Object.keys(this.tools).length,
      resourcesAvailable: this.resources.length,
      memoryInitialized: this.memoryStore ? true : false
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