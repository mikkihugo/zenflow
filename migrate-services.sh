#!/bin/bash

# Migration script to move three services into singularity-engine
# This script will move bastion-rs, federated-mcp, and FACT from /srv to singularity-engine

set -e

echo "🚀 Starting service migration to singularity-engine..."
echo ""

# Define paths
SRC_DIR="/home/mhugo/code/srv"
DEST_DIR="/home/mhugo/code/singularity-engine/platform"

# Service mapping: source -> destination
declare -A SERVICE_MAP=(
    ["bastion-rs"]="bastion-engine-service"
    ["federated-mcp"]="mcp-federation-service"
    ["FACT"]="fact-execution-service"
    ["bpmn-engine"]="bpmn-workflow-service"
)

# Check if source directory exists
if [ ! -d "$SRC_DIR" ]; then
    echo "❌ Source directory $SRC_DIR does not exist"
    exit 1
fi

# Check if destination directory exists, create if not
if [ ! -d "$DEST_DIR" ]; then
    echo "📁 Creating destination directory: $DEST_DIR"
    mkdir -p "$DEST_DIR"
fi

echo "🔍 Found services to migrate:"
for service in "${!SERVICE_MAP[@]}"; do
    if [ -d "$SRC_DIR/$service" ]; then
        echo "  ✓ $service -> ${SERVICE_MAP[$service]}"
    else
        echo "  ❌ $service (not found)"
    fi
done
echo ""

# Migrate each service
for service in "${!SERVICE_MAP[@]}"; do
    src_path="$SRC_DIR/$service"
    dest_name="${SERVICE_MAP[$service]}"
    dest_path="$DEST_DIR/$dest_name"
    
    if [ -d "$src_path" ]; then
        echo "📦 Migrating $service..."
        
        # Check if destination already exists
        if [ -d "$dest_path" ]; then
            echo "   ⚠️  Destination exists: $dest_path"
            echo "   Creating backup: ${dest_path}.backup.$(date +%Y%m%d_%H%M%S)"
            mv "$dest_path" "${dest_path}.backup.$(date +%Y%m%d_%H%M%S)"
        fi
        
        # Move the service
        echo "   🔄 Moving $src_path -> $dest_path"
        mv "$src_path" "$dest_path"
        
        # Create a symlink back to the original location for compatibility
        echo "   🔗 Creating compatibility symlink"
        ln -sf "$dest_path" "$src_path"
        
        echo "   ✅ $service migrated successfully"
    else
        echo "⚠️  Skipping $service (not found at $src_path)"
    fi
    echo ""
done

# Update any configuration files in singularity-engine
echo "🔧 Updating singularity-engine configuration..."

# Check if there's a workspace config to update
WORKSPACE_CONFIG="/home/mhugo/code/singularity-engine/workspace.json"
NX_CONFIG="/home/mhugo/code/singularity-engine/nx.json"
PACKAGE_JSON="/home/mhugo/code/singularity-engine/package.json"

if [ -f "$WORKSPACE_CONFIG" ]; then
    echo "   📝 Found workspace.json - you may need to update project references"
fi

if [ -f "$NX_CONFIG" ]; then
    echo "   📝 Found nx.json - you may need to update project paths"
fi

if [ -f "$PACKAGE_JSON" ]; then
    echo "   📝 Found package.json - you may need to update workspace references"
fi

echo ""
echo "✅ Migration completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update workspace configuration files if necessary"
echo "2. Test that the services work in their new locations"
echo "3. Update any CI/CD pipelines or scripts that reference the old paths"
echo "4. Run build/test commands to verify everything works"
echo ""
echo "🔗 Compatibility symlinks created so existing references should still work"