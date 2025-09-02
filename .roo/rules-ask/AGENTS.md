# Ask Mode Guidelines for Claude Code Zen

## 🔍 Research Tool Integration for Information Discovery

### Context7 Documentation Research
```typescript
// Research library documentation and API references
// Use Context7 to find:
// - Package documentation and usage examples
// - API specifications and integration patterns
// - Best practices for specific technologies
// - Code examples and implementation guides
```

### SequentialThinking for Structured Information Gathering
```typescript
// Multi-step information gathering workflow:
// 1. Identify knowledge gaps and research questions
// 2. Gather information from multiple sources systematically
// 3. Analyze and synthesize findings
// 4. Validate information against project constraints
// 5. Document insights for future reference
```

### Research-Driven Question Scenarios

**Architecture Documentation Research:**
- **Context7**: Research domain separation patterns and architectural best practices
- **SequentialThinking**: Analyze how different architectural approaches impact the Claude Code Zen system
- **Integration**: Use project-research mode for deep architectural analysis

**API Integration Research:**
- **Context7**: Research external API documentation and integration patterns
- **SequentialThinking**: Evaluate integration options and their impact on system architecture
- **Integration**: Investigate cross-domain API communication patterns

**Performance Optimization Research:**
- **Context7**: Research performance optimization techniques for WASM, databases, and event systems
- **SequentialThinking**: Analyze performance trade-offs and optimization strategies
- **Integration**: Deep codebase analysis for performance patterns

**Security and Compliance Research:**
- **Context7**: Research security best practices and compliance requirements
- **SequentialThinking**: Evaluate security implementations and compliance frameworks
- **Integration**: Analyze TaskMaster and AI safety integration patterns

### Tool Selection Criteria

**Use Context7 when:**
- Researching unfamiliar libraries, frameworks, or technologies
- Looking for API documentation and integration examples
- Finding best practices for specific implementation patterns
- Investigating code examples and usage patterns

**Use SequentialThinking when:**
- Complex information gathering requiring systematic analysis
- Evaluating multiple options or approaches
- Synthesizing information from diverse sources
- Making decisions based on comprehensive analysis

**Switch to project-research mode when:**
- Information gathering requires deep codebase understanding
- Investigating project-specific patterns or constraints
- Analyzing historical context or architectural decisions
- Researching integration between multiple system components

## ❓ Information Gathering Patterns

### Architecture Documentation Sources

**Critical documentation hierarchy:**
1. **AGENTS.md**: General project guidance and patterns (primary reference)
2. **CLAUDE.md**: Symlink to AGENTS.md for consistency
3. **.github/copilot-instructions.md**: Build system and development workflows
4. **Package READMEs**: Individual package documentation
5. **Source code**: Implementation details and patterns

**Non-obvious information sources:**
- ESLint configuration reveals import restrictions and coding standards
- TypeScript config shows compilation constraints and module resolution
- Package.json scripts contain hidden build dependencies
- Test configurations reveal testing strategy and constraints

### Domain-Specific Question Patterns

**Coordination Domain Questions:**
```typescript
// Ask about SAFe/SPARC integration
// Ask about multi-agent orchestration patterns
// Ask about workflow engine configuration
// Ask about TaskMaster compliance requirements
```

**Neural Domain Questions:**
```typescript
// Ask about WASM performance requirements
// Ask about Rust gateway integration
// Ask about neural computation routing
// Ask about performance thresholds (>100μs)
```

**Interface Domain Questions:**
```typescript
// Ask about web-first architecture constraints
// Ask about MCP integration limitations
// Ask about Svelte dashboard features
// Ask about terminal interface scope
```

## 📚 Documentation Patterns

### Code Documentation Standards

**TSDoc requirements:**
```typescript
/**
 * Critical function with complex logic
 * @param input - Input data with specific format requirements
 * @param options - Configuration options affecting behavior
 * @returns Result with error handling patterns
 * @throws Specific error conditions that callers must handle
 * @example
 * ```typescript
 * const result = await processData(input, { validate: true });
 * if (result.success) {
 *   // handle success
 * } else {
 *   // handle specific error types
 * }
 * ```
 */
```

**Non-obvious documentation requirements:**
- All exported functions require TSDoc comments
- Error conditions must be explicitly documented
- Example usage must match actual API patterns
- Performance characteristics should be documented

### Architecture Decision Records

**ADR documentation requirements:**
```markdown
# ADR Title

## Status
[Proposed | Accepted | Deprecated]

## Context
[Business/technical context requiring decision]

## Decision
[Chosen solution with rationale]

## Consequences
[Positive and negative outcomes]
[Migration path if applicable]
[Performance/security implications]
```

## 🔍 Investigation Strategies

### Code Pattern Analysis

**Import pattern investigation:**
```typescript
// Check for foundation usage compliance
import { getLogger, Result, ok, err } from '@claude-zen/foundation';

// Verify domain boundary compliance
// Check for direct database imports (forbidden)
// Check for cross-domain function calls (anti-pattern)
```

**Configuration analysis:**
```json
// Check ESLint for restricted imports
// Check TypeScript for module resolution settings
// Check package.json for workspace dependencies
// Check build scripts for hidden requirements
```

### Performance Investigation

**Performance bottleneck identification:**
```typescript
// Check for operations >100μs not using WASM
// Check for synchronous database operations
// Check for unoptimized event handling
// Check for memory leaks in long-running processes
```

**Memory usage analysis:**
```bash
# Check for memory constraints in build processes
# Check for per-package testing requirements
# Check for incremental compilation benefits
```

## 🏗️ Architecture Understanding

### Domain Boundary Analysis

