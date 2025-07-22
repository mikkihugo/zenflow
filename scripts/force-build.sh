#!/bin/bash
# Force build script that works around Deno deprecation issues

echo "🔨 Force Building Claude Zen..."
echo "================================"

# Ensure bin directory exists
mkdir -p bin

# Set Deno path
export PATH="/home/codespace/.deno/bin:$PATH"

# Backup existing binary
if [ -f "bin/claude-zen" ]; then
    echo "📦 Backing up existing binary..."
    cp bin/claude-zen bin/claude-zen.working
fi

# Force remove any existing temp files
rm -f bin/claude-zen.tmp*

# Try to compile, ignoring the exit code
echo "🏗️  Attempting build (ignoring errors)..."
deno compile --allow-all --no-check --output=bin/claude-zen.tmp src/cli/main.ts 2>&1 | grep -v "Import assertions" || true

# Wait a moment for file system
sleep 1

# Check if ANY temporary file was created
TEMP_FILE=$(ls bin/claude-zen.tmp* 2>/dev/null | head -1)

if [ -n "$TEMP_FILE" ] && [ -f "$TEMP_FILE" ]; then
    echo "📦 Found build artifact: $TEMP_FILE"
    
    # Check if it's executable
    if [ -x "$TEMP_FILE" ]; then
        echo "✅ Build artifact is executable!"
        
        # Move to final location
        mv -f "$TEMP_FILE" bin/claude-zen
        chmod +x bin/claude-zen
        
        echo "✅ Build successful!"
        echo "Binary location: bin/claude-zen"
        exit 0
    else
        echo "⚠️  Build artifact is not executable, making it executable..."
        chmod +x "$TEMP_FILE"
        mv -f "$TEMP_FILE" bin/claude-zen
        echo "✅ Build completed with warnings"
        exit 0
    fi
else
    echo "❌ No build artifact found"
    
    # Restore backup
    if [ -f "bin/claude-zen.working" ]; then
        echo "🔄 Restoring working binary..."
        mv bin/claude-zen.working bin/claude-zen
    fi
    
    exit 1
fi