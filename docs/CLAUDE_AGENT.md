# Claude Code Agent Constitution for Autonomous Development

## 1. Project Context

**Claude-Code-Zen** is an advanced AI development platform with sophisticated agent coordination, neural networks, and MCP integration. This repository implements a domain-driven architecture with 147+ specialized agent types across 16 categories.

**Your Mission**: Autonomously solve GitHub issues by implementing complete, high-quality solutions that adhere to the established architecture and coding standards.

## 2. Architectural Understanding

### Domain-Driven Structure (CRITICAL)

Respect these domain boundaries strictly:

```
src/
├── coordination/     # Agent coordination, swarm management, orchestration
├── neural/          # Neural networks, WASM acceleration, fact-core integration
├── interfaces/      # API, CLI, MCP servers, web dashboard, terminal UI
├── memory/          # Memory stores, persistence, caching strategies
├── database/        # Database abstraction, vector storage, pooling
├── core/           # Core system functionality and utilities
├── intelligence/   # AI/ML capabilities and intelligent load balancing
└── workflows/      # Workflow execution and automation systems
```

**NEVER mix domain concerns**. Coordination code stays in coordination/, neural code in neural/, etc.

### Agent System (147+ Types)

- **Use existing agent types** from `src/types/agent-types.ts`
- **Never create generic agent implementations**
- **Follow fine-grained specialization patterns**
- **Leverage existing swarm intelligence capabilities**

## 3. Implementation Standards

### Technology Stack Requirements

- **TypeScript 5.x** with strict mode enabled
- **Node.js 22.x** for backend services
- **React + TypeScript** for interface components
- **Rust/WASM** for neural computations (fact-core)
- **Performance Rule**: `always_use_wasm_for_heavy_computation`

### Code Quality Gates

- **Zero ESLint errors** required
- **Prettier formatting** using repository config
- **JSDoc documentation** for all exported functions/classes
- **No `any` types** unless absolutely necessary
- **85% test coverage minimum**

### Testing Strategy (Hybrid TDD)

- **London TDD (70%)**: For interactions, protocols, coordination, integration boundaries
- **Classical TDD (30%)**: For algorithms, neural networks, mathematical computations
- **Co-located test files** using `*.test.ts` or `*.test.tsx`

## 4. Performance Requirements

### Critical Benchmarks

- **Coordination latency**: < 100ms
- **API response time**: < 50ms
- **Neural computations**: Must use WASM
- **Concurrent agents**: Support > 1000
- **MCP tool execution**: < 10ms

### Memory and Database

- **Multi-backend**: sqlite, lancedb, json
- **Connection pooling**: Required for all database operations
- **Caching strategies**: Multi-layer approach
- **Vector operations**: Use pgvector for advanced features

## 5. MCP Protocol Integration

### Dual MCP Architecture

- **HTTP MCP (Port 3000)**: Claude Desktop integration
- **Stdio MCP**: Internal swarm coordination
- **Protocol compliance**: Follow established MCP patterns
- **Tool categories**: Coordination, monitoring, memory, GitHub integration

### Integration Requirements

- **Respect existing MCP tools**
- **Follow stdio protocol for internal coordination**
- **Maintain HTTP endpoints for external integration**

## 6. Security and Safety Rules

### Absolute Prohibitions

- **No hardcoded secrets**: Never embed API keys, tokens, or credentials
- **No force operations**: Never use `git push --force` or destructive commands
- **No dependency changes**: Unless explicitly required by the issue
- **No domain boundary violations**: Keep concerns properly separated

### Required Practices

- **Validate all inputs**
- **Sanitize all outputs**
- **Use least privilege principles**
- **Follow secure coding practices**

## 7. Neural Network and WASM Integration

### WASM Requirements (CRITICAL)

- **fact-core module**: Use for all neural acceleration
- **Performance validation**: Ensure WASM modules meet benchmarks
- **Memory management**: Efficient JavaScript/WASM bridge
- **Computation rule**: Heavy calculations MUST use WASM

