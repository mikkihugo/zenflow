# Agent Development Guidelines for Claude Code Zen

## 🎯 Repository Overview

Claude Code Zen is an **enterprise AI development platform** with sophisticated agent coordination, multi-database persistence, and comprehensive web-based management interfaces. This guide provides development practices for working effectively within this complex monorepo.

## 🏗️ Core Architecture Principles

### Domain Separation

The platform uses **domain-driven architecture** with clear separation:

```
src/
├── coordination/    # Multi-agent orchestration and enterprise methodologies
├── neural/         # WASM-accelerated neural networks and ML processing
├── interfaces/     # Web-first interfaces with limited MCP integration
└── database/       # Multi-adapter database systems and persistence
```

### Package Organization

**31 packages** organized for project structure across strategic domains:

- **apps/**: Primary applications (server + web dashboard)
- **packages/core/**: Foundation systems and core libraries 
- **packages/services/**: Enterprise services and coordination systems
- **packages/tools/**: Development and analysis utilities
- **packages/integrations/**: External system connectors

#### Complete Package List with Purposes

**📦 Core Packages (packages/core/):**
- `@claude-zen/foundation` - Self-contained foundation with Node.js built-ins: logging, config, DI, error handling, utilities
- `@claude-zen/database` - Multi-database abstraction layer (SQLite, LanceDB, Kuzu)
- `@claude-zen/memory` - Advanced memory coordination and orchestration system
- `@claude-zen/neural-ml` - High-performance neural ML library (private, used by brain)
- `@claude-zen/dspy` - DSPy Stanford integration engine (private, used by brain)
- `@claude-zen/fact-system` - FACT system with Rust engine (private, used by knowledge)
- `@claude-zen/interfaces` - Interface abstractions and adapters

**🔧 Services Packages (packages/services/):**
- `@claude-zen/coordination` - Unified coordination: SPARC, SAFe, workflows, orchestration, teamwork
- `@claude-zen/brain` - Comprehensive neural brain system with behavioral intelligence
- `@claude-zen/knowledge` - Advanced knowledge management with distributed learning
- `@claude-zen/agent-registry` - Dedicated agent registry with DI container integration
- `@claude-zen/agent-monitoring` - Comprehensive agent health monitoring and performance tracking
- `@claude-zen/document-intelligence` - Unified document intelligence with semantic analysis
- `@claude-zen/load-balancing` - Advanced load balancing and resource optimization
- `@claude-zen/system-monitoring` - System and infrastructure monitoring (CPU, memory, performance)
- `@claude-zen/telemetry` - Core telemetry infrastructure with OpenTelemetry and metrics
- `@claude-zen/ai-safety` - AI safety monitoring with deception detection

**🛠️ Tools Packages (packages/tools/):**
- `@claude-zen/code-analyzer` - Live code analysis with AI-powered insights
- `@claude-zen/git-operations` - AI-powered Git operations with intelligent conflict resolution
- `@claude-zen/language-parsers` - Multi-language parsers for code analysis
- `@claude-zen/beam-analyzer` - BEAM ecosystem analysis for Erlang, Elixir, Gleam, LFE
- `@claude-zen/codeql` - CodeQL integration for semantic analysis and vulnerability detection
- `@claude-zen/ai-linter` - AI-powered TypeScript/JavaScript linter with GPT integration
- `@claude-zen/coder` - Rust-based code analysis engine (library only, no CLI)

**🔌 Integration Packages (packages/integrations/):**
- `@claude-zen/llm-providers` - LLM provider integrations: CLI tools, Direct APIs, AI services
- `@claude-zen/exporters` - Export utilities and systems
- `@claude-zen/otel-collector` - Internal OpenTelemetry collector for observability

#### Architecture Principles

**Foundation Package:**
- **Self-contained** - Minimal external dependencies, uses Node.js built-ins primarily
- **Centralized utilities** - All common utilities (lodash, date-fns, commander, etc.) exported from foundation
- **Core infrastructure** - Logging, configuration, dependency injection, error handling

**Other Packages:**
- **Organizational structure** - For managing complexity in large project, NOT self-contained libraries
- **Depend on foundation** - Import utilities from foundation rather than direct dependencies
- **Depend on each other** - Can import from other packages as needed for functionality
- **Project coherence** - Work together as integrated system rather than independent libraries

## 🤖 Agent Coordination System

### Agent Type Flexibility

**NO ARBITRARY RESTRICTIONS**: Agent types are **dynamic and configurable**:

```typescript
// ✅ Flexible agent type system
interface AgentRegistrationConfig {
  templateId: string;
  name: string;
  type: string;  // Any string - no predefined limitations
  config: Record<string, unknown>;
  capabilities?: string[];
  metadata?: Record<string, unknown>;
}
```

**Key Principles**:
- **Agent types are strings** - create any type based on your needs
- **Capability-driven selection** - agents chosen by what they can do, not arbitrary type limits
- **Enterprise methodology guidance** - SAFe 6.0 and SPARC frameworks provide coordination structure
- **Dynamic registration** - agents can be registered with any type designation

### Enterprise Coordination Frameworks

#### SAFe 6.0 Integration

**Portfolio Management and Program Increments**:

- Portfolio managers coordinate strategic themes and value streams
- Program increment planning breaks features into manageable deliverables
- Architecture runway management ensures technical foundation readiness
- Value stream optimization coordinates delivery flow across teams

#### SPARC Development Methodology

**5-Phase Systematic Development**:

1. **Specification**: Requirements analysis with acceptance criteria
2. **Pseudocode**: Algorithm design and logical structure planning
3. **Architecture**: System design with patterns and scalability considerations
4. **Refinement**: Implementation optimization and performance tuning
5. **Completion**: Test suite generation and comprehensive documentation

#### Teamwork Multi-Agent Coordination

**Collaborative Problem-Solving**:

- **Shared Memory**: Context maintained across agent interactions
- **Sequential Decision-Making**: Coordinated agent collaboration patterns
- **Specialization**: Agents selected based on expertise and capabilities
- **Consensus Building**: Multi-agent agreement protocols

## 🌐 Interface Development Guidelines

### Web-First Architecture

**Primary Interface**: Comprehensive Svelte-based web dashboard

```bash
# Start web dashboard (primary development interface)
pnpm --filter @claude-zen/web-dashboard dev
# Access at: http://localhost:3000
```

**Dashboard Features**:
- Real-time system monitoring and agent coordination
- SAFe 6.0 portfolio and program increment visualization
- SPARC development progress tracking and phase management
- Database monitoring across SQLite, LanceDB, and Kuzu backends
- Workflow orchestration with XState process visualization
- TaskMaster enterprise task flow and approval management

### Limited MCP Integration

**Secondary Interface**: MCP servers for specific tool integration

- **Scope**: Limited to essential tool integrations, not comprehensive interface layer
- **Purpose**: External system connectivity for specialized automation
- **Implementation**: Located in `src/interfaces/mcp/` with minimal scope

### Minimal Terminal Interface

**Basic Status Only**: Simple terminal screens for status display

- **Location**: `src/interfaces/terminal/screens/`
- **Scope**: Basic status information only, not comprehensive CLI
- **Implementation**: React-based status screens with limited functionality

## 💾 Multi-Database Architecture

### Database Domains

**Clear separation between Memory and Database domains**:

- **Memory Domain** (`src/memory/`): Caching, memory management, and short-term storage
- **Database Domain** (`packages/core/database/`): Persistent storage and database adapters

### Multi-Adapter System

#### SQLite Adapter
```typescript
// Structured relational data and agent state
import { SQLiteAdapter } from '@claude-zen/database/adapters/sqlite-adapter';

const sqliteAdapter = new SQLiteAdapter(config);
await sqliteAdapter.query('SELECT * FROM agents WHERE status = ?', ['active']);
```

#### LanceDB Adapter
```typescript
// Vector embeddings and similarity search
import { LanceDBAdapter } from '@claude-zen/database/adapters/lancedb-adapter';

const lancedbAdapter = new LanceDBAdapter(config);
await lancedbAdapter.vectorSearch(queryVector, 10);
```

#### Kuzu Graph Adapter
```typescript
// Graph data and complex relationship modeling
import { KuzuAdapter } from '@claude-zen/database/adapters/kuzu-adapter';

const kuzuAdapter = new KuzuAdapter(config);
await kuzuAdapter.query(`
  MATCH (a:Agent)-[:COORDINATES_WITH]->(b:Agent)
  WHERE a.type = 'coordinator'
  RETURN a.name, b.name
`);
```

## 🧠 Neural Domain Guidelines

### WASM-First Computing

**Performance-Critical Operations**:

```typescript
// ✅ Route heavy computation through WASM
import { neural_forward_pass } from '../wasm/fact-core/pkg';

export class PerformantNeuralNetwork {
  forwardPass(inputs: number[]): number[] {
    return neural_forward_pass(this.weights, inputs);
  }
}
```

**Key Principles**:
- **Use WASM for all heavy computation** - avoid pure JavaScript for math operations
- **Access through gateway facade** - use `src/neural/wasm/gateway.ts` for WASM integration
- **Rust-powered acceleration** - leverage fact-core WASM module for performance

## 📋 Development Workflow

### Build System Commands

```bash
# Essential development commands
pnpm install                                # Dependencies (2-20 seconds)
pnpm type-check                            # TypeScript validation (1-2 seconds)
pnpm --filter @claude-zen/web-dashboard dev # Web dashboard (5-10 seconds)
pnpm build                                 # Full build with binaries (1-2 minutes)

# Package-specific builds
pnpm run build:packages                    # Individual packages (2-5 minutes)
pnpm run build:rust                        # WASM modules (1-2 minutes)
```

### Performance Expectations

| Operation | Time | Status | Notes |
|-----------|------|---------|--------|
| `pnpm install` | 2-20s | ✅ | Fast dependency resolution |
| `pnpm type-check` | 1-2s | ✅ | Fastest validation method |
| Web dashboard | 5-10s | ✅ | Primary development interface |
| `pnpm build` | 1-2min | ✅ | Creates cross-platform binaries |
| `pnpm test` | 15+min | ⚠️ | Memory constraints, use individual packages |

## 🧪 Quality Assurance

## 🧪 Quality Assurance

**Always validate changes**:

1. **TypeScript Compilation**: `pnpm type-check` (must pass)
2. **Web Dashboard**: Load `http://localhost:3000` and test navigation
3. **Build Integrity**: `pnpm build` completes successfully
4. **Domain Separation**: Follow architecture boundaries
## 🛡️ Functionality Preservation Guidelines

### Critical Distinction: "Compiles" vs "Compiles AND Works"

**ENTERPRISE REQUIREMENT**: All code changes must prioritize **functionality preservation over compilation-only fixes**. The goal is **"compiles AND works"** - not just **"compiles"**.

#### Core Principles

**NEVER use bulk file replacements that lose functionality:**
```typescript
// ❌ WRONG - Bulk replacement loses critical error handling
function processAgent(agentId: string) {
  const agent = await agentRegistry.get(agentId);
  return agent;
}

// ✅ CORRECT - Surgical fix preserves existing error handling
async function processAgent(agentId: string): Promise<Result<AgentState, Error>> {
  try {
    const agent = await agentRegistry.get(agentId);
    if (!agent) {
      return err(new Error(`Agent ${agentId} not found`));
    }
    return ok(agent);
  } catch (error) {
    return err(error);
  }
}
```

**ALWAYS require manual verification of AI-generated changes:**
- **Step 1**: AI generates proposed changes
- **Step 2**: Human developer reviews each line for functionality impact
- **Step 3**: Run existing unit tests to validate behavior preservation
- **Step 4**: Perform integration testing with dependent systems
- **Step 5**: Manual testing of critical user workflows

**REQUIRE unit tests to validate intended behavior preservation:**
```typescript
// Example: Test that preserves existing functionality
describe('Agent Processing', () => {
  it('should return error for non-existent agent', async () => {
    const result = await processAgent('non-existent-id');
    expect(result.isErr()).toBe(true);
    expect(result.error.message).toContain('not found');
  });

  it('should return agent data for valid agent', async () => {
    const result = await processAgent('valid-id');
    expect(result.isOk()).toBe(true);
    expect(result.value.id).toBe('valid-id');
  });
});
```

### Enterprise-Level Functionality Preservation Requirements

#### 1. Surgical Fix Guidelines

**Line-by-line modifications only:**
- Change one logical unit at a time
- Preserve all existing error handling paths
- Maintain backward compatibility
- Keep existing performance characteristics

**Forbidden practices:**
- ❌ Bulk search-and-replace operations
- ❌ Complete file rewrites without line-by-line review
- ❌ Removing error handling without replacement
- ❌ Changing return types without updating callers

#### 2. AI-Assisted Change Verification Process

**Mandatory verification steps:**
1. **Pre-change baseline**: Run full test suite and capture metrics
2. **Change application**: Apply AI suggestions surgically
3. **Post-change validation**: Re-run tests and compare metrics
4. **Integration testing**: Test with connected systems
5. **Performance validation**: Ensure no degradation

#### 3. TaskMaster Approval Workflow

**Major AI-assisted changes require approval:**
```typescript
// Example TaskMaster integration for AI changes
import { TaskMaster } from '@claude-zen/coordination/taskmaster';

const taskMaster = new TaskMaster();
const approvalRequest = {
  type: 'ai-assisted-code-change',
  scope: 'functionality-preservation',
  changes: proposedChanges,
  impact: 'enterprise-critical',
  tests: validationTests
};

const approval = await taskMaster.requestApproval(approvalRequest);
if (!approval.granted) {
  throw new Error('AI-assisted changes require TaskMaster approval');
}
```

#### 4. Quality Gates for AI-Generated Code

**Enterprise quality requirements:**
- **Unit test coverage**: ≥90% for modified code paths
- **Integration tests**: All dependent systems validated
- **Performance benchmarks**: No degradation >5%
- **Security review**: AI safety monitor validation
- **Documentation**: Updated API docs and inline comments

#### 5. Error Handling Preservation

**Never remove existing error handling:**
```typescript
// ❌ WRONG - Removes critical error handling
function riskyOperation() {
  return externalService.call();
}

// ✅ CORRECT - Preserves error handling
async function riskyOperation(): Promise<Result<Data, Error>> {
  try {
    const result = await externalService.call();
    return ok(result);
  } catch (error) {
    // Preserve existing error logging and recovery
    await errorLogger.log(error);
    await recoveryService.attemptRecovery();
    return err(error);
  }
}
```

#### 6. Performance Characteristic Preservation

**Maintain existing performance profiles:**
- Response times within ±10% of baseline
- Memory usage patterns preserved
- Database query efficiency maintained
- WASM acceleration usage preserved

#### 7. Backward Compatibility Requirements

**Enterprise systems require stability:**
- API contracts preserved
- Data migration paths provided
- Deprecation notices for breaking changes
- Gradual rollout capabilities

### AI Limitations and Safeguards

#### Known AI Code Generation Issues

**Compilation vs Functionality Gap:**
- AI excels at syntax correction but often misses semantic requirements
- Error handling patterns frequently omitted or simplified
- Performance implications not considered
- Integration points may be broken

**Safeguard Implementation:**
```typescript
// AI Safety Monitor integration
import { AISafetyMonitor } from '@claude-zen/ai-safety';

const safetyMonitor = new AISafetyMonitor();
const aiGeneratedCode = await aiAssistant.generateFix(problem);

const safetyCheck = await safetyMonitor.validateCodeChange({
  originalCode,
  proposedCode: aiGeneratedCode,
  context: 'functionality-preservation'
});

if (!safetyCheck.safe) {
  console.warn('AI-generated code requires manual review:', safetyCheck.issues);
  // Force manual review process
}
```

#### Enterprise Compliance Requirements

**SAFe 6.0 Integration:**
- All changes mapped to Program Increments
- Architecture runway preservation
- Risk mitigation for AI-assisted changes

**SPARC Methodology Alignment:**
- Specification phase includes functionality requirements
- Pseudocode validates logic preservation
- Architecture review ensures system integrity
- Refinement focuses on behavior validation
- Completion requires comprehensive testing

#### Success Metrics for Functionality Preservation

**Quantitative measures:**
- **Test pass rate**: ≥99% after changes
- **Performance delta**: ≤±5% change
- **Error rate**: No increase in production errors
- **User workflow success**: ≥99.9% success rate

**Qualitative measures:**
- Code review approval rate
- TaskMaster approval compliance
- Incident response time for issues
- Developer confidence in AI-assisted changes
## 🛡️ Functionality Preservation Guidelines

### Critical Distinction: "Compiles" vs "Compiles AND Works"

**ENTERPRISE REQUIREMENT**: All code changes must prioritize **functionality preservation over compilation-only fixes**. The goal is **"compiles AND works"** - not just **"compiles"**.

#### Core Principles

**NEVER use bulk file replacements that lose functionality:**
```typescript
// ❌ WRONG - Bulk replacement loses critical error handling
function processAgent(agentId: string) {
  const agent = await agentRegistry.get(agentId);
  return agent;
}

// ✅ CORRECT - Surgical fix preserves existing error handling
async function processAgent(agentId: string): Promise<Result<AgentState, Error>> {
  try {
    const agent = await agentRegistry.get(agentId);
    if (!agent) {
      return err(new Error(`Agent ${agentId} not found`));
    }
    return ok(agent);
  } catch (error) {
    return err(error);
  }
}
```

**ALWAYS require manual verification of AI-generated changes:**
- **Step 1**: AI generates proposed changes
- **Step 2**: Human developer reviews each line for functionality impact
- **Step 3**: Run existing unit tests to validate behavior preservation
- **Step 4**: Perform integration testing with dependent systems
- **Step 5**: Manual testing of critical user workflows

**REQUIRE unit tests to validate intended behavior preservation:**
```typescript
// Example: Test that preserves existing functionality
describe('Agent Processing', () => {
  it('should return error for non-existent agent', async () => {
    const result = await processAgent('non-existent-id');
    expect(result.isErr()).toBe(true);
    expect(result.error.message).toContain('not found');
  });

  it('should return agent data for valid agent', async () => {
    const result = await processAgent('valid-id');
    expect(result.isOk()).toBe(true);
    expect(result.value.id).toBe('valid-id');
  });
});
```

### Enterprise-Level Functionality Preservation Requirements

#### 1. Surgical Fix Guidelines

**Line-by-line modifications only:**
- Change one logical unit at a time
- Preserve all existing error handling paths
- Maintain backward compatibility
- Keep existing performance characteristics

**Forbidden practices:**
- ❌ Bulk search-and-replace operations
- ❌ Complete file rewrites without line-by-line review
- ❌ Removing error handling without replacement
- ❌ Changing return types without updating callers

#### 2. AI-Assisted Change Verification Process

**Mandatory verification steps:**
1. **Pre-change baseline**: Run full test suite and capture metrics
2. **Change application**: Apply AI suggestions surgically
3. **Post-change validation**: Re-run tests and compare metrics
4. **Integration testing**: Test with connected systems
5. **Performance validation**: Ensure no degradation

#### 3. TaskMaster Approval Workflow

**Major AI-assisted changes require approval:**
```typescript
// Example TaskMaster integration for AI changes
import { TaskMaster } from '@claude-zen/coordination/taskmaster';

const taskMaster = new TaskMaster();
const approvalRequest = {
  type: 'ai-assisted-code-change',
  scope: 'functionality-preservation',
  changes: proposedChanges,
  impact: 'enterprise-critical',
  tests: validationTests
};

const approval = await taskMaster.requestApproval(approvalRequest);
if (!approval.granted) {
  throw new Error('AI-assisted changes require TaskMaster approval');
}
```

#### 4. Quality Gates for AI-Generated Code

**Enterprise quality requirements:**
- **Unit test coverage**: ≥90% for modified code paths
- **Integration tests**: All dependent systems validated
- **Performance benchmarks**: No degradation >5%
- **Security review**: AI safety monitor validation
- **Documentation**: Updated API docs and inline comments

#### 5. Error Handling Preservation

**Never remove existing error handling:**
```typescript
// ❌ WRONG - Removes critical error handling
function riskyOperation() {
  return externalService.call();
}

// ✅ CORRECT - Preserves error handling
async function riskyOperation(): Promise<Result<Data, Error>> {
  try {
    const result = await externalService.call();
    return ok(result);
  } catch (error) {
    // Preserve existing error logging and recovery
    await errorLogger.log(error);
    await recoveryService.attemptRecovery();
    return err(error);
  }
}
```

#### 6. Performance Characteristic Preservation

**Maintain existing performance profiles:**
- Response times within ±10% of baseline
- Memory usage patterns preserved
- Database query efficiency maintained
- WASM acceleration usage preserved

#### 7. Backward Compatibility Requirements

**Enterprise systems require stability:**
- API contracts preserved
- Data migration paths provided
- Deprecation notices for breaking changes
- Gradual rollout capabilities

### AI Limitations and Safeguards

#### Known AI Code Generation Issues

**Compilation vs Functionality Gap:**
- AI excels at syntax correction but often misses semantic requirements
- Error handling patterns frequently omitted or simplified
- Performance implications not considered
- Integration points may be broken

**Safeguard Implementation:**
```typescript
// AI Safety Monitor integration
import { AISafetyMonitor } from '@claude-zen/ai-safety';

const safetyMonitor = new AISafetyMonitor();
const aiGeneratedCode = await aiAssistant.generateFix(problem);

const safetyCheck = await safetyMonitor.validateCodeChange({
  originalCode,
  proposedCode: aiGeneratedCode,
  context: 'functionality-preservation'
});

if (!safetyCheck.safe) {
  console.warn('AI-generated code requires manual review:', safetyCheck.issues);
  // Force manual review process
}
```

#### Enterprise Compliance Requirements

**SAFe 6.0 Integration:**
- All changes mapped to Program Increments
- Architecture runway preservation
- Risk mitigation for AI-assisted changes

**SPARC Methodology Alignment:**
- Specification phase includes functionality requirements
- Pseudocode validates logic preservation
- Architecture review ensures system integrity
- Refinement focuses on behavior validation
- Completion requires comprehensive testing

#### Success Metrics for Functionality Preservation

**Quantitative measures:**
- **Test pass rate**: ≥99% after changes
- **Performance delta**: ≤±5% change
- **Error rate**: No increase in production errors
- **User workflow success**: ≥99.9% success rate

**Qualitative measures:**
- Code review approval rate
- TaskMaster approval compliance
- Incident response time for issues
- Developer confidence in AI-assisted changes
## 🛡️ Functionality Preservation Guidelines

### Critical Distinction: "Compiles" vs "Compiles AND Works"

**ENTERPRISE REQUIREMENT**: All code changes must prioritize **functionality preservation over compilation-only fixes**. The goal is **"compiles AND works"** - not just **"compiles"**.

#### Core Principles

**NEVER use bulk file replacements that lose functionality:**
```typescript
// ❌ WRONG - Bulk replacement loses critical error handling
function processAgent(agentId: string) {
  const agent = await agentRegistry.get(agentId);
  return agent;
}

// ✅ CORRECT - Surgical fix preserves existing error handling
async function processAgent(agentId: string): Promise<Result<AgentState, Error>> {
  try {
    const agent = await agentRegistry.get(agentId);
    if (!agent) {
      return err(new Error(`Agent ${agentId} not found`));
    }
    return ok(agent);
  } catch (error) {
    return err(error);
  }
}
```

**ALWAYS require manual verification of AI-generated changes:**
- **Step 1**: AI generates proposed changes
- **Step 2**: Human developer reviews each line for functionality impact
- **Step 3**: Run existing unit tests to validate behavior preservation
- **Step 4**: Perform integration testing with dependent systems
- **Step 5**: Manual testing of critical user workflows

**REQUIRE unit tests to validate intended behavior preservation:**
```typescript
// Example: Test that preserves existing functionality
describe('Agent Processing', () => {
  it('should return error for non-existent agent', async () => {
    const result = await processAgent('non-existent-id');
    expect(result.isErr()).toBe(true);
    expect(result.error.message).toContain('not found');
  });

  it('should return agent data for valid agent', async () => {
    const result = await processAgent('valid-id');
    expect(result.isOk()).toBe(true);
    expect(result.value.id).toBe('valid-id');
  });
});
```

### Enterprise-Level Functionality Preservation Requirements

#### 1. Surgical Fix Guidelines

**Line-by-line modifications only:**
- Change one logical unit at a time
- Preserve all existing error handling paths
- Maintain backward compatibility
- Keep existing performance characteristics

**Forbidden practices:**
- ❌ Bulk search-and-replace operations
- ❌ Complete file rewrites without line-by-line review
- ❌ Removing error handling without replacement
- ❌ Changing return types without updating callers

#### 2. AI-Assisted Change Verification Process

**Mandatory verification steps:**
1. **Pre-change baseline**: Run full test suite and capture metrics
2. **Change application**: Apply AI suggestions surgically
3. **Post-change validation**: Re-run tests and compare metrics
4. **Integration testing**: Test with connected systems
5. **Performance validation**: Ensure no degradation

#### 3. TaskMaster Approval Workflow

**Major AI-assisted changes require approval:**
```typescript
// Example TaskMaster integration for AI changes
import { TaskMaster } from '@claude-zen/coordination/taskmaster';

const taskMaster = new TaskMaster();
const approvalRequest = {
  type: 'ai-assisted-code-change',
  scope: 'functionality-preservation',
  changes: proposedChanges,
  impact: 'enterprise-critical',
  tests: validationTests
};

const approval = await taskMaster.requestApproval(approvalRequest);
if (!approval.granted) {
  throw new Error('AI-assisted changes require TaskMaster approval');
}
```

#### 4. Quality Gates for AI-Generated Code

**Enterprise quality requirements:**
- **Unit test coverage**: ≥90% for modified code paths
- **Integration tests**: All dependent systems validated
- **Performance benchmarks**: No degradation >5%
- **Security review**: AI safety monitor validation
- **Documentation**: Updated API docs and inline comments

#### 5. Error Handling Preservation

**Never remove existing error handling:**
```typescript
// ❌ WRONG - Removes critical error handling
function riskyOperation() {
  return externalService.call();
}

// ✅ CORRECT - Preserves error handling
async function riskyOperation(): Promise<Result<Data, Error>> {
  try {
    const result = await externalService.call();
    return ok(result);
  } catch (error) {
    // Preserve existing error logging and recovery
    await errorLogger.log(error);
    await recoveryService.attemptRecovery();
    return err(error);
  }
}
```

#### 6. Performance Characteristic Preservation

**Maintain existing performance profiles:**
- Response times within ±10% of baseline
- Memory usage patterns preserved
- Database query efficiency maintained
- WASM acceleration usage preserved

#### 7. Backward Compatibility Requirements

**Enterprise systems require stability:**
- API contracts preserved
- Data migration paths provided
- Deprecation notices for breaking changes
- Gradual rollout capabilities

### AI Limitations and Safeguards

#### Known AI Code Generation Issues

**Compilation vs Functionality Gap:**
- AI excels at syntax correction but often misses semantic requirements
- Error handling patterns frequently omitted or simplified
- Performance implications not considered
- Integration points may be broken

**Safeguard Implementation:**
```typescript
// AI Safety Monitor integration
import { AISafetyMonitor } from '@claude-zen/ai-safety';

const safetyMonitor = new AISafetyMonitor();
const aiGeneratedCode = await aiAssistant.generateFix(problem);

const safetyCheck = await safetyMonitor.validateCodeChange({
  originalCode,
  proposedCode: aiGeneratedCode,
  context: 'functionality-preservation'
});

if (!safetyCheck.safe) {
  console.warn('AI-generated code requires manual review:', safetyCheck.issues);
  // Force manual review process
}
```

#### Enterprise Compliance Requirements

**SAFe 6.0 Integration:**
- All changes mapped to Program Increments
- Architecture runway preservation
- Risk mitigation for AI-assisted changes

**SPARC Methodology Alignment:**
- Specification phase includes functionality requirements
- Pseudocode validates logic preservation
- Architecture review ensures system integrity
- Refinement focuses on behavior validation
- Completion requires comprehensive testing

#### Success Metrics for Functionality Preservation

**Quantitative measures:**
- **Test pass rate**: ≥99% after changes
- **Performance delta**: ≤±5% change
- **Error rate**: No increase in production errors
- **User workflow success**: ≥99.9% success rate

**Qualitative measures:**
- Code review approval rate
- TaskMaster approval compliance
- Incident response time for issues
- Developer confidence in AI-assisted changes



### Code Organization

```typescript
// ✅ Foundation utilities (centralized)
import { getLogger, Result, ok, err } from '@claude-zen/foundation';

// ✅ Direct package imports (current architecture)
import { BrainCoordinator } from '@claude-zen/brain';
import { DatabaseProvider } from '@claude-zen/database';
import { EventManager } from '@claude-zen/event-system';

// ✅ Coordination package (unified)
import { SafeFramework } from '@claude-zen/coordination/safe';
import { SPARCMethodology } from '@claude-zen/coordination/sparc';
import { TeamworkOrchestrator } from '@claude-zen/coordination/teamwork';
```

### Testing Strategy

**Domain-Specific Testing**:

- **Neural Domain**: Classical TDD - test actual computational results
- **Coordination Domain**: London TDD - test interactions and protocols
- **Memory Domain**: Classical TDD - test actual storage and retrieval
- **Database Domain**: Classical TDD - test actual database operations
- **Interfaces Domain**: London TDD - test interactions and protocols

### Error Handling

```typescript
// ✅ Use Result patterns for predictable error handling
import { Result, ok, err } from '@claude-zen/foundation';

async function processAgent(agentId: string): Promise<Result<AgentState, Error>> {
  try {
    const agent = await agentRegistry.get(agentId);
    if (!agent) {
      return err(new Error(`Agent ${agentId} not found`));
    }
    return ok(agent);
  } catch (error) {
    return err(error);
  }
}
```

## 🚫 Common Anti-Patterns

### What NOT to Do

- **❌ Don't limit agent types artificially** - the system supports flexible agent type strings
- **❌ Don't bypass WASM for heavy computation** - use Rust acceleration for performance
- **❌ Don't create comprehensive CLI interfaces** - focus on web dashboard development
- **❌ Don't bypass enterprise methodologies** - respect SAFe 6.0 and SPARC frameworks
- **❌ Don't mix Memory and Database domains** - maintain clear separation of concerns
- **❌ Don't ignore the web dashboard** - it's the primary interface for all functionality

### Architecture Violations

- **❌ Don't bypass foundation utilities** - use centralized utilities from `@claude-zen/foundation`
- **❌ Don't skip domain boundaries** - respect coordination, neural, interfaces, database separation
- **❌ Don't create artificial package tiers** - use direct imports for current architecture
- **❌ Don't ignore multi-database design** - support SQLite, LanceDB, and Kuzu appropriately

## 🔧 Troubleshooting

### Common Issues

**Build Problems**:
```bash
# If TypeScript errors in foundation package
pnpm type-check  # These are known issues with node: imports, continue

# If memory issues in tests
pnpm --filter <specific-package> test  # Test individual packages
```

**Web Dashboard Problems**:
```bash
# If dashboard won't start
pnpm --filter @claude-zen/web-dashboard dev
# Should work independently of server issues
```

**Database Connection Issues**:
```bash
# Check multi-database status
# SQLite: File-based, should always work
# LanceDB: Vector storage, check memory requirements  
# Kuzu: Graph database, verify installation
```

## 📊 Monitoring and Metrics

### Performance Monitoring

- **Agent Coordination**: Track multi-agent collaboration efficiency
- **Database Performance**: Monitor SQLite, LanceDB, and Kuzu response times
- **WASM Processing**: Measure neural computation acceleration
- **Web Interface**: Track dashboard responsiveness and user interactions

### Enterprise Metrics

- **SAFe 6.0 Metrics**: Portfolio health, program increment velocity
- **SPARC Progress**: 5-phase completion rates and quality gates
- **Teamwork Efficiency**: Multi-agent collaboration success rates
- **TaskMaster Compliance**: Approval workflow times and audit trail completeness

## 🎓 Integration Guidelines

### For New Agents

1. **Understand the Domain**: Identify which domain your agent belongs to
2. **Choose Appropriate Type**: Use descriptive agent type strings (no artificial limits)
3. **Leverage Enterprise Frameworks**: Work within SAFe 6.0 and SPARC methodologies
4. **Focus on Capabilities**: Define what your agent can do, not arbitrary type categories
5. **Use Web Interface**: Integrate with the dashboard for monitoring and control

### For System Integration

1. **Web-First Approach**: Primary integration through Svelte dashboard
2. **Database Strategy**: Choose appropriate backend (SQLite/LanceDB/Kuzu)
3. **WASM Acceleration**: Use Rust modules for performance-critical operations
4. **Enterprise Compliance**: Follow TaskMaster approval workflows for production

---

## 📈 Success Metrics

**Development Effectiveness**:
- **Web Dashboard Functionality**: Primary interface works completely
- **Multi-Database Performance**: Optimal backend selection and performance
- **Agent Coordination**: Effective multi-agent collaboration without artificial limits
- **Enterprise Compliance**: SAFe 6.0 and SPARC methodology adherence
- **Build System Reliability**: Consistent cross-platform binary generation

**Remember**: Claude Code Zen is a **sophisticated enterprise platform** - respect the architecture, leverage the frameworks, and focus on the comprehensive web interface as your primary development target.