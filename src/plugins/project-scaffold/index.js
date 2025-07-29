/**
 * Project Scaffold Plugin
 * Template-based project creation and scaffolding
 */

import { readFile, writeFile, mkdir, readdir, copyFile, rm } from 'fs/promises';
import path from 'path';
import { EventEmitter } from 'events';
import { spawn } from 'child_process';

export class ProjectScaffoldPlugin extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      templatesDir: path.join(process.cwd(), '.hive-mind', 'templates'),
      customTemplatesDir: path.join(process.cwd(), '.templates'),
      outputDir: process.cwd(),
      defaultValues: {
        author: process.env.USER || 'Claude Zen Developer',
        license: 'MIT',
        version: '0.1.0',
        nodeVersion: process.version
      },
      gitInit: true,
      npmInstall: true,
      interactive: false,
      templateSources: [
        'builtin',
        'custom',
        'github',
        'npm'
      ],
      ...config
    };
    
    this.templates = new Map();
    this.templateCache = new Map();
    this.generatedProjects = [];
    this.placeholderRegex = /\{\{([^}]+)\}\}/g;
    this.conditionalRegex = /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    this.loopRegex = /\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
  }

  async initialize() {
    console.log('🏗️ Project Scaffold Plugin initialized');
    
    // Create directories
    await mkdir(this.config.templatesDir, { recursive: true });
    await mkdir(this.config.customTemplatesDir, { recursive: true });
    
    // Load built-in templates
    await this.loadBuiltInTemplates();
    
    // Load custom templates
    await this.loadCustomTemplates();
    
    // Load template registry
    await this.loadTemplateRegistry();
  }

  async loadBuiltInTemplates() {
    const builtInTemplates = {
      'node-basic': {
        name: 'Basic Node.js Project',
        description: 'A minimal Node.js project with package.json',
        category: 'backend',
        files: {
          'package.json': {
            content: `{
  "name": "{{projectName}}",
  "version": "{{version}}",
  "description": "{{description}}",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "keywords": {{json keywords}},
  "author": "{{author}}",
  "license": "{{license}}"
}`,
            encoding: 'utf8'
          },
          'index.js': {
            content: `console.log('Hello from {{projectName}}!');`,
            encoding: 'utf8'
          },
          '.gitignore': {
            content: `node_modules/
.env
.DS_Store
coverage/
dist/`,
            encoding: 'utf8'
          },
          'README.md': {
            content: `# {{projectName}}

{{description}}

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`bash
npm start
\`\`\`

## License

{{license}}`,
            encoding: 'utf8'
          }
        },
        variables: {
          projectName: { type: 'string', prompt: 'Project name', required: true },
          description: { type: 'string', prompt: 'Project description', default: 'A new Node.js project' },
          keywords: { type: 'array', prompt: 'Keywords (comma-separated)', default: [] },
          author: { type: 'string', prompt: 'Author name', default: '{{author}}' },
          license: { type: 'string', prompt: 'License', default: 'MIT' },
          version: { type: 'string', prompt: 'Initial version', default: '0.1.0' }
        }
      },

      'express-api': {
        name: 'Express REST API',
        description: 'Express.js REST API with routing and middleware',
        category: 'backend',
        files: {
          'package.json': {
            content: `{
  "name": "{{projectName}}",
  "version": "{{version}}",
  "description": "{{description}}",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest",
    "lint": "eslint src/"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0",
    "jest": "^29.0.0",
    "supertest": "^6.3.0",
    "eslint": "^8.0.0"
  },
  "author": "{{author}}",
  "license": "{{license}}"
}`,
            encoding: 'utf8'
          },
          'src/server.js': {
            content: `require('dotenv').config();
const express = require('express');
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
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
  console.log(\`Server is running on port \${PORT}\`);
});

module.exports = app;`,
            encoding: 'utf8'
          },
          'src/routes/index.js': {
            content: `const express = require('express');
const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Example route
router.get('/hello/:name', (req, res) => {
  const { name } = req.params;
  res.json({ message: \`Hello, \${name}!\` });
});

module.exports = router;`,
            encoding: 'utf8'
          },
          '.env.example': {
            content: `NODE_ENV=development
PORT=3000`,
            encoding: 'utf8'
          },
          '.gitignore': {
            content: `node_modules/
.env
.DS_Store
coverage/
dist/
*.log`,
            encoding: 'utf8'
          },
          'README.md': {
            content: `# {{projectName}}

{{description}}

## Setup

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Copy \`.env.example\` to \`.env\`:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

3. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## API Endpoints

- \`GET /api/health\` - Health check
- \`GET /api/hello/:name\` - Example endpoint

## Scripts

- \`npm start\` - Start production server
- \`npm run dev\` - Start development server with hot reload
- \`npm test\` - Run tests
- \`npm run lint\` - Run ESLint

## License

{{license}}`,
            encoding: 'utf8'
          }
        },
        variables: {
          projectName: { type: 'string', prompt: 'Project name', required: true },
          description: { type: 'string', prompt: 'Project description', default: 'Express REST API' },
          author: { type: 'string', prompt: 'Author name', default: '{{author}}' },
          license: { type: 'string', prompt: 'License', default: 'MIT' },
          version: { type: 'string', prompt: 'Initial version', default: '0.1.0' }
        },
        postGenerate: ['npm install']
      },

      'react-app': {
        name: 'React Application',
        description: 'Modern React app with hooks and functional components',
        category: 'frontend',
        files: {
          'package.json': {
            content: `{
  "name": "{{projectName}}",
  "version": "{{version}}",
  "description": "{{description}}",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}`,
            encoding: 'utf8'
          },
          'public/index.html': {
            content: `<!DOCTYPE html>
<html lang="en">
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
</html>`,
            encoding: 'utf8'
          },
          'src/index.js': {
            content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
            encoding: 'utf8'
          },
          'src/App.js': {
            content: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
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
            encoding: 'utf8'
          },
          'src/App.css': {
            content: `.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
}

.App-header code {
  background-color: #1a1d23;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
}`,
            encoding: 'utf8'
          },
          'src/index.css': {
            content: `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}`,
            encoding: 'utf8'
          },
          '.gitignore': {
            content: `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*`,
            encoding: 'utf8'
          },
          'README.md': {
            content: `# {{projectName}}

{{description}}

## Available Scripts

In the project directory, you can run:

### \`npm start\`

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### \`npm test\`

Launches the test runner in the interactive watch mode.

### \`npm run build\`

Builds the app for production to the \`build\` folder.

### \`npm run eject\`

**Note: this is a one-way operation. Once you \`eject\`, you can't go back!**

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).`,
            encoding: 'utf8'
          }
        },
        variables: {
          projectName: { type: 'string', prompt: 'Project name', required: true },
          description: { type: 'string', prompt: 'Project description', default: 'A React application' },
          version: { type: 'string', prompt: 'Initial version', default: '0.1.0' }
        }
      },

      'typescript-lib': {
        name: 'TypeScript Library',
        description: 'TypeScript library with build setup and testing',
        category: 'library',
        files: {
          'package.json': {
            content: `{
  "name": "{{projectName}}",
  "version": "{{version}}",
  "description": "{{description}}",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "jest",
    "lint": "eslint src --ext .ts",
    "prepublishOnly": "npm run build"
  },
  "keywords": {{json keywords}},
  "author": "{{author}}",
  "license": "{{license}}",
  "devDependencies": {
    "@types/jest": "^29.0.0",
    "@types/node": "^20.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "jest": "^29.0.0",
    "ts-jest": "^29.0.0",
    "typescript": "^5.0.0"
  }
}`,
            encoding: 'utf8'
          },
          'tsconfig.json': {
            content: `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}`,
            encoding: 'utf8'
          },
          'jest.config.js': {
            content: `module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts'
  ]
};`,
            encoding: 'utf8'
          },
          '.eslintrc.js': {
            content: `module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
  }
};`,
            encoding: 'utf8'
          },
          'src/index.ts': {
            content: `export * from './lib';

// Example export
export const hello = (name: string): string => {
  return \`Hello, \${name}!\`;
};`,
            encoding: 'utf8'
          },
          'src/lib.ts': {
            content: `/**
 * {{projectName}}
 * {{description}}
 */

export interface Config {
  // Add your configuration options here
  debug?: boolean;
}

export class {{className}} {
  private config: Config;

  constructor(config: Config = {}) {
    this.config = config;
  }

  // Add your methods here
}`,
            encoding: 'utf8'
          },
          'src/__tests__/index.test.ts': {
            content: `import { hello } from '../index';

describe('{{projectName}}', () => {
  it('should greet correctly', () => {
    expect(hello('World')).toBe('Hello, World!');
  });
});`,
            encoding: 'utf8'
          },
          '.gitignore': {
            content: `node_modules/
dist/
coverage/
.env
.DS_Store
*.log
*.tsbuildinfo`,
            encoding: 'utf8'
          },
          'README.md': {
            content: `# {{projectName}}

{{description}}

## Installation

\`\`\`bash
npm install {{projectName}}
\`\`\`

## Usage

\`\`\`typescript
import { {{className}} } from '{{projectName}}';

const instance = new {{className}}({
  debug: true
});

// Use the library
\`\`\`

## Development

\`\`\`bash
# Install dependencies
npm install

# Run tests
npm test

# Build the library
npm run build

# Run in watch mode
npm run dev
\`\`\`

## License

{{license}}`,
            encoding: 'utf8'
          }
        },
        variables: {
          projectName: { type: 'string', prompt: 'Project name', required: true },
          description: { type: 'string', prompt: 'Project description', default: 'A TypeScript library' },
          className: { type: 'string', prompt: 'Main class name', default: '{{projectName|pascalCase}}' },
          keywords: { type: 'array', prompt: 'Keywords (comma-separated)', default: ['typescript', 'library'] },
          author: { type: 'string', prompt: 'Author name', default: '{{author}}' },
          license: { type: 'string', prompt: 'License', default: 'MIT' },
          version: { type: 'string', prompt: 'Initial version', default: '0.1.0' }
        }
      },

      'microservice': {
        name: 'Microservice',
        description: 'Dockerized microservice with health checks and logging',
        category: 'backend',
        files: {
          'package.json': {
            content: `{
  "name": "{{serviceName}}",
  "version": "{{version}}",
  "description": "{{description}}",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest",
    "docker:build": "docker build -t {{serviceName}} .",
    "docker:run": "docker run -p {{port}}:{{port}} {{serviceName}}"
  },
  "dependencies": {
    "express": "^4.18.0",
    "pino": "^8.0.0",
    "pino-pretty": "^10.0.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0",
    "jest": "^29.0.0",
    "supertest": "^6.3.0"
  }
}`,
            encoding: 'utf8'
          },
          'Dockerfile': {
            content: `FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

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
            encoding: 'utf8'
          },
          'docker-compose.yml': {
            content: `version: '3.8'

services:
  {{serviceName}}:
    build: .
    ports:
      - "{{port}}:{{port}}"
    environment:
      NODE_ENV: production
      PORT: {{port}}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "healthcheck.js"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s`,
            encoding: 'utf8'
          },
          'src/index.js': {
            content: `require('dotenv').config();
const express = require('express');
const pino = require('pino');

const app = express();
const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
});

const PORT = process.env.PORT || {{port}};

// Middleware
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  logger.info({ method: req.method, url: req.url }, 'Request received');
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: '{{serviceName}}',
    version: '{{version}}',
    timestamp: new Date().toISOString()
  });
});

