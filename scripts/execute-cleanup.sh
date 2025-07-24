#!/bin/bash

# Claude Flow Cleanup Execution Script
# Implements the cleanup plan with safety checks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_BRANCH="cleanup-backup-$(date +%Y%m%d-%H%M%S)"
PROJECT_ROOT="/home/mhugo/code/claude-code-flow"
VERIFICATION_SCRIPT="$PROJECT_ROOT/scripts/cleanup-verification.sh"

cd "$PROJECT_ROOT"

echo -e "${BLUE}🧹 Claude Flow Cleanup Execution Script${NC}"
echo "========================================"
echo "This script will execute the cleanup plan in phases with verification."
echo ""

# Function to create backup
create_backup() {
    echo -e "\n💾 Creating backup branch: $BACKUP_BRANCH"
    git branch "$BACKUP_BRANCH"
    git add .
    git commit -m "Pre-cleanup backup - $(date)" || echo "No changes to commit"
    echo -e "  ✅ Backup created"
}

# Function to run verification
run_verification() {
    echo -e "\n🔍 Running verification..."
    if [[ -x "$VERIFICATION_SCRIPT" ]]; then
        if "$VERIFICATION_SCRIPT"; then
            echo -e "  ${GREEN}✅ Verification passed${NC}"
            return 0
        else
            echo -e "  ${RED}❌ Verification failed${NC}"
            return 1
        fi
    else
        echo -e "  ${YELLOW}⚠️  Verification script not found${NC}"
        return 1
    fi
}

# Function to prompt for continuation
prompt_continue() {
    local phase="$1"
    echo -e "\n${YELLOW}⏸️  Phase $phase completed.${NC}"
    echo "Continue to next phase? (y/n): "
    read -r response
    if [[ "$response" != "y" && "$response" != "Y" ]]; then
        echo "Cleanup stopped by user."
        exit 0
    fi
}

# Phase 1: Safe Removals
phase1_safe_removals() {
    echo -e "\n${BLUE}📋 PHASE 1: Safe Removals${NC}"
    echo "Removing files with zero risk..."
    
    # Remove simple-commands/hive-mind/ directory
    if [[ -d "src/cli/command-handlers/simple-commands/hive-mind" ]]; then
        echo "  🗑️  Removing simple-commands/hive-mind/ directory..."
        rm -rf src/cli/command-handlers/simple-commands/hive-mind/
        echo "  ✅ Removed hive-mind internal files"
    else
        echo "  ℹ️  hive-mind directory already removed"
    fi
    
    # Remove template duplicates
    if [[ -f "templates/claude-zen/settings-enhanced.json" ]]; then
        echo "  🗑️  Removing template duplicates..."
        rm -f templates/claude-zen/settings-enhanced.json
        echo "  ✅ Removed settings-enhanced.json"
    fi
    
    if [[ -d "templates/claude-zen/ruv-FANN" ]]; then
        rm -rf templates/claude-zen/ruv-FANN/
        echo "  ✅ Removed ruv-FANN template directory"
    fi
    
    echo -e "  ${GREEN}✅ Phase 1 completed${NC}"
}

# Phase 2: Import Path Fix
phase2_import_fix() {
    echo -e "\n${BLUE}📋 PHASE 2: Import Path Fix${NC}"
    echo "Fixing batch-manager import path..."
    
    # Check current state
    if [[ -f "src/cli/command-handlers/batch-manager-command.js" ]]; then
        echo "  ℹ️  batch-manager-command.js already exists at correct location"
    elif [[ -f "src/cli/command-handlers/simple-commands/batch-manager.js" ]]; then
        echo "  🔧 Moving batch-manager.js to correct location..."
        
        # Move the file
        mv src/cli/command-handlers/simple-commands/batch-manager.js \
           src/cli/command-handlers/batch-manager-command.js
        
        # Fix the import path in the moved file
        sed -i 's|from '\''./init/batch-init.js'\''|from '\''./init-handlers/init/batch-init.js'\''|g' \
          src/cli/command-handlers/batch-manager-command.js
        
        echo "  ✅ Fixed batch-manager import path"
    else
        echo -e "  ${RED}❌ batch-manager.js not found in expected location${NC}"
        return 1
    fi
    
    echo -e "  ${GREEN}✅ Phase 2 completed${NC}"
}

