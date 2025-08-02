# Claude Code Flow Documentation

**Unified documentation system for Claude Code Flow - the AI swarm orchestration platform.**

## 📚 **Documentation Structure**

### **For Users**
- **[Getting Started](getting-started.md)** - Installation, setup, and first steps
- **[CLI Reference](cli-reference.md)** - Complete command-line interface documentation
- **[User Guide](user-guide.md)** - Comprehensive feature walkthrough
- **[Examples](examples/README.md)** - Practical examples and tutorials

### **For Developers**
- **[Architecture](architecture/README.md)** - System design and technical architecture
- **[Development Guide](development/README.md)** - Contributing, testing, and development workflows
- **[Integration Guide](integration/README.md)** - Claude Desktop, VS Code, and third-party integrations

### **API Reference**
- **[API Overview](api/README.md)** - Complete API documentation
- **[HTTP MCP API](api/http-mcp.md)** - Claude Desktop integration tools
- **[REST API](api/rest-api.md)** - Web dashboard and programmatic access
- **[WebSocket API](api/websocket-api.md)** - Real-time communication

### **Reference**
- **[Configuration](configuration.md)** - Configuration options and settings
- **[Troubleshooting](troubleshooting.md)** - Common issues and solutions
- **[Changelog](../CHANGELOG.md)** - Release notes and version history

## 🚀 **Quick Navigation**

| I want to... | Go to... |
|---------------|----------|
| **Get started quickly** | [Getting Started](getting-started.md) |
| **Understand the architecture** | [Architecture Overview](architecture/README.md) |
| **Use the CLI** | [CLI Reference](cli-reference.md) |
| **Set up Claude Desktop** | [Claude Desktop Integration](integration/claude-desktop.md) |
| **Develop features** | [Development Guide](development/README.md) |
| **Use the APIs** | [API Reference](api/README.md) |
| **Troubleshoot issues** | [Troubleshooting](troubleshooting.md) |

## 🎯 **Key Features Documented**

### **Multi-Interface System**
- **CLI Interface** - Command-line operations and scripting
- **Web Dashboard** - Browser-based real-time monitoring (port 3456)
- **Terminal UI** - Interactive terminal interface
- **Claude Desktop** - AI-assisted development via MCP integration

### **Dual MCP Architecture**
- **HTTP MCP Server** (port 3000) - Claude Desktop integration
- **Stdio MCP Server** - Swarm coordination and agent management
- **Tool Documentation** - Complete MCP tool reference

### **Document-Driven Development**
- **Vision → Code** - Transform high-level documents into implementation
- **Structured Workflow** - Vision → ADRs → PRDs → Epics → Features → Tasks → Code
- **Template System** - Consistent documentation templates

### **Advanced Features**
- **Swarm Orchestration** - Multi-agent coordination with various topologies
- **Neural Integration** - Built-in neural networks with WASM optimization
- **Real-time Monitoring** - Performance dashboards and health monitoring
- **Memory Persistence** - Cross-session state management

## 📊 **Performance Highlights**

- **84.8% SWE-Bench solve rate** - Industry-leading problem-solving capability
- **32.3% token reduction** - Efficient task breakdown and coordination
- **2.8-4.4x speed improvement** - Parallel execution strategies
- **1M+ requests/second** - High-performance concurrent processing
- **<1ms P99 latency** - Real-time response capabilities

## 📖 **Documentation Standards**

All documentation in this system follows these standards:

### **Formatting**
- **Markdown** - All docs use GitHub-flavored markdown
- **Consistent Structure** - Standard headers, navigation, and formatting
- **Clear Examples** - Practical, working code examples
- **Visual Aids** - Diagrams, screenshots, and flowcharts where helpful

### **Content Guidelines**
- **User-Focused** - Written from the user's perspective
- **Task-Oriented** - Organized around what users want to accomplish
- **Up-to-Date** - Regularly updated with new features and changes
- **Cross-Referenced** - Extensive internal linking for easy navigation

### **Quality Assurance**
- **Reviewed** - All documentation changes are reviewed
- **Tested** - Examples and instructions are tested for accuracy
- **Feedback** - Regular user feedback incorporation
- **Version Control** - Tracked alongside code changes

## 🏗️ **Architecture Quick Overview**

```
┌─────────────────────────────────────────┐
│           User Interfaces              │
│  CLI | TUI | Web Dashboard | Claude Desktop  │
├─────────────────────────────────────────┤
│          API Layer                      │
│    HTTP MCP | Stdio MCP | REST | WebSocket   │
├─────────────────────────────────────────┤
│       Swarm Orchestration               │
│  Mesh | Hierarchical | Ring | Star Topologies │
├─────────────────────────────────────────┤
│         Core Systems                    │
│  Neural | Memory | Coordination | Database   │
└─────────────────────────────────────────┘
```

## 🎯 **Use Cases**

### **For Individual Developers**
- **AI-Assisted Coding** - Enhanced development with Claude Desktop integration
- **Task Automation** - Automate repetitive development tasks
- **Code Quality** - Automated testing and review processes

### **For Teams**
- **Distributed Development** - Coordinate work across team members
- **Real-time Collaboration** - Live monitoring and communication
- **Process Automation** - Standardized workflows and pipelines

### **For Organizations**
- **Scalable AI Orchestration** - Manage large-scale AI agent deployments
- **Performance Monitoring** - Comprehensive system analytics
- **Integration Platform** - Connect with existing tools and workflows

## 📋 **Document-Driven Development Workflow**

Transform high-level vision into executable code through structured phases:

**Vision → ADRs → PRDs → Epics → Features → Tasks → Code**

```bash
# Example workflow
claude-zen create vision "AI-Powered Code Assistant"
claude-zen create adr "Database Architecture Decision"
claude-zen create prd "User Authentication System"
claude-zen workspace process docs/01-vision/ai-assistant.md
claude-zen workspace implement docs/05-features/authentication.md
```

For detailed workflow information, see the [Development Guide](development/README.md).

## 🔄 **Documentation Maintenance**

This documentation system is actively maintained and follows these principles:

1. **Single Source of Truth** - Avoid duplication, maintain consistency
2. **Living Documentation** - Updated with every feature change
3. **User Feedback** - Regular collection and incorporation of user feedback
4. **Automation** - Automated checking for broken links and outdated content

## 🤝 **Contributing to Documentation**

See the [Documentation Contributing Guide](development/contributing-docs.md) for information on:
- Documentation style guide
- Review process
- Testing documentation changes
- Local development setup

## 📚 **Historical Documentation**

Previous versions and historical documentation can be found in:
- **[Archive](archive/README.md)** - Deprecated and historical documents
- **[Migration Guides](archive/migrations/)** - Version migration information

---

**Last Updated**: August 2024 | **Version**: 2.0.0-alpha.73 | **Maintainers**: Claude Code Flow Team

**🚀 Ready to get started? Begin with the [Getting Started Guide](getting-started.md)!**