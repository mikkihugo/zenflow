/**
 * @fileoverview File-Aware AI Type Definitions
 *
 * Core types for file-aware AI system with CodeMesh integration
 */

export interface FileAwareRequest {
  task: string;
  files?: string[];
  context?: {
    maxFiles?: number;
    includeTests?: boolean;
    includeDocs?: boolean;
  };
  options?: {
    dryRun?: boolean;
    model?: string;
    maxTokens?: number;
  };
}

export interface FileAwareResponse {
  success: boolean;
  changes: FileChange[];
  context: AnalyzedContext;
  metadata: {
    filesAnalyzed: number;
    provider: string;
    model: string;
    executionTime: number;
  };
}

export interface FileChange {
  type: 'create | modify' | 'delete''' | '''rename';
  path: string;
  content?: string;
  reasoning: string;
}

export interface FileInfo {
  path: string;
  content: string;
  size: number;
  lastModified: Date;
  language?: string;
}

export interface SymbolReference {
  name: string;
  type: 'function | class' | 'interface' | 'variable' | 'type';
  file: string;
  line: number;
  column: number;
}

export interface FileDependency {
  from: string;
  to: string;
  type: 'import | reference' | 'inheritance';
}

export interface AnalyzedContext {
  relevantFiles: string[];
  dependencies: FileDependency[];
  symbols: SymbolReference[];
  summary: string;
  complexity: 'low | medium' | 'high';
}

export interface FileAwareConfig {
  provider: 'codeMesh | codeMeshCopilot' | 'opencode''' | '''fallback';
  model?: string;
  rootPath: string;
  excludePatterns?: string[];
  maxFiles?: number;
  enableRustCore?: boolean;
  enableWasm?: boolean;
}