**Cross-domain communication patterns:**
```typescript
// Event-driven communication (preferred)
import { TypedEventBase } from '@claude-zen/foundation';
eventSystem.emit('coordination:agent:ready', data);

// Direct calls (avoid - breaks boundaries)
import { NeuralProcessor } from '@claude-zen/neural';
const result = processor.process(data); // ❌ Anti-pattern
```

**Domain responsibility verification:**
- Coordination: Agent orchestration, methodologies
- Neural: WASM-accelerated computation
- Interfaces: Web/MCP presentation layers
- Memory/Database: Separate caching/persistence

### Build System Understanding

**Build process analysis:**
```bash
# Understand 4-stage build process
# Package compilation → WASM → Bundle → Binary generation

# Critical timing requirements
# pnpm build: 5-6 minutes (NEVER CANCEL)
# ./build-wasm.sh: 1-2 minutes (NEVER CANCEL)
# pnpm type-check: 25-30 seconds (expected errors OK)
```

**Artifact investigation:**
```bash
# Binary analysis: 116MB self-contained executables
# WASM modules: TypeScript declarations for Rust neural acceleration
# Smart launchers: Platform auto-detection
# Bundle analysis: NCC packaging verification
```

## 🧪 Testing Strategy Understanding

### Test Organization Analysis

**Testing domain separation:**
```typescript
// Neural domain: Classical TDD (actual computation results)
// Coordination domain: London TDD (interaction protocols)
// Memory domain: Classical TDD (storage/retrieval)
// Database domain: Classical TDD (actual database operations)
// Interface domain: London TDD (interaction protocols)
```

**Test execution constraints:**
```bash
# Memory limitations prevent full monorepo testing
# Individual package testing required
# Integration tests need RUN_INTEGRATION=true
# E2E tests require special setup
```

## 🔒 Security & Compliance Analysis

### AI Safety Integration

**Safety monitoring requirements:**
```typescript
// All agent outputs must route through safety monitoring
import { AISafetyMonitor } from '@claude-zen/ai-safety';
const monitor = new AISafetyMonitor();
const safeResult = await monitor.validateAgentOutput(output);
```

**Compliance verification:**
- TaskMaster approval workflows
- SOC2 audit trail requirements
- Enterprise security constraints

### TaskMaster Compliance

**Approval workflow analysis:**
```typescript
// Production deployments require approval chains
// Audit trails must be maintained
// Human approval gates for critical operations
// Compliance monitoring and reporting
```

## 📊 Performance Analysis

### WASM Performance Requirements

**Performance threshold analysis:**
```typescript
// Operations >100μs must use WASM acceleration
// JavaScript math operations are forbidden for heavy computation
// Neural processing must route through Rust gateway
// Performance benchmarks required for optimization
```

**Optimization verification:**
```typescript
// Check for lazy loading implementation
// Verify connection pooling configuration
// Analyze event system performance (<1ms per event)
// Monitor memory usage patterns
```

## 🔧 Development Environment Analysis

### Toolchain Verification

**Version constraint analysis:**
```json
// Node.js: >=22.0.0 <24.0.0
// pnpm: >=10.15.0
// TypeScript: >=5.0.0
// Rust: Latest stable (auto-installs)
```

**Environment-specific configuration:**
```typescript
// Browser environment: Web dashboard with DOM globals
// Node.js environment: Server packages with restricted console
// Foundation: Cross-environment compatibility
```

## 🚀 Deployment Analysis

### Distribution Strategy

**Multi-format deployment:**
```bash
# npm packages for library consumption
# GitHub releases for binary distributions
# Docker containers for enterprise deployment
# Cross-platform executable generation
```

**Binary packaging analysis:**
```bash
# @yao-pkg/pkg for self-contained executables
# 116MB binaries with embedded V8
# Platform-specific optimization
# Smart launcher auto-detection
```

## 📈 Monitoring & Metrics

### System Monitoring Setup

**Enterprise monitoring requirements:**
```typescript
// Agent coordination efficiency tracking
// Database performance monitoring (SQLite/LanceDB/Kuzu)
// WASM processing acceleration metrics
// Web interface responsiveness tracking
```

**SAFe/SPARC metrics:**
```typescript
// Portfolio health monitoring
// Program increment velocity tracking
// 5-phase completion rate analysis
// Multi-agent collaboration success rates
```

## 🎯 Integration Analysis

### External System Integration

**MCP server integration:**
```typescript
// Limited scope for essential tools only
// Secondary to web dashboard interface
// Specific tool integration patterns
// Minimal comprehensive interface layer
```

**LLM provider integration:**
```typescript
// Multiple provider support (CLI, APIs, services)
// Standardized interface patterns
// Error handling and retry logic
// Performance monitoring and optimization
```

## 📋 Quality Assurance Analysis

### Code Quality Standards

**Multi-tool quality pipeline:**
```bash
# ESLint with TypeScript, SonarJS, Unicorn rules
# Prettier for consistent formatting
# Custom validation scripts
# Type checking with specific configurations
```

**Complexity limits:**
```typescript
// Cognitive complexity: <35 (SonarJS)
// Cyclomatic complexity: <20 (ESLint)
// Function length: <80 lines
// Parameter count: <4 (Google standard)
```

## 🔄 Migration & Evolution

### Architecture Evolution

**Version compatibility:**
```typescript
// Foundation package maintains backward compatibility
// Package interfaces follow semantic versioning
// Breaking changes require RFC process
// Migration paths must be documented
```

**Deprecation patterns:**
```typescript
// Deprecated APIs marked with @deprecated JSDoc
// Migration guides provided
// Graceful degradation supported
// Removal timelines communicated