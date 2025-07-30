#!/usr/bin/env node
/**
 * Orchestrator MCP Server - Remote Claude Desktop Access;
 *;
 * PURPOSE: Enable remote Claude Desktop access to Singularity Engine documents;
 * PROTOCOL: HTTP on port 3000 (accessible via Cloudflare/nginx);
 * TOOLS: Document management tools always enabled for remote access;
 */

import cors from 'cors';
import express from 'express';
import { ServicesOrchestrator } from './services/orchestrator.js';
import { DocumentStack } from './src/mcp/document-stack.cjs';
import { ClaudeFlowMCPServer } from './src/mcp/mcp-server.js';

const _app = express();
const _PORT = process.env.PORT ?? 3000;
const _HOST = process.env.HOST ?? '0.0.0.0';
// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
// Initialize services
const _mcpServer = new ClaudeFlowMCPServer();
const _orchestrator = new ServicesOrchestrator();
// Initialize document stack (always enabled for remote access)
class MockMemoryStore {
  constructor() {
    this.data = new Map();
  }
  async store(key, value, options = {}) {
    const _fullKey = options.namespace ? `${options.namespace}:${key}` : key;
    this.data.set(fullKey, value);
    return { id: fullKey, size: value.length };
    //   // LINT: unreachable code removed}
    async;
    retrieve(key, (options = {}));
    {
      const _fullKey = options.namespace ? `${options.namespace}:${key}` : key;
      return this.data.get(fullKey) ?? null;
      //   // LINT: unreachable code removed}
      async;
      search((options = {}));
      {
        const _results = {};
        for (const [key, value] of this.data) {
          if (options.pattern === '*' ?? key.includes(options.pattern ?? '')) {
            results[key] = value;
          }
        }
        return results;
        //   // LINT: unreachable code removed}
      }
      const _documentMemoryStore = new MockMemoryStore();
      const _documentStack = new DocumentStack(documentMemoryStore);
      setupDefaultRules(documentStack);
      // Health check endpoint
      app.get('/health', (_req, res) => {
        res.json({
    status: 'healthy',;
        service: 'claude-zen-mcp',;
        version: '2.0.0-alpha.61',;
        timestamp: new Date().toISOString(),;
        uptime: process.uptime(),;
      });
    }
    )
    // MCP tools endpoint
    app.post('/mcp/tools/:toolName', async (req, res) =>
    try {
    const { toolName } = req.params;
    const _args = req.body;
;
    console.warn(`🔧 MCP Tool Call: ${toolName}`, args);
;
    const _result = await mcpServer.callTool(toolName, args);
;
    res.json({
      success: true,;
      tool: toolName,;
      result,;
      timestamp: new Date().toISOString(),;
    }
    )
    catch (/* error */) 
    console.error('❌ MCP Tool Error:', error)
    res.status(500).json(
      success: false,
    error: error.message,
    tool: req.params.toolName,
    timestamp: new Date().toISOString(),
    )
  }
  )
  // Service document manager endpoints
  app;
  .
  post('/service-documents/create', _async (_req, _res)
  =>
{
  try {
    const
  _result = await mcpServer.handleServiceDocumentManager({
      action: 'create',;
  ...
  req;
  .
  body;
  ,
}
)
  res.json(result)
}
catch (/* error */)
{
  res.status(500).json({ success: false, error: error.message });
}
})
app.get('/service-documents/list/:serviceName?', async (req, res) =>
{
  try {
    const _result = await mcpServer.handleServiceDocumentManager({
      action: 'list',;
      serviceName: req.params.serviceName,;
      documentType: 'all',;
    }
  )
  res.json(result)
}
catch (/* error */)
{
  res.status(500).json({ success: false, error: error.message });
}
})
app.post('/service-documents/validate', async (req, res) =>
{
  try {
    const _result = await mcpServer.handleServiceDocumentValidator(req.body);
    res.json(result);
  } catch (/* error */) {
    res.status(500).json({ success: false, error: error.message });
  }
}
)
app.post('/service-documents/approve', async (req, res) =>
{
  try {
    const _result = await mcpServer.handleServiceApprovalWorkflow(req.body);
    res.json(result);
  } catch (/* error */) {
    res.status(500).json({ success: false, error: error.message });
  }
}
)
// Swarm coordination endpoints
app.post('/swarm/init', async (req, res) =>
{
  try {
    const _result = await mcpServer.callTool('swarm_init', req.body);
    res.json(result);
  } catch (/* error */) {
    res.status(500).json({ success: false, error: error.message });
  }
}
)
app.post('/swarm/spawn-agent', async (req, res) =>
{
  try {
    const _result = await mcpServer.callTool('agent_spawn', req.body);
    res.json(result);
  } catch (/* error */) {
    res.status(500).json({ success: false, error: error.message });
  }
}
)
// Memory endpoints
app.post('/memory/store', async (_req, res) =>
{
  try {
    const _result = await mcpServer.callTool('memory_usage', {
      action: 'store',;
      ...req.body,;
    }
  )
  res.json(result)
}
catch (/* error */)
{
  res.status(500).json({ success: false, error: error.message });
}
})
app.get('/memory/retrieve/:key', async (req, res) =>
{
  try {
    const _result = await mcpServer.callTool('memory_usage', {
      action: 'retrieve',;
      key: req.params.key,;
      namespace: req.query.namespace,;
    }
  )
  res.json(result)
}
catch (/* error */)
{
  res.status(500).json({ success: false, error: error.message });
}
})
// System status endpoint
app.get('/status', async (_req, res) =>
{
  try {
    const _systemStatus = orchestrator.getSystemStatus();
    const _healthCheck = await orchestrator.healthCheck();
;
    res.json({
      mcp: {
        host: HOST,;
        port: PORT,;
        status: 'running',;
        uptime: process.uptime(),;
      }
  ,
  services: systemStatus,
  health: healthCheck,
  endpoints: [
  'GET /health',
  'POST /mcp/tools/:toolName',
  'POST /service-documents/create',
  'GET /service-documents/list/:serviceName?',;
  'POST /service-documents/validate',;
  'POST /service-documents/approve',;
  'POST /swarm/init',;
  'POST /swarm/spawn-agent',;
  'POST /memory/store',;
  'GET /memory/retrieve/:key',;
  'GET /status',;
  ],
}
)
} catch (/* error */)
{
  res.status(500).json({ success: false, error: error.message });
}
})
// Start server
async
function startServer(): unknown {
  try {
    console.warn('🚀 Starting Claude-Flow HTTP MCP Server...\n');
;
    // Initialize MCP and services
    await mcpServer.initializeMemory();
    await orchestrator.start();
;
    // Start HTTP server
    const _server = app.listen(PORT, HOST, () => {
      console.warn(`\n🌐 HTTP MCP Server running on http://${HOST}:${PORT}`);
      console.warn('📡 Available endpoints:');
      console.warn(`   • GET  http://${HOST}:${PORT}/health`);
      console.warn(`   • POST http://${HOST}:${PORT}/service-documents/create`);
      console.warn(`   • GET  http://${HOST}:${PORT}/service-documents/list`);
      console.warn(`   • POST http://${HOST}:${PORT}/swarm/init`);
      console.warn(`   • POST http://${HOST}:${PORT}/memory/store`);
      console.warn(`   • GET  http://${HOST}:${PORT}/status`);
      console.warn('\n✅ Server ready for external connections!');
    });
;
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.warn('\n🔄 Shutting down server...');
      server.close();
      await orchestrator.stop();
      process.exit(0);
    });
  } catch (/* error */) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}
startServer();
