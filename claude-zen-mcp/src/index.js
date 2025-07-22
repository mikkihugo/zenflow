/**
 * Claude Flow MCP Server - Full 87-tool Suite
 * Based on Cloudflare's official MCP server pattern
 */

import { generateTools, executeTool } from './tools.js';
import configData from '../config.json';

// Load configuration from config.json
const config = configData;

export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    
    // Handle MCP protocol requests
    if (url.pathname === '/sse' && request.method === 'POST') {
      return handleMCPRequest(request, corsHeaders);
    }

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response('OK', { headers: corsHeaders });
    }

    // Default response
    return new Response('Claude Flow MCP Server - POST to /sse for MCP requests', {
      headers: { 'Content-Type': 'text/plain', ...corsHeaders }
    });
  }
};

async function handleMCPRequest(request, corsHeaders) {
  try {
    const body = await request.json();
    
    // Handle initialize request
    if (body.method === 'initialize') {
      return jsonResponse({
        jsonrpc: '2.0',
        id: body.id,
        result: {
          protocolVersion: '2025-06-18',
          capabilities: {
            tools: {},
            resources: {}
          },
          serverInfo: {
            name: 'claude-zen-mcp',
            version: '1.0.0'
          }
        }
      }, corsHeaders);
    }

    // Handle tools/list request
    if (body.method === 'tools/list') {
      const tools = generateTools(config.tools.enabled);
      return jsonResponse({
        jsonrpc: '2.0',
        id: body.id,
        result: { tools }
      }, corsHeaders);
    }

    // Handle tools/call request
    if (body.method === 'tools/call') {
      const { name, arguments: args } = body.params;
      
      try {
        const result = executeTool(name, args);
        return jsonResponse({
          jsonrpc: '2.0',
          id: body.id,
          result
        }, corsHeaders);
      } catch (error) {
        return jsonResponse({
          jsonrpc: '2.0',
          id: body.id,
          error: {
            code: -32603,
            message: error.message
          }
        }, corsHeaders, 400);
      }
    }

    // Handle unknown methods
    return jsonResponse({
      jsonrpc: '2.0',
      id: body.id,
      error: {
        code: -32601,
        message: 'Method not found'
      }
    }, corsHeaders);

  } catch (error) {
    return jsonResponse({
      jsonrpc: '2.0',
      id: body.id || null,
      error: {
        code: -32603,
        message: `Internal error: ${error.message}`
      }
    }, corsHeaders, 500);
  }
}

function jsonResponse(data, corsHeaders, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}