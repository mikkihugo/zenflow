/**
 * @fileoverview Code Analyzer Implementation Package
 *
 * Complete live code analysis implementation providing:
 * - Real-time file watching and analysis
 * - AI-powered code insights and recommendations
 * - TypeScript/JavaScript AST analysis
 * - Complexity and quality metrics
 * - Multi-language support
 *
 * This package provides the real implementation that @claude-zen/development
 * strategic facade delegates to when available.
 */

// Export main CodeAnalyzer class and utilities
export { analyzeFile, CodeAnalyzer, createCodeAnalyzer} from './code-analyzer';

import { CodeAnalyzer} from './code-analyzer';

// Export all types
export type * from './types/code-analysis';

// Export factory functions for common use cases
export function createLiveCodeAnalyzer(repositoryPath:string) {
  return new CodeAnalyzer(repositoryPath);
}

export function createAICodeAnalyzer(repositoryPath:string, aiConfig?:any) {
  const analyzer = new CodeAnalyzer(repositoryPath);
  // Configure AI features when available
  if (aiConfig) {
    // Future AI configuration implementation
    console.debug('AI configuration provided for code analyzer', {
    ')      config:aiConfig,
});
}
  return analyzer;
}
