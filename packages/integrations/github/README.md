# GitHub Project Import Tool

This tool automatically imports TODOs and roadmap items from markdown files into GitHub project boards.

## Features

- 📋 **TODO Import**: Parses checkbox-style TODO items from markdown files
- 🗺️ **Roadmap Import**: Extracts roadmap phases, milestones, and deliverables
- 🏃 **Dry Run Mode**: Preview what would be imported without creating issues
- 🏷️ **Smart Labeling**: Automatically generates labels based on content and priority
- 📂 **Auto-Discovery**: Automatically finds TODO and roadmap files in your docs directory
- ✅ **Completion Filtering**: Only imports incomplete items by default

## Quick Start

### 1. Set up GitHub Token

Create a GitHub Personal Access Token with `repo` permissions:
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with `repo` scope
3. Copy the token for use in commands

### 2. Run Import (Dry Run First)

```bash
# Dry run to see what would be imported
node scripts/import-github-project.mjs \
  --token YOUR_GITHUB_TOKEN \
  --owner mikkihugo \
  --repo zenflow \
  --dry-run

# Actually create the issues
node scripts/import-github-project.mjs \
  --token YOUR_GITHUB_TOKEN \
  --owner mikkihugo \
  --repo zenflow

# Add to project board #3
node scripts/import-github-project.mjs \
  --token YOUR_GITHUB_TOKEN \
  --owner mikkihugo \
  --repo zenflow \
  --project 3 \
  --add-to-project
```

### 3. Using Environment Variables

```bash
export GITHUB_TOKEN="your_token_here"
export GITHUB_OWNER="mikkihugo"
export GITHUB_REPO="zenflow"

# Now you can run without specifying these each time
node scripts/import-github-project.mjs --dry-run
```

## What Gets Imported

### TODO Items
The tool looks for checkbox-style items in markdown files:

```markdown
- [ ] **Interactive Swarm Control**: Direct manipulation of swarm topology
- [x] **ENHANCED** with monorepo detection (Step 1 COMPLETE)
- [ ] **HIGH** Priority task with urgency marker
```

### Roadmap Items
The tool parses roadmap tables and deliverable lists:

```markdown
## Phase 1: Foundation
| Phase | Duration | Status |
|-------|----------|--------|
| Phase 0: Setup | 1 week | ✅ COMPLETE |
| Phase 1: Development | 2 weeks | 🔄 IN PROGRESS |

**Deliverables**:
- [ ] Complete dependency audit
- [x] Strategic fork preparation
```

## Command Line Options

```
Options:
  -t, --token <token>           GitHub personal access token (required)
  -o, --owner <owner>           GitHub repository owner (required)
  -r, --repo <repo>             GitHub repository name (required)
  -p, --project <number>        GitHub project number
  --docs-path <path>            Path to docs directory (default: "./docs")
  --todo-files <files...>       Specific TODO files to process
  --roadmap-files <files...>    Specific roadmap files to process
  --no-create-issues           Don't create GitHub issues (parse only)
  --add-to-project             Add created issues to project board
  --include-completed          Include completed items (default: only incomplete)
  --label-prefix <prefix>      Prefix for generated labels
  --dry-run                    Show what would be imported without creating issues
  -h, --help                   Display help for command
```

## Examples

### Basic Import (Recommended Flow)

```bash
# 1. First, run a dry run to see what would be imported
node scripts/import-github-project.mjs \
  --token ghp_xxxxxxxxxxxxxxxxxxxx \
  --owner mikkihugo \
  --repo zenflow \
  --dry-run

# 2. If the results look good, run the actual import
node scripts/import-github-project.mjs \
  --token ghp_xxxxxxxxxxxxxxxxxxxx \
  --owner mikkihugo \
  --repo zenflow
```

### Import to Project Board

```bash
# Import and add to project board #3
node scripts/import-github-project.mjs \
  --token ghp_xxxxxxxxxxxxxxxxxxxx \
  --owner mikkihugo \
  --repo zenflow \
  --project 3 \
  --add-to-project
```

### Import Specific Files

```bash
# Import only specific files
node scripts/import-github-project.mjs \
  --token ghp_xxxxxxxxxxxxxxxxxxxx \
  --owner mikkihugo \
  --repo zenflow \
  --todo-files docs/TODO.md \
  --roadmap-files docs/archive/AI_ROADMAP.md docs/archive/PROJECT_STATUS.md
```

### Include Completed Items

```bash
# Import everything, including completed items
node scripts/import-github-project.mjs \
  --token ghp_xxxxxxxxxxxxxxxxxxxx \
  --owner mikkihugo \
  --repo zenflow \
  --include-completed
```

## File Discovery

The tool automatically discovers relevant files in your docs directory:

### TODO Files
- `docs/TODO.md`
- `docs/todo.md`
- `docs/TODOS.md`
- Any file containing "todo" in the name

### Roadmap Files
- `docs/ROADMAP.md`
- `docs/AI_ROADMAP.md`
- `docs/PROJECT_STATUS.md`
- `docs/archive/` directory files
- Any file containing "roadmap" or "status" in the name

## Generated Labels

The tool automatically generates labels for imported issues:

- `todo` or `roadmap` - Type of item
- `category:gui-dashboard` - Based on content category
- `priority:high` - Based on priority markers (**HIGH**, **CRITICAL**, etc.)
- `phase:foundation` - Based on roadmap phase

## GitHub Projects v2 Support

Currently, the tool supports creating GitHub issues. Adding to Projects v2 boards requires the GraphQL API and is noted for future implementation. The tool will create issues that can be manually added to project boards.

## Troubleshooting

### Permission Errors
Ensure your GitHub token has `repo` permissions for the target repository.

### No Files Found
Check that your docs directory structure matches the expected patterns, or specify files manually with `--todo-files` and `--roadmap-files`.

### Rate Limiting
The tool respects GitHub's API rate limits. For large imports, consider running in smaller batches.

## Integration with Claude Code Zen

This tool is designed to work with the Claude Code Zen project's document-driven development workflow. It integrates with:

- Document intelligence services
- MCP tool integration
- Existing workflow orchestration
- Project status tracking systems