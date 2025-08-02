# WebSocket API - Real-time Communication and Live Updates

**Real-time WebSocket API for live monitoring, instant notifications, and interactive swarm coordination.**

## 🎯 **Overview**

Claude Zen Flow's WebSocket API provides real-time bidirectional communication for live system monitoring, instant notifications, interactive swarm coordination, and collaborative development workflows. Built for sub-10ms latency and high-throughput event streaming.

## 🚀 **Connection Setup**

### **JavaScript/TypeScript Client**
```typescript
import { io, Socket } from 'socket.io-client';

/**
 * Connect to Claude Zen Flow WebSocket API
 * Supports authentication, reconnection, and event buffering
 * @example
 * ```typescript
 * const socket = await connectToClaudeZenFlow({
 *   url: 'http://localhost:3456',
 *   auth: { token: 'your-api-token' },
 *   autoReconnect: true,
 *   bufferEvents: true
 * });
 * 
 * socket.on('swarm:task:completed', (task) => {
 *   console.log(`Task ${task.id} completed by ${task.assignee}`);
 * });
 * ```
 */
async function connectToClaudeZenFlow(config: {
  url: string;
  auth?: { token: string; userId?: string };
  autoReconnect?: boolean;
  bufferEvents?: boolean;
  timeout?: number;
}): Promise<Socket> {
  const socket = io(config.url, {
    auth: config.auth,
    autoConnect: true,
    reconnection: config.autoReconnect ?? true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: config.timeout ?? 10000,
    transports: ['websocket', 'polling'] // WebSocket preferred, polling fallback
  });

  // Connection event handlers
  socket.on('connect', () => {
    console.log('Connected to Claude Zen Flow:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Disconnected from Claude Zen Flow:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
  });

  // Wait for connection
  await new Promise((resolve, reject) => {
    socket.on('connect', resolve);
    socket.on('connect_error', reject);
  });

  return socket;
}

// Basic connection example
const socket = await connectToClaudeZenFlow({
  url: 'http://localhost:3456',
  auth: { token: process.env.CLAUDE_ZEN_TOKEN },
  autoReconnect: true
});
```

### **Python Client**
```python
import socketio
import asyncio
from typing import Dict, Any, Callable

class ClaudeZenFlowClient:
    """
    Python client for Claude Zen Flow WebSocket API
    Provides async/await interface for real-time communication
    """
    
    def __init__(self, url: str = 'http://localhost:3456', auth_token: str = None):
        self.sio = socketio.AsyncClient()
        self.url = url
        self.auth_token = auth_token
        self.event_handlers: Dict[str, Callable] = {}
        
        # Setup default event handlers
        self.sio.on('connect', self._on_connect)
        self.sio.on('disconnect', self._on_disconnect)
        self.sio.on('connect_error', self._on_connect_error)
    
    async def connect(self) -> None:
        """Connect to Claude Zen Flow WebSocket API"""
        auth_data = {'token': self.auth_token} if self.auth_token else None
        await self.sio.connect(self.url, auth=auth_data)
    
    async def disconnect(self) -> None:
        """Disconnect from WebSocket API"""
        await self.sio.disconnect()
    
    def on(self, event: str, handler: Callable) -> None:
        """Register event handler"""
        self.event_handlers[event] = handler
        self.sio.on(event, handler)
    
    async def emit(self, event: str, data: Any = None) -> Any:
        """Emit event with optional data and wait for response"""
        return await self.sio.emit(event, data)
    
    async def _on_connect(self):
        print(f"Connected to Claude Zen Flow: {self.sio.sid}")
    
    async def _on_disconnect(self):
        print("Disconnected from Claude Zen Flow")
    
    async def _on_connect_error(self, data):
        print(f"Connection error: {data}")

# Usage example
async def main():
    client = ClaudeZenFlowClient(
        url='http://localhost:3456',
        auth_token='your-api-token'
    )
    
    # Register event handlers
    client.on('system:status', lambda data: print(f"System status: {data}"))
    client.on('swarm:created', lambda data: print(f"New swarm: {data['id']}"))
    
    await client.connect()
    
    # Subscribe to real-time updates
    await client.emit('subscribe', {'channels': ['system', 'swarms', 'tasks']})
    
    # Keep connection alive
    await asyncio.sleep(3600)  # Run for 1 hour
    
    await client.disconnect()

# Run the client
asyncio.run(main())
```

