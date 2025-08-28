# @claude-zen/repo-analyzer

[![npm version](https://badge.fury.io/js/%40claude-zen%2Frepo-analyzer.svg)](https://badge.fury.io/js/%40claude-zen%2Frepo-analyzer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Battle-hardened repository analysis toolkit** with comprehensive metrics and AI-powered recommendations.

## Features

🔍 **Comprehensive Analysis**

- Code complexity analysis using multiple battle-tested NPM tools
- Dependency analysis with circular dependency detection
- Domain analysis and splitting recommendations
- Git repository analysis with hotspot detection

🏗️ **Workspace Support**

- **Nx** - Full workspace.json and project.json support
- **Bazel** - WORKSPACE and BUILD file analysis
- **Moon** - .moon/workspace.yml configuration
- **Turbo** - turbo.json pipeline analysis
- **Rush** - rush.json monorepo support
- **Lerna** - lerna.json configuration
- **Yarn/PNPM/NPM Workspaces** - package.json workspace analysis
- **Nix** - flake.nix and derivation analysis

🧠 **AI-Powered Recommendations**

- Intelligent refactoring suggestions
- Architecture improvement recommendations
- Performance optimization opportunities
- Security vulnerability detection

📊 **Multiple Export Formats**

- JSON, YAML, CSV for data processing
- HTML and Markdown for documentation
- PDF for executive reports
- GraphML and DOT for dependency visualization

## Installation

```bash
npm install @claude-zen/repo-analyzer
# or
yarn add @claude-zen/repo-analyzer
# or
pnpm add @claude-zen/repo-analyzer
```

## Quick Start

```typescript
import { analyzeRepository } from '@claude-zen/repo-analyzer';

// Simple analysis
const result = await analyzeRepository('/path/to/your/repo');
console.log(`Health Score: ${(result.summary.overallScore * 100).toFixed(1)}%`);

// With options
const result = await analyzeRepository('/path/to/your/repo', {
  includeTests: true,
  analysisDepth: 'deep',
  performanceMode: 'thorough',
});
```

## Advanced Usage

### Full Repository Analysis

```typescript
import { RepositoryAnalyzer } from '@claude-zen/repo-analyzer';

const analyzer = new RepositoryAnalyzer('/path/to/repo');

// Comprehensive analysis
const result = await analyzer.analyze({
  enableGitAnalysis: true,
  enableComplexityAnalysis: true,
  enableDependencyAnalysis: true,
  enableDomainAnalysis: true,
  complexityThresholds: {
    cyclomaticComplexity: 15,
    maintainabilityIndex: 25,
    linesOfCode: 400,
  },
});

// Export results
await analyzer.exportResults(result, 'html', './analysis-report.html');
await analyzer.exportResults(result, 'json', './analysis-data.json');
```

### Quick Health Check

```typescript
import { getRepositoryHealthScore } from '@claude-zen/repo-analyzer';

const health = await getRepositoryHealthScore('/path/to/repo');
console.log(`Overall Score: ${health.score}`);
console.log('Breakdown:', health.breakdown);
console.log('Critical Issues:', health.criticalIssues);
```

### Individual Analyzers

```typescript
import {
  ComplexityAnalyzer,
  DependencyAnalyzer,
  WorkspaceAnalyzer,
  GitAnalyzer,
  DomainAnalyzer,
} from '@claude-zen/repo-analyzer';

// Analyze complexity only
const complexityAnalyzer = new ComplexityAnalyzer();
await complexityAnalyzer.initialize('/path/to/repo');
const complexity = await complexityAnalyzer.analyzeRepository(files);

// Analyze workspace configuration
const workspaceAnalyzer = new WorkspaceAnalyzer();
const workspace = await workspaceAnalyzer.analyzeWorkspace('/path/to/repo');
console.log(`Detected workspace tool: ${workspace.tool}`);

// Git analysis
const gitAnalyzer = new GitAnalyzer('/path/to/repo');
const gitMetrics = await gitAnalyzer.analyzeRepository();
console.log(`Hot files: ${gitMetrics.hotFiles.length}`);
```

## Analysis Options

```typescript
interface AnalysisOptions {
  includeTests?: boolean; // Include test files (default: false)
  includeNodeModules?: boolean; // Include node_modules (default: false)
  includeDotFiles?: boolean; // Include hidden files (default: false)
  maxFileSize?: number; // Skip files larger than this
  excludePatterns?: string[]; // Glob patterns to exclude

  analysisDepth?: 'shallow' | 'moderate' | 'deep' | 'comprehensive';
  performanceMode?: 'fast' | 'balanced' | 'thorough';

  enableGitAnalysis?: boolean; // Enable git analysis (default: true)
  enableComplexityAnalysis?: boolean; // Enable complexity analysis (default: true)
  enableDependencyAnalysis?: boolean; // Enable dependency analysis (default: true)
  enableDomainAnalysis?: boolean; // Enable domain analysis (default: true)

  complexityThresholds?: {
    cyclomaticComplexity: number; // Default: 10
    maintainabilityIndex: number; // Default: 20
    linesOfCode: number; // Default: 300
    parameters: number; // Default: 7
    nestingDepth: number; // Default: 4
  };
}
```

## Battle-Tested Dependencies

This package uses industry-standard tools for maximum reliability:

### Code Analysis

- **ts-morph** - TypeScript AST manipulation and analysis
- **@typescript-eslint/parser** - TypeScript parsing with ESLint compatibility
- **@babel/parser** - JavaScript/JSX parsing with plugin support
- **complexity-report** - Comprehensive complexity metrics (cyclomatic, Halstead)

### Dependency Analysis

- **madge** - Proven dependency graph analysis with circular dependency detection
- **detective** - Dependency extraction supporting multiple module formats
- **precinct** - Multi-language dependency detection
- **graphlib** - Graph algorithms for dependency analysis

### File System & Git

- **fast-glob** - High-performance file system scanning
- **simple-git** - Git repository analysis and history parsing

### Graph & Visualization

- **dagre** - Directed graph layout algorithms
- **vis-network** - Interactive dependency graphs (optional)

## Supported Languages

- **TypeScript** (.ts, .tsx, .mts, .cts)
- **JavaScript** (.js, .jsx, .mjs, .cjs)
- **Python** (.py)
- **Go** (.go)
- **Rust** (.rs)
- **Java** (.java)
- **C/C++** (.c, .cpp, .h, .hpp)

## Report Formats

### JSON/YAML

```bash
# Programmatic access to all metrics
await analyzer.exportResults(result, 'json', './data.json');
await analyzer.exportResults(result, 'yaml', './data.yaml');
```

### HTML Report

```bash
# Professional web report with charts and graphs
await analyzer.exportResults(result, 'html', './report.html');
```

### Markdown Documentation

```bash
# Developer-friendly markdown format
await analyzer.exportResults(result, 'markdown', './ANALYSIS.md');
```

### Dependency Graphs

```bash
# GraphML for Gephi, yEd, Cytoscape
await analyzer.exportResults(result, 'graphml', './deps.graphml');

# DOT format for Graphviz
await analyzer.exportResults(result, 'dot', './deps.dot');
# Convert to image: dot -Tpng deps.dot -o deps.png
```

## CLI Usage

```bash
# Install globally
npm install -g @claude-zen/repo-analyzer

# Analyze current directory
repo-analyzer .

# Analyze with options
repo-analyzer /path/to/repo --format=html --output=report.html

# Quick health check
repo-analyzer /path/to/repo --health-only
```

## API Reference

### RepositoryAnalyzer

Main analyzer class that orchestrates all analysis components.

```typescript
class RepositoryAnalyzer {
  constructor(repositoryPath: string);

  async analyze(options?: AnalysisOptions): Promise<AnalysisResult>;
  async getHealthScore(options?: AnalysisOptions): Promise<HealthScore>;
  async exportResults(
    result: AnalysisResult,
    format: ExportFormat,
    outputPath?: string
  ): Promise<string>;
}
```

### Analysis Result

```typescript
interface AnalysisResult {
  repository: RepositoryMetrics;
  domains: Domain[];
  recommendations: AnalysisRecommendation[];
  summary: AnalysisSummary;
  exportOptions: ExportFormat[];
}
```

## Best Practices

### Performance Optimization

```typescript
// For large repositories, use fast mode
const result = await analyzeRepository('/large/repo', {
  performanceMode: 'fast',
  analysisDepth: 'shallow',
  excludePatterns: ['**/vendor/**', '**/third_party/**'],
});

// For CI/CD, focus on critical metrics
const health = await getRepositoryHealthScore('/repo', {
  enableGitAnalysis: false, // Skip git analysis in CI
  maxFileSize: 100000, // Skip very large files
});
```

### Workspace Analysis

```typescript
// Let the analyzer detect your workspace tool automatically
const analyzer = new RepositoryAnalyzer('/monorepo');
const result = await analyzer.analyze();

// Access workspace-specific information
if (result.repository.workspace) {
  console.log(`Tool: ${result.repository.workspace.tool}`);
  console.log(`Projects: ${result.repository.workspace.projects.length}`);
}
```

### Recommendation Implementation

```typescript
const result = await analyzeRepository('/repo');

// Filter recommendations by priority
const urgentIssues = result.recommendations.filter(
  (r) => r.priority === 'urgent'
);
const quickWins = result.recommendations.filter(
  (r) => r.priority === 'high' && r.effort.hours < 8
);

// Estimate total improvement effort
const totalHours = result.recommendations.reduce(
  (sum, r) => sum + r.effort.hours,
  0
);
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://docs.claude-zen.dev/repo-analyzer)
- 🐛 [Issues](https://github.com/zen-neural/claude-code-zen/issues)
- 💬 [Discussions](https://github.com/zen-neural/claude-code-zen/discussions)

---

Built with ❤️ by the Claude Code Zen team
