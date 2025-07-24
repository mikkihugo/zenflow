// batch-constants.js - Extracted constants for batch operations
// Avoiding broken init system imports

export const PROJECT_TEMPLATES = {
  'basic-api': {
    name: 'Basic API Server',
    description: 'Simple REST API with Express.js',
    files: ['package.json', 'server.js', 'routes/'],
    dependencies: ['express', 'cors', 'helmet']
  },
  'fullstack-app': {
    name: 'Full-Stack Application',
    description: 'Complete web application with frontend and backend',
    files: ['package.json', 'client/', 'server/', 'shared/'],
    dependencies: ['express', 'react', 'webpack', 'babel']
  },
  'cli-tool': {
    name: 'CLI Tool',
    description: 'Command-line interface application',
    files: ['package.json', 'bin/', 'src/', 'README.md'],
    dependencies: ['commander', 'chalk', 'inquirer']
  },
  'microservice': {
    name: 'Microservice',
    description: 'Docker-ready microservice with API documentation',
    files: ['package.json', 'src/', 'Dockerfile', 'docker-compose.yml'],
    dependencies: ['express', 'swagger-ui-express', 'helmet']
  }
};

export const ENVIRONMENT_CONFIGS = {
  development: {
    NODE_ENV: 'development',
    DEBUG: 'true',
    LOG_LEVEL: 'debug'
  },
  staging: {
    NODE_ENV: 'staging',
    DEBUG: 'false',
    LOG_LEVEL: 'info'
  },
  production: {
    NODE_ENV: 'production',
    DEBUG: 'false',
    LOG_LEVEL: 'error'
  }
};