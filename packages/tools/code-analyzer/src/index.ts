/**
 * @fileoverview Code Analyzer & Repository Analyzer Implementation Package
 *
 * Complete code and repository analysis implementation providing:
 * - Repository structure and workspace detection
 * - Build system detection (npm, pnpm, nx, bazel, etc.)
 * - Domain boundary validation and architecture analysis
 * - Real-time file watching and analysis
 * - AI-powered code insights and recommendations
 * - TypeScript/JavaScript AST analysis
 * - Complexity and quality metrics
 * - Multi-language support
 * - Dependency relationship mapping
 *
 * This package provides the real implementation that @claude-zen/development
 * strategic facade delegates to when available.
 */

// Export main CodeAnalyzer class and utilities
export {
  analyzeFile,
  CodeAnalyzer,
  createCodeAnalyzer,
  DependencyRelationshipMapper,
} from './code-analyzer';

import { CodeAnalyzer } from './code-analyzer';

// Export all types
export type * from './types/code-analysis';

// Export repository analysis functionality
export { RepoAnalyzer } from './repo-analyzer';
export type {
  RepoAnalyzerConfig,
  RepositoryAnalysisResult,
  DomainBoundaryValidation,
} from './repo-analyzer';

// Export factory functions for common use cases
export function createLiveCodeAnalyzer(repositoryPath: string) {
  return new CodeAnalyzer(repositoryPath);
}

export function createAICodeAnalyzer(repositoryPath: string, aiConfig?: any) {
  const analyzer = new CodeAnalyzer(repositoryPath);
  // Configure AI features when available
  if (aiConfig) {
    // Future AI configuration implementation
    // TODO: Implement AI configuration
    // logger.debug('AI configuration provided for code analyzer', {
    //   config: aiConfig,
    // });
  }
  return analyzer;
}

export function createRepoAnalyzer(repositoryPath: string, config?: any) {
  const { RepoAnalyzer } = require('./repo-analyzer');
  return new RepoAnalyzer({ rootPath: repositoryPath, ...config });
}

export function createUnifiedAnalyzer(repositoryPath: string) {
  return {
    codeAnalyzer: new CodeAnalyzer(repositoryPath),
    repoAnalyzer: createRepoAnalyzer(repositoryPath),
    async analyzeAll() {
      const [repoResults, dependencyMap] = await Promise.all([
        this.repoAnalyzer.analyzeDomainBoundaries(),
        this.codeAnalyzer.buildDependencyMap
          ? this.codeAnalyzer.buildDependencyMap()
          : Promise.resolve(null),
      ]);
      return { repoResults, dependencyMap };
    },
  };
}
