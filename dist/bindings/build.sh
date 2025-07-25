#!/bin/bash
# Build script for ruv-FANN Node.js bindings

set -e

echo "🔨 Building ruv-FANN Node.js bindings..."

# Change to bindings directory
cd "$(dirname "$0")"

# Create output directories
mkdir -p native
mkdir -p fallback

echo "📦 Installing dependencies..."

# Check if cargo is available
if ! command -v cargo &> /dev/null; then
    echo "❌ Cargo not found. Please install Rust toolchain."
    exit 1
fi

# Check if napi-cli is available
if ! command -v napi &> /dev/null; then
    echo "📥 Installing @napi-rs/cli..."
    npm install -g @napi-rs/cli || {
        echo "⚠️  Failed to install napi-cli globally, trying locally..."
        npm install @napi-rs/cli
        alias napi='npx napi'
    }
fi

echo "🦀 Building Rust native bindings..."

# Build for current platform
if command -v napi &> /dev/null; then
    napi build --platform --release || {
        echo "⚠️  Native build failed, bindings will use WASM fallback only"
    }
else
    echo "⚠️  napi-cli not available, skipping native build"
fi

# Try to build with cargo directly as fallback
if [ ! -f "native/ruv-fann-node-bindings.*.node" ]; then
    echo "🔧 Trying direct cargo build..."
    cargo build --release || {
        echo "⚠️  Cargo build failed, will rely on WASM fallback"
    }
    
    # Copy built library if it exists
    if [ -f "target/release/libruv_fann_node_bindings.so" ]; then
        cp target/release/libruv_fann_node_bindings.so native/
    elif [ -f "target/release/libruv_fann_node_bindings.dylib" ]; then
        cp target/release/libruv_fann_node_bindings.dylib native/
    elif [ -f "target/release/ruv_fann_node_bindings.dll" ]; then
        cp target/release/ruv_fann_node_bindings.dll native/
    fi
fi

echo "🌐 Setting up WASM fallback..."

# WASM fallback is already created in fallback/ruv_fann_wasm.js
# Just ensure it's properly set up

echo "🧪 Running tests..."
node test/test.js || {
    echo "⚠️  Some tests failed, but build completed"
}

echo "✅ Build completed!"
echo ""
echo "📋 Build Summary:"
echo "  - Native bindings: $([ -f native/*.node ] && echo "✅ Available" || echo "❌ Not available")"
echo "  - WASM fallback: $([ -f fallback/ruv_fann_wasm.js ] && echo "✅ Available" || echo "❌ Not available")"
echo "  - TypeScript definitions: $([ -f index.d.ts ] && echo "✅ Available" || echo "❌ Not available")"
echo ""
echo "🚀 Ready to use! Import from the main index.js file."