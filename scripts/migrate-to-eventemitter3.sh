#!/bin/bash

# Script to migrate all EventEmitter imports to eventemitter3
# This ensures consistent usage of eventemitter3 across the entire codebase

echo "🔄 Migrating all EventEmitter imports to eventemitter3..."

# Find all TypeScript and JavaScript files (excluding node_modules, dist, build directories)
files=$(find /home/mhugo/code/claude-code-zen -name "*.ts" -o -name "*.js" | \
    grep -v node_modules | \
    grep -v ".svelte-kit" | \
    grep -v ".git" | \
    grep -v "dist/" | \
    grep -v "build/" | \
    grep -v "build-quick/")

# Count total files
total_files=$(echo "$files" | wc -l)
echo "📁 Found $total_files files to check"

# Track changes
changed_files=0

# Replace imports from 'events'
for file in $files; do
    if grep -q "import { EventEmitter } from 'events';" "$file" 2>/dev/null; then
        echo "✏️  Updating $file (from 'events')"
        sed -i "s/import { EventEmitter } from 'events';/import { EventEmitter } from 'eventemitter3';/g" "$file"
        ((changed_files++))
    fi
done

# Replace imports from 'node:events'
for file in $files; do
    if grep -q "import { EventEmitter } from 'node:events';" "$file" 2>/dev/null; then
        echo "✏️  Updating $file (from 'node:events')"
        sed -i "s/import { EventEmitter } from 'node:events';/import { EventEmitter } from 'eventemitter3';/g" "$file"
        ((changed_files++))
    fi
done

# Replace other variations
for file in $files; do
    # Handle imports without semicolon
    if grep -q "import { EventEmitter } from 'events'" "$file" 2>/dev/null; then
        echo "✏️  Updating $file (from 'events' without semicolon)"
        sed -i "s/import { EventEmitter } from 'events'/import { EventEmitter } from 'eventemitter3'/g" "$file"
        ((changed_files++))
    fi
    
    if grep -q "import { EventEmitter } from 'node:events'" "$file" 2>/dev/null; then
        echo "✏️  Updating $file (from 'node:events' without semicolon)"
        sed -i "s/import { EventEmitter } from 'node:events'/import { EventEmitter } from 'eventemitter3'/g" "$file"
        ((changed_files++))
    fi
done

echo "✅ Migration complete!"
echo "📊 Updated $changed_files files"

# Verify no old imports remain
remaining_events=$(grep -r "from 'events'" /home/mhugo/code/claude-code-zen --include="*.ts" --include="*.js" \
    --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=build --exclude-dir=build-quick 2>/dev/null | wc -l)
    
remaining_node_events=$(grep -r "from 'node:events'" /home/mhugo/code/claude-code-zen --include="*.ts" --include="*.js" \
    --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=build --exclude-dir=build-quick 2>/dev/null | wc -l)

if [ "$remaining_events" -gt 0 ] || [ "$remaining_node_events" -gt 0 ]; then
    echo "⚠️  Warning: $remaining_events 'events' and $remaining_node_events 'node:events' imports still remain"
    echo "🔍 Remaining 'events' imports:"
    grep -r "from 'events'" /home/mhugo/code/claude-code-zen --include="*.ts" --include="*.js" \
        --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=build --exclude-dir=build-quick 2>/dev/null || echo "   None"
    echo "🔍 Remaining 'node:events' imports:"
    grep -r "from 'node:events'" /home/mhugo/code/claude-code-zen --include="*.ts" --include="*.js" \
        --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=build --exclude-dir=build-quick 2>/dev/null || echo "   None"
else
    echo "✅ All EventEmitter imports successfully migrated to eventemitter3!"
fi

echo "🎉 Migration script completed!"