# Claude Code Zen - Just Task Runner
# Install just: https://just.systems/man/en/

# Default recipe to display help
default:
  @just --list

# Install dependencies
install:
  PUPPETEER_SKIP_DOWNLOAD=true npm install

# Run linter with auto-fix
lint:
  npm run lint

# Run linter without auto-fix (check only)
lint-check:
  npx eslint . --cache

# Run code formatter
format:
  npm run format

# Run all tests
test:
  npm run test

# Run tests in watch mode
test-watch:
  npm run test:watch

# Run unit tests only
test-unit:
  npm run test:unit

# Run integration tests
test-integration:
  npm run test:integration

# Run test coverage
test-coverage:
  npm run test:coverage

# Build the project
build:
  npm run build

# Start development server
dev:
  npm run dev

# Start API server
api:
  npm run api

# Start web interface
web:
  npm run start:web

# Clean build artifacts
clean:
  npm run clean

# Run neural network tests
test-neural:
  npm run test:neural

# Run comprehensive tests
test-comprehensive:
  npm run test:comprehensive

# Run benchmark tests
benchmark:
  npm run benchmark:sqlite

# Validate SQLite optimizations
validate-sqlite:
  npm run validate:sqlite

# Run health checks
health:
  npm run health-check

# Run diagnostics
diagnostics:
  npm run diagnostics

# Generate documentation
docs:
  npm run docs:build

# Serve documentation
docs-serve:
  npm run docs:serve

# Full preflight check (build + test + lint)
preflight:
  npm run preflight

# Install dependencies and run preflight
setup: install preflight

# Quick development workflow (lint + test + dev)
quick: lint test-unit dev