#!/bin/bash

# Aider Monorepo Comprehensive Linting Script
# Using GitHub Copilot for systematic code quality improvements

set -e

echo "🚀 AIDER MONOREPO COMPREHENSIVE LINTING"
echo "======================================="

# Load GitHub Copilot token
COPILOT_TOKEN_FILE="/home/mhugo/.local/share/copilot-api/github_token"
if [ -f "$COPILOT_TOKEN_FILE" ]; then
    export GITHUB_TOKEN=$(cat "$COPILOT_TOKEN_FILE")
    echo "✅ GitHub Copilot token loaded"
else
    echo "❌ GitHub Copilot token not found at $COPILOT_TOKEN_FILE"
    exit 1
fi

# Comprehensive monorepo linting prompt
MONOREPO_LINTING_PROMPT="COMPREHENSIVE MONOREPO LINTING AND CODE QUALITY OPTIMIZATION

MISSION: Perform systematic linting and code quality improvements across the entire TypeScript monorepo with focus on enterprise-grade standards, type safety, and maintainability.

FOCUS AREAS:
============

1. TYPESCRIPT QUALITY:
   - Fix all TypeScript errors and warnings
   - Improve type definitions and interfaces
   - Enhance strict mode compliance
   - Optimize import/export statements
   - Fix any 'any' types with proper typing
   - Improve generic type constraints
   - Fix module resolution issues

2. ESLint COMPLIANCE:
   - Fix all ESLint violations
   - Improve code style consistency
   - Fix unused variables and imports
   - Optimize variable naming conventions
   - Fix indentation and formatting issues
   - Improve JSDoc documentation
   - Fix accessibility issues

3. CODE ORGANIZATION:
   - Optimize file structure and organization
   - Improve separation of concerns
   - Fix circular dependencies
   - Optimize barrel exports
   - Improve module boundaries
   - Standardize file naming conventions

4. PERFORMANCE OPTIMIZATION:
   - Fix performance anti-patterns
   - Optimize async/await usage
   - Improve error handling patterns
   - Fix memory leaks and resource cleanup
   - Optimize bundle size and tree shaking
   - Improve lazy loading patterns

5. SECURITY IMPROVEMENTS:
   - Fix security vulnerabilities
   - Improve input validation
   - Fix XSS and injection vulnerabilities
   - Improve authentication patterns
   - Fix insecure dependencies
   - Improve error message security

6. MAINTAINABILITY:
   - Reduce code complexity
   - Improve readability and clarity
   - Fix code duplication
   - Improve error messages
   - Standardize patterns across packages
   - Improve debugging capabilities

7. STRATEGIC FACADE COMPLIANCE:
   - Ensure proper facade delegation patterns
   - Fix direct package import violations
   - Improve lazy loading implementations
   - Fix architectural boundary violations
   - Optimize strategic facade performance
   - Improve type safety in facades

TECHNICAL REQUIREMENTS:
======================
- Maintain backward compatibility
- Preserve existing functionality
- Follow TypeScript strict mode
- Maintain strategic facade architecture
- Ensure all tests continue to pass
- Follow monorepo best practices
- Maintain package.json consistency
- Preserve git history and attribution

LINTING PRIORITIES:
==================
1. Critical errors that break compilation
2. Type safety violations
3. Security vulnerabilities
4. Performance issues
5. Code style and organization
6. Documentation improvements
7. Best practice optimizations

Please systematically analyze and improve code quality across all packages while maintaining the existing architecture and functionality."

echo "🔧 PHASE 1: Strategic Facade Packages Linting"
echo "=============================================="

cd /home/mhugo/code/claude-code-zen

# Phase 1: Strategic Facade Packages (Core Architecture)
aider \
    --model github/gpt-4.1 \
    --message "$MONOREPO_LINTING_PROMPT

PHASE 1 FOCUS: Strategic facade packages linting and optimization
TARGET: Foundation, Intelligence, Enterprise, Operations, Infrastructure, Development facades

Lint and optimize all strategic facade packages:
- Fix TypeScript compilation errors
- Improve type safety and strict mode compliance
- Optimize delegation patterns and lazy loading
- Fix ESLint violations and code style issues
- Improve error handling and validation
- Optimize performance and memory usage
- Fix security issues and vulnerabilities
- Improve documentation and maintainability

Focus on the 6-layer strategic facade architecture and ensure all facades follow proper delegation-only patterns." \
    packages/foundation/src/index.ts \
    packages/foundation/src/config.ts \
    packages/foundation/src/logging.ts \
    packages/foundation/src/error-handling.ts \
    packages/foundation/src/utilities.ts \
    packages/intelligence/src/index.ts \
    packages/enterprise/src/index.ts \
    packages/operations/src/index.ts \
    packages/infrastructure/src/index.ts \
    packages/development/src/index.ts

