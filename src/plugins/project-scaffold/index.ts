/**
 * Project Scaffold Plugin
 * Template-based project creation and scaffolding
 */

import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import { copyFile, mkdir, readdir, readFile, rm, writeFile } from 'fs/promises';
import path from 'path';

export class ProjectScaffoldPlugin extends EventEmitter {
  constructor(config = {}): any {
    super();
    this.config = {templatesDir = new Map();
    this.templateCache = new Map();
    this.generatedProjects = [];
    this.placeholderRegex = /\{\{([^}]+)\}\}/g;
    this.conditionalRegex = /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    this.loopRegex = /\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
  }

  async initialize() {
    console.warn('🏗️ Project Scaffold Plugin initialized');

    // Create directories
    await mkdir(this.config.templatesDir, { recursive = {name = require('express');
    const cors = require('cors');
    const helmet = require('helmet');
    const morgan = require('morgan');
    const routes = require('./routes');

    const app = express();
    const PORT = process.env.PORT || 3000;

    // Middleware
    app.use(helmet());
    app.use(cors());
    app.use(morgan('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended => {
  console.error(err.stack);
    res.status(500).send('Something broke!');
  }
  )

  // Start server
  app;
  .
  listen(PORT, ()
  => {
  console;
  .
  warn(\`Server is running on port \${PORT}\`);
}
)

module.exports = app;
`,encoding = require('express');
const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status => {
  const { name } = req.params;
  res.json({message = router;`,
  (encoding = development);
(PORT = 3000`,encoding = "en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="{{description}}" />
    <title>{{projectName}}</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`),
  (encoding = ReactDOM.createRoot(document.getElementById('root')));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,encoding = "App">
      <header className="App-header">
        <h1>Welcome to {{projectName}}</h1>
        <p>{{description}}</p>
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
      </header>
    </div>
  );
}

export default App;`,
            encoding = {preset = {parser = (name): string => {
  return \`Hello, \${name}!\`;
};`,
            encoding = {}): any 
    this.config = config;

  // Add your methods here
}`,
            encoding => {
  it('should greet correctly', () => {
    expect(hello('World')).toBe('Hello, World!');
})
})
`,encoding = new {{className}}({debug = production

# Copy application files
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Expose port
EXPOSE {{port}}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \\
  CMD node healthcheck.js

# Start application
CMD ["node", "src/index.js"]`,
  (encoding = require('express'));
const pino = require('pino');

const app = express();
const logger = pino({transport = process.env.PORT || {{port}};

// Middleware
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  logger.info({ method => {
  res.json({
    status => {
  // Add readiness checks here (DB connection, etc.)
  res.json({ ready => {
  res.json({
    message => {
  logger.error(err);
  res.status(500).json({ error => {
  logger.info(\`{{serviceName}} is running on port \${PORT}\`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received => {
    logger.info('HTTP server closed');
  process.exit(0);
});
})
`,encoding = require('http');

const options = {host = http.request(options, (res) => {
  if(res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', () => {
  process.exit(1);
});

request.end();`,
  (encoding = development);
PORT = { {port };
}`,
            encoding =
{
}
): any
{
  this.config = {enabled = false;
}

async;
initialize();
{
    console.warn('🔌 {{pluginName}} Plugin initialized');#if hasDatabase
    await this.initializeDatabase();/if}}#if hasAPI
    await this.initializeAPI();/if}}
    
    this.initialized = true;#if hasDatabase
  async initializeDatabase() 
    // Initialize database connection
    console.warn('📊 Database initialized');{/if}}#if hasAPI
  async initializeAPI() 
    // Initialize API client
    console.warn('🌐 API client initialized');/if}}

  // Plugin methods
  async execute(options = {}): any 
    if(!this.initialized) {
      throw new Error('Plugin not initialized');
    }
    
    // Implement your plugin logic here
    console.warn('Executing {{pluginName}} withoptions = false;
    console.warn('🔌 {{pluginName}} Plugin cleaned up');

export default {{className}Plugin;`,encoding = new {{className}}Plugin({
  // Configuration options
});

await plugin.initialize();

const result = await plugin.execute({
  // Execution options
});
\`\`\`

## Configuration

- \`enabled\` - Enable/disable the plugin(default => {
  let plugin;

  beforeEach(() => {
    plugin = new {{className}}Plugin();
  });

  afterEach(async () => {
    if(plugin.initialized) {
      await plugin.cleanup();
    }
  });

  test('should initialize successfully', async () => {
    await plugin.initialize();
    expect(plugin.initialized).toBe(true);
  });

  test('should execute successfully', async () => {
    await plugin.initialize();
    const result = await plugin.execute();
    expect(result.success).toBe(true);
  });

  test('should return status', async () => {
    await plugin.initialize();
    const status = await plugin.getStatus();
    expect(status.initialized).toBe(true);
    expect(status.enabled).toBe(true);
  });

  test('should throw error if not initialized', async () => {
    await expect(plugin.execute()).rejects.toThrow('Plugin not initialized');
  });
});`,encoding = await readdir(this.config.customTemplatesDir, {withFileTypes = path.join(this.config.customTemplatesDir, entry.name);
          const template = await this.loadTemplateFromDirectory(templatePath);
          
          if(template) {
            this.templates.set(entry.name, { ...template,id = path.join(templatePath, 'template.json');
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
      
      // Load file mappings
      const files = {};
      if(manifest.files) {
        for (const [targetPath, sourcePath] of Object.entries(manifest.files)) {
          const fullPath = path.join(templatePath, sourcePath);
          const content = await readFile(fullPath, 'utf8');
          files[targetPath] = { content,encoding = path.join(this.config.templatesDir, 'registry.json');
      const registry = JSON.parse(await readFile(registryPath, 'utf8'));
      
      // Merge remote templates into registry
      for (const [id, template] of Object.entries(registry.templates || {})) {
        if (!this.templates.has(id)) {
          this.templates.set(id, { ...template, id, source = {}, options = {}): any {
    const template = this.templates.get(templateId);
    if(!template) {
      throw new Error(`Template '${templateId}' not found`);
    }

    console.warn(`🏗️ Generating project fromtemplate = await this.processVariables(template, variables);
    
    // Determine output directory
    const outputDir = options.outputDir || 
                     path.join(this.config.outputDir, processedVars.projectName || processedVars.serviceName || 'new-project');
    
    try {
      // Create output directory
      await mkdir(outputDir, {recursive = await this.generateFiles(template, processedVars, outputDir);
      
      // Run post-generate commands
      if(template.postGenerate && !options.skipPostGenerate) {
        await this.runPostGenerateCommands(template.postGenerate, outputDir);
      }
      
      // Initialize git repository
      if(this.config.gitInit && !options.skipGit) {
        await this.initializeGit(outputDir);
      }
      
      // Install dependencies
      if(this.config.npmInstall && !options.skipInstall) {
        await this.installDependencies(outputDir);
      }
      
      // Record generated project

    // Process template variables
    for (const [key, varDef] of Object.entries(template.variables || {})) {
      let value = providedVars[key];
      
      // Use default if not provided
      if(value === undefined && varDef.default !== undefined) {
        value = varDef.default;
      }
      
      // Process template references in defaults
      if (typeof value === 'string' && value.includes('{{')) {
        value = this.processTemplate(value, processed);
      }
      
      // Validate required variables
      if(varDef.required && value === undefined) {
        if(this.config.interactive) {
          // In interactive mode, use default or placeholder
          value = varDef.default || `<${key}>`;
          console.warn(`Using default value '${value}' for required variable '${key}'`);
        } else {
          throw new Error(`Required variable '${key}' not provided`);
        }
      }
      
      // Type conversion
      if(value !== undefined) {
        switch(varDef.type) {
          case 'number':
            value = Number(value);
            break;
          case 'boolean':
            value = Boolean(value);
            break;
          case 'array':
            if(typeof value === 'string') {
              value = value.split(',').map(s => s.trim());
            }
            break;
        }
      }
      
      processed[key] = value;
    }
    
    // Add computed variables
    processed.year = new Date().getFullYear();
    processed.date = new Date().toISOString().split('T')[0];
    
    return processed;
  }

  async generateFiles(template, variables, outputDir): any {
    const generatedFiles = [];
    
    for (const [filePath, fileConfig] of Object.entries(template.files || {})) {
      // Process file path template
      const processedPath = this.processTemplate(filePath, variables);
      const fullPath = path.join(outputDir, processedPath);
      
      // Create directory if needed
      await mkdir(path.dirname(fullPath), {recursive = fileConfig.content;
      
      // Process conditionals
      content = this.processConditionals(content, variables);
      
      // Process loops
      content = this.processLoops(content, variables);
      
      // Process variables
      content = this.processTemplate(content, variables);
      
      // Write file
      await writeFile(fullPath, content, fileConfig.encoding || 'utf8');
      
      generatedFiles.push({
        path => {
      const parts = expression.trim().split('|');
      let value = this.evaluateExpression(parts[0].trim(), variables);
      
      // Apply filters
      for(const i = 1; i < parts.length; i++) {
        const filter = parts[i].trim();
        value = this.applyFilter(value, filter);
      }
      
      return value !== undefined ? String(value) : match;
    });
  }

  processConditionals(template, variables): any {
    return template.replace(this.conditionalRegex, (match, condition, content) => {
      const result = this.evaluateExpression(condition.trim(), variables);
      return result ? content => {
      const array = this.evaluateExpression(expression.trim(), variables);
      if (!Array.isArray(array)) return '';
      
      return array.map((item, index) => {
        const loopVars = { ...variables, item, index };
        return this.processTemplate(content, loopVars);
      }).join('');
    });
  }

  evaluateExpression(expression, variables): any {
    // Handle JSON special case
    if (expression.startsWith('json ')) {
      const varName = expression.substring(5);
      const value = this.evaluateExpression(varName, variables);
      return JSON.stringify(value);
    }
    
    // Simple variable lookup (no eval for security)
    const parts = expression.split('.');
    let value = variables;
    
    for(const part of parts) {
      if(value && typeof value === 'object') {
        value = value[part];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  applyFilter(value, filter): any 
    switch(filter) {
      case 'uppercase':
        return String(value).toUpperCase();
      case 'lowercase':
        return String(value).toLowerCase();
      case 'capitalize':
        return String(value).charAt(0).toUpperCase() + String(value).slice(1);
      case 'pascalCase':
        return String(value)
          .split(/[\s\-_]+/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join('');
      case 'camelCase': {
        const pascal = this.applyFilter(value, 'pascalCase');
        return pascal.charAt(0).toLowerCase() + pascal.slice(1);
      }
      case 'kebabCase':
        return String(value)
          .split(/[\s_]+/)
          .join('-')
          .toLowerCase();
      case 'snakeCase':
        return String(value)
          .split(/[\s-]+/)
          .join('_')
          .toLowerCase();
      default = {}): any {
    return new Promise((resolve, reject) => {
      const [cmd, ...args] = command.split(' ');
      const child = spawn(cmd, args, {
        ...options,
        shell => {
        if(code === 0) {
          resolve();
        } else {
          reject(new Error(`Command exited with code ${code}`));
        }
      });
      
      child.on('error', reject);
    });

  async listTemplates(options = {}): any {
    const templates = Array.from(this.templates.values());
    
    // Filter by category
    if(options.category) {
      return templates.filter(t => t.category === options.category);
    }
    
    // Filter by source
    if(options.source) {
      return templates.filter(t => t.source === options.source);
    }
    
    // Group by category
    if(options.grouped) {
      const grouped = {};
      for(const template of templates) {
        const category = template.category || 'other';
        if(!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(template);
      }
      return grouped;
    }
    
    return templates;
  }

  async createCustomTemplate(name, fromProject, options = {}): any {
    const templateDir = path.join(this.config.customTemplatesDir, name);
    
    // Create template directory
    await mkdir(templateDir, {recursive = await this.scanProjectFiles(fromProject, options.ignore || []);
    
    // Create template manifest
    const manifest = {name = path.relative(fromProject, file);
      const templatePath = `files/${relativePath}`;
      
      // Copy file to template
      const targetPath = path.join(templateDir, templatePath);
      await mkdir(path.dirname(targetPath), {recursive = templatePath;
    }
    
    // Save manifest
    await writeFile(
      path.join(templateDir, 'template.json'),
      JSON.stringify(manifest, null, 2)
    );
    
    // Reload templates
    const template = await this.loadTemplateFromDirectory(templateDir);
    if(template) {
      this.templates.set(name, { ...template,id = []): any {

    const { glob } = await import('glob');
    const files = await glob('**/*', {
      cwd = {}): any {
    if (source.startsWith('github = {}): any {
    console.warn(`📥 Importing template fromGitHub = path.join(this.config.templatesDir, '.temp', Date.now().toString());
    await mkdir(tempDir, {recursive = await this.loadTemplateFromDirectory(tempDir);
      if(!template) {
        throw new Error('No valid template found in repository');
      }
      
      // Save to custom templates
      const templateId = options.name || path.basename(repo);
      await this.createCustomTemplate(templateId, tempDir, {
        ...options,
        name = {}): any {
    console.warn(`📥 Importing template fromNPM = path.join(this.config.templatesDir, '.temp', Date.now().toString());
    await mkdir(tempDir, {recursive = path.join(tempDir, 'node_modules', packageName);
      const template = await this.loadTemplateFromDirectory(packageDir);
      
      if(!template) {
        throw new Error('No valid template found in package');
      }
      
      // Save to custom templates
      const templateId = options.name || packageName;
      await this.createCustomTemplate(templateId, packageDir, {
        ...options,name = Array.from(this.templates.values());
    
    return {totalTemplates = > t.source === 'builtin').length,custom = > t.source === 'custom').length,registry = > t.source === 'registry').length
      },
      byCategory => {
        const category = t.category || 'other';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {}),generatedProjects = [];
    this.removeAllListeners();
    
    console.warn('🏗️ Project Scaffold Plugin cleaned up');
  }
}

export default ProjectScaffoldPlugin;
