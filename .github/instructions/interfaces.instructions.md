---
applies_to: 'src/interfaces/**/*'
---

# Interface Systems Development Instructions

## Domain Focus

The interfaces domain handles MCP server integration, API endpoints, and limited user interfaces. The primary focus is on MCP (Model Context Protocol) for AI tool integration with external systems.

## Key Subdirectories

```
src/interfaces/
├── api/           # REST API and WebSocket interfaces
│   └── http/      # HTTP REST API endpoints
├── mcp/           # MCP (Model Context Protocol) servers (primary interface)
└── terminal/      # Limited terminal UI components
    └── screens/   # Basic status screens
```

## Architecture Patterns

### MCP-Focused Strategy

- **MCP servers** for AI tool integration (primary interface approach)
- **HTTP API** for basic external integrations 
- **WebSocket** for real-time coordination updates
- **Limited terminal UI** for basic status display
- **Web dashboard** handled by separate app (apps/web-dashboard)

### MCP Integration (Critical)

- **HTTP MCP** (port 3000) for external tool integration with Claude Desktop
- **Stdio MCP** for internal swarm coordination with Claude Code
- **Tool schema validation** for all MCP tools
- **Protocol compliance** with MCP specifications

## Testing Strategy - London TDD (Mockist)

Use London TDD for interface code - test interactions and protocols:

```typescript
// Example: Test API endpoint interactions
describe('CoordinationAPI', () => {
  it('should handle swarm creation requests', async () => {
    const mockSwarmManager = { createSwarm: jest.fn() };
    const api = new CoordinationAPI(mockSwarmManager);

    const response = await api.createSwarm(request);

    expect(mockSwarmManager.createSwarm).toHaveBeenCalledWith(request.params);
    expect(response.status).toBe(201);
  });
});
```

## Interface-Specific Patterns

### CLI Interface

```typescript
// Follow established CLI patterns
export class CLICommand {
  async execute(args: CLIArgs): Promise<CLIResult> {
    // Validate input
    // Call appropriate domain services
    // Format output appropriately
    // Handle errors gracefully
  }
}
```

### HTTP API

```typescript
// REST API endpoint patterns
@Controller('/coordination')
export class CoordinationController {
  @Post('/swarms')
  async createSwarm(@Body() request: SwarmRequest): Promise<SwarmResponse> {
    // Input validation
    // Service coordination
    // Response formatting
  }
}
```

### MCP Server Tools

```typescript
// MCP tool implementation pattern
export const mcpSwarmTool: MCPTool = {
  name: 'swarm_init',
  description: 'Initialize a new swarm with specified configuration',
  inputSchema: {
    type: 'object',
    properties: {
      topology: { type: 'string', enum: ['mesh', 'hierarchical', 'ring'] },
      size: { type: 'number', minimum: 1, maximum: 100 },
    },
    required: ['topology'],
  },
  handler: async (params) => {
    // Validate parameters
    // Execute swarm initialization
    // Return structured response
  },
};
```

### WebSocket Real-time

```typescript
// WebSocket event patterns
export class RealtimeCoordination {
  @WebSocketEvent('swarm.status')
  async handleSwarmStatus(client: WebSocket, data: SwarmStatusRequest) {
    // Validate client permissions
    // Get current swarm status
    // Emit real-time updates
  }
}
```

## Performance Requirements

### API Performance

- **<100ms response time** for coordination APIs
- **<50ms response time** for status queries
- **Real-time updates** via WebSocket with <10ms latency
- **Rate limiting** to prevent abuse and ensure stability

### MCP Performance

- **<10ms tool execution** for simple coordination tools
- **<100ms tool execution** for complex swarm operations
- **Protocol compliance** with MCP specifications
- **Concurrent tool execution** support

### Interface Responsiveness

- **Immediate CLI feedback** for user commands
- **Progressive loading** for web interfaces
- **Graceful degradation** when backend services unavailable
- **Caching** for frequently accessed data

## Integration Points

### With Coordination Domain

- **Expose coordination APIs** for external access
- **Provide MCP tools** for swarm management
- **Real-time coordination updates** via WebSocket
- **CLI commands** for agent and swarm management

### With Neural Domain

- **Neural training APIs** for model management
- **Performance monitoring** for neural computations
- **WASM status reporting** through interfaces

### With Memory Domain

- **Memory management APIs** for external tools
- **Cache status reporting** and control
- **Memory usage monitoring** and alerts

## Quality Standards

### API Design

- **RESTful patterns** for HTTP APIs
- **Consistent error handling** across all interfaces
- **Comprehensive input validation** and sanitization
- **Rate limiting and security** measures

### MCP Compliance

- **Schema validation** for all tool parameters
- **Protocol specification adherence** for compatibility
- **Error handling** with proper MCP error codes
- **Documentation** for all available tools

### User Experience

- **Clear error messages** and helpful guidance
- **Consistent interface patterns** across all access methods
- **Comprehensive help** and documentation
- **Accessibility** considerations for all interfaces

## Common Interface Patterns

### Input Validation

```typescript
// Consistent validation patterns
export class InputValidator {
  static validateSwarmRequest(request: unknown): SwarmRequest {
    // Type validation
    // Business rule validation
    // Security validation
    return validatedRequest;
  }
}
```

### Error Handling

```typescript
// Standardized error responses
export class InterfaceError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400
  ) {
    super(message);
  }
}
```

### Authentication & Authorization

```typescript
// Security patterns for interfaces
export class InterfaceAuth {
  async validateRequest(request: Request): Promise<AuthContext> {
    // Token validation
    // Permission checking
    // Rate limiting
    return authContext;
  }
}
```

## MCP Server Configuration

### HTTP MCP Server (Port 3000)

- **External tool integration** with Claude Desktop
- **Project management tools** for human interaction
- **System status and monitoring** endpoints

### Stdio MCP Server

- **Internal swarm coordination** with Claude Code
- **Agent management tools** for AI automation
- **Task orchestration** and execution

## Common Anti-Patterns to Avoid

- **Don't bypass input validation** - always validate user input
- **Don't ignore authentication** - secure all interface endpoints
- **Don't mix interface concerns** - keep presentation logic separate
- **Don't hardcode responses** - use configurable response formatting
- **Don't skip error handling** - handle all failure scenarios gracefully

## Monitoring and Debugging

- **Request/response logging** for all interfaces
- **Performance metrics** for API endpoints
- **MCP protocol compliance** monitoring
- **WebSocket connection health** tracking
- **User interaction analytics** for interface optimization

The interfaces domain is the primary interaction point for users and systems. Maintain high usability standards and robust error handling across all interface types.