# Phase 3: Strategic Removals
phase3_strategic_removals() {
    echo -e "\n${BLUE}📋 PHASE 3: Strategic Removals${NC}"
    echo "Removing duplicate simple command files..."
    
    local duplicates=(
        "src/cli/command-handlers/simple-commands/analysis.js"
        "src/cli/command-handlers/simple-commands/automation.js"
        "src/cli/command-handlers/simple-commands/coordination.js"
        "src/cli/command-handlers/simple-commands/agent.js"
        "src/cli/command-handlers/simple-commands/memory.js"
        "src/cli/command-handlers/simple-commands/task.js"
        "src/cli/command-handlers/simple-commands/swarm.js"
        "src/cli/command-handlers/simple-commands/__tests__/"
    )
    
    for file in "${duplicates[@]}"; do
        if [[ -e "$file" ]]; then
            echo "  🗑️  Removing $file"
            rm -rf "$file"
        else
            echo "  ℹ️  $file already removed"
        fi
    done
    
    echo -e "  ${GREEN}✅ Phase 3 completed${NC}"
}

# Phase 4: Documentation Cleanup
phase4_documentation_cleanup() {
    echo -e "\n${BLUE}📋 PHASE 4: Documentation Cleanup${NC}"
    echo "Removing legacy test directories and files..."
    
    local legacy_items=(
        "test-init/"
        "test-init-npm/CLAUDE.md"
        "src/api/auto-generated-api.js.backup"
    )
    
    for item in "${legacy_items[@]}"; do
        if [[ -e "$item" ]]; then
            echo "  🗑️  Removing $item"
            rm -rf "$item"
        else
            echo "  ℹ️  $item already removed"
        fi
    done
    
    echo -e "  ${GREEN}✅ Phase 4 completed${NC}"
}

# Main execution flow
main() {
    echo "Starting cleanup execution..."
    
    # Pre-flight checks
    if [[ ! -f "package.json" ]]; then
        echo -e "${RED}❌ Not in project root directory${NC}"
        exit 1
    fi
    
    if [[ ! -x "$VERIFICATION_SCRIPT" ]]; then
        echo -e "${YELLOW}⚠️  Verification script not executable, fixing...${NC}"
        chmod +x "$VERIFICATION_SCRIPT"
    fi
    
    # Create backup
    create_backup
    
    # Execute phases with verification
    echo -e "\n🚀 Starting phased cleanup..."
    
    # Phase 1: Safe removals
    phase1_safe_removals
    if ! run_verification; then
        echo -e "${RED}❌ Phase 1 verification failed. Aborting.${NC}"
        exit 1
    fi
    prompt_continue 1
    
    # Phase 2: Import path fix
    phase2_import_fix
    if ! run_verification; then
        echo -e "${RED}❌ Phase 2 verification failed. Aborting.${NC}"
        exit 1
    fi
    prompt_continue 2
    
    # Phase 3: Strategic removals
    phase3_strategic_removals
    if ! run_verification; then
        echo -e "${RED}❌ Phase 3 verification failed. Aborting.${NC}"
        exit 1
    fi
    prompt_continue 3
    
    # Phase 4: Documentation cleanup
    phase4_documentation_cleanup
    if ! run_verification; then
        echo -e "${RED}❌ Phase 4 verification failed. Aborting.${NC}"
        exit 1
    fi
    
    # Final verification and summary
    echo -e "\n${GREEN}🎉 CLEANUP COMPLETED SUCCESSFULLY!${NC}"
    echo ""
    echo "📊 Summary:"
    echo "✅ Phase 1: Safe removals completed"
    echo "✅ Phase 2: Import paths fixed"
    echo "✅ Phase 3: Duplicate files removed"
    echo "✅ Phase 4: Documentation cleaned"
    echo "✅ All verifications passed"
    echo ""
    echo "💾 Backup branch created: $BACKUP_BRANCH"
    echo ""
    echo "🔄 To rollback if needed:"
    echo "  git checkout $BACKUP_BRANCH"
    echo "  git checkout main"
    echo "  git reset --hard $BACKUP_BRANCH"
}

# Handle interruptions
trap 'echo -e "\n${YELLOW}⚠️  Cleanup interrupted. To rollback: git checkout $BACKUP_BRANCH${NC}"; exit 1' INT TERM

# Run main function
main "$@"