# GitHub Copilot Instructions for Claude Code Zen

**ALWAYS follow these instructions first and only fallback to additional search and context gathering if the information here is incomplete or found to be in error.**

## Project Overview

Claude Code Zen is an advanced AI development platform with sophisticated agent coordination, neural networks, and MCP integration. This is a complex monorepo with 52+ packages using a 5-tier architecture system.

**Architecture**: Coordination · Neural · Interfaces · Memory · Database domains with specialized agent coordination system.

## Essential Setup Requirements

### Prerequisites
- **Node.js**: Version 22.18.0+ (REQUIRED - will not work with older versions)
- **pnpm**: Version 10.15.0+ (REQUIRED - npm will not work properly)
- **Rust**: Latest stable (for WASM modules)
- **Platform**: Linux/macOS/Windows supported

### Installation Commands
```bash
# Install dependencies - Takes 2-20 seconds depending on cache
pnpm install

# Install missing test dependency (REQUIRED)
pnpm add -D -w happy-dom
```

## Build System - CRITICAL TIMING INFORMATION

### Main Build Process
```bash
# NEVER CANCEL: Build takes 1-2 minutes (much faster than expected)
# Timeout: Set 10+ minutes to be safe
pnpm run build
```

**Build Results**: Creates cross-platform binaries (Linux, macOS, Windows) in `dist/bundle/`:
- `claude-zen-linux` (116MB)
- `claude-zen-macos` (116MB) 
- `claude-zen-win.exe` (116MB)

### Package-Specific Builds
```bash
# Build all packages individually - Takes 2-5 minutes
# NEVER CANCEL: Set timeout to 15+ minutes
pnpm run build:packages

# Build WASM modules (Rust compilation) - Takes 1-2 minutes
# NEVER CANCEL: Set timeout to 10+ minutes
pnpm run build:rust

# Build WASM with script - Takes 1-2 minutes for wasm-pack installation
./build-wasm.sh
```

## Testing Infrastructure

### Test Execution - IMPORTANT LIMITATIONS
```bash
# Foundation package tests (PARTIAL SUCCESS - has known failing tests)
# Takes 3-5 seconds, expect some failures due to incomplete implementations
pnpm --filter @claude-zen/foundation test

# Full test suite (MEMORY ISSUES - avoid on limited systems)
# NEVER CANCEL: Would take 15+ minutes if successful
# Currently fails due to memory constraints and incomplete tests
pnpm test
```

**Testing Status**: Tests have known issues with missing implementations and memory usage. Individual package testing works better than full suite.

## Development Workflow

### Development Servers
```bash
# Start web dashboard only (WORKS PERFECTLY)
# Takes 5-10 seconds to start
pnpm --filter @claude-zen/web-dashboard dev
# Access at: http://localhost:3000

# Start both server and dashboard (PARTIAL - server has issues)
pnpm dev
# Dashboard works, server fails due to missing dependencies
```

**Web Dashboard**: Fully functional Svelte-based interface with real-time monitoring, SAFe 6.0 metrics, system health, and performance analytics.

### CLI Usage
```bash
# Built binaries (have runtime issues - work in progress)
./dist/bundle/claude-zen-linux --help
./dist/bundle/claude-zen-macos --help

# Development CLI (has path resolution issues)
./bin/claude-zen --help
```

## Code Quality and Validation

### TypeScript Checking
```bash
# Type checking across all packages - Takes 1-2 seconds
# WORKS PERFECTLY - no errors
pnpm type-check
```

### Linting and Formatting
```bash
# Lint and format - Takes 10-15 seconds
# NEVER CANCEL: Set timeout to 5+ minutes
# EXPECT FAILURES: Has 2200+ existing lint issues (not your responsibility to fix)
pnpm lint
```

**Linting Status**: Repository has extensive existing lint issues (1666 errors, 534 warnings). These are pre-existing and should not be fixed unless directly related to your changes.

## Manual Validation Scenarios

### ALWAYS Test These After Making Changes

1. **Web Dashboard Functionality**:
   ```bash
   pnpm --filter @claude-zen/web-dashboard dev
   # Visit http://localhost:3000
   # Verify dashboard loads with metrics, navigation works
   # Test all sidebar navigation items
   ```

2. **Build System Integrity**:
   ```bash
   pnpm run build
   # Verify dist/bundle/ contains binaries
   # Check build completes without critical errors
   ```

3. **TypeScript Compilation**:
   ```bash
   pnpm type-check
   # Must pass with exit code 0
   ```

4. **Package Installation**:
   ```bash
   pnpm install
   # Must complete successfully in under 30 seconds
   ```

