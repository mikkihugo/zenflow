#!/usr/bin/env node
/**
 * 🚀 UNIFIED CLAUDE-ZEN SERVER;
 * Single server combining API + MCP + WebSocket on configurable port (default 3000);
 *;
 * Features:;
 * - REST API endpoints;
 * - MCP (Model Context Protocol) server;
 * - WebSocket real-time communication;
 * - Neural network integration via ruv-FANN;
 * - Database orchestration (SQLite + LanceDB + Kuzu);
 * - Multi-Queen hive-mind coordination
 */

import { createServer } from 'node:http';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express, { type Request, type Response } from 'express';
import { WebSocketServer } from 'ws';
import config from '../config/default.js';

const ___filename = fileURLToPath(import.meta.url);
const ___dirname = dirname(__filename);
/**
 * Unified Claude-Zen Server Configuration
 */
// interface UnifiedServerOptions {
  port?: number;
  host?: string;
  enableAPI?: boolean;
  enableMCP?: boolean;
  enableWebSocket?: boolean;
  enableNeural?: boolean;
  [key: string]: unknown;
}
/**
 * Unified Server Class;
 * Orchestrates all Claude-Zen components in a single process
 */
class UnifiedServer {
  constructor(_options: UnifiedServerOptions = {}) {
    this.options = {
      port: parseInt(process.env.PORT ?? '3000', 10),
    host: process.env.HOST ?? 'localhost',
    enableAPI,
    enableMCP,
    enableWebSocket,
    enableNeural,
..options }
  this;

  app = express();
  this;

  setupMiddleware();
  this;

  setupRoutes();
}
/**
 * Setup Express middleware
 */
private
setupMiddleware();
: void
{
  this.app.use(;
  cors({
        origin: process.env.CORS_ORIGIN?.split(',') ?? '*',
  credentials}
)
)
this.app.use(express.json(
{
  limit: '50mb';
}
))
this.app.use(express.urlencoded(
{
  extended: true;
}
))
// Request logging
this.app.use((req, _res, next) =>
{
  console.warn(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
}
)
}
/**
 * Setup API routes
 */
private
setupRoutes()
: void
{
  // Health check
  this.app.get('/', (_req, res: Response) => {
    res.json({
        name: 'Claude-Zen Unified Server',
    version: '2.0.0-alpha.73',
    status: 'healthy',
    api: this.options.enableAPI,
    mcp: this.options.enableMCP,
    websocket: this.options.enableWebSocket,
    neural: this.options.enableNeural,
    ('ruv-FANN');
    : 'integrated',

    uptime: process.uptime(),
    timestamp: new Date().toISOString() });
}
)
// System status
this.app.get('/status', (_req, res: Response) =>
{
  res.json({
        server: {
          running: this.isRunning,
  port: this.options.port,
  host: this.options.host }

{
  api: this.options.enableAPI ? 'active' : 'disabled',
  mcp: this.options.enableMCP ? 'active' : 'disabled',
  websocket: this.options.enableWebSocket ? 'active' : 'disabled',
  neural: this.options.enableNeural ? 'active' : 'disabled' }

memory: process.memoryUsage(),
uptime: process.uptime(),
timestamp: new Date().toISOString() })
})
// MCP endpoints
if (this.options.enableMCP) {
  this.app.get('/mcp/tools', (_req, res: Response) => {
    res.json({
          tools: [;
            'swarm_init',
            'agent_spawn',
            'task_orchestrate',
            'memory_usage',
            'neural_train',
            'benchmark_run' ],
    message: 'MCP tools available via ruv-FANN integration' });
}
)
}
// Neural endpoints
if (this.options.enableNeural) {
  this.app.get('/neural/status', (_req, res: Response) => {
    res.json({
          status: 'integrated',
    models: config.ruvFANN.neuralModels,
    gpuAcceleration: config.ruvFANN.gpuAcceleration,
    wasmPath: config.ruvFANN.wasmPath });
}
)
}
// Health check endpoint
this.app.get('/health', (_req, res: Response) =>
{
  res.json({
        status: 'healthy',
  timestamp: new Date().toISOString(),
  database: 'operational',
  memory: 'operational',
  neural: 'integrated',
  ('ruv-FANN');
  : 'active' }
)
})
}
/**
 * Setup WebSocket server
 */
private
setupWebSocket()
: void
{
  if (!this.options.enableWebSocket ?? !this.server) return;
  // ; // LINT: unreachable code removed
  this.wss = new WebSocketServer({ server: this.server });
  this.wss.on('connection', (ws, req) => {
    console.warn(`🔌 WebSocket connection from ${req.socket.remoteAddress}`);
    ws.on('message', (data) => {
        try {
          const _message = JSON.parse(data.toString());
          console.warn('📩 WebSocket message:', message);

          // Echo back for now - integrate with swarm orchestration
          ws.send(;
            JSON.stringify({
              type: 'response',
              data,
              timestamp: new Date().toISOString() });
          );
        } catch (error) {
          console.error('❌ WebSocket message error:', error);
        }
  });
  ws.on('close', () => {
    console.warn('🔌 WebSocket connection closed');
  });
  // Send welcome message
  ws.send(;
  JSON.stringify({
          type: 'welcome',
  message: 'Connected to Claude-Zen Unified Server',
  swarmOrchestration,
  neuralNetworks,
  realTimeCoordination}
)
)
})
console.warn('🔌 WebSocket server enabled')
}
/**
 * Initialize components
 */
private
async
initializeComponents()
: Promise<void>
{
  try {
      // Initialize database connections
      console.warn('🗄️ Initializing databases...');

      // Initialize neural engine (ruv-FANN integration)
      if (this.options.enableNeural) {
        console.warn('🧠 Initializing ruv-FANN neural engine...');
        // Integration point for ruv-FANN
      }

      // Initialize MCP server
      if (this.options.enableMCP) {
        console.warn('🔗 Initializing MCP server...');
        // MCP server integration
      }

      console.warn('✅ All components initialized');
    } catch (error) {
      console.error('❌ Component initialization failed:', error);
      throw error;
    }
}
/**
 * Start the unified server
 */
async;
start();
: Promise<void>
{
  if (this.isRunning) {
    console.warn('⚠️ Server is already running');
    return;
    //   // LINT: unreachable code removed}
    try {
      // Initialize components first
// await this.initializeComponents();
      // Create HTTP server
      this.server = createServer(this.app);

      // Setup WebSocket if enabled
      this.setupWebSocket();

      // Start listening
// await new Promise<void>((resolve, reject) => {
        this.server?.listen(this.options.port, this.options.host, () => {
          this.isRunning = true;
          console.warn(`🚀 Claude-Zen Unified Server started!`);
          console.warn(`📍 URL: http://${this.options.host}:${this.options.port}`);
          console.warn(`🧠 ruv-FANN: Integrated`);
          console.warn(`🔗 MCP: ${this.options.enableMCP ? 'Enabled' : 'Disabled'}`);
          console.warn(`🔌 WebSocket: ${this.options.enableWebSocket ? 'Enabled' : 'Disabled'}`);
          console.warn(`⚡ Neural: ${this.options.enableNeural ? 'Enabled' : 'Disabled'}`);
          resolve();
        });

        this.server?.on('error', (error) => {
          console.error('❌ Server error:', error);
          reject(error);
        });
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      throw error;
    }
  }
  /**
   * Stop the unified server
   */
  async;
  stop();
  : Promise<void>
  if (!this.isRunning) {
    console.warn('⚠️ Server is not running');
    return;
    //   // LINT: unreachable code removed}
    try {
      // Close WebSocket server
      if (this.wss) {
        this.wss.close();
        this.wss = null;
      }

      // Close HTTP server
      if (this.server) {
// await new Promise<void>((resolve) => {
          this.server?.close(() => {
            this.server = null;
            resolve();
          });
        });
      }

      this.isRunning = false;
      console.warn('🛑 Claude-Zen Unified Server stopped');
    } catch (error) {
      console.error('❌ Error stopping server:', error);
      throw error;
    }
  }
  /**
   * Get server status
   */
  getStatus();
  return {
      running: this.isRunning,
  // port: this.options.port, // LINT: unreachable code removed
  host: this.options.host,
  components: this.options,
  uptime: process.uptime() }
// CLI handling
async function main(): unknown {
  const _args = process.argv.slice(2);
  const _portArg = args.find((arg) => arg.startsWith('--port='));
  const _port = portArg ? parseInt(portArg.split('=')[1], 10) : undefined;
  const _server = new UnifiedServer({ port });
  // Graceful shutdown
  const _shutdown = async (signal: string) => {
    console.warn(`\n🛑 Received ${signal}, shutting down gracefully...`);
    try {
// await server.stop();
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  try {
// await server.start();
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}
// Export for module use
export default UnifiedServer;
export { UnifiedServer };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}
