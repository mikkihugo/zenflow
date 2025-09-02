# Development Guidelines for Claude Code Zen

This guide reflects the event-driven architecture and guardrails now enforced across the repo.

## Repository overview

Enterprise AI platform with agents, workflows, and a web-first interface. Packages are grouped under apps/, packages/{core,services,tools,integrations}, and src/ domain implementations.

## Core architecture principles

- Event-driven only: communicate across packages via the single typed EventBus from foundation
- Import boundary: only @claude-zen/foundation and @claude-zen/database may be imported directly
- Backend-agnostic data access: use database adapters; avoid binding to a specific backend
- WASM-first heavy compute: route through Rust/WASM gateways

### Domain separation

```
src/
├── coordination/    # Orchestration and enterprise methodologies
├── neural/          # WASM-accelerated neural processing
├── interfaces/      # Web/MCP interfaces (web is primary)
└── database/        # Database adapters and persistence
```

## Packages

- Core: foundation (EventBus, logging, utils), database (adapters)
- Services: coordination, brain, knowledge, monitoring, telemetry
- Tools: code-analyzer, git-operations, parsers, ai-linter, etc.
- Integrations: llm-providers, exporters, otel-collector

Legacy notes: NeuralBridge and similar legacy orchestrators are deprecated; “swarm” terminology remains.

## Agent coordination

- Agent types are flexible strings; select by capability
- Coordination through SAFe, SPARC, XState workflows via events
- TaskMaster provides SOC2-style approvals and audit trails

## Interface guidelines

- Primary: web dashboard
```bash
pnpm --filter @claude-zen/web-dashboard dev
# http://localhost:3000/
```
- Secondary: limited MCP; Minimal terminal status only

## Database guidelines

- Use adapters from @claude-zen/database (SQLite, LanceDB, Kuzu)
- Keep code backend-agnostic; use pooling/caching utilities

## Neural guidelines

- Use WASM gateway for heavy compute; avoid JS math
- Keep access through the provided gateway APIs

## Dev workflow

```bash
pnpm install
pnpm type-check
pnpm --filter @claude-zen/web-dashboard dev
pnpm build
```

Tests: run per-package only.

## Quality and functionality

- Prefer surgical changes; preserve behavior
- Validate type-check, build, and dashboard navigation

## Architecture enforcement

- Scripts: scripts/validate-imports.js and scripts/validate-dependencies.js
- ESLint soft rules discourage cross-package imports beyond foundation/database

TaskMaster and event-driven flows
- The server’s TaskMaster API (apps/claude-code-zen-server) no longer imports @claude-zen/coordination directly
- All TaskMaster-related metrics and CRUD requests proxy via the typed EventBus (api:tasks:*, api:system:status)
- Downstream packages should implement responders listening on these topics and emit typed responses

TaskMaster and event-driven flows
- The server’s TaskMaster API (apps/claude-code-zen-server) no longer imports @claude-zen/coordination directly
- All TaskMaster-related metrics and CRUD requests proxy via the typed EventBus (api:tasks:*, api:system:status)
- Downstream packages should implement responders listening on these topics and emit typed responses

## Task approval example

If a change is large or risky, route through TaskMaster and approvals in coordination packages.
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