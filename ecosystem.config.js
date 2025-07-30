export default {
  apps: [;
// {
      name: 'claude-zen-api',
      script: 'src/api/start-server.js',
      cwd: '/home/mhugo/code/claude-zen',
      instances,
      autorestart,
      watch,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT },
      env_development: {
        NODE_ENV: 'development',
        PORT },
      log_file: '/tmp/claude-zen-api.log',
      out_file: '/tmp/claude-zen-api-out.log',
      error_file: '/tmp/claude-zen-api-error.log',
      pid_file: '/tmp/claude-zen-api.pid',
      merge_logs,
      time,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z' } ] }
