/**
 * Restore accidentally removed type imports
 * Systematically adds back missing core types
 */

module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let transformCount = 0;

  // Mapping of missing types to their import sources
  const typeImportMap = {
    IService: {
      source: '@/interfaces/services/core/interfaces',
      isDefault: false,
    },
    ILogger: {
      source: '@/core/types',
      isDefault: false,
    },
    AgentType: {
      source: '@/types/agent-types',
      isDefault: false,
    },
    Agent: {
      source: '@/coordination/agents/agent',
      isDefault: true,
    },
    ArchitectureDesign: {
      source: '@/coordination/swarm/sparc/types/sparc-types',
      isDefault: false,
    },
    SystemEvent: {
      source: '@/interfaces/events/types',
      isDefault: false,
    },
    CoordinationEvent: {
      source: '@/interfaces/events/types',
      isDefault: false,
    },
    SPARCProject: {
      source: '@/coordination/swarm/sparc/types/sparc-types',
      isDefault: false,
    },
    EventManagerType: {
      source: '@/interfaces/events/types',
      isDefault: false,
    },
    BaseDocumentEntity: {
      source: '@/database/entities/document-entities',
      isDefault: false,
    },
    DIContainer: {
      source: '@/di/container/di-container',
      isDefault: true,
    },
    WasmNeuralBinding: {
      source: '@/neural/wasm/wasm-neural-accelerator',
      isDefault: false,
    },
    NeuralConfig: {
      source: '@/neural/core/neural-core',
      isDefault: false,
    },
    NeuralNetworkInterface: {
      source: '@/neural/core/neural-network',
      isDefault: false,
    },
  };

  // Find which types are used but not imported
  const usedTypes = new Set();
  const existingImports = new Set();

  // Collect all type references in the file
  root.find(j.Identifier).forEach((path) => {
    const name = path.value.name;
    if (typeImportMap[name]) {
      usedTypes.add(name);
    }
  });

  // Collect existing imports
  root.find(j.ImportDeclaration).forEach((path) => {
    if (path.value.specifiers) {
      path.value.specifiers.forEach((spec) => {
        if (spec.type === 'ImportDefaultSpecifier') {
          existingImports.add(spec.local.name);
        } else if (spec.type === 'ImportSpecifier') {
          existingImports.add(spec.local.name);
        }
      });
    }
  });

  // Determine which types need to be imported
  const typesToImport = [...usedTypes].filter(
    (type) => !existingImports.has(type)
  );

  if (typesToImport.length === 0) {
    return null; // No changes needed
  }

  // Group imports by source
  const importsBySource = {};
  typesToImport.forEach((type) => {
    const importInfo = typeImportMap[type];
    if (!importsBySource[importInfo.source]) {
      importsBySource[importInfo.source] = {
        defaults: [],
        named: [],
      };
    }

    if (importInfo.isDefault) {
      importsBySource[importInfo.source].defaults.push(type);
    } else {
      importsBySource[importInfo.source].named.push(type);
    }
  });

  // Add import statements
  Object.entries(importsBySource).forEach(([source, imports]) => {
    const specifiers = [];

    // Add default imports
    imports.defaults.forEach((defaultImport) => {
      specifiers.push(j.importDefaultSpecifier(j.identifier(defaultImport)));
    });

    // Add named imports
    if (imports.named.length > 0) {
      imports.named.forEach((namedImport) => {
        specifiers.push(j.importSpecifier(j.identifier(namedImport)));
      });
    }

    if (specifiers.length > 0) {
      const importStatement = j.importDeclaration(
        specifiers,
        j.literal(source)
      );

      // Add at the top of the file, after existing imports
      const existingImports = root.find(j.ImportDeclaration);
      if (existingImports.length > 0) {
        existingImports.at(-1).insertAfter(importStatement);
      } else {
        root.get().node.body.unshift(importStatement);
      }

      transformCount += specifiers.length;
    }
  });

  if (transformCount > 0) {
    console.log(
      `✅ Restored ${transformCount} missing imports in ${fileInfo.path}`
    );
    console.log(`   Types: ${typesToImport.join(', ')}`);
  }

  return transformCount > 0 ? root.toSource({ quote: 'single' }) : null;
};