### **cURL Examples (Testing)**
```bash
# Test WebSocket connection (requires websocat or similar tool)
websocat ws://localhost:3456/socket.io/?EIO=4&transport=websocket

# Test HTTP endpoints that trigger WebSocket events
curl -X POST http://localhost:3456/api/swarms \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Swarm", "topology": "mesh", "agents": 3}'
```

## 📡 **Event Categories**

### **1. System Events**
Real-time system monitoring and health updates:

```typescript
// Subscribe to system events
socket.emit('subscribe', 'system');

// System status updates (every 5 seconds)
socket.on('system:status', (data: SystemStatus) => {
  console.log('System health:', data.health.overall);
  console.log('CPU usage:', data.performance.cpu);
  console.log('Memory usage:', data.performance.memory);
  console.log('Active swarms:', data.swarms.active);
});

// Performance metrics updates (every 10 seconds)
socket.on('system:metrics', (data: PerformanceMetrics) => {
  updateDashboard({
    cpu: data.cpu,
    memory: data.memory,
    network: data.network,
    swarmEfficiency: data.swarmCoordination.efficiency
  });
});

// System alerts and notifications
socket.on('system:alert', (alert: SystemAlert) => {
  if (alert.severity === 'critical') {
    showCriticalAlert(alert.message);
  } else {
    showNotification(alert.message, alert.severity);
  }
});

// Predictive system warnings
socket.on('system:prediction', (prediction: SystemPrediction) => {
  if (prediction.confidence > 0.8) {
    console.warn(`Predicted issue: ${prediction.issue} in ${prediction.timeToIssue}ms`);
  }
});
```

### **2. Swarm Coordination Events**
Live swarm activity and coordination updates:

```typescript
// Subscribe to swarm events
socket.emit('subscribe', 'swarms');

// New swarm creation
socket.on('swarm:created', (swarm: SwarmData) => {
  console.log(`New swarm created: ${swarm.name} (${swarm.topology})`);
  addSwarmToUI(swarm);
});

// Agent status changes
socket.on('swarm:agent:status', (data: AgentStatusChange) => {
  console.log(`Agent ${data.agentId} status: ${data.oldStatus} → ${data.newStatus}`);
  updateAgentStatus(data.agentId, data.newStatus);
});

// Task assignment and completion
socket.on('swarm:task:assigned', (assignment: TaskAssignment) => {
  console.log(`Task ${assignment.taskId} assigned to ${assignment.agentId}`);
  showTaskProgress(assignment);
});

socket.on('swarm:task:completed', (completion: TaskCompletion) => {
  console.log(`Task ${completion.taskId} completed in ${completion.duration}ms`);
  updateTaskStatus(completion.taskId, 'completed');
});

// Coordination efficiency updates
socket.on('swarm:efficiency', (efficiency: EfficiencyMetrics) => {
  updateEfficiencyChart({
    coordinationLatency: efficiency.avgLatency,
    taskThroughput: efficiency.tasksPerMinute,
    agentUtilization: efficiency.avgUtilization
  });
});

// Topology changes and optimizations
socket.on('swarm:topology:changed', (change: TopologyChange) => {
  console.log(`Swarm ${change.swarmId} topology: ${change.from} → ${change.to}`);
  console.log(`Reason: ${change.reason}`);
  redrawSwarmTopology(change.swarmId, change.to);
});
```

### **3. Neural Network Events**
AI training progress and inference updates:

