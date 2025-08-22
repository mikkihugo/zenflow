#!/bin/bash

# Aider Build & Ownership Optimization Script
# Using GitHub Copilot for comprehensive build system improvements

set -e

echo "🚀 AIDER BUILD & OWNERSHIP OPTIMIZATION"
echo "========================================"

# Load GitHub Copilot token
COPILOT_TOKEN_FILE="/home/mhugo/.local/share/copilot-api/github_token"
if [ -f "$COPILOT_TOKEN_FILE" ]; then
    export GITHUB_TOKEN=$(cat "$COPILOT_TOKEN_FILE")
    echo "✅ GitHub Copilot token loaded"
else
    echo "❌ GitHub Copilot token not found at $COPILOT_TOKEN_FILE"
    exit 1
fi

# Comprehensive build optimization prompt
BUILD_OPTIMIZATION_PROMPT="COMPREHENSIVE BUILD & OWNERSHIP OPTIMIZATION TASK

MISSION: Transform this TypeScript monorepo into a production-ready, enterprise-grade system with optimal build performance, clear ownership patterns, and robust development workflows.

FOCUS AREAS:
============

1. BUILD SYSTEM OPTIMIZATION:
   - Analyze and optimize pnpm workspace configuration
   - Improve TypeScript build performance across packages
   - Enhance development and production build scripts
   - Optimize package.json scripts and dependencies
   - Implement efficient build caching strategies
   - Fix any build-time errors or warnings
   - Optimize bundling and compilation processes

2. DEPENDENCY MANAGEMENT:
   - Audit and optimize package dependencies
   - Fix any dependency conflicts or vulnerabilities
   - Ensure proper peer dependency management
   - Optimize import/export patterns
   - Clean up unused dependencies
   - Standardize version management across packages

3. OWNERSHIP & RESPONSIBILITY PATTERNS:
   - Establish clear package ownership boundaries
   - Implement proper service ownership patterns
   - Define clear API contracts between packages
   - Establish responsibility delegation patterns
   - Implement proper error ownership and handling
   - Create clear module responsibility definitions

4. DEVELOPMENT WORKFLOW OPTIMIZATION:
   - Optimize development server startup times
   - Improve hot reload and watch mode performance
   - Enhance debugging capabilities
   - Optimize test execution performance
   - Improve linting and type checking workflows
   - Standardize development scripts across packages

5. PRODUCTION READINESS:
   - Ensure robust error handling and logging
   - Implement proper health checks and monitoring
   - Optimize runtime performance
   - Ensure proper resource management
   - Implement graceful shutdown patterns
   - Add comprehensive observability

6. CODE ORGANIZATION & ARCHITECTURE:
   - Optimize module organization and structure
   - Improve code reusability and maintainability
   - Enhance separation of concerns
   - Optimize facade patterns and delegation
   - Improve service registration and discovery
   - Standardize architectural patterns

TECHNICAL REQUIREMENTS:
======================
- Maintain compatibility with existing strategic facade architecture
- Preserve the 6-layer strategic facade system
- Ensure all packages follow consistent patterns
- Optimize for both development and production environments
- Maintain type safety and strict TypeScript compliance
- Ensure backward compatibility where possible
- Follow enterprise-grade best practices

DELIVERABLES:
=============
- Optimized build configuration files
- Enhanced package.json scripts across all packages
- Improved development workflow scripts
- Optimized TypeScript configurations
- Enhanced error handling and logging
- Clear ownership documentation in code
- Improved service registration patterns
- Production-ready monitoring and health checks
- Optimized import/export structures
- Enhanced development tooling

Please analyze the entire codebase systematically and implement comprehensive improvements that make this a world-class, enterprise-ready TypeScript monorepo with optimal build performance and clear ownership patterns."

echo "🔧 PHASE 1: Build System Core Optimization"
echo "==========================================="

cd /home/mhugo/code/claude-code-zen

# Phase 1: Core build system files
aider \
    --model github/gpt-4o \
    --message "$BUILD_OPTIMIZATION_PROMPT

PHASE 1 FOCUS: Core build system optimization
TARGET FILES: Root configuration and build system files

Analyze and optimize:
- package.json (root workspace configuration)
- pnpm-workspace.yaml
- tsconfig.json (root TypeScript configuration)
- vitest.config.ts
- .gitignore and build artifacts
- Development scripts and workflows

