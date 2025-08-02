/**
 * TypeDoc Configuration for Claude-Zen
 * Automated TypeScript API documentation generation
 */

module.exports = {
  // Input configuration
  entryPoints: [
    'src/index.ts',
    'src/interfaces/*/index.ts',
    'src/coordination/*/index.ts',
    'src/neural/*/index.ts',
    'src/core/index.ts',
    'src/types/index.ts',
  ],

  // Output configuration
  out: 'docs/api/typedoc',

  // Project settings
  name: 'Claude-Zen API Documentation',
  readme: 'README.md',
  includeVersion: true,

  // Source files
  exclude: [
    '**/__tests__/**/*',
    '**/test/**/*',
    '**/tests/**/*',
    '**/*.test.ts',
    '**/*.spec.ts',
    '**/node_modules/**/*',
    'dist/**/*',
  ],

  // TypeScript configuration
  tsconfig: 'tsconfig.json',
  compilerOptions: {
    declaration: true,
    declarationMap: true,
  },

  // Documentation features
  includeDeclarations: true,
  excludeExternals: true,
  excludeNotDocumented: false,
  excludePrivate: true,
  excludeProtected: false,
  excludeInternal: false,

  // Output formatting
  theme: 'default',
  defaultCategory: 'Other',
  categorizeByGroup: true,
  sort: ['source-order'],

  // Plugin configuration
  plugins: ['typedoc-plugin-markdown', 'typedoc-plugin-mermaid'],

  // Search configuration
  searchInComments: true,
  searchInDocuments: true,

  // Git integration
  gitRevision: 'main',
  gitRemote: 'origin',

  // Validation
  validation: {
    notExported: true,
    invalidLink: true,
    notDocumented: false,
  },

  // Custom options
  customCss: 'docs/styles/typedoc-custom.css',

  // Navigation
  navigation: {
    includeCategories: true,
    includeGroups: true,
  },

  // Markdown output (when using markdown plugin)
  outputFileStrategy: 'modules',
  fileExtension: '.md',
  entryDocument: 'README.md',

  // Additional metadata
  titleLink: 'https://github.com/mikkihugo/claude-code-zen',
  navigationLinks: {
    GitHub: 'https://github.com/mikkihugo/claude-code-zen',
    Issues: 'https://github.com/mikkihugo/claude-code-zen/issues',
    Documentation: 'https://github.com/mikkihugo/claude-code-zen/wiki',
  },
};
