/**
 * @fileoverview Development Strategic Facade - Type Definitions
 *
 * Strategic facade type definitions for development tools and utilities.
 */

// =============================================================================
// CORE DEVELOPMENT TYPES
// =============================================================================

export interface CodeAnalysisResult {
	analysis: string;
	complexity?: number;
	issues?: string[];
	suggestions?: string[];
	status: string;
	timestamp?: number;
	metrics?: {
		lines?: number;
		functions?: number;
		complexity?: number;
		loc?: number;
		maintainability?: number;
	};
}

export interface GitOperationResult {
	result: string;
	operation?: string;
	args?: string[];
	success?: boolean;
	status: string;
	timestamp?: number;
	output?: string;
}

export interface GitStatusResult {
	branch: string;
	status: string;
	modified: string[];
	staged: string[];
	untracked: string[];
}

export interface CodeQLResult {
	results: string[];
	query?: string;
	findings?: any[];
	vulnerabilities?: any[];
	status: string;
	timestamp?: number;
	confidence?: number;
}

export interface BeamAnalysisResult {
	analysis: string;
	language?: string;
	modules?: any[];
	functions?: any[];
	dependencies?: any[];
	status: string;
	timestamp?: number;
	project?: string;
	metadata?: {
		language?: string;
		modules?: any[];
		complexity?: string;
	};
}

export interface RepositoryAnalysisResult {
	analysis: string;
	metrics?: {
		files?: number;
		lines?: number;
		complexity?: string;
	};
	status: string;
}

export interface AILintingResult {
	issues: string[];
	suggestions?: string[];
	status: string;
}

export interface LanguageParsingResult {
	parsed: string;
	ast?: any;
	status: string;
}

export interface ArchitectureValidationResult {
	valid: boolean;
	boundaries?: string[];
	violations?: any[];
	status: string;
	analysis?: string;
	message?: string;
}

// =============================================================================
// DEVELOPMENT SYSTEM INTERFACES
// =============================================================================

export interface CodeAnalyzer {
	analyzeFile(filePath: string): Promise<CodeAnalysisResult>;
	initialize(): Promise<CodeAnalyzer>;
	getStatus(): { status: string; healthy: boolean; features?: string[] };
}

export interface GitOperationsManager {
	executeGitOperation(
		operation: string,
		args?: string[],
	): Promise<GitOperationResult>;
	initialize(): Promise<void>;
	getStatus(): { status: string; healthy: boolean; operations?: string[] };
}

export interface CodeQLBridge {
	runQuery(query: string): Promise<CodeQLResult>;
	initialize(): Promise<void>;
	getStatus(): { status: string; healthy: boolean; databases?: any[] };
}

export interface BeamAnalyzer {
	analyzeProject(projectPath: string): Promise<BeamAnalysisResult>;
	initialize(): Promise<void>;
	getStatus(): { status: string; healthy: boolean; languages?: string[] };
}

export interface RepositoryAnalyzer {
	analyzeRepository(path: string): Promise<RepositoryAnalysisResult>;
	analyze?(path: string): Promise<RepositoryAnalysisResult>;
}

export interface AILinter {
	lint(code: string): Promise<AILintingResult>;
}

export interface LanguageParser {
	parse(code: string): Promise<LanguageParsingResult>;
}

export interface ArchitectureValidator {
	validate(path: string): Promise<ArchitectureValidationResult>;
}

// =============================================================================
// DEVELOPMENT SYSTEM TYPE
// =============================================================================

export interface DevelopmentSystemType {
	// Core development tools
	codeAnalyzer(): Promise<any>;
	gitOperations(): Promise<any>;
	codeql(): Promise<any>;
	beamAnalyzer(): Promise<any>;

	// Additional development tools
	repoAnalyzer(): Promise<any>;
	aiLinter(): Promise<any>;
	languageParsers(): Promise<any>;
	architecture(): Promise<any>;

	// Direct access functions
	getCodeAnalyzer(): Promise<CodeAnalyzer>;
	getGitOperationsManager(): Promise<GitOperationsManager>;
	getCodeQLBridge(): Promise<CodeQLBridge>;
	getBeamAnalyzer(): Promise<BeamAnalyzer>;
	getRepositoryAnalyzer(): Promise<RepositoryAnalyzer>;
	getAILinter(): Promise<AILinter>;
	getLanguageParser(): Promise<LanguageParser>;
	getArchitectureValidator(): Promise<ArchitectureValidator>;

	// Utilities
	logger: any;
	init(): Promise<{ success: boolean; message: string }>;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type DevelopmentToolStatus =
	| "active"
	| "fallback"
	| "error"
	| "not-available";

export interface HealthStatus {
	status: string;
	healthy: boolean;
	features?: string[];
	operations?: string[];
	databases?: any[];
	languages?: string[];
}

export interface InitializationResult {
	success: boolean;
	message: string;
	timestamp?: number;
}

// Re-export common types
export type { Result } from "@claude-zen/foundation";
