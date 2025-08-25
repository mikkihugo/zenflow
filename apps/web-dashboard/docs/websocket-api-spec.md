# WebSocket-First API Architecture

## Core Principle: Single WebSocket Connection (Port 3003)

Replace the 40+ REST endpoints with a simplified WebSocket-based message system.

## WebSocket Message Protocol

### Connection Format
```typescript
interface WebSocketMessage {
  id: string;              // Request ID for response matching
  type: 'request' | 'response' | 'event';
  action: string;          // API action (replaces REST endpoints)
  data?: any;             // Payload
  timestamp: number;
}
```

### Core Actions (Replace REST Endpoints)

#### System Operations
```typescript
// Health check
{ type: 'request', action: 'system.health', id: 'req_001' }
→ { type: 'response', action: 'system.health', id: 'req_001', data: { status: 'ok', timestamp: 1234567890 } }

// System capabilities  
{ type: 'request', action: 'system.capabilities', id: 'req_002' }
→ { type: 'response', action: 'system.capabilities', id: 'req_002', data: { facades: [...], healthScore: 85 } }
```

#### Agent Operations
```typescript
// Agent status
{ type: 'request', action: 'agents.status', id: 'req_003' }
→ { type: 'response', action: 'agents.status', id: 'req_003', data: { active: 5, total: 12, performance: {...} } }

// Swarm operations
{ type: 'request', action: 'swarm.create', id: 'req_004', data: { type: 'research', config: {...} } }
→ { type: 'response', action: 'swarm.create', id: 'req_004', data: { swarmId: 'sw_001', agents: [...] } }
```

#### Real-time Events (Push from server)
```typescript
// System events
{ type: 'event', action: 'system.health.changed', data: { status: 'degraded', reason: 'memory_high' } }

// Agent events  
{ type: 'event', action: 'agent.status.changed', data: { agentId: 'ag_001', status: 'completed', result: {...} } }

// Performance events
{ type: 'event', action: 'metrics.updated', data: { cpu: 45, memory: 67, agents: 8 } }
```

## Implementation Benefits

### Simplified Client Architecture
```typescript
// Single WebSocket connection replaces 40+ REST endpoints
class WebSocketAPIClient {
  private ws: WebSocket;
  private requestMap = new Map<string, (response: any) => void>();
  
  async request(action: string, data?: any): Promise<any> {
    const id = generateId();
    return new Promise((resolve) => {
      this.requestMap.set(id, resolve);
      this.ws.send(JSON.stringify({ type: 'request', action, data, id }));
    });
  }
  
  // Real-time event handling
  onEvent(action: string, handler: (data: any) => void) {
    // Subscribe to specific event types
  }
}

// Usage - much simpler than REST
const api = new WebSocketAPIClient();
await api.request('system.health');                    // Replaces GET /api/v1/health
await api.request('agents.status');                    // Replaces GET /api/v1/agents/status  
await api.request('swarm.create', { type: 'research' }); // Replaces POST /api/v1/swarm
```

### Connection Monitoring Integration
```typescript
// Perfect for connection banner - single connection to monitor
class ConnectionMonitor {
  constructor(private api: WebSocketAPIClient) {
    this.api.onConnectionChange((connected) => {
      // Update banner directly - no polling needed
      connectionStatus.update(state => ({ ...state, connected }));
    });
  }
}
```

## Migration Strategy

### Phase 1: Core Operations
- Replace health, status, capabilities endpoints
- Implement WebSocket client with connection monitoring
- Update connection banner to use WebSocket status

### Phase 2: Agent Operations  
- Replace agent management endpoints
- Add real-time agent status events
- Update dashboard components to use WebSocket API

### Phase 3: Advanced Features
- Replace document/project endpoints
- Add real-time progress events
- Remove REST API entirely

## Performance Improvements

- **90% reduction in HTTP overhead** - Single persistent connection
- **Real-time updates** - No polling, instant event delivery  
- **Simplified state management** - Single connection status
- **Better error handling** - Connection state directly reflects API availability
- **Automatic reconnection** - Built into WebSocket protocol

## Port Configuration (Never Change)
- **Port 3003**: Nginx-mapped WebSocket endpoint (production)
- **Port 3000**: Development WebSocket server
- **No Port 3004**: Not used as specified