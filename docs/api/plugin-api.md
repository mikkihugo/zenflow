# Plugin System API

Claude Code Flow provides a flexible plugin architecture that allows extending functionality through modular components.

## Plugin Architecture

### Plugin Types

#### 1. Core Plugins
System-level plugins that integrate deeply with the platform:
- **Memory Backend Plugins** - Custom storage implementations
- **AI Provider Plugins** - Integration with AI services
- **Security/Auth Plugins** - Authentication and authorization
- **Export System Plugins** - Data export and integration

#### 2. Feature Plugins  
Application-level plugins that add specific capabilities:
- **GitHub Integration** - Repository management and automation
- **Workflow Engine** - Custom workflow definitions
- **Notifications** - Alert and notification systems
- **Architect Advisor** - AI-powered architecture analysis

#### 3. UI Plugins
Interface extensions:
- **Unified Interface** - Custom UI components
- **Dashboard Widgets** - Monitoring and visualization
- **CLI Extensions** - Additional command-line tools

## Plugin Structure

### Basic Plugin Definition

```javascript
// my-plugin/package.json
{
  "name": "@claude-zen/my-plugin",
  "version": "1.0.0",
  "main": "src/index.js",
  "claudeZen": {
    "plugin": true,
    "type": "feature",
    "capabilities": ["data-processing", "analysis"],
    "dependencies": ["@claude-zen/memory-backend"],
    "hooks": ["task-assigned", "swarm-initialized"]
  }
}
```

### Plugin Entry Point

```javascript
// src/index.js
export default class MyPlugin {
  constructor(context) {
    this.context = context;
    this.name = 'my-plugin';
    this.version = '1.0.0';
  }

  /**
   * Initialize the plugin
   * @param {Object} options - Plugin configuration
   */
  async initialize(options = {}) {
    this.options = options;
    
    // Register hooks
    this.context.hooks.register('task-assigned', this.onTaskAssigned.bind(this));
    this.context.hooks.register('swarm-initialized', this.onSwarmInitialized.bind(this));
    
    // Register API endpoints
    this.context.api.register('/api/my-plugin', this.apiHandler.bind(this));
    
    // Register MCP tools
    this.context.mcp.registerTool('my_custom_tool', {
      description: 'Custom plugin tool',
      inputSchema: { /* schema */ },
      handler: this.customToolHandler.bind(this)
    });
    
    console.log(`Plugin ${this.name} v${this.version} initialized`);
  }

  /**
   * Plugin cleanup
   */
  async destroy() {
    this.context.hooks.unregister('task-assigned', this.onTaskAssigned);
    this.context.hooks.unregister('swarm-initialized', this.onSwarmInitialized);
    console.log(`Plugin ${this.name} destroyed`);
  }

  /**
   * Hook handlers
   */
  async onTaskAssigned(event) {
    console.log('Task assigned:', event.taskId);
    // Custom logic here
  }

  async onSwarmInitialized(event) {
    console.log('Swarm initialized:', event.swarmId);
    // Custom logic here
  }

  /**
   * API handler
   */
  async apiHandler(req, res) {
    res.json({
      plugin: this.name,
      version: this.version,
      status: 'active'
    });
  }

  /**
   * MCP tool handler
   */
  async customToolHandler(args) {
    return `Custom tool executed with args: ${JSON.stringify(args)}`;
  }
}
```

## Plugin Context API

### Core Context Methods

```javascript
class PluginContext {
  constructor(coreSystem) {
    this.hooks = new HookManager();
    this.api = new APIRegistry();
    this.mcp = new MCPRegistry();
    this.memory = coreSystem.memoryManager;
    this.swarm = coreSystem.swarmOrchestrator;
    this.config = coreSystem.config;
  }

  /**
   * Get system configuration
   * @param {string} key - Configuration key
   * @returns {any} Configuration value
   */
  getConfig(key) {
    return this.config.get(key);
  }

  /**
   * Access memory systems
   * @returns {Object} Memory manager instance
   */
  getMemory() {
    return this.memory;
  }

  /**
   * Access swarm orchestrator
   * @returns {Object} Swarm orchestrator instance
   */
  getSwarm() {
    return this.swarm;
  }

  /**
   * Log plugin messages
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} metadata - Additional metadata
   */
  log(level, message, metadata = {}) {
    console.log(`[PLUGIN:${metadata.plugin}] ${level.toUpperCase()}: ${message}`);
  }
}
```

