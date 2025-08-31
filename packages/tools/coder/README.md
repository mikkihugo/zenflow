# Coder (Rust-only workspace)

This is a minimal Rust workspace that builds only the Rust components of Zenflow:
- Code Mesh core library
- Neural core crates (pure Rust ML)
- Fact system (Rust)

## Quick start

```bash
# From repo root
cd packages/tools/coder
cargo build -p code-mesh-core --release
```

## Usage

This package provides the `code-mesh-core` Rust library for high-performance code analysis.
It can be used as a dependency in other Rust projects or compiled to WASM for use in TypeScript.

You can enable optional crates (TUI/WASM) by uncommenting them in `Cargo.toml`.
