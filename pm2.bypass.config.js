/**
 * PM2 Configuration for Claude Code Zen Bypass Server
 * 
 * This configuration runs the minimal web server that bypasses
 * circular dependency issues in the main application.
 */

module.exports = {
  apps: [
    {
      name: 'claude-zen-bypass',
      script: './src/web-bypass.ts',
      args: '--port 3000',
      interpreter: 'npx',
      interpreter_args: 'tsx',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: '3000'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: '3000'
      },
      log_file: './logs/claude-zen-bypass.log',
      out_file: './logs/claude-zen-bypass-out.log',
      error_file: './logs/claude-zen-bypass-error.log',
      time: true,
      merge_logs: true,
      max_restarts: 5,
      min_uptime: '10s',
      // Health check URL for PM2 Plus (if used)
      health_check_url: 'http://localhost:3000/health',
      // Custom restart delay
      restart_delay: 4000
    }
  ]
};