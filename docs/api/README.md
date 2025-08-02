# API Reference

**Complete API documentation for Claude Zen Flow - covering HTTP MCP, Stdio MCP, REST API, and WebSocket interfaces.**

## 🏗️ **API Architecture Overview**

Claude Zen Flow provides multiple API interfaces designed for different use cases:

### **1. HTTP MCP Server** (Port 3000)
- **Purpose**: Claude Desktop integration
- **Protocol**: Model Context Protocol over HTTP
- **Target**: Human-facing AI assistance
- **Authentication**: Optional API key

### **2. Stdio MCP Server**
- **Purpose**: Swarm coordination and automation
- **Protocol**: Model Context Protocol over stdin/stdout
- **Target**: Claude Code integration and automation
- **Authentication**: Process-based security

### **3. REST API** (Port 3456)
- **Purpose**: Web dashboard and programmatic access
- **Protocol**: RESTful HTTP API
- **Target**: Web applications and third-party integrations
- **Authentication**: Session-based or API key

### **4. WebSocket API** (Port 3456)
- **Purpose**: Real-time updates and monitoring
- **Protocol**: WebSocket with JSON messages
- **Target**: Live dashboards and real-time applications
- **Authentication**: Connection-based tokens

## 📚 **API Documentation Sections**

### **Core APIs**
- **[HTTP MCP API](http-mcp.md)** - Claude Desktop integration tools
- **[Stdio MCP API](stdio-mcp.md)** - Swarm coordination and agent management
- **[REST API](rest-api.md)** - Web dashboard and programmatic interface
- **[WebSocket API](websocket-api.md)** - Real-time communication

### **Specialized APIs**
- **[Neural API](neural-api.md)** - Neural network and WASM acceleration
- **[Memory API](memory-api.md)** - Persistent memory and state management
- **[GitHub API](github-api.md)** - Repository management and automation

### **Integration Guides**
- **[Authentication](authentication.md)** - API authentication methods
- **[Rate Limiting](rate-limiting.md)** - API usage limits and throttling
- **[Error Handling](error-handling.md)** - Standard error responses
- **[Webhooks](webhooks.md)** - Event-driven integrations

## 🚀 **Quick Start Examples**

### **HTTP MCP (Claude Desktop)**
```typescript
// Tool execution via HTTP MCP
const response = await fetch('http://localhost:3000/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'swarm_init',
      arguments: {
        topology: 'mesh',
        maxAgents: 5
      }
    }
  })
});
```

### **REST API (Web Dashboard)**
```typescript
// Get system status
const status = await fetch('http://localhost:3456/api/status')
  .then(r => r.json());

// Create new task
const task = await fetch('http://localhost:3456/api/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Implement authentication',
    priority: 'high',
    assignees: ['agent-1', 'agent-2']
  })
}).then(r => r.json());
```

### **WebSocket (Real-time Updates)**
```typescript
// Connect to WebSocket
const socket = io('http://localhost:3456');

// Subscribe to system events
socket.emit('subscribe', 'system');
socket.emit('subscribe', 'swarms');

// Handle real-time updates
socket.on('system:status', (data) => {
  console.log('System status update:', data);
});

socket.on('swarm:created', (data) => {
  console.log('New swarm created:', data);
});
```

### **Stdio MCP (Claude Code Integration)**
```bash
# Add to Claude Code
claude mcp add claude-zen npx claude-zen swarm mcp start

# Use in Claude Code session
# "Initialize a mesh swarm with 6 agents for document processing"
```

## 🔧 **Common API Patterns**

### **Request/Response Format**
All APIs follow consistent patterns for requests and responses:

```typescript
// Standard API Response Format
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}
```

### **Pagination**
```typescript
// Paginated requests
interface PaginatedRequest {
  page?: number;      // Page number (1-based)
  limit?: number;     // Items per page (max 100)
  sort?: string;      // Sort field
  order?: 'asc' | 'desc';
}

// Paginated responses
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### **Filtering and Search**
```typescript
// Query parameters for filtering
interface QueryParams {
  search?: string;           // Text search
  status?: string[];         // Status filter
  priority?: string[];       // Priority filter
  createdAfter?: string;     // Date filter (ISO)
  createdBefore?: string;    // Date filter (ISO)
}
```

## 🔐 **Authentication Methods**

### **API Key Authentication**
```bash
# Header-based authentication
curl -H "Authorization: Bearer your-api-key" \
     http://localhost:3456/api/status