### Hook System

```javascript
class HookManager {
  constructor() {
    this.hooks = new Map();
  }

  /**
   * Register a hook handler
   * @param {string} hookName - Name of the hook
   * @param {Function} handler - Handler function
   */
  register(hookName, handler) {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }
    this.hooks.get(hookName).push(handler);
  }

  /**
   * Unregister a hook handler
   * @param {string} hookName - Name of the hook
   * @param {Function} handler - Handler function to remove
   */
  unregister(hookName, handler) {
    if (this.hooks.has(hookName)) {
      const handlers = this.hooks.get(hookName);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Emit a hook event
   * @param {string} hookName - Name of the hook
   * @param {Object} data - Event data
   */
  async emit(hookName, data) {
    if (this.hooks.has(hookName)) {
      const handlers = this.hooks.get(hookName);
      for (const handler of handlers) {
        try {
          await handler(data);
        } catch (error) {
          console.error(`Hook handler error for ${hookName}:`, error);
        }
      }
    }
  }
}
```

## Available Hooks

### System Hooks

#### `system-startup`
Triggered when the system starts up.

```javascript
context.hooks.register('system-startup', async (event) => {
  console.log('System starting up:', event.version);
  // Initialize plugin resources
});
```

#### `system-shutdown`
Triggered when the system shuts down.

```javascript
context.hooks.register('system-shutdown', async (event) => {
  console.log('System shutting down');
  // Cleanup plugin resources
});
```

### Swarm Hooks

#### `swarm-initialized`
```javascript
context.hooks.register('swarm-initialized', async (event) => {
  const { swarmId, topology, strategy } = event;
  // React to new swarm creation
});
```

#### `agent-spawned`
```javascript
context.hooks.register('agent-spawned', async (event) => {
  const { swarmId, agentId, agentType, capabilities } = event;
  // React to agent creation
});
```

#### `task-assigned`
```javascript
context.hooks.register('task-assigned', async (event) => {
  const { taskId, agentId, swarmId, priority } = event;
  // React to task assignment
});
```

#### `task-completed`
```javascript
context.hooks.register('task-completed', async (event) => {
  const { taskId, agentId, result, executionTime } = event;
  // React to task completion
});
```

### Memory Hooks

#### `memory-stored`
```javascript
context.hooks.register('memory-stored', async (event) => {
  const { key, namespace, size } = event;
  // React to memory storage
});
```

#### `vector-search`
```javascript
context.hooks.register('vector-search', async (event) => {
  const { query, results, executionTime } = event;
  // React to vector search operations
});
```

### API Hooks

#### `api-request`
```javascript
context.hooks.register('api-request', async (event) => {
  const { method, path, clientId } = event;
  // React to API requests
});
```

#### `schema-updated`
```javascript
context.hooks.register('schema-updated', async (event) => {
  const { changes, version } = event;
  // React to schema changes
});
```

## Plugin Examples

### 1. GitHub Integration Plugin

```javascript
export default class GitHubIntegrationPlugin {
  constructor(context) {
    this.context = context;
    this.name = 'github-integration';
  }

  async initialize(options) {
    this.githubToken = options.githubToken;
    this.octokit = new Octokit({ auth: this.githubToken });

    // Register MCP tools
    this.context.mcp.registerTool('github_analyze_repo', {
      description: 'Analyze GitHub repository',
      inputSchema: {
        type: 'object',
        properties: {
          owner: { type: 'string' },
          repo: { type: 'string' }
        },
        required: ['owner', 'repo']
      },
      handler: this.analyzeRepository.bind(this)
    });

    // Register API endpoints
    this.context.api.register('/api/github/repos', this.listRepositories.bind(this));

    // Hook into task completion for GitHub actions
    this.context.hooks.register('task-completed', this.onTaskCompleted.bind(this));
  }

  async analyzeRepository(args) {
    const { owner, repo } = args;
    
    try {
      const repoData = await this.octokit.rest.repos.get({ owner, repo });
      const languages = await this.octokit.rest.repos.listLanguages({ owner, repo });
      
      return {
        name: repoData.data.name,
        description: repoData.data.description,
        languages: Object.keys(languages.data),
        stars: repoData.data.stargazers_count,
        forks: repoData.data.forks_count
      };
    } catch (error) {
      throw new Error(`Failed to analyze repository: ${error.message}`);
    }
  }

  async listRepositories(req, res) {
    try {
      const repos = await this.octokit.rest.repos.listForAuthenticatedUser();
      res.json(repos.data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async onTaskCompleted(event) {
    if (event.result === 'success' && event.metadata?.githubRepo) {
      // Create GitHub issue or update status
      await this.updateGitHubStatus(event);
    }
  }
}
```

