#!/bin/bash
# Script to publish alpha.66 to npm

echo "Publishing claude-flow v2.0.0-alpha.66 to npm..."

# Ensure we're in the right directory
cd /workspaces/claude-code-flow

# Update npm version
npm version 2.0.0-alpha.66 --allow-same-version

# Run prepublishOnly script
npm run update-version

# Publish with alpha tag
npm publish --tag alpha --access public

# Verify publication
echo "Verifying publication..."
npm view claude-flow@alpha version

echo "Done! Alpha.66 should now be available."