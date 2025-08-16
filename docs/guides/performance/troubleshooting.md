# Troubleshooting Guide - Common Issues and Solutions

**Comprehensive troubleshooting guide for Claude Zen Flow deployment, development, and optimization issues.**

## 🎯 **Overview**

This guide covers the most common issues encountered when working with Claude Zen Flow, from installation and configuration problems to performance bottlenecks and integration challenges. Each section provides symptoms, root cause analysis, and step-by-step solutions.

## 🚀 **Installation and Setup Issues**

### **Issue: Build Failures**

#### **Symptoms**
```bash
error TS2688: Cannot find type definition file for 'jest'
error TS2688: Cannot find type definition file for 'node'
npm ERR! Error: ENOENT: no such file or directory
```

#### **Root Cause Analysis**
- Missing type definitions in node_modules
- Corrupted package-lock.json
- Node.js version incompatibility
- Missing global dependencies

#### **Solutions**

**Step 1: Clean Installation**
```bash
# Remove existing dependencies
rm -rf node_modules package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
npm install

# If using yarn
yarn cache clean
yarn install
```

**Step 2: Verify Node.js Version**
```bash
# Check Node.js version (requires 18+)
node --version

# Update Node.js if needed
nvm install 18
nvm use 18

# Or using n
n 18
```

**Step 3: Install Missing Global Dependencies**
```bash
# Install required global packages
npm install -g typescript tsx @types/node

# Verify TypeScript installation
tsc --version
```

**Step 4: Fix Type Definitions**
```bash
# Install missing type definitions
npm install --save-dev @types/jest @types/node @types/react

# Update tsconfig.json types array
{
  "compilerOptions": {
    "types": ["node", "jest", "react"]
  }
}
```

---

### **Issue: WASM Module Loading Failures**

#### **Symptoms**
```bash
Error: WebAssembly module compilation failed
Failed to load WASM module: neural-core.wasm
RuntimeError: unreachable executed
```

#### **Root Cause Analysis**
- WASM module not built or corrupted
- Browser/Node.js doesn't support required WASM features
- Memory allocation limits exceeded
- Missing WASM runtime dependencies

#### **Solutions**

**Step 1: Rebuild WASM Modules**
```bash
# Rebuild WASM modules
npm run build:wasm

# Or build with specific configuration
cd src/neural/wasm
./scripts/build-wasm.sh --release --optimize-size
```

**Step 2: Verify WASM Support**
```javascript
// Check WASM support in Node.js
if (typeof WebAssembly === 'undefined') {
  console.error('WebAssembly not supported');
} else {
  console.log('WebAssembly supported');
}

// Check specific features
const features = {
  simd: WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0])),
  threads: typeof SharedArrayBuffer !== 'undefined'
};
console.log('WASM features:', features);
```

**Step 3: Increase Memory Limits**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=8192"

# Or set in package.json scripts
{
  "scripts": {
    "start": "NODE_OPTIONS='--max-old-space-size=8192' tsx src/index.ts"
  }
}
```

**Step 4: Fallback Configuration**
```typescript
// Configure WASM fallback
const neuralConfig = {
  wasmAcceleration: {
    enabled: true,
    fallbackToJS: true, // Fall back to JavaScript if WASM fails
    memoryLimit: '2GB',
    timeout: 30000
  }
};
```

---

## 🔌 **API and Interface Issues**

### **Issue: MCP Server Connection Failures**

#### **Symptoms**
```bash
Error: MCP server failed to start on port 3000
Connection refused to localhost:3000
Tool execution timeout
```

#### **Root Cause Analysis**
- Port already in use
- Firewall blocking connections
- MCP server process crashed
- Authentication/authorization issues

#### **Solutions**

**Step 1: Check Port Availability**
```bash
# Check if port 3000 is in use
netstat -tulpn | grep :3000
lsof -i :3000

