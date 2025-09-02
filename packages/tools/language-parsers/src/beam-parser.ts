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

import { extname, basename } from 'node:path';
import { readFile } from 'node:fs/promises';
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
metrics?: BeamModuleMetrics;
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
visibility: 'public' | 'private';

/** Function signature */
signature: string;

/** Function documentation */
documentation?: string;

/** Line number in source */
lineNumber: number;

/** Function complexity score */
complexity?: number;

/** Function tags/attributes */
attributes?: string[];
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
documentation?: string;

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
includeMetrics?: boolean;

/** Include function complexity analysis */
analyzeFunctionComplexity?: boolean;

/** Include documentation extraction */
extractDocumentation?: boolean;

/** Maximum file size to parse (in bytes) */
maxFileSize?: number;
}

/**
* Enhanced BEAM Language Parser with foundation integration
*/
export class BeamLanguageParser {
private readonly logger: Logger;
private readonly options: BeamParserOptions;

constructor(options: BeamParserOptions = {}) {
this.logger = getLogger('BeamLanguageParser');
this.options = {
includeMetrics: true,
analyzeFunctionComplexity: true,
extractDocumentation: true,
maxFileSize: 10 * 1024 * 1024, // 10MB default
...options,
};

this.logger.debug(`BeamLanguageParser initialized`, {
options: this.options,
});
}

/**
* Parse a BEAM language file (Elixir/Erlang/Gleam)
*/
async parseFile(filePath: string): Promise<Result<BeamModule, Error>> {
try {
this.logger.info(`Parsing BEAM file: ${filePath}`);

const content = await readFile(filePath, `utf8`);
// Check file size limit
if (content.length > (this.options.maxFileSize||10485760)) {
return err(new Error(`File too large: ${content.length} bytes`));
}

const ext = extname(filePath);
const language = this.detectLanguage(ext);

if (!language) {
return err(new Error(`Unsupported file extension: ${ext}`));
}

let module: BeamModule;

switch (language) {
case 'elixir':
module = await this.parseElixirFile(filePath, content);
break;
case 'erlang':
module = await this.parseErlangFile(filePath, content);
break;
case 'gleam':
module = await this.parseGleamFile(filePath, content);
break;
default:
return err(new Error(`Unsupported language: ${language}`));
}

// Calculate metrics if enabled
if (this.options.includeMetrics) {
module.metrics = this.calculateModuleMetrics(module, content);
}

this.logger.info(
`Successfully parsed ${language} module: ${module.name}`,
{
functions:module.exports.length,
types:module.types.length,
dependencies:module.dependencies.length,
}
);

return ok(module);
} catch (error) {
const errorMsg = `Failed to parse ` + filePath + `: ` + (error instanceof Error ? error.message : String(error));
this.logger.error(errorMsg, { error });
return err(new Error(errorMsg));
}
}

/**
* Parse multiple BEAM files in parallel
*/
async parseFiles(filePaths: string[]): Promise<Result<BeamModule[], Error>> {
try {
this.logger.info(`Parsing ${filePaths.length} BEAM files in parallel`);

const results = await Promise.allSettled(
filePaths.map((path) => this.parseFile(path))
);

const modules: BeamModule[] = [];
const errors: string[] = [];

for (let i = 0; i < results.length; i++) {
const result = results[i];
if (result.status === `fulfilled` && result.value.isOk()) {
modules.push(result.value._unsafeUnwrap());
} else {
const error =
result.status === `rejected` ? result.reason
: result.value._unsafeUnwrapErr();
errors.push(`${filePaths[i]}: ${error.message}`);
}
}

if (errors.length > 0) {
this.logger.warn(`Some files failed to parse`, {
errorCount:errors.length,
successCount:modules.length,
errors:errors.slice(0, 5), // Log first 5 errors
});
}

this.logger.info(`Parsed ${modules.length} BEAM modules successfully`, {
totalAttempted:filePaths.length,
successCount:modules.length,
errorCount:errors.length,
});

return ok(modules);
} catch (error) {
const err_msg = `Failed to parse BEAM files: ${error instanceof Error ? error.message : String(error)}`
this.logger.error(err_msg, { error, fileCount:filePaths.length});
return err(new Error(err_msg));
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
* Parse Elixir file using enhanced regex patterns
*/
private async parseElixirFile(
filePath:string,
content:string
):Promise<BeamModule> {

 const moduleName = this.extractElixirModuleName(content) || basename(filePath, '.ex');
const functions = this.extractElixirFunctions(content);
const types = this.extractElixirTypes(content);
const docs = this.options.extractDocumentation
? this.extractElixirDocs(content)
:[];
const deps = this.extractElixirDependencies(content);

return {
name:moduleName,
path:filePath,
language: 'elixir',
exports:functions,
types:types,
documentation:docs,
dependencies:deps,
metadata:{
hasGenServer:content.includes('use GenServer'),
hasSupervisor:content.includes('use Supervisor'),
hasApplication:content.includes('use Application'),
hasPlug:content.includes('use Plug'),
hasPhoenix:content.includes('use Phoenix'),
hasEcto:content.includes('use Ecto'),
hasLiveView:content.includes('use Phoenix.LiveView'),
hasOTP:/uses+(GenServer|GenStateMachine|Agent|Task)/.test(content),
protocolImplementations:this.extractElixirProtocols(content),
},
};
}

/**
* Parse Erlang file using enhanced regex patterns
*/
private async parseErlangFile(
filePath:string,
content:string
):Promise<BeamModule> {

 const moduleName = this.extractErlangModuleName(content) || basename(filePath, '.erl');
 const functions = this.extractErlangFunctions(content);
const types = this.extractErlangTypes(content);
const docs = this.options.extractDocumentation
? this.extractErlangDocs(content)
:[];
const deps = this.extractErlangDependencies(content);

return {
name:moduleName,
path:filePath,
language: 'erlang',
exports:functions,
types:types,
documentation:docs,
dependencies:deps,
metadata:{
behaviours:this.extractErlangBehaviours(content),
exports:this.extractErlangExports(content),
includes:this.extractErlangIncludes(content),
attributes:this.extractErlangAttributes(content),
isOTPBehaviour:this.isOTPBehaviour(content),
},
};
}

/**
* Parse Gleam file using enhanced regex patterns
*/
private async parseGleamFile(
filePath:string,
content:string
):Promise<BeamModule> {
 const moduleName = basename(filePath, '.gleam');
	const functions = this.extractGleamFunctions(content);
const types = this.extractGleamTypes(content);
const docs = this.options.extractDocumentation
? this.extractGleamDocs(content)
:[];
const deps = this.extractGleamDependencies(content);

return {
name:moduleName,
path:filePath,
language: 'gleam',
exports:functions,
types:types,
documentation:docs,
dependencies:deps,
metadata:{
hasExternal:content.includes('@external'),
hasFFI:content.includes('external'),
hasTargetJS:content.includes('@target(javascript)'),
hasTargetErlang:content.includes('@target(erlang)'),
customTypes:this.extractGleamCustomTypes(content),
},
};
}

// Enhanced Elixir parsing methods
private extractElixirModuleName(content: string): string | null {
const match = content.match(/defmodule\s+([A-Z][\w.]*)/);
return match ? match[1] : null;
}

private extractElixirFunctions(content:string): BeamFunction[] {
const functions:BeamFunction[] = [];
const defRegex =
/(?:def|defp|defmacro|defmacrop)\s+([a-z]\w*[!?]?)\s*(?:\(([^)]*)\))?/g;

let match;
while ((match = defRegex.exec(content)) !== null) {
const functionName = match[1];
const params = match[2] || '';
const arity = params ? params.split(',').length : 0;
const lineNumber = content.substring(0, match.index).split('\n').length;
const isPrivate = content
.substring(Math.max(0, match.index - 10), match.index)
.includes('defp');
const isMacro = content
.substring(Math.max(0, match.index - 10), match.index)
.includes('defmacro');
const func: BeamFunction = {
name: functionName,
arity: arity,
visibility: isPrivate ? 'private' : `public`,
signature: functionName + '(' + params + ')',
lineNumber: lineNumber,
attributes: isMacro ? [`macro`] : [],
};

if (this.options.analyzeFunctionComplexity) {
func.complexity = this.calculateFunctionComplexity(
content,
match.index
);
}

functions.push(func);
}

return functions;
}

private extractElixirTypes(content: string): BeamType[] {
const types: BeamType[] = [];

// @type definitions
const typeRegex = /@type\s+([a-z]\w*(?:\([^)]*\))?)\s*::\s*([^\n]+)/g;
let match;
while ((match = typeRegex.exec(content)) !== null) {
const lineNumber = content.substring(0, match.index).split('\n').length;
types.push({
name:match[1],
definition:match[2].trim(),
lineNumber:lineNumber,
category: 'custom',
});
}

// @typep (private types)
const privateTypeRegex =
/@typep\s+([a-z]\w*(?:\([^)]*\))?)\s*::\s*([^\n]+)/g;
while ((match = privateTypeRegex.exec(content)) !== null) {
const lineNumber = content.substring(0, match.index).split('\n').length;
types.push({
name:match[1],
definition:match[2].trim(),
lineNumber:lineNumber,
category: 'custom',
});
}

// @spec definitions
const specRegex = /@spec\s+([a-z]\w*(?:\([^)]*\))?)\s*::\s*([^\n]+)/g;
while ((match = specRegex.exec(content)) !== null) {
const lineNumber = content.substring(0, match.index).split('\n').length;
types.push({
name:match[1],
definition:match[2].trim(),
lineNumber:lineNumber,
category: 'spec',
});
}

