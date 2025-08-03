# claude-code-zen - Development Instructions

## Project Overview
Advanced AI development platform with sophisticated agent coordination, neural networks, and MCP integration

**Mission**: Enable autonomous AI-driven development through comprehensive agent coordination and intelligent tooling

## 📋 Document-Driven Development System
**IMPORTANT**: This project uses a **dynamic document-driven system**, not static file structures.

### Document Management
- **System**: `src/core/document-driven-system.ts` - TypeScript-based document processor
- **Storage**: Documents stored in memory/database backends (SQLite, LanceDB, JSON)
- **Templates**: Dynamic template generation, not static template files
- **Workflow**: Vision → ADRs → PRDs → Epics → Features → Tasks → Code

### Document Types & Storage
```
DYNAMIC STRUCTURE (managed by TypeScript system):
docs/01-vision/     ← Strategic vision documents (database-backed)
docs/02-adrs/       ← Architecture Decision Records (database-backed)
docs/03-prds/       ← Product Requirements Documents (database-backed)
docs/04-epics/      ← Epic-level feature sets (database-backed)
docs/05-features/   ← Individual features (database-backed)
docs/06-tasks/      ← Implementation tasks (database-backed)
docs/07-specs/      ← Technical specifications (database-backed)
```

### Document Processing
- **Processor**: `DocumentDrivenSystem` class handles all document operations
- **Metadata**: Extracted and stored in memory/database systems
- **Workflow**: Automatic progression through document types
- **Integration**: Seamless integration with agent coordination and swarm systems

## Architecture
- **Pattern**: domain-driven
- **Principles**: SOLID, 
Clean Architecture, 
Domain Boundaries, 
Performance Optimization, 

## Key Technologies

- **Backend**: TypeScript with Node.js 20+
- **Package Manager**: npm



- **Frontend**: React with TypeScript



- **Neural Acceleration**: Rust/WASM with fact-core
- **Performance Rule**: always_use_wasm_for_heavy_computation


## Agent System
- **Total Agent Types**: 147+ across 16 categories
- **Specialization**: fine-grained task assignment
- **Coordination**: Advanced swarm intelligence patterns

## Domain Structure
```
src/
├── coordination/

├── neural/

├── interfaces/

├── memory/

├── database/

├── core/

├── intelligence/

├── workflows/

```

## Testing Strategy
- **Approach**: hybrid-tdd
- **London TDD**: 70% (interactions, protocols, coordination)
- **Classical TDD**: 30% (algorithms, neural networks, computations)
- **Coverage Target**: 85%

## MCP Integration
- **External MCP Tools**: Integration with research and development tools

- **Protocol Support**: HTTP and SSE endpoints for external services


## Performance Requirements

- coordination_latency < 100ms


- neural_computation_uses_wasm


- api_response < 50ms


- concurrent_agents > 1000


- mcp_tool_execution < 10ms


## Development Guidelines

### Architectural Constraints

- Use existing 147 agent types, don't create generic implementations

- Follow domain-driven structure in src/

- Use WASM for performance-critical neural computations

- Maintain hybrid TDD approach (70% London, 30% Classical)

- Respect MCP protocol patterns for tool integration

### Document-Driven Development Rules

- **NO static docs folders**: Documents are managed dynamically by `DocumentDrivenSystem`

- **Database-first**: All documents stored in memory/database backends (Issue #63 implementation)

- **Template system**: Use `src/core/document-driven-system.ts` for document generation

- **Workflow automation**: Vision → ADRs → PRDs → Epics → Features → Tasks → Code progression

- **Integration patterns**: Documents integrate with swarm coordination and agent systems


### Performance Requirements

- Sub-100ms coordination overhead


- WASM acceleration for neural operations


- Efficient resource utilization through pooling


- Real-time updates via WebSocket connections


## Build Commands
```bash
npm ci
npm run build
npm test
npm run lint
npm run mcp:start
```

## Document System Commands
```bash
# Document-driven development (dynamic system)
claude-zen workspace init <project>           # Initialize document workspace
claude-zen workspace process <doc.md>         # Process vision/ADR/PRD documents  
claude-zen document create vision <title>     # Create vision document in database
claude-zen document create adr <title>        # Create ADR in database
claude-zen document create prd <title>        # Create PRD in database
claude-zen workflow status                    # Check document workflow progress
```

## Memory System
- **Backends**: sqlite, 
lancedb, 
json, 
- **Features**: Connection pooling, multi-backend abstraction, caching


## WASM Integration
- **Rust Core**: fact-core
- **Performance**: Always use WASM for heavy neural computations
- **Bindings**: JavaScript/WASM bridge with proper memory management


## Validation Rules

- **domain_boundaries**: Ensure coordination code doesn't mix with neural code

- **agent_type_usage**: Use existing AgentType union, don't create generic types

- **wasm_performance**: Use WASM for computational tasks in neural domain

- **testing_strategy**: Follow hybrid TDD approach

- **document_system**: Use `DocumentDrivenSystem` class, not static file structure

- **database_first**: Store documents in memory/database backends from Issue #63

- **workflow_integration**: Documents must integrate with swarm coordination


This is a sophisticated, production-grade AI platform. Maintain high standards and leverage the comprehensive systems already in place.

## MCP Integration for Research and Development

### External MCP Servers for Research
The project is configured with several external MCP servers for enhanced research capabilities:

- **Context7** (`https://mcp.context7.com/mcp`): Research and analysis tools
- **DeepWiki** (`https://mcp.deepwiki.com/sse`): Knowledge base and research tools  
- **GitMCP** (`https://gitmcp.io/docs`): Git operations and repository management
- **Semgrep** (`https://mcp.semgrep.ai/sse`): Code analysis and security scanning

### Using MCP Tools for Research
When working on code analysis, research, or development tasks:
1. Use **Context7** tools for in-depth research and analysis
2. Leverage **DeepWiki** for knowledge base queries and documentation research
3. Utilize **GitMCP** for repository analysis and git-related operations
4. Apply **Semgrep** tools for security analysis and code quality checks

### GitHub Copilot Optimization
This setup follows GitHub's recommendations for optimal copilot coding agent configuration:
- Reference: https://github.blog/ai-and-ml/github-copilot/onboarding-your-ai-peer-programmer-setting-up-github-copilot-coding-agent-for-success/
- Comprehensive project context through domain-specific instructions
- Performance benchmarks and quality gates
- Clear architectural constraints and patterns
- Integrated MCP tools for enhanced capabilities