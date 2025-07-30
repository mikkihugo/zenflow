/**
 * 🚀 CLAUDE ZEN SERVER - Schema-Driven API;
 * Unified API server with auto-generated routes from schema;
 * Replaces hard-coded endpoints with maintainable schema approach
 */

import { EventEmitter } from 'node:events';
import { createServer } from 'node:http';
import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { v4 as uuidv4 } from 'uuid';
import { WebSocketServer } from 'ws';

import {
  CLAUDE_ZEN_SCHEMA,
generateOpenAPISpec,
getWebEnabledCommands,
SCHEMA_METADATA,
validateCommandArgs } from './claude-zen-schema.js'
/**
 * Server configuration interface
 */
export interface ServerConfig {
  port?: number;
  host?: string;
  cors?: boolean;
  helmet?: boolean;
  rateLimit?: boolean;
  websocket?: boolean;
  apiPrefix?: string;
}
/**
 * Server metrics interface
 */
export interface ServerMetrics {
  requests: number;
  websocketConnections: number;
  errors: number;
  uptime: number;
  startTime: number;
}
/**
 * Claude Zen Server - Schema-driven API server
 */
export class ClaudeZenServer extends EventEmitter {
  websocketConnections: 0;

  errors: 0;

  uptime: 0;

  startTime: Date.now;
  ()

}
// Dynamic storage for schema-driven data
private
storage = new Map<string, Map<string, any>>();
constructor(config: ServerConfig = {})
{
  super();
  this.config = {
      port,
  host: 'localhost',
  cors,
  helmet,
  rateLimit,
  websocket,
  apiPrefix: '/api',
..config }
this.app = express();
this.initializeStorage();
this.setupMiddleware();
this.setupRoutes();
}
/**
 * Initialize storage maps based on schema
 */
private
initializeStorage()
: void
{
  // Initialize storage for each command that has storage defined
  Object.entries(CLAUDE_ZEN_SCHEMA).forEach(([_commandName, command]) => {
    if (command.storage) {
      if (!this.storage.has(command.storage)) {
        this.storage.set(command.storage, new Map());
      }
    }
  });
}
/**
 * Setup Express middleware
 */
