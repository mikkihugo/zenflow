#!/bin/bash
# Build script for claude-zen neural core with WASM support
# This builds both the native Rust library and WASM module

set -e

echo "🦀 Building Claude-Zen Neural Core..."

# Build native library with all features
echo "📦 Building native library with all features..."
cargo build --release --all-features

# Build WASM module if wasm-pack is available
if command -v wasm-pack &> /dev/null; then
    echo "🌐 Building WASM module..."
    wasm-pack build \
        --target web \
        --out-dir pkg \
        --features wasm \
        --release
    
    echo "✅ WASM build completed. Output in pkg/ directory."
    
    # Copy to parent wasm directory if it exists
    if [ -d "../../wasm/" ]; then
        echo "📂 Copying WASM files to ../../wasm/"
        cp pkg/*.wasm ../../wasm/ || true
        cp pkg/*.js ../../wasm/ || true 
        cp pkg/*.d.ts ../../wasm/ || true
    fi
else
    echo "⚠️  wasm-pack not found. Skipping WASM build."
    echo "   Install with: curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh"
fi

echo "🎉 Build completed!"
echo ""
echo "Available features:"
echo "  • std: Standard library support (default)"
echo "  • parallel: SIMD acceleration with Rayon (default)"
echo "  • gpu-backend: GPU acceleration via WGPU/Burn (default)"
echo "  • wasm: WebAssembly bindings"
echo "  • io: File I/O and serialization"
echo "  • burn-backend: Modern neural network framework"
echo "  • smartcore-backend: Traditional ML algorithms"
echo ""
echo "Usage examples:"
echo "  cargo build                           # Default: CPU + GPU + SIMD"
echo "  cargo build --features wasm          # WASM only"
echo "  cargo build --all-features           # Everything"
echo "  wasm-pack build --features wasm      # WASM with wasm-pack"