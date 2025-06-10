# Claude-Flow Documentation

Welcome to the comprehensive documentation for Claude-Flow, an advanced AI agent orchestration system created by rUv.

## Table of Contents

- [**Quick Start Guide**](./quick-start.md) - Get up and running in minutes
- [**CLI Reference**](./cli-reference.md) - Complete command-line interface documentation
- [**Configuration Guide**](./configuration.md) - System configuration and customization
- [**Memory System**](./memory-system.md) - Advanced memory management capabilities
- [**Agent Management**](./agent-management.md) - Creating and managing AI agents
- [**Task Orchestration**](./task-orchestration.md) - Task scheduling and workflows
- [**Terminal Integration**](./terminal-integration.md) - Terminal pooling and session management
- [**MCP Integration**](./mcp-integration.md) - Model Context Protocol implementation
- [**API Reference**](./api/) - Complete programmatic API documentation
- [**Deployment Guide**](./deployment/) - Production deployment strategies
- [**Troubleshooting**](./troubleshooting.md) - Common issues and solutions
- [**Examples**](./examples/) - Practical usage examples and templates

## What is Claude-Flow?

Claude-Flow is a sophisticated multi-agent orchestration system that enables you to:

- **Orchestrate Multiple AI Agents**: Spawn and coordinate multiple Claude agents with different roles and capabilities
- **Manage Complex Workflows**: Create and execute multi-step workflows with dependencies and parallel processing
- **Persistent Memory**: Advanced memory management with SQLite and Markdown backends
- **Terminal Integration**: Efficient terminal pooling and session management with VSCode integration
- **Resource Coordination**: Intelligent resource management with deadlock detection and prevention
- **MCP Protocol Support**: Model Context Protocol server for seamless tool integration

## Key Features

### 🤖 Multi-Agent System
- Spawn agents with specialized roles (researcher, implementer, analyst, coordinator)
- Dynamic agent lifecycle management
- Inter-agent communication and collaboration

### 📋 Task Orchestration
- Priority-based task scheduling
- Dependency management
- Parallel and sequential execution
- Workflow templates and automation

### 🧠 Advanced Memory System
- Hybrid SQLite/Markdown storage backends
- Vector search and semantic retrieval
- CRDT-based conflict resolution
- Automatic synchronization across agents

### 💻 Terminal Management
- Efficient terminal pooling
- Session recycling and health monitoring
- VSCode Terminal API integration
- Command execution and output capture

### 🔗 MCP Integration
- Model Context Protocol server
- Tool registration and discovery
- Secure communication channels
- Extensible tool ecosystem

## Getting Started

### Installation

The easiest way to get started is using npx:

```bash
npx claude-flow
```

Or install globally:

```bash
npm install -g claude-flow
```

### Quick Example

1. Initialize your project:
```bash
claude-flow config init
```

2. Start the orchestrator:
```bash
claude-flow start
```

3. Spawn your first agent:
```bash
claude-flow agent spawn researcher --name "Research Assistant"
```

4. Create and assign a task:
```bash
claude-flow task create research "Analyze the latest AI trends in 2024"
```

## Architecture Overview

Claude-Flow uses a modular, event-driven architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CLI/REPL      │    │   Web UI        │    │   API Client    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Orchestrator   │
                    │   (Core)        │
                    └─────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Agent Manager   │ │ Task Scheduler  │ │ Memory Manager  │
└─────────────────┘ └─────────────────┘ └─────────────────┘
         │                   │                   │
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│Terminal Manager │ │Resource Manager │ │  MCP Server     │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

## Documentation Structure

This documentation is organized into several sections:

### For Users
- **Quick Start**: Get running immediately with simple examples
- **CLI Reference**: Complete guide to all command-line options
- **Configuration**: Customize Claude-Flow for your needs
- **Examples**: Real-world usage scenarios and templates

### For Developers
- **API Reference**: Programmatic interface documentation
- **Architecture**: Deep dive into system design
- **Contributing**: Guidelines for code contributions
- **Deployment**: Production setup and scaling

### For System Administrators
- **Installation**: Various installation methods and requirements
- **Configuration**: Advanced configuration options
- **Monitoring**: System monitoring and health checks
- **Troubleshooting**: Common issues and debugging

## Community and Support

- **GitHub Repository**: [https://github.com/ruvnet/claude-code-flow](https://github.com/ruvnet/claude-code-flow)
- **Issues**: Report bugs and request features
- **Discussions**: Community Q&A and feature discussions
- **Discord**: Real-time chat and support

## Contributing

Claude-Flow is open source and welcomes contributions! See our [Contributing Guide](./contributing.md) for:

- Code style guidelines
- Development setup
- Testing procedures
- Pull request process

## License

Claude-Flow is released under the MIT License. See the [LICENSE](../LICENSE) file for details.

---

*Created by rUv - Advancing AI agent orchestration for the Claude community*