# Coder (Rust-only)

This folder is a thin workspace that builds only the Rust components from the monorepo.

- Use `cargo build -p <crate>` to build individual crates.
- The workspace members point to the existing Rust crates under `packages/`.
- No Node/TS code is included here.

Quick start:

1. Install Rust stable (rustup) and `wasm-pack` if building WASM crates.
2. From this folder, run:

```
cargo build --workspace
```

To run the CLI:

```
cargo run -p code-mesh-cli -- --help
```
