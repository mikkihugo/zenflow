#!/bin/bash

# Final comprehensive fix for all remaining linter corruption patterns
echo "🔧 Final comprehensive fix for remaining corruption patterns..."

# Function to fix specific patterns in a file
fix_file() {
    local file="$1"
    echo "Processing: $file"
    
    # Create backup
    cp "$file" "$file.backup"
    
    # Fix comprehensive corruption patterns
    sed -i '
        # Fix import statement corruption
        s/import.*(/import(/g
        s/import.*{/import {/g
        s/import type.*{/import type {/g
        
        # Fix string literal corruption  
        s/"\([^"]*\)"$/"\1"/g
        s/'\''([^'\'']*)'\''$/"\1"/g
        
        # Fix parentheses corruption
        s/\([a-zA-Z_][a-zA-Z0-9_]*\)(/\1(/g
        s/)\s*$/)/g
        
        # Fix super calls
        s/super;/super();/g
        s/super$/super()/g
        
        # Fix method calls
        s/\.\([a-zA-Z_][a-zA-Z0-9_]*\);/.\1();/g
        
        # Fix template literals  
        s/`\([^`]*\)`$/`\1`/g
        
        # Fix object property access
        s/\?\.\([a-zA-Z_][a-zA-Z0-9_]*\)/?\.\1/g
        
        # Fix array access
        s/\[\([0-9]*\)\]$/[\1]/g
        
        # Fix function expressions
        s/=>\s*$/=>/g
        
        # Fix semicolon issues
        s/;;/;/g
        s/\s*;$/;/g
        
        # Fix comma issues  
        s/,,/,/g
        s/,\s*$/,/g
        
    ' "$file"
    
    # Check if the file changed
    if ! cmp -s "$file" "$file.backup"; then
        echo "  ✅ Fixed final corruption patterns in $file"
    fi
    
    # Remove backup
    rm "$file.backup"
}

# Find all TypeScript files and fix them
echo "Finding all TypeScript files with corruption..."

find apps/claude-code-zen-server/src -name "*.ts" -exec grep -l -E "(import.*\(|['\"].*['\"]$|super;|super$|\?\.\w+|,,|;;)" {} \; | while read -r file; do
    fix_file "$file"
done

echo "🎉 Completed final comprehensive corruption fix"