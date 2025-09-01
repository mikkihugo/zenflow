/**
* @fileoverview AI Linter Types - Core interfaces and types
* @module ai-linter/types
*/

// Basic Result type for now (will use foundation when it's fixed)
export type Result<T, E> =
| { success: true; data: T }
| { success: false; error: E };

/**
* AI linter processing modes
*/
export type AIMode = 'gpt-4.1' | 'gpt-5' | 'claude' | 'aider';

/**
* File scope for processing
*/
export type ScopeMode = 'app-only' | 'full-repo';

/**
* Processing modes for batch operations
*/
export type ProcessingMode = 'sequential' | 'parallel';

/**
* File error information
*/
export interface FileError {
file: string;
line: number;
column: number;
message: string;
severity: 'error' | 'warning';
source: 'typescript' | 'eslint';
}

/**
* File processing result
*/
export interface ProcessingResult {
filePath: string;
success: boolean;
originalErrors: number;
fixedErrors: number;
timeTaken: number;
aiModel: AIMode;
backupPath?: string;
error?: string;
}

/**
* Batch processing result
*/
export interface BatchResult {
totalFiles: number;
processedFiles: number;
successCount: number;
failureCount: number;
totalErrors: number;
totalFixed: number;
totalTime: number;
results: ProcessingResult[];
}

/**
* Validation result for code content
*/
export interface ValidationResult {
isValid: boolean;
reason?: string;
}

/**
* AI linter configuration
*/
export interface AILinterConfig {
aiMode: AIMode;
scopeMode: ScopeMode;
processingMode: ProcessingMode;
temperature: number;
maxRetries: number;
backupEnabled: boolean;
eslintConfigPath: string;
}

/**
* File discovery options
*/
export interface FileDiscoveryOptions {
scope: ScopeMode;
extensions: string[];
excludePatterns: string[];
includePatterns: string[];
}
