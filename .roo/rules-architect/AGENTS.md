# Architect Mode Guidelines for Claude Code Zen

## 🛡️ Functionality Preservation Guidelines

### Critical Distinction: "Compiles" vs "Compiles AND Works"

**ENTERPRISE REQUIREMENT**: All architectural changes must prioritize **functionality preservation over compilation-only fixes**. The goal is **"compiles AND works"** - not just **"compiles"**.

#### Enterprise Implications

- **NEVER use bulk file replacements that lose functionality**
- **ALWAYS require manual verification of AI-generated changes**
- **PRIORITIZE functionality preservation over compilation-only fixes**
- **REQUIRE unit tests to validate intended behavior preservation**
- **INCLUDE TaskMaster approval for major AI-assisted changes**

#### Approval Workflows

- All production deployments require TaskMaster approval workflows with audit trails.
- Major architectural changes require ADR documentation in `docs/architecture/` and review by the enterprise architecture team.

## 🔍 Research Patterns for Architectural Decisions

### Context7 Architectural Research
```typescript
// Research architectural patterns and best practices
// Use Context7 to find:
// - Domain-driven design patterns and anti-patterns
// - Multi-database architecture strategies
// - Event-driven architecture implementations
// - Performance optimization techniques for enterprise systems
```

### SequentialThinking for Design Analysis
```typescript
// Multi-step architectural design workflow:
// 1. Analyze requirements and constraints
// 2. Research architectural patterns and technologies
// 3. Evaluate design options against project requirements
// 4. Create architectural prototypes and proofs of concept
// 5. Validate design against scalability and performance goals
// 6. Document architectural decisions and trade-offs
```

### Research-Driven Architectural Scenarios

**Database Architecture Decisions:**
- **Context7**: Research multi-database patterns (SQLite/LanceDB/Kuzu) and their use cases
- **SequentialThinking**: Analyze data access patterns and choose appropriate database technology
- **Integration**: Use project-research mode to understand existing database implementations

**Domain Boundary Design:**
- **Context7**: Research domain-driven design principles and bounded context patterns
- **SequentialThinking**: Evaluate domain separation impacts on system maintainability
- **Integration**: Analyze cross-domain communication patterns in existing codebase

**Performance Architecture:**
- **Context7**: Research WASM performance optimization and Rust integration patterns
- **SequentialThinking**: Design performance-critical paths and optimization strategies
- **Integration**: Investigate existing performance bottlenecks and optimization opportunities

**Event System Architecture:**
- **Context7**: Research event-driven architecture patterns and message queuing systems
- **SequentialThinking**: Design event flow and correlation ID strategies
- **Integration**: Analyze existing event system implementations and scalability

### Tool Selection Criteria

**Use Context7 when:**
- Researching architectural patterns and best practices
- Investigating technology choices and their trade-offs
- Finding implementation examples for complex architectural patterns
- Understanding enterprise architecture frameworks (SAFe, SPARC)

**Use SequentialThinking when:**
- Complex architectural design requiring systematic evaluation
- Making technology stack decisions with multiple constraints
- Designing scalable systems with performance requirements
- Creating architectural proofs of concept and prototypes

**Switch to project-research mode when:**
- Architectural decisions require deep understanding of existing codebase
- Investigating integration points between multiple domains
- Analyzing historical architectural decisions and their evolution
- Researching system-wide patterns and anti-patterns

## 🏗️ Architecture-Specific Patterns

### Multi-Database Backend Selection Logic

When designing data persistence layers, follow this decision tree:

- **SQLite**: Default choice for structured data, agent state, and relational schemas
- **LanceDB**: Use for vector embeddings, similarity search, and ML feature storage
- **Kuzu**: Reserve for complex graph relationships and network analysis

**Non-obvious constraint**: All database code must remain backend-agnostic using adapters. Direct database imports are forbidden.

### Domain Boundary Enforcement

**Critical**: Never mix these domain responsibilities:

- **Coordination Domain** (`src/coordination/`): Multi-agent orchestration, SAFe/SPARC methodologies
- **Neural Domain** (`src/neural/`): WASM-accelerated ML processing (Rust gateway required)
- **Interfaces Domain** (`src/interfaces/`): Web-first UI, limited MCP/CLI secondary interfaces
- **Memory/Database Domains**: Keep separate - memory for caching, database for persistence

**Hidden coupling trap**: Event system spans domains but must maintain boundaries.

### WASM Performance Routing

**Mandatory pattern**: All heavy computation must route through WASM:

```typescript
// ❌ WRONG - Direct JS math operations
const result = heavyMathematicalComputation(input);

// ✅ CORRECT - Route through WASM gateway
import { neural_forward_pass } from 'src/neural/wasm/gateway';
const result = await neural_forward_pass(weights, input);
```

**Performance threshold**: Any operation >100μs should use WASM acceleration.

## 📋 Enterprise Methodology Integration

### SAFe 6.0 Program Increment Planning

**Non-obvious requirement**: All features must map to Program Increments with:
- Business value quantification
- Architecture runway readiness
- Risk mitigation strategies
- Cross-team dependency mapping

### SPARC 5-Phase Development

**Hidden complexity**: Each phase requires specific artifacts:
1. **Specification**: Acceptance criteria + edge case documentation
2. **Pseudocode**: Algorithm design with complexity analysis
3. **Architecture**: System design with scalability proofs
4. **Refinement**: Performance optimization with benchmarks
5. **Completion**: Test coverage + documentation completeness

## 🔧 Technical Architecture Constraints

### 3-Tier Import Architecture

**Tier 1 (Public API)**: Only `@claude-zen/foundation` and direct package imports allowed
**Tier 2 (Internal)**: Private packages with `"private": true`
**Tier 3 (Deep Internal)**: Ultra-restricted, only accessible by specific Tier 2 packages

**Architectural debt**: Breaking tier boundaries requires formal RFC process.

### Event-Driven Architecture Patterns

**Critical pattern**: All cross-domain communication uses `TypedEventBase`:

```typescript
// ✅ CORRECT - Typed event communication
import { TypedEventBase } from '@claude-zen/foundation';

const eventSystem = new TypedEventBase<DomainEvents>();
await eventSystem.emit('coordination:agent:ready', agentData);
```

**Anti-pattern**: Direct function calls across domain boundaries.

## ⚡ Performance Architecture

### Memory Management Strategy

**Dual system approach**:
- **Foundation Memory**: Short-term caching and session state
- **Database Layer**: Persistent storage with connection pooling

**Non-obvious optimization**: Use lazy loading for all package imports to minimize startup time.

### Build System Architecture

**4-stage build process**:
1. **Package compilation**: Individual TypeScript compilation
2. **WASM compilation**: Rust modules for neural acceleration
3. **Bundle creation**: NCC packaging for single executables
4. **Binary generation**: Cross-platform executable creation

**Critical timing**: Never cancel builds - they can take 5-6 minutes for full optimization.

## 🔒 Security Architecture

### AI Safety Integration

**Mandatory**: All agent interactions must route through AI safety monitoring:

```typescript
import { AISafetyMonitor } from '@claude-zen/ai-safety';

const monitor = new AISafetyMonitor();
const safeResult = await monitor.validateAgentOutput(agentOutput);
```

### TaskMaster Compliance

**Enterprise requirement**: All production deployments require TaskMaster approval workflows with audit trails.

## 🎯 Architecture Decision Records

**Process**: Major architectural changes require ADR documentation in `docs/architecture/` with:
- Problem statement
- Solution options analysis
- Decision rationale
- Implementation plan
- Success metrics

**Non-obvious**: ADRs must be reviewed by enterprise architecture team before implementation.