```typescript
// Subscribe to neural network events
socket.emit('subscribe', 'neural');

// Training progress updates
socket.on('neural:training:progress', (progress: TrainingProgress) => {
  updateProgressBar(progress.networkId, {
    epoch: progress.epoch,
    totalEpochs: progress.totalEpochs,
    loss: progress.currentLoss,
    accuracy: progress.currentAccuracy,
    timeRemaining: progress.estimatedTimeRemaining
  });
});

// Training completion
socket.on('neural:training:completed', (result: TrainingResult) => {
  console.log(`Neural network ${result.networkId} training completed:`);
  console.log(`Final accuracy: ${result.finalAccuracy}%`);
  console.log(`Training time: ${result.trainingTime}ms`);
  
  showTrainingResults(result);
});

// Real-time inference metrics
socket.on('neural:inference:metrics', (metrics: InferenceMetrics) => {
  updateNeuralDashboard({
    averageInferenceTime: metrics.avgInferenceTime,
    throughput: metrics.inferencesPerSecond,
    wasmAcceleration: metrics.wasmEnabled,
    activeNetworks: metrics.activeNetworks
  });
});

// Model accuracy drift detection
socket.on('neural:accuracy:drift', (drift: AccuracyDrift) => {
  console.warn(`Model ${drift.modelId} accuracy drift detected:`);
  console.warn(`Current: ${drift.currentAccuracy}%, Baseline: ${drift.baselineAccuracy}%`);
  
  if (drift.severity === 'critical') {
    triggerModelRetraining(drift.modelId);
  }
});
```

### **4. API and Performance Events**
API usage and performance monitoring:

```typescript
// Subscribe to API events
socket.emit('subscribe', 'api');

// API request metrics (real-time)
socket.on('api:metrics', (metrics: ApiMetrics) => {
  updateApiDashboard({
    requestsPerSecond: metrics.rps,
    averageResponseTime: metrics.avgResponseTime,
    errorRate: metrics.errorRate,
    concurrentConnections: metrics.concurrentConnections
  });
});

// Slow request alerts
socket.on('api:slow:request', (request: SlowRequest) => {
  console.warn(`Slow API request detected:`);
  console.warn(`Endpoint: ${request.endpoint}`);
  console.warn(`Duration: ${request.duration}ms`);
  console.warn(`Threshold: ${request.threshold}ms`);
});

// Rate limiting notifications
socket.on('api:rate:limit', (limit: RateLimitNotification) => {
  console.warn(`Rate limit approaching for ${limit.clientId}`);
  console.warn(`Current: ${limit.currentRequests}/${limit.limit} per ${limit.window}`);
});

// Performance optimization events
socket.on('api:optimization:applied', (optimization: ApiOptimization) => {
  console.log(`API optimization applied: ${optimization.type}`);
  console.log(`Expected improvement: ${optimization.expectedImprovement}`);
});
```

### **5. Task and Workflow Events**
Task execution and workflow progress:

```typescript
// Subscribe to task events
socket.emit('subscribe', 'tasks');

// Task lifecycle events
socket.on('task:created', (task: TaskData) => {
  console.log(`New task created: ${task.title}`);
  addTaskToQueue(task);
});

socket.on('task:started', (task: TaskExecution) => {
  console.log(`Task ${task.id} started by ${task.assignee}`);
  updateTaskStatus(task.id, 'in-progress');
});

socket.on('task:progress', (progress: TaskProgress) => {
  updateTaskProgress(progress.taskId, {
    percentage: progress.percentage,
    stage: progress.currentStage,
    message: progress.statusMessage
  });
});

socket.on('task:completed', (completion: TaskCompletion) => {
  console.log(`Task ${completion.id} completed successfully`);
  console.log(`Duration: ${completion.duration}ms`);
  console.log(`Result: ${completion.result}`);
  
  markTaskCompleted(completion.id, completion.result);
});

// Workflow orchestration events
socket.on('workflow:started', (workflow: WorkflowExecution) => {
  console.log(`Workflow ${workflow.id} started with ${workflow.steps.length} steps`);
  initializeWorkflowProgress(workflow);
});

socket.on('workflow:step:completed', (step: WorkflowStepCompletion) => {
  console.log(`Workflow step ${step.stepId} completed`);
  updateWorkflowProgress(step.workflowId, step.stepId);
});
```

## 🔄 **Bidirectional Communication**

### **Client-to-Server Events**
Commands and controls from client applications:

