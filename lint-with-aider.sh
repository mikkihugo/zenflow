#!/bin/bash

# GitHub Copilot Aider Linting Script
# Uses GPT-4.1 and GPT-4o for comprehensive codebase linting

set -e

# Load GitHub Copilot token
COPILOT_TOKEN=$(jq -r '.access_token' ~/.claude-zen/copilot-token.json)

if [ -z "$COPILOT_TOKEN" ] || [ "$COPILOT_TOKEN" = "null" ]; then
    echo "❌ No GitHub Copilot token found in ~/.claude-zen/copilot-token.json"
    exit 1
fi

echo "🚀 Starting codebase linting with GitHub Copilot models..."
echo "📋 Using GPT-4.1 (128k context, 16k output) and GPT-4o (128k context, 4k output)"

# Function to lint files with specific model
lint_with_model() {
    local model=$1
    local files=$2
    local description=$3
    
    echo ""
    echo "🔍 Linting with $model: $description"
    
    echo "Please lint these TypeScript files for:
- Type safety and strict typing
- Error handling and validation  
- Performance optimizations
- Code organization and maintainability
- Security best practices
- Documentation improvements
- Potential bugs or issues

Focus on practical improvements that enhance code quality." | \
    aider \
        --model "openai/$model" \
        --openai-api-base https://api.githubcopilot.com \
        --openai-api-key "$COPILOT_TOKEN" \
        --lint \
        --yes-always \
        --no-auto-commits \
        $files
}

# Core LLM provider files
echo "📦 Phase 1: Core LLM Provider Files"
lint_with_model "gpt-4.1" \
    "packages/llm-providers/src/api/github-models.ts packages/llm-providers/src/api/github-copilot.ts packages/llm-providers/src/types/api-providers.ts" \
    "GitHub API providers and type definitions"

# Database integration files  
echo "📦 Phase 2: Database Integration Files"
lint_with_model "gpt-4o" \
    "packages/llm-providers/src/api/github-models-db.ts packages/llm-providers/src/api/github-copilot-db.ts" \
    "Model metadata databases"

# Factory and registry files
echo "📦 Phase 3: Factory and Registry Files"  
lint_with_model "gpt-4.1" \
    "packages/llm-providers/src/factories/api-provider-factory.ts packages/llm-providers/src/registry/model-registry.ts packages/llm-providers/src/llm-provider.ts" \
    "Provider factories and model registry"

# Foundation package
echo "📦 Phase 4: Foundation Package"
lint_with_model "gpt-4o" \
    "packages/foundation/src/config.ts packages/foundation/src/logging.ts packages/foundation/src/error-handling.ts packages/foundation/src/utilities.ts" \
    "Foundation utilities and core functionality"

# Strategic facades
echo "📦 Phase 5: Strategic Facades"
lint_with_model "gpt-4.1" \
    "packages/intelligence/src/index.ts packages/enterprise/src/index.ts packages/operations/src/index.ts packages/infrastructure/src/index.ts" \
    "Strategic facade packages"

echo ""
echo "✅ Aider linting complete!"
echo "📊 Review the changes and run tests to verify improvements"
echo "🔧 Consider running: npm run lint && npm run test && npm run type-check"