return types;
}

private extractElixirDocs(content: string): string[] {
const docs: string[] = [];

// @moduledoc
const moduleDocRegex = /@moduledoc\s+"""([\s\S]*?)"""/g;
let match;
while ((match = moduleDocRegex.exec(content)) !== null) {
docs.push(match[1].trim());
}

// @doc
const docRegex = /@doc\s+"""([\s\S]*?)"""/g;
while ((match = docRegex.exec(content)) !== null) {
docs.push(match[1].trim());
}

return docs;
}

private extractElixirDependencies(content: string): string[] {
const deps: string[] = [];

// Extract use statements
const useMatches = Array.from(content.matchAll(/use\s+([A-Z][\w.]*)/g));
for (const match of useMatches) {
deps.push(match[1]);
}

// Extract import statements
const importMatches = Array.from(content.matchAll(/import\s+([A-Z][\w.]*)/g));
for (const match of importMatches) {
deps.push(match[1]);
}

// Extract alias statements
const aliasMatches = Array.from(content.matchAll(/alias\s+([A-Z][\w.]*)/g));
for (const match of aliasMatches) {
deps.push(match[1]);
}

// Extract require statements
const requireMatches = Array.from(content.matchAll(/require\s+([A-Z][\w.]*)/g));
for (const match of requireMatches) {
deps.push(match[1]);
}

return Array.from(new Set(deps)); // Remove duplicates
}

