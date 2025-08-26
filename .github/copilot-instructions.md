# claude-code-zen - Development Instructions

## Project Overview

Advanced AI development platform with sophisticated agent coordination, neural networks, and MCP integration

**Mission**: Enable autonomous AI-driven development through comprehensive agent coordination and intelligent tooling

## 📋 Document-Driven Development System

# claude-code-zen · AI Coding Agent Guide

Concise operational context so an autonomous agent can contribute safely & productively.

## 1. Core Purpose & Architecture

- Mission: transform product vision → production code via document-driven workflow + multi-agent swarms.
- Domains (keep boundaries): coordination · neural · interfaces · memory · database · core · intelligence · workflows.
- Orchestration: 147+ specialized agent types (DO NOT invent new generic agent types; reuse existing unions).
- Neural stack: Rust/WASM (fact-core) – ALWAYS route heavy compute through WASM (no JS re‑impls).
- Access WASM only through `src/neural/wasm/gateway.ts` (facade). Legacy loaders (`wasm-loader`, shims) are being removed.

## 2. Document-Driven Flow (Dynamic, Not Static Files)

Vision → ADR → PRD → Epic → Feature → Task → Code.
All persisted via `DocumentDrivenSystem` (`src/core/document-driven-system.ts`) into DB backends (SQLite / LanceDB / JSON). Never add static markdown outside dynamic processing unless explicitly under `docs/` for reference.

CLI examples:

```
claude-zen document create vision "Unified Memory Tier"
claude-zen document create adr "Neural Gateway Unification"
claude-zen workflow status
```

## 3. Key Conventions

- Strict domain isolation (dependency-cruiser rules enforce). Don’t import deep neural internals from coordination; go through façades/interfaces.
- Performance targets (must respect): coordination_latency <100ms, api_response <50ms, mcp_tool_execution <10ms, concurrent_agents >1000.
- Hybrid TDD: 70% London (interaction/mocks) via `tests/setup-london.ts`; 30% Classical (state/algorithms) via `tests/setup-classical.ts`; hybrid dispatcher in `tests/setup-hybrid.ts`.
- Use existing path aliases (`@core/`, `@coordination/`, etc.) per `vitest.config.ts` & tsconfig paths.
- For new neural features: create Rust → wasm-pack build (see `build-wasm.sh`) then expose through gateway; do NOT bypass optimizer/memory management.

## 4. Testing & Quality Gates

- Vitest for all testing suites with modern ESM support (`npm run test`, `npm run test:unit`).
- Setup files auto-augment globals—import `{ vi }` from `vitest` in any new ESM test utilities.
- Add London interaction helpers instead of manual spy plumbing.
- Coverage target 85%; prefer adding focused tests beside feature entry point under `src/__tests__/...`.

## 5. MCP & External Tooling

- MCP servers integrate research & analysis: Context7, DeepWiki, GitMCP, Semgrep. Access orchestrated via coordination domain. Do not hardcode HTTP fetches where an MCP tool abstraction exists.

## 6. Memory & Persistence

- Multi-backend abstraction (sqlite | lancedb | json) – select via backend factory; avoid coupling feature code to a concrete backend. Use pooling & caching utilities already in `src/memory/`.

## 7. Adding / Modifying WASM Logic

1. Implement/adjust Rust in fact-core subdir (or appropriate wasm module directory).
2. Run `npm run build:wasm` (or optimized variant) – artifacts flow into `src/neural/wasm/...`.
3. Expose ONLY through `NeuralWasmGateway.execute()`; update task routing there.
4. Add metrics updates (modulesLoaded, timings) when expanding gateway responsibilities.

## 8. Agent System Integration

- When extending coordination workflows, locate existing agent specialization; compose or configure—don’t subclass ad hoc.
- Respect existing topology strategies (hierarchical / mesh / ring / star) declared in config.

## 9. Performance & Safety Patterns

- Use lazy initialization (gateway initialize/optimize) – no eager WASM spins in module scope.
- Guard optional `globalThis.gc()` calls (already patterned in setups) if creating performance tests.
- Prefer streaming / incremental processing for large doc workflows.

## 10. Anti-Patterns (Avoid)

- Direct import of `src/neural/wasm/(binaries|fact-core|src)` internals.
- Creating new generic “Agent” types instead of reusing existing unions.
- Duplicating document workflow logic outside `DocumentDrivenSystem`.
- Heavy compute in JS when a WASM pathway exists.

## 11. Quick Commands

```
npm ci && npm run build
npm run test        # full vitest suites
npm run test:unit   # vitest unit focus
npm run deps:circular
npm run build:wasm
```

## 12. When Unsure

Trace from the domain facade (coordination/neural) inward; if an API isn’t exposed at a facade layer, add it there instead of reaching deeper.

Feedback welcome—ask for clarifications where domain boundaries or gateway usage feel ambiguous.
