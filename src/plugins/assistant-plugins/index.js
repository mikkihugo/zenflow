/**
 * Assistant Plugins Plugin
 * AI-powered plugin development assistant
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { EventEmitter } from 'events';

export class AssistantPluginsPlugin extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      pluginTemplatesDir: path.join(process.cwd(), '.hive-mind', 'plugin-templates'),
      pluginAnalysisDir: path.join(process.cwd(), '.hive-mind', 'plugin-analysis'),
      codeGeneration: {
        style: 'modern', // modern, classic, functional
        includeTests: true,
        includeDocumentation: true,
        includeExamples: true
      },
      analysis: {
        detectPatterns: true,
        suggestImprovements: true,
        checkCompatibility: true,
        performanceAnalysis: true
      },
      ai: {
        provider: 'local', // local, openai, anthropic
        model: 'code-llama',
        temperature: 0.3
      },
      ...config
    };
    
    this.pluginPatterns = new Map();
    this.knowledgeBase = new Map();
    this.generatedPlugins = [];
    this.analysisCache = new Map();
  }

  async initialize() {
    console.log('🤖 Assistant Plugins Plugin initialized');
    
    // Create directories
    await mkdir(this.config.pluginTemplatesDir, { recursive: true });
    await mkdir(this.config.pluginAnalysisDir, { recursive: true });
    
    // Load plugin patterns and best practices
    await this.loadPluginPatterns();
    
    // Load knowledge base
    await this.loadKnowledgeBase();
    
    // Initialize AI provider
    await this.initializeAIProvider();
  }

  async loadPluginPatterns() {
    // Common plugin patterns
    this.pluginPatterns.set('data-processor', {
      name: 'Data Processor Pattern',
      description: 'Plugin that processes and transforms data',
      structure: {
        required: ['initialize', 'process', 'validate', 'cleanup'],
        optional: ['preProcess', 'postProcess', 'transform', 'filter'],
        events: ['data:received', 'data:processed', 'data:error']
      },
      template: {
        imports: ['EventEmitter', 'fs/promises', 'path'],
        class: 'DataProcessorPlugin',
        extends: 'EventEmitter',
        methods: {
          initialize: 'async initialize() {\n    // Initialize data processor\n}',
          process: 'async process(data, options = {}) {\n    // Process data\n}',
          validate: 'async validate(data) {\n    // Validate data\n}'
        }
      }
    });

    this.pluginPatterns.set('api-connector', {
      name: 'API Connector Pattern',
      description: 'Plugin that connects to external APIs',
      structure: {
        required: ['initialize', 'connect', 'request', 'disconnect'],
        optional: ['authenticate', 'refreshToken', 'handleRateLimit'],
        events: ['api:connected', 'api:request', 'api:response', 'api:error']
      },
      template: {
        imports: ['EventEmitter', 'fetch', 'crypto'],
        class: 'APIConnectorPlugin',
        config: ['apiUrl', 'apiKey', 'timeout', 'retryAttempts']
      }
    });

    this.pluginPatterns.set('storage-backend', {
      name: 'Storage Backend Pattern',
      description: 'Plugin that provides storage capabilities',
      structure: {
        required: ['initialize', 'store', 'retrieve', 'delete', 'cleanup'],
        optional: ['update', 'search', 'backup', 'restore'],
        events: ['storage:ready', 'storage:error', 'storage:operation']
      }
    });

    this.pluginPatterns.set('analyzer', {
      name: 'Analyzer Pattern',
      description: 'Plugin that analyzes code or data',
      structure: {
        required: ['initialize', 'analyze', 'getResults', 'cleanup'],
        optional: ['configure', 'compareResults', 'generateReport'],
        events: ['analysis:start', 'analysis:progress', 'analysis:complete']
      }
    });

    this.pluginPatterns.set('transformer', {
      name: 'Transformer Pattern',
      description: 'Plugin that transforms between formats',
      structure: {
        required: ['initialize', 'transform', 'validate', 'cleanup'],
        optional: ['detectFormat', 'optimize', 'batch'],
        events: ['transform:start', 'transform:complete', 'transform:error']
      }
    });

    console.log(`📋 Loaded ${this.pluginPatterns.size} plugin patterns`);
  }

  async loadKnowledgeBase() {
    // Best practices and common patterns
    this.knowledgeBase.set('error-handling', {
      title: 'Error Handling Best Practices',
      patterns: [
        'Always use try-catch in async methods',
        'Emit error events for recoverable errors',
        'Provide detailed error messages with context',
        'Implement retry logic for transient failures',
        'Clean up resources on error'
      ],
      examples: {
        basicTryCatch: `async method() {
  try {
    // Operation
  } catch (error) {
    this.emit('error', {
      method: 'method',
      error: error.message,
      context: { /* relevant data */ }
    });
    throw error;
  }
}`,
        retryLogic: `async retryOperation(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
}`
      }
    });

    this.knowledgeBase.set('configuration', {
      title: 'Configuration Management',
      patterns: [
        'Use default values with spread operator',
        'Validate configuration on initialization',
        'Support environment variables',
        'Allow runtime configuration updates',
        'Document all configuration options'
      ],
      examples: {
        configMerge: `constructor(config = {}) {
  this.config = {
    defaultOption: 'value',
    nested: {
      option: true
    },
    ...config
  };
}`,
        validation: `validateConfig(config) {
  const required = ['apiKey', 'endpoint'];
  for (const key of required) {
    if (!config[key]) {
      throw new Error(\`Missing required config: \${key}\`);
    }
  }
}`
      }
    });

    this.knowledgeBase.set('event-patterns', {
      title: 'Event Emission Patterns',
      patterns: [
        'Use descriptive event names with namespaces',
        'Include relevant data in event payloads',
        'Document all events in README',
        'Provide event typing for TypeScript',
        'Consider event ordering and race conditions'
      ],
      examples: {
        eventNaming: `// Good event names
this.emit('data:processed', { count, duration });
this.emit('connection:established', { url, protocol });
this.emit('error:validation', { field, value, reason });`,
        eventPayload: `this.emit('task:complete', {
  taskId: task.id,
  duration: Date.now() - startTime,
  result: processedData,
  metadata: {
    inputSize: data.length,
    outputSize: result.length
  }
});`
      }
    });

    this.knowledgeBase.set('testing', {
      title: 'Plugin Testing Strategies',
      patterns: [
        'Test initialization and cleanup',
        'Mock external dependencies',
        'Test error scenarios',
        'Verify event emissions',
        'Test configuration variations'
      ],
      examples: {
        basicTest: `describe('MyPlugin', () => {
  let plugin;
  
  beforeEach(() => {
    plugin = new MyPlugin({ testMode: true });
  });
  
  afterEach(async () => {
    await plugin.cleanup();
  });
  
  test('should initialize successfully', async () => {
    await plugin.initialize();
    expect(plugin.isReady).toBe(true);
  });
});`
      }
    });

    console.log(`📚 Loaded ${this.knowledgeBase.size} knowledge base entries`);
  }

  async initializeAIProvider() {
    // Initialize AI provider for code generation
    // This would integrate with actual AI services
    console.log(`🧠 AI provider initialized: ${this.config.ai.provider}`);
  }

  async generatePlugin(options) {
    const {
      name,
      description,
      pattern = 'custom',
      features = [],
      dependencies = [],
      config = {}
    } = options;

    console.log(`🔨 Generating plugin: ${name}`);

    // Select pattern
    const selectedPattern = this.pluginPatterns.get(pattern) || this.createCustomPattern(features);
    
    // Generate plugin structure
    const pluginStructure = await this.generatePluginStructure(name, description, selectedPattern, config);
    
    // Generate code
    const generatedCode = await this.generatePluginCode(pluginStructure, options);
    
    // Generate tests
    const tests = this.config.codeGeneration.includeTests ? 
      await this.generateTests(pluginStructure) : null;
    
    // Generate documentation
    const documentation = this.config.codeGeneration.includeDocumentation ?
      await this.generateDocumentation(pluginStructure) : null;
    
    // Generate examples
    const examples = this.config.codeGeneration.includeExamples ?
      await this.generateExamples(pluginStructure) : null;
    
    // Create plugin package
    const pluginPackage = {
      name,
      structure: pluginStructure,
      files: {
        'index.js': generatedCode.main,
        'package.json': generatedCode.packageJson,
        'README.md': documentation,
        'test/index.test.js': tests,
        'examples/basic.js': examples
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        pattern: pattern,
        features: features,
        dependencies: dependencies
      }
    };
    
    // Save generated plugin
    await this.saveGeneratedPlugin(pluginPackage);
    
    this.generatedPlugins.push(pluginPackage);
    this.emit('plugin:generated', pluginPackage);
    
    console.log(`✅ Plugin ${name} generated successfully`);
    
    return pluginPackage;
  }

  async generatePluginStructure(name, description, pattern, config) {
    const className = this.toClassName(name);
    
    return {
      name,
      className,
      description,
      pattern: pattern.name,
      imports: this.determineImports(pattern, config),
      extends: pattern.extends || 'EventEmitter',
      properties: this.generateProperties(config),
      constructor: this.generateConstructor(config),
      methods: this.generateMethods(pattern, config),
      events: pattern.structure?.events || [],
      config: config
    };
  }

  determineImports(pattern, config) {
    const imports = new Set(['EventEmitter from \'events\'']);
    
    // Add pattern-specific imports
    if (pattern.template?.imports) {
      pattern.template.imports.forEach(imp => imports.add(imp));
    }
    
    // Add feature-based imports
    if (config.features?.includes('file-operations')) {
      imports.add('{ readFile, writeFile, mkdir } from \'fs/promises\'');
      imports.add('path');
    }
    
    if (config.features?.includes('http')) {
      imports.add('fetch');
    }
    
    if (config.features?.includes('database')) {
      imports.add('{ Database } from \'./database\'');
    }
    
    return Array.from(imports);
  }

  generateProperties(config) {
    const properties = ['config', 'initialized = false'];
    
    if (config.features?.includes('caching')) {
      properties.push('cache = new Map()');
    }
    
    if (config.features?.includes('queue')) {
      properties.push('queue = []', 'processing = false');
    }
    
    if (config.features?.includes('metrics')) {
      properties.push('metrics = { operations: 0, errors: 0, lastOperation: null }');
    }
    
    return properties;
  }

  generateConstructor(config) {
    const configDefaults = Object.entries(config.defaults || {})
      .map(([key, value]) => `      ${key}: ${JSON.stringify(value)}`)
      .join(',\n');
    
    return `constructor(config = {}) {
    super();
    this.config = {
${configDefaults}${configDefaults ? ',\n' : ''}      ...config
    };
    
    this.initialized = false;
  }`;
  }

  generateMethods(pattern, config) {
    const methods = [];
    
    // Required methods from pattern
    if (pattern.structure?.required) {
      for (const methodName of pattern.structure.required) {
        methods.push(this.generateMethod(methodName, pattern, config));
      }
    }
    
    // Optional methods based on features
    if (config.features) {
      for (const feature of config.features) {
        const featureMethods = this.getFeatureMethods(feature);
        methods.push(...featureMethods);
      }
    }
    
    return methods;
  }

  generateMethod(methodName, pattern, config) {
    const methodTemplates = {
      initialize: `async initialize() {
    if (this.initialized) {
      return;
    }
    
    try {
      console.log('🔌 ${config.name || 'Plugin'} initializing...');
      
      // Initialize resources
      ${config.features?.includes('database') ? 'await this.initializeDatabase();' : ''}
      ${config.features?.includes('api') ? 'await this.initializeAPI();' : ''}
      
      this.initialized = true;
      this.emit('initialized');
      console.log('✅ ${config.name || 'Plugin'} initialized');
    } catch (error) {
      this.emit('error', { method: 'initialize', error });
      throw error;
    }
  }`,
      
      cleanup: `async cleanup() {
    if (!this.initialized) {
      return;
    }
    
    try {
      // Cleanup resources
      ${config.features?.includes('database') ? 'await this.closeDatabase();' : ''}
      ${config.features?.includes('api') ? 'await this.disconnectAPI();' : ''}
      
      this.initialized = false;
      this.emit('cleanup');
      console.log('🧹 ${config.name || 'Plugin'} cleaned up');
    } catch (error) {
      this.emit('error', { method: 'cleanup', error });
      throw error;
    }
  }`,
      
      process: `async process(data, options = {}) {
    if (!this.initialized) {
      throw new Error('Plugin not initialized');
    }
    
    const startTime = Date.now();
    
    try {
      this.emit('process:start', { dataSize: data.length });
      
      // Process data
      const result = await this.processData(data, options);
      
      const duration = Date.now() - startTime;
      this.emit('process:complete', { duration, resultSize: result.length });
      
      return result;
    } catch (error) {
      this.emit('error', { method: 'process', error, data });
      throw error;
    }
  }`,
      
      validate: `async validate(data) {
    const errors = [];
    
    // Validation logic
    if (!data) {
      errors.push('Data is required');
    }
    
    if (errors.length > 0) {
      const error = new Error('Validation failed');
      error.validationErrors = errors;
      throw error;
    }
    
    return true;
  }`
    };
    
    return {
      name: methodName,
      async: true,
      body: methodTemplates[methodName] || `async ${methodName}() {\n    // TODO: Implement ${methodName}\n  }`
    };
  }

  getFeatureMethods(feature) {
    const featureMethods = {
      'caching': [
        {
          name: 'getCached',
          body: `getCached(key) {
    if (this.cache.has(key)) {
      const entry = this.cache.get(key);
      if (Date.now() - entry.timestamp < this.config.cacheTimeout) {
        return entry.value;
      }
      this.cache.delete(key);
    }
    return null;
  }`
        },
        {
          name: 'setCached',
          body: `setCached(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }`
        }
      ],
      'queue': [
        {
          name: 'enqueue',
          body: `async enqueue(item) {
    this.queue.push(item);
    
    if (!this.processing) {
      await this.processQueue();
    }
  }`
        },
        {
          name: 'processQueue',
          body: `async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const item = this.queue.shift();
      try {
        await this.processItem(item);
      } catch (error) {
        this.emit('queue:error', { item, error });
      }
    }
    
    this.processing = false;
  }`
        }
      ]
    };
    
    return featureMethods[feature] || [];
  }

  async generatePluginCode(structure, options) {
    const { imports, className, constructor, methods, properties } = structure;
    
    // Generate main plugin file
    const mainCode = `/**
 * ${structure.name} Plugin
 * ${structure.description}
 * 
 * Generated by Assistant Plugins Plugin
 * Pattern: ${structure.pattern}
 */

${imports.map(imp => `import ${imp};`).join('\n')}

export class ${className} extends ${structure.extends} {
  ${properties.join(';\n  ')};

  ${constructor}

${methods.map(method => {
  if (typeof method === 'object') {
    return `  ${method.async ? 'async ' : ''}${method.name}${method.body.includes(method.name) ? method.body.substring(method.body.indexOf('(')) : '() {\n' + method.body + '\n  }'}`;
  }
  return `  ${method}`;
}).join('\n\n')}

  // Helper methods
  async ${structure.extends === 'EventEmitter' ? 'emitAsync' : '_emit'}(event, data) {
    return new Promise((resolve) => {
      this.emit(event, data);
      setImmediate(resolve);
    });
  }

  getStatus() {
    return {
      initialized: this.initialized,
      ${structure.config.features?.includes('metrics') ? 'metrics: this.metrics,' : ''}
      ${structure.config.features?.includes('queue') ? 'queueLength: this.queue.length,' : ''}
      ${structure.config.features?.includes('caching') ? 'cacheSize: this.cache.size,' : ''}
    };
  }
}

export default ${className};`;

    // Generate package.json
    const packageJson = {
      name: `@claude-zen/plugin-${this.toKebabCase(structure.name)}`,
      version: '0.1.0',
      description: structure.description,
      main: 'index.js',
      type: 'module',
      scripts: {
        test: 'jest',
        lint: 'eslint .',
        build: 'echo "No build required"'
      },
      keywords: ['claude-zen', 'plugin', ...options.keywords || []],
      author: options.author || 'Claude Zen',
      license: options.license || 'MIT',
      dependencies: this.generateDependencies(structure, options),
      devDependencies: {
        'jest': '^29.0.0',
        'eslint': '^8.0.0'
      },
      peerDependencies: {
        '@claude-zen/core': '^1.0.0'
      }
    };

    return {
      main: mainCode,
      packageJson: JSON.stringify(packageJson, null, 2)
    };
  }

  generateDependencies(structure, options) {
    const deps = {};
    
    // Add dependencies based on features
    if (structure.config.features?.includes('http')) {
      deps['node-fetch'] = '^3.0.0';
    }
    
    if (structure.config.features?.includes('database')) {
      if (options.database === 'postgres') {
        deps['pg'] = '^8.0.0';
      } else if (options.database === 'mysql') {
        deps['mysql2'] = '^3.0.0';
      } else if (options.database === 'sqlite') {
        deps['sqlite3'] = '^5.0.0';
      }
    }
    
    // Add explicit dependencies
    if (options.dependencies) {
      for (const dep of options.dependencies) {
        if (typeof dep === 'string') {
          deps[dep] = 'latest';
        } else {
          deps[dep.name] = dep.version || 'latest';
        }
      }
    }
    
    return deps;
  }

  async generateTests(structure) {
    const { className, methods } = structure;
    
    return `import { ${className} } from '../index.js';

describe('${className}', () => {
  let plugin;
  
  beforeEach(() => {
    plugin = new ${className}({
      testMode: true
    });
  });
  
  afterEach(async () => {
    if (plugin.initialized) {
      await plugin.cleanup();
    }
  });
  
  describe('initialization', () => {
    test('should initialize successfully', async () => {
      await plugin.initialize();
      expect(plugin.initialized).toBe(true);
    });
    
    test('should emit initialized event', async () => {
      const handler = jest.fn();
      plugin.on('initialized', handler);
      
      await plugin.initialize();
      
      expect(handler).toHaveBeenCalled();
    });
    
    test('should not initialize twice', async () => {
      await plugin.initialize();
      await plugin.initialize(); // Should not throw
      
      expect(plugin.initialized).toBe(true);
    });
  });
  
  describe('cleanup', () => {
    test('should cleanup successfully', async () => {
      await plugin.initialize();
      await plugin.cleanup();
      
      expect(plugin.initialized).toBe(false);
    });
    
    test('should emit cleanup event', async () => {
      await plugin.initialize();
      
      const handler = jest.fn();
      plugin.on('cleanup', handler);
      
      await plugin.cleanup();
      
      expect(handler).toHaveBeenCalled();
    });
  });
  
${methods.filter(m => m.name !== 'initialize' && m.name !== 'cleanup').map(method => `  describe('${method.name}', () => {
    test('should require initialization', async () => {
      await expect(plugin.${method.name}()).rejects.toThrow('not initialized');
    });
    
    test('should ${method.name} successfully', async () => {
      await plugin.initialize();
      // Add specific test logic for ${method.name}
    });
  });
`).join('\n')}
  
  describe('error handling', () => {
    test('should emit error events', async () => {
      const handler = jest.fn();
      plugin.on('error', handler);
      
      // Trigger an error scenario
      // expect(handler).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(Error) }));
    });
  });
  
  describe('getStatus', () => {
    test('should return current status', async () => {
      const status = plugin.getStatus();
      
      expect(status).toHaveProperty('initialized', false);
    });
  });
});`;
  }

  async generateDocumentation(structure) {
    const { name, className, description, methods, events, config } = structure;
    
    return `# ${name} Plugin

${description}

## Installation

\`\`\`bash
npm install @claude-zen/plugin-${this.toKebabCase(name)}
\`\`\`

## Usage

\`\`\`javascript
import { ${className} } from '@claude-zen/plugin-${this.toKebabCase(name)}';

const plugin = new ${className}({
  // Configuration options
});

// Initialize the plugin
await plugin.initialize();

// Use the plugin
${this.generateUsageExample(structure)}

// Clean up when done
await plugin.cleanup();
\`\`\`

## Configuration

${this.generateConfigurationDocs(config)}

## API Reference

### Methods

${methods.map(method => {
  const methodName = typeof method === 'object' ? method.name : method.match(/(\w+)\(/)?.[1] || 'unknown';
  return `#### \`${methodName}()\`

${this.getMethodDescription(methodName)}

\`\`\`javascript
await plugin.${methodName}();
\`\`\``;
}).join('\n\n')}

