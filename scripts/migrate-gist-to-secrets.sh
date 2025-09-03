#!/bin/bash
# Migrate environment variables from gists to GitHub repository secrets
# Usage: ./migrate-gist-to-secrets.sh

set -e

echo "🔄 Migrating gist-based environment to dotfiles + GitHub secrets..."

# List of gist IDs and their purposes
declare -A GISTS=(
    ["b8b6952f58a9e543053d6201e9d98d33"]="Development Service Environment Variables"
    ["b429c877f6b97080a394588ae57071a3"]="System Keys - Database, Encryption, Security" 
    ["a91f81273cfa80157a613259d01f977f"]="AI/Inference API Keys"
)

echo "📋 Found the following gists to migrate:"
for gist_id in "${!GISTS[@]}"; do
    echo "  - $gist_id: ${GISTS[$gist_id]}"
done

echo ""
echo "🎯 Migration strategy:"
echo "1. Extract secrets from gists → Set as organization/personal GitHub secrets"
echo "2. Move shell configs → Add to your dotfiles repo" 
echo "3. Update CI workflows → Use setup-env.yml with dotfiles integration"
echo "4. Delete gists after verification"

echo ""
echo "📝 Commands to set ORGANIZATION/PERSONAL secrets (not repo-specific):"
echo "gh secret set ANTHROPIC_API_KEY --org YOUR_ORG"  
echo "gh secret set OPENAI_API_KEY --org YOUR_ORG"
echo "gh secret set CLAUDE_API_KEY --org YOUR_ORG"
echo "gh secret set CLOUDFLARE_API_TOKEN --org YOUR_ORG"
echo "gh secret set DATABASE_URL --org YOUR_ORG"
echo "gh secret set ENCRYPTION_KEY --org YOUR_ORG"
echo "gh secret set REDIS_URL --org YOUR_ORG"

echo ""
echo "🏠 For personal account (if no org):"
echo "gh secret set ANTHROPIC_API_KEY --user"

echo ""
echo "✅ Benefits of organization/personal secrets:"
echo "    - Available across all repositories"
echo "    - Centralized management"  
echo "    - Gists remain as backup/reference"
echo "    - More secure than gists for CI/CD"