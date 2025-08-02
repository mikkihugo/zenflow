/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    /* Core dependency rules */
    {
      name: 'no-circular',
      severity: 'warn',
      comment: 'Circular dependencies should be avoided for maintainability',
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: 'no-orphans',
      comment: 'Orphan modules are likely unused and should be removed',
      severity: 'warn',
      from: {
        orphan: true,
        pathNot: [
          '(^|/)\\.[^/]+\\.(js|cjs|mjs|ts|json)$', // dot files
          '\\.d\\.ts$', // TypeScript declaration files
          '(^|/)tsconfig\\.json$', // tsconfig
          '(^|/)(babel|webpack)\\.config\\.(js|cjs|mjs|ts|json)$', // configs
        ],
      },
      to: {},
    },
    {
      name: 'not-to-deprecated',
      comment: 'Deprecated modules are a security risk and should be updated',
      severity: 'warn',
      from: {},
      to: {
        dependencyTypes: ['deprecated'],
      },
    },
    {
      name: 'no-non-package-json',
      severity: 'error',
      comment: 'All npm dependencies must be declared in package.json',
      from: {},
      to: {
        dependencyTypes: ['npm-no-pkg', 'npm-unknown'],
      },
    },
    {
      name: 'not-to-unresolvable',
      comment: 'All dependencies must be resolvable',
      severity: 'error',
      from: {},
      to: {
        couldNotResolve: true,
      },
    },

    /* Claude-Zen specific architectural rules */
    {
      name: 'no-cross-interface-deps',
      comment:
        'Interfaces should be independent - prevent cross-interface dependencies (but allow internal imports)',
      severity: 'error',
      from: {
        path: '^src/interfaces/(web)/',
      },
      to: {
        path: '^src/interfaces/(terminal|cli|api|mcp)/',
      },
    },
    {
      name: 'no-cross-interface-deps-terminal',
      comment: 'Terminal interface should not import from other interfaces',
      severity: 'error',
      from: {
        path: '^src/interfaces/(terminal)/',
      },
      to: {
        path: '^src/interfaces/(web|cli|api|mcp)/',
      },
    },
    {
      name: 'no-cross-interface-deps-cli',
      comment: 'CLI interface should not import from other interfaces',
      severity: 'error',
      from: {
        path: '^src/interfaces/(cli)/',
      },
      to: {
        path: '^src/interfaces/(web|terminal|api|mcp)/',
      },
    },
    {
      name: 'no-cross-interface-deps-api',
      comment: 'API interface should not import from other interfaces',
      severity: 'error',
      from: {
        path: '^src/interfaces/(api)/',
      },
      to: {
        path: '^src/interfaces/(web|terminal|cli|mcp)/',
      },
    },
    {
      name: 'no-cross-interface-deps-mcp',
      comment: 'MCP interface should not import from other interfaces',
      severity: 'error',
      from: {
        path: '^src/interfaces/(mcp)/',
      },
      to: {
        path: '^src/interfaces/(web|terminal|cli|api)/',
      },
    },
    {
      name: 'neural-wasm-isolation',
      comment: 'Neural WASM modules should only be accessed through neural bridge',
      severity: 'warn',
      from: {
        pathNot: '^src/neural/',
      },
      to: {
        path: '^src/neural/wasm/',
      },
    },
    {
      name: 'coordination-layer-access',
      comment: 'Only coordination layer should access swarm internals',
      severity: 'warn',
      from: {
        pathNot: '^src/coordination/',
      },
      to: {
        path: '^src/coordination/swarm/core/',
      },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    exclude: {
      path: [
        'node_modules',
        '\\.d\\.ts$',
        '__tests__',
        '\\.test\\.(js|ts)$',
        '\\.spec\\.(js|ts)$',
        '\\.ruv-swarm',
        '\\.hive-mind',
        'dist',
        'coverage',
        'databases',
        'logs',
      ],
    },
    includeOnly: {
      path: '^src',
    },
    moduleSystems: ['amd', 'cjs', 'es6', 'tsd'],
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    tsPreCompilationDeps: true,
  },
};
