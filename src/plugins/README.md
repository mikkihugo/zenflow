# Claude Zen Plugin System - MIGRATED TO CORE

**🚨 ARCHITECTURE CHANGE: Plugin system has been migrated to direct core integration**

Previously, Claude Zen used a plugin architecture for extending capabilities. This has been migrated to a unified core system for better performance, simpler maintenance, and tighter integration.

## Migration Status

**✅ COMPLETED**: All valuable plugin functionality has been integrated directly into the core system:
- Unified Interface system (CLI/TUI/Web) → `/src/core/unified-interface-launcher.ts`
- Memory Backend → `/src/memory/` (existing system)
- Workflow Engine → `/src/core/unified-workflow-engine.ts`
- Export System → `/src/core/unified-export-system.ts`
- Documentation Linker → `/src/core/unified-documentation-linker.ts`
- Document-Driven System → `/src/core/document-driven-system.ts`

**🗑️ REMOVED**: Plugin architecture components removed:
- `plugin-manager.ts`
- `base-plugin.ts`
- `types.ts`
- `lifecycle-manager.ts`
- Various monitoring and management components

## New Architecture Overview

The new unified core system provides all functionality directly without plugin abstractions, offering:

- **Better Performance**: Direct integration eliminates plugin overhead
- **Simplified Maintenance**: No plugin loading/management complexity
- **Tighter Integration**: Components can share state and resources directly
- **Easier Testing**: Direct testing without plugin abstraction layers

## Core Systems (Previously Plugins)

### 🖥️ Unified Interface System
**Location**: `/src/core/unified-interface-launcher.ts`
- **Purpose**: Automatic interface detection and launching (CLI/TUI/Web)
- **Capabilities**: Environment detection, graceful fallbacks, real-time switching
- **Integration**: Direct integration with all core systems

### 💾 Memory System
**Location**: `/src/memory/` (existing)
- **Purpose**: Persistent storage and caching
- **Backends**: JSON files, in-memory, with vector storage support
- **Capabilities**: Key-value storage, namespacing, session management

### ⚙️ Workflow Engine
**Location**: `/src/core/unified-workflow-engine.ts`
- **Purpose**: Document lifecycle workflow automation
- **Workflows**: Vision→ADR→PRD→Epic→Feature→Task→Code
- **Capabilities**: Event-driven processing, parallel execution, state management

### 📤 Export System
**Location**: `/src/core/unified-export-system.ts`
- **Purpose**: Multi-format data export
- **Formats**: JSON, YAML, CSV, XML, HTML, Markdown
- **Capabilities**: Batch operations, custom templates, event tracking

### 🔗 Documentation Linker
**Location**: `/src/core/unified-documentation-linker.ts`
- **Purpose**: Automatic cross-reference generation
- **Capabilities**: Code-to-docs linking, confidence scoring, relationship detection

### 📋 Document-Driven System
**Location**: `/src/core/document-driven-system.ts`
- **Purpose**: Hive document workflow processing
- **Documents**: Vision, ADRs, PRDs, Epics, Features, Tasks
- **Capabilities**: Metadata extraction, workflow triggering, real-time watching

## Using the New Core System

### Quick Start

```javascript
import { UnifiedCoreSystem } from '../core/unified-core-system.js';

// Create and initialize the core system
const system = await UnifiedCoreSystem.create({
  interface: {
    defaultMode: 'auto',  // 'cli', 'tui', 'web', or 'auto'
    webPort: 3456,
    theme: 'dark'
  },
  workspace: {
    root: './docs',
    autoDetect: true,
    enableWatching: true
  },
  workflow: {
    maxConcurrentWorkflows: 10,
    persistWorkflows: true
  }
});

// Launch the interface
await system.launch();
```

### Document Processing

```javascript
// Process a document through the workflow
const result = await system.processDocument('./docs/vision/project-vision.md');

if (result.success) {
  console.log(`Started workflows: ${result.workflowIds.join(', ')}`);
}
```

### System Status

```javascript
// Get comprehensive system status
const status = await system.getSystemStatus();
console.log(`System: ${status.status}`);
console.log(`Components: ${Object.keys(status.components).length}`);
```

### Data Export

```javascript
// Export system data in various formats
const exportResult = await system.exportSystemData('json', {
  outputPath: './exports',
  filename: 'system-data'
});
```

## Configuration Options

The unified core system accepts a comprehensive configuration object:

```javascript
const config = {
  // Interface configuration
  interface: {
    defaultMode: 'auto',      // 'auto', 'cli', 'tui', 'web'
    webPort: 3456,            // Web interface port
    enableRealTime: true,     // Real-time updates
    theme: 'dark'             // 'dark' or 'light'
  },
  
  // Memory configuration
  memory: {
    directory: './data/memory',
    namespace: 'claude-zen',
    enableCache: true,
    enableVectorStorage: true
  },
  
  // Workflow configuration
  workflow: {
    maxConcurrentWorkflows: 10,
    persistWorkflows: true,
    enableVisualization: false
  },
  
  // Export configuration
  export: {
    defaultFormat: 'json',
    outputPath: './exports',
    enableCompression: false
  },
  
  // Documentation configuration
  documentation: {
    documentationPaths: ['./docs'],
    codePaths: ['./src'],
    enableAutoLinking: true
  },
  
  // Workspace configuration
  workspace: {
    root: './docs',
    autoDetect: true,
    enableWatching: true
  }
};
```

## Migration Benefits

### Performance Improvements
- **Elimination of Plugin Overhead**: Direct function calls instead of plugin abstractions
- **Better Memory Usage**: Shared resources instead of isolated plugin instances
- **Faster Startup**: No plugin loading and initialization delays

### Maintenance Benefits
- **Simplified Codebase**: Single codebase instead of distributed plugin system
- **Better Testing**: Direct testing of core functionality
- **Easier Debugging**: Single call stack without plugin boundaries

### Integration Benefits
- **Shared State**: Components can share state and resources directly
- **Event-Driven Architecture**: Direct event communication between components
- **Unified Configuration**: Single configuration system for all components

## Event System

The core system uses an event-driven architecture for component communication:

```javascript
// Listen to system events
system.on('document:created', (event) => {
  console.log(`Document created: ${event.type} - ${event.path}`);
});

system.on('workflow:completed', (event) => {
  console.log(`Workflow completed: ${event.workflowId}`);
});

system.on('export:success', (result) => {
  console.log(`Export completed: ${result.filename}`);
});
```

## Legacy Plugin Directories

The following directories contain legacy plugin implementations for reference:
- `architect-advisor/` - AI-powered ADR generation (deprecated)
- `documentation-linker/` - Cross-reference generation (migrated to core)
- `export-system/` - Multi-format export (migrated to core)
- `markdown-scanner/` - Document scanning (deprecated)
- `memory-backend/` - Storage backends (migrated to core)
- `unified-interface/` - Interface system (migrated to core)
- `workflow-engine/` - Workflow processing (migrated to core)

These directories may be removed in future versions. Use the unified core system instead.

## Future Development

For extending the system, instead of creating plugins:

1. **Add Core Components**: Extend the core system directly in `/src/core/`
2. **Add Interface Components**: Extend interfaces in `/src/interfaces/`
3. **Add Utility Functions**: Add utilities in `/src/utils/`
4. **Modify Configuration**: Update configuration schemas as needed

This approach provides better performance, easier maintenance, and tighter integration.