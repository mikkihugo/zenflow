# Coder (Rust-only workspace)

This is a minimal Rust workspace that builds only the Rust components of Zenflow:
- Singularity Coder core + CLI
- Neural core crates (pure Rust ML)
- Fact system (Rust)

## Quick start

```bash
# From repo root
cd packages/tools/coder
cargo metadata --no-deps --format-version 1
cargo build -p code-mesh-cli --release
```

You can enable optional crates (TUI/WASM) by uncommenting them in `Cargo.toml`.
