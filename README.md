# Claude Code Zen 🚀

[![Version](https://img.shields.io/npm/v/@zen-ai/claude-code-zen)](https://www.npmjs.com/package/@zen-ai/claude-code-zen)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Enterprise AI Development Platform**

Advanced AI development platform with sophisticated agent coordination, multi-database persistence, enterprise workflow orchestration, and comprehensive web-based management interface.

## ✨ Features

- **🌐 Web-First Interface**: Comprehensive Svelte-based dashboard for enterprise AI development and management
- **🤖 Agent Coordination**: Sophisticated multi-agent orchestration with SAFe 6.0 and SPARC methodologies
- **📊 Enterprise Workflows**: TaskMaster, Teamwork coordination, and XState-powered workflow engines
- **💾 Multi-Database Architecture**: SQLite, LanceDB, and Kuzu graph database integration with connection pooling
- **🧠 Neural WASM Modules**: High-performance neural processing with Rust acceleration for heavy compute
- **📦 52+ Package Monorepo**: Comprehensive enterprise-grade component library with strict domain boundaries
- **⚡ Cross-Platform Deployment**: Self-contained executables (116MB each) for Linux, macOS, Windows
- **🔧 GitHub Integration**: Authentication and development workflow integration for CI/CD

> Note: A previously duplicated `@claude-zen/events` package was fully removed. All event mechanics and contracts now live exclusively in `@claude-zen/foundation`.

## 🚀 Quick Start (Development)

Prerequisites: Node.js 22.18.0+, pnpm 10.15.0+, Rust (stable, auto-installs for WASM). mise not required.

```bash
git clone https://github.com/mikkihugo/zenflow
cd zenflow
pnpm install                       # 2–3s
pnpm --filter @claude-zen/web-dashboard dev  # http://localhost:3000 (PRIMARY)
```

Production build (creates cross‑platform SEA binaries – NEVER CANCEL):
```bash
pnpm build   # 5–6 min
./dist/bundle/claude-zen-linux      # or -macos / -win.exe
```

## ✅ First Things To Do

- Read concise agent & development guardrails in `AGENTS.md` (deep version: `CLAUDE.md`)
- Start the web dashboard: `pnpm --filter @claude-zen/web-dashboard dev`
- Skim architecture docs in `docs/architecture/`
- Review API docs in `docs/api/`

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
pnpm type-check                             # TypeScript validation (completes; may show pre-existing errors)
# Run tests per-package only (monorepo test runner can OOM)
# Examples:
pnpm --filter @claude-zen/foundation test
pnpm --filter @claude-zen/coordination test
pnpm lint                                   # Code linting and formatting
```

### Performance Expectations

| Operation | Expected Time | Status |
|-----------|---------------|---------|
| `pnpm install` | 2-3 seconds | ✅ Works |
| `pnpm type-check` | ~25-30 seconds | ⚠️ Completes with known errors |
| `pnpm build` | 5-6 minutes | ✅ Produces SEA binaries (do not cancel) |
| Web dashboard dev | ~1 second | ✅ Works perfectly |
| Per-package tests | 3-5 seconds each | ⚠️ Run per-package only |

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

- Primary: Web dashboard (comprehensive enterprise interface)
- Secondary: MCP servers for tool integration (limited scope)
- Minimal: Terminal screens for basic status display only

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


## ✨ Highlights

- 🌐 Web-first dashboard (primary interface) — Svelte, starts in ~1s
- 🔔 Typed EventBus (from foundation) — single bus for all cross-package communication
- 🧠 Rust/WASM acceleration — heavy compute via gateway, never re-implemented in JS
- 🗄️ Multi-database — SQLite, LanceDB, Kuzu via backend-agnostic adapters
- 🧩 52+ package monorepo — strict domain boundaries, SEA binaries (~116MB)

## � Common Commands (Recap)

```bash
pnpm install                      # deps
pnpm type-check                   # may show existing errors
pnpm --filter @claude-zen/web-dashboard dev  # primary UI
pnpm build                        # full SEA build (5–6 min)
./build-wasm.sh                   # WASM only (1–2 min)
```

Artifacts:
 - dist/bundle/claude-zen-{linux|macos|win.exe}
 - dist/wasm/*

## 🏗️ Architecture at a glance

- 52+ packages across apps/, packages/{core,services,tools,integrations}
- Domain separation: coordination, neural, interfaces, memory, database
- Event-driven only: one typed EventBus from @claude-zen/foundation
- Backend-agnostic DB: adapters for SQLite/LanceDB/Kuzu
- Web-first: dashboard is the primary developer and operator interface

### Critical rules

- Use the single foundation EventBus for inter-package calls
- Allowed direct internal imports: `@claude-zen/foundation`, `@claude-zen/database`, `@claude-zen/neural-ml`
- LLM Provider exception: `@claude-zen/*-provider` packages may import each other for shared functionality
- All heavy compute must route through the Rust/WASM gateway
- Keep domain boundaries intact (no ad-hoc cross-domain helpers)

## 🌐 Web Dashboard

Start the dashboard and navigate to http://localhost:3000/.
Validate that VITE is ready and basic navigation works.

```bash
pnpm --filter @claude-zen/web-dashboard dev
```

## 🧪 Testing Policy

- Tests MUST live in `tests/` directories, never in `src/` or `__tests__/`
- `__tests__/` directories are forbidden (see AGENTS.md for details and migration tips)
- Run tests per-package only:

```bash
pnpm --filter @claude-zen/foundation test
pnpm --filter @claude-zen/coordination test
```

<!-- Consolidated into Testing Policy above -->

## 🧰 Daily development

```bash
pnpm install
pnpm type-check
pnpm --filter @claude-zen/web-dashboard dev
pnpm build
```

Linting and type-checking have pre-existing issues across the repo; fix only where you touch.

## ✅ Validation Checklist

1. Type-check completes (pre-existing errors allowed outside your changes)
2. Dashboard starts & navigates without console errors
3. Build (when needed) produces binaries
4. EventBus used for cross-package communication
5. Domain boundaries respected (no ad-hoc cross-domain helpers)

Event-driven enforcement and validators
- Cross-package calls must go through the single typed EventBus from @claude-zen/foundation
- Allowed direct internal imports: `@claude-zen/foundation`, `@claude-zen/database`, `@claude-zen/neural-ml`
- LLM Provider exception: `@claude-zen/*-provider` packages may import each other
- Pre-commit runs scripts/validate-imports.js and scripts/validate-dependencies.js to enforce this
- Server TaskMaster routes now proxy via the typed EventBus; no direct @claude-zen/coordination imports

## 🆘 Troubleshooting

If build fails:
- Check Node ≥ 22.18.0 and pnpm ≥ 10.15.0
- Clean install: remove node_modules + pnpm-lock.yaml, then pnpm install
- Build packages or WASM separately if needed

If tests OOM/fail: run per-package only.

## 📄 License

MIT — see LICENSE.

## 🤝 Contributing

1) Branch from main
2) Keep edits surgical and within domain boundaries
3) Prefer EventBus for cross-package work
4) Validate: type-check, build, dashboard smoke
5) Open a PR

## 📞 Support

- Issues: https://github.com/mikkihugo/zenflow/issues
- Docs: /docs (deep guidelines in `CLAUDE.md`)
- Quick guardrails: `AGENTS.md`

—

Claude Code Zen — event-driven, typed, and web-first. 🚀
