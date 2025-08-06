# Claude Code Zen - Project Brief

## Overview
Claude Code Zen is a sophisticated AI-driven development framework that enhances Claude Code with swarm coordination, design patterns, and multi-interface support. The project implements a hybrid architecture combining Elixir/OTP high-performance systems with TypeScript-based coordination layers.

## Key Components

### Core Architecture
- **MCP Integration**: Dual MCP architecture (HTTP + stdio) for Claude Desktop and Claude Code integration
- **Swarm Coordination**: Advanced multi-agent coordination with topology management (mesh, hierarchical, ring, star)
- **Design Patterns**: Six core design patterns implemented for distributed AI systems
- **Unified Architecture**: Four unified layers (DAL, UACL, USL, UEL) for consistent system access

### Major Features
1. **Multi-Interface System**
   - HTTP MCP Server (Port 3000) - Claude Desktop integration
   - Web Dashboard (Port 3456) - Real-time monitoring
   - Terminal UI - Interactive swarm control
   - CLI Interface - Direct command execution

2. **Document-Driven Development**
   - Vision → ADRs → PRDs → Epics → Features → Tasks → Code workflow
   - Template-based project initialization
   - Automated document processing and code generation

3. **Swarm Intelligence**
   - Neural network integration with ruv-FANN
   - Real-time coordination and agent management
   - Performance metrics and optimization
   - Memory persistence across sessions

4. **Testing Strategy**
   - Hybrid TDD approach (70% London + 30% Classical)
   - Component-based testing for distributed systems
   - Performance benchmarking and validation

## Current Status
- ✅ Complete source restructuring to domain-driven architecture
- ✅ Hooks architecture migration to Claude Code template system
- ✅ Dual MCP system implementation
- ✅ Design patterns implementation with comprehensive testing
- ✅ Unified architecture layers (DAL, UACL, USL, UEL)
- ✅ Document-driven development workflow

## Development Commands
- `claude-zen init <project>` - Initialize with templates
- `claude-zen mcp start` - Start HTTP MCP server
- `claude-zen web start` - Start web dashboard
- `claude-zen tui` - Interactive terminal interface
- `claude-zen workspace process <doc>` - Process vision documents

## Integration
The project integrates with the broader Singularity ecosystem, including Singularity Engine (Elixir/OTP) and provides templates and coordination for Claude Code enhanced development workflows.