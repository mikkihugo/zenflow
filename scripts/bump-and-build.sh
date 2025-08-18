#!/bin/bash
#
# Claude Code Zen - Version Bump and Build Script
# Bumps all package versions by patch increment and builds them
#

set -e

PACKAGES_DIR="./packages"
APPS_DIR="./apps"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Claude Code Zen - Version Bump and Build${NC}"
echo "=============================================="

# Function to bump version in package.json
bump_version() {
    local package_path=$1
    local package_name=$(basename "$package_path")
    
    cd "$package_path"
    
    if [ -f "package.json" ]; then
        local current_version=$(node -p "require('./package.json').version")
        local pkg_name=$(node -p "require('./package.json').name")
        
        echo -e "${BLUE}📦 Bumping $pkg_name from $current_version${NC}"
        
        # Use npm version to bump patch version
        if npm version patch --no-git-tag-version > /dev/null 2>&1; then
            local new_version=$(node -p "require('./package.json').version")
            echo -e "   ✅ ${GREEN}$current_version → $new_version${NC}"
        else
            echo -e "   ❌ ${RED}Failed to bump version for $package_name${NC}"
        fi
    else
        echo -e "   ⚠️  ${YELLOW}No package.json found in $package_name${NC}"
    fi
    
    cd - > /dev/null
}

# Function to build package
build_package() {
    local package_path=$1
    local package_name=$(basename "$package_path")
    
    echo -e "${BLUE}🔨 Building $package_name...${NC}"
    
    cd "$package_path"
    
    if [ -f "package.json" ]; then
        # Check if package has build script
        if npm run | grep -q "build"; then
            if npm run build > /dev/null 2>&1; then
                echo -e "   ✅ ${GREEN}Built $package_name successfully${NC}"
            else
                echo -e "   ❌ ${RED}Build failed for $package_name${NC}"
                return 1
            fi
        else
            echo -e "   ℹ️  ${YELLOW}No build script found for $package_name${NC}"
        fi
    else
        echo -e "   ❌ ${RED}No package.json found in $package_name${NC}"
        return 1
    fi
    
    cd - > /dev/null
}

# Function to process all packages in a directory
process_packages() {
    local dir=$1
    local dir_name=$2
    
    echo -e "\n${MAGENTA}📁 Processing $dir_name...${NC}"
    echo "==============================="
    
    local success_count=0
    local total_count=0
    
    for package_dir in "$dir"/*/; do
        if [ -f "$package_dir/package.json" ]; then
            local package_name=$(basename "$package_dir")
            echo -e "\n${BLUE}📦 Processing $package_name...${NC}"
            
            # Bump version first
            bump_version "$package_dir"
            
            # Then build
            if build_package "$package_dir"; then
                ((success_count++))
            fi
            ((total_count++))
        fi
    done
    
    echo -e "\n${BLUE}📊 $dir_name Summary:${NC}"
    echo "==================="
    echo -e "✅ ${GREEN}Successful: $success_count${NC}"
    echo -e "❌ ${RED}Failed: $((total_count - success_count))${NC}"
    echo -e "📦 ${BLUE}Total: $total_count${NC}"
}

# Function to bump root package version
bump_root_version() {
    echo -e "\n${MAGENTA}📁 Processing Root Package...${NC}"
    echo "=============================="
    
    if [ -f "package.json" ]; then
        local current_version=$(node -p "require('./package.json').version")
        local pkg_name=$(node -p "require('./package.json').name")
        
        echo -e "${BLUE}📦 Bumping $pkg_name from $current_version${NC}"
        
        if npm version patch --no-git-tag-version > /dev/null 2>&1; then
            local new_version=$(node -p "require('./package.json').version")
            echo -e "   ✅ ${GREEN}$current_version → $new_version${NC}"
        else
            echo -e "   ❌ ${RED}Failed to bump root version${NC}"
        fi
    fi
}

# Main execution
case "${1:-all}" in
    "packages")
        process_packages "$PACKAGES_DIR" "Packages"
        ;;
    "apps")
        process_packages "$APPS_DIR" "Apps"
        ;;
    "root")
        bump_root_version
        ;;
    "all")
        bump_root_version
        process_packages "$PACKAGES_DIR" "Packages"
        process_packages "$APPS_DIR" "Apps"
        
        echo -e "\n${GREEN}🎉 All done! All packages have been version bumped and built.${NC}"
        echo -e "${BLUE}💡 Don't forget to commit the version changes!${NC}"
        ;;
    *)
        echo "Usage: $0 [packages|apps|root|all]"
        echo ""
        echo "Commands:"
        echo "  packages - Bump and build only packages"
        echo "  apps     - Bump and build only apps"
        echo "  root     - Bump only root package version"
        echo "  all      - Bump and build everything (default)"
        ;;
esac