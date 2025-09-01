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
export const DEFAULT_CODEQL_CONFIG:Partial<
import('./types/codeql-types').CodeQLConfig> = {
maxMemory:4096,
threads:Math.max(1, Math.floor(require('node:os').cpus().length / 2)),
verbose:false,
timeout:300000, // 5 minutes
};

/**
* Quick analysis function for repositories
*/
export async function analyzeRepository(
repositoryPath:string,
options:{
languages?:import('./types/codeql-types').CodeQLLanguage[];
queryPacks?:import('./types/codeql-types').QueryPack[];
config?:Partial<import('./types/codeql-types').CodeQLConfig>;
} = {}
):Promise<import('./types/codeql-types').QueryExecutionResult> {
const bridge = createCodeQLBridge(options.config);

// Use provided query packs or defaults
const queryPacks =
options.queryPacks||(options.languages ? bridge.getDefaultQueryPacks(options.languages) :[]);

return bridge.analyzeRepository(repositoryPath, queryPacks, {
languages:options.languages||['typescript', 'javascript'],
overwrite:true,
});
}

/**
* Quick security scan function
*/
export async function performSecurityScan(
repositoryPath:string,
options:{
languages?: import('./types/codeql-types').CodeQLLanguage[];
config?: Partial<import('./types/codeql-types').CodeQLConfig>;
} = {}
):Promise<import('./types/codeql-types').QueryExecutionResult> {
const bridge = createCodeQLBridge(options.config);

// Get security-focused query packs
const languages = options.languages||['typescript', 'javascript'];') const securityQueryPacks:import('./types/codeql-types`).QueryPack[] = [];`)
for (const language of languages) {
securityQueryPacks.push({
name:`${language}-security-extended`,
version: `latest`, metadata:{
description:`Security queries for ${language}`,
category: `security`, focus: 'vulnerability-detection',},
});
}

// Add custom Claude Zen security queries
const customQueryPacks = await bridge.getCustomQueryPacks();
securityQueryPacks.push(
...customQueryPacks.filter((pack) => pack.metadata?.category === 'security')') );

return bridge.analyzeRepository(repositoryPath, securityQueryPacks, {
languages,
overwrite:true,
format: 'sarif-latest', maxResults:5000,
});
}

/**
* File analysis function
*/
export async function analyzeFile(
filePath:string,
options:{
queryPacks?:import('./types/codeql-types').QueryPack[];') config?:Partial<import('./types/codeql-types').CodeQLConfig>;')} = {}
):Promise<import('./types/codeql-types`).QueryExecutionResult> {
`) const __bridge = createCodeQLBridge(options.config);

// Detect language from file extension
const language = detectLanguageFromPath(filePath);
if (!language) {
throw new Error(`Unsupported file type:${filePath}`);`;
}

const queryPacks =
options.queryPacks||bridge.getDefaultQueryPacks([language]);

return bridge.analyzeFile(filePath, queryPacks);
}

/**
* Detect language from file path
*/
function detectLanguageFromPath(
filePath:string
):import(`./types/codeql-types`).CodeQLLanguage|null {
') const ext = require('path').extname(filePath).toLowerCase();')
const languageMap:Record<
string,
import('./types/codeql-types').CodeQLLanguage') > = {
'.ts': ' typescript', '.tsx': ' typescript', '.js': ' javascript', '.jsx': ' javascript', '.py': ' python', '.java': ' java', '.cs': ' csharp', '.cpp': ' cpp', '.cc': ' cpp', '.cxx': ' cpp', '.go': ' go', '.rb': ' ruby', '.swift': ' swift', '.kt': ' kotlin',};

return languageMap[ext]||null;
}

/**
* Create CodeQL configuration for different project types
*/
export function createProjectConfig(
projectType:'web-app' | ' library' | ' api' | ' cli' | ' monorepo')):Partial<import('./types/codeql-types').CodeQLConfig> {
') const baseConfig = { ...DEFAULT_CODEQL_CONFIG};

switch (projectType) {
case 'web-app':
          ' return {
...baseConfig,
maxMemory:6144,
timeout:600000, // 10 minutes for larger web apps
};

case 'library':
          ' return {
...baseConfig,
maxMemory:2048,
timeout:180000, // 3 minutes for smaller libraries
};

case 'api':
          ' return {
...baseConfig,
maxMemory:4096,
timeout:300000, // 5 minutes for APIs
};

case 'cli':
          ' return {
...baseConfig,
maxMemory:1024,
timeout:120000, // 2 minutes for CLI tools
};

case 'monorepo':
          ' return {
...baseConfig,
maxMemory:8192,
timeout:1200000, // 20 minutes for large monorepos
threads:Math.max(2, require('os').cpus().length - 1),
};

default:
return baseConfig;
}
}

/**
* Get available query packs for security analysis
*/
export function getSecurityQueryPacks(
languages:import('./types/codeql-types').CodeQLLanguage[]')):import('./types/codeql-types').QueryPack[] {
') const queryPacks:import('./types/codeql-types').QueryPack[] = [];')
for (const language of languages) {
// OWASP Top 10 queries
queryPacks.push({
name:`${language}-security-extended`,
version: `latest`, metadata:
description:`OWASP Top 10 security queries for ${language}`,
category: `security`, tags:['owasp', 'top-10'],
},
});

// CWE-specific queries
queryPacks.push({
name:`${language}-security-and-quality`,
version: `latest`, metadata:
description:`CWE-based security and quality queries for ${language}`,
category: `security`, tags:['cwe', 'quality'],
},
});
}

// Custom Claude Zen security suite
queryPacks.push({
name: 'claude-zen-security-suite', path:require('path').join(') __dirname,
'..', 'queries', 'security', 'claude-zen-security-suite.ql') ),
metadata:{
description: 'Claude Zen comprehensive security analysis', category: 'security', tags:['claude-zen', 'comprehensive'],
source: 'claude-zen',},
});

return queryPacks;
}

/**
* Get performance analysis query packs
*/
export function getPerformanceQueryPacks(
languages:import('./types/codeql-types').CodeQLLanguage[]')):import('./types/codeql-types').QueryPack[] {
') const queryPacks:import('./types/codeql-types').QueryPack[] = [];')
for (const language of languages) {
if (language === 'javascript'||language ===' typescript{
') queryPacks.push({
name: 'claude-zen-performance', path:require('path').join(') __dirname,
'..', 'queries', 'javascript', 'performance-antipatterns.ql') ),
metadata:{
description: 'JavaScript/TypeScript performance anti-patterns', category: 'performance', tags:['performance', 'anti-patterns'],
source: 'claude-zen',},
});
}
}

return queryPacks;
}

/**
* Package metadata
*/
export const PACKAGE_INFO = {
name: '@claude-zen/codeql', version: '1.0.0', description:
'CodeQL integration for semantic code analysis and vulnerability detection', author: 'Claude Code Zen Team', license: 'MIT', keywords:[
'codeql', 'security', 'static-analysis', 'vulnerability-detection', 'semantic-analysis', 'sarif', 'taint-tracking', 'claude-zen',],
} as const;
