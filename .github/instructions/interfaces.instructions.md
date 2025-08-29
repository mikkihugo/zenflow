---
applies_to: 'src/interfaces/**/*'
---

# Interface Systems Development Instructions

## Domain Focus

The interfaces domain handles web-based user interfaces and API endpoints. The primary focus is on the comprehensive web dashboard for enterprise AI development management.

## Key Subdirectories

```
src/interfaces/
├── api/           # REST API and WebSocket interfaces
│   └── http/      # HTTP REST API endpoints
└── terminal/      # Limited terminal UI components
    └── screens/   # Basic status screens
```

## Architecture Patterns

### Web-First Strategy

- **Web dashboard** as primary interface (apps/web-dashboard) 
- **HTTP API** for basic external integrations 
- **WebSocket** for real-time coordination updates
- **Limited terminal UI** for basic status display

### Limited MCP Integration

- **Standalone agent manager** for specific use cases only
- **Port and auth configuration** for GitHub integration
- **Web dashboard handles** primary interface responsibilities
- **MCP tools** only for specialized external tool needs

## Testing Strategy - London TDD (Mockist)

Use London TDD for interface code - test interactions and protocols:

```typescript
// Example: Test API endpoint interactions
describe('CoordinationAPI', () => {
  it('should handle coordination requests', async () => {
    const mockCoordinationManager = { createCoordination: jest.fn() };
    const api = new CoordinationAPI(mockCoordinationManager);

    const response = await api.createCoordination(request);

    expect(mockCoordinationManager.createCoordination).toHaveBeenCalledWith(request.params);
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
  @Post('/coordination')
  async createCoordination(@Body() request: CoordinationRequest): Promise<CoordinationResponse> {
    // Input validation
    // Service coordination
    // Response formatting
  }
}
```

### Web API Tools

```typescript
// Web-based tool implementation pattern
export const coordinationTool = {
  name: 'coordination_init',
  description: 'Initialize coordination with specified configuration',
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
    // Execute coordination initialization
    // Return structured response
  },
};
```

### WebSocket Real-time

```typescript
// WebSocket event patterns
export class RealtimeCoordination {
  @WebSocketEvent('coordination.status')
  async handleCoordinationStatus(client: WebSocket, data: CoordinationStatusRequest) {
    // Validate client permissions
    // Get current coordination status
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

### API Performance

- **<10ms tool execution** for simple coordination tools
- **<100ms tool execution** for complex coordination operations
- **WebSocket responsiveness** for real-time updates
- **Concurrent request handling** support

### Interface Responsiveness

- **Immediate CLI feedback** for user commands
- **Progressive loading** for web interfaces
- **Graceful degradation** when backend services unavailable
- **Caching** for frequently accessed data

## Integration Points

### With Coordination Domain

- **Expose coordination APIs** for external access
- **Real-time coordination updates** via WebSocket  
- **Web dashboard** for coordination management

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

### Web Interface Standards

- **Schema validation** for all API parameters
- **Consistent error handling** across all interfaces
- **Comprehensive input validation** and sanitization
- **Documentation** for all available endpoints

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

## Common Anti-Patterns to Avoid

- **Don't bypass input validation** - always validate user input
- **Don't ignore authentication** - secure all interface endpoints
- **Don't mix interface concerns** - keep presentation logic separate
- **Don't hardcode responses** - use configurable response formatting
- **Don't skip error handling** - handle all failure scenarios gracefully

## Monitoring and Debugging

- **Request/response logging** for all interfaces
- **Performance metrics** for API endpoints
- **API response monitoring** for performance tracking
- **WebSocket connection health** tracking
- **User interaction analytics** for interface optimization

The interfaces domain is the primary interaction point for users and systems. Maintain high usability standards and robust error handling across all interface types.
