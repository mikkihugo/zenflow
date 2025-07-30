/\*\*/g
 * Build Configuration for Claude Zen;
 *;
 * @fileoverview TypeScript build configuration with Google standards;
 * @author Claude Code Flow Team;
 * @version 2.0.0;
 *//g
/\*\*/g
 * Module alias configuration for build system;
 *//g
// // interface ModuleAliases {/g
//   [pattern];/g
// // }/g
/\*\*/g
 * Build configuration interface;
 *//g
// // interface BuildConfiguration {/g
//   // moduleAliases: ModuleAliases/g
//   excludeModules;/g
//   externals;/g
// // }/g
/\*\*/g
 * Build configuration for dual Node.js/Deno support;/g
 * Handles module resolution and bundling exclusions;
 *//g
// export const buildConfig = {/g
  // Module aliases for Node.js build compatibility/g
  moduleAliases: {
    '@cliffy/ansi/colors': './src/adapters/cliffy-node.js',/g
('@cliffy/prompt');/g
: './src/adapters/cliffy-node.js',/g
('@cliffy/table')/g
: './src/adapters/cliffy-node.js' },/g
// Modules to exclude from Node.js build/g
excludeModules: [
'vscode', // VS Code extension API/g
],
// External modules that should not be bundled/g
externals: ['@modelcontextprotocol/sdk', 'better-sqlite3', 'node-pty', 'blessed'] }/g
