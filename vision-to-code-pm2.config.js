/**
 * PM2 Ecosystem Configuration for Vision-to-Code System
 * Staging Environment Setup
 */

const config = {
  apps: [
    {
      name: 'business-service',
      script: './services/business-service/src/server.js',
      cwd: '/home/mhugo/code/claude-code-flow',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'staging',
        BUSINESS_SERVICE_PORT: 4106,
        CORE_SERVICE_URL: 'http://localhost:4105',
        SWARM_SERVICE_URL: 'http://localhost:4108',
        DEVELOPMENT_SERVICE_URL: 'http://localhost:4103',
        REDIS_HOST: 'localhost',
        REDIS_PORT: 6379,
        DATABASE_URL: 'sqlite:./vision-to-code.db',
        GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
        LOG_LEVEL: 'info'
      },
      log_file: './logs/business-service.log',
      error_file: './logs/business-service-error.log',
      out_file: './logs/business-service-out.log',
      watch: false,
      max_memory_restart: '500M',
      restart_delay: 1000
    },
    {
      name: 'core-service',
      script: './services/agent-coordinator/service.js',
      cwd: '/home/mhugo/code/claude-code-flow',
      instances: 1,
      exec_mode: 'fork',
      node_args: '--experimental-modules',
      env: {
        NODE_ENV: 'staging',
        PORT: 4105,
        BUSINESS_SERVICE_URL: 'http://localhost:4106',
        SWARM_SERVICE_URL: 'http://localhost:4108',
        DEVELOPMENT_SERVICE_URL: 'http://localhost:4103',
        REDIS_HOST: 'localhost',
        REDIS_PORT: 6379,
        DATABASE_URL: 'sqlite:./vision-to-code.db',
        LOG_LEVEL: 'info'
      },
      log_file: './logs/core-service.log',
      error_file: './logs/core-service-error.log',
      out_file: './logs/core-service-out.log',
      watch: false,
      max_memory_restart: '300M',
      restart_delay: 1000
    },
    {
      name: 'swarm-service',
      script: './services/llm-router/service.js',
      cwd: '/home/mhugo/code/claude-code-flow',
      instances: 1,
      exec_mode: 'fork',
      node_args: '--experimental-modules',
      env: {
        NODE_ENV: 'staging',
        PORT: 4108,
        BUSINESS_SERVICE_URL: 'http://localhost:4106',
        CORE_SERVICE_URL: 'http://localhost:4105',
        DEVELOPMENT_SERVICE_URL: 'http://localhost:4103',
        REDIS_HOST: 'localhost',
        REDIS_PORT: 6379,
        DATABASE_URL: 'sqlite:./vision-to-code.db',
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
        OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
        LOG_LEVEL: 'info'
      },
      log_file: './logs/swarm-service.log',
      error_file: './logs/swarm-service-error.log',
      out_file: './logs/swarm-service-out.log',
      watch: false,
      max_memory_restart: '400M',
      restart_delay: 1000
    },
    {
      name: 'development-service',
      script: './services/storage-service/service.js',
      cwd: '/home/mhugo/code/claude-code-flow',
      instances: 1,
      exec_mode: 'fork',
      node_args: '--experimental-modules',
      env: {
        NODE_ENV: 'staging',
        PORT: 4103,
        BUSINESS_SERVICE_URL: 'http://localhost:4106',
        CORE_SERVICE_URL: 'http://localhost:4105',
        SWARM_SERVICE_URL: 'http://localhost:4108',
        REDIS_HOST: 'localhost',
        REDIS_PORT: 6379,
        DATABASE_URL: 'sqlite:./vision-to-code.db',
        CACHE_STRATEGY: 'lru',
        MAX_CACHE_SIZE: 2000,
        LOG_LEVEL: 'info'
      },
      log_file: './logs/development-service.log',
      error_file: './logs/development-service-error.log',
      out_file: './logs/development-service-out.log',
      watch: false,
      max_memory_restart: '400M',
      restart_delay: 1000
    }
  ]
};

module.exports = config;