private extractElixirProtocols(content: string): string[] {
const protocols: string[] = [];
const protocolRegex = /defimpl\s+([A-Z][\w.]*)/g;

let match;
while ((match = protocolRegex.exec(content)) !== null) {
protocols.push(match[1]);
}

return protocols;
}

// Enhanced Erlang parsing methods
private extractErlangModuleName(content: string): string | null {
const match = content.match(/-module\s*\(\s*([a-z]\w*)\s*\)/);
return match ? match[1] : null;
}

private extractErlangFunctions(content: string): BeamFunction[] {
const functions: BeamFunction[] = [];
const funcRegex = /^([a-z]\w*)\s*\(([^)]*)\)\s*->/gm;

let match;
while ((match = funcRegex.exec(content)) !== null) {
const functionName = match[1];
const params = match[2] || '';
const arity = params ? params.split(',').length : 0;
const lineNumber = content.substring(0, match.index).split('\n').length;
const func: BeamFunction = {
name: functionName,
arity: arity,
visibility: 'public', // Determined by export list
signature: `${functionName}(${params})`,
lineNumber: lineNumber,
};

if (this.options.analyzeFunctionComplexity) {
func.complexity = this.calculateFunctionComplexity(
content,
match.index
);
}

functions.push(func);
}

return functions;
}

