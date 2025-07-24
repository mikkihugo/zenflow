# Claude Zen Plugin System

A modular plugin architecture for extending Claude Zen's capabilities.

## Overview

The plugin system provides swappable components for core functionality, making the system highly extensible and configurable.

## Plugin Structure

Each plugin has its own directory with:
- `index.js` - Main plugin implementation
- `package.json` - Plugin metadata and dependencies  
- `README.md` - Plugin documentation
- Additional files as needed

## Available Plugins

### Core System Plugins

#### 🤖 [Architect Advisor](./architect-advisor/)
- **Purpose**: AI-powered ADR generation
- **Capabilities**: System analysis, pattern detection, ADR proposal generation
- **Configuration**: Confidence thresholds, analysis types, approval workflows

#### 💾 [Memory Backend](./memory-backend/) 
- **Purpose**: Pluggable storage backends
- **Backends**: JSON, Redis, PostgreSQL
- **Capabilities**: Key-value storage, namespacing, search, persistence

#### ⚙️ [Workflow Engine](./workflow-engine/)
- **Purpose**: Pluggable workflow processing
- **Engines**: Default, Temporal, Camunda
- **Capabilities**: Step execution, state management, parallel processing

#### 🧠 [AI Provider](./ai-provider/)
- **Purpose**: Pluggable AI/LLM providers
- **Providers**: Claude, OpenAI, Local models, Ollama
- **Capabilities**: Text generation, structured output, code analysis

## Plugin Development

### Creating a Plugin

1. **Create Plugin Directory**
   ```bash
   mkdir src/plugins/my-plugin
   cd src/plugins/my-plugin
   ```

2. **Implement Plugin Class**
   ```javascript
   // index.js
   export class MyPlugin {
     constructor(config = {}) {
       this.config = config;
     }

     async initialize() {
       console.log('🔌 My Plugin initialized');
     }

     async cleanup() {
       console.log('🔌 My Plugin cleaned up');
     }
   }

   export default MyPlugin;
   ```

3. **Add Package Metadata**
   ```json
   {
     "name": "@claude-zen/my-plugin",
     "claudeZenPlugin": {
       "name": "my-plugin",
       "category": "utility",
       "capabilities": ["feature-1", "feature-2"],
       "config": {
         "option1": "default-value"
       }
     }
   }
   ```

### Plugin Interface

All plugins should implement:
- `constructor(config)` - Initialize with configuration
- `initialize()` - Async setup method
- `cleanup()` - Async cleanup method

Optional methods:
- `getStatus()` - Return plugin status
- `getCapabilities()` - List plugin capabilities

### Plugin Registration

Plugins are registered with the PluginManager:

```javascript
import { PluginManager } from './plugin-manager.js';
import MyPlugin from './plugins/my-plugin/index.js';

const manager = new PluginManager();

await manager.registerPlugin('my-plugin', MyPlugin, {
  enabled: true,
  option1: 'custom-value'
});

await manager.loadAll();
```

## Configuration

Plugins are configured in the schema:

```javascript
plugin_system: {
  enabled: true,
  plugins: {
    'my-plugin': {
      enabled: true,
      option1: 'value',
      option2: 42
    }
  }
}
```

## Best Practices

### Plugin Design
- **Single Responsibility**: Each plugin should have one clear purpose
- **Configurable**: Allow configuration of key behaviors
- **Error Handling**: Gracefully handle initialization and runtime errors
- **Resource Cleanup**: Properly clean up resources in cleanup method
- **Documentation**: Include comprehensive README and inline docs

### Dependencies
- **Minimal Dependencies**: Keep external dependencies to minimum
- **Optional Dependencies**: Use optionalDependencies for provider-specific packages
- **Peer Dependencies**: Reference core system as peer dependency

### Testing
- **Unit Tests**: Test plugin functionality in isolation
- **Integration Tests**: Test plugin integration with core system
- **Mock External Services**: Mock external APIs and services in tests

## Plugin Lifecycle

1. **Registration**: Plugin class registered with manager
2. **Loading**: Plugin instance created and initialized
3. **Runtime**: Plugin provides services to core system
4. **Unloading**: Plugin cleaned up and instance destroyed

## Error Handling

Plugins should:
- Handle initialization failures gracefully
- Emit events for important state changes
- Log errors with appropriate context
- Provide fallback behavior when possible

## Events

Plugins can emit and listen to events:

```javascript
// Emit events
this.emit('pluginEvent', { data: 'value' });

// Listen to events
pluginManager.on('pluginLoaded', ({ name, instance }) => {
  console.log(`Plugin ${name} loaded`);
});
```

## Security Considerations

- **Input Validation**: Validate all plugin inputs
- **Sandboxing**: Consider sandboxing for untrusted plugins
- **Resource Limits**: Implement resource usage limits
- **Access Control**: Control plugin access to system resources