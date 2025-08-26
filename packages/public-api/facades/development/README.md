# @claude-zen/development

[![npm version](https://badge.fury.io/js/%40claude-zen%2Fdevelopment.svg)](https://badge.fury.io/js/%40claude-zen%2Fdevelopment)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Strategic Development Facade** - Complete development toolchain with AI-powered analysis, live code monitoring, and comprehensive repository insights.

## Overview

The Development Strategic Facade integrates **ALL strategic facades and foundation** to provide a unified development experience:

- 🧠 **Intelligence Facade**: AI-powered code analysis and recommendations
- 🏢 **Enterprise Facade**: Workflow integration and SAFE methodology
- 📊 **Operations Facade**: Performance tracking and telemetry
- 🏗️ **Infrastructure Facade**: Data persistence and event coordination
- 🔍 **Repo-Analyzer**: Repository-level insights and metrics
- ⚡ **Foundation**: Logging, error handling, type safety, DI

## Features

### 🔍 **Live Code Analysis**

- Real-time file watching and analysis
- Multi-language support (TypeScript, JavaScript, Python, Go, Rust, Java, C++)
- AST parsing and semantic analysis
- Code quality metrics and complexity analysis
- AI-powered insights and recommendations

### 📊 **Repository Analysis**

- Comprehensive workspace detection (Nx, Bazel, Moon, Turbo, Rush, Lerna, Nix)
- Dependency analysis with circular detection
- Git repository analysis with hotspot detection
- Domain analysis and splitting recommendations
- Security vulnerability scanning

### 🤖 **AI-Powered Features**

- Intent analysis and code understanding
- Refactoring opportunity detection
- Performance prediction and optimization
- Bug prediction and prevention
- Technical debt assessment
- Architecture improvement recommendations

### ⚡ **Performance & Monitoring**

- Real-time performance tracking
- Resource usage monitoring
- Analysis latency metrics
- Throughput optimization
- Caching and batching

## Installation

```bash
npm install @claude-zen/development
# or
yarn add @claude-zen/development
# or
pnpm add @claude-zen/development
```

## Quick Start

### Live Code Analysis

```typescript
import { startLiveCodeAnalysis } from '@claude-zen/development';

// Start live analysis with AI insights
const session = await startLiveCodeAnalysis('/path/to/your/repo', {
  enableAIRecommendations: true,
  enableAILinting: true,
  enableContextualAnalysis: true,
  realTimeAnalysis: true,
  languages: ['typescript', 'javascript', 'python'],
});

console.log(`Analysis session started: ${session.id}`);
console.log(`Watching ${session.watchedFiles.length} files`);
```

### Repository Analysis

```typescript
import { analyzeRepositoryWithAI } from '@claude-zen/development';

// Comprehensive repository analysis
const analysis = await analyzeRepositoryWithAI('/path/to/your/repo', {
  enableGitAnalysis: true,
  enableComplexityAnalysis: true,
  enableDependencyAnalysis: true,
  enableDomainAnalysis: true,
  enableAIRecommendations: true,
});

console.log(
  `Health Score: ${(analysis.summary.overallScore * 100).toFixed(1)}%`
);
console.log(`Domains: ${analysis.domains.length}`);
console.log(`Recommendations: ${analysis.recommendations.length}`);
```

### Single File Analysis

```typescript
import { analyzeFileWithAI } from '@claude-zen/development';

// Analyze single file with AI insights
const result = await analyzeFileWithAI('/path/to/file.ts', {
  enableAIRecommendations: true,
  enableAILinting: true,
  analysisMode: 'comprehensive',
});

console.log(`Complexity: ${result.quality.cyclomaticComplexity}`);
console.log(`Suggestions: ${result.suggestions.length}`);
console.log(`AI Insights: ${result.aiInsights ? 'Available' : 'None'}`);
```

## Advanced Usage

### Development System Integration

```typescript
import { getDevelopmentSystem } from '@claude-zen/development';

const devSystem = getDevelopmentSystem();
await devSystem.initialize();

// Get individual facade systems
const brainSystem = await devSystem.getBrainSystem();
const workflowEngine = await devSystem.getWorkflowEngine();
const performanceTracker = await devSystem.getPerformanceTracker();
const databaseSystem = await devSystem.getDatabaseSystem();
const eventSystem = await devSystem.getEventSystem();

// Create analyzers with full facade integration
const codeAnalyzer = await devSystem.createCodeAnalyzer('/repo/path');
const repoAnalyzer = await devSystem.createRepositoryAnalyzer('/repo/path');
```

### Custom Analysis Pipeline

```typescript
import { CodeAnalyzer, createCodeAnalyzer } from '@claude-zen/development';

const analyzer = createCodeAnalyzer('/path/to/repo');

// Start live analysis session
const sessionResult = await analyzer.startLiveAnalysis({
  enableWatching: true,
  enableAIRecommendations: true,
  analysisMode: 'intelligent',
  batchSize: 10,
  throttleMs: 100,
  languages: ['typescript', 'javascript'],
  excludePatterns: ['**/node_modules/**', '**/dist/**'],
});

if (sessionResult.isOk()) {
  const session = sessionResult.value;
  console.log(`Live analysis started: ${session.id}`);

  // Monitor session progress
  setInterval(() => {
    const status = analyzer.getSessionStatus();
    if (status) {
      console.log(`Files analyzed: ${status.filesAnalyzed}`);
      console.log(`Queue size: ${status.analysisQueue.length}`);
      console.log(`Suggestions: ${status.suggestionsGenerated}`);
    }
  }, 5000);
}

// Analyze specific file
const fileResult = await analyzer.analyzeFile('src/main.ts', {
  enableAIRecommendations: true,
  enableContextualAnalysis: true,
});

if (fileResult.isOk()) {
  const analysis = fileResult.value;
  console.log(`Analysis completed in ${analysis.analysisTime}ms`);
  console.log(`Suggestions: ${analysis.suggestions.length}`);

  if (analysis.aiInsights) {
    console.log(
      `Primary intent: ${analysis.aiInsights.intentAnalysis.primaryIntent}`
    );
    console.log(
      `Complexity: ${analysis.aiInsights.complexityAssessment.overallComplexity}`
    );
    console.log(
      `Refactoring opportunities: ${analysis.aiInsights.refactoringOpportunities.length}`
    );
  }
}

// Stop analysis when done
await analyzer.stopLiveAnalysis();
```

### Repository Health Assessment

```typescript
import { getRepositoryHealthWithAI } from '@claude-zen/development';

const health = await getRepositoryHealthWithAI('/path/to/repo');

console.log(`Overall Score: ${health.score}`);
console.log('Breakdown:', health.breakdown);
console.log('Critical Issues:', health.criticalIssues);
console.log('AI Recommendations:', health.aiRecommendations);
```

## Configuration Options

### CodeAnalysisOptions

```typescript
interface CodeAnalysisOptions {
  // Analysis scope
  includeTests?: boolean; // Include test files (default: false)
  includeNodeModules?: boolean; // Include node_modules (default: false)
  includeDotFiles?: boolean; // Include hidden files (default: false)
  maxFileSize?: number; // Skip files larger than this (default: 1MB)
  excludePatterns?: string[]; // Glob patterns to exclude

  // Analysis depth
  analysisMode?: 'syntax' | 'semantic' | 'intelligent' | 'comprehensive';
  realTimeAnalysis?: boolean; // Enable real-time analysis (default: true)
  enableWatching?: boolean; // Enable file watching (default: true)

  // AI-powered features
  enableAIRecommendations?: boolean; // Enable AI recommendations (default: true)
  enableAILinting?: boolean; // Enable AI linting (default: true)
  enableAIRefactoring?: boolean; // Enable AI refactoring (default: false)
  enableContextualAnalysis?: boolean; // Enable contextual analysis (default: true)

  // Performance settings
  batchSize?: number; // Batch size for processing (default: 10)
  throttleMs?: number; // Throttle delay in ms (default: 100)
  cachingEnabled?: boolean; // Enable caching (default: true)
  parallelProcessing?: boolean; // Enable parallel processing (default: true)

  // Language support
  languages?: SupportedLanguage[]; // Languages to analyze
  tsConfigPath?: string; // TypeScript config path
  babelConfigPath?: string; // Babel config path

  // Integration settings
  enableVSCodeIntegration?: boolean; // Enable VS Code integration
  enableIDEIntegration?: boolean; // Enable IDE integration
  enableCIIntegration?: boolean; // Enable CI integration
}
```

## Supported Languages

- **TypeScript** (.ts, .tsx, .mts, .cts)
- **JavaScript** (.js, .jsx, .mjs, .cjs)
- **Python** (.py)
- **Go** (.go)
- **Rust** (.rs)
- **Java** (.java)
- **C/C++** (.c, .cpp, .h, .hpp)
- **C#** (.cs)
- **Vue** (.vue)
- **Svelte** (.svelte)

## Analysis Results

### CodeAnalysisResult

```typescript
interface CodeAnalysisResult {
  id: string;
  filePath: string;
  language: SupportedLanguage;
  timestamp: Date;

  // Syntax analysis
  ast: ASTAnalysis;
  syntaxErrors: SyntaxError[];
  parseSuccess: boolean;

  // Semantic analysis
  semantics: SemanticAnalysis;
  typeErrors: TypeError[];

  // Quality metrics
  quality: CodeQualityMetrics;
  suggestions: CodeSuggestion[];

  // AI insights
  aiInsights?: AICodeInsights;

  // Performance metrics
  analysisTime: number;
  memoryUsage: number;
}
```

### AI Code Insights

```typescript
interface AICodeInsights {
  // AI-powered analysis
  intentAnalysis: IntentAnalysis;
  complexityAssessment: ComplexityAssessment;
  refactoringOpportunities: RefactoringOpportunity[];

  // Contextual understanding
  businessLogicAnalysis: BusinessLogicAnalysis;
  architecturalPatterns: ArchitecturalPattern[];
  technicalDebtAssessment: TechnicalDebtAssessment;

  // Predictive insights
  bugPrediction: BugPrediction;
  maintenancePrediction: MaintenancePrediction;
  performancePrediction: PerformancePrediction;

  // Learning insights
  skillGapAnalysis: SkillGapAnalysis;
  learningRecommendations: LearningRecommendation[];
}
```

## Strategic Facade Integration

The Development facade integrates all strategic facades:

### Intelligence Facade

```typescript
import { getBrainSystem } from '@claude-zen/development';

const brainSystem = await getBrainSystem();
const coordinator = brainSystem.createCoordinator();

// AI-powered code analysis
const insights = await coordinator.optimizePrompt({
  task: 'Code analysis and insights generation',
  basePrompt: 'Analyze this TypeScript code...',
  context: { language: 'typescript', filePath: './src/main.ts' },
  qualityRequirement: 0.9,
});
```

### Enterprise Facade

```typescript
import { getWorkflowEngine, getSafeFramework } from '@claude-zen/development';

const workflowEngine = await getWorkflowEngine();
const safeFramework = await getSafeFramework();

// Integrate code analysis into development workflows
await workflowEngine.executeWorkflow('code-quality-check', {
  repositoryPath: '/path/to/repo',
  analysisOptions: { enableAIRecommendations: true },
});
```

### Operations Facade

```typescript
import {
  getPerformanceTracker,
  getTelemetryManager,
} from '@claude-zen/development';

const performanceTracker = await getPerformanceTracker();
const telemetryManager = await getTelemetryManager();

// Track development metrics
await performanceTracker.startSession('code-analysis-session');
await telemetryManager.trackEvent('file-analyzed', {
  language: 'typescript',
  complexity: 15,
  duration: 450,
});
```

### Infrastructure Facade

```typescript
import { getDatabaseSystem, getEventSystem } from '@claude-zen/development';

const databaseSystem = await getDatabaseSystem();
const eventSystem = await getEventSystem();

// Persist analysis results
await databaseSystem.store('analysis-results', analysisId, result);

// Coordinate development events
await eventSystem.emit('code-quality-improved', {
  filePath: './src/main.ts',
  improvement: 25,
});
```

## Best Practices

### Performance Optimization

```typescript
// For large repositories
const result = await startLiveCodeAnalysis('/large/repo', {
  analysisMode: 'semantic', // Skip comprehensive analysis
  batchSize: 5, // Smaller batches
  throttleMs: 200, // More throttling
  excludePatterns: ['**/node_modules/**', '**/vendor/**', '**/third_party/**'],
  languages: ['typescript', 'javascript'], // Limit languages
});

// For CI/CD pipelines
const health = await getRepositoryHealthWithAI('/repo', {
  enableGitAnalysis: false, // Skip git analysis in CI
  enableAIRecommendations: false, // Skip AI for speed
  maxFileSize: 100000, // Skip very large files
});
```

### Error Handling

```typescript
import { Result, ok, err } from '@claude-zen/development';

const analysisResult = await analyzeFileWithAI('./src/main.ts');

if (analysisResult.isOk()) {
  const analysis = analysisResult.value;
  console.log('Analysis successful:', analysis.id);
} else {
  const error = analysisResult.error;
  console.error('Analysis failed:', error.message);
}
```

### Event-Driven Development

```typescript
import { getEventSystem } from '@claude-zen/development';

const eventSystem = await getEventSystem();

// Listen for analysis events
eventSystem.on('file-analysis-completed', (data) => {
  console.log(`File analyzed: ${data.filePath}`);
  console.log(`Duration: ${data.duration}ms`);
});

eventSystem.on('suggestion-generated', (data) => {
  console.log(`New suggestion: ${data.title}`);
  console.log(`Severity: ${data.severity}`);
});

eventSystem.on('ai-insights-generated', (data) => {
  console.log(`AI insights for: ${data.filePath}`);
  console.log(`Intent: ${data.insights.intentAnalysis.primaryIntent}`);
});
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](../../CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](../../LICENSE) file for details.

## Support

- 📖 [Documentation](https://docs.claude-zen.dev/development)
- 🐛 [Issues](https://github.com/zen-neural/claude-code-zen/issues)
- 💬 [Discussions](https://github.com/zen-neural/claude-code-zen/discussions)

---

Built with ❤️ by the Claude Code Zen team