# Kill process using port if necessary
kill -9 $(lsof -t -i:3000)
```

**Step 2: Start MCP Server with Debugging**
```bash
# Start with debug logging
DEBUG=mcp:* claude-zen mcp start --port 3000 --debug

# Check server status
curl http://localhost:3000/health
curl http://localhost:3000/capabilities
```

**Step 3: Configure Alternative Port**
```bash
# Use alternative port
claude-zen mcp start --port 3001

# Update Claude Desktop configuration
{
  "mcpServers": {
    "claude-zen": {
      "command": "npx",
      "args": ["claude-zen", "mcp", "start", "--port", "3001"]
    }
  }
}
```

**Step 4: Verify Tool Registration**
```bash
# List available tools
curl http://localhost:3000/tools

# Test specific tool
curl -X POST http://localhost:3000/tools/system_info \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

### **Issue: WebSocket Connection Problems**

#### **Symptoms**
```bash
WebSocket connection failed
socket.io client disconnect due to ping timeout
Connection keeps dropping every few minutes
```

#### **Root Cause Analysis**
- Network proxy interfering with WebSocket
- Incorrect WebSocket configuration
- Server overload causing timeouts
- Client-side connection management issues

#### **Solutions**

**Step 1: Verify WebSocket Endpoint**
```bash
# Test WebSocket connection
websocat ws://localhost:3456/socket.io/?EIO=4&transport=websocket

# Check if HTTP upgrade to WebSocket works
curl -i -N -H "Connection: Upgrade" \
     -H "Upgrade: websocket" \
     -H "Sec-WebSocket-Version: 13" \
     -H "Sec-WebSocket-Key: test" \
     http://localhost:3456/socket.io/
```

**Step 2: Configure Connection Parameters**
```typescript
// Robust WebSocket configuration
const socket = io('http://localhost:3456', {
  transports: ['websocket', 'polling'], // Fallback to polling
  upgrade: true,
  rememberUpgrade: true,
  
  // Timeout configuration
  timeout: 20000,
  pingTimeout: 60000,
  pingInterval: 25000,
  
  // Reconnection strategy
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  
  // Error handling
  autoConnect: true,
  forceNew: false
});

// Enhanced error handling
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
  if (error.message.includes('timeout')) {
    // Increase timeout
    socket.timeout = socket.timeout * 1.5;
  }
});
```

**Step 3: Proxy Configuration**
```bash
# Configure proxy for WebSocket (if needed)
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080
export NO_PROXY=localhost,127.0.0.1

# Or configure in application
const socket = io('http://localhost:3456', {
  proxy: {
    hostname: 'proxy.company.com',
    port: 8080
  }
});
```

---

## 🐝 **Swarm Coordination Issues**

### **Issue: High Coordination Latency**

#### **Symptoms**
```bash
Swarm coordination latency: 500-1000ms
Task assignment timeout
Agent communication failures
```

#### **Root Cause Analysis**
- Inefficient topology for workload
- Network bottlenecks
- Agent overload
- Communication protocol overhead

#### **Solutions**

**Step 1: Analyze Current Topology**
```bash
# Check swarm topology and performance
claude-zen swarm analyze --detailed --metrics

# View coordination metrics
claude-zen swarm metrics --focus coordination --timeframe 1h
```

**Step 2: Optimize Topology**
```bash
# Switch to hierarchical for large swarms
claude-zen swarm migrate --topology hierarchical --preserve-state

# Or optimize current topology
claude-zen swarm optimize --strategy latency-reduction
```

**Step 3: Reduce Communication Overhead**
```typescript
// Configure efficient communication
const swarmConfig = {
  topology: 'hierarchical',
  communication: {
    protocol: 'binary', // Use binary protocol instead of JSON
    compression: true,
    batching: {
      enabled: true,
      maxBatchSize: 10,
      batchTimeout: 100
    },
    connectionPooling: {
      enabled: true,
      maxConnections: 50,
      keepAlive: true
    }
  }
};
```