Implement comprehensive build system improvements with focus on performance, reliability, and developer experience." \
    package.json \
    pnpm-workspace.yaml \
    tsconfig.json \
    vitest.config.ts \
    .gitignore \
    bin/claude-zen-cli.js \
    bin/claude-zen-final.js

echo "✅ Phase 1 completed"

echo "🔧 PHASE 2: Package-Level Build Optimization"  
echo "============================================="

# Phase 2: Individual package build configurations
aider \
    --model github/gpt-4.1 \
    --message "$BUILD_OPTIMIZATION_PROMPT

PHASE 2 FOCUS: Package-level build optimization and ownership patterns
TARGET FILES: Individual package configurations

Analyze and optimize each package's:
- package.json configuration and scripts
- tsconfig.json settings
- Build and development workflows
- Dependency management
- Export/import patterns
- Service ownership boundaries

Focus on the strategic facade packages and implementation packages." \
    packages/foundation/package.json \
    packages/foundation/tsconfig.json \
    packages/intelligence/package.json \
    packages/intelligence/tsconfig.json \
    packages/enterprise/package.json \
    packages/enterprise/tsconfig.json \
    packages/operations/package.json \
    packages/operations/tsconfig.json \
    packages/infrastructure/package.json \
    packages/infrastructure/tsconfig.json \
    packages/development/package.json \
    packages/development/tsconfig.json

echo "✅ Phase 2 completed"

echo "🔧 PHASE 3: Implementation Package Optimization"
echo "==============================================="

# Phase 3: Implementation packages optimization  
aider \
    --model github/gpt-4o \
    --message "$BUILD_OPTIMIZATION_PROMPT

PHASE 3 FOCUS: Implementation package optimization and ownership
TARGET FILES: Core implementation packages

Optimize build systems and ownership patterns for:
- LLM providers package
- AI linter package
- Repository analyzer package
- Service container package
- Other implementation packages

Focus on clear ownership boundaries, optimized builds, and production readiness." \
    packages/llm-providers/package.json \
    packages/llm-providers/tsconfig.json \
    packages/ai-linter/package.json \
    packages/ai-linter/tsconfig.json \
    packages/repo-analyzer/package.json \
    packages/repo-analyzer/tsconfig.json \
    packages/implementation-packages/service-container/package.json \
    packages/implementation-packages/service-container/tsconfig.json

echo "✅ Phase 3 completed"

echo "🔧 PHASE 4: Server Application Build Optimization"
echo "================================================="

# Phase 4: Server application optimization
aider \
    --model github/gpt-4.1 \
    --message "$BUILD_OPTIMIZATION_PROMPT

PHASE 4 FOCUS: Server application build and runtime optimization  
TARGET FILES: Main server application

Optimize the core server application:
- Build performance and startup time
- Development workflow optimization
- Production deployment readiness
- Service ownership and responsibility patterns
- Error handling and monitoring
- Resource management and performance

Focus on making the server enterprise-ready with optimal build performance." \
    apps/claude-code-zen-server/package.json \
    apps/claude-code-zen-server/tsconfig.json \
    apps/claude-code-zen-server/scripts/dev-runner.js

echo "✅ Phase 4 completed"

echo "🔧 PHASE 5: Web Dashboard Build Optimization"
echo "============================================="

# Phase 5: Web dashboard optimization
aider \
    --model github/gpt-4o \
    --message "$BUILD_OPTIMIZATION_PROMPT

PHASE 5 FOCUS: Web dashboard build and deployment optimization
TARGET FILES: Svelte web dashboard

Optimize the web dashboard:
- Svelte build performance
- Development server optimization  
- Production build optimization
- Asset bundling and optimization
- Development workflow improvements
- Production deployment readiness

Ensure optimal build performance and production readiness." \
    apps/web-dashboard/package.json \
    apps/web-dashboard/vite.config.ts \
    apps/web-dashboard/tsconfig.json \
    apps/web-dashboard/svelte.config.js

echo "✅ Phase 5 completed"

echo "🎉 BUILD OPTIMIZATION COMPLETED"
echo "==============================="
echo "All phases completed successfully!"
echo "✅ Core build system optimized"
echo "✅ Package-level configurations enhanced"
echo "✅ Implementation packages optimized"  
echo "✅ Server application build improved"
echo "✅ Web dashboard build optimized"
echo ""
echo "🚀 Ready for production deployment with optimal build performance!"

exit 0