### 2. Custom Memory Backend Plugin

```javascript
export default class CustomMemoryBackendPlugin {
  constructor(context) {
    this.context = context;
    this.name = 'custom-memory-backend';
  }

  async initialize(options) {
    this.redisClient = new Redis(options.redis);

    // Register custom memory backend
    this.context.memory.registerBackend('redis', {
      store: this.store.bind(this),
      retrieve: this.retrieve.bind(this),
      search: this.search.bind(this),
      delete: this.delete.bind(this)
    });

    // Hook into memory operations
    this.context.hooks.register('memory-stored', this.onMemoryStored.bind(this));
  }

  async store(key, value, options = {}) {
    const serialized = JSON.stringify(value);
    
    if (options.ttl) {
      await this.redisClient.setex(key, options.ttl, serialized);
    } else {
      await this.redisClient.set(key, serialized);
    }

    return { key, size: serialized.length };
  }

  async retrieve(key) {
    const value = await this.redisClient.get(key);
    return value ? JSON.parse(value) : null;
  }

  async search(pattern, options = {}) {
    const keys = await this.redisClient.keys(pattern);
    const results = [];
    
    for (const key of keys.slice(0, options.limit || 100)) {
      const value = await this.retrieve(key);
      if (value) {
        results.push({ key, value });
      }
    }
    
    return results;
  }

  async delete(key) {
    return await this.redisClient.del(key);
  }

  async onMemoryStored(event) {
    // Add to search index or perform additional processing
    console.log(`Stored in Redis: ${event.key}`);
  }
}
```

### 3. Workflow Engine Plugin

```javascript
export default class WorkflowEnginePlugin {
  constructor(context) {
    this.context = context;
    this.name = 'workflow-engine';
    this.workflows = new Map();
  }

  async initialize(options) {
    // Register MCP tools
    this.context.mcp.registerTool('workflow_create', {
      description: 'Create custom workflow',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          steps: { type: 'array' }
        },
        required: ['name', 'steps']
      },
      handler: this.createWorkflow.bind(this)
    });

    this.context.mcp.registerTool('workflow_execute', {
      description: 'Execute workflow',
      inputSchema: {
        type: 'object',
        properties: {
          workflowId: { type: 'string' },
          inputs: { type: 'object' }
        },
        required: ['workflowId']
      },
      handler: this.executeWorkflow.bind(this)
    });

    // Register API endpoints
    this.context.api.register('/api/workflows', this.workflowsHandler.bind(this));
  }

  async createWorkflow(args) {
    const { name, steps } = args;
    const workflowId = `workflow-${Date.now()}`;
    
    const workflow = {
      id: workflowId,
      name,
      steps,
      createdAt: new Date(),
      status: 'active'
    };

    this.workflows.set(workflowId, workflow);
    
    return { workflowId, message: `Workflow "${name}" created successfully` };
  }

  async executeWorkflow(args) {
    const { workflowId, inputs = {} } = args;
    const workflow = this.workflows.get(workflowId);
    
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const execution = {
      id: `exec-${Date.now()}`,
      workflowId,
      inputs,
      startTime: new Date(),
      status: 'running',
      results: []
    };

    // Execute workflow steps
    for (const step of workflow.steps) {
      try {
        const result = await this.executeStep(step, inputs);
        execution.results.push({ step: step.name, result, status: 'success' });
        
        // Update inputs for next step
        if (step.outputMapping) {
          Object.assign(inputs, this.mapOutputs(result, step.outputMapping));
        }
      } catch (error) {
        execution.results.push({ step: step.name, error: error.message, status: 'failed' });
        execution.status = 'failed';
        break;
      }
    }

    if (execution.status === 'running') {
      execution.status = 'completed';
    }
    
    execution.endTime = new Date();
    execution.duration = execution.endTime - execution.startTime;

    return execution;
  }

  async executeStep(step, inputs) {
    switch (step.type) {
      case 'mcp-tool':
        return await this.context.mcp.callTool(step.tool, step.inputs || inputs);
      
      case 'api-call':
        return await this.makeAPICall(step.endpoint, step.method, step.data || inputs);
      
      case 'swarm-task':
        return await this.context.swarm.orchestrateTask(step.task, inputs);
      
      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }

  async workflowsHandler(req, res) {
    if (req.method === 'GET') {
      const workflows = Array.from(this.workflows.values());
      res.json({ workflows });
    } else if (req.method === 'POST') {
      const result = await this.createWorkflow(req.body);
      res.json(result);
    }
  }
}
```

