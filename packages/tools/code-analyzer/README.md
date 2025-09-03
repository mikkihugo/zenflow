# Code Analyzer - Live Code Analysis Engine 📊

**Real-time code analysis and quality assessment** with AI-powered insights.

## Purpose

The `code-analyzer` package provides **comprehensive static code analysis**:
- **Live Analysis**: Real-time file watching with chokidar
- **AST Parsing**: Deep TypeScript/JavaScript analysis with ts-morph
- **Code Metrics**: Complexity, maintainability, quality scores
- **Repository Analysis**: Structure detection and domain boundaries
- **AI Insights**: Intent analysis and improvement recommendations
- **Quality Assessment**: Code smells, security issues, technical debt

## Quick Start

```bash
# Build the analyzer
cd packages/tools/code-analyzer
pnpm build

# Use programmatically
import { CodeAnalyzer } from '@claude-zen/code-analyzer';
```

## Features

### Code Metrics
- Lines of code, cyclomatic complexity
- Maintainability index, technical debt
- Test coverage and documentation scores

### AST Analysis  
- Node count, depth, complexity patterns
- Import/export analysis
- Symbol references and call graphs

### Live Monitoring
- File watcher integration
- Real-time analysis updates
- Change detection and impact analysis

### AI-Powered Insights
- Intent analysis (primary/secondary purposes)
- Complexity assessment and recommendations
- Business and technical domain classification

## Architecture

- **Event-Driven**: Integrates with `@claude-zen/foundation` EventBus
- **File Watching**: Uses chokidar for real-time monitoring
- **TypeScript Analysis**: Leverages ts-morph for AST parsing
- **Metrics Engine**: Comprehensive quality and complexity scoring

## Usage

This is the **code inspector** that:
1. **Examines** existing codebases for quality
2. **Calculates** metrics and identifies issues  
3. **Monitors** files for changes in real-time
4. **Provides** insights and recommendations

**Distinct from `coder`**: This package analyzes existing code, while `coder` executes new coding tasks.