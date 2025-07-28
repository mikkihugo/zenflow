# Claude Code Flow - Advanced AI Orchestration Platform

## 🚀 System Overview

Claude Code Flow is a high-performance Node.js/TypeScript AI orchestration platform with integrated Rust neural networks, featuring multiple Queen implementations per hive, vector databases, graph databases, and GPU acceleration.

### 🏗️ Architecture Components

**Core Technologies:**
- **Node.js 22+** with TypeScript
- **SQLite** - Primary memory persistence & hive-mind coordination
- **LanceDB** - Vector database for embeddings & semantic search
- **Kuzu** - Graph database for service relationships
- **PostgreSQL** - Optional enterprise backend
- **WebGPU/WASM** - GPU acceleration
- **Rust** - High-performance neural network engine (ruv-FANN)

## 👑 Multi-Queen Hive Architecture

### **Multiple Queens Per Hive**
- Each hive can support multiple Queen instances for distributed decision-making
- Queens coordinate through shared SQLite memory and vector embeddings
- Consensus mechanisms for strategic decisions
- Load balancing across Queens for scalability

### **Queen Systems Present:**
1. **Main Queen Council** - Strategic oversight in JavaScript/TypeScript
2. **ruv-FANN Queen** - Neural network-based Queen in Rust
3. **Vision Queen** - Visual-to-code pipeline coordination
4. **Hive Queens** - Multiple Queens per hive for distributed intelligence

## 🧠 Major Features

### **1. Neural Network Integration (ruv-FANN)**
- **FANN Core** - Fast Artificial Neural Network library in Rust
- **27+ Forecasting Models** - LSTM, N-BEATS, Transformers, etc.
- **84.8% SWE-Bench** achievement with swarm intelligence
- **WebGPU Backend** - Autonomous GPU resource management
- **SIMD Optimization** - CPU performance enhancements
- **CUDA-WASM** - GPU compute via WebAssembly

### **2. Database Stack**
- **SQLite** - Persistent memory, hive coordination, Queen state
- **LanceDB** - Vector embeddings, semantic search, neural patterns
- **Kuzu** - Graph relationships, service dependencies, Queen networks
- **ChromaDB** - Fallback vector store (mapped to LanceDB)
- **PostgreSQL** - Enterprise-scale deployments

### **3. Swarm Orchestration**
- **Hive Mind** - Persistent service intelligence with multi-Queen support
- **Queen Council** - Distributed Queen decision-making system
- **Ephemeral Swarms** - Temporary task execution agents
- **Neural Swarms** - ruv-swarm achieving 84.8% on benchmarks
- **MCP Integration** - Model Context Protocol server

### **4. Vision-to-Code Pipeline**
- **Vision Service** - Converts designs to code
- **Code Service** - Generation and optimization
- **Language Service** - Multi-language support
- **Queen Orchestrator** - Coordinates the pipeline

### **5. Advanced Features**
- **Graph Neural Networks** - Via Kuzu for complex relationships
- **Vector Search** - LanceDB for semantic intelligence
- **WebGPU Acceleration** - Advanced GPU compute
- **WASM Runtime** - Browser/edge deployment
- **300-400+ Microservice Support** - Enterprise scale
- **Cross-Session Learning** - Persistent neural patterns

## 📁 Directory Structure

```
claude-code-flow/
├── src/                    # Main JavaScript/TypeScript source
│   ├── hive/              # Hive-mind with multi-Queen support
│   ├── swarm/             # Swarm orchestration
│   ├── memory/            # SQLite + vector persistence
│   └── queens/            # Queen implementations
├── ruv-FANN/              # Rust neural network framework (submodule)
│   ├── cuda-wasm/         # CUDA to WASM compiler
│   ├── neuro-divergent/   # 27+ forecasting models
│   ├── ruv-swarm/         # Swarm intelligence
│   └── queen/             # Neural Queen implementation
├── vision-to-code/        # Visual to code pipeline
│   └── queen-agent/       # Vision Queen coordinator
├── benchmark/             # Performance testing
├── claude-zen-mcp/        # MCP server implementation
└── databases/
    ├── sqlite/            # Primary persistence
    ├── lancedb/           # Vector operations
    └── kuzu/              # Graph relationships
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start with MCP
claude mcp add claude-flow npx claude-flow mcp start

# Or run directly
npm run dev

# Run benchmarks
npm run benchmark
```

## 🔧 Development Commands

```bash
# Core system
npm run dev              # Start development server
npm test                 # Run test suite
npm run build           # Build TypeScript

# Neural network (Rust)
cd ruv-FANN
cargo build --release   # Build neural engine
cargo test              # Test neural networks

# Vision pipeline
cd vision-to-code
npm run vision:start    # Start vision service
```

