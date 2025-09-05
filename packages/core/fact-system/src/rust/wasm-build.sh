#!/bin/bash
set -e

# Build the Rust crate to WASM using wasm-pack
wasm-pack build --release --target bundler --out-dir ../../typescript/fact_tools_wasm

echo "WASM build complete. Output in src/typescript/fact_tools_wasm/"