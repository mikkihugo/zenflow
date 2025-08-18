#!/bin/bash

# Build script for claude-zen neural WASM module
# This generates the TypeScript bindings and WASM binary

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Building claude-zen neural WASM module...${NC}"

# Check if wasm-pack is installed
if ! command -v wasm-pack &> /dev/null; then
    echo -e "${RED}wasm-pack is not installed. Please install it:${NC}"
    echo "curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh"
    exit 1
fi

# Clean previous builds
echo -e "${YELLOW}Cleaning previous builds...${NC}"
rm -rf pkg/
rm -rf target/

# Build with wasm-pack
echo -e "${YELLOW}Building WASM module with wasm-pack...${NC}"
wasm-pack build \
    --target web \
    --out-dir pkg \
    --out-name claude_zen_neural \
    --release \
    --scope @claude-zen

# Verify the build
if [ -f "pkg/claude_zen_neural.js" ] && [ -f "pkg/claude_zen_neural_bg.wasm" ]; then
    echo -e "${GREEN}✅ WASM build successful!${NC}"
    echo -e "${GREEN}Generated files:${NC}"
    ls -la pkg/
else
    echo -e "${RED}❌ WASM build failed!${NC}"
    exit 1
fi

# Copy to the neural wasm directory for integration
TARGET_DIR="../../wasm"
echo -e "${YELLOW}Copying WASM files to ${TARGET_DIR}...${NC}"

mkdir -p "${TARGET_DIR}"
cp pkg/claude_zen_neural.js "${TARGET_DIR}/"
cp pkg/claude_zen_neural_bg.wasm "${TARGET_DIR}/"
cp pkg/claude_zen_neural.d.ts "${TARGET_DIR}/"
cp pkg/package.json "${TARGET_DIR}/wasm-package.json"

echo -e "${GREEN}✅ WASM files copied to neural/wasm directory${NC}"

# Show file sizes
echo -e "${YELLOW}File sizes:${NC}"
ls -lh "${TARGET_DIR}"/claude_zen_neural*

echo -e "${GREEN}🎉 Build complete! WASM module ready for TypeScript integration.${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update neural-bridge.ts to import from './wasm/claude_zen_neural'"
echo "2. Test the integration with a simple neural network"
echo "3. Connect to the DSPy coordination system"