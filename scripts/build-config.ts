/** Build Configuration for Claude Zen
 *
 * @fileoverview TypeScript build configuration with Google standards
 * @author Claude Code Flow Team
 * @version 2.0.0
 */

/** Module alias configuration for build system
 */

// // interface ModuleAliases {
//   [pattern];
// // }

/** Build configuration interface
 */

// // interface BuildConfiguration {
//   // moduleAliases: ModuleAliases
//   excludeModules;
//   externals;
// // }

/** Build configuration for dual Node.js/Deno support
 * Handles module resolution and bundling exclusions
 */

export const buildConfig = {
  // Module aliases for Node.js build compatibility
  moduleAliases: {
    '@cliffy/ansi/colors': './src/adapters/cliffy-node.js',
    '@cliffy/command': './src/adapters/cliffy-node.js',
    '@cliffy/prompt': './src/adapters/cliffy-node.js',
  },
  // Modules to exclude from Node.js build
  excludeModules: [
    'vscode', // VS Code extension API
  ],
  // External modules that should not be bundled
  externals: ['@modelcontextprotocol/sdk', 'better-sqlite3', 'node-pty', 'blessed'],
};
