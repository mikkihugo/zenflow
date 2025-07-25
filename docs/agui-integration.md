# 🌟 AG-UI Protocol Integration for Claude Code Zen

This document describes the AG-UI (Agent-User Interaction) protocol integration with Claude Code Zen, providing standardized agent-to-UI communication for the multi-Queen hive architecture.

## 🚀 Overview

AG-UI is a lightweight, event-based protocol that standardizes how AI agents connect to user-facing applications. This integration enables real-time communication between Claude Code Zen's distributed agent system and user interfaces.

## 🎯 Benefits

- **Standardized Communication**: AG-UI provides ~16 standard event types for consistent agent-UI interaction
- **Real-time Updates**: WebSocket-based streaming for live agent coordination updates
- **Multi-Agent Support**: Perfect for Claude Code Zen's multi-Queen and swarm architectures
- **Tool Integration**: Standardized tool call events for MCP tool execution
- **State Synchronization**: Real-time hive mind state updates via AG-UI events

## 📦 Components

### Core Modules

1. **AGUIAdapter** (`src/ai/agui-adapter.js`)
   - Core AG-UI protocol implementation
   - Event emission for text messages, tool calls, custom events
   - Queen/swarm/hive mind event helpers

2. **AGUIWebSocketMiddleware** (`src/api/agui-websocket-middleware.js`)
   - WebSocket integration with AG-UI protocol
   - Client connection management
   - Event broadcasting to connected clients

3. **AGUIMCPToolExecutor** (`src/mcp/core/agui-tool-executor.js`)
   - Enhanced MCP tool executor with AG-UI events
   - Real-time tool execution updates
   - Integration with existing tool execution flow

## 🔧 Usage

### Basic Text Message Flow

```javascript
import { AGUIAdapter } from './src/ai/agui-adapter.js';

const adapter = new AGUIAdapter({
  sessionId: 'my-session',
  threadId: 'my-thread'
});

// Start a message
const messageId = adapter.startTextMessage(null, 'assistant');

// Stream content
adapter.addTextContent('Hello from Claude Code Zen!');

// End message  
adapter.endTextMessage(messageId);
```

### Tool Call Events

```javascript
// Start tool execution
const toolCallId = adapter.startToolCall('analyze_codebase');

// Add arguments
adapter.addToolCallArgs(JSON.stringify({
  directory: '/src',
  analysis_type: 'architecture'
}));

// Complete tool call
adapter.endToolCall(toolCallId);

// Emit results
adapter.emitToolCallResult({
  files_analyzed: 234,
  architecture: 'multi-queen-hive'
}, toolCallId);
```

### Multi-Queen Coordination

```javascript
// Queen events
adapter.emitQueenEvent('queen-1', 'start_analysis', {
  target: 'codebase_structure',
  priority: 'high'
});

adapter.emitQueenEvent('queen-2', 'join_analysis', {
  specialization: 'performance_optimization'
});

// Hive mind consensus
adapter.emitHiveMindEvent('consensus_reached', {
  queens_participating: ['queen-1', 'queen-2', 'queen-3'],
  decision: 'implement_optimization',
  confidence: 0.95
});
```

### Swarm Coordination

```javascript
// Swarm events
adapter.emitSwarmEvent('swarm-alpha', 'initialize', 
  ['agent-1', 'agent-2', 'agent-3'], {
    task: 'code_analysis',
    strategy: 'hierarchical'
  }
);

adapter.emitSwarmEvent('swarm-alpha', 'task_complete', 
  ['agent-1', 'agent-2', 'agent-3'], {
    results: { analysis_complete: true },
    performance: { execution_time: '2.3s' }
  }
);
```

## 🌐 Server Integration

### Starting Server with AG-UI

```javascript
import { ClaudeZenServer } from './src/api/claude-zen-server.js';

const server = new ClaudeZenServer({ port: 4000 });
await server.start();

// AG-UI WebSocket endpoint: ws://localhost:4000/ws
// AG-UI status endpoint: http://localhost:4000/agui/status
```

### WebSocket Client Connection

```javascript
const ws = new WebSocket('ws://localhost:4000/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'agui:event') {
    console.log('AG-UI Event:', data.event);
    
    // Handle different event types
    switch (data.event.type) {
      case 'TEXT_MESSAGE_CONTENT':
        // Display streaming text
        break;
      case 'TOOL_CALL_START':
        // Show tool execution starting
        break;
      case 'CUSTOM':
        if (data.event.name === 'queen_action') {
          // Handle Queen coordination
        }
        break;
    }
  }
};
```

## 🧪 Testing

### Run Basic Tests