**Step 4: Load Balancing**
```bash
# Enable intelligent load balancing
claude-zen swarm config --load-balancing ml-predictive

# Monitor agent utilization
claude-zen swarm agents --utilization --real-time
```

---

### **Issue: Agent Failures and Recovery**

#### **Symptoms**
```bash
Agent health check failed
Agent process crashed unexpectedly
Task execution timeout
Orphaned tasks in queue
```

#### **Root Cause Analysis**
- Resource exhaustion (memory/CPU)
- Unhandled exceptions in agent code
- Network connectivity issues
- Missing error recovery mechanisms

#### **Solutions**

**Step 1: Enable Health Monitoring**
```bash
# Enable comprehensive health monitoring
claude-zen swarm config --health-monitoring enabled \
  --health-interval 30000 \
  --failure-threshold 3
```

**Step 2: Configure Automatic Recovery**
```typescript
// Agent recovery configuration
const recoveryConfig = {
  faultTolerance: 'high',
  recovery: {
    automaticRestart: true,
    maxRestartAttempts: 3,
    restartDelay: 5000,
    backupAgentCreation: true,
    taskRedistribution: true
  },
  healthCheck: {
    interval: 30000,
    timeout: 10000,
    retries: 3,
    endpoints: ['status', 'memory', 'tasks']
  }
};
```

**Step 3: Resource Monitoring**
```bash
# Monitor agent resource usage
claude-zen agents monitor --resource-usage --alerts

# Set resource limits
claude-zen agents config --memory-limit 2GB --cpu-limit 80%
```

**Step 4: Error Handling**
```typescript
// Robust agent error handling
agent.on('error', async (error) => {
  console.error(`Agent ${agent.id} error:`, error);
  
  // Attempt recovery
  try {
    await agent.restart();
  } catch (restartError) {
    // Create replacement agent
    await swarm.createReplacementAgent(agent.id, agent.config);
  }
});

// Task error handling
agent.on('task:error', async (taskError) => {
  // Reassign task to another agent
  await swarm.reassignTask(taskError.taskId, {
    excludeAgents: [agent.id],
    priority: 'high'
  });
});
```

---

## 🧠 **Neural Network Issues**

### **Issue: Training Convergence Problems**

#### **Symptoms**
```bash
Neural network training stuck at high loss
Training loss oscillating wildly
Model accuracy not improving after many epochs
```

#### **Root Cause Analysis**
- Learning rate too high or too low
- Insufficient or poor quality training data
- Network architecture not suitable for problem
- Gradient vanishing or exploding

#### **Solutions**

**Step 1: Adjust Learning Rate**
```typescript
// Learning rate scheduling
const trainingConfig = {
  learningRate: 0.001,
  learningRateSchedule: {
    type: 'exponential-decay',
    decayRate: 0.96,
    decaySteps: 1000
  },
  // Or use adaptive learning rate
  optimizer: 'adam', // Adam automatically adjusts learning rate
  
  // Gradient clipping to prevent exploding gradients
  gradientClipping: {
    enabled: true,
    maxNorm: 1.0
  }
};
```

**Step 2: Improve Training Data**
```bash
# Analyze training data quality
claude-zen neural analyze-data --dataset training-data.json

# Data preprocessing
claude-zen neural preprocess --normalize --augment --split 0.8/0.1/0.1
```

**Step 3: Architecture Optimization**
```typescript
// Try different network architectures
const architectures = [
  { layers: [512, 256, 128, 64, 10], activation: 'relu' },
  { layers: [1024, 512, 256, 10], activation: 'leaky_relu' },
  { layers: [768, 384, 192, 96, 10], activation: 'swish' }
];

// Automated architecture search
const bestArchitecture = await neuralCore.searchArchitecture({
  searchSpace: architectures,
  metric: 'validation_accuracy',
  maxTrials: 10
});
```

