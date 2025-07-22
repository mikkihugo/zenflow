#!/bin/bash
# Safe build script that preserves the existing binary

echo "🔨 Safe Build Script for Claude Zen"
echo "===================================="

# Create bin directory if it doesn't exist
mkdir -p bin

# Backup existing binary if it exists
if [ -f "bin/claude-zen" ]; then
    echo "📦 Backing up existing binary..."
    cp bin/claude-zen bin/claude-zen.backup
fi

# Set Deno path
export PATH="/home/codespace/.deno/bin:$PATH"

# Build to a temporary file first
echo "🏗️  Building Claude Zen..."
if deno compile --allow-all --no-check --output=bin/claude-zen.tmp src/cli/main.ts 2>/dev/null; then
    echo "✅ Build successful!"
    
    # Remove old binary and move new one
    if [ -f "bin/claude-zen.tmp" ]; then
        mv -f bin/claude-zen.tmp bin/claude-zen
        chmod +x bin/claude-zen
        echo "✅ Binary updated successfully!"
        
        # Remove backup since build was successful
        rm -f bin/claude-zen.backup
    fi
else
    echo "❌ Build failed!"
    
    # Restore backup if build failed
    if [ -f "bin/claude-zen.backup" ]; then
        echo "🔄 Restoring backup..."
        mv bin/claude-zen.backup bin/claude-zen
        echo "✅ Backup restored!"
    fi
    
    exit 1
fi

# Build prompt copier CLI
echo "🏗️  Building Prompt Copier CLI..."
if deno compile --allow-all --no-check --output=bin/prompt-copier.tmp src/swarm/prompt-cli.ts 2>/dev/null; then
    echo "✅ Prompt copier build successful!"
    
    if [ -f "bin/prompt-copier.tmp" ]; then
        mv -f bin/prompt-copier.tmp bin/prompt-copier
        chmod +x bin/prompt-copier
        echo "✅ Prompt copier binary updated successfully!"
    fi
else
    echo "⚠️  Prompt copier build failed - continuing without it"
fi

echo ""
echo "✅ Build complete!"
echo "   Claude Zen binary: bin/claude-zen"
echo "   Prompt Copier binary: bin/prompt-copier"