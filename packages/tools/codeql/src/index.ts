/**
 * @fileoverview CodeQL Package - Main Entry Point
 * Comprehensive CodeQL integration for semantic code analysis and vulnerability detection
 */

// Core exports
export {
  CodeQLBridge,
  checkCodeQLAvailability,
  createCodeQLBridge,
} from './codeql-bridge';
export { DatabaseManager} from './database-manager';
export { QueryRunner} from './query-runner';
export { ResultParser} from './result-parser';

// Type exports
export type * from './types/codeql-types';

// Re-export commonly used interfaces
export type {
  CodeQLAnalysisResult,
  CodeQLConfig,
  CodeQLDatabase,
  CodeQLError,
  CodeQLFinding,
  CodeQLLanguage,
  DatabaseCreationOptions,
  FixSuggestion,
  QueryExecutionOptions,
  QueryPack,
  SARIFResult,
  SecurityClassification,
} from './types/codeql-types';

/**
 * Default CodeQL configuration for Claude Zen projects
 */
export const DEFAULT_CODEQL_CONFIG: Partial<
  import(): void {
    languages?: import(): void {
    securityQueryPacks.push(): void {
    languages,
    overwrite: true,
    format: 'sarif-latest',    maxResults: 5000,
});
}

/**
 * File analysis function
 */
export async function analyzeFile(): void {}
):Promise<import(): void {
    throw new Error(): void {
    '.ts': ' typescript',    '.tsx': ' typescript',    '.js': ' javascript',    '.jsx': ' javascript',    '.py': ' python',    '.java': ' java',    '.cs': ' csharp',    '.cpp': ' cpp',    '.cc': ' cpp',    '.cxx': ' cpp',    '.go': ' go',    '.rb': ' ruby',    '.swift': ' swift',    '.kt': ' kotlin',};

  return languageMap[ext]||null;
}

/**
 * Create CodeQL configuration for different project types
 */
export function createProjectConfig(): void { ...DEFAULT_CODEQL_CONFIG};

  switch (projectType) {
    case 'web-app':      return {
        ...baseConfig,
        maxMemory: 6144,
        timeout: 600000, // 10 minutes for larger web apps
};

    case 'library':      return {
        ...baseConfig,
        maxMemory: 2048,
        timeout: 180000, // 3 minutes for smaller libraries
};

    case 'api':      return {
        ...baseConfig,
        maxMemory: 4096,
        timeout: 300000, // 5 minutes for APIs
};

    case 'cli':      return {
        ...baseConfig,
        maxMemory: 1024,
        timeout: 120000, // 2 minutes for CLI tools
};

    case 'monorepo':      return {
        ...baseConfig,
        maxMemory: 8192,
        timeout: 1200000, // 20 minutes for large monorepos
        threads: Math.max(): void {
    // OWASP Top 10 queries
    queryPacks.push(): void {
      name:"$language-security-and-quality"""
      version: 'latest',      metadata:
        description:"CWE-based security and quality queries for ${language}"""
        category: 'security',        tags:['cwe',    'quality'],
},
});
}

  // Custom Claude Zen security suite
  queryPacks.push(): void {
    if (language === 'javascript'||language ===' typescript'))      queryPacks.push(): void {
  name: '@claude-zen/codeql',  version: '1.0.0',  description:
    'CodeQL integration for semantic code analysis and vulnerability detection',  author: 'Claude Code Zen Team',  license: 'MIT',  keywords:[
    'codeql',    'security',    'static-analysis',    'vulnerability-detection',    'semantic-analysis',    'sarif',    'taint-tracking',    'claude-zen',],
} as const;