**Step 4: Advanced Training Techniques**
```typescript
// Implement advanced training techniques
const advancedConfig = {
  regularization: {
    l2: 0.001,
    dropout: 0.3,
    batchNormalization: true
  },
  earlyStoppingPatience: 10,
  modelCheckpointing: {
    enabled: true,
    saveEvery: 10,
    saveBest: true
  },
  validation: {
    enabled: true,
    split: 0.2,
    monitorMetric: 'val_accuracy'
  }
};
```

---

### **Issue: WASM Performance Problems**

#### **Symptoms**
```bash
WASM acceleration slower than JavaScript
High memory usage with WASM
WASM module crashes during inference
```

#### **Root Cause Analysis**
- WASM module not optimized for current workload
- Memory allocation issues
- SIMD instructions not utilized
- Overhead from JS-WASM boundary crossing

#### **Solutions**

**Step 1: Benchmark WASM vs JavaScript**
```bash
# Run performance benchmark
claude-zen neural benchmark --wasm --js --iterations 1000

# Profile WASM performance
claude-zen neural profile --wasm --memory --cpu
```

**Step 2: Optimize WASM Build**
```bash
# Build with optimizations
cd src/neural/wasm
OPTIMIZE_SIZE=true BUILD_MODE=release ./scripts/build-wasm.sh

# Enable SIMD optimizations
ENABLE_SIMD=true ./scripts/build-wasm.sh
```

**Step 3: Memory Management**
```typescript
// Optimize WASM memory usage
const wasmConfig = {
  memoryPool: {
    initialSize: '256MB',
    maxSize: '1GB',
    preAllocate: true,
    reusableBlocks: true
  },
  batchProcessing: {
    enabled: true,
    batchSize: 32,
    minBatchSize: 8
  }
};
```

**Step 4: Threshold-based Switching**
```typescript
// Use WASM only when beneficial
const performanceThresholds = {
  matrixSize: 500, // Use WASM for matrices larger than 500x500
  batchSize: 16,   // Use WASM for batches larger than 16
  complexity: 0.7  // Use WASM for complex operations
};

const shouldUseWasm = (operation) => {
  return operation.matrixSize > performanceThresholds.matrixSize ||
         operation.batchSize > performanceThresholds.batchSize ||
         operation.complexity > performanceThresholds.complexity;
};
```

---

## 📊 **Performance and Monitoring Issues**

### **Issue: High Memory Usage**

#### **Symptoms**
```bash
Memory usage constantly increasing
Out of memory errors
Garbage collection pauses affecting performance
```

#### **Root Cause Analysis**
- Memory leaks in application code
- Inefficient object creation patterns
- Large neural network models in memory
- Inadequate garbage collection configuration

#### **Solutions**

**Step 1: Memory Profiling**
```bash
# Enable memory profiling
NODE_OPTIONS="--inspect --max-old-space-size=8192" claude-zen start

# Generate heap snapshot
kill -USR2 <process-id>

# Analyze with Chrome DevTools or heapdump
npm install -g heapdump
```

**Step 2: Enable Memory Optimization**
```bash
# Configure garbage collection
export NODE_OPTIONS="--max-old-space-size=4096 --gc-interval=100"

# Enable memory monitoring
claude-zen monitor memory --leak-detection --gc-stats
```

**Step 3: Optimize Neural Network Memory**
```typescript
// Enable memory pooling for neural networks
const memoryConfig = {
  neuralNetworks: {
    memoryPooling: true,
    maxCachedModels: 5,
    unloadUnusedModels: true,
    unloadTimeout: 300000 // 5 minutes
  },
  agents: {
    memoryLimit: '512MB',
    gcInterval: 60000,
    objectPooling: ['Float32Array', 'TaskData']
  }
};
```

