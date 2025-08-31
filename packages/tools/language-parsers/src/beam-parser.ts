/**
 * @fileoverview BEAM Language Parser - Simplified Edition
 *
 * Unified parser for Elixir, Erlang, and Gleam files with basic functionality.
 * Extracts modules, functions, and basic patterns.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */

// Types
export interface BeamFunction {
  name: string;
  arity: number;
  startLine: number;
  endLine: number;
  documentation?: string;
  visibility: 'public' | 'private';
  complexity?: number;
}

export interface BeamModule {
  name: string;
  path: string;
  language: 'elixir' | 'erlang' | 'gleam';
  functions: BeamFunction[];
  dependencies: string[];
  documentation?: string;
  protocols?: string[];
  types?: string[];
  metrics?: BeamModuleMetrics;
}

export interface BeamModuleMetrics {
  linesOfCode: number;
  numberOfFunctions: number;
  cyclomaticComplexity: number;
  maintainabilityIndex: number;
}

export interface BeamParserOptions {
  includeMetrics?: boolean;
  analyzeFunctionComplexity?: boolean;
  extractDocumentation?: boolean;
}

// Parser class
export class BeamParser {
  private options: BeamParserOptions;

  constructor(options: Partial<BeamParserOptions> = {}) {
    this.options = {
      includeMetrics: true,
      analyzeFunctionComplexity: true,
      extractDocumentation: true,
      ...options,
    };
  }

  /**
   * Parse a BEAM language file
   */
  parseFile(filePath: string, content: string): BeamModule {
    const language = this.detectLanguage(filePath);
    
    switch (language) {
      case 'elixir':
        return this.parseElixir(filePath, content);
      case 'erlang':
        return this.parseErlang(filePath, content);
      case 'gleam':
        return this.parseGleam(filePath, content);
      default:
        throw new Error(`Unsupported language for file: ${filePath}`);
    }
  }

  /**
   * Detect language from file extension
   */
  private detectLanguage(filePath: string): 'elixir' | 'erlang' | 'gleam' {
    if (filePath.endsWith('.ex') || filePath.endsWith('.exs')) {
      return 'elixir';
    } else if (filePath.endsWith('.erl') || filePath.endsWith('.hrl')) {
      return 'erlang';
    } else if (filePath.endsWith('.gleam')) {
      return 'gleam';
    }
    throw new Error(`Unknown file extension: ${filePath}`);
  }

  /**
   * Parse Elixir file
   */
  private parseElixir(filePath: string, content: string): BeamModule {
    const basename = filePath.split('/').pop()?.replace(/\.(ex|exs)$/, '') || 'unknown';
    const moduleName = this.extractElixirModuleName(content) || basename;
    const functions = this.extractElixirFunctions(content);
    const dependencies = this.extractElixirDependencies(content);

    const module: BeamModule = {
      name: moduleName,
      path: filePath,
      language: 'elixir',
      functions,
      dependencies,
      protocols: this.extractElixirProtocols(content),
    };

    if (this.options.includeMetrics) {
      module.metrics = this.calculateModuleMetrics(module, content);
    }

    return module;
  }

  /**
   * Parse Erlang file
   */
  private parseErlang(filePath: string, content: string): BeamModule {
    const basename = filePath.split('/').pop()?.replace(/\.(erl|hrl)$/, '') || 'unknown';
    const moduleName = this.extractErlangModuleName(content) || basename;
    const functions = this.extractErlangFunctions(content);

    const module: BeamModule = {
      name: moduleName,
      path: filePath,
      language: 'erlang',
      functions,
      dependencies: [],
    };

    if (this.options.includeMetrics) {
      module.metrics = this.calculateModuleMetrics(module, content);
    }

    return module;
  }

  /**
   * Parse Gleam file
   */
  private parseGleam(filePath: string, content: string): BeamModule {
    const basename = filePath.split('/').pop()?.replace(/\.gleam$/, '') || 'unknown';
    const functions = this.extractGleamFunctions(content);

    const module: BeamModule = {
      name: basename,
      path: filePath,
      language: 'gleam',
      functions,
      dependencies: this.extractGleamDependencies(content),
      types: this.extractGleamCustomTypes(content),
    };

    if (this.options.includeMetrics) {
      module.metrics = this.calculateModuleMetrics(module, content);
    }

    return module;
  }

