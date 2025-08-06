/**
 * TypeDoc Configuration for Claude-Zen Unified Architecture Documentation
 *
 * @fileoverview Comprehensive TypeDoc configuration for generating unified architecture
 *               API documentation across all four layers: UACL, DAL, USL, and UEL.
 *               Includes advanced features for cross-layer integration documentation.
 * @version 2.0.0
 * @since 2.0.0-alpha.73
 * @author Claude-Zen Documentation Team
 */

module.exports = {
  // Entry Points - Unified Architecture Layers
  entryPoints: [
    // Core System Entry
    'src/index.ts',

    // UACL - Unified API Client Layer
    'src/interfaces/clients/index.ts',
    'src/interfaces/clients/factories.ts',
    'src/interfaces/clients/manager.ts',
    'src/interfaces/clients/registry.ts',

    // DAL - Data Access Layer
    'src/database/index.ts',
    'src/database/factory.ts',
    'src/database/providers/database-providers.ts',
    'src/database/dao/index.ts',

    // USL - Unified Service Layer
    'src/interfaces/services/index.ts',
    'src/interfaces/services/manager.ts',
    'src/interfaces/services/registry.ts',
    'src/interfaces/services/factories.ts',

    // UEL - Unified Event Layer
    'src/interfaces/events/index.ts',
    'src/interfaces/events/manager.ts',
    'src/interfaces/events/registry.ts',
    'src/interfaces/events/observer-system.ts',

    // Additional Core Components
    'src/core/index.ts',
    'src/coordination/index.ts',
    'src/neural/index.ts',
    'src/memory/index.ts',
    'src/types/index.ts',

    // Interface Components
    'src/interfaces/mcp/index.ts',
    'src/interfaces/terminal/index.ts',
    'src/interfaces/web/index.ts',
    'src/interfaces/api/index.ts',
  ],

  // Output configuration
  out: 'docs/api',
  name: 'Claude-Zen Unified Architecture API',

  // Documentation Features
  readme: './UNIFIED-ARCHITECTURE-DOCUMENTATION.md',
  includeVersion: true,
  favicon: './docs/assets/favicon.ico',

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
  categoryOrder: [
    'UACL - Unified API Client Layer',
    'DAL - Data Access Layer',
    'USL - Unified Service Layer',
    'UEL - Unified Event Layer',
    'Core System',
    'Coordination',
    'Neural Networks',
    'Memory Management',
    'Types & Interfaces',
    'Other',
  ],
  sort: ['source-order', 'alphabetical'],
  kindSortOrder: [
    'Module',
    'Namespace',
    'Enum',
    'Class',
    'Interface',
    'TypeAlias',
    'Constructor',
    'Property',
    'Method',
    'Function',
    'Variable',
  ],

  // Plugin configuration
  plugins: ['typedoc-plugin-markdown', 'typedoc-plugin-mermaid'],

  // Search configuration
  searchInComments: true,
  searchInDocuments: true,

  // Git integration
  gitRevision: 'main',
  gitRemote: 'origin',

  // Advanced Features
  validation: {
    notExported: true,
    invalidLink: true,
    notDocumented: false,
  },

  // JSON Output for CI/CD Integration
  json: 'docs/api/typedoc-data.json',

  // Custom Styling
  customCss: './docs/assets/typedoc-custom.css',

  // Search and Navigation
  navigation: {
    includeCategories: true,
    includeGroups: true,
    includeFolders: true,
  },

  // Custom Groups for Unified Architecture
  groups: [
    {
      title: 'UACL - Unified API Client Layer',
      children: ['IClient', 'ClientManager', 'ClientRegistry', 'ClientFactories'],
    },
    {
      title: 'DAL - Data Access Layer',
      children: ['IDao', 'BaseDao', 'DatabaseFactory', 'DatabaseProviders'],
    },
    {
      title: 'USL - Unified Service Layer',
      children: ['IService', 'ServiceManager', 'ServiceRegistry', 'ServiceFactories'],
    },
    {
      title: 'UEL - Unified Event Layer',
      children: ['IEventAdapter', 'EventManager', 'EventRegistry', 'ObserverSystem'],
    },
  ],

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