// Readiness check
app.get('/ready', (req, res) => {
  // Add readiness checks here (DB connection, etc.)
  res.json({ ready: true });
});

// Main endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to {{serviceName}}',
    version: '{{version}}'
  });
});

// Error handling
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  logger.info(\`{{serviceName}} is running on port \${PORT}\`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});`,
            encoding: 'utf8'
          },
          'healthcheck.js': {
            content: `const http = require('http');

const options = {
  host: 'localhost',
  port: process.env.PORT || {{port}},
  path: '/health',
  timeout: 2000
};

const request = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', () => {
  process.exit(1);
});

request.end();`,
            encoding: 'utf8'
          },
          '.dockerignore': {
            content: `node_modules
npm-debug.log
.env
.git
.gitignore
README.md
.eslintrc
.prettierrc
coverage
.nyc_output`,
            encoding: 'utf8'
          },
          '.env.example': {
            content: `NODE_ENV=development
PORT={{port}}`,
            encoding: 'utf8'
          },
          'README.md': {
            content: `# {{serviceName}}

{{description}}

## Quick Start

### Local Development

\`\`\`bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run in development mode
npm run dev
\`\`\`

### Docker

\`\`\`bash
# Build image
npm run docker:build

# Run container
npm run docker:run

# Or use docker-compose
docker-compose up
\`\`\`

## API Endpoints

- \`GET /\` - Service info
- \`GET /health\` - Health check
- \`GET /ready\` - Readiness check

## Environment Variables

- \`NODE_ENV\` - Environment (development/production)
- \`PORT\` - Service port (default: {{port}})

## License

{{license}}`,
            encoding: 'utf8'
          }
        },
        variables: {
          serviceName: { type: 'string', prompt: 'Service name', required: true },
          description: { type: 'string', prompt: 'Service description', default: 'Microservice' },
          port: { type: 'number', prompt: 'Service port', default: 3000 },
          version: { type: 'string', prompt: 'Initial version', default: '0.1.0' },
          license: { type: 'string', prompt: 'License', default: 'MIT' }
        }
      },

      'claude-zen-plugin': {
        name: 'Claude Zen Plugin',
        description: 'Plugin template for Claude Zen system',
        category: 'plugin',
        files: {
          'index.js': {
            content: `/**
 * {{pluginName}} Plugin
 * {{description}}
 */

export class {{className}}Plugin {
  constructor(config = {}) {
    this.config = {
      enabled: true,
      ...config
    };
    
    this.initialized = false;
  }

  async initialize() {
    console.log('🔌 {{pluginName}} Plugin initialized');
    
    // Initialize your plugin here
    {{#if hasDatabase}}
    await this.initializeDatabase();
    {{/if}}
    
    {{#if hasAPI}}
    await this.initializeAPI();
    {{/if}}
    
    this.initialized = true;
  }

  {{#if hasDatabase}}
  async initializeDatabase() {
    // Initialize database connection
    console.log('📊 Database initialized');
  }
  {{/if}}

  {{#if hasAPI}}
  async initializeAPI() {
    // Initialize API client
    console.log('🌐 API client initialized');
  }
  {{/if}}

  // Plugin methods
  async execute(options = {}) {
    if (!this.initialized) {
      throw new Error('Plugin not initialized');
    }
    
    // Implement your plugin logic here
    console.log('Executing {{pluginName}} with options:', options);
    
    return {
      success: true,
      result: 'Plugin executed successfully'
    };
  }

  async getStatus() {
    return {
      initialized: this.initialized,
      enabled: this.config.enabled,
      // Add more status information
    };
  }

  async cleanup() {
    // Clean up resources
    {{#if hasDatabase}}
    // Close database connections
    {{/if}}
    
    {{#if hasAPI}}
    // Clean up API resources
    {{/if}}
    
    this.initialized = false;
    console.log('🔌 {{pluginName}} Plugin cleaned up');
  }
}

export default {{className}}Plugin;`,
            encoding: 'utf8'
          },
          'package.json': {
            content: `{
  "name": "@claude-zen/plugin-{{pluginName|kebabCase}}",
  "version": "{{version}}",
  "description": "{{description}}",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "test": "jest"
  },
  "keywords": ["claude-zen", "plugin", "{{pluginName|kebabCase}}"],
  "author": "{{author}}",
  "license": "{{license}}",
  "peerDependencies": {
    "@claude-zen/core": "^1.0.0"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  }
}`,
            encoding: 'utf8'
          },
          'README.md': {
            content: `# {{pluginName}} Plugin

{{description}}

## Installation

\`\`\`bash
npm install @claude-zen/plugin-{{pluginName|kebabCase}}
\`\`\`

## Usage

\`\`\`javascript
import { {{className}}Plugin } from '@claude-zen/plugin-{{pluginName|kebabCase}}';

const plugin = new {{className}}Plugin({
  // Configuration options
});

await plugin.initialize();

const result = await plugin.execute({
  // Execution options
});
\`\`\`

## Configuration

- \`enabled\` - Enable/disable the plugin (default: true)
{{#if hasDatabase}}
- \`database\` - Database configuration
{{/if}}
{{#if hasAPI}}
- \`apiUrl\` - API endpoint URL
- \`apiKey\` - API authentication key
{{/if}}

## API

### \`initialize()\`
Initialize the plugin and its resources.

### \`execute(options)\`
Execute the plugin functionality.

### \`getStatus()\`
Get the current plugin status.

### \`cleanup()\`
Clean up plugin resources.

## License

{{license}}`,
            encoding: 'utf8'
          },
          'test/index.test.js': {
            content: `import { {{className}}Plugin } from '../index.js';

describe('{{pluginName}} Plugin', () => {
  let plugin;

  beforeEach(() => {
    plugin = new {{className}}Plugin();
  });

  afterEach(async () => {
    if (plugin.initialized) {
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
});`,
            encoding: 'utf8'
          }
        },
        variables: {
          pluginName: { type: 'string', prompt: 'Plugin name', required: true },
          className: { type: 'string', prompt: 'Class name', default: '{{pluginName|pascalCase}}' },
          description: { type: 'string', prompt: 'Plugin description', default: 'Claude Zen plugin' },
          hasDatabase: { type: 'boolean', prompt: 'Does plugin use database?', default: false },
          hasAPI: { type: 'boolean', prompt: 'Does plugin use external API?', default: false },
          author: { type: 'string', prompt: 'Author name', default: '{{author}}' },
          license: { type: 'string', prompt: 'License', default: 'MIT' },
          version: { type: 'string', prompt: 'Initial version', default: '0.1.0' }
        }
      }
    };

    for (const [id, template] of Object.entries(builtInTemplates)) {
      this.templates.set(id, { ...template, id, source: 'builtin' });
    }

    console.log(`📦 Loaded ${this.templates.size} built-in templates`);
  }

  async loadCustomTemplates() {
    try {
      const entries = await readdir(this.config.customTemplatesDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const templatePath = path.join(this.config.customTemplatesDir, entry.name);
          const template = await this.loadTemplateFromDirectory(templatePath);
          
          if (template) {
            this.templates.set(entry.name, { ...template, id: entry.name, source: 'custom' });
          }
        }
      }
      
      console.log(`📁 Loaded custom templates from ${this.config.customTemplatesDir}`);
    } catch (error) {
      // No custom templates directory
    }
  }

  async loadTemplateFromDirectory(templatePath) {
    try {
      // Load template manifest
      const manifestPath = path.join(templatePath, 'template.json');
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
      
      // Load file mappings
      const files = {};
      if (manifest.files) {
        for (const [targetPath, sourcePath] of Object.entries(manifest.files)) {
          const fullPath = path.join(templatePath, sourcePath);
          const content = await readFile(fullPath, 'utf8');
          files[targetPath] = { content, encoding: 'utf8' };
        }
      }
      
      return {
        ...manifest,
        files
      };
    } catch (error) {
      console.warn(`⚠️ Failed to load template from ${templatePath}: ${error.message}`);
      return null;
    }
  }

  async loadTemplateRegistry() {
    try {
      const registryPath = path.join(this.config.templatesDir, 'registry.json');
      const registry = JSON.parse(await readFile(registryPath, 'utf8'));
      
      // Merge remote templates into registry
      for (const [id, template] of Object.entries(registry.templates || {})) {
        if (!this.templates.has(id)) {
          this.templates.set(id, { ...template, id, source: 'registry' });
        }
      }
    } catch (error) {
      // No registry yet
    }
  }

  async generateProject(templateId, variables = {}, options = {}) {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template '${templateId}' not found`);
    }

    console.log(`🏗️ Generating project from template: ${template.name}`);

    // Validate and process variables
    const processedVars = await this.processVariables(template, variables);
    
    // Determine output directory
    const outputDir = options.outputDir || 
                     path.join(this.config.outputDir, processedVars.projectName || processedVars.serviceName || 'new-project');
    
    try {
      // Create output directory
      await mkdir(outputDir, { recursive: true });
      
      // Generate files
      const generatedFiles = await this.generateFiles(template, processedVars, outputDir);
      
      // Run post-generate commands
      if (template.postGenerate && !options.skipPostGenerate) {
        await this.runPostGenerateCommands(template.postGenerate, outputDir);
      }
      
      // Initialize git repository
      if (this.config.gitInit && !options.skipGit) {
        await this.initializeGit(outputDir);
      }
      
      // Install dependencies
      if (this.config.npmInstall && !options.skipInstall) {
        await this.installDependencies(outputDir);
      }
      
      // Record generated project
      const projectInfo = {
        id: `${templateId}-${Date.now()}`,
        template: templateId,
        templateName: template.name,
        outputDir,
        variables: processedVars,
        files: generatedFiles,
        timestamp: new Date().toISOString()
      };
      
      this.generatedProjects.push(projectInfo);
      
      this.emit('project:generated', projectInfo);
      
      console.log(`✅ Project generated successfully at ${outputDir}`);
      
      return projectInfo;
      
    } catch (error) {
      // Clean up on error
      if (options.cleanupOnError) {
        try {
          await rm(outputDir, { recursive: true, force: true });
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
      }
      
      throw error;
    }
  }

  async processVariables(template, providedVars) {
    const processed = { ...this.config.defaultValues };
    
    // Process template variables
    for (const [key, varDef] of Object.entries(template.variables || {})) {
      let value = providedVars[key];
      
      // Use default if not provided
      if (value === undefined && varDef.default !== undefined) {
        value = varDef.default;
      }
      
      // Process template references in defaults
      if (typeof value === 'string' && value.includes('{{')) {
        value = this.processTemplate(value, processed);
      }
      
      // Validate required variables
      if (varDef.required && value === undefined) {
        if (this.config.interactive) {
          // In interactive mode, use default or placeholder
          value = varDef.default || `<${key}>`;
          console.warn(`Using default value '${value}' for required variable '${key}'`);
        } else {
          throw new Error(`Required variable '${key}' not provided`);
        }
      }
      
      // Type conversion
      if (value !== undefined) {
        switch (varDef.type) {
          case 'number':
            value = Number(value);
            break;
          case 'boolean':
            value = Boolean(value);
            break;
          case 'array':
            if (typeof value === 'string') {
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

  async generateFiles(template, variables, outputDir) {
    const generatedFiles = [];
    
    for (const [filePath, fileConfig] of Object.entries(template.files || {})) {
      // Process file path template
      const processedPath = this.processTemplate(filePath, variables);
      const fullPath = path.join(outputDir, processedPath);
      
      // Create directory if needed
      await mkdir(path.dirname(fullPath), { recursive: true });
      
      // Process file content
      let content = fileConfig.content;
      
      // Process conditionals
      content = this.processConditionals(content, variables);
      
      // Process loops
      content = this.processLoops(content, variables);
      
      // Process variables
      content = this.processTemplate(content, variables);
      
      // Write file
      await writeFile(fullPath, content, fileConfig.encoding || 'utf8');
      
      generatedFiles.push({
        path: processedPath,
        fullPath,
        size: Buffer.byteLength(content)
      });
      
      console.log(`📄 Generated: ${processedPath}`);
    }
    
    return generatedFiles;
  }

  processTemplate(template, variables) {
    return template.replace(this.placeholderRegex, (match, expression) => {
      const parts = expression.trim().split('|');
      let value = this.evaluateExpression(parts[0].trim(), variables);
      
      // Apply filters
      for (let i = 1; i < parts.length; i++) {
        const filter = parts[i].trim();
        value = this.applyFilter(value, filter);
      }
      
      return value !== undefined ? String(value) : match;
    });
  }

  processConditionals(template, variables) {
    return template.replace(this.conditionalRegex, (match, condition, content) => {
      const result = this.evaluateExpression(condition.trim(), variables);
      return result ? content : '';
    });
  }

  processLoops(template, variables) {
    return template.replace(this.loopRegex, (match, expression, content) => {
      const array = this.evaluateExpression(expression.trim(), variables);
      if (!Array.isArray(array)) return '';
      
      return array.map((item, index) => {
        const loopVars = { ...variables, item, index };
        return this.processTemplate(content, loopVars);
      }).join('');
    });
  }

  evaluateExpression(expression, variables) {
    // Handle JSON special case
    if (expression.startsWith('json ')) {
      const varName = expression.substring(5);
      const value = this.evaluateExpression(varName, variables);
      return JSON.stringify(value);
    }
    
    // Simple variable lookup (no eval for security)
    const parts = expression.split('.');
    let value = variables;
    
    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  applyFilter(value, filter) {
    switch (filter) {
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
      case 'camelCase':
        const pascal = this.applyFilter(value, 'pascalCase');
        return pascal.charAt(0).toLowerCase() + pascal.slice(1);
      case 'kebabCase':
        return String(value)
          .split(/[\s_]+/)
          .join('-')
          .toLowerCase();
      case 'snakeCase':
        return String(value)
          .split(/[\s\-]+/)
          .join('_')
          .toLowerCase();
      default:
        return value;
    }
  }

  async runPostGenerateCommands(commands, cwd) {
    console.log('🔧 Running post-generate commands...');
    
    for (const command of commands) {
      console.log(`  $ ${command}`);
      
      try {
        await this.executeCommand(command, { cwd });
      } catch (error) {
        console.warn(`  ⚠️ Command failed: ${error.message}`);
      }
    }
  }

  async initializeGit(projectDir) {
    console.log('📝 Initializing git repository...');
    
    try {
      await this.executeCommand('git init', { cwd: projectDir });
      await this.executeCommand('git add .', { cwd: projectDir });
      await this.executeCommand('git commit -m "Initial commit"', { cwd: projectDir });
      console.log('✅ Git repository initialized');
    } catch (error) {
      console.warn('⚠️ Failed to initialize git:', error.message);
    }
  }

  async installDependencies(projectDir) {
    // Check if package.json exists
    try {
      await access(path.join(projectDir, 'package.json'));
    } catch (error) {
      return; // No package.json, skip install
    }
    
    console.log('📦 Installing dependencies...');
    
    try {
      await this.executeCommand('npm install', { cwd: projectDir });
      console.log('✅ Dependencies installed');
    } catch (error) {
      console.warn('⚠️ Failed to install dependencies:', error.message);
    }
  }

  executeCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
      const [cmd, ...args] = command.split(' ');
      const child = spawn(cmd, args, {
        ...options,
        shell: true,
        stdio: 'inherit'
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Command exited with code ${code}`));
        }
      });
      
      child.on('error', reject);
    });
  }

  async listTemplates(options = {}) {
    const templates = Array.from(this.templates.values());
    
    // Filter by category
    if (options.category) {
      return templates.filter(t => t.category === options.category);
    }
    
    // Filter by source
    if (options.source) {
      return templates.filter(t => t.source === options.source);
    }
    
    // Group by category
    if (options.grouped) {
      const grouped = {};
      for (const template of templates) {
        const category = template.category || 'other';
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(template);
      }
      return grouped;
    }
    
    return templates;
  }

  async createCustomTemplate(name, fromProject, options = {}) {
    const templateDir = path.join(this.config.customTemplatesDir, name);
    
    // Create template directory
    await mkdir(templateDir, { recursive: true });
    
    // Scan project files
    const files = await this.scanProjectFiles(fromProject, options.ignore || []);
    
    // Create template manifest
    const manifest = {
      name: options.name || name,
      description: options.description || `Template created from ${fromProject}`,
      category: options.category || 'custom',
      variables: options.variables || {},
      files: {}
    };
    
    // Copy files and update manifest
    for (const file of files) {
      const relativePath = path.relative(fromProject, file);
      const templatePath = `files/${relativePath}`;
      
      // Copy file to template
      const targetPath = path.join(templateDir, templatePath);
      await mkdir(path.dirname(targetPath), { recursive: true });
      await copyFile(file, targetPath);
      
      // Add to manifest
      manifest.files[relativePath] = templatePath;
    }
    
    // Save manifest
    await writeFile(
      path.join(templateDir, 'template.json'),
      JSON.stringify(manifest, null, 2)
    );
    
    // Reload templates
    const template = await this.loadTemplateFromDirectory(templateDir);
    if (template) {
      this.templates.set(name, { ...template, id: name, source: 'custom' });
    }
    
    console.log(`✅ Custom template '${name}' created`);
    
    return template;
  }

  async scanProjectFiles(projectDir, ignore = []) {
    const defaultIgnore = [
      'node_modules/**',
      '.git/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '*.log',
      '.env'
    ];
    
    const { glob } = await import('glob');
    const files = await glob('**/*', {
      cwd: projectDir,
      absolute: true,
      nodir: true,
      ignore: [...defaultIgnore, ...ignore]
    });
    
    return files;
  }

  async importTemplate(source, options = {}) {
    if (source.startsWith('github:')) {
      return this.importFromGitHub(source.substring(7), options);
    } else if (source.startsWith('npm:')) {
      return this.importFromNPM(source.substring(4), options);
    } else if (source.startsWith('http')) {
      return this.importFromURL(source, options);
    } else {
      return this.importFromDirectory(source, options);
    }
  }

  async importFromGitHub(repo, options = {}) {
    console.log(`📥 Importing template from GitHub: ${repo}`);
    
    // Clone repository to temp directory
    const tempDir = path.join(this.config.templatesDir, '.temp', Date.now().toString());
    await mkdir(tempDir, { recursive: true });
    
    try {
      await this.executeCommand(`git clone --depth 1 https://github.com/${repo}.git ${tempDir}`);
      
      // Load template
      const template = await this.loadTemplateFromDirectory(tempDir);
      if (!template) {
        throw new Error('No valid template found in repository');
      }
      
      // Save to custom templates
      const templateId = options.name || path.basename(repo);
      await this.createCustomTemplate(templateId, tempDir, {
        ...options,
        name: template.name,
        description: template.description
      });
      
      return templateId;
      
    } finally {
      // Clean up temp directory
      await rm(tempDir, { recursive: true, force: true });
    }
  }

  async importFromNPM(packageName, options = {}) {
    console.log(`📥 Importing template from NPM: ${packageName}`);
    
    // Install package to temp directory
    const tempDir = path.join(this.config.templatesDir, '.temp', Date.now().toString());
    await mkdir(tempDir, { recursive: true });
    
    try {
      await this.executeCommand(`npm install ${packageName}`, { cwd: tempDir });
      
      // Find template in node_modules
      const packageDir = path.join(tempDir, 'node_modules', packageName);
      const template = await this.loadTemplateFromDirectory(packageDir);
      
      if (!template) {
        throw new Error('No valid template found in package');
      }
      
      // Save to custom templates
      const templateId = options.name || packageName;
      await this.createCustomTemplate(templateId, packageDir, {
        ...options,
        name: template.name,
        description: template.description
      });
      
      return templateId;
      
    } finally {
      // Clean up temp directory
      await rm(tempDir, { recursive: true, force: true });
    }
  }

  async getStats() {
    const templates = Array.from(this.templates.values());
    
    return {
      totalTemplates: templates.length,
      bySource: {
        builtin: templates.filter(t => t.source === 'builtin').length,
        custom: templates.filter(t => t.source === 'custom').length,
        registry: templates.filter(t => t.source === 'registry').length
      },
      byCategory: templates.reduce((acc, t) => {
        const category = t.category || 'other';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {}),
      generatedProjects: this.generatedProjects.length,
      recentProjects: this.generatedProjects.slice(-5)
    };
  }

  async cleanup() {
    this.templates.clear();
    this.templateCache.clear();
    this.generatedProjects = [];
    this.removeAllListeners();
    
    console.log('🏗️ Project Scaffold Plugin cleaned up');
  }
}

export default ProjectScaffoldPlugin;