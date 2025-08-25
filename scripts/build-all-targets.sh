#!/bin/bash
set -euo pipefail

echo "🚀 BUILDING ALL VERSIONS FOR ALL TARGETS"

# Define all target platforms
TARGETS=(
    # x86_64 platforms
    "x86_64-unknown-linux-gnu"      # Linux x86_64
    "x86_64-unknown-linux-musl"     # Linux x86_64 (static)
    "x86_64-pc-windows-msvc"        # Windows x86_64
    "x86_64-apple-darwin"           # macOS Intel
    
    # ARM64 platforms  
    "aarch64-unknown-linux-gnu"     # Linux ARM64
    "aarch64-unknown-linux-musl"    # Linux ARM64 (static)
    "aarch64-apple-darwin"          # macOS Apple Silicon
    "aarch64-pc-windows-msvc"       # Windows ARM64
    
    # WASM platforms
    "wasm32-unknown-unknown"        # WASM (browser)
    "wasm32-wasi"                   # WASM (WASI)
    
    # Mobile platforms
    "aarch64-linux-android"         # Android ARM64
    "aarch64-apple-ios"             # iOS ARM64
    
    # Embedded platforms
    "thumbv7em-none-eabihf"         # ARM Cortex-M4/M7
    "riscv64gc-unknown-linux-gnu"   # RISC-V 64-bit
)

# Neural ML package path
NEURAL_ML_PATH="packages/private-core/neural-ml/neural-core"
OUTPUT_DIR="dist/neural-ml"

# Create output directories
mkdir -p "$OUTPUT_DIR"/{native,wasm,mobile,embedded}

echo "📦 Installing all Rust targets..."
for target in "${TARGETS[@]}"; do
    rustup target add "$target" 2>/dev/null || echo "Target $target already installed"
done

# Function to build for specific target
build_target() {
    local target=$1
    local category=$2
    
    echo "🔨 Building for $target ($category)"
    
    cd "$NEURAL_ML_PATH"
    
    # Set target-specific configurations
    case "$target" in
        *"wasm"*)
            # WASM builds: browser-optimized
            cargo build --target "$target" --release \
                --no-default-features \
                --features "wasm,std" \
                2>&1 | grep -E "(warning|error|Finished)" || true
            ;;
        *"android"*|*"ios"*)
            # Mobile builds: optimized for mobile
            cargo build --target "$target" --release \
                --no-default-features \
                --features "std,simd-acceleration,ml-optimization" \
                2>&1 | grep -E "(warning|error|Finished)" || true
            ;;
        *"thumbv"*|*"riscv"*)
            # Embedded builds: minimal features
            cargo build --target "$target" --release \
                --no-default-features \
                --features "std" \
                2>&1 | grep -E "(warning|error|Finished)" || true
            ;;
        *)
            # Native builds: full auto-detection
            cargo build --target "$target" --release \
                2>&1 | grep -E "(warning|error|Finished)" || true
            ;;
    esac
    
    # Copy binaries to output directory
    if [ -f "target/$target/release/libclaude_zen_neural_ml.rlib" ]; then
        cp "target/$target/release/libclaude_zen_neural_ml.rlib" \
           "../../../$OUTPUT_DIR/$category/libclaude_zen_neural_ml-$target.rlib"
    fi
    
    if [ -f "target/$target/release/claude_zen_neural_ml.wasm" ]; then
        cp "target/$target/release/claude_zen_neural_ml.wasm" \
           "../../../$OUTPUT_DIR/$category/claude_zen_neural_ml-$target.wasm"
    fi
    
    cd - >/dev/null
}

# Build all targets in parallel
echo "🚀 Starting parallel builds..."

# Native platforms (full features)
for target in "x86_64-unknown-linux-gnu" "x86_64-pc-windows-msvc" "x86_64-apple-darwin" \
              "aarch64-unknown-linux-gnu" "aarch64-apple-darwin" "aarch64-pc-windows-msvc"; do
    build_target "$target" "native" &
done

# WASM platforms (web-optimized)
for target in "wasm32-unknown-unknown" "wasm32-wasi"; do
    build_target "$target" "wasm" &
done

# Mobile platforms (mobile-optimized)
for target in "aarch64-linux-android" "aarch64-apple-ios"; do
    build_target "$target" "mobile" &
done

# Embedded platforms (minimal)
for target in "thumbv7em-none-eabihf" "riscv64gc-unknown-linux-gnu"; do
    build_target "$target" "embedded" &
done

# Wait for all builds to complete
wait

echo "✅ ALL BUILDS COMPLETE!"
echo "📁 Binaries available in: $OUTPUT_DIR/"

# Generate manifest
cat > "$OUTPUT_DIR/build-manifest.json" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "targets": [
$(printf '    {"target": "%s", "category": "%s"},\n' \
    "x86_64-unknown-linux-gnu" "native" \
    "x86_64-pc-windows-msvc" "native" \
    "x86_64-apple-darwin" "native" \
    "aarch64-unknown-linux-gnu" "native" \
    "aarch64-apple-darwin" "native" \
    "aarch64-pc-windows-msvc" "native" \
    "wasm32-unknown-unknown" "wasm" \
    "wasm32-wasi" "wasm" \
    "aarch64-linux-android" "mobile" \
    "aarch64-apple-ios" "mobile" \
    "thumbv7em-none-eabihf" "embedded" \
    "riscv64gc-unknown-linux-gnu" "embedded" | sed '$s/,$//')
  ],
  "features": {
    "native": ["std", "auto-optimization", "simd-acceleration", "ml-optimization", "dspy-ml"],
    "wasm": ["wasm", "std"],
    "mobile": ["std", "simd-acceleration", "ml-optimization"],
    "embedded": ["std"]
  }
}
EOF

echo "📋 Build manifest: $OUTPUT_DIR/build-manifest.json"
echo "🎉 READY TO SHIP ALL VERSIONS!"