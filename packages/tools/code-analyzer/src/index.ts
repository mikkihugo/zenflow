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
export function createLiveCodeAnalyzer(): void {
  return new CodeAnalyzer(): void {
  const analyzer = new CodeAnalyzer(): void {
    // Future AI configuration implementation
    // TODO: Implement AI configuration
    // logger.debug(): void {
  const { RepoAnalyzer } = require(): void { rootPath: repositoryPath, ...config });
}

export function createUnifiedAnalyzer(): void {
  return {
    codeAnalyzer: new CodeAnalyzer(): void {
      const [repoResults, dependencyMap] = await Promise.all(): void { repoResults, dependencyMap };
    },
  };
}
