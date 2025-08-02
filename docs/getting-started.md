# Getting Started with Claude Zen Flow

**Quick start guide to get you up and running with the AI swarm orchestration platform.**

## 🚀 **Quick Installation**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Git

### **Global Installation**
```bash
# Install Claude Zen Flow globally
npm install -g claude-code-zen

# Verify installation
claude-zen --version
```

### **Local Development Setup**
```bash
# Clone repository
git clone https://github.com/ruvnet/claude-zen-flow.git
cd claude-zen-flow

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

## 🎯 **First Steps**

### **1. Initialize Your First Project**
```bash
# Create a new project with advanced template
claude-zen workspace init my-ai-project --template=advanced

# Navigate to project
cd my-ai-project

# Explore the generated structure
ls -la
```

**Generated Structure:**
```
my-ai-project/
├── docs/                    # Document-driven development
│   ├── 01-vision/          # Strategic vision documents
│   ├── 02-adrs/           # Architecture decisions
│   ├── 03-prds/           # Product requirements
│   ├── 04-epics/          # Feature epics
│   ├── 05-features/       # Individual features
│   ├── 06-tasks/          # Implementation tasks
│   └── templates/         # Document templates
├── src/                   # Source code
├── tests/                 # Test suites
├── .claude/              # Claude Code integration
│   ├── settings.json     # Development hooks
│   └── commands/         # Custom commands
└── package.json          # Project configuration
```

### **2. Start the Multi-Interface System**

**Start all interfaces in parallel:**
```bash
# HTTP MCP server for Claude Desktop (port 3000)
claude-zen mcp start &

# Web dashboard with real-time monitoring (port 3456)
claude-zen web start --daemon &

# Add Stdio MCP server to Claude Code
claude mcp add claude-zen-swarm npx claude-zen swarm mcp start
```

### **3. Verify System Status**
```bash
# Check overall system status
claude-zen status

# Check specific components
claude-zen mcp status
claude-zen swarm status
```

## 🖥️ **Interface Overview**

### **1. Command Line Interface (CLI)**
**Direct command execution and scripting:**
```bash
# Basic commands
claude-zen init project-name
claude-zen status --format json
claude-zen swarm init --topology mesh --agents 5

# Document processing
claude-zen workspace process docs/vision/product-vision.md
claude-zen workspace implement docs/features/authentication.md
```

### **2. Web Dashboard** 
**Browser-based real-time monitoring:**
- **URL**: http://localhost:3456
- **Features**: Real-time swarm monitoring, task management, system health
- **API**: RESTful endpoints for programmatic access
- **WebSocket**: Live updates without page refresh

**Key Features:**
- 📊 System status and health monitoring
- 🐝 Active swarm visualization
- ✅ Task progress tracking
- 🔗 API endpoint testing
- ⚙️ Configuration management

### **3. Terminal UI (TUI)**
**Interactive terminal interface:**
```bash
# Start interactive terminal interface
claude-zen tui

# Navigate modes
claude-zen tui --mode swarm-overview
claude-zen tui --mode task-manager
claude-zen tui --mode system-monitor
```

### **4. Claude Desktop Integration**
**AI-assisted development via HTTP MCP:**

**Setup Steps:**
1. Ensure HTTP MCP server is running: `claude-zen mcp start`
2. Add to Claude Desktop configuration:

```json
// Claude Desktop MCP configuration
{
  "mcpServers": {
    "claude-zen": {
      "command": "npx",
      "args": ["claude-zen", "mcp", "start"]
    }
  }
}
```

## 🧠 **Your First AI Swarm**

### **1. Initialize a Basic Swarm**
```bash
# Create a mesh topology swarm with 4 agents
claude-zen swarm init --topology mesh --agents 4

# Check swarm status
claude-zen swarm status
```

### **2. Create and Execute a Task**
```bash
# Create a new task for the swarm
claude-zen task create "Analyze project structure" --priority high

# Monitor task progress
claude-zen task status

# View task results
claude-zen task results
```

### **3. Use Document-Driven Development**
```bash
# Create a vision document
claude-zen create vision "AI-Powered Code Assistant"

# Process vision into actionable tasks
claude-zen workspace process docs/01-vision/ai-powered-code-assistant.md

# Monitor processing progress
claude-zen workspace status
```

## 📊 **Monitoring and Debugging**

### **System Health Check**
```bash
# Comprehensive health check
claude-zen status --detailed

# Component-specific checks
claude-zen mcp health
claude-zen swarm health
claude-zen web health
```

### **Logs and Troubleshooting**
```bash
# View system logs
claude-zen logs

# View specific component logs
claude-zen logs --component swarm
claude-zen logs --component mcp
claude-zen logs --component web

# Debug mode
claude-zen --debug status
```

## 🎯 **Common Workflows**

### **Development Workflow**
1. **Plan**: Create vision and PRD documents
2. **Architect**: Generate ADRs for technical decisions
3. **Implement**: Use swarms to coordinate development
4. **Test**: Automated testing with swarm coordination
5. **Deploy**: Continuous integration with GitHub Actions

### **AI-Assisted Workflow**
1. **Claude Desktop**: High-level planning and architecture
2. **Claude Code**: Detailed implementation with swarm coordination
3. **Web Dashboard**: Real-time monitoring and control
4. **CLI/TUI**: Direct control and automation

## ⚡ **Performance Tips**

### **Optimize Swarm Performance**
- **Topology Selection**: Use `mesh` for exploration, `hierarchical` for coordination
- **Agent Count**: Start with 4-6 agents, scale based on task complexity
- **Memory Usage**: Enable persistent memory for complex projects
- **Parallel Execution**: Always batch operations for maximum efficiency

### **System Performance**
- **Resource Monitoring**: Use web dashboard for real-time resource tracking
- **Cache Optimization**: Enable intelligent caching for repeated operations
- **Network Optimization**: Use local MCP servers when possible

## 🆘 **Getting Help**

### **Documentation**
- **Full Documentation**: [docs/README.md](README.md)
- **CLI Reference**: [cli-reference.md](cli-reference.md)
- **API Documentation**: [api/README.md](api/README.md)
- **Troubleshooting**: [troubleshooting.md](troubleshooting.md)

### **Community & Support**
- **GitHub Issues**: https://github.com/ruvnet/claude-zen-flow/issues
- **Discussions**: https://github.com/ruvnet/claude-zen-flow/discussions
- **Documentation**: https://docs.anthropic.com/en/docs/claude-code

### **Quick Commands Reference**
```bash
# System management
claude-zen status                    # System status
claude-zen --help                   # Command help

# Project management  
claude-zen workspace init <name>    # Initialize project
claude-zen workspace status         # Project status

# Swarm management
claude-zen swarm init               # Initialize swarm
claude-zen swarm status             # Swarm status
claude-zen task create <desc>       # Create task

# Interface management
claude-zen mcp start                # Start HTTP MCP server
claude-zen web start               # Start web dashboard
claude-zen tui                     # Start terminal UI
```

## 🎉 **Next Steps**

Now that you have Claude Zen Flow running:

1. **Explore Examples**: Check out [examples/README.md](examples/README.md)
2. **Read User Guide**: Comprehensive feature walkthrough in [user-guide.md](user-guide.md)
3. **Understand Architecture**: System design in [architecture/README.md](architecture/README.md)
4. **Contribute**: Development guide in [development/README.md](development/README.md)

**Happy coding with AI swarm orchestration! 🐝🤖**