/**
 * PM2 Test Configuration for Vision-to-Code System
 */

module.exports = {
  apps: [
    {
      name: 'vision-business-service',
      script: './services/vision-test-server.cjs',
      cwd: '/home/mhugo/code/claude-code-flow',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'staging',
        PORT: 4106,
        SERVICE_NAME: 'business-service'
      },
      log_file: './logs/vision-business-service.log',
      error_file: './logs/vision-business-service-error.log',
      out_file: './logs/vision-business-service-out.log',
      watch: false,
      max_memory_restart: '200M',
      restart_delay: 1000
    },
    {
      name: 'vision-core-service',
      script: './services/vision-test-server.cjs',
      cwd: '/home/mhugo/code/claude-code-flow',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'staging',
        PORT: 4105,
        SERVICE_NAME: 'core-service'
      },
      log_file: './logs/vision-core-service.log',
      error_file: './logs/vision-core-service-error.log',
      out_file: './logs/vision-core-service-out.log',
      watch: false,
      max_memory_restart: '200M',
      restart_delay: 1000
    },
    {
      name: 'vision-swarm-service',
      script: './services/vision-test-server.cjs',
      cwd: '/home/mhugo/code/claude-code-flow',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'staging',
        PORT: 4108,
        SERVICE_NAME: 'swarm-service'
      },
      log_file: './logs/vision-swarm-service.log',
      error_file: './logs/vision-swarm-service-error.log',
      out_file: './logs/vision-swarm-service-out.log',
      watch: false,
      max_memory_restart: '200M',
      restart_delay: 1000
    },
    {
      name: 'vision-development-service',
      script: './services/vision-test-server.cjs',
      cwd: '/home/mhugo/code/claude-code-flow',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'staging',
        PORT: 4103,
        SERVICE_NAME: 'development-service'
      },
      log_file: './logs/vision-development-service.log',
      error_file: './logs/vision-development-service-error.log',
      out_file: './logs/vision-development-service-out.log',
      watch: false,
      max_memory_restart: '200M',
      restart_delay: 1000
    }
  ]
};