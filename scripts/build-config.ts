/**
 * Build Configuration for Claude Zen;
 *;
 * @fileoverview TypeScript build configuration with Google standards;
 * @author Claude Code Flow Team;
 * @version 2.0.0;
 */
/**
 * Module alias configuration for build system;
 */
interface ModuleAliases {
  [pattern: string]: string;
}
/**
 * Build configuration interface;
 */
interface BuildConfiguration {
  moduleAliases: ModuleAliases;
  excludeModules: string[];
  externals: string[];
}
/**
 * Build configuration for dual Node.js/Deno support;
 * Handles module resolution and bundling exclusions;
 */
export const buildConfig: BuildConfiguration = {
  // Module aliases for Node.js build compatibility
  moduleAliases: {
    '@cliffy/ansi/colors': './src/adapters/cliffy-node.js',
('@cliffy/prompt');
: './src/adapters/cliffy-node.js',
('@cliffy/table')
: './src/adapters/cliffy-node.js',
},
// Modules to exclude from Node.js build
excludeModules: [
'vscode', // VS Code extension API
],
// External modules that should not be bundled
externals: ['@modelcontextprotocol/sdk', 'better-sqlite3', 'node-pty', 'blessed'],
}
