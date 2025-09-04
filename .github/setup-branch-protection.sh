#!/bin/bash
# Setup branch protection rules for automated Claude linting

echo "🔒 Setting up branch protection with Claude lint requirement..."

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) not found. Install it first: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI. Run: gh auth login"
    exit 1
fi

# Get repository info
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
if [ -z "$REPO" ]; then
    echo "❌ Could not determine repository name"
    exit 1
fi

echo "📁 Repository: $REPO"

# Apply branch protection to main branch
echo "🔒 Applying branch protection to main branch..."

gh api repos/$REPO/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["claude-surgical-lint"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false

if [ $? -eq 0 ]; then
    echo "✅ Branch protection configured successfully!"
    echo ""
    echo "🔒 Protection rules applied:"
    echo "  • Claude surgical linting required"
    echo "  • Pull request reviews required (1 approval)"
    echo "  • Branches must be up to date before merge"
    echo "  • Force pushes disabled"
    echo ""
    echo "💡 To modify rules, edit this script and run again"
else
    echo "❌ Failed to configure branch protection"
    echo "Check your permissions and repository settings"
    exit 1
fi

# Enable auto-merge if possible (requires repo admin)
echo "🔄 Attempting to enable auto-merge..."
gh api repos/$REPO --method PATCH \
  --field allow_auto_merge=true \
  --silent && echo "✅ Auto-merge enabled" || echo "⚠️ Could not enable auto-merge (may need admin permissions)"

echo ""
echo "🎉 Claude automated linting workflow is now active!"
echo "   - Pushes and PRs will trigger surgical linting"
echo "   - Claude will fix issues automatically when possible"
echo "   - All changes preserve functionality"