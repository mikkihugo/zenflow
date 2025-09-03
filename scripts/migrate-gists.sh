#!/bin/bash
# Migrate gist secrets to GitHub organization/personal secrets and delete gists
set -e

echo "🔄 Migrating gist-based environment to dotfiles + GitHub secrets..."

# Gist IDs from your list
DEVELOPMENT_GIST="b8b6952f58a9e543053d6201e9d98d33"  # Development Service Environment Variables
SYSTEM_KEYS_GIST="b429c877f6b97080a394588ae57071a3"  # System Keys - Database, Encryption, Security
AI_KEYS_GIST="a91f81273cfa80157a613259d01f977f"      # AI/Inference API Keys

echo ""
echo "📋 Extracting secrets from gists..."

# Download gist content to temp files
echo "⬇️  Downloading Development Service Environment Variables..."
gh gist view $DEVELOPMENT_GIST --raw > /tmp/dev_env.txt

echo "⬇️  Downloading System Keys..."
gh gist view $SYSTEM_KEYS_GIST --raw > /tmp/system_keys.txt

echo "⬇️  Downloading AI/Inference API Keys..."
gh gist view $AI_KEYS_GIST --raw > /tmp/ai_keys.txt

echo ""
echo "🔐 Setting organization/personal secrets..."
echo "ℹ️  You'll be prompted to enter each secret value manually"
echo "📂 Reference files saved to /tmp/ for copy-paste"

# Common secrets to set
SECRET_NAMES=(
    "ANTHROPIC_API_KEY"
    "OPENAI_API_KEY" 
    "CLAUDE_API_KEY"
    "CLOUDFLARE_API_TOKEN"
    "DATABASE_URL"
    "ENCRYPTION_KEY"
    "REDIS_URL"
)

# Check if user has an organization
echo ""
echo "🏢 Do you want to set these as organization secrets? (y/N)"
read -r USE_ORG

if [[ $USE_ORG =~ ^[Yy]$ ]]; then
    echo "📝 Enter your organization name:"
    read -r ORG_NAME
    SECRET_FLAG="--org $ORG_NAME"
    echo "Will set secrets for organization: $ORG_NAME"
else
    SECRET_FLAG="--user"
    echo "Will set secrets for personal account"
fi

echo ""
echo "🔑 Setting secrets (you'll be prompted for each value)..."

for secret in "${SECRET_NAMES[@]}"; do
    echo ""
    echo "Setting $secret..."
    echo "📄 Check /tmp/dev_env.txt, /tmp/system_keys.txt, or /tmp/ai_keys.txt for value"
    gh secret set "$secret" $SECRET_FLAG
done

echo ""
echo "🗑️  Delete gists after verification? (y/N)"
read -r DELETE_GISTS

if [[ $DELETE_GISTS =~ ^[Yy]$ ]]; then
    echo "🗑️  Deleting gists..."
    gh gist delete $DEVELOPMENT_GIST --confirm
    gh gist delete $SYSTEM_KEYS_GIST --confirm
    gh gist delete $AI_KEYS_GIST --confirm
    echo "✅ Gists deleted"
else
    echo "ℹ️  Gists kept for backup. Delete manually when ready:"
    echo "   gh gist delete $DEVELOPMENT_GIST"
    echo "   gh gist delete $SYSTEM_KEYS_GIST"  
    echo "   gh gist delete $AI_KEYS_GIST"
fi

# Cleanup temp files
rm -f /tmp/dev_env.txt /tmp/system_keys.txt /tmp/ai_keys.txt

echo ""
echo "✅ Migration complete!"
echo ""
echo "🎯 Your environment is now set up with:"
echo "   📁 Dotfiles: ~/.dotfiles (installed and configured)"
echo "   🔐 Secrets: Set as GitHub organization/personal secrets"
echo "   🚀 Workflows: Updated to use setup-env.yml"
echo ""
echo "🔄 To test the CI setup, create a comment with @claude in a PR or issue"