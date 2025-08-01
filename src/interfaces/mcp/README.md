# Claude-Zen HTTP MCP Server

HTTP-based MCP server for Claude Desktop integration on port 3000.

## Purpose

This HTTP MCP server provides core Claude-Zen functionality to Claude Desktop via the Model Context Protocol over HTTP. It is **separate and distinct** from the swarm stdio MCP server.

## Architecture

```
Claude Desktop ← HTTP (port 3000) ← HTTP MCP Server ← Claude-Zen Core
Swarm Agents  ← stdio              ← Swarm MCP Server ← Claude-Zen Swarm
```

## Key Distinctions

### HTTP MCP Server (this directory)
- **Location**: `src/interfaces/mcp/`
- **Protocol**: HTTP on port 3000
- **Purpose**: Claude Desktop integration
- **Tools**: System info, project management, status monitoring
- **Usage**: `npm run mcp:claude` or `npm run mcp:server`

### Swarm MCP Server (separate)
- **Location**: `src/swarm-zen/`  
- **Protocol**: stdio (JSON-RPC)
- **Purpose**: Swarm coordination and agent management
- **Tools**: Swarm operations, agent spawning, task orchestration
- **Usage**: `npm run mcp:swarm`

## Usage

### Start HTTP MCP Server

```bash
# Default (port 3000, localhost)
npm run mcp:claude

# Custom port and host
npm run mcp:server -- --port 3001 --host 0.0.0.0

# With debug logging
npx tsx src/interfaces/mcp/start-server.ts --log-level debug
```

### Test the Server

```bash
# Health check
curl http://localhost:3000/health

# List capabilities
curl http://localhost:3000/capabilities

# List tools
curl http://localhost:3000/tools

# Execute a tool
curl -X POST http://localhost:3000/tools/system_info \
  -H "Content-Type: application/json" \
  -d '{"detailed": true}'
```

### Claude Desktop Configuration

Add to your Claude Desktop MCP configuration:

```json
{
  "mcpServers": {
    "claude-zen": {
      "command": "npx",
      "args": ["tsx", "src/interfaces/mcp/start-server.ts"],
      "cwd": "/path/to/claude-code-flow"
    }
  }
}
```

## Available Tools

### System Tools
- `system_info` - Get system information and status
- `project_status` - Get project status and metrics

### Project Tools  
- `project_init` - Initialize new Claude-Zen projects

### Resource Endpoints
- `claude-zen://status` - System status resource
- `claude-zen://tools` - Tool registry information
- `claude-zen://metrics` - Performance metrics

## API Endpoints

- `GET /health` - Health check
- `GET /capabilities` - MCP capabilities
- `POST /mcp` - Main MCP endpoint (JSON-RPC 2.0)
- `GET /tools` - List available tools
- `POST /tools/:toolName` - Execute specific tool

## Development

### Adding New Tools

```typescript
// In src/interfaces/mcp/http-mcp-server.ts
this.toolRegistry.registerTool({
  name: 'my_tool',
  description: 'Description of my tool',
  inputSchema: {
    type: 'object',
    properties: {
      param1: { type: 'string', description: 'Parameter 1' }
    },
    required: ['param1']
  }
}, async (params) => {
  // Tool implementation
  return { result: 'success' };
});
```

### Environment Variables

- `MCP_PORT` - Server port (default: 3000)
- `MCP_HOST` - Server host (default: localhost)
- `MCP_LOG_LEVEL` - Log level (default: info)
- `MCP_TIMEOUT` - Request timeout (default: 30000ms)

## Architecture Notes

This HTTP MCP server is designed specifically for Claude Desktop integration and should not be confused with:

1. **Swarm stdio MCP** - Used for internal swarm coordination
2. **Web interface** - Browser-based dashboard on different port
3. **API server** - REST API for external integrations

Each serves a distinct purpose in the Claude-Zen ecosystem.