**Step 4: Memory Leak Detection**
```typescript
// Automatic memory leak detection
setInterval(() => {
  const memUsage = process.memoryUsage();
  
  if (memUsage.heapUsed > 2 * 1024 * 1024 * 1024) { // 2GB
    console.warn('High memory usage detected:', memUsage);
    
    // Force garbage collection
    if (global.gc) {
      global.gc();
    }
    
    // Alert monitoring system
    alertManager.sendAlert({
      type: 'memory-warning',
      usage: memUsage,
      threshold: '2GB'
    });
  }
}, 30000); // Check every 30 seconds
```

---

### **Issue: API Response Time Issues**

#### **Symptoms**
```bash
API responses taking >1 second
Request timeouts
High CPU usage during API calls
```

#### **Root Cause Analysis**
- Database query performance
- Inefficient API endpoint implementation
- Missing caching
- Connection pool exhaustion

#### **Solutions**

**Step 1: API Performance Analysis**
```bash
# Analyze API performance
claude-zen api analyze --endpoints --bottlenecks --timeframe 1h

# Profile slow endpoints
claude-zen api profile --slow-requests --threshold 500ms
```

**Step 2: Enable Caching**
```typescript
// Configure response caching
const cacheConfig = {
  redis: {
    host: 'localhost',
    port: 6379,
    ttl: 300 // 5 minutes
  },
  endpoints: {
    '/api/status': { ttl: 60 },
    '/api/swarms': { ttl: 120 },
    '/api/agents': { ttl: 180 }
  }
};

// Enable cache warming
await cacheManager.warmCache([
  '/api/status',
  '/api/swarms',
  '/api/agents'
]);
```

**Step 3: Database Optimization**
```bash
# Analyze database queries
claude-zen db analyze --slow-queries --explain

# Add database indexes
claude-zen db index --create --tables tasks,agents,swarms
```

**Step 4: Connection Pool Tuning**
```typescript
// Optimize connection pools
const poolConfig = {
  database: {
    min: 5,
    max: 50,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000
  },
  http: {
    maxConnections: 100,
    keepAlive: true,
    timeout: 30000
  }
};
```

---

## 🔧 **Configuration and Integration Issues**

### **Issue: Environment Configuration Problems**

#### **Symptoms**
```bash
Configuration file not found
Environment variables not loaded
Service discovery failures
```

#### **Root Cause Analysis**
- Missing or incorrect configuration files
- Environment variable naming conflicts
- Path resolution issues
- Missing required configuration values

#### **Solutions**

**Step 1: Verify Configuration Files**
```bash
# Check configuration file locations
claude-zen config validate --check-paths

# Generate default configuration
claude-zen config init --template production

# Verify environment variables
claude-zen config env --validate
```

**Step 2: Configuration File Structure**
```json
// config/production.json
{
  "server": {
    "port": 3456,
    "host": "0.0.0.0"
  },
  "mcp": {
    "port": 3000,
    "timeout": 30000
  },
  "neural": {
    "wasmAcceleration": true,
    "memoryLimit": "2GB"
  },
  "monitoring": {
    "enabled": true,
    "interval": 10000
  }
}
```

**Step 3: Environment Variable Template**
```bash
# .env.template
NODE_ENV=production
WEB_PORT=3000
ZEN_LOG_LEVEL=info
ZEN_ENABLE_WASM=true
ZEN_MEMORY_BACKEND=sqlite
DATABASE_URL=postgresql://user:pass@localhost:5432/claudezen
REDIS_URL=redis://localhost:6379
```

**Step 4: Configuration Validation**
```typescript
// Configuration validation schema
const configSchema = {
  server: {
    port: { type: 'number', min: 1000, max: 65535 },
    host: { type: 'string', default: 'localhost' }
  },
  neural: {
    wasmAcceleration: { type: 'boolean', default: true },
    memoryLimit: { type: 'string', pattern: /^\d+[GMK]B$/ }
  }
};

// Validate configuration on startup
const config = validateConfig(loadConfig(), configSchema);
```

