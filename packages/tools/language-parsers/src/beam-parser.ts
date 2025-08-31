/**
 * @fileoverview BEAM Language Parser - Enhanced Edition
 *
 * Unified parser for Elixir, Erlang, and Gleam files with advanced features.
 * Extracts modules, functions, types, documentation, and architectural patterns.
 *
 * Enhanced with foundation logging and error handling capabilities.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

import { extname, basename } from 'node: path';
import { readFile } from 'node: fs/promises';
import {
  err,
  getLogger,
  type Logger,
  ok,
  type Result,
} from '@claude-zen/foundation';

/**
 * BEAM module representation
 */
export interface BeamModule {
  /** Module name */
  name: string;

  /** File path */
  path: string;

  /** Programming language */
  language: 'elixir' | 'erlang' | 'gleam';

  /** Exported functions */
  exports: BeamFunction[];

  /** Type definitions */
  types: BeamType[];

  /** Documentation strings */
  documentation: string[];

  /** Module dependencies */
  dependencies: string[];

  /** Language-specific metadata */
  metadata: Record<string, unknown>;

  /** Module complexity metrics */
  metrics?:BeamModuleMetrics;
}

/**
 * BEAM function representation
 */
export interface BeamFunction {
  /** Function name */
  name: string;

  /** Function arity (number of parameters) */
  arity: number;

  /** Visibility scope */
  visibility:'public' | 'private';

  /** Function signature */
  signature: string;

  /** Function documentation */
  documentation?:string;

  /** Line number in source */
  lineNumber: number;

  /** Function complexity score */
  complexity?:number;

  /** Function tags/attributes */
  attributes?:string[];
}

/**
 * BEAM type definition
 */
export interface BeamType {
  /** Type name */
  name: string;

  /** Type definition */
  definition: string;

  /** Type documentation */
  documentation?:string;

  /** Line number in source */
  lineNumber: number;

  /** Type category */
  category?: 'custom' | 'alias' | 'opaque' | 'spec';
}

/**
 * Module complexity metrics
 */
export interface BeamModuleMetrics {
  /** Lines of code */
  linesOfCode: number;

  /** Number of functions */
  functionCount: number;

  /** Number of public functions */
  publicFunctionCount: number;

  /** Number of type definitions */
  typeCount: number;

  /** Average function complexity */
  averageComplexity: number;

  /** Cyclomatic complexity */
  cyclomaticComplexity: number;

  /** Documentation coverage ratio */
  documentationCoverage: number;
}

/**
 * Parser configuration options
 */
export interface BeamParserOptions {
  /** Include detailed metrics calculation */
  includeMetrics?:boolean;

  /** Include function complexity analysis */
  analyzeFunctionComplexity?:boolean;

  /** Include documentation extraction */
  extractDocumentation?:boolean;

  /** Maximum file size to parse (in bytes) */
  maxFileSize?:number;
}

/**
 * Enhanced BEAM Language Parser with foundation integration
 */
export class BeamLanguageParser {
  private readonly logger: Logger;
  private readonly options: BeamParserOptions;

