# WebSocket API Reference

Claude Code Flow provides real-time communication through WebSocket connections for live updates, swarm coordination, and interactive features.

## Connection Setup

### Basic WebSocket Connection

```javascript
const ws = new WebSocket('ws://localhost:3000/ws');

ws.onopen = () => {
  console.log('Connected to Claude Zen WebSocket');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  handleMessage(message);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('WebSocket connection closed');
};
```

### Authentication

```javascript
// Send authentication after connection
const authMessage = {
  type: 'auth',
  token: 'your-auth-token',
  clientId: 'client-unique-id'
};

ws.send(JSON.stringify(authMessage));
```

## Message Protocol

All WebSocket messages follow a consistent JSON protocol:

```javascript
{
  id: 'unique-message-id',        // Optional: for request-response correlation
  type: 'message-type',           // Required: message type
  channel: 'channel-name',        // Optional: for topic-based routing
  timestamp: '2024-01-01T00:00:00Z', // Automatic: message timestamp
  data: { /* payload */ },        // Required: message payload
  metadata: { /* extra info */ }  // Optional: additional metadata
}
```

## Message Types

### System Messages

#### Connection Acknowledgment
```javascript
{
  type: 'connection_ack',
  data: {
    clientId: 'client-12345',
    serverId: 'server-instance-001',
    capabilities: ['swarm', 'memory', 'coordination'],
    version: '2.0.0-alpha.70'
  }
}
```

#### Heartbeat
```javascript
// Sent every 30 seconds
{
  type: 'heartbeat',
  data: {
    timestamp: '2024-01-01T00:00:00Z',
    uptime: 3600000 // milliseconds
  }
}
```

#### Error Messages
```javascript
{
  type: 'error',
  data: {
    code: 'INVALID_MESSAGE',
    message: 'Message type not recognized',
    details: { receivedType: 'unknown-type' }
  }
}
```

### Swarm Coordination Messages

#### Swarm Status Updates
```javascript
{
  type: 'swarm_status',
  channel: 'swarm-coordination',
  data: {
    swarmId: 'swarm-001',
    status: 'active',
    topology: 'hierarchical',
    agents: {
      total: 8,
      active: 6,
      idle: 2,
      failed: 0
    },
    performance: {
      tasksCompleted: 45,
      averageResponseTime: 1200,
      throughput: 25.5
    }
  }
}
```

#### Agent Events
```javascript
// Agent spawned
{
  type: 'agent_spawned',
  channel: 'swarm-events',
  data: {
    swarmId: 'swarm-001',
    agentId: 'agent-coder-003',
    agentType: 'coder',
    capabilities: ['javascript', 'rust', 'testing'],
    spawnedAt: '2024-01-01T12:00:00Z'
  }
}

// Agent status change
{
  type: 'agent_status',
  channel: 'swarm-events',
  data: {
    swarmId: 'swarm-001',
    agentId: 'agent-coder-003',
    oldStatus: 'idle',
    newStatus: 'working',
    taskId: 'task-optimization-001'
  }
}

// Agent failure
{
  type: 'agent_failure',
  channel: 'swarm-events',
  data: {
    swarmId: 'swarm-001',
    agentId: 'agent-analyzer-002',
    reason: 'timeout',
    failedAt: '2024-01-01T12:05:00Z',
    recoveryAction: 'restart'
  }
}
```

#### Task Events
```javascript
// Task assigned
{
  type: 'task_assigned',
  channel: 'task-coordination',
  data: {
    taskId: 'task-001',
    assignedTo: 'agent-coder-003',
    swarmId: 'swarm-001',
    priority: 'high',
    estimatedDuration: 300000 // 5 minutes
  }
}

// Task progress update
{
  type: 'task_progress',
  channel: 'task-coordination',
  data: {
    taskId: 'task-001',
    agentId: 'agent-coder-003',
    progress: 0.65, // 65% complete
    message: 'Code optimization in progress',
    estimatedTimeRemaining: 120000 // 2 minutes
  }
}

// Task completed
{
  type: 'task_completed',
  channel: 'task-coordination',
  data: {
    taskId: 'task-001',
    agentId: 'agent-coder-003',
    result: 'success',
    executionTime: 285000, // 4:45
    output: 'Database queries optimized, 40% performance improvement'
  }
}
```