---

### **Issue: Docker Deployment Problems**

#### **Symptoms**
```bash
Docker container fails to start
Port binding errors in Docker
Volume mount issues
```

#### **Root Cause Analysis**
- Port conflicts on host system
- Missing volume mounts for persistent data
- Incorrect Docker networking configuration
- Resource limits too restrictive

#### **Solutions**

**Step 1: Fix Port Conflicts**
```bash
# Check for port conflicts
docker ps --format "table {{.Ports}}"

# Use alternative ports
docker run -p 3457:3456 -p 3001:3000 claude-zen-flow
```

**Step 2: Docker Compose Configuration**
```yaml
# docker-compose.yml
version: '3.8'
services:
  claude-zen:
    build: .
    ports:
      - "3456:3456"
      - "3000:3000"
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
      - ./config:/app/config
    environment:
      - NODE_ENV=production
      - ZEN_LOG_LEVEL=info
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3456/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

**Step 3: Volume Permissions**
```bash
# Fix volume permissions
sudo chown -R 1000:1000 ./data ./logs
chmod -R 755 ./data ./logs

# Or use Docker user mapping
docker run --user $(id -u):$(id -g) claude-zen-flow
```

---

## 🔍 **Debugging Tools and Commands**

### **Comprehensive Debugging Commands**
```bash
# System-wide diagnostic
claude-zen diagnose --comprehensive --output diagnostic-report.json

# Component-specific debugging
claude-zen debug swarm --agents --topology --communication
claude-zen debug neural --models --training --wasm
claude-zen debug api --endpoints --performance --errors

# Real-time monitoring
claude-zen monitor --live --all-components --refresh 5

# Log analysis
claude-zen logs --level error --component neural --since 1h
claude-zen logs --grep "timeout" --tail 100

# Performance profiling
claude-zen profile --cpu --memory --duration 60s

# Health checks
claude-zen health --detailed --components swarm,neural,api,database
```

### **Log Level Configuration**
```bash
# Set debug logging for troubleshooting
export DEBUG=claude-zen:*
export ZEN_LOG_LEVEL=debug

# Component-specific logging
export DEBUG=claude-zen:swarm,claude-zen:neural
```

### **Emergency Recovery Commands**
```bash
# Emergency system reset (preserves data)
claude-zen emergency reset --preserve-data --backup-config

# Force restart all components
claude-zen restart --force --all-components

# Rollback to previous version
claude-zen rollback --version 2.0.0-alpha.72 --preserve-state
```

## 🆘 **Getting Additional Help**

### **Support Channels**
- **GitHub Issues**: https://github.com/mikkihugo/claude-code-zen/issues
- **Discussions**: https://github.com/mikkihugo/claude-code-zen/discussions
- **Documentation**: https://docs.anthropic.com/en/docs/claude-code

### **Diagnostic Information to Include**
When reporting issues, please include:

```bash
# Generate comprehensive diagnostic report
claude-zen diagnose --full-report --include-logs --output support-bundle.tar.gz

# Manual information collection
node --version
npm --version
claude-zen --version
claude-zen status --json
claude-zen logs --since 24h --level error
```

### **Community Resources**
- **Examples Repository**: https://github.com/mikkihugo/claude-code-zen/examples
- **Performance Tuning Guide**: [Performance Guide](../performance/optimization-strategies.md)
- **Integration Examples**: [Integration Guide](../integration/external-systems.md)

This troubleshooting guide covers the most common issues. For complex problems or issues not covered here, please create a detailed issue report with the diagnostic information above.

## 📚 **Related Documentation**

- **[Performance Monitoring](../performance/monitoring-setup.md)** - Monitor system health and performance
- **[Development Workflow](../development/workflow.md)** - Optimize development processes
- **[Integration Patterns](../integration/external-systems.md)** - Integrate with external systems
- **[API Documentation](../api/README.md)** - Complete API reference