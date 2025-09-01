3000cy# Debug Mode Guidelines for Claude Code Zen

## 🛡️ Functionality Preservation Guidelines

### Critical Distinction: "Compiles" vs "Compiles AND Works"

**ENTERPRISE REQUIREMENT**: All debugging and fixes must prioritize **functionality preservation over compilation-only fixes**. The goal is **"compiles AND works"** - not just **"compiles"**.

#### Debugging Approaches for AI-Induced Issues

- **NEVER use bulk file replacements that lose functionality**
- **ALWAYS require manual verification of AI-generated changes**
- **PRIORITIZE functionality preservation over compilation-only fixes**
- **REQUIRE unit tests to validate intended behavior preservation**
- **INCLUDE TaskMaster approval for major AI-assisted changes**

**Debugging workflow:**
- Reproduce the issue consistently
- Gather system state information
- Analyze error patterns and stack traces
- Test hypotheses systematically
- Implement and verify fixes with unit and integration tests

**AI limitations to consider:**
- AI-generated fixes may omit error handling or degrade performance
- Always validate with existing test suites and manual review
- Use AISafetyMonitor to validate code changes

## 🔍 Research-Enhanced Debugging Infrastructure

### Research Tool Integration for Complex Issues

**Context7 Research Workflows:**
```typescript
// Research library documentation for debugging tools
// Use Context7 to find debugging best practices for:
// - Database-specific debugging (SQLite/LanceDB/Kuzu)
// - WASM performance debugging patterns
// - Event system tracing techniques
// - Memory leak investigation methods
```

**SequentialThinking for Systematic Debugging:**
```typescript
// Multi-step debugging investigation workflow:
// 1. Reproduce the issue consistently
// 2. Gather system state information
// 3. Analyze error patterns and stack traces
// 4. Test hypotheses systematically
// 5. Implement and verify fixes
```

### Research-Driven Debugging Scenarios

**Database Performance Issues:**
- **Context7**: Research optimal query patterns for SQLite/LanceDB/Kuzu
- **SequentialThinking**: Analyze query execution plans and connection pooling
- **Integration**: Use project-research mode for deep database architecture investigation

**WASM Computation Errors:**
- **Context7**: Research Rust/WebAssembly debugging techniques and performance profiling
- **SequentialThinking**: Test WASM vs JavaScript performance hypotheses systematically
- **Integration**: Investigate neural domain integration patterns

**Event System Failures:**
- **Context7**: Research event-driven architecture debugging patterns and tools
- **SequentialThinking**: Trace event propagation and correlation IDs across domains
- **Integration**: Analyze cross-domain communication flows

**Memory and Performance Issues:**
- **Context7**: Research memory profiling tools and optimization techniques
- **SequentialThinking**: Profile performance bottlenecks and test optimization hypotheses
- **Integration**: Deep codebase analysis for performance patterns

### Tool Selection Criteria

**Use Context7 when:**
- Researching unfamiliar debugging tools or techniques
- Looking for best practices for specific technologies (WASM, databases, event systems)
- Finding code examples for debugging patterns
- Investigating API documentation for debugging libraries

**Use SequentialThinking when:**
- Complex multi-step debugging requiring hypothesis testing
- Systematic investigation of performance issues
- Analyzing error propagation across system boundaries
- Testing multiple potential root causes methodically

**Switch to project-research mode when:**
- Debugging requires deep understanding of codebase architecture
- Investigating interactions between multiple domains
- Analyzing system-wide patterns or anti-patterns
- Researching historical context of architectural decisions

## 🔍 Debugging Infrastructure

### Multi-Database Debugging Strategy

**Database-specific debugging approaches:**

**SQLite Debugging:**
```bash
# Direct file inspection (SQLite is file-based)
sqlite3 database.db ".schema"
sqlite3 database.db "SELECT * FROM agents LIMIT 5;"

# Connection pooling logs
import { getLogger } from '@claude-zen/foundation';
const logger = getLogger('sqlite-debug');
```

**LanceDB Vector Debugging:**
```typescript
// Vector similarity inspection
import { LanceDBAdapter } from '@claude-zen/database/adapters/lancedb-adapter';
const adapter = new LanceDBAdapter(config);
const debugResults = await adapter.vectorSearch(queryVector, 10, { debug: true });
```

**Kuzu Graph Debugging:**
```cypher
// Graph relationship inspection
MATCH (a:Agent)-[r:COORDINATES_WITH]->(b:Agent)
WHERE a.status = 'active'
RETURN a.name, type(r), b.name, r.created_at
ORDER BY r.created_at DESC LIMIT 10;
```

### WASM Neural Debugging

**Non-obvious WASM debugging patterns:**
```typescript
// Gateway-level error handling
import { neural_forward_pass } from 'src/neural/wasm/gateway';

try {
  const result = await neural_forward_pass(weights, input);
} catch (wasmError) {
  // WASM errors bubble up through gateway
  console.error('Neural computation failed:', wasmError);
  // Fallback to JavaScript implementation if available
}
```

**Performance profiling:**
- Operations >100μs must use WASM
- Use browser dev tools for WebAssembly debugging
- Rust source maps available in development builds

## 🛡️ Security Debugging

### AI Safety Debugging

**Safety monitor debugging:**
```typescript
import { AISafetyMonitor } from '@claude-zen/ai-safety';

const monitor = new AISafetyMonitor({ debug: true });
const result = await monitor.validateAgentOutput(agentOutput);

if (!result.safe) {
  console.log('Safety violations:', result.violations);
  console.log('Deception detection:', result.deceptionScore);
}
```

### TaskMaster Compliance Debugging

**Approval workflow debugging:**
```typescript
// Debug approval chains
const taskMaster = new TaskMaster();
const debugInfo = await taskMaster.getApprovalChain(taskId);

console.log('Approval chain:', debugInfo.steps);
console.log('Audit trail:', debugInfo.auditTrail);