# MCP Integration

Comprehensive guide to Claude-Flow's Model Context Protocol (MCP) implementation, enabling seamless tool integration and extensible agent capabilities.

## Overview

Claude-Flow implements the Model Context Protocol (MCP) to provide standardized communication between AI agents and external tools, enabling dynamic tool discovery, secure execution, and extensible functionality.

## MCP Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    MCP Server                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Tool Registry  │  │  Transport Mgmt │  │ Security Layer  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Message Router  │  │ Session Manager │  │ Resource Limits │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│              Transport Layer (STDIO/HTTP/WebSocket)            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  STDIO Transport│  │  HTTP Transport │  │  WS Transport   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## MCP Server Configuration

### Basic Configuration

```json
{
  "mcp": {
    "enabled": true,
    "server": {
      "name": "claude-flow-mcp",
      "version": "1.0.0",
      "description": "Claude-Flow MCP Server for tool integration"
    },
    
    "transports": {
      "stdio": {
        "enabled": true,
        "timeout": 30000
      },
      "http": {
        "enabled": false,
        "port": 3000,
        "host": "localhost",
        "basePath": "/mcp"
      },
      "websocket": {
        "enabled": false,
        "port": 3001,
        "path": "/mcp-ws"
      }
    },
    
    "security": {
      "authentication": {
        "enabled": false,
        "method": "token"
      },
      "authorization": {
        "enabled": true,
        "defaultPolicy": "allow"
      },
      "rateLimiting": {
        "enabled": true,
        "requestsPerMinute": 100
      }
    }
  }
}
```

### Production Configuration

```json
{
  "mcp": {
    "enabled": true,
    "server": {
      "name": "claude-flow-mcp-prod",
      "version": "1.0.0",
      "environment": "production"
    },
    
    "transports": {
      "http": {
        "enabled": true,
        "port": 8080,
        "host": "0.0.0.0",
        "ssl": {
          "enabled": true,
          "cert": "./certs/server.crt",
          "key": "./certs/server.key"
        },
        "cors": {
          "enabled": true,
          "origins": ["https://app.example.com"],
          "credentials": true
        }
      },
      "websocket": {
        "enabled": true,
        "port": 8081,
        "ssl": {
          "enabled": true
        },
        "heartbeat": {
          "interval": 30000,
          "timeout": 10000
        }
      }
    },
    
    "security": {
      "authentication": {
        "enabled": true,
        "method": "jwt",
        "jwt": {
          "secret": "${JWT_SECRET}",
          "algorithm": "HS256",
          "expiresIn": "1h"
        }
      },
      "authorization": {
        "enabled": true,
        "defaultPolicy": "deny",
        "roles": {
          "agent": ["tool_execute", "tool_list"],
          "admin": ["*"]
        }
      },
      "rateLimiting": {
        "enabled": true,
        "global": {
          "requestsPerMinute": 1000,
          "burstSize": 100
        },
        "perClient": {
          "requestsPerMinute": 60,
          "burstSize": 10
        }
      }
    }
  }
}
```

## Tool Development and Registration

### Creating Custom Tools

```typescript
import { Tool, ToolInput, ToolOutput } from 'claude-flow/mcp';

// Define a custom tool
class FileSearchTool implements Tool {
  name = 'file_search';
  description = 'Search for files by name pattern and content';
  
  inputSchema = {
    type: 'object',
    properties: {
      pattern: {
        type: 'string',
        description: 'File name pattern (glob syntax)'
      },
      content: {
        type: 'string',
        description: 'Content to search for (optional)'
      },
      directory: {
        type: 'string',
        description: 'Directory to search in',
        default: './'
      },
      recursive: {
        type: 'boolean',
        description: 'Search recursively',
        default: true
      }
    },
    required: ['pattern']
  };
  
  async execute(input: ToolInput): Promise<ToolOutput> {
    const { pattern, content, directory = './', recursive = true } = input;
    
    try {
      const results = await this.searchFiles({
        pattern,
        content,
        directory,
        recursive
      });
      
      return {
        success: true,
        data: {
          files: results,
          count: results.length,
          searchCriteria: { pattern, content, directory, recursive }
        },
        metadata: {
          executionTime: Date.now(),
          tool: this.name
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SEARCH_ERROR',
          message: error.message,
          details: { pattern, directory }
        }
      };
    }
  }
  
  private async searchFiles(criteria: SearchCriteria): Promise<FileResult[]> {
    // Implementation for file searching
    // This would include glob pattern matching and content searching
    return [];
  }
}

// Register the tool
const mcpServer = new MCPServer(config);
await mcpServer.registerTool(new FileSearchTool());
```

