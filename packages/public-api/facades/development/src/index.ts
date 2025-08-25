/**
 * @fileoverview Development Strategic Facade - Pure Delegation
 *
 * STRATEGIC FACADE PURPOSE:
 * This facade provides unified access to development tools and utilities
 * by delegating directly to implementation packages.
 *
 * PURE DELEGATION ARCHITECTURE:
 * • @claude-zen/code-analyzer: Live code analysis with AI insights
 * • @claude-zen/git-operations: AI-powered Git operations management
 * • @claude-zen/ai-linter: Dynamic AI rule generation and linting
 * • @claude-zen/language-parsers: Multi-language code parsing
 * • @claude-zen/repo-analyzer: Repository analysis and metrics
 * • @claude-zen/codeql: Semantic code analysis and vulnerability detection
 * • @claude-zen/beam-analyzer: BEAM ecosystem analysis (Erlang/Elixir/Gleam/LFE)
 * • @claude-zen/architecture: Domain boundary validation and architecture management
 * • @claude-zen/sparc: SAFe 6.0 Development Management with SPARC methodology
 *
 * @author Claude Code Zen Team
 * @since 2.1.0 (Strategic Architecture v2.0.0)
 * @version 2.0.0
 */

import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('development');

// =============================================================================
// PURE DELEGATION - Direct import and re-export
// =============================================================================

export const getCodeAnalyzer = async () => {
  const { createCodeAnalyzer } = await import('@claude-zen/code-analyzer');
  return createCodeAnalyzer();
};

export const getGitOperationsManager = async () => {
  const { createGitOperationsManager } = await import('@claude-zen/git-operations');
  return createGitOperationsManager();
};

export const getCodeQLBridge = async () => {
  const { createCodeQLBridge } = await import('@claude-zen/codeql');
  return createCodeQLBridge();
};

export const getBeamAnalyzer = async () => {
  const { createBeamAnalyzer } = await import('@claude-zen/beam-analyzer');
  return createBeamAnalyzer();
};

export const getRepositoryAnalyzer = async () => {
  const { createRepositoryAnalyzer } = await import('@claude-zen/repo-analyzer');
  return createRepositoryAnalyzer();
};

export const getAILinter = async () => {
  const { createAILinter } = await import('@claude-zen/ai-linter');
  return createAILinter();
};

export const getLanguageParser = async () => {
  const { createBeamParser } = await import('@claude-zen/language-parsers');
  return createBeamParser();
};

export const getArchitectureValidator = async () => {
  const { createDomainBoundaryValidator } = await import('@claude-zen/architecture');
  return createDomainBoundaryValidator();
};

export const getSafe6DevelopmentManager = async () => {
  const { Safe6DevelopmentManager } = await import('@claude-zen/sparc');
  return Safe6DevelopmentManager;
};

export const createSafe6SolutionTrainManager = async (...args: unknown[]) => {
  const { createSafe6SolutionTrainManager } = await import('@claude-zen/sparc');
  return createSafe6SolutionTrainManager(...args);
};

export const createSafe6BusinessAgilityManager = async (...args: unknown[]) => {
  const { createSafe6BusinessAgilityManager } = await import('@claude-zen/sparc');
  return createSafe6BusinessAgilityManager(...args);
};

// =============================================================================
// MAIN SYSTEM OBJECT - Pure delegation system
// =============================================================================

export const developmentSystem = {
  // Core development tools
  getCodeAnalyzer,
  getGitOperationsManager,
  getCodeQLBridge,
  getBeamAnalyzer,
  getRepositoryAnalyzer,
  getAILinter,
  getLanguageParser,
  getArchitectureValidator,

  // SAFe 6.0 Development Management
  getSafe6DevelopmentManager,
  createSafe6SolutionTrainManager,
  createSafe6BusinessAgilityManager,

  // Utilities
  logger,
  init: () => {
    logger.info('Development system initialized');
    return { success: true, message: 'Development tools ready' };
  },
};

// =============================================================================
// TYPE EXPORTS - For external consumers
// =============================================================================

export type * from './types';

// Re-export package types
export type * from '@claude-zen/code-analyzer';
export type * from '@claude-zen/git-operations';
export type * from '@claude-zen/ai-linter';
export type * from '@claude-zen/language-parsers';
export type * from '@claude-zen/repo-analyzer';
export type * from '@claude-zen/codeql';
export type * from '@claude-zen/beam-analyzer';
export type * from '@claude-zen/architecture';
export type * from '@claude-zen/sparc';

// Default export for convenience
export default developmentSystem;