#!/bin/bash

echo "🔧 Applying targeted fixes for missing quotes..."

# Fix specific files with known issues
FILES=(
  "apps/claude-code-zen-server/src/commands/auth.ts"
  "apps/claude-code-zen-server/src/commands/auth-minimal.ts" 
  "apps/claude-code-zen-server/src/claude-zen-core.ts"
)

for file in "${FILES[@]}"; do
    if [[ -f "$file" ]]; then
        echo "Fixing: $file"
        
        # Fix missing quotes in console.log statements
        sed -i "s/console\.log(\([^'\"()]*\))/console.log('\1')/g" "$file"
        sed -i "s/console\.error(\([^'\"()]*\))/console.error('\1')/g" "$file"
        sed -i "s/console\.warn(\([^'\"()]*\))/console.warn('\1')/g" "$file"
        
        # Fix missing quotes in logger statements  
        sed -i "s/logger\.info(\([^'\"()]*\))/logger.info('\1')/g" "$file"
        sed -i "s/logger\.error(\([^'\"()]*\))/logger.error('\1')/g" "$file"
        
        # Fix missing quotes in Error constructors
        sed -i "s/throw new Error(\([^'\"()]*\))/throw new Error('\1')/g" "$file"
        
        # Fix OR operators that got broken
        sed -i "s/ | / || /g" "$file"
        
        # Fix specific problematic patterns
        sed -i "s/args\.join( )/args.join(' ')/g" "$file"
        sed -i "s/getLogger(\([^'\"()]*\))/getLogger('\1')/g" "$file"
    fi
done

echo "✅ Targeted fixes applied!"
