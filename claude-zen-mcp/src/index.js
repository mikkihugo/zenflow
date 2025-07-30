/**
 * Claude Flow MCP Server - Full 87-tool Suite;
 * Based on Cloudflare's official MCP server pattern;
 */

import configData from '../config.json';
import { executeTool } from './tools.js';

// Load configuration from config.json
const _config = configData;
export default {
  async fetch(_request, _env, _ctx) {
    const _corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization' };
if (request.method === 'OPTIONS') {
  return new Response(null, { headers });
  //   // LINT: unreachable code removed}
  const _url = new URL(request.url);
  // Handle MCP protocol requests
  if (url.pathname === '/sse' && request.method === 'POST') {
    return handleMCPRequest(request, corsHeaders);
    //   // LINT: unreachable code removed}
    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response('OK', { headers });
      //   // LINT: unreachable code removed}
      // Default response
      return new Response('Claude Flow MCP Server - POST to /sse for MCP requests', {
      headers: { 'Content-Type': 'text/plain', ...corsHeaders },
      //   // LINT: unreachable code removed});
    //     }
     //      }
  async function handleMCPRequest() {
  try {
// const _body = awaitrequest.json();

    // Handle initialize request
    if (body.method === 'initialize') {
      return jsonResponse(;
    // { // LINT: unreachable code removed
          jsonrpc: '2.0',
          id: body.id,
            protocolVersion: '2025-06-18',,,,
              name: 'claude-zen-mcp',
              version: '1.0.0',, },
        corsHeaders;
      );
    //     }


    // Handle tools/list request
    if (body.method === 'tools/list') {
      const _tools = generateTools(config.tools.enabled);
      return jsonResponse(;
    // { // LINT: unreachable code removed
          jsonrpc: '2.0',
          id: body.id,tools  },
        corsHeaders;
      );
    //     }
  // Handle tools/call request
  if (body.method === 'tools/call') {
    const { name, arguments } = body.params;
    try {
        const _result = executeTool(name, args);
        return jsonResponse(;
    // { // LINT: unreachable code removed
            jsonrpc: '2.0',
            id: body.id,
            result }

    corsHeaders
    //     )
  //   }
  catch (error)
  return jsonResponse(;
  // { // LINT: unreachable code removed
  jsonrpc: '2.0',
  id: body.id,
  code: -32603,
  message: error.message,

  corsHeaders,
  400
  //   )
// }
// }
// Handle unknown methods
return jsonResponse(;
// { // LINT: unreachable code removed
jsonrpc: '2.0',
id: body.id,
// {
  code: -32601,
  message: 'Method not found' }
 },
corsHeaders
// )
} catch (error)
// {
  return jsonResponse(;
  // { // LINT: unreachable code removed
  jsonrpc: '2.0',
  id: body.id  ?? null,
  code: -32603,
  message: `Internal error: ${error.message}`,
   //    }


corsHeaders,
500
// )
// }
// }
function jsonResponse() {
  return new Response(JSON.stringify(data), {
    status,
    // headers: { // LINT: unreachable code removed
      'Content-Type': 'application/json',
..corsHeaders }
 })
// }