### Tool Categories

#### File System Tools

```typescript
// File operations tool
class FileOperationsTool implements Tool {
  name = 'file_operations';
  description = 'Perform file system operations';
  
  inputSchema = {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        enum: ['read', 'write', 'delete', 'copy', 'move', 'mkdir']
      },
      path: { type: 'string' },
      content: { type: 'string' },
      destination: { type: 'string' },
      options: {
        type: 'object',
        properties: {
          recursive: { type: 'boolean' },
          overwrite: { type: 'boolean' },
          backup: { type: 'boolean' }
        }
      }
    },
    required: ['operation', 'path']
  };
  
  async execute(input: ToolInput): Promise<ToolOutput> {
    const { operation, path, content, destination, options = {} } = input;
    
    // Security validation
    if (!this.isPathAllowed(path)) {
      return {
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Path access not allowed'
        }
      };
    }
    
    switch (operation) {
      case 'read':
        return await this.readFile(path);
      case 'write':
        return await this.writeFile(path, content, options);
      case 'delete':
        return await this.deleteFile(path, options);
      // ... other operations
    }
  }
}
```

#### Web and API Tools

```typescript
// HTTP request tool
class HTTPRequestTool implements Tool {
  name = 'http_request';
  description = 'Make HTTP requests to external APIs';
  
  inputSchema = {
    type: 'object',
    properties: {
      url: { type: 'string', format: 'uri' },
      method: {
        type: 'string',
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
      },
      headers: {
        type: 'object',
        additionalProperties: { type: 'string' }
      },
      body: { type: 'string' },
      timeout: { type: 'number', default: 30000 }
    },
    required: ['url', 'method']
  };
  
  async execute(input: ToolInput): Promise<ToolOutput> {
    const { url, method, headers = {}, body, timeout = 30000 } = input;
    
    // URL validation and security checks
    if (!this.isUrlAllowed(url)) {
      return {
        success: false,
        error: {
          code: 'URL_BLOCKED',
          message: 'URL not in allowed domains'
        }
      };
    }
    
    try {
      const response = await fetch(url, {
        method,
        headers,
        body: method !== 'GET' ? body : undefined,
        signal: AbortSignal.timeout(timeout)
      });
      
      const responseBody = await response.text();
      
      return {
        success: true,
        data: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseBody
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'REQUEST_ERROR',
          message: error.message
        }
      };
    }
  }
}
```

#### Database Tools

```typescript
// Database query tool
class DatabaseQueryTool implements Tool {
  name = 'database_query';
  description = 'Execute database queries safely';
  
  inputSchema = {
    type: 'object',
    properties: {
      connection: { type: 'string' },
      query: { type: 'string' },
      parameters: {
        type: 'array',
        items: { type: 'string' }
      },
      readOnly: { type: 'boolean', default: true }
    },
    required: ['connection', 'query']
  };
  
  async execute(input: ToolInput): Promise<ToolOutput> {
    const { connection, query, parameters = [], readOnly = true } = input;
    
    // Query validation
    if (readOnly && this.isWriteQuery(query)) {
      return {
        success: false,
        error: {
          code: 'WRITE_DENIED',
          message: 'Write operations not allowed in read-only mode'
        }
      };
    }
    
    try {
      const db = await this.getConnection(connection);
      const result = await db.query(query, parameters);
      
      return {
        success: true,
        data: {
          rows: result.rows,
          rowCount: result.rowCount,
          fields: result.fields
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'QUERY_ERROR',
          message: error.message
        }
      };
    }
  }
}
```

### Tool Registration and Discovery

```bash
# Register tools via CLI
claude-flow mcp tool register ./tools/file-operations.js
claude-flow mcp tool register ./tools/web-scraper.js
claude-flow mcp tool register ./tools/database-query.js

# List registered tools
claude-flow mcp tool list

# Tool discovery
claude-flow mcp tool discover --category "file_system"
claude-flow mcp tool discover --capabilities "web_request"

# Test tool execution
claude-flow mcp tool test file_search \
  --input '{"pattern":"*.ts","directory":"./src"}'
```

**Programmatic Registration:**

