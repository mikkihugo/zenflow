# GitHub Copilot Instructions — Claude Code Zen (Zenflow)

**CRITICAL:** Always follow these instructions first and only fallback to additional search and context gathering if the information here is incomplete or found to be in error.

## 🚀 Quick Setup & Core Commands

### Prerequisites (REQUIRED)
- **Node.js**: Version 22.18.0+ (REQUIRED - check with `node --version`)
- **pnpm**: Version 10.15.0+ (REQUIRED - npm will NOT work properly)
- **Rust**: Latest stable (for WASM modules - installs automatically if missing)

### Essential Commands (Copy-Paste Ready)
```bash
# Install dependencies (2-3 seconds)
pnpm install

# Quick validation (1-2 seconds)  
pnpm type-check

# Start web dashboard - PRIMARY INTERFACE
pnpm --filter @claude-zen/web-dashboard dev
# ➜  Local: http://localhost:3000/

# NEVER CANCEL: Full build (5-6 minutes) - Set timeout 10+ minutes
pnpm build
```

## ⚠️ CRITICAL BUILD WARNINGS

### NEVER CANCEL These Commands:
- **`pnpm build`**: Takes 5-6 minutes. NEVER CANCEL. Set timeout to 10+ minutes.
- **`./build-wasm.sh`**: Takes 1-2 minutes. NEVER CANCEL. Set timeout to 5+ minutes.
- **Any Rust compilation**: Can take 2+ minutes for initial setup.

### Build Timing Expectations:
| Command | Time | Status | Timeout |
|---------|------|---------|---------|
| `pnpm install` | 2-3s | ✅ Works | 30s |
| `pnpm type-check` | 25-30s | ⚠️ Has errors but completes | 60s |
| `pnpm --filter @claude-zen/web-dashboard dev` | 1s | ✅ Works perfectly | 30s |
| `./build-wasm.sh` | 1-2min | ✅ Works | 5min |
| `pnpm build` | 5-6min | ✅ Produces binaries | 10min |
| Package tests | 3-5s each | ⚠️ Run individually | 30s |

## 🏗️ Architecture At a Glance

