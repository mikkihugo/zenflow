# MCP Server Guide - HTTP on Port 3000

## Overview

Claude Flow provides multiple MCP (Model Context Protocol) server implementations:

1. **STDIO MCP Server** - For Claude Desktop integration
2. **HTTP MCP Server** - REST API on port 3000 (NEW!)
3. **Cloudflare Worker MCP** - Edge deployment

## HTTP MCP Server (Port 3000)

### Features
- ✅ **All Claude Flow Tools** - Including Git operations
- ✅ **REST API** - Standard HTTP endpoints
- ✅ **CORS Enabled** - Cross-origin requests supported
- ✅ **87+ Tools** - Complete tool suite including:
  - Git version control (status, commit, push, pull, etc.)
  - Swarm coordination
  - Neural network operations
  - Memory management
  - GitHub integration
  - And much more!

### Starting the Server

```bash
# Method 1: Using npm script
npm run mcp:http

# Method 2: With custom port
MCP_PORT=3000 npm run mcp:server

# Method 3: Direct execution
node src/mcp/http-mcp-server.js
```

### API Endpoints

#### Health Check
```bash
GET http://localhost:3000/health
```

#### MCP Initialize
```bash
POST http://localhost:3000/mcp/initialize
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {}
}
```

#### List Tools
```bash
# MCP Protocol format
POST http://localhost:3000/mcp/tools/list
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list",
  "params": {}
}

# Human-readable format
GET http://localhost:3000/mcp/tools
```

#### Call a Tool
```bash
POST http://localhost:3000/mcp/tools/call
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "git_status",
    "arguments": {
      "short": true,
      "branch": true
    }
  }
}
```

### Available Git Tools

| Tool | Description | Example Arguments |
|------|-------------|-------------------|
| `git_status` | Get repository status | `{ "short": true, "branch": true }` |
| `git_add` | Stage files | `{ "files": ["src/*.js"], "all": true }` |
| `git_commit` | Create commit | `{ "message": "feat: add feature" }` |
| `git_push` | Push to remote | `{ "remote": "origin", "branch": "main" }` |
| `git_pull` | Pull from remote | `{ "rebase": true }` |
| `git_branch` | Manage branches | `{ "action": "create", "name": "feature" }` |
| `git_log` | View history | `{ "limit": 10, "oneline": true }` |
| `git_diff` | Show changes | `{ "staged": true }` |
| `git_clone` | Clone repository | `{ "url": "https://...", "branch": "main" }` |
| `git_stash` | Stash changes | `{ "action": "save", "message": "WIP" }` |
| `git_remote` | Manage remotes | `{ "action": "list", "verbose": true }` |
| `git_tag` | Manage tags | `{ "action": "create", "name": "v1.0.0" }` |

### Testing the Server

```bash
# Run the test script
node test-http-mcp.js
```

### Integration Examples

#### JavaScript/Node.js
```javascript
const response = await fetch('http://localhost:3000/mcp/tools/call', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'git_status',
      arguments: {}
    }
  })
});

const result = await response.json();
console.log(result);
```

#### Python
```python
import requests

response = requests.post('http://localhost:3000/mcp/tools/call', json={
    'jsonrpc': '2.0',
    'id': 1,
    'method': 'tools/call',
    'params': {
        'name': 'git_status',
        'arguments': {}
    }
})

print(response.json())
```

#### cURL
```bash
curl -X POST http://localhost:3000/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "git_status",
      "arguments": {"short": true}
    }
  }'
```

## Architecture

```
┌─────────────────────┐
│   HTTP Client       │
│  (Your App/Tool)    │
└──────────┬──────────┘
           │ HTTP
           ▼
┌─────────────────────┐
│  HTTP MCP Server    │
│   (Port 3000)       │
├─────────────────────┤
│  Express.js         │
│  CORS Enabled       │
│  JSON-RPC 2.0       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  MCP Core Server    │
│  (mcp-server.js)    │
├─────────────────────┤
│  • Tools Registry   │
│  • Git Tools        │
│  • Swarm Tools      │
│  • Neural Tools     │
│  • Memory Tools     │
└─────────────────────┘
```

## Comparison with Other MCP Modes

| Feature | STDIO Mode | HTTP Mode | Cloudflare Worker |
|---------|------------|-----------|-------------------|
| Protocol | stdin/stdout | HTTP REST | HTTP/Edge |
| Port | N/A | 3000 | N/A |
| Use Case | Claude Desktop | API Integration | Edge Deployment |
| CORS | N/A | ✅ Enabled | ✅ Enabled |
| Git Tools | ✅ | ✅ | ❌ (Security) |
| Local Files | ✅ | ✅ | ❌ |

## Security Notes

- The HTTP server binds to `0.0.0.0` by default (all interfaces)
- CORS is enabled for all origins (`*`)
- Git operations execute with the permissions of the Node.js process
- Consider using authentication/authorization for production deployments

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Git Command Not Found
Ensure Git is installed and in your PATH:
```bash
which git
git --version
```

### CORS Issues
The server has CORS enabled by default. If you still have issues, check:
- Browser console for specific CORS errors
- Network tab for preflight OPTIONS requests
- Ensure you're using the correct headers

## Next Steps

1. Start the server: `npm run mcp:http`
2. Test with: `curl http://localhost:3000/health`
3. Explore tools: `curl http://localhost:3000/mcp/tools`
4. Integrate with your application!

For more information, see the main [Claude Flow documentation](./README.md).