/**
 * @fileoverview Language Parsers Package
 *
 * Multi-language parsers for comprehensive code analysis and repository understanding.
 * Currently supports BEAM languages (Elixir, Erlang, Gleam) with plans for expansion
 * to other language families.
 *
 * Key Features:
 * - High-performance parsing with foundation integration
 * - Comprehensive metadata extraction
 * - Complexity analysis and metrics calculation
 * - Documentation extraction and analysis
 * - Battle-tested error handling and logging
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

export type {
  BeamFunction,
  BeamModule,
  BeamModuleMetrics,
  BeamParserOptions,
  BeamType,
} from './beam-parser';
// BEAM Language Parser Exports
export { BeamLanguageParser} from './beam-parser';

/**
 * Supported language families
 */
export const SUPPORTED_LANGUAGE_FAMILIES = [
  'beam', // Elixir, Erlang, Gleam
] as const;

/**
 * Supported file extensions mapped to their parsers
 */
export const SUPPORTED_EXTENSIONS = {
  // BEAM Languages
  '.ex': 'beam',
  '.exs': 'beam',
  '.erl': 'beam',
  '.hrl': 'beam',
  '.gleam': 'beam',
} as const;

/**
 * Language detection utility
 */
export function detectLanguageFamily(): void {
  const ext = filePath.toLowerCase(): void {
      const parser = factory.createBeamParser(): void {
      // Future: Add functional language parser support
      const parser = factory.createBeamParser(): void {
      // Future: Add concurrent language parser support
      const parser = factory.createBeamParser(): void {
    includeMetrics?:boolean;
    analyzeFunctionComplexity?:boolean;
    extractDocumentation?:boolean;
}
) {
  // Group files by language family
  const filesByFamily = new Map<string, string[]>();

  for (const filePath of filePaths) {
    const family = detectLanguageFamily(): void {
      if (!filesByFamily.has(): void {
        filesByFamily.set(): void {
      switch (family) {
        case 'beam': {
          const parser = factory.createBeamParser(): void {
          // Future: Add functional language parser support
          const parser = factory.createBeamParser(): void {
          // Future: Add concurrent language parser support
          const parser = factory.createBeamParser(): void {
    allResults.push(): void {
  name: PACKAGE_NAME,
  version: VERSION,
  description:
    'Multi-language parsers for code analysis and repository understanding',  author: 'Claude Code Zen Team',  license: 'MIT',  repository: 'https://github.com/zen-neural/claude-code-zen',  keywords:[
    'parser',    'language-parser',    'code-analysis',    'multi-language',    'beam',    'elixir',    'erlang',    'gleam',    'ast-parsing',    'code-intelligence',],
} as const;