private extractErlangTypes(content:string): BeamType[] {
const types:BeamType[] = [];

// -type definitions
const typeRegex = /-type\s+([a-z]\w*(?:\([^)]*\))?)\s*::\s*([^.]+)\./g;
let match;
while ((match = typeRegex.exec(content)) !== null) {
const lineNumber = content.substring(0, match.index).split('\n').length;
types.push({
name: match[1],
definition: match[2].trim(),
lineNumber: lineNumber,
category: 'custom',
});
}

// -opaque definitions - ReDoS-safe regex with atomic groups and limits
const opaqueRegex =
/-opaque\s+([a-z]\w*(?:\([^)]{0,100}\))?)\s*::\s*([^.]{1,200})\./g;
while ((match = opaqueRegex.exec(content)) !== null) {
const lineNumber = content.substring(0, match.index).split('\n').length;
types.push({
name: match[1],
definition: match[2].trim(),
lineNumber: lineNumber,
category: 'opaque',
});
}

// -spec definitions
const specRegex = /-spec\s+([a-z]\w*(?:\([^)]*\))?)\s*->\s*([^.]+)\./g;
while ((match = specRegex.exec(content)) !== null) {
const lineNumber = content.substring(0, match.index).split('\n').length;
types.push({
name: match[1],
definition: match[2].trim(),
lineNumber: lineNumber,
category: 'spec',
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
const behaviourRegex = /-behaviour\s*\(\s*([a-z]\w*)\s*\)/g;

let match;
while ((match = behaviourRegex.exec(content)) !== null) {
behaviours.push(match[1]);
}

return behaviours;
}

private extractErlangExports(content: string): string[] {
const exports: string[] = [];
const exportRegex = /-export\s*\(\s*\[([^\]]+)]\s*\)/g;

let match;
while ((match = exportRegex.exec(content)) !== null) {
const funcs = match[1].split(',').map((f) => f.trim());
exports.push(...funcs);
}

return exports;
}

private extractErlangIncludes(content: string): string[] {
const includes: string[] = [];
const includeRegex = /-include_lib\s*\(\s*"([^"]+)"\s*\)/g;

let match;
while ((match = includeRegex.exec(content)) !== null) {
includes.push(match[1]);
}

return includes;
}

private extractErlangAttributes(content: string): Record<string, string[]> {
const attributes: Record<string, string[]> = {};
const attrRegex = /-([a-z]\w*)\s*\(\s*([^)]+)\s*\)/g;

let match;
while ((match = attrRegex.exec(content)) !== null) {
const attrName = match[1];
const attrValue = match[2];

if (!attributes[attrName]) {
attributes[attrName] = [];
}
attributes[attrName].push(attrValue);
}

return attributes;
}

private isOTPBehaviour(content: string): boolean {
const otpBehaviours = [
'gen_server', 'gen_statem', 'supervisor', 'application'
];
return otpBehaviours.some((behaviour) =>
content.includes('-behaviour(' + behaviour + ')')
);
}

// Enhanced Gleam parsing methods
private extractGleamFunctions(content: string): BeamFunction[] {
const functions: BeamFunction[] = [];
const funcRegex = /(?:pub\s+)?fn\s+([a-z]\w*)\s*\(([^)]*)\)/g;

