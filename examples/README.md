# Examples Directory

This directory contains comprehensive working examples for all major Claude Code Flow APIs and features.

## 📁 Directory Structure

```
examples/
├── api/                    # Server API examples
│   ├── basic-server.js     # Basic server setup and configuration
│   ├── advanced-api.js     # Advanced API patterns and middleware
│   └── schema-driven.js    # Schema-driven development examples
├── mcp/                    # MCP (Model Context Protocol) examples
│   ├── mcp-client-example.js       # Comprehensive MCP client usage
│   ├── tool-development.js         # Custom MCP tool development
│   └── provider-integration.js     # AI provider integration
├── swarm/                  # Swarm coordination examples
│   ├── swarm-coordination-example.js    # Advanced swarm patterns
│   ├── topology-examples.js            # Different topology patterns
│   └── multi-queen-hive.js             # Multi-Queen architecture
├── memory/                 # Memory management examples
│   ├── sqlite-operations.js       # SQLite memory store operations
│   ├── vector-search.js           # LanceDB vector operations
│   └── graph-relationships.js     # Kuzu graph database examples
├── integration/            # Integration examples
│   ├── github-integration.js      # GitHub swarm integration
│   ├── workflow-automation.js     # Automated workflow examples
│   └── plugin-development.js      # Plugin system examples
└── complete-workflows/     # End-to-end workflow examples
    ├── code-analysis-workflow.js   # Complete code analysis pipeline
    ├── deployment-workflow.js      # Automated deployment workflow
    └── monitoring-workflow.js      # System monitoring workflow
```

## 🚀 Quick Start

### Running Examples

Each example can be run independently:

```bash
# Server API examples
node examples/api/basic-server.js
node examples/api/basic-server.js advanced

# MCP client examples
node examples/mcp/mcp-client-example.js swarm-init
node examples/mcp/mcp-client-example.js all

# Swarm coordination examples
node examples/swarm/swarm-coordination-example.js hierarchical
node examples/swarm/swarm-coordination-example.js all

# Memory examples
node examples/memory/sqlite-operations.js
node examples/memory/vector-search.js
```

### Example Categories

#### 🌐 API Examples
- **Basic Server Setup**: Simple Express server with schema-driven routes
- **Advanced API Patterns**: Middleware, authentication, rate limiting
- **Real-time Features**: WebSocket integration and live updates
- **OpenAPI Documentation**: Auto-generated API documentation

#### 🔧 MCP Tool Examples
- **Basic Tool Usage**: Simple MCP tool calls and responses
- **Swarm Operations**: Complex swarm initialization and management
- **Memory Operations**: Persistent data storage and retrieval
- **Analysis Tools**: Performance analysis and system diagnostics

#### 🐝 Swarm Coordination Examples
- **Topology Patterns**: Hierarchical, mesh, ring, and star topologies
- **Multi-Queen Architecture**: Distributed decision-making systems
- **Load Balancing**: Dynamic load distribution strategies
- **Fault Tolerance**: Resilient swarm operations with failover

#### 💾 Memory Management Examples
- **SQLite Operations**: Primary data storage and queries
- **Vector Search**: Semantic search with LanceDB
- **Graph Relationships**: Complex relationship modeling with Kuzu
- **Unified Memory**: Cross-store operations and intelligent search

#### 🔗 Integration Examples
- **GitHub Swarm Tools**: Repository analysis and automation
- **Workflow Automation**: End-to-end task automation
- **Plugin Development**: Custom plugin creation and integration
- **AI Provider Integration**: Multi-provider AI orchestration

## 📋 Example Prerequisites

### Required Dependencies
Most examples require the main Claude Code Flow package:

```bash
npm install @claude-zen/monorepo
```

### Optional Dependencies
Some examples may require additional packages:

```bash
# For GitHub integration examples
npm install @octokit/rest

# For advanced API examples
npm install express-rate-limit cors

# For monitoring examples
npm install prometheus-client
```

### Environment Configuration
Create a `.env` file for examples requiring external services:

```bash
# GitHub integration
GITHUB_TOKEN=your_github_token

# AI providers
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Database paths
SQLITE_DB_PATH=./data/examples.db
LANCEDB_PATH=./data/vectors
KUZU_PATH=./data/graphs
```

## 🎯 Example Usage Patterns

### 1. Learning the Basics
Start with these examples to understand core concepts:

```bash
# 1. Basic server setup
node examples/api/basic-server.js

# 2. Simple MCP operations
node examples/mcp/mcp-client-example.js swarm-init

# 3. Memory operations
node examples/memory/sqlite-operations.js
```

### 2. Exploring Advanced Features
Move to complex examples once familiar with basics:

```bash
# Advanced swarm coordination
node examples/swarm/swarm-coordination-example.js multiswarm

# Complex workflow automation
node examples/complete-workflows/code-analysis-workflow.js

# Plugin development
node examples/integration/plugin-development.js
```

### 3. Production Patterns
Study production-ready patterns:

```bash
# Scalable server configuration
node examples/api/advanced-api.js production

# Monitoring and observability
node examples/complete-workflows/monitoring-workflow.js

# Error handling and recovery
node examples/swarm/fault-tolerance-example.js
```

## 🔧 Customizing Examples

### Configuration
Most examples accept configuration via environment variables or command-line arguments:

```bash
# Configure ports and hosts
PORT=4000 HOST=localhost node examples/api/basic-server.js

# Configure swarm parameters
node examples/swarm/swarm-coordination-example.js hierarchical --max-agents=16 --strategy=specialized

# Configure memory paths
SQLITE_PATH=./custom.db node examples/memory/sqlite-operations.js
```

### Extending Examples
Examples are designed to be easily extended:

```javascript
// Extend basic server example
import { basicServerExample } from './examples/api/basic-server.js';

// Add custom configuration
const customServer = await basicServerExample({
  port: 8080,
  additionalMiddleware: [myCustomMiddleware],
  customRoutes: myRoutes
});
```

## 📚 Learning Path

### Beginner
1. **API Basics**: Start with `examples/api/basic-server.js`
2. **MCP Introduction**: Try `examples/mcp/mcp-client-example.js`
3. **Simple Memory**: Explore `examples/memory/sqlite-operations.js`

### Intermediate
1. **Swarm Coordination**: `examples/swarm/swarm-coordination-example.js`
2. **Vector Search**: `examples/memory/vector-search.js`
3. **Integration Patterns**: `examples/integration/workflow-automation.js`

### Advanced
1. **Multi-Queen Architecture**: `examples/swarm/multi-queen-hive.js`
2. **Complete Workflows**: `examples/complete-workflows/`
3. **Custom Plugin Development**: `examples/integration/plugin-development.js`

## 🧪 Testing Examples

Examples include built-in validation and testing:

```bash
# Run example with validation
node examples/api/basic-server.js --validate

# Test swarm operations
node examples/swarm/swarm-coordination-example.js hierarchical --test-mode

# Benchmark memory operations
node examples/memory/vector-search.js --benchmark
```

## 📖 Documentation

Each example includes comprehensive inline documentation:

- **Purpose**: What the example demonstrates
- **Prerequisites**: Required setup and dependencies
- **Configuration**: Available options and environment variables
- **Expected Output**: What to expect when running the example
- **Troubleshooting**: Common issues and solutions

## 🤝 Contributing Examples

To contribute new examples:

1. **Follow the pattern**: Use existing examples as templates
2. **Include documentation**: Comprehensive inline comments
3. **Add error handling**: Robust error handling and recovery
4. **Provide configuration**: Make examples configurable
5. **Include tests**: Validation and testing capabilities

### Example Template
```javascript
/**
 * Example: [Description]
 * 
 * Purpose: [What this example demonstrates]
 * Prerequisites: [Required setup]
 * Usage: node examples/category/example.js [options]
 */

import { /* imports */ } from '@claude-zen/monorepo';

class ExampleClass {
  constructor(options = {}) {
    // Configuration and setup
  }

  async initialize() {
    // Initialization logic
  }

  async runExample() {
    // Main example logic
  }
}

// CLI runner
async function main() {
  // Command-line argument handling
  // Example execution
}

// Export for programmatic use
export { ExampleClass };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
```

## 🔍 Troubleshooting

### Common Issues

1. **Missing Dependencies**
   ```bash
   npm install @claude-zen/monorepo
   ```

2. **Permission Errors**
   ```bash
   chmod +x examples/**/*.js
   ```

3. **Port Conflicts**
   ```bash
   PORT=8080 node examples/api/basic-server.js
   ```

4. **Database Initialization**
   ```bash
   rm -rf ./data && node examples/memory/sqlite-operations.js --initialize
   ```

### Getting Help

- Check example documentation (inline comments)
- Review error messages and stack traces
- Consult main API documentation
- Open issues for bugs or unclear examples

## 📊 Performance Notes

Examples are optimized for learning, not production performance. For production use:

- Increase connection pool sizes
- Enable caching where appropriate
- Configure proper resource limits
- Implement monitoring and logging
- Use production-grade databases

## 🔄 Updates

Examples are regularly updated to reflect:
- New API features
- Best practice changes
- Performance improvements
- Bug fixes and corrections

Check the repository for the latest versions and updates.