### Memory Events

#### Memory Updates
```javascript
{
  type: 'memory_updated',
  channel: 'memory-events',
  data: {
    operation: 'store',
    key: 'project-context',
    namespace: 'active-projects',
    timestamp: '2024-01-01T12:00:00Z',
    size: 2048 // bytes
  }
}
```

#### Vector Search Results
```javascript
{
  type: 'vector_search_complete',
  channel: 'memory-events',
  data: {
    queryId: 'search-001',
    query: 'optimization strategies',
    results: [
      {
        id: 'doc-001',
        score: 0.95,
        content: 'Database connection pooling for optimization',
        metadata: { category: 'performance' }
      }
    ],
    executionTime: 45 // milliseconds
  }
}
```

### Real-time API Updates

#### Schema Changes
```javascript
{
  type: 'schema_updated',
  channel: 'api-updates',
  data: {
    changes: [
      {
        type: 'endpoint_added',
        endpoint: '/api/v1/new-feature',
        method: 'POST'
      }
    ],
    version: '2.0.1-alpha.71'
  }
}
```

#### Metrics Updates
```javascript
{
  type: 'metrics_update',
  channel: 'system-metrics',
  data: {
    timestamp: '2024-01-01T12:00:00Z',
    metrics: {
      requests_per_second: 45.2,
      active_connections: 128,
      memory_usage: 0.75, // 75%
      cpu_usage: 0.42,    // 42%
      error_rate: 0.02    // 2%
    }
  }
}
```

## Channel Subscriptions

### Subscribe to Channels

```javascript
// Subscribe to specific channels
const subscribeMessage = {
  type: 'subscribe',
  data: {
    channels: [
      'swarm-coordination',
      'task-coordination', 
      'memory-events',
      'system-metrics'
    ]
  }
};

ws.send(JSON.stringify(subscribeMessage));
```

### Channel Patterns

#### Wildcard Subscriptions
```javascript
{
  type: 'subscribe',
  data: {
    patterns: [
      'swarm-*',        // All swarm-related channels
      '*-events',       // All event channels
      'agent-*-status'  // Specific agent status channels
    ]
  }
}
```

#### Filtered Subscriptions
```javascript
{
  type: 'subscribe',
  data: {
    channels: ['swarm-coordination'],
    filters: {
      swarmId: 'swarm-001',
      agentType: 'coder',
      priority: ['high', 'critical']
    }
  }
}
```

### Unsubscribe
```javascript
{
  type: 'unsubscribe',
  data: {
    channels: ['system-metrics']
  }
}
```

## Request-Response Pattern

### Making Requests

```javascript
// Request swarm status
const requestId = 'req-' + Date.now();
const request = {
  id: requestId,
  type: 'request',
  data: {
    action: 'get_swarm_status',
    swarmId: 'swarm-001',
    detailed: true
  }
};

ws.send(JSON.stringify(request));

// Handle response
const pendingRequests = new Map();
pendingRequests.set(requestId, (response) => {
  console.log('Swarm status:', response.data);
});

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'response' && message.id && pendingRequests.has(message.id)) {
    const handler = pendingRequests.get(message.id);
    handler(message);
    pendingRequests.delete(message.id);
  }
};
```

### Available Actions

#### Swarm Actions
```javascript
// Get swarm status
{
  action: 'get_swarm_status',
  swarmId: 'swarm-001',
  detailed: true
}

// Spawn agent
{
  action: 'spawn_agent',
  swarmId: 'swarm-001',
  agentType: 'coder',
  capabilities: ['javascript', 'optimization']
}

// Assign task
{
  action: 'assign_task',
  taskId: 'task-001',
  agentId: 'agent-coder-003',
  priority: 'high'
}
```

#### Memory Actions
```javascript
// Store data
{
  action: 'memory_store',
  key: 'session-data',
  value: { /* data */ },
  namespace: 'sessions'
}

// Search vectors
{
  action: 'vector_search',
  query: 'optimization techniques',
  limit: 10,
  threshold: 0.8
}
```