### Neural Standards

- **Established patterns**: Follow existing neural domain conventions
- **Continuous learning**: Support agent coordination improvements
- **Accuracy metrics**: Implement proper model performance tracking

## 8. Development Workflow

### Issue Resolution Process

1. **Analyze**: Read issue thoroughly, understand requirements
2. **Plan**: Create detailed implementation plan with file changes
3. **Research**: Use sub-agents to understand existing implementations
4. **Design**: Respect domain boundaries and existing patterns
5. **Implement**: Follow hybrid TDD approach (70% London + 30% Classical)
6. **Test**: Ensure comprehensive coverage and performance
7. **Validate**: Run all quality gates (linting, building, testing)
8. **Document**: Update relevant documentation
9. **Pull Request**: Create clear PR with implementation summary

### Quality Validation Checklist

- [ ] All tests pass
- [ ] ESLint passes with zero errors
- [ ] Prettier formatting applied
- [ ] TypeScript compilation succeeds
- [ ] Performance benchmarks maintained
- [ ] Domain boundaries respected
- [ ] No hardcoded secrets introduced
- [ ] Documentation updated if needed

## 9. Sub-Agent Usage Guidelines

### When to Use Sub-Agents

- **Research existing implementations** before making changes
- **Understand utility functions** and their purposes
- **Verify compatibility** with existing codebase
- **Analyze dependencies** and architectural constraints

### Sub-Agent Patterns

```bash
# Research existing patterns
"Use a sub-agent to analyze the existing MCP server implementation in src/interfaces/mcp/ and provide a summary of the current architecture."

# Understand dependencies
"Use a sub-agent to read src/types/agent-types.ts and explain the existing agent type system before implementing new agent functionality."

# Verify compatibility
"Use a sub-agent to examine the neural domain structure and ensure my WASM integration follows established patterns."
```

## 10. Error Handling and Recovery

### Graceful Failure Patterns

- **Detailed error messages**: Explain what went wrong and why
- **Recovery suggestions**: Provide actionable next steps
- **Context preservation**: Maintain state for debugging
- **Clean rollback**: Undo partial changes if implementation fails

### Communication Standards

- **Clear commit messages**: Explain the change and its purpose
- **Detailed PR descriptions**: Include implementation approach and testing
- **Issue comments**: Provide progress updates and clarification requests
- **Code comments**: Explain complex logic and architectural decisions

## 11. Advanced Coordination

### Swarm Intelligence Integration

- **Use established swarm patterns** for multi-agent coordination
- **Leverage MCP protocols** for agent communication
- **Maintain persistent state** across agent interactions
- **Optimize for concurrent execution** (>1000 agents)

### Memory and State Management

- **Cross-session persistence**: Use established memory patterns
- **State coordination**: Follow swarm coordination protocols
- **Context preservation**: Maintain agent interaction history
- **Performance optimization**: Use intelligent caching strategies

## 12. Success Criteria

### Definition of "Fully Solved"

- **Complete implementation**: All requirements from issue addressed
- **Quality gates passed**: All tests, linting, building successful
- **Performance maintained**: Benchmarks not degraded
- **Architecture respected**: Domain boundaries and patterns followed
- **Documentation complete**: Relevant docs updated
- **No regressions**: Existing functionality unaffected

### Pull Request Standards

- **Clear title**: Summarizes the change
- **Detailed description**: Explains approach and implementation
- **Testing evidence**: Shows quality gates passed
- **Breaking changes**: Explicitly called out if any
- **Related issues**: Linked to triggering issue

---

**Remember**: You are implementing solutions for a sophisticated, production-grade AI platform. Maintain the highest standards, leverage the comprehensive systems already in place, and respect the domain-driven architecture that enables advanced agent coordination capabilities.

**Your success is measured by**: Complete issue resolution + Code quality + Architectural compliance + Performance maintenance + Team integration.
