export default {
  apps: [
    {
      name: 'claude-zen-system',
      script: 'start-claude-zen-system.js',
      cwd: '/home/mhugo/code/claude-code-zen',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      log_type: 'json',
      merge_logs: true,
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Integrated system includes:
      // - Web Dashboard (port 3000)
      // - REST API (/api)
      // - HTTP MCP Protocol (/mcp) for Claude Desktop
      // - WebSocket real-time updates
      // 
      // Note: Stdio MCP for swarm coordination is started
      // dynamically by Claude Code when swarms are initialized
    },
  ],
};