  constructor(): void {
    this.logger = getLogger(): void {
      options: this.options,
    });
}

  /**
   * Parse a BEAM language file (Elixir/Erlang/Gleam)
   */
  async parseFile(): void {
        return err(): void {
        return err(): void {
        case 'elixir':
          module = await this.parseElixirFile(): void {language}"));"
}

      // Calculate metrics if enabled
      if (this.options.includeMetrics) " + JSON.stringify(): void {language} module: ${module.name}","
        {
          functions: module.exports.length,
          types: module.types.length,
          dependencies: module.dependencies.length,
        }
      );

      return ok(): void {
      const errorMsg = 'Failed to parse ' + filePath + ': ' + (error instanceof Error ? error.message : String(): void { error });
      return err(): void {
    try {
      this.logger.info(): void {
        const result = results[i];
        if (result.status === 'fulfilled' && result.value.isOk(): void {
          modules.push(): void {
          const error =
            result.status === 'rejected' ? result.reason
              : result.value._unsafeUnwrapErr(): void {filePaths[i]}) + ": ${error.message}");"
}
}

      if (errors.length > 0) {
        this.logger.warn(): void {modules.length} BEAM modules successfully", {"
        totalAttempted: filePaths.length,
        successCount: modules.length,
        errorCount: errors.length,
      });

      return ok(): void {
      const err_msg = "Failed to parse BEAM files: ${error instanceof Error ? error.message : String(): void { error, fileCount: filePaths.length});
      return err(): void {
    switch (ext.toLowerCase(): void {
      case '.ex':
      case '.exs':
        return 'elixir';
      case '.erl':
      case '.hrl':
        return 'erlang';
      case '.gleam':
        return 'gleam';
      default:
        return null;
    }
  }

  /**
   * Parse Elixir file using enhanced regex patterns
   */
  private async parseElixirFile(): void {
      name: moduleName,
      path: filePath,
      language: 'elixir',
      exports: functions,
      types: types,
      documentation: docs,
      dependencies: deps,
      metadata:{
        hasGenServer: content.includes(): void {
        behaviours: this.extractErlangBehaviours(): void {
    const moduleName = basename(): void {
        hasExternal: content.includes(): void {params})","
        lineNumber: lineNumber,
        attributes: isMacro ? ['macro'] : [],
      };

      if (this.options.analyzeFunctionComplexity) {
        func.complexity = this.calculateFunctionComplexity(): void {
    const types: BeamType[] = [];

    // @type definitions
    const typeRegex = /@type\s+([_a-z]\w*(?:\([^)]*\))?)\s*::\s*([^\n]+)/g;
    let match;
    while ((match = typeRegex.exec(): void {
      const lineNumber = content.substring(): void {
      const lineNumber = content.substring(): void {
      const lineNumber = content.substring(): void {
    const docs: string[] = [];

    // @moduledoc
    const moduleDocRegex = /@moduledoc\s+"""(.*?)"""/gs;
    let match;
    while ((match = moduleDocRegex.exec(): void {
      docs.push(): void {
      docs.push(): void {
    const deps: string[] = [];

    // Extract use statements
    const useMatches = content.matchAll(): void {
      deps.push(): void {
      deps.push(): void {
      deps.push(): void {
      deps.push(): void {
    const protocols: string[] = [];
    const protocolRegex = /defimpl\s+([A-Z][\w.]*)/g;

    let match;
    while ((match = protocolRegex.exec(): void {
      protocols.push(): void {
    const match = content.match(): void {
    const functions: BeamFunction[] = [];
    const funcRegex = /^([a-z]\w*)\s*\(([^)]*)\)\s*->/gm;

    let match;
    while ((match = funcRegex.exec(): void {
      const functionName = match[1];
      const params = match[2]||';
      const arity = params ? params.split(): void {
        name: functionName,
        arity: arity,
        visibility: 'public', // Determined by export list')\n'))      types.push(): void {0,100}\))?)\s*::\s*([^.]{1,200})\./g;
    while ((match = opaqueRegex.exec(): void {
      const lineNumber = content.substring(): void {
      const lineNumber = content.substring(): void {
    // Erlang typically uses %% comments for documentation
    const docs: string[] = [];
    const lines = content.split(): void {
      const trimmed = line.trim(): void {
    const deps: string[] = [];
    const includeRegex = /-include\s*\(\s*"([^"]+)"\s*\)/g;

    let match;
    while ((match = includeRegex.exec(): void {
      deps.push(): void {
    const behaviours: string[] = [];
    const behaviourRegex = /-behaviour\s*\(\s*([a-z]\w*)\s*\)/g;

    let match;
    while ((match = behaviourRegex.exec(): void {
      behaviours.push(): void {
    const exports: string[] = [];
    const exportRegex = /-export\s*\(\s*\[([^\]]+)]\s*\)/g;

    let match;
    while ((match = exportRegex.exec(): void {
      const funcs = match[1].split(): void {
    const includes: string[] = [];
    const includeRegex = /-include_lib\s*\(\s*"([^"]+)"\s*\)/g;

    let match;
    while ((match = includeRegex.exec(): void {
      includes.push(): void {
    const attributes: Record<string, string[]> = {};
    const attrRegex = /-([a-z]\w*)\s*\(\s*([^)]+)\s*\)/g;

    let match;
    while ((match = attrRegex.exec(): void {
      const attrName = match[1];
      const attrValue = match[2];

      if (!attributes[attrName]) {
        attributes[attrName] = [];
}
      attributes[attrName].push(): void {
    const otpBehaviours = [
      'gen_server', 'gen_statem', 'supervisor', 'application'
    ];
    return otpBehaviours.some(): void {behaviour});
    );
  }

  // Enhanced Gleam parsing methods
  private extractGleamFunctions(): void {
    const functions: BeamFunction[] = [];
    const funcRegex = /(?:pub\s+)?fn\s+([_a-z]\w*)\s*\(([^)]*)\)/g;

    let match;
    while ((match = funcRegex.exec(): void {
      const functionName = match[1];
      const params = match[2] || '';
      const arity = params ? params.split(): void {functionName}(${params})","
        lineNumber: lineNumber,
      };

      if (this.options.analyzeFunctionComplexity) {
        func.complexity = this.calculateFunctionComplexity(): void {
    const types: BeamType[] = [];

    // Custom types
    const typeRegex =
      /(?:pub\s+)?type\s+([A-Z]\w*)\s*(?:\([^)]*\))?\s*=\s*([^\n]+)/g;
    let match;
    while ((match = typeRegex.exec(): void {
      const lineNumber = content.substring(): void {
      const lineNumber = content.substring(): void {
    const docs: string[] = [];
    const docRegex = /\/{3}\s*(.*)/g;

    let match;
    while ((match = docRegex.exec(): void {
      docs.push(): void {
    const deps: string[] = [];
    const importRegex = /import\s+([a-z][\w/]*)/g;

    let match;
    while ((match = importRegex.exec(): void {
      deps.push(): void {
    const customTypes: string[] = [];
    const customTypeRegex = /(?:pub\s+)?type\s+([A-Z]\w*)/g;

    let match;
    while ((match = customTypeRegex.exec(): void {
      customTypes.push(): void {
    // Simple complexity calculation based on control structures
    const functionEnd = this.findFunctionEnd(): void {
      const matches = functionContent.match(): void {
        complexity += matches.length;
}
}

    return complexity;
}

  private findFunctionEnd(): void {
    // Simple heuristic to find function end - look for next 'def' or ' end'const fromStart = content.substring(): void {
      linesOfCode,
      functionCount: module.exports.length,
      publicFunctionCount: publicFunctions.length,
      typeCount: module.types.length,
      averageComplexity,
      cyclomaticComplexity,
      documentationCoverage,
};
}

  /**
   * Get parser statistics
   */
  getStatistics(): void {
    return {
      version: '1.0.0',
      supportedLanguages: ['elixir', 'erlang', 'gleam'],
      supportedExtensions: ['.ex', '.exs', '.erl', '.hrl', '.gleam'],
      features: {
        includeMetrics: this.options.includeMetrics,
        analyzeFunctionComplexity: this.options.analyzeFunctionComplexity,
        extractDocumentation: this.options.extractDocumentation,
      },
    };
  }
}