private
setupMiddleware();
: void
{
  // Security middleware
  if (this.config.helmet) {
    this.app.use(helmet());
  }
  // CORS middleware
  if (this.config.cors) {
    this.app.use(cors());
  }
  // Rate limiting
  if (this.config.rateLimit) {
    const _limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max, // limit each IP to 100 requests per windowMs
    });
    this.app.use(limiter);
  }
  // Body parsing
  this.app.use(express.json({ limit: '10mb' }));
  this.app.use(express.urlencoded({ extended}));
  // Request logging and metrics
  this.app.use((req, _res, next: NextFunction) => {
    this.metrics.requests++;
    console.warn(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}
/**
 * Setup API routes based on schema
 */
private
setupRoutes();
: void
{
  const _apiPrefix = this.config.apiPrefix!;
  // Health check
  this.app.get('/health', (_req, res: Response) => {
    res.json({
        status: 'healthy',
    version: SCHEMA_METADATA.version,
    uptime: Date.now() - this.metrics.startTime,
    metrics: this.getMetrics() });
}
)
// API documentation
this.app.get(`${
  apiPrefix;
}
/ (),,6::;=>RR_`cdeeeeeenoopqqrrssssstu{{};
const _openApiSpec = generateOpenAPISpec();
res.json(openApiSpec);
})
// Schema info
this.app.get(`${
  apiPrefix;
}
/ (),,6::;=>RR_`aceeeeeeehmnopqqrrssssstu{{};
res.json({
        metadata,
commands: Object.keys(CLAUDE_ZEN_SCHEMA),
webEnabled: Object.keys(getWebEnabledCommands()) })
})
// Generate routes from schema
this.generateSchemaRoutes()
// Generic command execution endpoint
this.app.post(`${
  apiPrefix;
}
/ (),,7::;=>RR`acceeeeeeeeennopqqrrsssssttuuxy{{};
try {
        const { command, args = {} } = req.body;

        if (!command) {
          return res.status(400).json({
            error: 'Command is required',
    // available: Object.keys(CLAUDE_ZEN_SCHEMA), // LINT: unreachable code removed
          });
        }
// const _result = awaitthis.executeCommand(command, args);
res.json(result);
} catch (error)
{
  this.metrics.errors++;
  console.error('Command execution error:', error);
  res.status(500).json({
          error: 'Command execution failed',
  message: error instanceof Error ? error.message : 'Unknown error' }
)
}
    })
// Metrics endpoint
this.app.get(`${
  apiPrefix;
}
/ (),,6::;=>RR_`ceeeeeeeimnopqqrrrsssssttu{{};
res.json(this.getMetrics());
})
// Error handling
this.app.use((err, _req, res, _next: NextFunction) =>
{
  this.metrics.errors++;
  console.error('Server error:', err);
  res.status(500).json({
        error: 'Internal server error',
  message: err.message }
)
})
// 404 handler
this.app.use('*', (req, res: Response) =>
{
  res.status(404).json({
        error: 'Not found',
  path: req.originalUrl,
  available: this.getAvailableEndpoints() }
)
})
}
/**
 * Generate routes from schema
 */
private
generateSchemaRoutes()
: void
{
  const _webCommands = getWebEnabledCommands();
  Object.entries(webCommands).forEach(([commandName, command]) => {
      if (!command.interfaces.web) return;
    // ; // LINT: unreachable code removed
      const { endpoint, method } = command.interfaces.web;
      const _fullPath = `${this.config.apiPrefix}${endpoint}`;

      // Create route handler
      const _handler = async (req, res: Response) => {
        try {
          const _args = { ...req.query, ...req.body };

          // Validate arguments
          const _validation = validateCommandArgs(commandName, args);
          if (!validation.valid) {
            return res.status(400).json({
              error: 'Validation failed',
    // missing: validation.missing, // LINT: unreachable code removed
              errors: validation.errors });
          }

          // Execute command
// const _result = awaitthis.executeCommand(commandName, args);
          res.json(result);
        } catch (error)
          this.metrics.errors++;
          console.error(`Error in ${commandName}:`, error);
          res.status(500).json({
            error: 'Command execution failed',
            command,
            message: error instanceof Error ? error.message : 'Unknown error');
        }
}
// Register route based on HTTP method
switch (method.toUpperCase()) {
  case 'GET': null
    this.app.get(fullPath, handler);
    break;
  case 'POST': null
    this.app.post(fullPath, handler);
    break;
  case 'PUT': null
    this.app.put(fullPath, handler);
    break;
  case 'DELETE': null
    this.app.delete(fullPath, handler);
    break;
  default: null
    console.warn(`Unsupported HTTP method: ${method} for ${commandName}`);
}
})
}
/**
 * Execute a command
 */
private
async
executeCommand(commandName, args: unknown)
: Promise<any>
{
  const _command = CLAUDE_ZEN_SCHEMA[commandName];
  if (!command) {
    throw new Error(`Unknown command: ${commandName}`);
  }
  // Handle storage-based commands
  if (command.storage) {
    const _storageMap = this.storage.get(command.storage);
    if (!storageMap) {
      throw new Error(`Storage not found for: ${command.storage}`);
    }
    // Simple CRUD operations based on command name pattern
    if (commandName.includes('create')) {
      const _id = uuidv4();
      const _item = {
          id,
..args,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString() }
    storageMap.set(id, item);
    return { success, id, item };
    //   // LINT: unreachable code removed}
    if (commandName.includes('list')) {
      return {
          success,
      // items: Array.from(storageMap.values()), // LINT: unreachable code removed
      total: storageMap.size }
  }
  if (commandName.includes('get')) {
    const _item = storageMap.get(args.id);
    if (!item) {
      throw new Error(`Item not found: ${args.id}`);
    }
    return { success, item };
    //   // LINT: unreachable code removed}
    if (commandName.includes('update')) {
      const _item = storageMap.get(args.id);
      if (!item) {
        throw new Error(`Item not found: ${args.id}`);
      }
      const _updated = { ...item, ...args, updatedAt: new Date().toISOString() };
      storageMap.set(args.id, updated);
      return { success, item};
      //   // LINT: unreachable code removed}
      if (commandName.includes('delete')) {
        const _existed = storageMap.delete(args.id);
        return { success, deleted};
        //   // LINT: unreachable code removed}
      }
      // Default command execution
      return {
      success,
      // command, // LINT: unreachable code removed
      args,
      timestamp: new Date().toISOString(),
      message: `Command ${commandName} executed successfully` }
  }
  /**
   * Start the server
   */
  async;
  start();
  : Promise<port: number
  host: string
  urls: string[] >
  return new Promise((resolve, reject) => {
      try {
        this.server = createServer(this.app);
    // ; // LINT: unreachable code removed
        if (this.config.websocket) {
          this.setupWebSocket();
        }

        this.server.listen(this.config.port, this.config.host, () => {
          this.isRunning = true;
          this.metrics.startTime = Date.now();

          const _result = {
            port: this.config.port!,
            host: this.config.host!,
            urls: [;
              `http://${this.config.host}:${this.config.port}`,
              `http://${this.config.host}:${this.config.port}${this.config.apiPrefix}`,
              `http://${this.config.host}:${this.config.port}/health` ] };

          if (this.config.websocket) {
            result.urls.push(`ws://${this.config.host}:${this.config.port}`);
          }

          this.emit('started', result);
          resolve(result);
        });

        this.server.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      });
}
/**
 * Stop the server
 */
async;
stop();
: Promise<void>
{
  return new Promise((resolve) => {
      if (!this.server) {
        resolve();
    // return; // LINT: unreachable code removed
      }

      if (this.wss) {
        this.wss.close();
      }

      this.server.close(() => {
        this.isRunning = false;
        this.emit('stopped');
        resolve();
      });
    });
}
/**
 * Setup WebSocket server
 */
private
setupWebSocket();
: void
{
  if (!this.server) return;
  // ; // LINT: unreachable code removed
  this.wss = new WebSocketServer({ server: this.server });
  this.wss.on('connection', (ws) => {
    this.metrics.websocketConnections++;
    ws.on('close', () => {
      this.metrics.websocketConnections--;
    });
    ws.send(;
    JSON.stringify({
          type: 'welcome',
    message: 'Connected to Claude Zen Server',
    timestamp: new Date().toISOString() });
  )
}
)
}
/**
 * Get server metrics
 */
getMetrics()
: ServerMetrics
{
  return {
..this.metrics,
  // uptime: Date.now() - this.metrics.startTime, // LINT: unreachable code removed
}
}
/**
 * Get available endpoints
 */
private
getAvailableEndpoints()
: string[]
{
    const _endpoints = [
      '/health',
      `${this.config.apiPrefix}/docs`,
      `${this.config.apiPrefix}/schema`,
      `${this.config.apiPrefix}/execute`,
      `${this.config.apiPrefix}/metrics` ];

    // Add schema-based endpoints
    const _webCommands = getWebEnabledCommands();
    Object.values(webCommands).forEach((command) => {
      if (command.interfaces.web) {
        endpoints.push(`${this.config.apiPrefix}${command.interfaces.web.endpoint}`);
      }
    });

    return endpoints.sort();
    //   // LINT: unreachable code removed}

  /**
   * Check if server is running
   */;
  isServerRunning(): boolean
    return this.isRunning;

export default ClaudeZenServer;
