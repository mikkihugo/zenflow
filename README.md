# Claude Code Zen 🚀

[![Version](https://img.shields.io/npm/v/@zen-ai/claude-code-zen)](https://www.npmjs.com/package/@zen-ai/claude-code-zen)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Enterprise AI Development Platform**

Advanced AI development platform with sophisticated agent coordination, multi-database persistence, enterprise workflow orchestration, and comprehensive web-based management interface.

## ✨ Features

- **🌐 Web-First Interface**: Comprehensive Svelte-based dashboard for enterprise AI development
- **🤖 Agent Coordination**: Sophisticated multi-agent orchestration with SAFe 6.0 and SPARC methodologies  
- **📊 Enterprise Workflows**: TaskMaster, Teamwork coordination, and XState-powered workflow engines
- **💾 Multi-Database Architecture**: SQLite, LanceDB, and Kuzu graph database integration
- **🧠 Neural WASM Modules**: High-performance neural processing with Rust acceleration
- **📦 52+ Package Monorepo**: Comprehensive enterprise-grade component library
- **⚡ Cross-Platform Deployment**: Self-contained executables for Linux, macOS, Windows
- **🔧 GitHub Integration**: Authentication and development workflow integration

## 🚀 Quick Start

### Prerequisites

- **Node.js**: Version 22.18.0+ (required)
- **pnpm**: Version 10.15.0+ (required - npm will not work properly)
- **Rust**: Latest stable (for WASM modules)
  
Note: mise is not required for this repository. Use your system toolchain or asdf/volta if preferred.

### Development Setup

```bash
# Clone repository
git clone https://github.com/mikkihugo/zenflow
cd zenflow

# Install dependencies
pnpm install

# Start web dashboard (primary interface)
pnpm --filter @claude-zen/web-dashboard dev
# Access at: http://localhost:3000

# Or start both server and dashboard
pnpm dev
```

### Production Usage

```bash
# Build everything (creates cross-platform binaries)
pnpm build

# Run production binaries
./dist/bundle/claude-zen-linux
./dist/bundle/claude-zen-macos  
./dist/bundle/claude-zen-win.exe
```

## 🏗️ Architecture

**Enterprise AI Development Platform** with 52+ packages organized in strategic domains:

### Core Domains

- **🧠 Neural Domain**: WASM-accelerated neural networks and ML processing
- **🤝 Coordination Domain**: Multi-agent orchestration with enterprise methodologies
- **💾 Memory Domain**: Multi-backend caching and memory management systems  
- **🗄️ Database Domain**: Multi-adapter persistence (SQLite/LanceDB/Kuzu)
- **🌐 Interfaces Domain**: Web-first interface with limited MCP integration

### Enterprise Methodologies

- **SAFe 6.0 Framework**: Portfolio management and program increment planning
- **SPARC Development**: 5-phase systematic development methodology
- **Teamwork Coordination**: Multi-agent collaborative problem-solving
- **Workflow Orchestration**: XState-powered process automation
- **TaskMaster Management**: SOC2-compliant task flow with approval gates

### Multi-Database Architecture

- **SQLite**: Structured relational data and agent state persistence
- **LanceDB**: Vector embeddings and similarity search capabilities
- **Kuzu**: Graph database for complex relationship modeling
- **Connection pooling**: Efficient resource management across all backends

## 🔧 Development

### Core Development Commands

```bash
# Development servers
pnpm dev                                    # Start both server and dashboard
pnpm --filter @claude-zen/web-dashboard dev # Web dashboard only (recommended)

# Build system  
pnpm build                                  # Build all packages and create binaries
pnpm run build:packages                     # Build packages individually
pnpm run build:rust                         # Build WASM modules

# Quality assurance
pnpm type-check                             # TypeScript validation (fastest)
pnpm test                                   # Run test suites
pnpm lint                                   # Code linting and formatting
```

### Performance Expectations

| Operation | Expected Time | Status |
|-----------|---------------|---------|
| `pnpm install` | 2-20 seconds | ✅ Works |
| `pnpm type-check` | 1-2 seconds | ✅ Works |
| `pnpm build` | 1-2 minutes | ✅ Works |
| Web dashboard dev | 5-10 seconds | ✅ Works perfectly |
| `pnpm test` | 15+ minutes | ⚠️ Memory constraints |

### Repository Structure

```
zenflow/
├── apps/
│   ├── claude-code-zen-server/    # Main server application
│   └── web-dashboard/             # Svelte web interface (primary)
├── packages/
│   ├── core/                      # Foundation, database, memory systems
│   ├── services/                  # Coordination, brain, monitoring
│   ├── tools/                     # Development and analysis tools
│   └── integrations/              # External system integrations
└── src/                           # Domain implementations
    ├── coordination/              # Agent coordination systems
    ├── neural/                    # Neural networks and WASM
    ├── interfaces/                # MCP and web interfaces  
    └── database/                  # Database adapters and management
```

## 🌐 Web Interface

**Primary Interface**: Web-based dashboard at `http://localhost:3000`

### Dashboard Features

- **Real-time System Monitoring**: Performance metrics and health tracking
- **Agent Coordination**: Multi-agent orchestration and management
- **SAFe 6.0 Planning**: Portfolio and program increment visualization  
- **SPARC Development**: 5-phase development progress tracking
- **Database Management**: Multi-backend database monitoring and control
- **Workflow Orchestration**: XState process visualization and management
- **TaskMaster Interface**: Enterprise task flow and approval management

### Interface Domains

- **Primary**: Web dashboard (comprehensive enterprise interface)
- **Secondary**: MCP servers for tool integration (limited scope)
- **Minimal**: Terminal screens for basic status display only

## 🤖 Agent Coordination

### Agent System

The platform supports **flexible agent types** without arbitrary restrictions:

- **Dynamic Agent Types**: Agent types are configurable strings, not limited to predefined sets
- **Capability-Based Selection**: Agents selected based on capabilities and specialization
- **Enterprise Methodologies**: SAFe 6.0 and SPARC frameworks guide coordination
- **Multi-Agent Collaboration**: Teamwork orchestration with shared memory and decision-making

### Coordination Frameworks

- **SAFe 6.0**: Enterprise portfolio planning and program increment coordination
- **SPARC**: 5-phase systematic development (Specification → Completion)
- **Teamwork**: Multi-agent collaborative problem-solving
- **Workflows**: XState-powered process orchestration
- **TaskMaster**: SOC2-compliant enterprise task management

## 📊 Performance & Enterprise Features

### Production Readiness

- **Cross-Platform Binaries**: Self-contained executables (116MB each)
- **Zero Dependencies**: Complete bundling with no external requirements
- **Enterprise Scaling**: Supports 1000+ concurrent agents and 10,000+ tasks/minute
- **Multi-Database Performance**: Optimized for SQLite, LanceDB, and Kuzu backends
- **WASM Acceleration**: Rust-powered neural processing for performance-critical operations

### Compliance & Enterprise

- **SOC2 Compliance**: TaskMaster provides audit trails and approval workflows
- **Enterprise Workflows**: SAFe 6.0 portfolio management and program increments
- **Quality Gates**: SPARC methodology ensures systematic development quality
- **Multi-Stakeholder Approval**: Human and AI reviewer coordination systems
- **Risk Management**: Advanced approval gates with escalation procedures

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the domain separation principles
4. Run quality checks (`pnpm type-check && pnpm build`)
5. Test web dashboard functionality (`pnpm --filter @claude-zen/web-dashboard dev`)
6. Submit a pull request

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/mikkihugo/zenflow/issues)
- **Documentation**: See `/docs` directory and `CLAUDE.md`
- **Agent Guidelines**: See `AGENTS.md` for development practices
- **Web Dashboard**: Primary interface at `http://localhost:3000`

---

**Claude Code Zen** - Enterprise AI development platform with sophisticated coordination, multi-database architecture, and comprehensive web-based management. 🚀
