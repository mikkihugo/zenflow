#!/bin/bash
#
# Claude Code Zen - Registry Setup and Management Script
#

set -e

REGISTRY_URL="http://localhost:4873"
SCOPE="@claude-zen"

echo "🚀 Claude Code Zen Registry Setup"
echo "=================================="

# Function to check if Verdaccio is running
check_registry() {
    if curl -s "$REGISTRY_URL" > /dev/null 2>&1; then
        echo "✅ Registry is running at $REGISTRY_URL"
        return 0
    else
        echo "❌ Registry not accessible at $REGISTRY_URL"
        return 1
    fi
}

# Function to setup npm registry configuration
setup_npm_config() {
    echo ""
    echo "📋 Setting up npm configuration..."
    
    # Set registry for @claude-zen scope
    npm config set $SCOPE:registry $REGISTRY_URL
    echo "✅ Set registry for $SCOPE scope to $REGISTRY_URL"
    
    # Set always-auth for the registry
    npm config set //$REGISTRY_URL/:_authToken=""
    echo "✅ Configured authentication token"
    
    echo ""
    echo "📊 Current npm configuration:"
    npm config list | grep -E "(registry|$SCOPE|4873)" || echo "No registry config found"
}

# Function to create a test user
create_user() {
    echo ""
    echo "👤 Creating test user..."
    
    npm adduser --registry $REGISTRY_URL << EOF
claude-zen-test
test@claude-zen.local
testpassword
EOF
    
    echo "✅ Test user created: claude-zen-test"
}

# Function to publish a test package
publish_test_package() {
    echo ""
    echo "📦 Publishing test package..."
    
    # Create temporary test package
    mkdir -p /tmp/test-claude-zen-package
    cd /tmp/test-claude-zen-package
    
    cat > package.json << EOF
{
  "name": "@claude-zen/test-package",
  "version": "1.0.0",
  "description": "Test package for Claude Code Zen registry",
  "main": "index.js",
  "private": false,
  "publishConfig": {
    "registry": "$REGISTRY_URL"
  }
}
EOF
    
    echo 'module.exports = { test: true };' > index.js
    
    # Publish the test package
    npm publish --registry $REGISTRY_URL
    
    echo "✅ Test package published successfully"
    
    # Cleanup
    cd - > /dev/null
    rm -rf /tmp/test-claude-zen-package
}

# Function to list packages
list_packages() {
    echo ""
    echo "📋 Listing published packages:"
    echo "=============================="
    
    # Try to search for @claude-zen packages
    npm search @claude-zen --registry $REGISTRY_URL 2>/dev/null || {
        echo "No @claude-zen packages found yet"
    }
}

# Function to show registry info
show_info() {
    echo ""
    echo "ℹ️  Registry Information:"
    echo "========================"
    echo "Registry URL: $REGISTRY_URL"
    echo "Web UI: $REGISTRY_URL/-/web/"
    echo "Scope: $SCOPE"
    echo ""
    echo "To use this registry:"
    echo "npm config set $SCOPE:registry $REGISTRY_URL"
    echo ""
    echo "To publish packages:"
    echo "npm publish --registry $REGISTRY_URL"
    echo ""
    echo "To install from registry:"
    echo "npm install @claude-zen/package-name"
}

# Main execution
case "${1:-setup}" in
    "setup")
        if check_registry; then
            setup_npm_config
            echo ""
            echo "✅ Registry setup complete!"
            show_info
        else
            echo "❌ Please start the registry first:"
            echo "cd .verdaccio && ./start.sh"
        fi
        ;;
    "user")
        create_user
        ;;
    "test")
        publish_test_package
        ;;
    "list")
        list_packages
        ;;
    "info")
        show_info
        ;;
    *)
        echo "Usage: $0 [setup|user|test|list|info]"
        echo ""
        echo "Commands:"
        echo "  setup - Configure npm to use local registry"
        echo "  user  - Create test user"
        echo "  test  - Publish test package"
        echo "  list  - List published packages"
        echo "  info  - Show registry information"
        ;;
esac