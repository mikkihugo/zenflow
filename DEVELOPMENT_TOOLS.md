# Development Tools Guide

This document describes the available development tools and task runners for Claude Code Zen.

## Task Runner (Just Alternative)

Since the `just` command runner may not be available in all environments, we provide a Node.js-based alternative that provides the same functionality.

### Installation & Usage

The task runner is automatically available after running `npm install`. You can use it in several ways:

#### Option 1: Direct execution
```bash
node just-alternative.js [command]
node just-alternative.js --list  # Show all available commands
```

#### Option 2: Via npm script
```bash
npm run just -- [command]
npm run just -- --list  # Show all available commands
```

#### Option 3: Install just (if available in your environment)
```bash
# If you can install just directly:
curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash
# Then use: just [command]
```

### Available Commands

| Command | Description |
|---------|-------------|
| `install` | Install dependencies |
| `lint` | Run linter with auto-fix |
| `lint-check` | Run linter without auto-fix (check only) |
| `format` | Run code formatter |
| `test` | Run all tests |
| `test-unit` | Run unit tests only |
| `test-integration` | Run integration tests |
| `test-coverage` | Run test coverage |
| `build` | Build the project |
| `dev` | Start development server |
| `api` | Start API server |
| `web` | Start web interface |
| `clean` | Clean build artifacts |
| `test-neural` | Run neural network tests |
| `test-comprehensive` | Run comprehensive tests |
| `benchmark` | Run benchmark tests |
| `validate-sqlite` | Validate SQLite optimizations |
| `health` | Run health checks |
| `diagnostics` | Run diagnostics |
| `docs` | Generate documentation |
| `docs-serve` | Serve documentation |
| `preflight` | Full preflight check (build + test + lint) |
| `setup` | Install dependencies and run preflight |
| `quick` | Quick development workflow (lint + test + dev) |

### Examples

```bash
# Run linting
npm run just -- lint

# Run tests
npm run just -- test-unit

# Full setup for new development environment
npm run just -- setup

# Quick development iteration
npm run just -- quick
```

## Linting Tools

The project uses ESLint with a comprehensive configuration supporting:

- JavaScript (ES2024)
- TypeScript
- React components
- Node.js scripts
- Test files (Jest)

### Lint Commands

```bash
# Auto-fix issues
npm run lint

# Check only (no auto-fix)
npm run just -- lint-check

# Format code
npm run format
```

### Configuration

- **ESLint Config**: `eslint.config.js` (ESLint 9 flat config)
- **Legacy Config**: `.eslintrc.json` (for compatibility)
- **Prettier Config**: `.prettierrc.json`

## Build Tools

```bash
# Full build
npm run build

# Simple build (JS only)
npm run build:simple

# Clean build artifacts
npm run clean
```

## Environment Requirements

- **Node.js**: 22.17.1+ (as specified in `mise.toml`)
- **npm**: 10+
- **Optional**: `just` command runner

## Troubleshooting

### Missing Dependencies
If linting fails with "eslint: not found":
```bash
# Install dependencies (skip problematic downloads)
PUPPETEER_SKIP_DOWNLOAD=true npm install
```

### Network Issues
Some dependencies may fail to download due to network restrictions. Use environment variables to skip optional downloads:
```bash
PUPPETEER_SKIP_DOWNLOAD=true npm install
```

### Just Command Not Found
Use the Node.js alternative instead:
```bash
npm run just -- [command]
```