```typescript
// Swarm management commands
await socket.emit('swarm:create', {
  name: 'Development Team',
  topology: 'hierarchical',
  agents: [
    { role: 'lead', count: 1 },
    { role: 'developer', count: 4 },
    { role: 'tester', count: 2 }
  ]
});

// Task creation and management
await socket.emit('task:create', {
  title: 'Implement authentication system',
  description: 'Add JWT-based authentication with refresh tokens',
  priority: 'high',
  assignee: 'auto', // Auto-assign to best available agent
  requirements: ['security-expertise', 'backend-development'],
  estimatedDuration: 7200000 // 2 hours
});

// Neural network training control
await socket.emit('neural:training:start', {
  networkId: 'code-analyzer-v2',
  dataset: 'enterprise-codebases',
  config: {
    epochs: 100,
    learningRate: 0.001,
    batchSize: 32,
    validation: 0.2
  }
});

// System optimization requests
await socket.emit('system:optimize', {
  targets: ['memory', 'cpu', 'network'],
  strategy: 'conservative', // 'conservative' | 'aggressive' | 'balanced'
  safetyLimits: {
    maxCpuIncrease: 0.1,
    maxMemoryIncrease: 0.05
  }
});

// Real-time configuration updates
await socket.emit('config:update', {
  component: 'load-balancer',
  settings: {
    algorithm: 'ml-predictive',
    healthCheckInterval: 5000,
    autoScaling: true
  }
});
```

### **Interactive Commands with Responses**
Request-response patterns for immediate feedback:

```typescript
// Get current system status
const systemStatus = await socket.emit('system:status:get');
console.log('Current system health:', systemStatus.health.overall);

// Request swarm analysis
const swarmAnalysis = await socket.emit('swarm:analyze', {
  swarmId: 'dev-team-swarm',
  includeMetrics: true,
  timeWindow: 3600000 // Last hour
});

console.log('Swarm efficiency:', swarmAnalysis.efficiency);
console.log('Bottlenecks:', swarmAnalysis.bottlenecks);

// Execute immediate task
const taskResult = await socket.emit('task:execute:immediate', {
  type: 'code-analysis',
  input: sourceCodeToAnalyze,
  priority: 'urgent'
});

console.log('Analysis result:', taskResult.analysis);
console.log('Confidence:', taskResult.confidence);

// Request performance recommendations
const recommendations = await socket.emit('system:recommendations:get', {
  focus: ['performance', 'resource-usage'],
  severity: 'medium-and-above'
});

console.log('Performance recommendations:', recommendations);
```

## 📊 **Event Filtering and Subscriptions**

### **Selective Subscriptions**
Fine-grained control over which events to receive:

```typescript
// Subscribe to specific event categories
socket.emit('subscribe', {
  categories: ['system', 'swarms'],
  filters: {
    system: {
      severity: ['warning', 'critical'], // Only important system events
      components: ['cpu', 'memory'] // Only CPU and memory events
    },
    swarms: {
      swarmIds: ['prod-swarm', 'dev-swarm'], // Only specific swarms
      events: ['task:completed', 'agent:failed'] // Only specific events
    }
  }
});

// Subscribe with custom filters
socket.emit('subscribe:filtered', {
  category: 'neural',
  filter: {
    networkTypes: ['code-analysis', 'performance-prediction'],
    trainingOnly: true, // Only training-related events
    minConfidence: 0.8 // Only high-confidence predictions
  }
});

// Dynamic subscription management
socket.emit('subscription:update', {
  action: 'add',
  category: 'api',
  filter: { endpoints: ['/api/swarms', '/api/tasks'] }
});

socket.emit('subscription:update', {
  action: 'remove',
  category: 'system',
  filter: { severity: 'info' } // Remove info-level system events
});
```

### **Event Batching and Rate Limiting**
Control event frequency and batching:

```typescript
// Configure event batching to reduce overhead
socket.emit('configure:batching', {
  enabled: true,
  batchSize: 10, // Batch up to 10 events
  batchTimeout: 1000, // Send batch every 1 second
  categories: ['system:metrics', 'api:metrics'] // Only batch metric events
});

// Configure rate limiting for high-frequency events
socket.emit('configure:rate-limit', {
  'system:metrics': { maxPerSecond: 2 }, // Max 2 system metric updates per second
  'swarm:agent:status': { maxPerSecond: 5 }, // Max 5 agent status updates per second
  'api:metrics': { maxPerSecond: 1 } // Max 1 API metric update per second
});
```

## 🔐 **Authentication and Security**

