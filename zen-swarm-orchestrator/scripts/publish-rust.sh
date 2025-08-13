#!/bin/bash
# Script to publish Rust crates to crates.io
# Must be run in the correct order due to dependencies

set -e

echo "🦀 Publishing zen-swarm Rust crates to crates.io..."

# Check if we're logged in to crates.io
if ! cargo login 2>/dev/null; then
    echo "❌ Please login to crates.io first with: cargo login"
    exit 1
fi

# Function to publish a crate
publish_crate() {
    local crate_path=$1
    local crate_name=$2
    
    echo "📦 Publishing $crate_name..."
    cd "$crate_path"
    
    # Verify the crate builds
    cargo build --release
    
    # Run tests
    cargo test
    
    # Publish (dry run first)
    cargo publish --dry-run
    
    # Actual publish
    cargo publish
    
    # Wait a bit for crates.io to process
    sleep 30
    
    cd - > /dev/null
    echo "✅ $crate_name published successfully"
}

# Start from the workspace root
cd "$(dirname "$0")/.."

# Publish in dependency order
echo "📋 Publishing order (based on dependencies):"
echo "1. zen-swarm-core (no zen-swarm dependencies)"
echo "2. zen-swarm-transport (depends on core)"
echo "3. zen-swarm-persistence (depends on core)"
echo "4. zen-swarm-agents (depends on core)"
echo "5. zen-swarm-ml (depends on core)"
echo "6. claude-parser (no zen-swarm dependencies)"
echo "7. zen-swarm-daa (depends on core, agents, ml)"
echo "8. zen-swarm-mcp (depends on core, agents, persistence)"
echo "9. swe-bench-adapter (depends on core, agents)"
echo "10. zen-swarm-wasm (depends on core, agents, ml)"
echo "11. zen-swarm-cli (depends on all)"
echo ""

read -p "Continue with publishing? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Publish each crate in order
publish_crate "crates/zen-swarm-core" "zen-swarm-core"
publish_crate "crates/zen-swarm-transport" "zen-swarm-transport"
publish_crate "crates/zen-swarm-persistence" "zen-swarm-persistence"
publish_crate "crates/zen-swarm-agents" "zen-swarm-agents"
publish_crate "crates/zen-swarm-ml" "zen-swarm-ml"
publish_crate "crates/claude-parser" "claude-parser"
publish_crate "crates/zen-swarm-daa" "zen-swarm-daa"
publish_crate "crates/zen-swarm-mcp" "zen-swarm-mcp"
publish_crate "crates/swe-bench-adapter" "swe-bench-adapter"
publish_crate "crates/zen-swarm-wasm" "zen-swarm-wasm"
publish_crate "crates/zen-swarm-cli" "zen-swarm-cli"

echo "🎉 All Rust crates published successfully!"
echo "📝 Next steps:"
echo "1. Wait for crates to be indexed on crates.io"
echo "2. Build WASM artifacts for NPM package"
echo "3. Run npm publishing script"