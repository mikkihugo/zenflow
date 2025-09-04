#!/bin/bash
# Universal Git Auto-Sync Installer for All Repositories
# Installs consistent auto-sync hooks across all git repositories

set -e

echo "🔄 Installing Universal Git Auto-Sync System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

# Create global hooks directory
GLOBAL_HOOKS_DIR="$HOME/.git-hooks-global"
print_status "Creating global hooks directory: $GLOBAL_HOOKS_DIR"
mkdir -p "$GLOBAL_HOOKS_DIR"

# Create universal pre-push hook
cat > "$GLOBAL_HOOKS_DIR/pre-push" << 'EOF'
#!/bin/bash
# Universal Auto-sync Pre-Push Hook
# Pulls latest changes before push to reduce conflicts

echo "🔄 Auto-sync: Pulling latest changes before push..."

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "⚠️ Not in a git repository, skipping auto-sync"
    exit 0
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")
if [ -z "$CURRENT_BRANCH" ]; then
    echo "⚠️ Not on a branch, skipping auto-sync"
    exit 0
fi

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "⚠️ No origin remote found, skipping auto-sync"
    exit 0
fi

# Check if remote branch exists
if ! git rev-parse --verify "origin/$CURRENT_BRANCH" > /dev/null 2>&1; then
    echo "⚠️ Remote branch origin/$CURRENT_BRANCH not found, skipping auto-sync"
    exit 0
fi

# Check if there are any commits to push
if git diff --quiet HEAD "origin/$CURRENT_BRANCH" 2>/dev/null; then
    echo "ℹ️ No new commits to push, skipping auto-sync"
    exit 0
fi

# Pull with rebase before pushing
echo "📥 Pulling with rebase before push to avoid conflicts..."
if git pull --rebase origin "$CURRENT_BRANCH"; then
    echo "✅ Auto-sync completed successfully, proceeding with push"
    exit 0
else
    echo "❌ Auto-sync failed - resolve conflicts before pushing"
    echo "💡 Fix conflicts and run: git rebase --continue"
    exit 1
fi
EOF

# Create universal post-merge hook
cat > "$GLOBAL_HOOKS_DIR/post-merge" << 'EOF'
#!/bin/bash
# Universal Auto-sync Post-Merge Hook
# Pulls latest changes after merge to stay synchronized

echo "🔄 Auto-sync: Post-merge synchronization..."

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "⚠️ Not in a git repository, skipping post-merge sync"
    exit 0
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")
if [ -z "$CURRENT_BRANCH" ]; then
    echo "⚠️ Not on a branch, skipping post-merge sync"
    exit 0
fi

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "⚠️ No origin remote found, skipping post-merge sync"
    exit 0
fi

# Check if remote branch exists
if ! git rev-parse --verify "origin/$CURRENT_BRANCH" > /dev/null 2>&1; then
    echo "⚠️ Remote branch origin/$CURRENT_BRANCH not found, skipping post-merge sync"
    exit 0
fi

# Pull latest changes after merge
echo "📥 Pulling latest changes after merge..."
if git pull --rebase origin "$CURRENT_BRANCH"; then
    echo "✅ Post-merge sync completed successfully"
else
    echo "⚠️ Post-merge sync had issues, manual intervention may be needed"
fi

exit 0
EOF

# Make hooks executable
chmod +x "$GLOBAL_HOOKS_DIR/pre-push"
chmod +x "$GLOBAL_HOOKS_DIR/post-merge"

print_success "Created universal git hooks in $GLOBAL_HOOKS_DIR"

# Configure git to use global hooks template
print_status "Configuring git to use global hooks template..."
git config --global init.templateDir "$GLOBAL_HOOKS_DIR/.."
git config --global core.hooksPath "$GLOBAL_HOOKS_DIR"

# Configure git settings for better sync workflow
print_status "Configuring git settings for optimal auto-sync..."
git config --global pull.rebase true
git config --global push.autoSetupRemote true
git config --global rebase.autoStash true
git config --global merge.tool "vimdiff"
git config --global push.default "current"

