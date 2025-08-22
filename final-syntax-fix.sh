#!/bin/bash

# Final comprehensive syntax fix script for claude-code-zen
echo "🔧 Running final comprehensive syntax fixes..."

# Find all TypeScript files in the project
find . -name "*.ts" -not -path "./node_modules/*" -not -path "./.git/*" | while read -r file; do
    echo "Processing: $file"
    
    # Fix malformed type unions with various patterns
    sed -i "s/' | '/|/g" "$file"
    sed -i "s/' ' | '/|/g" "$file"
    sed -i "s/' |'/||/g" "$file"
    sed -i "s/'|'/||/g" "$file"
    sed -i "s/ | '/ || '/g" "$file"
    sed -i "s/ ' | / || /g" "$file"
    
    # Fix string literal and template issues
    sed -i "s/console\.log('');/console.log('');/g" "$file"
    sed -i "s/throw new Error(/throw new Error(/g" "$file"
    sed -i "s/Authentication timeout\. Please try again\./Authentication timeout. Please try again./g" "$file"
    
    # Fix path joining issues
    sed -i "s/join(homedir(), \.claude-zen/join(homedir(), '.claude-zen'/g" "$file"
    sed -i "s/join(process\.cwd(), \.claude-zen/join(process.cwd(), '.claude-zen'/g" "$file"
    
    # Fix constructor syntax
    sed -i "s/constructor'(/constructor(/g" "$file"
    
    # Fix function parameter syntax
    sed -i "s/: string ' | symbol/: string | symbol/g" "$file"
    sed -i "s/: string  ' | 'symbol/: string | symbol/g" "$file"
    
    # Fix array syntax issues
    sed -i "s/\['xclip, -selection', 'clipboard'\]/['xclip', '-selection', 'clipboard']/g" "$file"
    
    # Fix Promise type syntax
    sed -i "s/Promise<string '/Promise<string>/g" "$file"
    sed -i "s/Promise<void '/Promise<void>/g" "$file"
    
    # Fix import path issues
    sed -i "s/from '/coordination\/core\/event-bus'/from '.\/coordination\/core\/event-bus'/g" "$file"
    
    # Fix escaped newlines in strings
    sed -i "s/\\\\\\\\n/\\\\n/g" "$file"
    
    # Fix logger initialization
    sed -i "s/getLogger(claude-zen-core)/getLogger('claude-zen-core')/g" "$file"
    
    # Fix template literal issues
    sed -i "s/\${data\.error_description  | data\.error}/\${data.error_description || data.error}/g" "$file"
    
    # Fix OR operator issues
    sed -i "s/ | '/ || '/g" "$file"
    sed -i "s/' | / || /g" "$file"
    
    # Fix quote issues in conditionals
    sed -i "s/=== development/=== 'development'/g" "$file"
    
    # Fix malformed object property access
    sed -i "s/\.auth | ' | '{}/\.auth || {}/g" "$file"
    
done

echo "✅ Final syntax fixes completed!"
echo "📊 Running TypeScript compilation check..."

# Quick compilation check
timeout 30s pnpm tsc --noEmit --skipLibCheck 2>&1 | head -20