```

### **Session Authentication**
```typescript
// Session-based authentication for web
const response = await fetch('/api/login', {
  method: 'POST',
  credentials: 'include',
  body: JSON.stringify({ username, password })
});
```

### **MCP Authentication**
```json
// MCP server configuration with authentication
{
  "mcpServers": {
    "claude-zen": {
      "command": "npx",
      "args": ["claude-zen", "mcp", "start"],
      "env": {
        "CLAUDE_ZEN_API_KEY": "your-api-key"
      }
    }
  }
}
```

## 📊 **API Performance**

### **System Capabilities**
- **Concurrency**: 1M+ requests/second capability
- **Vector Search**: Sub-millisecond semantic queries
- **Graph Traversal**: Millisecond-scale with Kuzu
- **Memory Usage**: 2KB per agent process
- **Real-time Updates**: WebSocket latency <10ms

### **Rate Limits**
- **Public API**: 1000 requests/hour
- **Authenticated API**: 10,000 requests/hour
- **WebSocket**: 100 messages/second
- **MCP Tools**: 500 tool calls/hour

## 🎯 **API Design Principles**

### **Consistency**
- Uniform naming conventions across all APIs
- Consistent error handling and response formats
- Standard HTTP status codes and methods

### **Reliability**
- Comprehensive error handling with detailed messages
- Request timeout protection and circuit breakers
- Automatic retry logic for transient failures

### **Performance**
- Efficient pagination for large datasets
- Response caching where appropriate
- Compressed responses for large payloads

### **Security**
- Multiple authentication methods supported
- Rate limiting to prevent abuse
- Input validation and sanitization

## 🔗 **API Integration Examples**

### **CI/CD Integration**
```yaml
# GitHub Actions example
- name: Deploy with Claude Zen Flow
  run: |
    # Start swarm for deployment
    SWARM_ID=$(claude-zen swarm init --topology hierarchical --format json | jq -r '.data.id')
    
    # Create deployment task
    claude-zen task create "Deploy to production" \
      --priority critical \
      --assignee deployment-agent
    
    # Monitor deployment progress
    claude-zen task status --watch --format json
```

### **Monitoring Integration**
```typescript
// Prometheus metrics integration
const metrics = await fetch('http://localhost:3456/api/metrics')
  .then(r => r.json());

// Send to monitoring system
await prometheusGateway.pushAdd({
  jobName: 'claude-zen-flow',
  groupings: { instance: 'production' },
  metrics: formatPrometheusMetrics(metrics.data)
});
```

### **Custom Dashboard**
```typescript
// React dashboard integration
const useClaudeCodeFlowAPI = () => {
  const [status, setStatus] = useState(null);
  const [swarms, setSwarms] = useState([]);
  
  useEffect(() => {
    const socket = io('http://localhost:3456');
    
    socket.on('system:status', setStatus);
    socket.on('swarms:update', setSwarms);
    
    return () => socket.disconnect();
  }, []);
  
  return { status, swarms };
};
```

## 📋 **API Versioning**

Claude Zen Flow APIs follow semantic versioning:

- **Current Version**: `v2.0.0-alpha.73`
- **Version Header**: `X-API-Version: 2.0`
- **Backward Compatibility**: Major versions maintained for 12 months
- **Deprecation Notice**: 6 months advance notice for breaking changes

### **Version-specific Endpoints**
```bash
# Versioned API endpoints
curl http://localhost:3456/api/v2/status
curl http://localhost:3000/mcp/v2/tools
```

## 🆘 **API Support**

### **Documentation**
- **Interactive Docs**: http://localhost:3456/api/docs (when running)
- **OpenAPI Spec**: Available at `/api/openapi.json`
- **Postman Collection**: Available in repository

### **Testing**
- **Health Checks**: All APIs provide `/health` endpoints
- **Test Suites**: Comprehensive API test coverage
- **Mock Servers**: Available for development and testing

### **Community**
- **GitHub Issues**: https://github.com/ruvnet/claude-zen-flow/issues
- **API Discussions**: https://github.com/ruvnet/claude-zen-flow/discussions
- **Examples**: https://github.com/ruvnet/claude-zen-flow/tree/main/examples/api

---

**Next Steps**: Choose the API that best fits your use case and explore the detailed documentation for each interface.