let match;
while ((match = funcRegex.exec(content)) !== null) {
const functionName = match[1];
const params = match[2] || '';
const arity = params ? params.split(',').length : 0;
const lineNumber = content.substring(0, match.index).split('\n').length;
const isPublic = content
.substring(Math.max(0, match.index - 10), match.index)
.includes('pub');
const func: BeamFunction = {
name: functionName,
arity: arity,
visibility: isPublic ? 'public' : 'private',
signature: functionName + '(' + params + ')',
lineNumber: lineNumber,
};

if (this.options.analyzeFunctionComplexity) {
func.complexity = this.calculateFunctionComplexity(
content,
match.index
);
}

functions.push(func);
}

return functions;
}

private extractGleamTypes(content: string): BeamType[] {
const types: BeamType[] = [];

// Custom types
const typeRegex =
/(?:pub\s+)?type\s+([A-Z]\w*)\s*(?:\([^)]*\))?\s*=\s*([^\n]+)/g;
let match;
while ((match = typeRegex.exec(content)) !== null) {
const lineNumber = content.substring(0, match.index).split('\n').length;
types.push({
name: match[1],
definition: match[2].trim(),
lineNumber: lineNumber,
category: 'custom',
});
}

// Type aliases
const aliasRegex = /(?:pub\s+)?type\s+([A-Z]\w*)\s*=\s*([A-Z]\w*)/g;
while ((match = aliasRegex.exec(content)) !== null) {
const lineNumber = content.substring(0, match.index).split('\n').length;
types.push({
name: match[1],
definition: match[2].trim(),
lineNumber: lineNumber,
category: 'alias',
});
}

return types;
}

private extractGleamDocs(content: string): string[] {
const docs: string[] = [];
const docRegex = /\/{3}\s*(.*)/g;

let match;
while ((match = docRegex.exec(content)) !== null) {
docs.push(match[1].trim());
}

return docs;
}

private extractGleamDependencies(content: string): string[] {
const deps: string[] = [];
const importRegex = /import\s+([a-z][\w/]*)/g;

let match;
while ((match = importRegex.exec(content)) !== null) {
deps.push(match[1]);
}

return deps;
}

private extractGleamCustomTypes(content: string): string[] {
const customTypes: string[] = [];
const customTypeRegex = /(?:pub\s+)?type\s+([A-Z]\w*)/g;

let match;
while ((match = customTypeRegex.exec(content)) !== null) {
customTypes.push(match[1]);
}

return customTypes;
}

// Utility methods
private calculateFunctionComplexity(
content: string,
functionStart: number
): number {
// Simple complexity calculation based on control structures
const functionEnd = this.findFunctionEnd(content, functionStart);
const functionContent = content.substring(functionStart, functionEnd);

const complexityPatterns = [
/\bif\b/g,
/\bcase\b/g,
/\bcond\b/g,
/\bwhen\b/g,
/\band\b/g,
/\bor\b/g,
/\bnot\b/g,
];

let complexity = 1; // Base complexity

for (const pattern of complexityPatterns) {
const matches = functionContent.match(pattern);
if (matches) {
complexity += matches.length;
}
}

return complexity;
}

private findFunctionEnd(content: string, start: number): number {
// Simple heuristic to find function end - look for next 'def' or ' end'
const fromStart = content.substring(start);
const nextDef = fromStart.search(/\n\s*(?:def|end)/);
return nextDef > 0 ? start + nextDef : content.length;
}

private calculateModuleMetrics(
module: BeamModule,
content: string
): BeamModuleMetrics {
const lines = content.split('\n');
const linesOfCode = lines.filter(
(line) =>
line.trim().length > 0 &&
!line.trim().startsWith('#') &&
!line.trim().startsWith('%')
).length;

const publicFunctions = module.exports.filter(
(f) => f.visibility === 'public'
);
const documentedFunctions = module.exports.filter(
(f) => f.documentation
).length;

const complexities = module.exports
.map((f) => f.complexity || 1)
.filter((c) => c > 0);
const averageComplexity =
complexities.length > 0
? complexities.reduce((sum, c) => sum + c, 0) / complexities.length
: 1;

const cyclomaticComplexity = complexities.reduce((sum, c) => sum + c, 0);

const documentationCoverage =
module.exports.length > 0
? documentedFunctions / module.exports.length
: 0;

return {
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