echo "✅ Phase 1 completed - Strategic Facade Packages"

echo "🔧 PHASE 2: Implementation Packages Linting"
echo "==========================================="

# Phase 2: Implementation Packages (Core Logic)
aider \
    --model github/gpt-4o \
    --message "$MONOREPO_LINTING_PROMPT

PHASE 2 FOCUS: Implementation packages comprehensive linting
TARGET: LLM providers, AI linter, repo analyzer, service container, and other implementation packages

Lint and optimize all implementation packages:
- Fix all TypeScript errors and improve type definitions
- Resolve ESLint violations and improve code consistency
- Optimize async/await patterns and error handling
- Fix security vulnerabilities and improve validation
- Reduce code complexity and improve maintainability
- Fix performance issues and memory leaks
- Improve test coverage and reliability
- Standardize patterns across implementation packages

Focus on enterprise-grade code quality and production readiness." \
    packages/llm-providers/ \
    packages/ai-linter/ \
    packages/repo-analyzer/ \
    packages/language-parsers/ \
    packages/implementation-packages/

echo "✅ Phase 2 completed - Implementation Packages"

echo "🔧 PHASE 3: Server Application Linting"
echo "======================================"

# Phase 3: Server Application (Main Coordination System)
aider \
    --model github/gpt-4.1 \
    --message "$MONOREPO_LINTING_PROMPT

PHASE 3 FOCUS: Server application comprehensive linting and optimization
TARGET: Main server coordination system, APIs, and integration layers

Lint and optimize the server application:
- Fix TypeScript compilation errors and improve type safety
- Resolve ESLint violations and improve code organization
- Optimize coordination patterns and event systems
- Fix performance bottlenecks and memory issues
- Improve error handling and logging
- Fix security vulnerabilities in APIs and integrations
- Optimize database operations and queries
- Improve monitoring and observability
- Fix integration issues and improve reliability

Focus on enterprise-grade server application quality and production readiness." \
    apps/claude-code-zen-server/

echo "✅ Phase 3 completed - Server Application"

echo "🔧 PHASE 4: Web Dashboard Linting"
echo "================================="

# Phase 4: Web Dashboard (Svelte Frontend)
aider \
    --model github/gpt-4o \
    --message "$MONOREPO_LINTING_PROMPT

PHASE 4 FOCUS: Web dashboard linting and optimization
TARGET: Svelte frontend application and related assets

Lint and optimize the web dashboard:
- Fix TypeScript errors in Svelte components
- Improve component structure and organization
- Fix accessibility issues and improve UX
- Optimize bundle size and performance
- Fix security vulnerabilities (XSS, etc.)
- Improve responsive design and mobile compatibility
- Fix ESLint violations and improve code consistency
- Optimize API integration and error handling
- Improve state management and data flow

Focus on modern web application best practices and user experience." \
    apps/web-dashboard/

echo "✅ Phase 4 completed - Web Dashboard"

echo "🔧 PHASE 5: Root Configuration and Build System"
echo "==============================================="

# Phase 5: Root Configuration (Workspace and Build)
aider \
    --model github/gpt-4.1 \
    --message "$MONOREPO_LINTING_PROMPT

PHASE 5 FOCUS: Root configuration and build system optimization
TARGET: Workspace configuration, build scripts, and development tools

Lint and optimize root configuration:
- Fix package.json scripts and dependencies
- Optimize TypeScript configuration across workspace
- Fix ESLint and Prettier configuration issues
- Improve build system performance and reliability
- Fix development workflow issues
- Optimize testing and CI/CD configuration
- Fix security vulnerabilities in dependencies
- Improve documentation and developer experience
- Standardize configuration across all packages

Focus on monorepo best practices and developer productivity." \
    package.json \
    pnpm-workspace.yaml \
    tsconfig.json \
    .eslintrc.json \
    vitest.config.ts \
    bin/ \
    scripts/

echo "✅ Phase 5 completed - Root Configuration"

echo "🎉 MONOREPO LINTING COMPLETED"
echo "============================="
echo "All phases completed successfully!"
echo "✅ Strategic facade packages optimized"
echo "✅ Implementation packages enhanced"
echo "✅ Server application improved"
echo "✅ Web dashboard optimized"
echo "✅ Root configuration standardized"
echo ""
echo "🚀 Monorepo now has enterprise-grade code quality and maintainability!"
echo ""
echo "🔍 NEXT STEPS:"
echo "1. Run 'pnpm type-check' to verify TypeScript compilation"
echo "2. Run 'pnpm lint' to verify ESLint compliance"
echo "3. Run 'pnpm test' to verify all tests pass"
echo "4. Run 'pnpm build' to verify production build"

exit 0