```bash
# Run AG-UI integration tests
node tests/agui/agui-basic-test.js

# Run demo
node src/examples/agui-demo-runner.js --standalone

# Run with server
node src/examples/agui-demo-runner.js
```

### Test Server Integration

```bash
# Start server
npm start

# Check AG-UI status
curl http://localhost:4000/agui/status

# Emit test events
curl -X POST http://localhost:4000/agui/emit \
  -H "Content-Type: application/json" \
  -d '{"type": "text_message", "data": {"content": "Test message"}}'
```

## 📊 Monitoring

### AG-UI Status Endpoint

```bash
GET /agui/status
```

Returns:
```json
{
  "enabled": true,
  "stats": {
    "clientsConnected": 2,
    "eventsRouted": 145,
    "broadcastsSent": 23,
    "activeClients": 2
  },
  "adapters": {
    "global": {
      "messagesCreated": 12,
      "toolCallsExecuted": 8,
      "eventsEmitted": 145,
      "sessionId": "server-global"
    }
  }
}
```

## 🔌 Event Types

### Standard AG-UI Events

- `TEXT_MESSAGE_START` - Assistant starts responding
- `TEXT_MESSAGE_CONTENT` - Streaming text content  
- `TEXT_MESSAGE_END` - Message completion
- `TOOL_CALL_START` - Tool execution begins
- `TOOL_CALL_ARGS` - Tool arguments (streaming)
- `TOOL_CALL_END` - Tool execution ends
- `TOOL_CALL_RESULT` - Tool execution results
- `STATE_SNAPSHOT` - Current system state
- `RUN_STARTED` - Agent run begins
- `RUN_FINISHED` - Agent run completes

### Claude Code Zen Custom Events

- `queen_action` - Queen coordination events
- `swarm_action` - Swarm orchestration events  
- `hive_mind` - Hive mind consensus events
- `tool_execution_started` - Enhanced tool events
- `tool_execution_progress` - Tool progress updates
- `client_connected` - WebSocket client events

## 🛠️ Configuration

### AGUIAdapter Options

```javascript
const adapter = new AGUIAdapter({
  sessionId: 'unique-session-id',    // Session identifier
  threadId: 'thread-id',             // Thread/conversation ID
  runId: 'run-id'                    // Execution run ID
});
```

### WebSocket Middleware Options

```javascript
const middleware = new AGUIWebSocketMiddleware(webSocketServer, {
  enableBroadcast: true,    // Broadcast events to all clients
  enableFiltering: true,    // Filter events by client preferences
  enableCompression: false  // Compress WebSocket messages
});
```

### Tool Executor Options

```javascript
const executor = new AGUIMCPToolExecutor(server, {
  emitToolEvents: true,     // Emit standard tool call events
  emitProgressEvents: true, // Emit progress/status events
  includeArgs: true,        // Include tool arguments in events
  includeResults: true      // Include tool results in events
});
```

## 🔄 Integration Flow

1. **Server Startup**: Claude Code Zen server initializes with AG-UI WebSocket middleware
2. **Client Connection**: UI clients connect to WebSocket endpoint
3. **Event Emission**: Agents/Queens/Swarms emit AG-UI events during execution
4. **Event Broadcasting**: WebSocket middleware broadcasts events to connected clients
5. **UI Updates**: Client UIs receive real-time updates via standardized AG-UI events

## 🎉 Quick Start Example

```javascript
// 1. Import modules
import { AGUIAdapter } from './src/ai/agui-adapter.js';
import { runAGUIDemo } from './src/examples/agui-demo.js';

// 2. Create adapter
const adapter = new AGUIAdapter({ sessionId: 'demo' });

// 3. Emit events
adapter.emitQueenEvent('queen-1', 'analysis_start', { target: 'codebase' });

// 4. Run full demo
await runAGUIDemo();
```

## 📚 Next Steps

1. **Install Dependencies**: `npm install @ag-ui/core rxjs zod`
2. **Start Server**: `npm start` 
3. **Connect Client**: WebSocket to `ws://localhost:4000/ws`
4. **Monitor Events**: Visit `http://localhost:4000/agui/status`
5. **Build UI**: Use AG-UI events to build real-time interfaces

## 🤝 Contributing

This AG-UI integration enhances Claude Code Zen's multi-agent architecture with standardized communication protocols. Future enhancements could include:

- Client-side AG-UI React components
- Advanced event filtering and subscriptions
- AG-UI integration with neural network outputs
- Real-time visualization of Queen/swarm coordination

---

**Built with 🧠 for the Claude Code Zen multi-Queen hive intelligence platform**