## Plugin Management

### Plugin Registry

```javascript
class PluginManager {
  constructor(context) {
    this.context = context;
    this.plugins = new Map();
    this.loadedPlugins = new Set();
  }

  /**
   * Load and initialize a plugin
   * @param {string} pluginPath - Path to plugin
   * @param {Object} options - Plugin options
   */
  async loadPlugin(pluginPath, options = {}) {
    try {
      const PluginClass = await import(pluginPath);
      const plugin = new PluginClass.default(this.context);
      
      await plugin.initialize(options);
      
      this.plugins.set(plugin.name, plugin);
      this.loadedPlugins.add(plugin.name);
      
      console.log(`Plugin loaded: ${plugin.name}`);
      return plugin;
    } catch (error) {
      console.error(`Failed to load plugin ${pluginPath}:`, error);
      throw error;
    }
  }

  /**
   * Unload a plugin
   * @param {string} pluginName - Name of plugin to unload
   */
  async unloadPlugin(pluginName) {
    const plugin = this.plugins.get(pluginName);
    if (plugin) {
      await plugin.destroy();
      this.plugins.delete(pluginName);
      this.loadedPlugins.delete(pluginName);
      console.log(`Plugin unloaded: ${pluginName}`);
    }
  }

  /**
   * Get loaded plugin
   * @param {string} pluginName - Plugin name
   * @returns {Object} Plugin instance
   */
  getPlugin(pluginName) {
    return this.plugins.get(pluginName);
  }

  /**
   * List all loaded plugins
   * @returns {Array} Array of plugin names
   */
  listPlugins() {
    return Array.from(this.loadedPlugins);
  }
}
```

### Plugin Configuration

```json
{
  "plugins": {
    "github-integration": {
      "enabled": true,
      "options": {
        "githubToken": "${GITHUB_TOKEN}",
        "webhookSecret": "${GITHUB_WEBHOOK_SECRET}"
      }
    },
    "custom-memory-backend": {
      "enabled": true,
      "options": {
        "redis": {
          "host": "localhost",
          "port": 6379
        }
      }
    },
    "workflow-engine": {
      "enabled": true,
      "options": {
        "maxConcurrentWorkflows": 10
      }
    }
  }
}
```

## Best Practices

### Plugin Development

1. **Error Handling**: Always wrap plugin operations in try-catch blocks
2. **Resource Cleanup**: Implement proper cleanup in the destroy method
3. **Configuration Validation**: Validate plugin options on initialization
4. **Logging**: Use the context.log method for consistent logging
5. **Documentation**: Include comprehensive JSDoc comments

### Performance

1. **Lazy Loading**: Load heavy resources only when needed
2. **Caching**: Cache frequently accessed data
3. **Async Operations**: Use async/await for non-blocking operations
4. **Memory Management**: Clean up resources and remove event listeners

### Security

1. **Input Validation**: Validate all inputs from external sources
2. **Privilege Separation**: Request only necessary permissions
3. **Secure Storage**: Store sensitive data securely
4. **API Security**: Implement proper authentication for plugin APIs

### Testing

```javascript
// Plugin test example
import { describe, it, expect, beforeEach } from 'jest';
import MyPlugin from '../src/index.js';

describe('MyPlugin', () => {
  let plugin;
  let mockContext;

  beforeEach(() => {
    mockContext = {
      hooks: { register: jest.fn(), unregister: jest.fn() },
      api: { register: jest.fn() },
      mcp: { registerTool: jest.fn() }
    };
    
    plugin = new MyPlugin(mockContext);
  });

  it('should initialize correctly', async () => {
    await plugin.initialize({ testOption: 'value' });
    
    expect(mockContext.hooks.register).toHaveBeenCalled();
    expect(mockContext.api.register).toHaveBeenCalled();
  });

  it('should handle task assignment', async () => {
    const event = { taskId: 'task-001', agentId: 'agent-001' };
    
    await plugin.onTaskAssigned(event);
    
    // Assert expected behavior
  });
});
```