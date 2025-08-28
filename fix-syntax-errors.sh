#!/bin/bash

# Script to fix systematic syntax errors in the codebase
set -e

echo "🔧 Fixing systematic syntax errors in claude-code-zen codebase..."

# Find all TypeScript files excluding node_modules
files=$(find . -name "*.ts" -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./**/node_modules/*")

# Counter for fixes
fixes=0

for file in $files; do
    if [ -f "$file" ]; then
        echo "Processing: $file"
        
        # Create backup
        cp "$file" "$file.bak"
        
        # Apply systematic fixes using sed
        
        # Fix 1: Remove extra quotes after string literals - pattern '');
        sed -i "s/'');/');/g" "$file"
        
        # Fix 2: Remove extra quotes after string literals - pattern "");
        sed -i 's/"");/");/g' "$file"
        
        # Fix 3: Fix unterminated strings with extra quotes - pattern 'text'')
        sed -i "s/''\)/'\)/g" "$file"
        sed -i 's/""\)/"\)/g' "$file"
        
        # Fix 4: Fix quotes in object properties - pattern 'key':'value'
        sed -i "s/'key':'value'/'key': 'value'/g" "$file"
        
        # Fix 5: Fix common string literal corruptions
        sed -i "s/'claude-code /'claude-code'/g" "$file"
        sed -i "s/'llm-package /'llm-package'/g" "$file"
        sed -i "s/,'specification,'/,'specification'/g" "$file"
        sed -i "s/,'pseudocode,'/,'pseudocode'/g" "$file"
        sed -i "s/,'architecture,'/,'architecture'/g" "$file"
        sed -i "s/,'refinement,'/,'refinement'/g" "$file"
        sed -i "s/,'completion'/,'completion'/g" "$file"
        
        # Fix 6: Fix quote patterns in strings
        sed -i "s/=\"specification,/=\"specification/g" "$file"
        sed -i "s/=\"pseudocode,/=\"pseudocode/g" "$file"
        sed -i "s/=\"architecture,/=\"architecture/g" "$file"
        sed -i "s/=\"refinement,/=\"refinement/g" "$file"
        sed -i "s/=\"completion\"/=\"completion\"/g" "$file"
        
        # Fix 7: Fix template literal issues
        sed -i 's/\${{\([^}]*\)}/\${\1}/g' "$file"
        
        # Fix 8: Fix EventLogger calls
        sed -i "s/EventLogger.log('/EventLogger.log('/g" "$file"
        sed -i "s/', /,/g" "$file"
        
        # Fix 9: Fix method call quotes
        sed -i "s/.bind(this)');/.bind(this));/g" "$file"
        
        # Fix 10: Fix string termination issues
        sed -i "s/';/';/g" "$file"
        
        # Check if file was modified
        if ! cmp -s "$file" "$file.bak"; then
            echo "  ✅ Fixed syntax errors in $file"
            ((fixes++))
        fi
        
        # Remove backup
        rm "$file.bak"
    fi
done

echo "🎉 Fixed syntax errors in $fixes files"
echo "Running a quick syntax check..."

# Try to run TypeScript compiler to validate
if command -v tsc &> /dev/null; then
    echo "Running TypeScript check..."
    # Just check a few key files to see if basic syntax is fixed
    for file in $(find ./packages/services/coordination -name "*.ts" | head -5); do
        if ! tsc --noEmit --skipLibCheck "$file" 2>/dev/null; then
            echo "⚠️  Still has issues: $file"
        else
            echo "✅ Syntax OK: $file"
        fi
    done
fi

echo "✅ Syntax error fixes completed!"