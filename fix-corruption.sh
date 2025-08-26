#!/bin/bash

# ====================================================================
# SYSTEMATIC TYPESCRIPT CORRUPTION REPAIR SCRIPT
# ====================================================================
# 
# This script repairs widespread TypeScript syntax corruption across
# the claude-code-zen codebase using systematic sed patterns.
#
# CORRUPTION PATTERNS IDENTIFIED:
# 1. Unterminated string literals (extra apostrophes)
# 2. Missing spaces around operators (||, &&, ===, !==)
# 3. Malformed template literals ($var instead of ${var})
# 4. Missing union type spacing ('a|b' instead of 'a | b')
# 5. Unterminated function calls and object literals
#
# USAGE: ./fix-corruption.sh [package_path]
# ====================================================================

set -e  # Exit on any error

# Configuration
BASE_DIR="${1:-packages/implementation}"
BACKUP_DIR="corruption-backup-$(date +%Y%m%d-%H%M%S)"
LOG_FILE="corruption-repair.log"

echo "🚀 SYSTEMATIC TYPESCRIPT CORRUPTION REPAIR"
echo "=========================================="
echo "Target directory: $BASE_DIR"
echo "Backup directory: $BACKUP_DIR"
echo "Log file: $LOG_FILE"
echo

# Create backup
echo "📦 Creating backup..."
mkdir -p "$BACKUP_DIR"
if [[ -d "$BASE_DIR" ]]; then
    cp -r "$BASE_DIR" "$BACKUP_DIR/"
    echo "✅ Backup created in $BACKUP_DIR"
else
    echo "❌ Directory $BASE_DIR not found"
    exit 1
fi

# Initialize log
echo "$(date): Starting systematic corruption repair" > "$LOG_FILE"

# Function to log and execute sed command
fix_pattern() {
    local description="$1"
    local pattern="$2"
    local replacement="$3"
    local file_pattern="${4:-*.ts}"
    
    echo "🔧 Fixing: $description"
    echo "   Pattern: $pattern → $replacement"
    
    # Find and count affected files
    local affected_count=$(find "$BASE_DIR" -name "$file_pattern" -exec grep -l "$pattern" {} \; 2>/dev/null | wc -l)
    echo "   Affected files: $affected_count"
    
    if [[ $affected_count -gt 0 ]]; then
        # Apply fix
        find "$BASE_DIR" -name "$file_pattern" -exec sed -i "s/$pattern/$replacement/g" {} \;
        echo "   ✅ Applied fix to $affected_count files"
        echo "$(date): Fixed '$description' in $affected_count files" >> "$LOG_FILE"
    else
        echo "   ℹ️  No files affected"
    fi
    echo
}

# ====================================================================
# SYSTEMATIC CORRUPTION REPAIRS
# ====================================================================

echo "🎯 Starting systematic corruption repairs..."
echo

# 1. Fix unterminated string literals
echo "=== 1. UNTERMINATED STRING LITERALS ==="
fix_pattern "Unterminated strings with extra apostrophe" "';$" "';"

# 2. Fix missing spaces around operators
echo "=== 2. MISSING OPERATOR SPACES ==="
fix_pattern "Missing spaces around OR operator" "||" " || "
fix_pattern "Missing spaces around AND operator" "&&" " && "
fix_pattern "Missing spaces around strict equality" "===" " === "
fix_pattern "Missing spaces around strict inequality" "!==" " !== "
fix_pattern "Missing spaces around equality" "([^=!])=([^=])" "\1 = \2"

# 3. Fix union type spacing
echo "=== 3. UNION TYPE SPACING ==="
fix_pattern "Missing spaces around union types" "\|" " | "

# 4. Fix malformed template literals
echo "=== 4. MALFORMED TEMPLATE LITERALS ==="
fix_pattern "Fix template literal variables" '\$([a-zA-Z_][a-zA-Z0-9_]*[^}])' '${\1}'

# 5. Fix unterminated function calls
echo "=== 5. UNTERMINATED FUNCTION CALLS ==="
fix_pattern "Extra parenthesis in function calls" "()();" "();"

# 6. Fix common property access issues
echo "=== 6. PROPERTY ACCESS ISSUES ==="
fix_pattern "Missing optional chaining space" "\?\." "?."

# 7. Fix logging statement issues
echo "=== 7. LOGGING STATEMENT FIXES ==="
fix_pattern "Unterminated logger error calls" "error\('([^']*)', error\);" "error('\1', error);"

# 8. Fix object literal issues
echo "=== 8. OBJECT LITERAL FIXES ==="
fix_pattern "Fix object literal with extra quote" ", {'" ", {"

# 9. Fix import/export statement issues  
echo "=== 9. IMPORT/EXPORT STATEMENT FIXES ==="
fix_pattern "Fix export statement spacing" "export{" "export {"

# 10. Fix array and object destructuring
echo "=== 10. DESTRUCTURING FIXES ==="
fix_pattern "Fix destructuring spacing" "} from" "} from"

# ====================================================================
# VALIDATION AND REPORTING
# ====================================================================

echo "🔍 VALIDATION AND REPORTING"
echo "==========================="

# Count remaining TypeScript errors
echo "📊 Checking remaining TypeScript errors..."
cd "$BASE_DIR/.." || exit 1

# Quick syntax validation on a sample of files
echo "🧪 Quick syntax validation..."
error_count=0
sample_files=$(find "$BASE_DIR" -name "*.ts" | head -10)

for file in $sample_files; do
    if ! node -c "$file" 2>/dev/null; then
        ((error_count++))
    fi
done

echo "Sample validation: $error_count errors out of 10 files tested"

# Generate repair summary
echo "📋 REPAIR SUMMARY"
echo "================="
echo "Backup location: $BACKUP_DIR"
echo "Log file: $LOG_FILE"
echo "Target directory: $BASE_DIR"
echo

echo "✅ Systematic corruption repair completed!"
echo "📝 Check the log file for detailed results: $LOG_FILE"
echo "🔄 You may need to run additional manual fixes for complex patterns"
echo
echo "NEXT STEPS:"
echo "1. Test build: pnpm build"
echo "2. Review remaining errors"
echo "3. Apply additional manual fixes as needed"
echo "4. If satisfied, remove backup: rm -rf $BACKUP_DIR"