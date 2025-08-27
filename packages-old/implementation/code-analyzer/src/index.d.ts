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
export { analyzeFile, CodeAnalyzer, createCodeAnalyzer } from './code-analyzer';
import { CodeAnalyzer } from './code-analyzer';
export type * from './types/code-analysis';
export declare function createLiveCodeAnalyzer(repositoryPath: string): CodeAnalyzer;
export declare function createAICodeAnalyzer(repositoryPath: string, aiConfig?: any): CodeAnalyzer;
//# sourceMappingURL=index.d.ts.map