```typescript
import { MCPServer, ToolRegistry } from 'claude-flow/mcp';

const server = new MCPServer(config);
const registry = new ToolRegistry();

// Register tools
await registry.register([
  new FileSearchTool(),
  new HTTPRequestTool(),
  new DatabaseQueryTool(),
  new GitOperationsTool(),
  new CodeAnalysisTool()
]);

// Auto-discovery from directory
await registry.discoverTools('./tools', {
  pattern: '**/*.{js,ts}',
  validate: true,
  autoRegister: true
});

// Set up tool categories
await registry.addCategory('development', {
  tools: ['file_search', 'git_operations', 'code_analysis'],
  description: 'Development workflow tools',
  permissions: ['read_code', 'execute_git']
});

// Start server with registry
await server.start(registry);
```

## Transport Protocols

### STDIO Transport

Default transport for local agent communication:

```json
{
  "mcp": {
    "transports": {
      "stdio": {
        "enabled": true,
        "encoding": "utf8",
        "timeout": 30000,
        "bufferSize": 65536,
        "messageFormat": "jsonrpc",
        "compression": false
      }
    }
  }
}
```

**Usage:**
```bash
# Start MCP server with STDIO
claude-flow mcp start --transport stdio

# Connect agent to MCP via STDIO
claude-flow agent spawn researcher \
  --mcp-transport stdio \
  --mcp-timeout 30000
```

### HTTP Transport

RESTful API transport for web integration:

```json
{
  "mcp": {
    "transports": {
      "http": {
        "enabled": true,
        "port": 3000,
        "host": "localhost",
        "basePath": "/api/mcp",
        "cors": {
          "enabled": true,
          "origins": ["http://localhost:3001"],
          "methods": ["GET", "POST"],
          "headers": ["Content-Type", "Authorization"]
        },
        "middleware": {
          "compression": true,
          "requestLogging": true,
          "errorHandling": true
        }
      }
    }
  }
}
```

**HTTP API Endpoints:**

```bash
# Tool discovery
GET /api/mcp/tools
GET /api/mcp/tools/{toolName}

# Tool execution
POST /api/mcp/tools/{toolName}/execute
{
  "input": {
    "parameter1": "value1",
    "parameter2": "value2"
  },
  "options": {
    "timeout": 30000,
    "async": false
  }
}

# Server capabilities
GET /api/mcp/capabilities

# Health check
GET /api/mcp/health
```

### WebSocket Transport

Real-time bidirectional communication:

```json
{
  "mcp": {
    "transports": {
      "websocket": {
        "enabled": true,
        "port": 3001,
        "path": "/mcp-ws",
        "heartbeat": {
          "enabled": true,
          "interval": 30000,
          "timeout": 10000
        },
        "compression": {
          "enabled": true,
          "threshold": 1024
        },
        "authentication": {
          "required": true,
          "method": "token"
        }
      }
    }
  }
}
```

**WebSocket Usage:**

```typescript
import { MCPWebSocketClient } from 'claude-flow/mcp';

const client = new MCPWebSocketClient({
  url: 'ws://localhost:3001/mcp-ws',
  authentication: {
    token: 'your-auth-token'
  },
  reconnect: {
    enabled: true,
    maxAttempts: 5,
    delay: 1000
  }
});

// Connect and discover tools
await client.connect();
const tools = await client.discoverTools();

// Execute tool with real-time updates
const result = await client.executeTool('file_search', {
  pattern: '*.js',
  directory: './src'
}, {
  onProgress: (progress) => {
    console.log(`Progress: ${progress.percentage}%`);
  }
});
```

## Security and Permissions

### Authentication

```json
{
  "mcp": {
    "security": {
      "authentication": {
        "enabled": true,
        "methods": {
          "token": {
            "enabled": true,
            "tokens": [
              {
                "id": "agent-token-1",
                "value": "${AGENT_TOKEN_1}",
                "permissions": ["tool_execute", "tool_list"],
                "expiresAt": "2024-12-31T23:59:59Z"
              }
            ]
          },
          "jwt": {
            "enabled": true,
            "secret": "${JWT_SECRET}",
            "algorithm": "HS256",
            "issuer": "claude-flow",
            "audience": "mcp-clients"
          },
          "certificate": {
            "enabled": false,
            "ca": "./certs/ca.pem",
            "verifyClient": true
          }
        }
      }
    }
  }
}
```

### Authorization and Permissions

