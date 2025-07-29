#!/bin/bash

# Claude-Zen Project Cleanup Script
# Safely removes test artifacts, temporary files, and build caches

echo "🧹 Claude-Zen Project Cleanup"
echo "============================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to safely remove with confirmation
safe_remove() {
    local path=$1
    if [ -e "$path" ]; then
        echo -e "${YELLOW}Found: $path${NC}"
    fi
}

# Function to calculate size
get_size() {
    if [ -e "$1" ]; then
        du -sh "$1" 2>/dev/null | cut -f1
    else
        echo "0"
    fi
}

echo -e "\n${YELLOW}📊 Analyzing what can be cleaned...${NC}\n"

# 1. Test artifacts in root directory
echo "1️⃣ Test Artifacts in Root:"
TEST_FILES=(
    "kuzu-integration-test*"
    "kuzu-test.db"
    "test-kuzu-*"
    "working-kuzu-test*"
    "verification-kuzu-test*"
    "minimal-kuzu-test*"
    "e2e-test-workspace"
    "final-verification-92.js"
    "test-working-kuzu.js"
    "test-kuzu-integration.js"
    "minimal-kuzu-test.js"
)

for pattern in "${TEST_FILES[@]}"; do
    for file in $pattern; do
        [ -e "$file" ] && safe_remove "$file"
    done
done

# 2. Build artifacts
echo -e "\n2️⃣ Build Artifacts:"
safe_remove "dist/"
safe_remove "build/"
safe_remove ".cache/"

# 3. Log files
echo -e "\n3️⃣ Log Files:"
find . -name "*.log" -not -path "./node_modules/*" -not -path "./.git/*" | while read -r file; do
    safe_remove "$file"
done

# 4. Temporary runtime data (optional)
echo -e "\n4️⃣ Runtime Data (OPTIONAL - contains persistence):"
echo -e "${YELLOW}.swarm/ ($(get_size .swarm)) - Contains swarm memory and state${NC}"
echo -e "${YELLOW}.hive-mind/ ($(get_size .hive-mind)) - Contains hive coordination data${NC}"

# 5. Rust target directories (large!)
echo -e "\n5️⃣ Rust Build Artifacts (LARGE):"
echo -e "${YELLOW}ruv-FANN/target/ ($(get_size ruv-FANN/target/)) - Rust build artifacts${NC}"

# 6. Duplicate package-lock files
echo -e "\n6️⃣ Duplicate package-lock.json files:"
find . -name "package-lock.json" -not -path "./package-lock.json" -not -path "./node_modules/*" | while read -r file; do
    safe_remove "$file"
done

# Calculate total space that can be freed
echo -e "\n${GREEN}📊 Space Analysis:${NC}"
TOTAL_SIZE=0

# Test files
TEST_SIZE=$(du -sc ${TEST_FILES[@]} 2>/dev/null | tail -1 | cut -f1)
echo "Test artifacts: ~$((TEST_SIZE / 1024))MB"

# Rust target
if [ -d "ruv-FANN/target" ]; then
    RUST_SIZE=$(du -s ruv-FANN/target 2>/dev/null | cut -f1)
    echo "Rust build artifacts: ~$((RUST_SIZE / 1024))MB"
fi

echo -e "\n${YELLOW}🤔 What would you like to clean?${NC}"
echo "1) Test artifacts only (safe)"
echo "2) Test artifacts + logs (safe)"
echo "3) Test artifacts + logs + build dirs (safe)"
echo "4) Everything except runtime data (recommended)"
echo "5) Everything including runtime data (full clean)"
echo "6) Custom selection"
echo "0) Cancel"

read -p "Select option (0-6): " choice

case $choice in
    1)
        echo -e "\n${GREEN}Cleaning test artifacts...${NC}"
        for pattern in "${TEST_FILES[@]}"; do
            rm -rf $pattern 2>/dev/null
        done
        ;;
    2)
        echo -e "\n${GREEN}Cleaning test artifacts and logs...${NC}"
        for pattern in "${TEST_FILES[@]}"; do
            rm -rf $pattern 2>/dev/null
        done
        find . -name "*.log" -not -path "./node_modules/*" -not -path "./.git/*" -delete
        ;;
    3)
        echo -e "\n${GREEN}Cleaning test artifacts, logs, and build directories...${NC}"
        for pattern in "${TEST_FILES[@]}"; do
            rm -rf $pattern 2>/dev/null
        done
        find . -name "*.log" -not -path "./node_modules/*" -not -path "./.git/*" -delete
        rm -rf dist/ build/ .cache/
        ;;
    4)
        echo -e "\n${GREEN}Cleaning everything except runtime data...${NC}"
        for pattern in "${TEST_FILES[@]}"; do
            rm -rf $pattern 2>/dev/null
        done
        find . -name "*.log" -not -path "./node_modules/*" -not -path "./.git/*" -delete
        rm -rf dist/ build/ .cache/
        rm -rf ruv-FANN/target/
        # Clean duplicate package-locks
        find . -name "package-lock.json" -not -path "./package-lock.json" -not -path "./node_modules/*" -delete
        ;;
    5)
        echo -e "\n${RED}⚠️  WARNING: This will remove all runtime data including swarm memory!${NC}"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            echo -e "\n${GREEN}Performing full clean...${NC}"
            for pattern in "${TEST_FILES[@]}"; do
                rm -rf $pattern 2>/dev/null
            done
            find . -name "*.log" -not -path "./node_modules/*" -not -path "./.git/*" -delete
            rm -rf dist/ build/ .cache/
            rm -rf ruv-FANN/target/
            rm -rf .swarm/ .hive-mind/
            find . -name "package-lock.json" -not -path "./package-lock.json" -not -path "./node_modules/*" -delete
        else
            echo "Cancelled."
        fi
        ;;
    0)
        echo "Cleanup cancelled."
        exit 0
        ;;
    *)
        echo "Invalid option."
        exit 1
        ;;
esac

echo -e "\n${GREEN}✅ Cleanup complete!${NC}"

# Show space saved
echo -e "\n📊 Space freed:"
df -h . | tail -1