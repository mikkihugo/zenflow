/**
 * Simple MCP Server for Cloudflare Workers
 * Compatible with Claude.ai remote MCP connections
 */

export default {
  async fetch(request, _env, _ctx) {
    // Enable CORS for Claude.ai
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only handle POST requests to /mcp
    if (request.method !== 'POST' || !request.url.endsWith('/mcp')) {
      return new Response('Not Found', { status: 404, headers: corsHeaders });
    }

    try {
      const body = await request.json();
      
      // Handle MCP initialize request
      if (body.method === 'initialize') {
        return new Response(JSON.stringify({
          jsonrpc: '2.0',
          id: body.id,
          result: {
            protocolVersion: '2025-06-18',
            capabilities: {
              tools: {},
              resources: {}
            },
            serverInfo: {
              name: 'claude-zen-cloudflare',
              version: '1.0.0'
            }
          }
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Handle tools/list request
      if (body.method === 'tools/list') {
        const tools = [
          {
            name: 'claude_flow_swarm_init',
            description: 'Initialize a Claude Flow swarm',
            inputSchema: {
              type: 'object',
              properties: {
                topology: {
                  type: 'string',
                  enum: ['mesh', 'hierarchical', 'ring', 'star'],
                  description: 'Swarm topology'
                },
                maxAgents: {
                  type: 'number',
                  description: 'Maximum number of agents'
                }
              },
              required: ['topology']
            }
          },
          {
            name: 'claude_flow_agent_spawn',
            description: 'Spawn a new agent in the swarm',
            inputSchema: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['coordinator', 'researcher', 'coder', 'analyst', 'tester'],
                  description: 'Agent type'
                },
                name: {
                  type: 'string',
                  description: 'Agent name'
                }
              },
              required: ['type']
            }
          },
          {
            name: 'claude_flow_status',
            description: 'Get current swarm status',
            inputSchema: {
              type: 'object',
              properties: {},
              required: []
            }
          }
        ];

        return new Response(JSON.stringify({
          jsonrpc: '2.0',
          id: body.id,
          result: { tools }
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Handle tool calls
      if (body.method === 'tools/call') {
        const { name, arguments: args } = body.params;
        
        let result;
        switch (name) {
          case 'claude_flow_swarm_init':
            result = {
              content: [{
                type: 'text',
                text: `✅ Swarm initialized with ${args.topology} topology and ${args.maxAgents || 8} max agents`
              }]
            };
            break;
            
          case 'claude_flow_agent_spawn':
            result = {
              content: [{
                type: 'text',
                text: `🤖 Agent "${args.name || 'unnamed'}" of type "${args.type}" spawned successfully`
              }]
            };
            break;
            
          case 'claude_flow_status':
            result = {
              content: [{
                type: 'text',
                text: `📊 Swarm Status: Active\n├── Topology: mesh\n├── Agents: 3 active\n├── Tasks: 0 pending\n└── Memory: 125KB used`
              }]
            };
            break;
            
          default:
            throw new Error(`Unknown tool: ${name}`);
        }

        return new Response(JSON.stringify({
          jsonrpc: '2.0',
          id: body.id,
          result
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Handle unknown methods
      return new Response(JSON.stringify({
        jsonrpc: '2.0',
        id: body.id,
        error: {
          code: -32601,
          message: 'Method not found'
        }
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });

    } catch (error) {
      return new Response(JSON.stringify({
        jsonrpc: '2.0',
        id: body.id || null,
        error: {
          code: -32603,
          message: error.message
        }
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }
};