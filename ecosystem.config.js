export default {
  apps: [
    {
      name: 'claude-zen-server',
      script: 'src/main.ts',
      args: 'integrated --port 3000',
      interpreter: 'bun',
      cwd: '/home/mhugo/code/claude-code-zen',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        LOG_LEVEL: 'info',
      },
      env_development: {
        NODE_ENV: 'development', 
        PORT: 3000,
        LOG_LEVEL: 'debug',
      },
      log_type: 'json',
      merge_logs: true,
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      log_file: './logs/pm2-combined.log',
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-error.log',
      // UNIFIED SYSTEM: All services consolidated into one Express server
      // - Web Dashboard (/dashboard)
      // - REST API (/api/v1)
      // - HTTP MCP Protocol (/mcp) for Claude Desktop
      // - Monitoring Dashboard (/monitoring)
      // - WebSocket real-time updates
      // - LogTape structured logging integration
      //
      // Note: Stdio MCP for swarm coordination is started
      // dynamically by Claude Code when swarms are initialized
    },
  ],
};
