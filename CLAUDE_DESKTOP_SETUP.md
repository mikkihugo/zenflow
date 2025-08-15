# Claude Desktop Setup for claude-code-zen

## Quick Start

### 1. Start claude-code-zen (includes MCP server)
```bash
cd /home/mhugo/code/claude-code-zen
npm run dev
```

This starts:
- **Web UI**: http://localhost:3000
- **MCP endpoints**: http://localhost:3000/mcp

### 2. Configure Claude Desktop

Add this to your Claude Desktop MCP configuration:

**Location**: `~/.config/claude-desktop/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "claude-zen": {
      "command": "http://localhost:3000/mcp",
      "args": []
    }
  }
}
```

### 3. Available Tools

Once connected, you'll have access to these **simple development tools** in Claude Desktop:

#### Simple Swarm Tools (for Development)
- `simple_swarm_init` - Create a simple temporary swarm (max 5 agents)
- `simple_agent_spawn` - Spawn basic development agents (coder, researcher, tester)
- `simple_task` - Orchestrate simple development tasks (max 3 agents)
- `simple_status` - Get development swarm status and monitoring
- `simple_cleanup` - Clean up temporary development swarms

#### Document & Workflow Tools
- `document_import` - Import and analyze repository documents
- `roadmap_management` - Manage project roadmaps and planning
- `document_approval` - Handle document approval workflows
- `cube_coordination` - Coordinate with THE COLLECTIVE cube system

## Example Usage in Claude Desktop

Once connected, you can use tools like:

```
Use the swarm_init tool to create a new swarm with neural networks enabled:
{
  "topology": "hierarchical", 
  "maxAgents": 5,
  "neuralEnabled": true,
  "dspyEnabled": true,
  "sparcEnabled": true
}
```

```
Use the strategic_vision tool to analyze a project:
{
  "projectId": "my-project",
  "analysisType": "full",
  "importFromFiles": true
}
```

## Architecture

```
Claude Desktop
    ↓ (HTTP MCP)
HTTP MCP Server (port 3000)
    ↓ (Direct Integration)  
SwarmService
    ├── Neural Networks & Learning
    ├── DSPy Prompt Optimization
    ├── FACT Knowledge System
    ├── SPARC Methodology
    └── Multi-Database Storage
```

## Benefits

### ✅ Simplified Architecture
- **Single HTTP MCP server** instead of complex stdio setup
- **Direct SwarmService integration** - no wrapper layers
- **Port 3000** - easy to remember and configure

### ✅ Full Feature Access
- **Neural networks** with learning and optimization
- **DSPy integration** for prompt improvement  
- **FACT system** for knowledge management
- **SPARC methodology** for systematic development
- **Strategic planning** and architecture decisions

### ✅ Claude Desktop Native
- **HTTP MCP protocol** - designed for Claude Desktop
- **Real-time tool access** - all features available instantly
- **No CLI complexity** - just HTTP requests

## Troubleshooting

### Server Won't Start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill any existing process
kill -9 $(lsof -t -i:3000)

# Restart server
npm run mcp-server
```

### Claude Desktop Not Connecting
1. Check server is running: `curl http://localhost:3000`
2. Verify config file location: `~/.config/claude-desktop/claude_desktop_config.json`
3. Restart Claude Desktop after config changes

### Tools Not Appearing
1. Check server logs for errors
2. Verify MCP server registration in Claude Desktop settings
3. Restart both server and Claude Desktop

## Development

### Running in Development Mode
```bash
npm run mcp-server    # Development with tsx
npm run mcp-server:prod   # Production with compiled JS
```

### Adding New Tools
1. Add tool to `src/interfaces/mcp/direct-swarm-tools.ts` or `planning-orchestration-tools.ts`
2. Tools are automatically registered with the HTTP MCP server
3. Restart server to see new tools in Claude Desktop