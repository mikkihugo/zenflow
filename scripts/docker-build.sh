#!/bin/bash
# Docker build script for Claude Flow

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REGISTRY=${DOCKER_REGISTRY:-"claudeflow"}
VERSION=$(node -p "require('./package.json').version")
BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# Print header
echo -e "${BLUE}=== Claude Flow Docker Build ===${NC}"
echo -e "Version: ${VERSION}"
echo -e "Commit: ${GIT_COMMIT}"
echo -e "Date: ${BUILD_DATE}"
echo ""

# Function to build image
build_image() {
    local target=$1
    local tag=$2
    local description=$3
    
    echo -e "${YELLOW}Building ${description}...${NC}"
    
    docker build \
        --target ${target} \
        --build-arg VERSION=${VERSION} \
        --build-arg BUILD_DATE=${BUILD_DATE} \
        --build-arg GIT_COMMIT=${GIT_COMMIT} \
        --label "org.opencontainers.image.title=Claude Flow ${description}" \
        --label "org.opencontainers.image.description=Claude Flow AI Orchestration Platform - ${description}" \
        --label "org.opencontainers.image.version=${VERSION}" \
        --label "org.opencontainers.image.created=${BUILD_DATE}" \
        --label "org.opencontainers.image.revision=${GIT_COMMIT}" \
        --label "org.opencontainers.image.vendor=Claude Flow" \
        --label "org.opencontainers.image.source=https://github.com/yourusername/claude-flow" \
        -t ${REGISTRY}/${tag}:${VERSION} \
        -t ${REGISTRY}/${tag}:latest \
        .
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Successfully built ${tag}${NC}"
    else
        echo -e "${RED}✗ Failed to build ${tag}${NC}"
        exit 1
    fi
}

# Function to test image
test_image() {
    local image=$1
    local description=$2
    
    echo -e "${YELLOW}Testing ${description}...${NC}"
    
    # Run basic health check
    docker run --rm ${REGISTRY}/${image}:${VERSION} node --version > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ ${description} health check passed${NC}"
    else
        echo -e "${RED}✗ ${description} health check failed${NC}"
        exit 1
    fi
}

# Function to scan image for vulnerabilities
scan_image() {
    local image=$1
    
    if command -v trivy &> /dev/null; then
        echo -e "${YELLOW}Scanning ${image} for vulnerabilities...${NC}"
        trivy image --severity HIGH,CRITICAL ${REGISTRY}/${image}:${VERSION}
    else
        echo -e "${YELLOW}Trivy not installed, skipping vulnerability scan${NC}"
    fi
}

# Main build process
echo -e "${BLUE}Starting build process...${NC}"

# Build production image
build_image "production" "claude-flow" "Production API Server"
test_image "claude-flow" "Production API Server"
scan_image "claude-flow"

# Build MCP server image
build_image "mcp-server" "claude-flow-mcp" "MCP Server"
test_image "claude-flow-mcp" "MCP Server"
scan_image "claude-flow-mcp"

# Build development image (optional)
if [ "$BUILD_DEV" = "true" ]; then
    build_image "development" "claude-flow-dev" "Development Environment"
    test_image "claude-flow-dev" "Development Environment"
fi

# Build test image (optional)
if [ "$BUILD_TEST" = "true" ]; then
    build_image "testing" "claude-flow-test" "Test Runner"
fi

# Print summary
echo ""
echo -e "${GREEN}=== Build Summary ===${NC}"
echo -e "Production images:"
echo -e "  - ${REGISTRY}/claude-flow:${VERSION}"
echo -e "  - ${REGISTRY}/claude-flow:latest"
echo -e "  - ${REGISTRY}/claude-flow-mcp:${VERSION}"
echo -e "  - ${REGISTRY}/claude-flow-mcp:latest"

if [ "$BUILD_DEV" = "true" ]; then
    echo -e "Development images:"
    echo -e "  - ${REGISTRY}/claude-flow-dev:${VERSION}"
    echo -e "  - ${REGISTRY}/claude-flow-dev:latest"
fi

if [ "$BUILD_TEST" = "true" ]; then
    echo -e "Test images:"
    echo -e "  - ${REGISTRY}/claude-flow-test:${VERSION}"
    echo -e "  - ${REGISTRY}/claude-flow-test:latest"
fi

echo ""
echo -e "${BLUE}Build complete!${NC}"

# Push images (optional)
if [ "$PUSH_IMAGES" = "true" ]; then
    echo ""
    echo -e "${YELLOW}Pushing images to registry...${NC}"
    
    docker push ${REGISTRY}/claude-flow:${VERSION}
    docker push ${REGISTRY}/claude-flow:latest
    docker push ${REGISTRY}/claude-flow-mcp:${VERSION}
    docker push ${REGISTRY}/claude-flow-mcp:latest
    
    if [ "$BUILD_DEV" = "true" ]; then
        docker push ${REGISTRY}/claude-flow-dev:${VERSION}
        docker push ${REGISTRY}/claude-flow-dev:latest
    fi
    
    if [ "$BUILD_TEST" = "true" ]; then
        docker push ${REGISTRY}/claude-flow-test:${VERSION}
        docker push ${REGISTRY}/claude-flow-test:latest
    fi
    
    echo -e "${GREEN}✓ Images pushed successfully${NC}"
fi

# Generate docker-compose with correct tags
if [ "$UPDATE_COMPOSE" = "true" ]; then
    echo ""
    echo -e "${YELLOW}Updating docker-compose.yml with new tags...${NC}"
    sed -i "s|DOCKER_IMAGE_TAG:-latest|DOCKER_IMAGE_TAG:-${VERSION}|g" docker-compose.prod.yml
    echo -e "${GREEN}✓ docker-compose.prod.yml updated${NC}"
fi

exit 0