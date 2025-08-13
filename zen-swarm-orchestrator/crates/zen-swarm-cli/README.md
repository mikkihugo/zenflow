# zen-swarm-cli

[![Crates.io](https://img.shields.io/crates/v/zen-swarm-cli)](https://crates.io/crates/zen-swarm-cli)
[![License: MIT OR Apache-2.0](https://img.shields.io/badge/license-MIT%20OR%20Apache--2.0-blue.svg)](https://github.com/ruv-fann/zen-swarm)
[![GitHub](https://img.shields.io/badge/github-ruv--fann/ruv--swarm-8da0cb?logo=github)](https://github.com/ruv-fann/zen-swarm)

**Distributed swarm orchestration CLI with cognitive diversity**

zen-swarm-cli is a powerful command-line interface for managing distributed AI agent swarms with support for multiple topologies, orchestration strategies, and real-time monitoring. Built with Rust for performance and reliability, it enables seamless coordination of intelligent agents across different computational paradigms.

## ✨ Key Features

- **🌐 Multi-Topology Support**: Deploy swarms in mesh, hierarchical, ring, star, or custom topologies
- **🤖 Intelligent Agent Management**: Spawn and coordinate specialized agents (researchers, coders, analysts, reviewers, orchestrators)
- **⚡ Real-Time Orchestration**: Execute distributed tasks with parallel, sequential, adaptive, or consensus strategies
- **📊 Live Monitoring**: Monitor swarm activity, performance metrics, and agent states in real-time
- **🎯 Cognitive Diversity**: Leverage different agent capabilities and reasoning patterns for optimal problem-solving
- **🛠️ Flexible Configuration**: Support for multiple persistence backends (SQLite, PostgreSQL, Redis, in-memory)
- **📈 Performance Benchmarking**: Built-in benchmarking tools for WASM, agent performance, and task execution
- **🎨 Rich Output Formats**: JSON, YAML, table, and colored terminal output with customizable formatting
- **🔧 Shell Integration**: Comprehensive shell completion support for Bash, Zsh, Fish, and PowerShell

## 🚀 Installation

### From Crates.io

```bash
cargo install zen-swarm-cli
```

### From Source

```bash
git clone https://github.com/ruv-fann/zen-swarm.git
cd zen-swarm/crates/zen-swarm-cli
cargo install --path .
```

### Pre-built Binaries

Download the latest release from [GitHub Releases](https://github.com/ruv-fann/zen-swarm/releases).

## 🎯 Quick Start

### Initialize a New Swarm

```bash
# Create a mesh topology swarm with SQLite persistence
zen-swarm init mesh --persistence sqlite

# Create a hierarchical swarm with interactive setup
zen-swarm init hierarchical

# Non-interactive setup with custom configuration
zen-swarm init star --config-file swarm-config.yaml --non-interactive
```

### Spawn Intelligent Agents

```bash
# Spawn a researcher agent
zen-swarm spawn researcher --name "research-lead" --capabilities "analysis,data-mining"

# Create a coder agent with specific memory context
zen-swarm spawn coder --memory "Focus on Rust development and performance optimization"

# Spawn an orchestrator for hierarchical coordination
zen-swarm spawn orchestrator --parent agent-123 --capabilities "coordination,planning"
```

### Orchestrate Distributed Tasks

```bash
# Parallel execution with real-time monitoring
zen-swarm orchestrate parallel "Analyze codebase performance bottlenecks" --watch --max-agents 5

# Sequential task with high priority and timeout
zen-swarm orchestrate sequential "Deploy microservices to production" --priority 9 --timeout 3600

# Adaptive orchestration for complex research tasks
zen-swarm orchestrate adaptive "Research emerging AI architectures and summarize findings" --max-agents 3
```

### Monitor Swarm Activity

```bash
# Real-time monitoring with 2-second refresh
zen-swarm monitor --interval 2

# Filter monitoring events and export to file
zen-swarm monitor --filter "task_completion,agent_spawn" --export monitoring-log.json

# Status overview with detailed metrics
zen-swarm status --detailed --metrics --active-only
```

## 📚 Complete CLI Reference

### Global Options

```bash
-c, --config <FILE>         Configuration file path [env: RUV_SWARM_CONFIG]
-p, --profile <PROFILE>     Profile to use (dev, prod, test) [default: dev]
-o, --output <FORMAT>       Output format (auto, json, yaml, table) [default: auto]
-v, --verbose               Enable verbose logging (use -vv for debug, -vvv for trace)
    --no-color              Disable color output
```

### Commands Overview

| Command | Description |
|---------|-------------|
| `init` | Initialize a new swarm with specified topology |
| `spawn` | Spawn a new agent in the swarm |
| `orchestrate` | Orchestrate a distributed task across the swarm |
| `status` | Show current swarm status and agent information |
| `monitor` | Monitor swarm activity in real-time |
| `completion` | Generate shell completions |

### `zen-swarm init`

Initialize a new swarm with the specified topology and configuration.

```bash
zen-swarm init <TOPOLOGY> [OPTIONS]

Arguments:
  <TOPOLOGY>  Swarm topology (mesh, hierarchical, ring, star, custom)

Options:
  -b, --persistence <BACKEND>     Persistence backend (memory, sqlite, postgres, redis)
  -f, --config-file <FILE>        Initial swarm configuration file
      --non-interactive           Skip interactive setup
```

**Examples:**
```bash
# Interactive mesh setup with default settings
zen-swarm init mesh

# Hierarchical swarm with PostgreSQL persistence
zen-swarm init hierarchical --persistence postgres

# Automated setup with custom configuration
zen-swarm init star --config-file production.yaml --non-interactive
```

### `zen-swarm spawn`

Create and deploy a new intelligent agent with specified capabilities.

```bash
zen-swarm spawn <AGENT_TYPE> [OPTIONS]

Arguments:
  <AGENT_TYPE>  Agent type (researcher, coder, analyst, reviewer, orchestrator)

Options:
  -a, --capabilities <LIST>  Agent capabilities (comma-separated)
  -n, --name <NAME>          Agent name (auto-generated if not provided)
  -m, --memory <CONTEXT>     Initial memory/context for the agent
  -P, --parent <AGENT_ID>    Parent agent ID for hierarchical topologies
```

**Agent Types:**
- **researcher**: Specialized in information gathering, analysis, and research tasks
- **coder**: Focused on software development, code review, and implementation
- **analyst**: Expert in data analysis, pattern recognition, and insights
- **reviewer**: Quality assurance, testing, and validation specialist
- **orchestrator**: Coordination and management of other agents

**Examples:**
```bash
# Basic researcher agent
zen-swarm spawn researcher

# Advanced coder with specific capabilities and context
zen-swarm spawn coder \
  --name "rust-specialist" \
  --capabilities "rust,performance,concurrency" \
  --memory "Focus on zero-copy optimizations and async patterns"

# Hierarchical analyst under orchestrator
zen-swarm spawn analyst --parent orchestrator-001 --capabilities "statistics,ml"
```

### `zen-swarm orchestrate`

Execute distributed tasks across the swarm using various orchestration strategies.

```bash
zen-swarm orchestrate <STRATEGY> <TASK> [OPTIONS]

Arguments:
  <STRATEGY>  Orchestration strategy (parallel, sequential, adaptive, consensus)
  <TASK>      Task description or task file path

Options:
  -m, --max-agents <N>      Maximum number of agents to use
  -t, --timeout <SECONDS>   Task timeout in seconds
  -r, --priority <1-10>     Priority level [default: 5]
  -w, --watch               Watch task progress in real-time
```

**Orchestration Strategies:**
- **parallel**: Execute task components simultaneously across multiple agents
- **sequential**: Execute task steps in order with agent coordination
- **adaptive**: Dynamically adjust strategy based on task complexity and agent availability
- **consensus**: Require agreement between multiple agents for decisions

**Examples:**
```bash
# Parallel code analysis with monitoring
zen-swarm orchestrate parallel "Analyze all Rust files for performance issues" \
  --max-agents 4 --watch

# High-priority sequential deployment
zen-swarm orchestrate sequential "Deploy application to production environment" \
  --priority 10 --timeout 1800

# Adaptive research with consensus validation
zen-swarm orchestrate adaptive "Research quantum computing frameworks" \
  --max-agents 3

# Execute task from file
zen-swarm orchestrate consensus @complex-analysis-task.yaml --watch
```

### `zen-swarm status`

Display comprehensive swarm status, agent information, and performance metrics.

```bash
zen-swarm status [OPTIONS]

Options:
  -d, --detailed              Show detailed agent information
  -t, --agent-type <TYPE>     Filter by agent type
  -a, --active-only           Show only active agents
  -m, --metrics               Include performance metrics
```

**Examples:**
```bash
# Basic status overview
zen-swarm status

# Detailed view with performance metrics
zen-swarm status --detailed --metrics

# Show only active coders
zen-swarm status --agent-type coder --active-only

# Full detailed report in JSON format
zen-swarm status --detailed --metrics --output json
```

### `zen-swarm monitor`

Real-time monitoring of swarm activity with filtering and export capabilities.

```bash
zen-swarm monitor [OPTIONS]

Options:
  -i, --interval <SECONDS>    Refresh interval [default: 1]
  -f, --filter <EVENTS>       Filter events by type
  -m, --max-events <N>        Maximum number of events to display [default: 100]
  -e, --export <FILE>         Export monitoring data to file
```

**Event Types:**
- `agent_spawn`, `agent_terminate`
- `task_start`, `task_progress`, `task_completion`
- `communication`, `coordination`
- `performance`, `error`, `warning`

**Examples:**
```bash
# Standard real-time monitoring
zen-swarm monitor

# High-frequency monitoring with task focus
zen-swarm monitor --interval 0.5 --filter "task_start,task_completion"

# Export monitoring session for analysis
zen-swarm monitor --export session-$(date +%Y%m%d-%H%M%S).json

# Monitor only errors and warnings
zen-swarm monitor --filter "error,warning" --max-events 50
```

### `zen-swarm completion`

Generate shell completion scripts for enhanced command-line experience.

```bash
zen-swarm completion <SHELL>

Arguments:
  <SHELL>  Shell to generate completions for (bash, zsh, fish, powershell)
```

**Setup Examples:**
```bash
# Bash
zen-swarm completion bash > ~/.local/share/bash-completion/completions/zen-swarm

# Zsh
zen-swarm completion zsh > ~/.zsh/completions/_zen-swarm

# Fish
zen-swarm completion fish > ~/.config/fish/completions/zen-swarm.fish

# PowerShell (Windows)
zen-swarm completion powershell > $PROFILE.CurrentUserAllHosts
```

## ⚙️ Configuration

zen-swarm-cli supports flexible configuration through YAML, TOML, or JSON files:

```yaml
# ~/.config/zen-swarm/config.yaml
profiles:
  dev:
    persistence:
      backend: "sqlite"
      connection: "./dev-swarm.db"
    monitoring:
      interval: 1
      max_events: 1000
    
  prod:
    persistence:
      backend: "postgres"
      connection: "postgresql://user:pass@localhost/swarm"
    monitoring:
      interval: 2
      max_events: 10000
    security:
      auth_required: true
      
topology:
  default: "mesh"
  max_agents: 10
  
agents:
  spawn_timeout: 30
  default_capabilities: ["reasoning", "communication"]
  
output:
  format: "auto"
  color: true
  timestamp: true
```

Environment variables:
- `RUV_SWARM_CONFIG`: Configuration file path
- `RUV_SWARM_PROFILE`: Active profile (dev, prod, test)
- `RUST_LOG`: Logging level configuration

## 🏗️ Architecture Integration

zen-swarm-cli integrates seamlessly with the broader rUv ecosystem:

- **zen-swarm-core**: Core swarm orchestration engine
- **zen-swarm-agents**: Intelligent agent implementations
- **ruv-FANN**: Neural network foundations for cognitive diversity
- **MCP Integration**: Model Context Protocol for AI model coordination

## 📈 Performance & Benchmarking

The CLI includes built-in performance tools accessible through the core API:

```bash
# Benchmark WASM performance
zen-swarm orchestrate adaptive "benchmark wasm performance with 1000 iterations"

# Agent performance analysis
zen-swarm orchestrate parallel "analyze agent response times and memory usage"

# Swarm coordination efficiency
zen-swarm orchestrate consensus "measure inter-agent communication latency"
```

## 🔧 Development & Contributing

### Building from Source

```bash
git clone https://github.com/ruv-fann/zen-swarm.git
cd zen-swarm/crates/zen-swarm-cli
cargo build --release
```

### Running Tests

```bash
cargo test
cargo test --features integration-tests
```

### Code Quality

```bash
cargo clippy --all-targets --all-features
cargo fmt --all
```

## 📋 Examples & Use Cases

### Research & Analysis Pipeline

```bash
# Initialize research swarm
zen-swarm init mesh --persistence sqlite

# Spawn specialized research team
zen-swarm spawn researcher --name "data-collector" --capabilities "web-scraping,apis"
zen-swarm spawn analyst --name "pattern-analyzer" --capabilities "statistics,ml"
zen-swarm spawn reviewer --name "quality-controller" --capabilities "validation,testing"

# Execute research pipeline
zen-swarm orchestrate sequential "Research market trends in quantum computing" --watch

# Monitor progress
zen-swarm monitor --filter "task_completion,research_findings"
```

### Software Development Workflow

```bash
# Development swarm setup
zen-swarm init hierarchical --persistence postgres

# Multi-role development team
zen-swarm spawn orchestrator --name "project-lead"
zen-swarm spawn coder --name "backend-dev" --capabilities "rust,apis,databases"
zen-swarm spawn coder --name "frontend-dev" --capabilities "typescript,react,ui"
zen-swarm spawn reviewer --name "qa-engineer" --capabilities "testing,security"

# Coordinated development task
zen-swarm orchestrate adaptive "Implement user authentication system with JWT tokens" \
  --max-agents 4 --priority 8 --watch

# Real-time development monitoring
zen-swarm monitor --interval 2 --export dev-session.json
```

## 🔗 Related Projects

- **[zen-swarm](https://github.com/ruv-fann/zen-swarm)** - Main repository with complete ecosystem
- **[ruv-FANN](https://github.com/ruv-fann/ruv-FANN)** - Neural network foundations
- **[MCP Protocol](https://modelcontextprotocol.io)** - Model Context Protocol specification

## 📄 License

This project is licensed under either of

- Apache License, Version 2.0, ([LICENSE-APACHE](LICENSE-APACHE) or http://www.apache.org/licenses/LICENSE-2.0)
- MIT license ([LICENSE-MIT](LICENSE-MIT) or http://opensource.org/licenses/MIT)

at your option.

## 🎯 Created by rUv

Developed with cognitive diversity principles and distributed intelligence paradigms.

---

**⭐ Star the project on [GitHub](https://github.com/ruv-fann/zen-swarm) | 📚 [Documentation](https://docs.rs/zen-swarm-cli) | 💬 [Discussions](https://github.com/ruv-fann/zen-swarm/discussions)**