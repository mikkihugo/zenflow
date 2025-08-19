#!/bin/bash

echo "🚀 Building FACT Core with GitHub Integration..."

# Build with all features including GitHub
echo "Building with all features..."
cd /home/mhugo/code/claude-code-zen/src/fact-core
cargo build --features full --release

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Test the CLI
    echo "Testing CLI help..."
    ./target/release/fact-tools --help
    
    echo ""
    echo "Testing template listing..."
    ./target/release/fact-tools templates
    
    # Test GitHub integration if token is available
    if [ -n "$GITHUB_TOKEN" ]; then
        echo ""
        echo "Testing GitHub integration..."
        ./target/release/fact-tools github --package "phoenix" --format summary --max-snippets 5
    else
        echo ""
        echo "⚠️  No GITHUB_TOKEN found. GitHub integration tests skipped."
        echo "   Set GITHUB_TOKEN to test GitHub features:"
        echo "   export GITHUB_TOKEN=your_github_token"
    fi
    
    echo ""
    echo "🎉 FACT Core is ready!"
    echo "   Binary: $(pwd)/target/release/fact-tools"
    echo ""
    echo "Usage examples:"
    echo "  # Analyze a repository:"
    echo "  ./target/release/fact-tools github --repo phoenixframework/phoenix --format summary"
    echo ""
    echo "  # Analyze Hex packages:"
    echo "  ./target/release/fact-tools github --package ecto --version 3.10 --format json"
    echo ""
    echo "  # Process data with templates:"
    echo "  ./target/release/fact-tools process --template analysis-basic --input '{\"data\": [1,2,3]}'"
    
else
    echo "❌ Build failed!"
    exit 1
fi