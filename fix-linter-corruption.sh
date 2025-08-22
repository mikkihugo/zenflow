#!/bin/bash

# Fix linter corruption patterns across all TypeScript files
echo "🔧 Fixing linter corruption patterns..."

# Find all TypeScript files in the server app
find apps/claude-code-zen-server/src -name "*.ts" | while read -r file; do
    echo "Processing: $file"
    
    # Create backup
    cp "$file" "$file.backup"
    
    # Fix corrupted patterns using sed
    sed -i '
        # Fix Date0.now() -> Date.now()
        s/Date0\.now()/Date.now()/g
        
        # Fix Math0.random() -> Math.random()
        s/Math0\.random()/Math.random()/g
        
        # Fix Math0.floor() -> Math.floor()
        s/Math0\.floor(/Math.floor(/g
        
        # Fix console0.log() -> console.log()
        s/console0\./console./g
        
        # Fix this.property0. -> this.property.
        s/\([a-zA-Z_][a-zA-Z0-9_]*\)0\./\1./g
        
        # Fix object0.property -> object.property
        s/\([a-zA-Z_][a-zA-Z0-9_]*\)0\.\([a-zA-Z_]\)/\1.\2/g
        
        # Fix '0.0.0'. spread operator -> ...
        s/'"'"'0\.0\.0'"'"'\./\.\.\./g
        
        # Fix Array0.from() -> Array.from()
        s/Array0\.from(/Array.from(/g
        
        # Fix Object0.keys() -> Object.keys()
        s/Object0\.keys(/Object.keys(/g
        
        # Fix process0. -> process.
        s/process0\./process./g
        
        # Fix super0( -> super(
        s/super0(/super(/g
        
        # Fix import paths with 0.0./
        s/from '"'"'0\.0\.\//from '"'"'.\//g
        
        # Fix function calls with 0 after identifier
        s/\([a-zA-Z_][a-zA-Z0-9_]*\)0(/\1(/g
        
        # Fix file extension patterns
        s/\([a-zA-Z_][a-zA-Z0-9_]*\)0\.ts/\1.ts/g
        s/\([a-zA-Z_][a-zA-Z0-9_]*\)0\.js/\1.js/g
    ' "$file"
    
    # Check if the file changed
    if ! cmp -s "$file" "$file.backup"; then
        echo "  ✅ Fixed corruption patterns in $file"
    fi
    
    # Remove backup
    rm "$file.backup"
done

echo "🎉 Completed fixing linter corruption patterns"