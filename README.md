# Claude Zen Flow

[![Version](https://img.shields.io/npm/v/claude-code-zen)](https://www.npmjs.com/package/claude-code-zen)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Claude Zen Flow** is a unified AI swarm orchestration platform with neural networks and direct integration for Claude Code. It provides a comprehensive development environment with multi-interface support and document-driven development capabilities.

## 🚀 Quick Start

```bash
# Install globally
npm install -g claude-code-zen

# Initialize a new project
claude-zen workspace init my-project --template=advanced

# Start all interfaces
claude-zen mcp start                    # HTTP MCP for Claude Desktop (port 3000)
claude-zen web start --daemon           # Web dashboard (port 3456)
claude mcp add claude-zen-swarm npx claude-zen swarm mcp start  # Stdio MCP for Claude Code
```

## 🏗️ Architecture

Claude Zen Flow implements a sophisticated dual MCP (Model Context Protocol) architecture:

### **HTTP MCP Server** (Port 3000)
- **Purpose**: Claude Desktop integration via HTTP-based MCP protocol
- **Target**: Human-facing Claude Desktop application
- **Tools**: Core project management, system info, project initialization

### **Stdio MCP Server** (Stdio Protocol)
- **Purpose**: Swarm coordination and agent orchestration
- **Target**: Automated swarm coordination and AI agent management
- **Tools**: Swarm initialization, agent spawning, task orchestration

## 🖥️ Multiple Interfaces

### 1. **CLI Interface**
```bash
claude-zen init <project> --template advanced
claude-zen status --format json
claude-zen swarm init --topology mesh --agents 5
```

### 2. **Web Dashboard** (Port 3456)
- Real-time monitoring and control
- REST API endpoints
- WebSocket live updates
- Mobile-friendly responsive design

### 3. **Terminal UI (TUI)**
```bash
claude-zen tui  # Interactive terminal interface
```

### 4. **Claude Desktop Integration**
Configure Claude Desktop with HTTP MCP for seamless AI assistance.

## 📋 Document-Driven Development

Transform vision documents into executable code through structured phases:

**Vision → ADRs → PRDs → Epics → Features → Tasks → Code**

```bash
# Process vision document into implementation
claude-zen workspace process docs/vision/product-vision.md

# Generate code from feature specifications
claude-zen workspace implement docs/features/jwt-authentication.md
```

## 🧪 Hybrid Testing Strategy

- **70% TDD London (Mockist)**: For distributed components and protocols
- **30% Classical TDD (Detroit)**: For neural algorithms and mathematical operations
- **Real-time Hybrid**: For WebSocket and swarm coordination

## 🔧 Key Features

- **🐝 Swarm Orchestration**: Multi-agent coordination with mesh, hierarchical, ring, and star topologies
- **🧠 Neural Integration**: Built-in neural network capabilities with WASM optimization
- **📊 Real-time Monitoring**: Comprehensive performance dashboards and health monitoring
- **🔄 Memory Persistence**: Cross-session state management and learning
- **🌐 GitHub Integration**: Advanced repository management and automation
- **📈 Performance Optimization**: 84.8% SWE-Bench solve rate, 2.8-4.4x speed improvements

## 📚 Documentation

- **Getting Started**: [docs/README.md](docs/README.md)
- **API Reference**: [docs/api/](docs/api/)
- **Architecture**: [docs/architecture/](docs/architecture/)
- **Examples**: [examples/](examples/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the hybrid TDD testing strategy
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Repository**: https://github.com/mikkihugo/claude-zen-flow
- **Issues**: https://github.com/mikkihugo/claude-zen-flow/issues  
- **NPM Package**: https://www.npmjs.com/package/claude-code-zen

---

**Powered by Claude Zen Flow - Unified AI swarm orchestration for the modern developer.**