export default {
  apps: [;
    {
      name: 'claude-zen-api',;
      script: 'src/api/start-server.js',;
      cwd: '/home/mhugo/code/claude-zen',;
      instances: 1,;
      autorestart: true,;
      watch: false,;
      max_memory_restart: '1G',;
      env: {
        NODE_ENV: 'production',;
        PORT: 3000,;
      },;
      env_development: {
        NODE_ENV: 'development',;
        PORT: 3000,;
      },;
      log_file: '/tmp/claude-zen-api.log',;
      out_file: '/tmp/claude-zen-api-out.log',;
      error_file: '/tmp/claude-zen-api-error.log',;
      pid_file: '/tmp/claude-zen-api.pid',;
      merge_logs: true,;
      time: true,;
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',;
    },;
  ],;
}
