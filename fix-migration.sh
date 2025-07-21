#!/bin/bash

echo "🔧 Fixing service migration..."
echo ""

cd /home/mhugo/code/singularity-engine/platform

# Fix circular symlinks by removing them and moving backup content
echo "📦 Fixing circular symlinks and restoring content:"

for service in "bastion-engine-service" "fact-execution-service" "mcp-federation-service"; do
    echo "  🔄 Fixing $service..."
    
    # Remove circular symlink
    if [ -L "$service" ]; then
        echo "    Removing circular symlink: $service"
        rm "$service"
    fi
    
    # Check if backup exists
    backup_dir="${service}.backup.20250619_072451"
    if [ -d "$backup_dir" ]; then
        echo "    Restoring from backup: $backup_dir"
        mv "$backup_dir" "$service"
        echo "    ✅ $service restored from backup"
    else
        echo "    ❌ No backup found for $service"
    fi
done

echo ""
echo "🔗 Verifying symlinks in /srv are correct:"

# Check /srv symlinks and fix if needed
cd /home/mhugo/code/srv

declare -A SERVICE_MAP=(
    ["bastion-rs"]="bastion-engine-service"
    ["federated-mcp"]="mcp-federation-service"
    ["FACT"]="fact-execution-service"
    ["bpmn-engine"]="bpmn-workflow-service"
)

for src_service in "${!SERVICE_MAP[@]}"; do
    dest_service="${SERVICE_MAP[$src_service]}"
    target_path="/home/mhugo/code/singularity-engine/platform/$dest_service"
    
    echo "  🔗 Checking $src_service -> $dest_service"
    
    if [ -L "$src_service" ]; then
        current_target=$(readlink "$src_service")
        if [ "$current_target" = "$target_path" ]; then
            echo "    ✅ Symlink correct: $src_service -> $target_path"
        else
            echo "    🔄 Fixing symlink: $src_service"
            rm "$src_service"
            ln -sf "$target_path" "$src_service"
            echo "    ✅ Fixed: $src_service -> $target_path"
        fi
    else
        echo "    ⚠️  No symlink found for $src_service, creating..."
        ln -sf "$target_path" "$src_service"
        echo "    ✅ Created: $src_service -> $target_path"
    fi
done

echo ""
echo "✅ Migration fix completed!"
echo ""
echo "🔍 Final verification:"
for service in "bastion-engine-service" "fact-execution-service" "mcp-federation-service" "bpmn-workflow-service"; do
    if [ -d "/home/mhugo/code/singularity-engine/platform/$service" ] && [ ! -L "/home/mhugo/code/singularity-engine/platform/$service" ]; then
        echo "  ✅ $service - Directory exists and is not a symlink"
    else
        echo "  ❌ $service - Issue with directory"
    fi
done