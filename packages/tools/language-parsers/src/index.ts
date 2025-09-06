/**
* @fileoverview Language Parsers Package
*
* Multi-language parsers for comprehensive code analysis and repository understanding.
* Currently supports BEAM languages (Elixir, Erlang, Gleam) with plans for expansion
* to other language families.
*
* Key Features:
* - High-performance parsing with foundation integration
* - Comprehensive metadata extraction
* - Complexity analysis and metrics calculation
* - Documentation extraction and analysis
* - Battle-tested error handling and logging
*
* @author Claude Code Zen Team
* @since 1.0.0
* @version 1.0.0
*/


export type {
BeamFunction,
BeamModule,
BeamModuleMetrics,
BeamParserOptions,
BeamType,
} from './beam-parser';
// BEAM Language Parser Exports
export { BeamLanguageParser} from './beam-parser';

/**
* Supported language families
*/
export const SUPPORTED_LANGUAGE_FAMILIES = [
'beam', // Elixir, Erlang, Gleam
] as const;

/**
* Supported file extensions mapped to their parsers
*/
export const SUPPORTED_EXTENSIONS = {
  // BEAM Languages
   
  '.ex': 'beam',
   
  '.exs': 'beam',
   
  '.erl': 'beam',
   
  '.hrl': 'beam',
   
  '.gleam': 'beam',
} as const;

/**
* Language detection utility
*/
export function detectLanguageFamily(filePath:string): string|null {
const ext = filePath.toLowerCase().substring(filePath.lastIndexOf('.'));
return SUPPORTED_EXTENSIONS[ext as keyof typeof SUPPORTED_EXTENSIONS] || null;
}

/**
* Get all supported file extensions
*/
export function getSupportedExtensions():string[] {
return Object.keys(SUPPORTED_EXTENSIONS);
}

/**
* Check if a file extension is supported
*/
export function isSupported(filePath:string): boolean {
return detectLanguageFamily(filePath) !== null;
}

/**
* Create parser factory for different language families
*/
export interface ParserFactory {
createBeamParser(): import('./beam-parser').BeamLanguageParser;
}

/**
* Default parser factory implementation
*/
export class DefaultParserFactory implements ParserFactory {
createBeamParser(): import('./beam-parser').BeamLanguageParser {
// Temporarily disabled due to syntax issues in beam-parser.ts
throw new Error('BeamLanguageParser is temporarily disabled due to syntax issues');
// const { BeamLanguageParser } = require('./beam-parser');
// return new BeamLanguageParser(options);
}
}

/**
* Create default parser factory instance
*/
export function createParserFactory():ParserFactory {
return new DefaultParserFactory();
}

/**
* Quick parse utility for single files
*/
export async function parseFile(
filePath:string,
_options?:{
includeMetrics?:boolean;
analyzeFunctionComplexity?:boolean;
extractDocumentation?:boolean;
}
) {
const family = detectLanguageFamily(filePath);

if (!family) {
throw new Error(`Unsupported file type: ${filePath}`);
}

const factory = createParserFactory();

switch (family) {
case 'beam': {
const parser = factory.createBeamParser();
return await parser.parseFile(filePath);
}
case 'functional': {
// Future:Add functional language parser support
const parser = factory.createBeamParser(); // Fallback to beam for now
return await parser.parseFile(filePath);
}
case 'concurrent': {
// Future:Add concurrent language parser support
const parser = factory.createBeamParser(); // Fallback to beam for now
return await parser.parseFile(filePath);
}
default:
throw new Error(`Parser not implemented for language family: ${family}`);
}
}

/**
* Quick parse utility for multiple files
*/
export async function parseFiles(
filePaths:string[],
_options?:{
includeMetrics?:boolean;
analyzeFunctionComplexity?:boolean;
extractDocumentation?:boolean;
}
) {
// Group files by language family
const filesByFamily = new Map<string, string[]>();

for (const filePath of filePaths) {
const family = detectLanguageFamily(filePath);
if (family) {
if (!filesByFamily.has(family)) {
filesByFamily.set(family, []);
}
filesByFamily.get(family)?.push(filePath);
}
}

const factory = createParserFactory();
const allResults: unknown[] = [];

// Parse each family in parallel
const familyPromises = Array.from(filesByFamily.entries()).map(
async ([family, paths]) => {
switch (family) {
case 'beam': {
const parser = factory.createBeamParser();
const result = await parser.parseFiles(paths);
return result.isOk() ? result._unsafeUnwrap() : [];
}
case 'functional': {
// Future: Add functional language parser support
const parser = factory.createBeamParser(); // Fallback to beam for now
const result = await parser.parseFiles(paths);
return result.isOk() ? result._unsafeUnwrap() : [];
}
case 'concurrent': {
// Future: Add concurrent language parser support
const parser = factory.createBeamParser(); // Fallback to beam for now
const result = await parser.parseFiles(paths);
return result.isOk() ? result._unsafeUnwrap() : [];
}
default:
return [];
}
}
);

const familyResults = await Promise.all(familyPromises);

for (const results of familyResults) {
allResults.push(...results);
}

return allResults;
}

/**
* Version information
*/
export const VERSION = '1.0.0';
export const PACKAGE_NAME = '@claude-zen/language-parsers';

/**
* Package metadata
*/
export const PACKAGE_INFO = {
name:PACKAGE_NAME,
version:VERSION,
description:
'Multi-language parsers for code analysis and repository understanding', author: 'Claude Code Zen Team', license: 'MIT', repository: 'https://github.com/zen-neural/claude-code-zen', keywords:[
'parser', 'language-parser', 'code-analysis', 'multi-language', 'beam', 'elixir', 'erlang', 'gleam', 'ast-parsing', 'code-intelligence',
],
} as const;

