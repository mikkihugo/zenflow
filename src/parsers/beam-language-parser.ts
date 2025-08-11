/**
 * BEAM Language Parser
 *
 * Unified parser for Elixir, Erlang, and Gleam files
 * Extracts modules, functions, types, and documentation
 */

import { readFile } from 'node:fs/promises';
import { basename, extname } from 'node:path';

export interface BeamModule {
  name: string;
  path: string;
  language: 'elixir' | 'erlang' | 'gleam';
  exports: BeamFunction[];
  types: BeamType[];
  documentation: string[];
  dependencies: string[];
  metadata: Record<string, any>;
}

export interface BeamFunction {
  name: string;
  arity: number;
  visibility: 'public' | 'private';
  signature: string;
  documentation?: string;
  lineNumber: number;
}

export interface BeamType {
  name: string;
  definition: string;
  documentation?: string;
  lineNumber: number;
}

export class BeamLanguageParser {
  /**
   * Parse a BEAM language file (Elixir/Erlang/Gleam)
   */
  async parseFile(filePath: string): Promise<BeamModule | null> {
    try {
      const content = await readFile(filePath, 'utf8');
      const ext = extname(filePath);
      const language = this.detectLanguage(ext);

      if (!language) return null;

      switch (language) {
        case 'elixir':
          return await this.parseElixirFile(filePath, content);
        case 'erlang':
          return await this.parseErlangFile(filePath, content);
        case 'gleam':
          return await this.parseGleamFile(filePath, content);
        default:
          return null;
      }
    } catch (error) {
      console.error(`Failed to parse ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Detect language from file extension
   */
  private detectLanguage(ext: string): 'elixir' | 'erlang' | 'gleam' | null {
    switch (ext.toLowerCase()) {
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
   * Parse Elixir file using regex patterns
   */
  private async parseElixirFile(
    filePath: string,
    content: string,
  ): Promise<BeamModule> {
    const moduleName =
      this.extractElixirModuleName(content) || basename(filePath, '.ex');
    const functions = this.extractElixirFunctions(content);
    const types = this.extractElixirTypes(content);
    const docs = this.extractElixirDocs(content);
    const deps = this.extractElixirDependencies(content);

    return {
      name: moduleName,
      path: filePath,
      language: 'elixir',
      exports: functions,
      types: types,
      documentation: docs,
      dependencies: deps,
      metadata: {
        hasGenServer: content.includes('use GenServer'),
        hasSupervisor: content.includes('use Supervisor'),
        hasApplication: content.includes('use Application'),
        hasPlug: content.includes('use Plug'),
        hasPhoenix: content.includes('use Phoenix'),
      },
    };
  }

  /**
   * Parse Erlang file using regex patterns
   */
  private async parseErlangFile(
    filePath: string,
    content: string,
  ): Promise<BeamModule> {
    const moduleName =
      this.extractErlangModuleName(content) || basename(filePath, '.erl');
    const functions = this.extractErlangFunctions(content);
    const types = this.extractErlangTypes(content);
    const docs = this.extractErlangDocs(content);
    const deps = this.extractErlangDependencies(content);

    return {
      name: moduleName,
      path: filePath,
      language: 'erlang',
      exports: functions,
      types: types,
      documentation: docs,
      dependencies: deps,
      metadata: {
        behaviour: this.extractErlangBehaviours(content),
        exports: this.extractErlangExports(content),
      },
    };
  }

  /**
   * Parse Gleam file using regex patterns
   */
  private async parseGleamFile(
    filePath: string,
    content: string,
  ): Promise<BeamModule> {
    const moduleName = basename(filePath, '.gleam');
    const functions = this.extractGleamFunctions(content);
    const types = this.extractGleamTypes(content);
    const docs = this.extractGleamDocs(content);
    const deps = this.extractGleamDependencies(content);

    return {
      name: moduleName,
      path: filePath,
      language: 'gleam',
      exports: functions,
      types: types,
      documentation: docs,
      dependencies: deps,
      metadata: {
        hasExternal: content.includes('@external'),
        hasFFI: content.includes('external'),
      },
    };
  }

  // Elixir parsing methods
  private extractElixirModuleName(content: string): string | null {
    const match = content.match(/defmodule\s+([A-Z][A-Za-z0-9._]*)/);
    return match ? match[1] : null;
  }

  private extractElixirFunctions(content: string): BeamFunction[] {
    const functions: BeamFunction[] = [];
    const defRegex =
      /(?:def|defp)\s+([a-z_][a-zA-Z0-9_]*(?:\?|!)?)\s*(?:\(([^)]*)\))?/g;
    const lines = content.split('\n');

    let match;
    while ((match = defRegex.exec(content)) !== null) {
      const functionName = match[1];
      const params = match[2] || '';
      const arity = params ? params.split(',').length : 0;
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const isPrivate = content
        .substring(match.index - 10, match.index)
        .includes('defp');

      functions.push({
        name: functionName,
        arity: arity,
        visibility: isPrivate ? 'private' : 'public',
        signature: `${functionName}(${params})`,
        lineNumber: lineNumber,
      });
    }

    return functions;
  }

  private extractElixirTypes(content: string): BeamType[] {
    const types: BeamType[] = [];
    const typeRegex =
      /@type\s+([a-z_][a-zA-Z0-9_]*(?:\([^)]*\))?)\s*::\s*([^\n]+)/g;

    let match;
    while ((match = typeRegex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      types.push({
        name: match[1],
        definition: match[2].trim(),
        lineNumber: lineNumber,
      });
    }

    return types;
  }

  private extractElixirDocs(content: string): string[] {
    const docs: string[] = [];
    const docRegex = /@moduledoc\s+"""(.*?)"""/gs;

    let match;
    while ((match = docRegex.exec(content)) !== null) {
      docs.push(match[1].trim());
    }

    return docs;
  }

  private extractElixirDependencies(content: string): string[] {
    const deps: string[] = [];

    // Extract use statements
    const useMatches = content.matchAll(/use\s+([A-Z][A-Za-z0-9._]*)/g);
    for (const match of useMatches) {
      deps.push(match[1]);
    }

    // Extract import statements
    const importMatches = content.matchAll(/import\s+([A-Z][A-Za-z0-9._]*)/g);
    for (const match of importMatches) {
      deps.push(match[1]);
    }

    // Extract alias statements
    const aliasMatches = content.matchAll(/alias\s+([A-Z][A-Za-z0-9._]*)/g);
    for (const match of aliasMatches) {
      deps.push(match[1]);
    }

    return [...new Set(deps)]; // Remove duplicates
  }

  // Erlang parsing methods
  private extractErlangModuleName(content: string): string | null {
    const match = content.match(/-module\s*\(\s*([a-z][a-zA-Z0-9_]*)\s*\)/);
    return match ? match[1] : null;
  }

  private extractErlangFunctions(content: string): BeamFunction[] {
    const functions: BeamFunction[] = [];
    const funcRegex = /^([a-z][a-zA-Z0-9_]*)\s*\(([^)]*)\)\s*->/gm;

    let match;
    while ((match = funcRegex.exec(content)) !== null) {
      const functionName = match[1];
      const params = match[2] || '';
      const arity = params ? params.split(',').length : 0;
      const lineNumber = content.substring(0, match.index).split('\n').length;

      functions.push({
        name: functionName,
        arity: arity,
        visibility: 'public', // Determined by export list
        signature: `${functionName}(${params})`,
        lineNumber: lineNumber,
      });
    }

    return functions;
  }

  private extractErlangTypes(content: string): BeamType[] {
    const types: BeamType[] = [];
    const typeRegex =
      /-type\s+([a-z_][a-zA-Z0-9_]*(?:\([^)]*\))?)\s*::\s*([^.]+)\./g;

    let match;
    while ((match = typeRegex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      types.push({
        name: match[1],
        definition: match[2].trim(),
        lineNumber: lineNumber,
      });
    }

    return types;
  }

  private extractErlangDocs(content: string): string[] {
    // Erlang typically uses %% comments for documentation
    const docs: string[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('%%') && trimmed.length > 3) {
        docs.push(trimmed.substring(2).trim());
      }
    }

    return docs;
  }

  private extractErlangDependencies(content: string): string[] {
    const deps: string[] = [];
    const includeRegex = /-include\s*\(\s*"([^"]+)"\s*\)/g;

    let match;
    while ((match = includeRegex.exec(content)) !== null) {
      deps.push(match[1]);
    }

    return deps;
  }

  private extractErlangBehaviours(content: string): string[] {
    const behaviours: string[] = [];
    const behaviourRegex = /-behaviour\s*\(\s*([a-z][a-zA-Z0-9_]*)\s*\)/g;

    let match;
    while ((match = behaviourRegex.exec(content)) !== null) {
      behaviours.push(match[1]);
    }

    return behaviours;
  }

  private extractErlangExports(content: string): string[] {
    const exports: string[] = [];
    const exportRegex = /-export\s*\(\s*\[([^\]]+)\]\s*\)/g;

    let match;
    while ((match = exportRegex.exec(content)) !== null) {
      const funcs = match[1].split(',').map((f) => f.trim());
      exports.push(...funcs);
    }

    return exports;
  }

  // Gleam parsing methods
  private extractGleamFunctions(content: string): BeamFunction[] {
    const functions: BeamFunction[] = [];
    const funcRegex = /(?:pub\s+)?fn\s+([a-z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)/g;

    let match;
    while ((match = funcRegex.exec(content)) !== null) {
      const functionName = match[1];
      const params = match[2] || '';
      const arity = params ? params.split(',').length : 0;
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const isPublic = content
        .substring(match.index - 10, match.index)
        .includes('pub');

      functions.push({
        name: functionName,
        arity: arity,
        visibility: isPublic ? 'public' : 'private',
        signature: `${functionName}(${params})`,
        lineNumber: lineNumber,
      });
    }

    return functions;
  }

  private extractGleamTypes(content: string): BeamType[] {
    const types: BeamType[] = [];
    const typeRegex =
      /(?:pub\s+)?type\s+([A-Z][a-zA-Z0-9_]*)\s*(?:\([^)]*\))?\s*=\s*([^\n]+)/g;

    let match;
    while ((match = typeRegex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      types.push({
        name: match[1],
        definition: match[2].trim(),
        lineNumber: lineNumber,
      });
    }

    return types;
  }

  private extractGleamDocs(content: string): string[] {
    const docs: string[] = [];
    const docRegex = /\/\/\/\s*(.*)/g;

    let match;
    while ((match = docRegex.exec(content)) !== null) {
      docs.push(match[1].trim());
    }

    return docs;
  }

  private extractGleamDependencies(content: string): string[] {
    const deps: string[] = [];
    const importRegex = /import\s+([a-z][a-zA-Z0-9_/]*)/g;

    let match;
    while ((match = importRegex.exec(content)) !== null) {
      deps.push(match[1]);
    }

    return deps;
  }
}

export default BeamLanguageParser;
