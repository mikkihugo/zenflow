#!/usr/bin/env node
/**
 * HTTP MCP Server - Runs MCP protocol over HTTP on port 3000
 * Provides all Claude Flow tools including Git integration
 */

import express from 'express';
import cors from 'cors';
import { ClaudeFlowMCPServer } from './mcp-server.js';

const app = express();
const PORT = process.env.MCP_PORT || 3000;

// Enable CORS for all origins
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize MCP server
const mcpServer = new ClaudeFlowMCPServer({
  enableGitTools: true,
  enableAllTools: true,
  httpMode: true
});

// MCP server auto-initializes, add small delay for neural engine
await new Promise(resolve => setTimeout(resolve, 100));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    server: 'claude-flow-mcp-http',
    tools: mcpServer.toolsRegistry?.getToolCount() || 0,
    uptime: process.uptime()
  });
});

// MCP initialize endpoint
app.post('/mcp/initialize', async (req, res) => {
  try {
    const response = await mcpServer.handleMessage({
      jsonrpc: '2.0',
      id: req.body.id || 1,
      method: 'initialize',
      params: req.body.params || {}
    });
    res.json(response);
  } catch (error) {
    res.status(500).json({
      jsonrpc: '2.0',
      id: req.body.id || 1,
      error: {
        code: -32603,
        message: error.message
      }
    });
  }
});

// MCP tools/list endpoint
app.post('/mcp/tools/list', async (req, res) => {
  try {
    const response = await mcpServer.handleMessage({
      jsonrpc: '2.0',
      id: req.body.id || 1,
      method: 'tools/list',
      params: req.body.params || {}
    });
    res.json(response);
  } catch (error) {
    res.status(500).json({
      jsonrpc: '2.0',
      id: req.body.id || 1,
      error: {
        code: -32603,
        message: error.message
      }
    });
  }
});

// MCP tools/call endpoint
app.post('/mcp/tools/call', async (req, res) => {
  try {
    const response = await mcpServer.handleMessage({
      jsonrpc: '2.0',
      id: req.body.id || 1,
      method: 'tools/call',
      params: req.body.params
    });
    res.json(response);
  } catch (error) {
    res.status(500).json({
      jsonrpc: '2.0',
      id: req.body.id || 1,
      error: {
        code: -32603,
        message: error.message
      }
    });
  }
});

// Unified MCP endpoint (handles all MCP methods)
app.post('/mcp', async (req, res) => {
  try {
    const response = await mcpServer.handleMessage(req.body);
    res.json(response);
  } catch (error) {
    res.status(500).json({
      jsonrpc: '2.0',
      id: req.body.id,
      error: {
        code: -32603,
        message: error.message
      }
    });
  }
});

// List available tools
app.get('/mcp/tools', async (req, res) => {
  const tools = await mcpServer.toolsRegistry?.getAllTools() || [];
  res.json({
    count: tools.length,
    tools: tools.map(t => ({
      name: t.name,
      description: t.description,
      category: t.category || 'general'
    }))
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MCP HTTP Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 Tools list: http://localhost:${PORT}/mcp/tools`);
  console.log(`📡 MCP endpoint: http://localhost:${PORT}/mcp`);
  console.log('\nEndpoints:');
  console.log('  POST /mcp/initialize - Initialize MCP session');
  console.log('  POST /mcp/tools/list - List available tools');
  console.log('  POST /mcp/tools/call - Call a tool');
  console.log('  POST /mcp - Unified MCP endpoint');
  console.log('  GET /mcp/tools - Human-readable tools list');
  console.log('  GET /health - Server health check');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down MCP HTTP server...');
  await mcpServer.cleanup();
  process.exit(0);
});