### 52+ Package Enterprise Platform:
- **apps/web-dashboard/**: Svelte web interface (PRIMARY interface)
- **packages/core/**: Foundation, database, memory systems  
- **packages/services/**: Coordination, brain, monitoring
- **packages/tools/**: Development and analysis utilities
- **packages/integrations/**: External system connectors

### Domain Separation:
- **Coordination**: Multi-agent orchestration, SAFe 6.0, SPARC methodology
- **Neural**: WASM-accelerated neural networks via Rust
- **Interfaces**: Web-first (primary), limited MCP/CLI (secondary)
- **Memory/Database**: Multi-backend (SQLite/LanceDB/Kuzu), backend-agnostic
- **Enterprise**: 5-tier strategic architecture with 116MB self-contained binaries

## 🌐 Primary Interface - Web Dashboard

### Start and Access:
```bash
# Start web dashboard (recommended)
pnpm --filter @claude-zen/web-dashboard dev

# Access at: http://localhost:3000/
# Startup time: ~1 second
# Features: Real-time monitoring, agent coordination, enterprise workflows
```

### Validation Scenario:
1. Run `pnpm --filter @claude-zen/web-dashboard dev`
2. Verify "VITE ready in ~1s" message appears  
3. Navigate to http://localhost:3000/
4. Confirm dashboard loads without errors
5. Test basic navigation between sections

## 📦 Build System & Processes

### Complete Build (NEVER CANCEL):
```bash
# Full build - NEVER CANCEL (5-6 minutes)
pnpm build
# Produces: dist/bundle/claude-zen-{linux|macos|win.exe} (116MB each)
```

### Incremental Builds:
```bash
# Build packages only (faster)
pnpm run build:packages

# Build WASM modules only (1-2 minutes)
pnpm run build:rust
# OR
./build-wasm.sh

# Build specific package
pnpm --filter @claude-zen/foundation build
```

### Build Artifacts:
- **Cross-platform binaries**: `dist/bundle/claude-zen-{linux|macos|win.exe}` (116MB each)
- **WASM modules**: `dist/wasm/` (neural processing acceleration)
- **Web dashboard**: Built into server bundle
- **SEA (Single Executable Applications)**: Self-contained with embedded V8

## 🧪 Testing Strategy

### IMPORTANT: Run Tests Per-Package Only
```bash
# ❌ DON'T: pnpm test (causes memory issues on full monorepo)

# ✅ DO: Test specific packages
pnpm --filter @claude-zen/foundation test
pnpm --filter @claude-zen/coordination test
pnpm --filter @claude-zen/web-dashboard test

# Foundation has partial tests (some failures expected)
# Other packages have varying test coverage
```

### Test Timing:
- Individual package tests: 3-5 seconds each
- Foundation package: ~4s but has some failing tests (expected)
- Memory constraints prevent full monorepo testing

## 🎯 Daily Development Commands

### Fast Feedback Loop:
```bash
# 1. Install (if needed)
pnpm install

# 2. Quick validation (1-2s)  
pnpm type-check

# 3. Start primary interface
pnpm --filter @claude-zen/web-dashboard dev

# 4. Make changes, then build when ready (NEVER CANCEL)
pnpm build
```

### Code Quality:
```bash
# Type checking (has pre-existing errors but completes)
pnpm type-check

# Linting (has many pre-existing issues - fix only if you touch affected code)
pnpm lint

# Package-specific type checking
pnpm --filter @claude-zen/foundation type-check
```

## 🔧 Domain-Specific Patterns

### Foundation Utilities:
```typescript
// Use centralized utilities from foundation
import { Result, ok, err, getLogger } from '@claude-zen/foundation'

// Avoid throwing exceptions, use Result patterns
const result = await someOperation();
if (result.success) {
  // handle success
} else {
  // handle error
}
```

### WASM Neural Processing:
```typescript
// ONLY access WASM through gateway - don't reimplement math in JS
import { forwardPass } from 'src/neural/wasm/gateway'

// Heavy compute must go through Rust/WASM
const neuralResult = await forwardPass(inputData);
```

### Database (Backend-Agnostic):
```typescript
// Keep code backend-agnostic (SQLite/LanceDB/Kuzu)
// Use pooling/caching utilities, no direct coupling
import { DatabaseAdapter } from '@claude-zen/database'
```

### Agent Coordination:
```typescript
// Use existing agent types/topologies - don't invent new generic types
// Follow established coordination patterns
import { AgentRegistry } from '@claude-zen/coordination'
```

## 🚨 What Works vs. Known Issues

### ✅ Fully Working:
- `pnpm install` - Fast, reliable dependency installation
- `pnpm type-check` - Completes despite errors (pre-existing issues)
- `pnpm build` - Produces working cross-platform binaries
- Web dashboard - Primary interface, starts quickly, works perfectly
- WASM build - Rust integration works, performance acceleration active
- Individual package builds - Work correctly when run separately

### ⚠️ Partial/Flaky:
- CLI binaries and main server in dev mode - Use web dashboard instead
- Full monorepo testing - Run per-package tests only due to memory constraints
- Type checking - Many pre-existing errors, but process completes successfully

### 🔍 Known Noisy Issues:
- Lint has many pre-existing issues - only fix if you touch affected code
- Type checking shows errors but build succeeds - expected behavior
- Some test failures in foundation package - partial test coverage expected

## 🎯 Validation Before You're Done

### Required Checks:
1. **Type-check passes**: `pnpm type-check` (ignore pre-existing errors)
2. **Build completes**: `pnpm build` creates binaries in `dist/bundle/`
3. **Dashboard starts**: `pnpm --filter @claude-zen/web-dashboard dev` and navigates properly
4. **Domain isolation**: Changes respect domain boundaries (coordination, neural, interfaces, memory, database)
5. **WASM routing**: Heavy compute goes via WASM gateway, no new generic agent types
6. **Backend-agnostic**: Database code doesn't bind to concrete DB backend

### Manual Validation Scenarios:

#### Scenario 1: Web Dashboard Functionality
```bash
# 1. Start dashboard
pnpm --filter @claude-zen/web-dashboard dev

# 2. Open browser to http://localhost:3000/
# 3. Verify dashboard loads without console errors
# 4. Test navigation between different sections
# 5. Confirm real-time updates work (if applicable)
```

#### Scenario 2: Build and Binary Creation
```bash
# 1. Run full build (NEVER CANCEL - wait 5-6 minutes)
pnpm build

# 2. Verify binaries exist:
ls -la dist/bundle/claude-zen-*
# Should show: claude-zen-linux, claude-zen-macos, claude-zen-win.exe (~116MB each)

# 3. Test binary functionality (if possible in environment)
```

#### Scenario 3: WASM Integration
```bash
# 1. Build WASM modules
./build-wasm.sh

# 2. Verify WASM artifacts
ls -la dist/wasm/
# Should show: TypeScript declarations and WASM modules

# 3. Test integration (if test exists)
node test-wasm-integration.mjs
```

## 📁 Key Files & Paths

### Configuration:
- `package.json` - Main package with 52+ workspace definitions
- `pnpm-workspace.yaml` - Workspace configuration
- `vitest.config.ts` - Testing setup (30s timeouts, happy-dom)
- `tsconfig.json` - TypeScript configuration

### Build Scripts:
- `build-wasm.sh` - WASM module build script
- `scripts/build.js` - Main build orchestration
- `scripts/build-sea.js` - Single Executable Application creation

### Core Directories:
- `apps/web-dashboard/` - Svelte web interface (primary)
- `packages/core/foundation/` - Core types, utilities, DI
- `packages/services/` - Enterprise services and coordination
- `src/` - Domain implementations (coordination, neural, interfaces, database)

## 🔄 Enterprise Methodologies

### Coordination Frameworks:
- **SAFe 6.0**: Enterprise portfolio planning, program increments
- **SPARC**: 5-phase systematic development methodology
- **Teamwork**: Multi-agent collaborative problem-solving
- **TaskMaster**: SOC2-compliant enterprise task management
- **XState Workflows**: Process orchestration and automation

### Multi-Database Architecture:
- **SQLite**: Structured relational data, agent state
- **LanceDB**: Vector embeddings, similarity search
- **Kuzu**: Graph database, complex relationships
- **Connection pooling**: Efficient resource management

## 🆘 Troubleshooting

### If Build Fails:
1. Check Node.js version: `node --version` (must be 22.18.0+)
2. Check pnpm version: `pnpm --version` (must be 10.15.0+)
3. Clean and reinstall: `rm -rf node_modules pnpm-lock.yaml && pnpm install`
4. Try building packages individually: `pnpm run build:packages`

### If Tests OOM/Fail:
```bash
# Don't run full monorepo tests
# Instead, run per-package:
pnpm --filter @claude-zen/foundation test
pnpm --filter @claude-zen/coordination test
```

### If Server Fails in Dev:
- Use the web dashboard alone - it's the primary interface
- Server is secondary - dashboard provides full functionality

### If WASM Build Fails:
- Rust will auto-install if missing
- Check internet connection for crate downloads
- Retry: `./build-wasm.sh` (includes automatic setup)

## 📝 Notes & Gotchas

- **Memory constraints**: Run tests per-package, not full monorepo
- **Type errors**: Many pre-existing, but build still succeeds
- **Primary interface**: Web dashboard at http://localhost:3000/
- **Secondary interfaces**: MCP/CLI are limited and partially functional
- **Domain boundaries**: Respect strict separation between coordination, neural, interfaces, memory, database
- **WASM performance**: All heavy compute must route through Rust/WASM gateway
- **Enterprise scale**: Platform supports 1000+ agents, 10,000+ tasks/minute
- **Binary size**: Cross-platform executables are 116MB each (self-contained)

## ❓ Ask if Unclear

If any rule here conflicts with local code patterns, prefer these validated instructions and surface the conflict in your PR/commit message. These instructions are based on extensive validation of the actual codebase and build processes.

**Remember**: This is a complex enterprise AI platform with sophisticated coordination, neural processing, and multi-database persistence. Always prioritize the web dashboard as the primary interface and respect domain boundaries.