print_success "Global git configuration updated"

# Function to install hooks in a specific repository
install_repo_hooks() {
    local repo_path="$1"
    if [ ! -d "$repo_path/.git" ]; then
        print_warning "Skipping $repo_path - not a git repository"
        return
    fi
    
    print_status "Installing hooks in: $repo_path"
    
    # Copy hooks to repository
    cp "$GLOBAL_HOOKS_DIR/pre-push" "$repo_path/.git/hooks/pre-push"
    cp "$GLOBAL_HOOKS_DIR/post-merge" "$repo_path/.git/hooks/post-merge"
    
    # Make executable
    chmod +x "$repo_path/.git/hooks/pre-push"
    chmod +x "$repo_path/.git/hooks/post-merge"
    
    print_success "Hooks installed in $repo_path"
}

# Install in current directory if it's a git repo
if [ -d ".git" ]; then
    install_repo_hooks "$(pwd)"
fi

# Find and install in common code directories
CODE_DIRS=(
    "$HOME/code"
    "$HOME/projects" 
    "$HOME/repositories"
    "$HOME/dev"
    "$HOME/workspace"
    "$HOME/Development"
)

print_status "Scanning for git repositories in common directories..."

for code_dir in "${CODE_DIRS[@]}"; do
    if [ -d "$code_dir" ]; then
        print_status "Scanning: $code_dir"
        find "$code_dir" -name ".git" -type d 2>/dev/null | while read -r git_dir; do
            repo_dir=$(dirname "$git_dir")
            install_repo_hooks "$repo_dir"
        done
    fi
done

# Create activation script for new repositories
cat > "$HOME/.git-hooks-activate.sh" << 'EOF'
#!/bin/bash
# Activate auto-sync hooks for current repository
# Run this in any git repository to enable auto-sync

if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository"
    exit 1
fi

GLOBAL_HOOKS_DIR="$HOME/.git-hooks-global"

if [ ! -d "$GLOBAL_HOOKS_DIR" ]; then
    echo "❌ Global hooks not installed. Run install-universal-autosync.sh first"
    exit 1
fi

echo "🔄 Activating auto-sync hooks for current repository..."

# Copy hooks
cp "$GLOBAL_HOOKS_DIR/pre-push" ".git/hooks/pre-push"
cp "$GLOBAL_HOOKS_DIR/post-merge" ".git/hooks/post-merge"

# Make executable
chmod +x ".git/hooks/pre-push"
chmod +x ".git/hooks/post-merge"

echo "✅ Auto-sync hooks activated for $(basename $(pwd))"
echo ""
echo "🔄 Auto-sync features enabled:"
echo "  • Pre-push: Pulls latest changes before pushing"
echo "  • Post-merge: Pulls latest changes after merging"
echo "  • Rebase-based workflow configured"
EOF

chmod +x "$HOME/.git-hooks-activate.sh"

print_success "Created activation script: $HOME/.git-hooks-activate.sh"

echo ""
echo "🎉 Universal Git Auto-Sync Installation Complete!"
echo ""
echo "✅ Global Configuration Applied:"
echo "  • Pull with rebase by default"
echo "  • Auto-setup remote branches on push"
echo "  • Auto-stash during rebase"
echo "  • Current branch push default"
echo ""
echo "✅ Hooks Installed:"
echo "  • Pre-push: Auto-pull before push"
echo "  • Post-merge: Auto-pull after merge"
echo ""
echo "📋 Usage:"
echo "  • New repos: Run ~/.git-hooks-activate.sh in any git repository"
echo "  • Existing repos: Hooks already installed where found"
echo ""
echo "💡 To disable hooks in a repository:"
echo "  • Remove files from .git/hooks/"
echo ""
echo "🔧 To update hooks globally:"
echo "  • Re-run this script to update all repositories"