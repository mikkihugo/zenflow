#!/bin/bash
# Install git hooks for auto-sync functionality

echo "🔧 Installing git auto-sync hooks..."

# Get the repository root
REPO_ROOT=$(git rev-parse --show-toplevel)
HOOKS_DIR="$REPO_ROOT/.githooks"
GIT_HOOKS_DIR="$REPO_ROOT/.git/hooks"

# Check if we're in a git repository
if [ ! -d "$REPO_ROOT/.git" ]; then
    echo "❌ Not in a git repository"
    exit 1
fi

# Install hooks
for hook in post-merge pre-push; do
    if [ -f "$HOOKS_DIR/$hook" ]; then
        echo "📋 Installing $hook hook..."
        cp "$HOOKS_DIR/$hook" "$GIT_HOOKS_DIR/$hook"
        chmod +x "$GIT_HOOKS_DIR/$hook"
        echo "✅ $hook hook installed"
    else
        echo "⚠️ Hook file $hook not found in $HOOKS_DIR"
    fi
done

# Configure git settings for better sync
echo "⚙️ Configuring git settings for auto-sync..."
git config pull.rebase true
git config push.autoSetupRemote true
git config rebase.autoStash true

echo "✅ Git auto-sync hooks installed successfully!"
echo ""
echo "🔄 Auto-sync features enabled:"
echo "  • Pre-push: Pulls latest changes before pushing"
echo "  • Post-merge: Pulls latest changes after merging"
echo "  • Git configured for rebase-based workflow"
echo ""
echo "💡 To disable hooks: remove files from .git/hooks/"