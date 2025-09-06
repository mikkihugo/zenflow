# Claude Code Zen – Developer Guardrails (Concise)

Full detailed manual: see `CLAUDE.md`. This file keeps the daily rules lean.

> Event System: Legacy `@claude-zen/events` removed. Use the single typed EventBus from `@claude-zen/foundation` for ALL cross-package communication.

## Repo Overview
Enterprise AI platform: web-first dashboard + agents + multi-database + WASM acceleration. Packages: `apps/`, `packages/{core,services,tools,integrations}`.

## Core Principles (TL;DR)
| Area | Rule |
|------|------|
| Events | Single EventBus (`@claude-zen/foundation`) only |
| Imports | Only foundation, database, neural-ml directly |
| Providers | `@claude-zen/*-provider` may cross-import |
| Data | Use adapters (SQLite/LanceDB/Kuzu) – stay agnostic |
| Heavy compute | Rust/WASM gateway, never bespoke JS math |
| Domains | No ad-hoc cross-domain helpers |

### Domain Map
```
src/
  coordination/   # orchestration & methodologies
  neural/         # WASM & ML
  interfaces/     # web (primary) + limited MCP
  database/       # adapters & persistence
```

## Packages (Categories)
Core (foundation, database) • Services (coordination, brain, knowledge, monitoring, telemetry) • Tools • Integrations (providers, exporters, otel)
Legacy: multi-bus & NeuralBridge deprecated.

## Agents & Coordination
Flexible agent type strings (capability-driven). SAFe + SPARC + XState events. TaskMaster: approvals & audit.

## Interfaces
Primary dashboard:
```bash
pnpm --filter @claude-zen/web-dashboard dev  # http://localhost:3000/
```
Secondary: limited MCP. Terminal: minimal.

## Auth
Lives in provider packages. Server orchestrates only. Don’t duplicate OAuth flows.

## Data
Use `@claude-zen/database` adapters. Stay backend-agnostic. Pool intelligently.

## Neural
Route heavy compute via WASM gateway APIs only.

## Testing
Layout:
```
packages/<pkg>/src
packages/<pkg>/tests   # ONLY location
```
Rules: no `__tests__/`; use `.test.ts|.spec.ts`; run per-package.

## Daily Dev
```bash
pnpm install
pnpm type-check         # may show existing errors
pnpm --filter @claude-zen/web-dashboard dev
pnpm build              # only when producing binaries
```
Tests: per-package.

### Package Manager
pnpm only (v10.15.0+). Replace npx with `pnpm dlx`.

## Change Philosophy
Surgical edits. Preserve behavior. Validate: type-check, dashboard, build (if relevant).

## Enforcement
Scripts: `scripts/validate-imports.js`, `scripts/validate-dependencies.js`. ESLint guards boundaries.

### TaskMaster Routing
Emit `api:tasks:*`, `api:system:status` only. No direct coordination imports.

## Large / Risky Changes
Route via TaskMaster approval workflow.

### Performance & Compatibility
Maintain latency ±10%, memory, DB efficiency, WASM use. Preserve public APIs; document deprecations.

### AI Safeguards (Brief)

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

#### Functionality Metrics

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
## Functionality Preservation (Key Points)

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

### Enterprise Requirements (Condensed)

#### Surgical Fix

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

#### Verification Flow

**Mandatory verification steps:**
1. **Pre-change baseline**: Run full test suite and capture metrics
2. **Change application**: Apply AI suggestions surgically
3. **Post-change validation**: Re-run tests and compare metrics
4. **Integration testing**: Test with connected systems
5. **Performance validation**: Ensure no degradation

#### TaskMaster Approval

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

#### Quality Gates

**Enterprise quality requirements:**
- **Unit test coverage**: ≥90% for modified code paths
- **Integration tests**: All dependent systems validated
- **Performance benchmarks**: No degradation >5%
- **Security review**: AI safety monitor validation
- **Documentation**: Updated API docs and inline comments

#### Error Handling

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

### (Removed duplicate explanatory blocks for brevity)

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

## Anti-Patterns

### Avoid

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

## Troubleshooting

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

## Monitoring (Selected)

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

## Integration

### New Agents

1. **Understand the Domain**: Identify which domain your agent belongs to
2. **Choose Appropriate Type**: Use descriptive agent type strings (no artificial limits)
3. **Leverage Enterprise Frameworks**: Work within SAFe 6.0 and SPARC methodologies
4. **Focus on Capabilities**: Define what your agent can do, not arbitrary type categories
5. **Use Web Interface**: Integrate with the dashboard for monitoring and control

### System Integration

1. **Web-First Approach**: Primary integration through Svelte dashboard
2. **Database Strategy**: Choose appropriate backend (SQLite/LanceDB/Kuzu)
3. **WASM Acceleration**: Use Rust modules for performance-critical operations
4. **Enterprise Compliance**: Follow TaskMaster approval workflows for production

---

## Success Metrics (Development)

**Development Effectiveness**:
- **Web Dashboard Functionality**: Primary interface works completely
- **Multi-Database Performance**: Optimal backend selection and performance
- **Agent Coordination**: Effective multi-agent collaboration without artificial limits
- **Enterprise Compliance**: SAFe 6.0 and SPARC methodology adherence
- **Build System Reliability**: Consistent cross-platform binary generation

**Remember**: Claude Code Zen is a **sophisticated enterprise platform** - respect the architecture, leverage the frameworks, and focus on the comprehensive web interface as your primary development target.

## Forbidden Patterns

### Code Quality Violations

**NEVER use these patterns in the codebase:**

#### Command Failure Suppression
```bash
# ❌ FORBIDDEN - Suppresses all command failures
npm run clean || true
rm -rf dist/ || true

# ✅ CORRECT - Handle errors properly
if ! npm run clean; then
  echo "Clean failed, continuing..."
fi

# Or use proper error handling
npm run clean 2>/dev/null || echo "Clean failed but continuing"
```

#### Test Directory Structure
```bash
# ❌ FORBIDDEN - __tests__ directories
packages/my-package/
├── src/
└── __tests__/          # ← NOT ALLOWED
    └── component.test.ts

# ✅ CORRECT - tests/ directories only
packages/my-package/
├── src/
└── tests/              # ← ONLY ALLOWED
    └── component.test.ts
```

**Why `__tests__/` is forbidden:**
- Inconsistent with modern testing conventions
- Less explicit than `tests/` directory
- Creates confusion about test organization
- Legacy Jest convention that should be avoided

#### Alternatives for Test Organization
```bash
# Option 1: Standard tests/ directory
packages/my-package/
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/

# Option 2: Flat structure in tests/
packages/my-package/
└── tests/
    ├── component.test.ts
    ├── utils.test.ts
    └── api.test.ts
```

#### Alternatives for Error Handling
```bash
# Option 1: Conditional execution
command_that_might_fail || echo "Command failed, but continuing"

# Option 2: Explicit error checking
if command_that_might_fail; then
  echo "Success"
else
  echo "Failed, but continuing"
fi

# Option 3: Use proper error codes
command_that_might_fail
exit_code=$?
if [ $exit_code -ne 0 ]; then
  echo "Command failed with code $exit_code"
fi
```

---

## 📈 Success Metrics