#!/bin/bash
#
# Claude Code Zen - Package Publishing Script
# Publishes packages to local Verdaccio registry
#

set -e

REGISTRY_URL="http://localhost:4873"
PACKAGES_DIR="./packages"

echo "📦 Claude Code Zen Package Publisher"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if registry is running
check_registry() {
    if curl -s "$REGISTRY_URL" > /dev/null 2>&1; then
        echo -e "✅ ${GREEN}Registry is running at $REGISTRY_URL${NC}"
        return 0
    else
        echo -e "❌ ${RED}Registry not accessible at $REGISTRY_URL${NC}"
        echo "Please start the registry first: cd .verdaccio && ./start.sh"
        return 1
    fi
}

# Function to build package
build_package() {
    local package_path=$1
    local package_name=$(basename "$package_path")
    
    echo -e "🔨 ${BLUE}Building $package_name...${NC}"
    
    cd "$package_path"
    
    if [ -f "package.json" ]; then
        # Check if package has build script
        if npm run | grep -q "build"; then
            npm run build
            echo -e "✅ ${GREEN}Built $package_name${NC}"
        else
            echo -e "ℹ️  ${YELLOW}No build script found for $package_name${NC}"
        fi
    else
        echo -e "❌ ${RED}No package.json found in $package_name${NC}"
        cd - > /dev/null
        return 1
    fi
    
    cd - > /dev/null
}

# Function to publish package
publish_package() {
    local package_path=$1
    local package_name=$(basename "$package_path")
    
    echo -e "📤 ${BLUE}Publishing $package_name...${NC}"
    
    cd "$package_path"
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        echo -e "❌ ${RED}No package.json found in $package_name${NC}"
        cd - > /dev/null
        return 1
    fi
    
    # Check if package is private
    local is_private=$(node -p "try { require('./package.json').private || false } catch(e) { false }")
    local pkg_name=$(node -p "try { require('./package.json').name || 'unknown' } catch(e) { 'unknown' }")
    
    if [ "$is_private" = "true" ]; then
        echo -e "🔒 ${YELLOW}Skipping private package: $pkg_name${NC}"
        cd - > /dev/null
        return 0
    fi
    
    # Add publishConfig to package.json if not present
    local has_publish_config=$(node -p "try { !!require('./package.json').publishConfig } catch(e) { false }")
    
    if [ "$has_publish_config" = "false" ]; then
        echo -e "⚙️  ${YELLOW}Adding publishConfig to $package_name${NC}"
        node -e "
            const fs = require('fs');
            const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            pkg.publishConfig = { registry: '$REGISTRY_URL' };
            fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
        "
    fi
    
    # Publish the package
    if npm publish --registry "$REGISTRY_URL"; then
        echo -e "✅ ${GREEN}Published $pkg_name${NC}"
    else
        echo -e "❌ ${RED}Failed to publish $pkg_name${NC}"
        cd - > /dev/null
        return 1
    fi
    
    cd - > /dev/null
}

# Function to list publishable packages
list_packages() {
    echo -e "📋 ${BLUE}Available packages:${NC}"
    echo "===================="
    
    for package_dir in "$PACKAGES_DIR"/*/; do
        if [ -f "$package_dir/package.json" ]; then
            local package_name=$(basename "$package_dir")
            local is_private=$(cd "$package_dir" && node -p "try { require('./package.json').private || false } catch(e) { false }")
            local pkg_name=$(cd "$package_dir" && node -p "try { require('./package.json').name || 'unknown' } catch(e) { 'unknown' }")
            local version=$(cd "$package_dir" && node -p "try { require('./package.json').version || '0.0.0' } catch(e) { '0.0.0' }")
            
            if [ "$is_private" = "true" ]; then
                echo -e "  🔒 ${YELLOW}$pkg_name@$version (private)${NC}"
            else
                echo -e "  📦 ${GREEN}$pkg_name@$version (public)${NC}"
            fi
        fi
    done
}

# Function to publish all packages
publish_all() {
    echo -e "🚀 ${BLUE}Publishing all public packages...${NC}"
    echo ""
    
    local success_count=0
    local total_count=0
    
    for package_dir in "$PACKAGES_DIR"/*/; do
        if [ -f "$package_dir/package.json" ]; then
            local package_name=$(basename "$package_dir")
            echo ""
            echo -e "📦 ${BLUE}Processing $package_name...${NC}"
            
            # Build first
            if build_package "$package_dir"; then
                # Then publish
                if publish_package "$package_dir"; then
                    ((success_count++))
                fi
            fi
            ((total_count++))
        fi
    done
    
    echo ""
    echo -e "📊 ${BLUE}Publishing Summary:${NC}"
    echo "==================="
    echo -e "✅ ${GREEN}Successful: $success_count${NC}"
    echo -e "❌ ${RED}Failed: $((total_count - success_count))${NC}"
    echo -e "📦 ${BLUE}Total: $total_count${NC}"
}

# Function to publish specific package
publish_one() {
    local package_name=$1
    local package_path="$PACKAGES_DIR/$package_name"
    
    if [ ! -d "$package_path" ]; then
        echo -e "❌ ${RED}Package $package_name not found in $PACKAGES_DIR${NC}"
        return 1
    fi
    
    echo -e "📦 ${BLUE}Publishing single package: $package_name${NC}"
    
    if build_package "$package_path" && publish_package "$package_path"; then
        echo -e "✅ ${GREEN}Successfully published $package_name${NC}"
    else
        echo -e "❌ ${RED}Failed to publish $package_name${NC}"
        return 1
    fi
}

# Main execution
if ! check_registry; then
    exit 1
fi

case "${1:-list}" in
    "list")
        list_packages
        ;;
    "all")
        publish_all
        ;;
    "agui"|"foundation"|"workflows"|"brain"|"ai-safety"|"knowledge"|"teamwork"|"sparc"|"coordination-core"|"multi-level-orchestration"|"safe-framework"|"memory-orchestration"|"llm-routing"|"agent-manager")
        publish_one "$1"
        ;;
    *)
        echo "Usage: $0 [list|all|package-name]"
        echo ""
        echo "Commands:"
        echo "  list - List all available packages"
        echo "  all  - Publish all public packages"
        echo "  [package-name] - Publish specific package"
        echo ""
        echo "Available packages:"
        list_packages | grep -E "📦|🔒" | sed 's/^/  /'
        ;;
esac