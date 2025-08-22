#!/bin/bash

# Fix remaining linter corruption patterns that the first script missed
echo "🔧 Fixing remaining linter corruption patterns..."

# Function to fix specific patterns in a file
fix_file() {
    local file="$1"
    echo "Processing: $file"
    
    # Create backup
    cp "$file" "$file.backup"
    
    # Fix more complex corrupted patterns
    sed -i '
        # Fix property initializer patterns like name0: -> name:
        s/\([a-zA-Z_][a-zA-Z0-9_]*\)0:/\1:/g
        
        # Fix super0 -> super
        s/super0/super/g
        
        # Fix Array.from issues with parentheses
        s/Array\.from(this\.\([a-zA-Z_][a-zA-Z0-9_]*\)0\.values/Array.from(this.\1.values/g
        
        # Fix template literal patterns
        s/0\.map(/\.map(/g
        s/0\.filter(/\.filter(/g
        s/0\.slice(/\.slice(/g
        s/0\.substr(/\.substr(/g
        s/0\.substring(/\.substring(/g
        s/0\.toString(/\.toString(/g
        s/0\.split(/\.split(/g
        s/0\.join(/\.join(/g
        s/0\.push(/\.push(/g
        s/0\.pop(/\.pop(/g
        
        # Fix template literal closing issues
        s/0`/`/g
        
        # Fix double quotes in patterns
        s/"0\./"./g
        s/'"'"'0\./"./g
        
        # Fix special character sequences
        s/0\.\./0../g
        s/0\./\./g
        
        # Fix method calls with 0 prefix
        s/\.\([a-zA-Z_][a-zA-Z0-9_]*\)0(/.\1(/g
        
        # Fix function returns with 0
        s/return \([a-zA-Z_][a-zA-Z0-9_]*\)0\./return \1./g
        
        # Fix property access with 0 
        s/\.\([a-zA-Z_][a-zA-Z0-9_]*\)0\.\([a-zA-Z_]\)/.\1.\2/g
        
        # Fix array access patterns
        s/\[\([0-9]*\)\]0\./[\1]./g
        
        # Fix parentheses with 0
        s/)0\./)./g
        s/)0\[/).[/g
        
        # Fix object property assignments
        s/: \([a-zA-Z_][a-zA-Z0-9_]*\)0\./: \1./g
        
        # Fix destructuring patterns  
        s/{ \([a-zA-Z_][a-zA-Z0-9_]*\)0 }/{ \1 }/g
        
        # Fix charAt patterns
        s/0\.charAt(/\.charAt(/g
        
        # Fix toUpperCase patterns  
        s/0\.toUpperCase/\.toUpperCase/g
        s/0\.toLowerCase/\.toLowerCase/g
        
        # Fix getTime patterns
        s/0\.getTime/\.getTime/g
        
        # Fix specific corrupted template strings
        s/\${0\./\${./g
        
        # Fix crypto hash patterns
        s/0\.update(/\.update(/g
        s/0\.digest(/\.digest(/g
        
        # Fix entries patterns
        s/0\.entries/\.entries/g
        s/0\.values/\.values/g
        s/0\.keys/\.keys/g
    ' "$file"
    
    # Check if the file changed
    if ! cmp -s "$file" "$file.backup"; then
        echo "  ✅ Fixed additional corruption patterns in $file"
    fi
    
    # Remove backup
    rm "$file.backup"
}

# Find files with remaining corruption and fix them
echo "Finding files with remaining corruption..."

# Fix specific files that still have errors
fix_file "apps/claude-code-zen-server/src/commands/auth.ts"
fix_file "apps/claude-code-zen-server/src/coordination/agents/composite-system.ts"  
fix_file "apps/claude-code-zen-server/src/coordination/agents/enhanced-base-agent.ts"
fix_file "apps/claude-code-zen-server/src/workflows/safe-sparc-standalone.ts"
fix_file "apps/claude-code-zen-server/src/zen-orchestrator-integration.ts"

# Also fix any remaining TypeScript files with 0. patterns
find apps/claude-code-zen-server/src -name "*.ts" -exec grep -l "0\." {} \; | while read -r file; do
    fix_file "$file"
done

echo "🎉 Completed fixing remaining corruption patterns"