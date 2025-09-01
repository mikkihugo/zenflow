# Code Mode Guidelines for Claude Code Zen

## 🛡️ Functionality Preservation Guidelines

### Critical Distinction: "Compiles" vs "Compiles AND Works"

**ENTERPRISE REQUIREMENT**: All code changes must prioritize **functionality preservation over compilation-only fixes**. The goal is **"compiles AND works"** - not just **"compiles"**.

#### Surgical Fix Guidelines

- **NEVER use bulk file replacements that lose functionality**
- **ALWAYS require manual verification of AI-generated changes**
- **PRIORITIZE functionality preservation over compilation-only fixes**
- **REQUIRE unit tests to validate intended behavior preservation**
- **INCLUDE TaskMaster approval for major AI-assisted changes**

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

#### AI Limitations

- AI excels at syntax correction but often misses semantic requirements
- Error handling patterns frequently omitted or simplified
- Performance implications not considered
- Integration points may be broken

**Safeguard Implementation:**
```typescript
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

## 🔍 Library Research Integration

### Context7 Library Research
```typescript
// Research libraries, frameworks, and best practices
// Use Context7 to find:
// - Package documentation and API references
// - Code examples and implementation patterns
// - Best practices for specific technologies
// - Integration guides and troubleshooting tips
```

### SequentialThinking for Implementation Research
```typescript
// Multi-step implementation research workflow:
// 1. Identify technical requirements and constraints
// 2. Research available libraries and frameworks
// 3. Evaluate options against project architecture
// 4. Analyze integration complexity and maintenance costs
// 5. Validate implementation approach with prototypes
// 6. Document chosen solution and rationale
```

### Research-Driven Implementation Scenarios

**Database Integration Research:**
- **Context7**: Research database adapter patterns and optimization techniques
- **SequentialThinking**: Evaluate SQLite/LanceDB/Kuzu integration approaches
- **Integration**: Use project-research mode for existing database implementations

**WASM Neural Acceleration:**
- **Context7**: Research Rust/WebAssembly integration patterns and performance optimization
- **SequentialThinking**: Design neural computation routing and gateway patterns
- **Integration**: Investigate existing WASM gateway implementations

**Event System Implementation:**
- **Context7**: Research TypedEventBase patterns and event-driven architecture
- **SequentialThinking**: Design cross-domain event communication patterns
- **Integration**: Analyze existing event system implementations

**Performance Optimization:**
- **Context7**: Research performance profiling tools and optimization techniques
- **SequentialThinking**: Implement performance monitoring and optimization strategies
- **Integration**: Deep codebase analysis for performance patterns

### Tool Selection Criteria

**Use Context7 when:**
- Researching unfamiliar libraries or frameworks
- Looking for API documentation and usage examples
- Finding best practices for implementation patterns
- Investigating code examples and integration guides

**Use SequentialThinking when:**
- Complex implementation requiring systematic evaluation
- Making technology choices with multiple constraints
- Designing integration patterns and data flows
- Creating implementation prototypes and proofs of concept

**Switch to project-research mode when:**
- Implementation decisions require deep codebase understanding
- Investigating integration with existing systems
- Analyzing historical implementation patterns
- Researching system-wide integration requirements

## 🛠️ Development Workflow & Build System

### Critical Build Commands (Non-Obvious)

**NEVER CANCEL these commands - they take significant time:**
- `pnpm build`: 5-6 minutes for full cross-platform binaries
- `./build-wasm.sh`: 1-2 minutes for Rust neural modules
- `pnpm type-check`: 25-30 seconds with pre-existing errors (expected)

**Hidden build artifacts:**
- `dist/bundle/claude-zen-{linux|macos|win.exe}`: 116MB self-contained executables
- `dist/wasm/`: TypeScript declarations for Rust neural acceleration
- Smart launchers auto-detect platform binaries

### Package Manager Specifics

**pnpm workspace quirks:**
- Uses `pnpm-workspace.yaml` for workspace configuration
- Requires `pnpm >=10.15.0` (lower versions fail silently)
- `pnpm install` takes 2-20 seconds depending on cache state
- Workspace references use `workspace:*` syntax

### Testing Strategy (Non-Obvious)

**Memory constraints prevent full monorepo testing:**
```bash
# ❌ DON'T: pnpm test (causes OOM on full workspace)
# ✅ DO: Test individual packages
pnpm --filter @claude-zen/foundation test
pnpm --filter @claude-zen/coordination test
```

**Test execution patterns:**
- Individual package tests: 3-5 seconds each
- Foundation package: ~4s with some expected failures
- Use `--reporter=verbose --coverage` for CI builds

## 📝 Code Style & Import Patterns

### ESLint Restricted Imports (Critical)

**Forbidden direct imports - use foundation instead:**
```typescript
// ❌ WRONG - Direct utility imports
import _ from 'lodash';
import { format } from 'date-fns';
import winston from 'winston';