### Events

${events.map(event => `#### \`${event}\`

${this.getEventDescription(event)}

\`\`\`javascript
plugin.on('${event}', (data) => {
  console.log('${event}:', data);
});
\`\`\``).join('\n\n')}

## Examples

### Basic Usage

\`\`\`javascript
${this.generateBasicExample(structure)}
\`\`\`

### Advanced Usage

\`\`\`javascript
${this.generateAdvancedExample(structure)}
\`\`\`

## Best Practices

${this.generateBestPractices(structure)}

## Troubleshooting

${this.generateTroubleshooting(structure)}

## License

MIT`;
  }

  async generateExamples(structure) {
    return `import { ${structure.className} } from '../index.js';

async function basicExample() {
  const plugin = new ${structure.className}({
    // Basic configuration
  });
  
  try {
    await plugin.initialize();
    console.log('Plugin initialized');
    
    // Use the plugin
    ${this.generateExampleUsage(structure)}
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await plugin.cleanup();
  }
}

async function advancedExample() {
  const plugin = new ${structure.className}({
    // Advanced configuration
    ${structure.config.features?.includes('caching') ? 'cacheTimeout: 60000,' : ''}
    ${structure.config.features?.includes('metrics') ? 'enableMetrics: true,' : ''}
  });
  
  // Set up event handlers
  plugin.on('error', (error) => {
    console.error('Plugin error:', error);
  });
  
  ${structure.events.map(event => `plugin.on('${event}', (data) => {
    console.log('${event}:', data);
  });`).join('\n  ')}
  
  try {
    await plugin.initialize();
    
    // Advanced usage
    ${this.generateAdvancedUsage(structure)}
    
    // Get status
    const status = plugin.getStatus();
    console.log('Plugin status:', status);
    
  } finally {
    await plugin.cleanup();
  }
}

// Run examples
if (import.meta.url === \`file://\${process.argv[1]}\`) {
  console.log('Running basic example...');
  await basicExample();
  
  console.log('\\nRunning advanced example...');
  await advancedExample();
}`;
  }

  async analyzePlugin(pluginPath, options = {}) {
    console.log(`🔍 Analyzing plugin: ${pluginPath}`);
    
    try {
      // Read plugin code
      const code = await readFile(pluginPath, 'utf8');
      
      // Analyze structure
      const structure = await this.analyzeStructure(code);
      
      // Analyze patterns
      const patterns = this.config.analysis.detectPatterns ? 
        await this.analyzePatterns(code, structure) : null;
      
      // Analyze performance
      const performance = this.config.analysis.performanceAnalysis ?
        await this.analyzePerformance(code, structure) : null;
      
      // Check compatibility
      const compatibility = this.config.analysis.checkCompatibility ?
        await this.checkCompatibility(code, structure) : null;
      
      // Generate suggestions
      const suggestions = this.config.analysis.suggestImprovements ?
        await this.generateSuggestions(structure, patterns, performance) : null;
      
      const analysis = {
        pluginPath,
        structure,
        patterns,
        performance,
        compatibility,
        suggestions,
        timestamp: new Date().toISOString()
      };
      
      // Cache analysis
      this.analysisCache.set(pluginPath, analysis);
      
      // Save analysis report
      await this.saveAnalysisReport(analysis);
      
      this.emit('plugin:analyzed', analysis);
      
      return analysis;
      
    } catch (error) {
      throw new Error(`Failed to analyze plugin: ${error.message}`);
    }
  }

  async analyzeStructure(code) {
    const structure = {
      classes: [],
      methods: [],
      events: [],
      imports: [],
      exports: [],
      configuration: null
    };
    
    // Extract classes
    const classMatches = code.matchAll(/class\s+(\w+)(?:\s+extends\s+(\w+))?\s*{/g);
    for (const match of classMatches) {
      structure.classes.push({
        name: match[1],
        extends: match[2] || null
      });
    }
    
    // Extract methods
    const methodMatches = code.matchAll(/(?:async\s+)?(\w+)\s*\([^)]*\)\s*{/g);
    for (const match of methodMatches) {
      if (!['constructor', 'if', 'for', 'while', 'switch'].includes(match[1])) {
        structure.methods.push(match[1]);
      }
    }
    
    // Extract event emissions
    const eventMatches = code.matchAll(/this\.emit\(['"`]([^'"]+)['"`]/g);
    for (const match of eventMatches) {
      if (!structure.events.includes(match[1])) {
        structure.events.push(match[1]);
      }
    }
    
    // Extract imports
    const importMatches = code.matchAll(/import\s+(?:{[^}]+}|\*\s+as\s+\w+|\w+)\s+from\s+['"`]([^'"]+)['"`]/g);
    for (const match of importMatches) {
      structure.imports.push(match[1]);
    }
    
    // Extract configuration
    const configMatch = code.match(/this\.config\s*=\s*{([^}]+)}/s);
    if (configMatch) {
      structure.configuration = this.parseConfiguration(configMatch[1]);
    }
    
    return structure;
  }

  async analyzePatterns(code, structure) {
    const detectedPatterns = [];
    
    // Check against known patterns
    for (const [patternName, pattern] of this.pluginPatterns) {
      const score = this.calculatePatternMatch(structure, pattern);
      if (score > 0.7) {
        detectedPatterns.push({
          name: patternName,
          pattern: pattern.name,
          score: score,
          matchedMethods: structure.methods.filter(m => 
            pattern.structure.required.includes(m) || 
            pattern.structure.optional?.includes(m)
          )
        });
      }
    }
    
    return detectedPatterns;
  }

  calculatePatternMatch(structure, pattern) {
    const requiredMethods = pattern.structure.required || [];
    const optionalMethods = pattern.structure.optional || [];
    const allMethods = [...requiredMethods, ...optionalMethods];
    
    let matchCount = 0;
    let totalWeight = 0;
    
    // Check required methods (higher weight)
    for (const method of requiredMethods) {
      totalWeight += 2;
      if (structure.methods.includes(method)) {
        matchCount += 2;
      }
    }
    
    // Check optional methods (lower weight)
    for (const method of optionalMethods) {
      totalWeight += 1;
      if (structure.methods.includes(method)) {
        matchCount += 1;
      }
    }
    
    return totalWeight > 0 ? matchCount / totalWeight : 0;
  }

  async analyzePerformance(code, structure) {
    const issues = [];
    const suggestions = [];
    
    // Check for async/await patterns
    if (code.includes('.then(') && code.includes('async')) {
      issues.push({
        type: 'mixed-async-patterns',
        severity: 'low',
        message: 'Mixed use of async/await and .then() patterns'
      });
      suggestions.push('Consider using consistent async/await patterns');
    }
    
    // Check for potential memory leaks
    if (code.includes('setInterval') && !code.includes('clearInterval')) {
      issues.push({
        type: 'potential-memory-leak',
        severity: 'high',
        message: 'setInterval without corresponding clearInterval'
      });
    }
    
    // Check for event listener cleanup
    const listenerCount = (code.match(/\.on\(/g) || []).length;
    const removeListenerCount = (code.match(/\.(off|removeListener)\(/g) || []).length;
    
    if (listenerCount > removeListenerCount + 2) {
      issues.push({
        type: 'event-listener-leak',
        severity: 'medium',
        message: 'More event listeners added than removed'
      });
      suggestions.push('Ensure all event listeners are removed in cleanup');
    }
    
    // Check for large synchronous operations
    if (code.includes('readFileSync') || code.includes('writeFileSync')) {
      issues.push({
        type: 'sync-io',
        severity: 'medium',
        message: 'Synchronous I/O operations detected'
      });
      suggestions.push('Use async I/O operations for better performance');
    }
    
    return {
      issues,
      suggestions,
      metrics: {
        asyncMethods: structure.methods.filter(m => code.includes(`async ${m}`)).length,
        eventEmissions: structure.events.length,
        cyclomaticComplexity: this.estimateComplexity(code)
      }
    };
  }

  estimateComplexity(code) {
    // Simple complexity estimation based on control structures
    const patterns = [
      /\bif\s*\(/g,
      /\belse\s+if\s*\(/g,
      /\belse\s*{/g,
      /\bfor\s*\(/g,
      /\bwhile\s*\(/g,
      /\bdo\s*{/g,
      /\bswitch\s*\(/g,
      /\bcase\s+/g,
      /\bcatch\s*\(/g,
      /\?\s*[^:]+:/g // ternary
    ];
    
    let complexity = 1; // Base complexity
    
    for (const pattern of patterns) {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }
    
    return complexity;
  }

  async checkCompatibility(code, structure) {
    const compatibility = {
      nodeVersion: '14.0.0', // Minimum Node version
      esModules: code.includes('import ') || code.includes('export '),
      dependencies: [],
      issues: []
    };
    
    // Check for ES module syntax
    if (compatibility.esModules && !code.includes('"type": "module"')) {
      compatibility.issues.push({
        type: 'es-modules',
        message: 'ES modules used but package.json may need "type": "module"'
      });
    }
    
    // Check for Node.js version requirements
    if (code.includes('optional chaining')) {
      compatibility.nodeVersion = '14.0.0';
    }
    
    if (code.includes('Promise.allSettled')) {
      compatibility.nodeVersion = '12.9.0';
    }
    
    if (code.includes('globalThis')) {
      compatibility.nodeVersion = '12.0.0';
    }
    
    // Extract dependencies from imports
    for (const imp of structure.imports) {
      if (!imp.startsWith('.') && !imp.startsWith('@claude-zen/')) {
        compatibility.dependencies.push(imp);
      }
    }
    
    return compatibility;
  }

  async generateSuggestions(structure, patterns, performance) {
    const suggestions = [];
    
    // Method suggestions
    if (!structure.methods.includes('getStatus')) {
      suggestions.push({
        type: 'method',
        priority: 'low',
        suggestion: 'Add getStatus() method for monitoring',
        code: `getStatus() {
  return {
    initialized: this.initialized,
    // Add relevant status information
  };
}`
      });
    }
    
    if (!structure.methods.includes('cleanup') && structure.methods.includes('initialize')) {
      suggestions.push({
        type: 'method',
        priority: 'high',
        suggestion: 'Add cleanup() method to release resources',
        code: `async cleanup() {
  // Clean up resources
  this.initialized = false;
}`
      });
    }
    
    // Event suggestions
    if (structure.events.length === 0) {
      suggestions.push({
        type: 'events',
        priority: 'medium',
        suggestion: 'Consider emitting events for better integration',
        examples: ['initialized', 'error', 'data:processed']
      });
    }
    
    // Pattern suggestions
    if (patterns && patterns.length === 0) {
      suggestions.push({
        type: 'pattern',
        priority: 'low',
        suggestion: 'Consider following a standard plugin pattern',
        patterns: Array.from(this.pluginPatterns.keys())
      });
    }
    
    // Performance suggestions
    if (performance) {
      suggestions.push(...performance.suggestions.map(s => ({
        type: 'performance',
        priority: 'medium',
        suggestion: s
      })));
    }
    
    return suggestions;
  }

  async saveAnalysisReport(analysis) {
    const reportPath = path.join(
      this.config.pluginAnalysisDir,
      `${path.basename(analysis.pluginPath, '.js')}-analysis.json`
    );
    
    await writeFile(reportPath, JSON.stringify(analysis, null, 2));
    
    // Generate readable report
    const readableReport = this.generateReadableReport(analysis);
    const readablePath = path.join(
      this.config.pluginAnalysisDir,
      `${path.basename(analysis.pluginPath, '.js')}-report.md`
    );
    
    await writeFile(readablePath, readableReport);
  }

  generateReadableReport(analysis) {
    const { structure, patterns, performance, compatibility, suggestions } = analysis;
    
    return `# Plugin Analysis Report

**Plugin:** ${path.basename(analysis.pluginPath)}  
**Analyzed:** ${new Date(analysis.timestamp).toLocaleString()}

## Structure

- **Classes:** ${structure.classes.map(c => c.name).join(', ') || 'None'}
- **Methods:** ${structure.methods.length} methods
- **Events:** ${structure.events.length} events
- **Imports:** ${structure.imports.length} imports

### Methods
${structure.methods.map(m => `- ${m}()`).join('\n')}

### Events
${structure.events.map(e => `- ${e}`).join('\n') || 'No events emitted'}

## Pattern Analysis

${patterns?.length > 0 ? patterns.map(p => `### ${p.pattern}
- **Score:** ${(p.score * 100).toFixed(0)}%
- **Matched Methods:** ${p.matchedMethods.join(', ')}`).join('\n\n') : 'No standard patterns detected'}

## Performance Analysis

${performance ? `### Issues
${performance.issues.map(i => `- **${i.type}** (${i.severity}): ${i.message}`).join('\n') || 'No issues found'}

### Metrics
- **Async Methods:** ${performance.metrics.asyncMethods}
- **Event Emissions:** ${performance.metrics.eventEmissions}
- **Cyclomatic Complexity:** ${performance.metrics.cyclomaticComplexity}` : 'Performance analysis not performed'}

## Compatibility

- **Minimum Node Version:** ${compatibility?.nodeVersion || 'Unknown'}
- **ES Modules:** ${compatibility?.esModules ? 'Yes' : 'No'}
- **External Dependencies:** ${compatibility?.dependencies.join(', ') || 'None'}

${compatibility?.issues.length > 0 ? `### Issues
${compatibility.issues.map(i => `- ${i.message}`).join('\n')}` : ''}

## Suggestions

${suggestions?.map(s => `### ${s.suggestion} (${s.priority} priority)
${s.code ? `\`\`\`javascript\n${s.code}\n\`\`\`` : ''}
${s.examples ? `Examples: ${s.examples.join(', ')}` : ''}
${s.patterns ? `Consider: ${s.patterns.join(', ')}` : ''}`).join('\n\n') || 'No suggestions'}`;
  }

  async suggestImprovements(pluginPath) {
    const analysis = await this.analyzePlugin(pluginPath);
    return analysis.suggestions;
  }

  async refactorPlugin(pluginPath, improvements = []) {
    console.log(`🔧 Refactoring plugin: ${pluginPath}`);
    
    // Read current plugin
    const originalCode = await readFile(pluginPath, 'utf8');
    
    // Apply improvements
    let refactoredCode = originalCode;
    
    for (const improvement of improvements) {
      refactoredCode = await this.applyImprovement(refactoredCode, improvement);
    }
    
    // Format code
    refactoredCode = this.formatCode(refactoredCode);
    
    // Create backup
    const backupPath = `${pluginPath}.backup`;
    await writeFile(backupPath, originalCode);
    
    // Write refactored code
    await writeFile(pluginPath, refactoredCode);
    
    console.log(`✅ Plugin refactored. Backup saved at ${backupPath}`);
    
    return {
      original: originalCode,
      refactored: refactoredCode,
      improvements: improvements.length,
      backupPath
    };
  }

  async applyImprovement(code, improvement) {
    // This would apply specific improvements based on type
    // For now, just a placeholder
    return code;
  }

  formatCode(code) {
    // Basic code formatting
    // In production, would use prettier or similar
    return code
      .replace(/\s*{\s*/g, ' {\n  ')
      .replace(/\s*}\s*/g, '\n}\n')
      .replace(/;\s*/g, ';\n')
      .trim();
  }

  // Helper methods
  toClassName(name) {
    return name
      .split(/[\s\-_]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('') + 'Plugin';
  }

  toKebabCase(name) {
    return name
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  createCustomPattern(features) {
    return {
      name: 'Custom Pattern',
      description: 'Custom pattern based on features',
      structure: {
        required: ['initialize', 'cleanup'],
        optional: features,
        events: []
      }
    };
  }

  parseConfiguration(configStr) {
    // Simple config parsing - in production would use proper AST parsing
    const config = {};
    const lines = configStr.split('\n');
    
    for (const line of lines) {
      const match = line.match(/^\s*(\w+):\s*(.+?),?\s*$/);
      if (match) {
        const [, key, value] = match;
        try {
          config[key] = JSON.parse(value);
        } catch (e) {
          config[key] = value.replace(/['"]/g, '');
        }
      }
    }
    
    return config;
  }

  generateUsageExample(structure) {
    const mainMethod = structure.methods.find(m => 
      ['process', 'execute', 'run', 'transform'].includes(
        typeof m === 'object' ? m.name : m
      )
    );
    
    if (mainMethod) {
      const methodName = typeof mainMethod === 'object' ? mainMethod.name : mainMethod;
      return `const result = await plugin.${methodName}(data);`;
    }
    
    return '// Use plugin methods';
  }

  generateExampleUsage(structure) {
    return this.generateUsageExample(structure);
  }

  generateAdvancedUsage(structure) {
    const examples = [];
    
    if (structure.config.features?.includes('queue')) {
      examples.push(`// Queue multiple items
for (const item of items) {
  await plugin.enqueue(item);
}`);
    }
    
    if (structure.config.features?.includes('caching')) {
      examples.push(`// Use caching
const cached = plugin.getCached('key');
if (!cached) {
  const result = await plugin.process(data);
  plugin.setCached('key', result);
}`);
    }
    
    return examples.join('\n    \n    ');
  }

  generateConfigurationDocs(config) {
    if (!config.defaults) {
      return 'No configuration options available.';
    }
    
    return Object.entries(config.defaults)
      .map(([key, value]) => `- \`${key}\` - ${typeof value} (default: \`${JSON.stringify(value)}\`)`)
      .join('\n');
  }

  getMethodDescription(methodName) {
    const descriptions = {
      initialize: 'Initialize the plugin and its resources.',
      cleanup: 'Clean up resources and prepare for shutdown.',
      process: 'Process data according to plugin logic.',
      validate: 'Validate input data.',
      transform: 'Transform data from one format to another.',
      analyze: 'Analyze data and return results.',
      connect: 'Establish connection to external service.',
      disconnect: 'Close connection to external service.'
    };
    
    return descriptions[methodName] || `Execute ${methodName} operation.`;
  }

  getEventDescription(event) {
    const descriptions = {
      'initialized': 'Emitted when plugin is successfully initialized.',
      'error': 'Emitted when an error occurs.',
      'cleanup': 'Emitted when cleanup is complete.',
      'data:processed': 'Emitted when data processing is complete.',
      'connection:established': 'Emitted when connection is established.',
      'process:start': 'Emitted when processing starts.',
      'process:complete': 'Emitted when processing completes.'
    };
    
    return descriptions[event] || `Emitted on ${event} event.`;
  }

  generateBestPractices(structure) {
    const practices = [
      '1. Always initialize the plugin before use',
      '2. Handle errors gracefully and emit error events',
      '3. Clean up resources when done',
      '4. Use event emissions for better integration'
    ];
    
    if (structure.config.features?.includes('caching')) {
      practices.push('5. Configure appropriate cache timeouts');
    }
    
    if (structure.config.features?.includes('queue')) {
      practices.push('5. Monitor queue size to prevent memory issues');
    }
    
    return practices.join('\n');
  }

  generateTroubleshooting(structure) {
    return `### Common Issues

1. **Plugin not initialized error**
   - Ensure you call \`await plugin.initialize()\` before using other methods

2. **Resource cleanup issues**
   - Always call \`await plugin.cleanup()\` when done
   - Use try/finally blocks to ensure cleanup

3. **Memory leaks**
   - Remove event listeners when no longer needed
   - Clear caches periodically if using caching feature

4. **Performance issues**
   - Check configuration values
   - Monitor resource usage with \`getStatus()\``;
  }

  async saveGeneratedPlugin(pluginPackage) {
    const pluginDir = path.join(
      this.config.pluginTemplatesDir,
      'generated',
      pluginPackage.name
    );
    
    await mkdir(pluginDir, { recursive: true });
    
    // Save all files
    for (const [filePath, content] of Object.entries(pluginPackage.files)) {
      if (content) {
        const fullPath = path.join(pluginDir, filePath);
        await mkdir(path.dirname(fullPath), { recursive: true });
        await writeFile(fullPath, content);
      }
    }
    
    // Save metadata
    const metadataPath = path.join(pluginDir, '.plugin-metadata.json');
    await writeFile(metadataPath, JSON.stringify(pluginPackage.metadata, null, 2));
    
    console.log(`💾 Plugin saved to ${pluginDir}`);
  }

  async getStats() {
    return {
      patterns: this.pluginPatterns.size,
      knowledgeBase: this.knowledgeBase.size,
      generatedPlugins: this.generatedPlugins.length,
      cachedAnalyses: this.analysisCache.size
    };
  }

  async cleanup() {
    this.pluginPatterns.clear();
    this.knowledgeBase.clear();
    this.generatedPlugins = [];
    this.analysisCache.clear();
    this.removeAllListeners();
    
    console.log('🤖 Assistant Plugins Plugin cleaned up');
  }
}

export default AssistantPluginsPlugin;