# Coder (Rust headless engine)

This is a minimal Rust workspace that builds only the Rust components of Zenflow, with no CLI/TUI binaries. It is designed to be embedded and driven via the event bus through providers in the TypeScript layer:
- Code Mesh core library (core concurrency/tooling)
- Neural core crates (pure Rust ML)
- Fact system (Rust)

Design rules:
- Headless only: no CLI/TUI surfaces in this workspace.
- Provider-agnostic: do not embed LLM SDKs; route LLM requests via the platform EventBus to @claude-zen/*-provider packages.
- Optional features like Copilot are gated behind cargo features and disabled by default.

## Quick start

```bash
# From repo root
cd packages/tools/coder
cargo build -p code-mesh-core --release
```

## Usage

This package provides the `code-mesh-core` Rust library for high-performance code analysis.
It can be used as a dependency in other Rust projects or compiled to WASM for use in TypeScript.

You can enable optional features by setting cargo features when embedding. GitHub Copilot-related modules are behind the `copilot` feature and OFF by default.