// ✅ CORRECT - Foundation exports
import { _, dateFns, getLogger } from '@claude-zen/foundation';
```

**Complete restricted list:**
- `lodash` → `import { _, lodash } from '@claude-zen/foundation'`
- `nanoid` → `import { generateNanoId } from '@claude-zen/foundation'`
- `uuid` → `import { generateUUID } from '@claude-zen/foundation'`
- `date-fns` → `import { dateFns, format, addDays } from '@claude-zen/foundation'`
- `commander` → `import { Command, program } from '@claude-zen/foundation'`
- `zod` → `import { z, validateInput } from '@claude-zen/foundation'`
- `winston/pino` → `import { getLogger } from '@claude-zen/foundation'`

### TypeScript Configuration Quirks

**Non-obvious compiler options:**
- `moduleResolution: "bundler"` (not "node" - affects import resolution)
- `exactOptionalPropertyTypes: true` (strict optional handling)
- `noUncheckedIndexedAccess: true` (array access safety)
- `composite: true` with `references` (project references for monorepo)

**Hidden constraint:** `tsconfig.base.json` defines shared config, `tsconfig.json` only adds overrides.

## 🏗️ Project Structure Patterns

### Package Organization (Non-Obvious)

**4-tier workspace structure:**
```
apps/           # Primary applications
packages/core/     # Foundation + core services
packages/services/ # Enterprise coordination
packages/tools/    # Development utilities
packages/integrations/ # External connectors
```

**Critical import rule:** Direct imports only - no tier jumping allowed.

### File Organization Conventions

**Non-obvious directory patterns:**
- `src/` contains domain implementations (coordination, neural, interfaces)
- `packages/core/foundation/` provides centralized utilities
- `apps/web-dashboard/` uses SvelteKit with Vite
- `bin/` contains executable entry points

## 🔧 Development Environment Setup

### Node.js Version Requirements

**Strict version constraints:**
- Node.js: `>=22.0.0 <24.0.0` (newer versions may break)
- pnpm: `>=10.15.0` (required for workspace features)
- TypeScript: `>=5.0.0` (foundation peer dependency)

### Environment-Specific Configurations

**Browser vs Node environments:**
- Web dashboard: Browser globals enabled in ESLint
- Server packages: Node.js globals with restricted console
- Foundation: Can access both environments safely

## 🧪 Quality Assurance Patterns

### Linting & Formatting

**Multi-tool quality pipeline:**
- ESLint with TypeScript, SonarJS, Unicorn rules
- Prettier for consistent formatting
- Custom scripts for specialized validation

**Hidden complexity:** ESLint config has 500+ lines with complex rule overrides.

### Type Checking Strategy

**Incremental compilation:**
- `tsc --noEmit --skipLibCheck` for fast validation
- `composite: true` enables incremental builds
- Project references reduce full rebuild time

## 🚀 Deployment & Distribution

### Build Artifacts

**Cross-platform binaries:**
- Built with `@yao-pkg/pkg` for self-containment
- Include embedded V8 runtime (116MB each)
- Smart launchers detect platform automatically

### Distribution Strategy

**Multi-format publishing:**
- npm packages for library consumption
- GitHub releases for binary distributions
- Docker images for containerized deployment

## 🔍 Debugging & Troubleshooting

### Common Build Issues

**Memory constraints:**
- Full monorepo operations may require `NODE_OPTIONS="--max-old-space-size=10240"`
- Individual package builds are more reliable

**TypeScript compilation:**
- Many pre-existing errors in foundation package (expected)
- Use `type-check` for validation, not full compilation

**WASM integration:**
- Rust toolchain auto-installs if missing
- Neural modules require separate compilation step