## 💾 Database Configuration

### SQLite (Primary)
- Hive-mind coordination
- Queen state persistence
- Cross-session memory
- Service registration

### LanceDB (Vectors)
- Semantic search
- Neural embeddings
- Pattern matching
- Queen decision vectors

### Kuzu (Graphs)
- Service relationships
- Queen network topology
- Dependency graphs
- Communication patterns

## 🐝 Multi-Queen Hive Operations

### Creating a Hive with Multiple Queens
```javascript
// Initialize hive with multi-Queen support
const hive = await HiveMind.create({
  queens: 3,  // Number of Queens per hive
  consensus: 'majority',  // Decision-making strategy
  database: {
    sqlite: './hive.db',
    lancedb: './vectors',
    kuzu: './graphs'
  }
});
```

### Queen Coordination
- Queens share state via SQLite
- Vector embeddings in LanceDB for semantic consensus
- Graph relationships in Kuzu for Queen networks
- Automatic failover and load balancing

## 🎯 Performance

- **Concurrency**: 1M+ requests/second capability
- **Queens per Hive**: Up to 10 Queens with consensus
- **Vector Search**: <10ms semantic queries
- **Graph Traversal**: Millisecond-scale with Kuzu
- **Neural Inference**: GPU-accelerated via WebGPU
- **Memory**: 2KB per agent process

## 🛡️ Architecture Benefits

1. **Resilience**: Multiple Queens prevent single points of failure
2. **Scalability**: Distributed decision-making across Queens
3. **Intelligence**: Neural networks + vector + graph databases
4. **Performance**: Rust neural engine + GPU acceleration
5. **Flexibility**: JavaScript orchestration + Rust computation

## 📚 Key Concepts

### Hive Mind
Persistent, intelligent service coordination with multiple Queens managing different aspects of the system.

### Queen Council
Distributed Queens make consensus-based decisions using vector similarity and graph relationships.

### Neural Swarms
Temporary agent swarms powered by ruv-FANN achieving 84.8% on coding benchmarks.

### Vector Intelligence
LanceDB enables semantic understanding and pattern matching across all operations.

### Graph Relationships
Kuzu provides complex relationship modeling between services, Queens, and agents.

## 🔗 Integration Points

- **MCP Server**: Model Context Protocol for Claude Code
- **REST API**: Full HTTP API for external integration
- **WebSocket**: Real-time swarm coordination
- **GraphQL**: Query complex relationships
- **gRPC**: High-performance service communication

## 📈 Benchmarks

```bash
npm run benchmark        # Run performance tests
npm run benchmark:neural # Test neural network performance
npm run benchmark:db     # Test database operations
npm run benchmark:swarm  # Test swarm coordination
```

## 🤝 Contributing

This is an active project combining:
- JavaScript/TypeScript orchestration
- Rust neural network performance
- Multiple database technologies
- GPU acceleration
- Distributed Queen intelligence

PRs welcome for improvements in any area!

## 📝 **DOCUMENTATION ARCHITECTURE PRINCIPLES**

### **Template CLAUDE.md Policy**
The template CLAUDE.md (`/src/cli/command-handlers/init-handlers/init/templates/CLAUDE.md`) should **NOT** document ruv-swarm directly because:

1. **Templates are project-agnostic** - They show how to use Claude Code capabilities
2. **ruv-swarm is claude-zen's internal implementation** - Users interact with `mcp__claude-zen__*` tools
3. **MCP abstraction is correct** - Users don't need to know ruv-swarm implementation details
4. **ruv-swarm is bundled with claude-zen** - It's automatically available via workspace integration

### **Where ruv-swarm IS Documented**
- **`/ruv-FANN/CLAUDE.md`** - Direct ruv-swarm usage (for power users)
- **`/ruv-FANN/README.md`** - ruv-swarm architecture and capabilities
- **Template settings.json** - Automatically enables `"enabledMcpjsonServers": ["claude-zen", "ruv-swarm"]`

### **Integration Architecture**
- **Package Integration**: `ruv-FANN/ruv-swarm/npm` is in claude-zen workspace
- **Direct Binary**: `./ruv-FANN/ruv-swarm/npm/bin/ruv-swarm-secure.js` works directly
- **Workspace Access**: `npx @claude-zen/ruv-swarm` available automatically
- **MCP Server**: ruv-swarm runs as MCP server alongside claude-zen

**IMPORTANT: Template CLAUDE.md shows claude-zen MCP tools (which internally use ruv-swarm). This is the correct abstraction.**

---

**Status**: Production-ready with multi-Queen hive support, vector/graph databases, and neural network integration.