## Key Project Structure

### Workspace Packages (31 total)
- `apps/claude-code-zen-server` - Main server application
- `apps/web-dashboard` - Svelte web interface
- `packages/core/foundation` - Core foundation systems
- `packages/core/memory` - Memory management
- `packages/services/*` - Service implementations
- `packages/tools/*` - Development tools
- `packages/integrations/*` - External integrations

### Critical Files
- `vitest.config.ts` - Test configuration with 30s timeouts
- `package.json` - Main workspace configuration
- `pnpm-workspace.yaml` - Workspace definition
- `build-wasm.sh` - WASM build script
- `.github/copilot-instructions.md` - These instructions

## Performance Expectations

| Operation | Expected Time | Timeout Setting | Status |
|-----------|---------------|-----------------|---------|
| `pnpm install` | 2-20 seconds | 2 minutes | ✅ Works |
| `pnpm build` | 1-2 minutes | 10 minutes | ✅ Works |
| `pnpm type-check` | 1-2 seconds | 1 minute | ✅ Works |
| `pnpm test` | 15+ minutes | 30 minutes | ⚠️ Has issues |
| `pnpm lint` | 10-15 seconds | 5 minutes | ⚠️ Many existing issues |
| Dashboard dev | 5-10 seconds | 2 minutes | ✅ Works perfectly |

## Domain-Specific Guidelines

### Neural Domain (src/neural/*)
- ALWAYS route heavy compute through WASM (no JS re-implementations)
- Access WASM only through `src/neural/wasm/gateway.ts` facade
- Use Rust/WASM for performance-critical operations

### Coordination Domain (src/coordination/*)
- Use flexible agent type system (NO arbitrary limitations on agent types)
- Agent types are configurable strings based on capabilities and needs
- Respect existing topology strategies (hierarchical/mesh/ring/star)
- Use established agent selection and coordination patterns
- Follow SAFe 6.0 and SPARC enterprise methodologies for coordination

### Memory Domain (src/memory/*)
- Multi-backend abstraction (SQLite/LanceDB/JSON)
- Use pooling and caching utilities
- Never couple feature code to concrete backend

### Database Domain (packages/core/database/*)
- Multi-adapter database system (SQLite/LanceDB/Kuzu)
- Kuzu graph database for complex relationship modeling
- Database connection pooling and transaction management
- Schema migration and database health monitoring

### Interfaces Domain (src/interfaces/*)
- Web dashboard as primary interface (comprehensive Svelte-based management)
- MCP servers for limited tool integration (secondary interface)
- Basic terminal screens for status display only (minimal implementation)
- Focus on web-first development and dashboard functionality

## Common Issues and Workarounds

### Build Issues
- **Problem**: TypeScript compilation errors in foundation package
- **Workaround**: These are existing issues with `node:` imports, continue with build

### Test Issues
- **Problem**: Memory exhaustion in test suite
- **Workaround**: Test individual packages with `pnpm --filter <package> test`

### CLI Issues
- **Problem**: Binary path resolution errors
- **Workaround**: Use development dashboard instead: `pnpm --filter @claude-zen/web-dashboard dev`

### Server Issues
- **Problem**: Main server fails to start in development
- **Workaround**: Web dashboard works independently and provides full functionality

## Validation Checklist for Agents

Before completing any work, ALWAYS verify:

- [ ] `pnpm install` completes successfully
- [ ] `pnpm type-check` passes without errors
- [ ] `pnpm run build` completes and creates binaries in `dist/bundle/`
- [ ] Web dashboard starts and loads at `http://localhost:3000`
- [ ] Dashboard navigation and core functionality works
- [ ] Any new code follows domain isolation principles
- [ ] No artificial agent type restrictions (use descriptive agent type strings as needed)
- [ ] WASM operations go through proper gateway facade

## NEVER CANCEL Operations

**CRITICAL**: These operations MUST complete. Set appropriate timeouts:

- `pnpm run build` - Set 10+ minute timeout
- `pnpm run build:packages` - Set 15+ minute timeout  
- `pnpm run build:rust` - Set 10+ minute timeout
- `pnpm test` (if running) - Set 30+ minute timeout
- Any WASM compilation - Set 10+ minute timeout

## Repository Health Status

✅ **Working Perfectly**: Web dashboard, build system, TypeScript checking
⚠️ **Partial Issues**: CLI binaries, main server, test suite
❌ **Known Broken**: Full test suite execution, lint without errors

This is a sophisticated development platform. Focus on the working components (dashboard, build system) and use them to validate your changes effectively.