## Client Libraries

### JavaScript/Node.js Client

```javascript
class ClaudeZenWebSocketClient {
  constructor(url, options = {}) {
    this.url = url;
    this.options = options;
    this.ws = null;
    this.subscriptions = new Set();
    this.pendingRequests = new Map();
    this.eventHandlers = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('Connected to Claude Zen WebSocket');
        resolve();
      };
      
      this.ws.onerror = reject;
      this.ws.onmessage = this.handleMessage.bind(this);
    });
  }

  subscribe(channels, handler) {
    channels.forEach(channel => this.subscriptions.add(channel));
    
    this.send({
      type: 'subscribe',
      data: { channels }
    });

    if (handler) {
      channels.forEach(channel => {
        if (!this.eventHandlers.has(channel)) {
          this.eventHandlers.set(channel, []);
        }
        this.eventHandlers.get(channel).push(handler);
      });
    }
  }

  async request(action, data = {}) {
    const requestId = 'req-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(requestId, { resolve, reject });
      
      this.send({
        id: requestId,
        type: 'request',
        data: { action, ...data }
      });
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  send(message) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  handleMessage(event) {
    const message = JSON.parse(event.data);
    
    // Handle responses to requests
    if (message.type === 'response' && message.id && this.pendingRequests.has(message.id)) {
      const { resolve } = this.pendingRequests.get(message.id);
      this.pendingRequests.delete(message.id);
      resolve(message.data);
      return;
    }
    
    // Handle channel messages
    if (message.channel && this.eventHandlers.has(message.channel)) {
      const handlers = this.eventHandlers.get(message.channel);
      handlers.forEach(handler => handler(message));
    }
  }
}
```

### Usage Example

```javascript
const client = new ClaudeZenWebSocketClient('ws://localhost:3000/ws');

await client.connect();

// Subscribe to swarm events
client.subscribe(['swarm-coordination', 'task-coordination'], (message) => {
  console.log('Swarm event:', message);
});

// Request swarm status
const status = await client.request('get_swarm_status', {
  swarmId: 'swarm-001',
  detailed: true
});

console.log('Swarm status:', status);
```

## Error Handling

### Connection Errors

```javascript
ws.onerror = (error) => {
  console.error('WebSocket error:', error);
  
  // Implement reconnection logic
  setTimeout(() => {
    reconnect();
  }, 5000);
};

ws.onclose = (event) => {
  if (event.code !== 1000) { // Not normal closure
    console.warn('WebSocket closed unexpectedly:', event.code, event.reason);
    reconnect();
  }
};
```

### Message Errors

```javascript
{
  type: 'error',
  data: {
    code: 'INVALID_CHANNEL',
    message: 'Channel does not exist',
    originalMessage: { /* the message that caused the error */ }
  }
}
```

### Rate Limiting

```javascript
{
  type: 'rate_limit_exceeded',
  data: {
    limit: 100,
    window: 60000, // 1 minute
    retryAfter: 30000 // 30 seconds
  }
}
```

## Performance Considerations

### Connection Pooling
- Limit concurrent connections per client
- Use connection pooling for server-side WebSocket clients
- Implement proper cleanup for idle connections

### Message Batching
```javascript
// Batch multiple updates into single message
{
  type: 'batch_update',
  data: {
    updates: [
      { type: 'agent_status', /* ... */ },
      { type: 'task_progress', /* ... */ },
      { type: 'metrics_update', /* ... */ }
    ]
  }
}
```

### Selective Updates
```javascript
// Subscribe only to needed updates
client.subscribe(['swarm-coordination'], (message) => {
  if (message.data.swarmId === currentSwarmId) {
    updateUI(message.data);
  }
});
```

## Security

### Authentication
```javascript
// Include authentication in connection headers
const ws = new WebSocket('ws://localhost:3000/ws', {
  headers: {
    'Authorization': 'Bearer your-jwt-token'
  }
});
```

### Message Validation
All incoming messages are validated for:
- Proper JSON format
- Required fields
- Valid message types
- Channel permissions
- Rate limits

### Channel Security
- Private channels require authentication
- Role-based channel access
- Message filtering based on permissions