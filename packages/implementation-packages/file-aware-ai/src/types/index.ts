/**
 * @fileoverview File-Aware AI Types
 * 
 * Core types for the file-aware AI system that provides codebase understanding
 * and intelligent file operations using any LLM provider.
 */

export interface FileAwareRequest {
  task: string;
  files?: string[]; // Specific files to focus on
  context?: {
    includeTests?: boolean;
    includeConfig?: boolean;
    maxFiles?: number;
    languages?: string[];
  };
  options?: {
    dryRun?: boolean;
    createBackup?: boolean;
    autoCommit?: boolean;
    branchName?: string;
  };
}

export interface FileAwareResponse {
  success: boolean;
  changes: FileChange[];
  context: AnalyzedContext;
  metadata: {
    filesAnalyzed: number;
    tokensUsed: number;
    provider: string;
    model: string;
    executionTime: number;
  };
  error?: string;
}

export interface FileChange {
  path: string;
  type: 'create' | 'modify' | 'delete' | 'rename';
  oldContent?: string;
  newContent?: string;
  diff?: string;
  reasoning: string;
}

export interface AnalyzedContext {
  relevantFiles: string[];
  dependencies: FileDependency[];
  symbols: SymbolReference[];
  summary: string;
  complexity: 'low' | 'medium' | 'high';
}

export interface FileDependency {
  from: string;
  to: string;
  type: 'import' | 'reference' | 'extend' | 'implement';
  symbols: string[];
}

export interface SymbolReference {
  name: string;
  type: 'function' | 'class' | 'interface' | 'type' | 'variable' | 'constant';
  file: string;
  line: number;
  column: number;
  usages: SymbolUsage[];
}

export interface SymbolUsage {
  file: string;
  line: number;
  column: number;
  type: 'definition' | 'usage' | 'modification';
}

export interface CodebaseIndex {
  files: FileInfo[];
  symbols: Map<string, SymbolReference>;
  dependencies: FileDependency[];
  lastUpdated: Date;
  version: string;
}

export interface FileInfo {
  path: string;
  language: string;
  size: number;
  lastModified: Date;
  checksum: string;
  exports: string[];
  imports: string[];
  functions: string[];
  classes: string[];
  interfaces: string[];
}

export interface ContextSelectionStrategy {
  name: string;
  maxFiles: number;
  maxTokens: number;
  priorityRules: PriorityRule[];
  compressionRules: CompressionRule[];
}

export interface PriorityRule {
  type: 'file_size' | 'modification_date' | 'dependency_count' | 'usage_frequency' | 'semantic_similarity';
  weight: number;
  direction: 'ascending' | 'descending';
}

export interface CompressionRule {
  type: 'summarize' | 'extract_signatures' | 'remove_comments' | 'remove_tests';
  threshold: number; // Token count threshold
  priority: number;
}

export interface FileAwareConfig {
  indexing: {
    enabled: boolean;
    watchFiles: boolean;
    ignorePatterns: string[];
    supportedLanguages: string[];
    maxFileSize: number; // bytes
  };
  context: {
    defaultStrategy: string;
    maxContextSize: number; // tokens
    compressionEnabled: boolean;
    cacheEnabled: boolean;
  };
  safety: {
    requireConfirmation: boolean;
    createBackups: boolean;
    maxFilesPerOperation: number;
    allowedOperations: ('create' | 'modify' | 'delete' | 'rename')[];
  };
  git: {
    autoCommit: boolean;
    createBranches: boolean;
    commitMessageTemplate: string;
  };
}