```typescript
// Define permission system
class MCPPermissionManager {
  private permissions = new Map<string, Permission[]>();
  
  defineRole(roleName: string, permissions: Permission[]): void {
    this.permissions.set(roleName, permissions);
  }
  
  async authorize(
    clientId: string, 
    action: string, 
    resource: string
  ): Promise<boolean> {
    const clientPermissions = await this.getClientPermissions(clientId);
    
    return clientPermissions.some(permission => 
      this.matchesPermission(permission, action, resource)
    );
  }
  
  private matchesPermission(
    permission: Permission, 
    action: string, 
    resource: string
  ): boolean {
    return (
      (permission.actions.includes('*') || permission.actions.includes(action)) &&
      (permission.resources.includes('*') || permission.resources.includes(resource))
    );
  }
}

// Permission definitions
const permissionManager = new MCPPermissionManager();

permissionManager.defineRole('agent', [
  {
    actions: ['tool_list', 'tool_execute'],
    resources: ['file_operations', 'web_request', 'database_query'],
    conditions: ['read_only', 'safe_paths_only']
  }
]);

permissionManager.defineRole('admin', [
  {
    actions: ['*'],
    resources: ['*'],
    conditions: []
  }
]);
```

### Sandboxing and Resource Limits

```json
{
  "mcp": {
    "security": {
      "sandbox": {
        "enabled": true,
        "type": "container",
        "limits": {
          "memory": "512mb",
          "cpu": "50%",
          "networkAccess": "restricted",
          "fileSystem": "restricted"
        },
        "allowedPaths": ["/tmp/mcp", "/workspace"],
        "blockedCommands": ["rm", "sudo", "chmod"]
      },
      
      "resourceLimits": {
        "maxConcurrentTools": 10,
        "toolExecutionTimeout": 300000,
        "maxMemoryPerTool": "256mb",
        "maxOutputSize": "10mb"
      }
    }
  }
}
```

## Tool Execution and Lifecycle

### Execution Models

#### Synchronous Execution

```typescript
// Execute tool synchronously
const result = await mcpClient.executeTool('file_search', {
  pattern: '*.ts',
  directory: './src',
  recursive: true
});

console.log(`Found ${result.data.count} files`);
```

#### Asynchronous Execution

```typescript
// Execute tool asynchronously
const executionId = await mcpClient.executeToolAsync('large_file_process', {
  inputFile: './data/large_dataset.csv',
  operation: 'analyze'
});

// Monitor execution
const status = await mcpClient.getExecutionStatus(executionId);
console.log(`Status: ${status.state}, Progress: ${status.progress}%`);

// Get result when complete
const result = await mcpClient.getExecutionResult(executionId);
```

#### Streaming Execution

```typescript
// Execute with streaming results
const stream = await mcpClient.executeToolStream('log_analysis', {
  logFile: './logs/application.log',
  pattern: 'ERROR'
});

stream.on('data', (chunk) => {
  console.log('Log entry:', chunk.data);
});

stream.on('progress', (progress) => {
  console.log(`Progress: ${progress.percentage}%`);
});

stream.on('complete', (result) => {
  console.log('Analysis complete:', result.summary);
});
```

### Error Handling and Recovery

```typescript
// Robust error handling
class MCPExecutionManager {
  async executeWithRetry(
    toolName: string, 
    input: any, 
    options: ExecutionOptions = {}
  ): Promise<ToolOutput> {
    const maxRetries = options.maxRetries || 3;
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.executeTool(toolName, input, {
          ...options,
          timeout: options.timeout * attempt // Increase timeout on retry
        });
      } catch (error) {
        lastError = error;
        
        if (!this.isRetryable(error) || attempt === maxRetries) {
          throw error;
        }
        
        // Exponential backoff
        const delay = Math.pow(2, attempt - 1) * 1000;
        await this.sleep(delay);
      }
    }
    
    throw lastError!;
  }
  
  private isRetryable(error: Error): boolean {
    const retryableCodes = [
      'TIMEOUT',
      'NETWORK_ERROR',
      'SERVICE_UNAVAILABLE',
      'RATE_LIMITED'
    ];
    
    return retryableCodes.includes(error.code);
  }
}
```

## Monitoring and Observability

### Performance Monitoring

```bash
# Monitor MCP server performance
claude-flow mcp monitor \
  --metrics requests,latency,errors,tools \
  --interval 30 \
  --export prometheus

# Tool execution analytics
claude-flow mcp analytics \
  --timeframe "last-24-hours" \
  --breakdown tool,client,success_rate

# Performance profiling
claude-flow mcp profile \
  --tool file_search \
  --duration 300 \
  --samples 1000
```

### Logging and Audit

```json
{
  "mcp": {
    "logging": {
      "enabled": true,
      "level": "info",
      "format": "structured",
      "destinations": ["console", "file"],
      
      "audit": {
        "enabled": true,
        "logLevel": "info",
        "events": [
          "tool_execution",
          "authentication",
          "authorization_failure",
          "rate_limit_exceeded"
        ],
        "includePayload": false,
        "retention": "90_days"
      },
      
      "performance": {
        "logSlowTools": true,
        "slowToolThreshold": 5000,
        "logResourceUsage": true
      }
    }
  }
}
```

