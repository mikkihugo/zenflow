#!/bin/bash

# Comprehensive bulk TypeScript syntax error fix script
# Fixes systematic patterns introduced by previous aider runs

echo "🔧 Starting bulk TypeScript syntax error fixes..."

# Set up directories
APP_DIR="apps/claude-code-zen-server/src"
PACKAGES_DIR="packages"

# Function to fix a specific pattern across all TypeScript files
fix_pattern() {
    local pattern="$1" 
    local replacement="$2"
    local description="$3"
    
    echo "  📝 Fixing: $description"
    find "$APP_DIR" "$PACKAGES_DIR" -name "*.ts" -not -path "*/node_modules/*" -not -path "*/dist/*" -not -path "*/.next/*" -exec sed -i "s|$pattern|$replacement|g" {} +
}

# Fix import statement errors
echo "🚀 Phase 1: Import Statement Fixes"
fix_pattern "import { \([^}]*\) } from '\([^']*\)');$" "import { \1 } from '\2';" "Import statements with wrong parentheses"
fix_pattern "import \([^ ]*\) from '\([^']*\)');$" "import \1 from '\2';" "Default import statements with wrong parentheses"
fix_pattern "import type { \([^}]*\) } from '\([^']*\)');$" "import type { \1 } from '\2';" "Type import statements with wrong parentheses"

# Fix export statement errors  
echo "🚀 Phase 2: Export Statement Fixes"
fix_pattern "export { \([^}]*\) } from '\([^']*\)');$" "export { \1 } from '\2';" "Export statements with wrong parentheses"
fix_pattern "export \* from '\([^']*\)');$" "export * from '\1';" "Export all statements with wrong parentheses"

# Fix constant declarations
echo "🚀 Phase 3: Constant Declaration Fixes"
fix_pattern "const \([^=]*\) = '\([^']*\)');$" "const \1 = '\2';" "Const declarations with wrong parentheses"
fix_pattern "const \([^=]*\) = \"\([^\"]*\)\");$" "const \1 = \"\2\";" "Const declarations with double quotes and wrong parentheses"
fix_pattern "const \([^=]*\) = \([^;)]*\));$" "const \1 = \2;" "General const declarations with wrong parentheses"

# Fix let/var declarations
echo "🚀 Phase 4: Variable Declaration Fixes"
fix_pattern "let \([^=]*\) = '\([^']*\)');$" "let \1 = '\2';" "Let declarations with wrong parentheses"
fix_pattern "var \([^=]*\) = '\([^']*\)');$" "var \1 = '\2';" "Var declarations with wrong parentheses"

# Fix union type definitions
echo "🚀 Phase 5: Union Type Fixes"
fix_pattern "'\([^']*\) | \([^']*\)')$" "'\1' | '\2'" "Union types with wrong quotes/parentheses"
fix_pattern "'\([^']*\) | \([^']*\) | \([^']*\)')$" "'\1' | '\2' | '\3'" "Triple union types with wrong quotes"
fix_pattern "'\([^']*\) | \([^']*\) | \([^']*\) | \([^']*\)')$" "'\1' | '\2' | '\3' | '\4'" "Quad union types with wrong quotes"

# Fix ternary operators
echo "🚀 Phase 6: Ternary Operator Fixes"
fix_pattern "? '\([^']*\) : '\([^']*\)'$" "? '\1' : '\2'" "Ternary operators with missing quotes"
fix_pattern ": '\([^']*\) : '\([^']*\)'$" ": '\1' : '\2'" "Ternary operators with wrong colons"

# Fix template literals  
echo "🚀 Phase 7: Template Literal Fixes"
fix_pattern "\`\([^\`]*\)'" "\`\1\`" "Template literals with wrong closing quote"
fix_pattern "'\([^\`]*\)\`" "\`\1\`" "Template literals with wrong opening quote"

# Fix string literal issues
echo "🚀 Phase 8: String Literal Fixes"  
fix_pattern "'\([^']*\)\"$" "'\1'" "Mixed quote strings ending with double quote"
fix_pattern "\"\([^\"]*\)'$" "\"\1\"" "Mixed quote strings ending with single quote"

# Fix method call syntax
echo "🚀 Phase 9: Method Call Fixes"
fix_pattern "\.\([a-zA-Z_][a-zA-Z0-9_]*\)(\([^)]*\)));$" ".\1(\2);" "Method calls with wrong parentheses"

# Fix object property syntax
echo "🚀 Phase 10: Object Property Fixes"
fix_pattern "{\([^}]*\): '\([^']*\)'}$" "{\1: '\2'}" "Object properties with wrong parentheses"

# Fix array syntax
echo "🚀 Phase 11: Array Syntax Fixes"
fix_pattern "\[\([^\]]*\)\];$" "[\1];" "Array declarations with wrong syntax"

# Fix function parameters
echo "🚀 Phase 12: Function Parameter Fixes"
fix_pattern "(\([^)]*\): \([^)]*\));$" "(\1: \2);" "Function parameters with wrong syntax"

# Fix type annotations
echo "🚀 Phase 13: Type Annotation Fixes"
fix_pattern ": '\([^']*\)': \([^;]*\);$" ": '\1' : \2;" "Type annotations with wrong colons"
fix_pattern ": \([^:]*\): \([^;]*\);$" ": \1: \2;" "General type annotations with wrong colons"

echo "✅ Bulk syntax error fixes complete!"
echo "📊 Running TypeScript compilation check to verify fixes..."

# Run type check to see progress
cd /home/mhugo/code/claude-code-zen
pnpm run type-check 2>&1 | head -20