#!/bin/bash
# Workaround build script for Deno deprecation warning

echo "🔨 Building Claude Zen with workaround..."

# Ensure bin directory exists
mkdir -p bin

# Set Deno path
export PATH="/home/codespace/.deno/bin:$PATH"

# First, try to build normally to a temp file
echo "Attempting build..."

# Build command that continues despite warnings
(deno compile --allow-all --no-check --output=bin/claude-zen.tmp src/cli/main.ts 2>&1 || true) | grep -v "Import assertions are deprecated"

# Check if the temporary binary was created despite the error
if [ -f "bin/claude-zen.tmp" ]; then
    echo "✅ Build artifact created!"
    
    # The binary might still work, so let's test it
    if bin/claude-zen.tmp --version &>/dev/null; then
        echo "✅ Binary is functional!"
        
        # Backup existing binary
        if [ -f "bin/claude-zen" ]; then
            cp bin/claude-zen bin/claude-zen.backup
        fi
        
        # Replace with new binary
        mv bin/claude-zen.tmp bin/claude-zen
        chmod +x bin/claude-zen
        echo "✅ Build successful!"
        exit 0
    else
        echo "❌ Binary is not functional"
        rm -f bin/claude-zen.tmp
    fi
fi

# If we get here, try bundling as a fallback
echo "Trying bundle approach..."

# Bundle the TypeScript to JavaScript first
if deno bundle src/cli/main.ts bin/claude-zen.bundle.js &>/dev/null; then
    # Create a wrapper script
    cat > bin/claude-zen.new << 'EOF'
#!/usr/bin/env -S deno run --allow-all --no-check
import "./claude-zen.bundle.js";
EOF
    
    chmod +x bin/claude-zen.new
    
    # Test the wrapper
    if bin/claude-zen.new --version &>/dev/null; then
        echo "✅ Bundle wrapper is functional!"
        
        # Backup and replace
        if [ -f "bin/claude-zen" ]; then
            cp bin/claude-zen bin/claude-zen.backup
        fi
        mv bin/claude-zen.new bin/claude-zen
        echo "✅ Build successful (bundle mode)!"
        exit 0
    fi
fi

echo "❌ All build attempts failed"
echo "Keeping existing binary in place"
exit 1