### Health Checks and Diagnostics

```typescript
// MCP health monitoring
class MCPHealthMonitor {
  async runHealthCheck(): Promise<HealthReport> {
    const report: HealthReport = {
      status: 'healthy',
      timestamp: new Date(),
      checks: []
    };
    
    // Check server connectivity
    const serverHealth = await this.checkServerHealth();
    report.checks.push(serverHealth);
    
    // Check tool availability
    const toolHealth = await this.checkToolHealth();
    report.checks.push(toolHealth);
    
    // Check resource usage
    const resourceHealth = await this.checkResourceHealth();
    report.checks.push(resourceHealth);
    
    // Determine overall status
    report.status = report.checks.every(check => check.status === 'healthy') 
      ? 'healthy' 
      : 'degraded';
    
    return report;
  }
  
  private async checkToolHealth(): Promise<HealthCheck> {
    const tools = await this.mcpClient.listTools();
    const failedTests = [];
    
    for (const tool of tools) {
      try {
        await this.testTool(tool.name);
      } catch (error) {
        failedTests.push({ tool: tool.name, error: error.message });
      }
    }
    
    return {
      name: 'tool_health',
      status: failedTests.length === 0 ? 'healthy' : 'unhealthy',
      details: {
        totalTools: tools.length,
        failedTools: failedTests.length,
        failures: failedTests
      }
    };
  }
}
```

## Advanced Features

### Tool Composition and Pipelines

```typescript
// Create tool execution pipeline
class ToolPipeline {
  private steps: PipelineStep[] = [];
  
  addStep(toolName: string, transform?: (input: any, previousOutput: any) => any): this {
    this.steps.push({ toolName, transform });
    return this;
  }
  
  async execute(initialInput: any): Promise<any> {
    let currentInput = initialInput;
    let previousOutput = null;
    
    for (const step of this.steps) {
      const input = step.transform 
        ? step.transform(currentInput, previousOutput)
        : currentInput;
      
      const output = await this.mcpClient.executeTool(step.toolName, input);
      
      previousOutput = output;
      currentInput = output.data;
    }
    
    return previousOutput;
  }
}

// Usage example
const pipeline = new ToolPipeline()
  .addStep('file_search', (input) => ({
    pattern: '*.log',
    directory: input.directory
  }))
  .addStep('log_analysis', (input, previousOutput) => ({
    files: previousOutput.data.files,
    pattern: input.errorPattern
  }))
  .addStep('report_generation', (input, previousOutput) => ({
    analysisResults: previousOutput.data,
    format: 'html'
  }));

const result = await pipeline.execute({
  directory: './logs',
  errorPattern: 'ERROR|FATAL'
});
```

### Dynamic Tool Loading

```typescript
// Dynamic tool loader
class DynamicToolLoader {
  async loadTool(toolPath: string): Promise<Tool> {
    const toolModule = await import(toolPath);
    const ToolClass = toolModule.default || toolModule.Tool;
    
    if (!ToolClass) {
      throw new Error(`No tool class found in ${toolPath}`);
    }
    
    const tool = new ToolClass();
    
    // Validate tool interface
    await this.validateTool(tool);
    
    return tool;
  }
  
  async loadToolsFromDirectory(directory: string): Promise<Tool[]> {
    const toolFiles = await this.findToolFiles(directory);
    const tools: Tool[] = [];
    
    for (const file of toolFiles) {
      try {
        const tool = await this.loadTool(file);
        tools.push(tool);
      } catch (error) {
        console.warn(`Failed to load tool from ${file}:`, error.message);
      }
    }
    
    return tools;
  }
  
  private async validateTool(tool: any): Promise<void> {
    const requiredMethods = ['execute'];
    const requiredProperties = ['name', 'description', 'inputSchema'];
    
    for (const method of requiredMethods) {
      if (typeof tool[method] !== 'function') {
        throw new Error(`Tool missing required method: ${method}`);
      }
    }
    
    for (const property of requiredProperties) {
      if (!tool[property]) {
        throw new Error(`Tool missing required property: ${property}`);
      }
    }
  }
}
```

This comprehensive MCP integration guide covers all aspects of implementing and using the Model Context Protocol in Claude-Flow, from basic tool development to advanced features like tool pipelines and dynamic loading.