### **Token-based Authentication**
```typescript
// Connect with authentication token
const socket = io('http://localhost:3456', {
  auth: {
    token: 'your-jwt-token',
    userId: 'user123',
    permissions: ['read:system', 'write:swarms', 'admin:neural']
  }
});

// Handle authentication errors
socket.on('auth:error', (error) => {
  console.error('Authentication failed:', error.message);
  redirectToLogin();
});

// Handle token refresh
socket.on('auth:token:refresh', async (data) => {
  const newToken = await refreshAuthToken(data.refreshToken);
  socket.auth.token = newToken;
});
```

### **Permission-based Event Access**
```typescript
// Events are filtered based on user permissions
// Users with 'read:system' permission receive system events
// Users with 'admin:neural' permission receive neural training events
// Users with 'write:swarms' permission can send swarm management commands

// Request permission upgrade (if supported)
socket.emit('auth:permissions:request', {
  permissions: ['admin:system'],
  reason: 'Emergency system maintenance'
});
```

## 📈 **Performance Optimization**

### **Connection Optimization**
```typescript
// Optimize connection for different use cases
const socket = io('http://localhost:3456', {
  // High-frequency monitoring dashboard
  transports: ['websocket'], // WebSocket only for best performance
  upgrade: false, // Don't upgrade from WebSocket
  rememberUpgrade: true,
  
  // Compression for large data
  compression: true,
  
  // Heartbeat configuration
  pingTimeout: 60000,
  pingInterval: 25000,
  
  // Buffer size optimization
  maxHttpBufferSize: 1e8, // 100MB for large data transfers
  
  // Reconnection strategy
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  maxReconnectionAttempts: 5,
  timeout: 20000
});
```

### **Event Performance Monitoring**
```typescript
// Monitor WebSocket performance
socket.on('performance:metrics', (metrics) => {
  console.log('WebSocket performance:');
  console.log(`Latency: ${metrics.latency}ms`);
  console.log(`Events/sec: ${metrics.eventsPerSecond}`);
  console.log(`Bandwidth: ${metrics.bandwidth} MB/s`);
  console.log(`Connection quality: ${metrics.quality}`);
});

// Enable performance tracking
socket.emit('enable:performance:tracking', {
  trackLatency: true,
  trackBandwidth: true,
  reportInterval: 30000 // Report every 30 seconds
});
```

## 🎯 **Best Practices**

### **1. Connection Management**
- **Use connection pooling for multiple clients**
- **Implement exponential backoff for reconnection**
- **Handle connection state changes gracefully**
- **Use heartbeat monitoring for connection health**

### **2. Event Handling**
- **Subscribe only to needed events to reduce overhead**
- **Use event batching for high-frequency data**
- **Implement proper error handling for all events**
- **Avoid blocking operations in event handlers**

### **3. Performance**
- **Use WebSocket transport when possible**
- **Enable compression for large data transfers**
- **Implement client-side event filtering**
- **Monitor and optimize event frequency**

### **4. Security**
- **Always use authentication tokens**
- **Validate all incoming event data**
- **Implement proper permission checks**
- **Use secure WebSocket connections (WSS) in production**

## 🔍 **Troubleshooting**

### **Connection Issues**
```typescript
// Debug connection problems
socket.on('connect_error', (error) => {
  console.error('Connection failed:', error);
  
  if (error.message.includes('timeout')) {
    // Increase timeout and retry
    socket.timeout = 30000;
  } else if (error.message.includes('auth')) {
    // Refresh authentication token
    refreshAuthToken();
  }
});

// Monitor connection quality
socket.on('ping', () => {
  const startTime = Date.now();
  socket.emit('pong', startTime);
});

socket.on('pong', (startTime) => {
  const latency = Date.now() - startTime;
  console.log(`Connection latency: ${latency}ms`);
});
```

### **Event Debugging**
```bash
# Enable WebSocket debugging
DEBUG=socket.io:client node your-app.js

# Monitor WebSocket traffic with browser dev tools
# Or use specialized tools like WebSocket King
```

This comprehensive WebSocket API enables real-time monitoring and control of your Claude Zen Flow deployment with sub-10ms latency and enterprise-grade reliability.

## 📚 **Next Steps**

- **[REST API](rest-api.md)** - RESTful HTTP API for programmatic access
- **[MCP Integration](../api/README.md)** - Model Context Protocol documentation
- **[Performance Monitoring](../performance/monitoring-setup.md)** - Monitor WebSocket performance
- **[Integration Examples](../integration/external-systems.md)** - Integrate with external systems