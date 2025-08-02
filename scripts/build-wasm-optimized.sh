#!/bin/bash
set -e

echo "🚀 Optimized WASM build for Claude-Zen..."

cd src/neural/wasm

# Quick development build
if [ "$MODE" = "dev" ]; then
    echo "📦 Development WASM build..."
    if command -v wasm-pack >/dev/null 2>&1; then
        wasm-pack build --target web --out-dir pkg --dev
    else
        echo "⚠️  wasm-pack not found, skipping WASM build"
    fi
    echo "✅ Development WASM build complete"
    exit 0
fi

# Production build with optimization
echo "🔧 Production WASM build..."
if command -v wasm-pack >/dev/null 2>&1; then
    wasm-pack build --target web --out-dir pkg --release
    
    # Apply optimizations if available
    if command -v wasm-opt >/dev/null 2>&1; then
        echo "⚡ Optimizing WASM files..."
        for file in pkg/*.wasm; do
            if [ -f "$file" ]; then
                wasm-opt "$file" -o "$file.tmp" -O2
                mv "$file.tmp" "$file"
                echo "✅ Optimized $(basename "$file")"
            fi
        done
    else
        echo "ℹ️  wasm-opt not available, skipping optimization"
    fi
else
    echo "⚠️  wasm-pack not found, skipping WASM build"
fi

echo "✅ WASM build complete"
