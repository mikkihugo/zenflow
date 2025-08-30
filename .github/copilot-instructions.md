## GitHub Copilot Instructions — Zenflow (Claude Code Zen)

- Setup (required): Node 22.18.0+, pnpm 10.15.0+, Rust stable. Install deps with: pnpm install
- Quick checks (fast): pnpm type-check (1–2s). Web UI: pnpm --filter @claude-zen/web-dashboard dev → http://localhost:3000
- Build (don’t cancel): pnpm build (1–2 min) produces dist/bundle/{claude-zen-linux|macos|win.exe}
- Tests: run per-package only (foundation has partial tests). Avoid pnpm test on the full monorepo for now.

Architecture at a glance
- Domains: Coordination · Neural · Interfaces · Memory · Database (packages under packages/*; apps/web-dashboard is the primary UI)
- Neural: heavy compute goes through Rust/WASM only via src/neural/wasm/gateway.ts (don’t reimplement math in JS)
- Coordination: use existing agent types/topologies; don’t invent new generic agent types
- Memory/Database: keep code backend-agnostic (SQLite/LanceDB/Kuzu); use pooling/caching utilities; no direct coupling
- Interfaces: prioritize the web dashboard; MCP/CLI are secondary and partially limited

Daily commands
- pnpm install  ·  pnpm type-check  ·  pnpm --filter @claude-zen/web-dashboard dev  ·  pnpm build
- Package builds: pnpm run build:packages  ·  WASM: pnpm run build:rust or ./build-wasm.sh

What works vs. flaky
- Works: install, type-check, build, web dashboard
- Partial: CLI binaries and main server in dev
- Known noisy: lint has many pre-existing issues; fix only if you touch affected code

Key files/paths to know
- vitest.config.ts (30s timeouts, happy-dom), build-wasm.sh, pnpm-workspace.yaml, package.json scripts
- apps/web-dashboard/ (Svelte UI), packages/core/foundation/ (types/utils), packages/services/* (features)

Patterns to follow (with examples)
- Result-style errors and centralized utilities from foundation:
   import { Result, ok, err, getLogger } from '@claude-zen/foundation'
- WASM access through the gateway only:
   import { forwardPass } from 'src/neural/wasm/gateway'

Validation before you’re done
- Type-check passes, build completes with binaries, dashboard starts and navigates
- Changes respect domain isolation and don’t bind to a concrete DB backend
- Any heavy compute routed via WASM gateway; no new generic agent types

Notes and gotchas
- If tests OOM/fail, run per-package (pnpm --filter <pkg> test)
- If server fails in dev, use the dashboard alone; it’s the primary interface

Ask if unclear: If a rule here conflicts with local code, prefer these instructions and surface the conflict in your PR/commit message.