  /**
   * Extract Elixir module name
   */
  private extractElixirModuleName(content: string): string | null {
    const match = content.match(/defmodule\s+([A-Z][A-Za-z0-9_.]*)/);
    return match ? match[1] : null;
  }

  /**
   * Extract Elixir functions
   */
  private extractElixirFunctions(content: string): BeamFunction[] {
    const functions: BeamFunction[] = [];
    const defRegex = /def\s+([a-z_][a-zA-Z0-9_]*)/g;
    let match;

    while ((match = defRegex.exec(content)) !== null) {
      const name = match[1];
      const startLine = content.substring(0, match.index).split('\n').length;
      
      functions.push({
        name,
        arity: 0, // Simplified - would need parameter parsing
        startLine,
        endLine: startLine + 10, // Simplified
        visibility: 'public',
      });
    }

    return functions;
  }

  /**
   * Extract Elixir dependencies
   */
  private extractElixirDependencies(content: string): string[] {
    const deps: string[] = [];
    const aliasRegex = /alias\s+([A-Z][A-Za-z0-9_.]*)/g;
    let match;

    while ((match = aliasRegex.exec(content)) !== null) {
      deps.push(match[1]);
    }

    return deps;
  }

  /**
   * Extract Elixir protocols
   */
  private extractElixirProtocols(content: string): string[] {
    const protocols: string[] = [];
    const protocolRegex = /defprotocol\s+([A-Z][A-Za-z0-9_.]*)/g;
    let match;

    while ((match = protocolRegex.exec(content)) !== null) {
      protocols.push(match[1]);
    }

    return protocols;
  }

  /**
   * Extract Erlang module name
   */
  private extractErlangModuleName(content: string): string | null {
    const match = content.match(/-module\(([a-z_][a-zA-Z0-9_]*)\)/);
    return match ? match[1] : null;
  }

  /**
   * Extract Erlang functions
   */
  private extractErlangFunctions(content: string): BeamFunction[] {
    const functions: BeamFunction[] = [];
    const functionRegex = /^([a-z_][a-zA-Z0-9_]*)\s*\(/gm;
    let match;

    while ((match = functionRegex.exec(content)) !== null) {
      const name = match[1];
      const startLine = content.substring(0, match.index).split('\n').length;
      
      functions.push({
        name,
        arity: 0, // Simplified
        startLine,
        endLine: startLine + 5, // Simplified
        visibility: 'public',
      });
    }

    return functions;
  }

  /**
   * Extract Gleam functions
   */
  private extractGleamFunctions(content: string): BeamFunction[] {
    const functions: BeamFunction[] = [];
    const functionRegex = /pub\s+fn\s+([a-z_][a-zA-Z0-9_]*)/g;
    let match;

    while ((match = functionRegex.exec(content)) !== null) {
      const name = match[1];
      const startLine = content.substring(0, match.index).split('\n').length;
      
      functions.push({
        name,
        arity: 0, // Simplified
        startLine,
        endLine: startLine + 5, // Simplified
        visibility: 'public',
      });
    }

    return functions;
  }

  /**
   * Extract Gleam dependencies
   */
  private extractGleamDependencies(content: string): string[] {
    const deps: string[] = [];
    const importRegex = /import\s+([a-z_][a-zA-Z0-9_]*)/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      deps.push(match[1]);
    }

    return deps;
  }

  /**
   * Extract Gleam custom types
   */
  private extractGleamCustomTypes(content: string): string[] {
    const types: string[] = [];
    const typeRegex = /type\s+([A-Z][A-Za-z0-9_]*)/g;
    let match;

    while ((match = typeRegex.exec(content)) !== null) {
      types.push(match[1]);
    }

    return types;
  }

  /**
   * Calculate module metrics
   */
  private calculateModuleMetrics(module: BeamModule, content: string): BeamModuleMetrics {
    const lines = content.split('\n');
    const linesOfCode = lines.filter(line => line.trim() && !line.trim().startsWith('#')).length;

    return {
      linesOfCode,
      numberOfFunctions: module.functions.length,
      cyclomaticComplexity: module.functions.length * 2, // Simplified
      maintainabilityIndex: Math.max(0, 100 - (linesOfCode / 10)), // Simplified
    };
  }

  /**
   * Get parser statistics
   */
  getStatistics(): Record<string, unknown> {
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

// Export default instance
export default new BeamParser();