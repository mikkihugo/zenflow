import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: ['fra-d1.in.centralcloud.net', 'localhost', '127.0.0.1'],
    proxy: {
      // Proxy API calls to backend server
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        // Handle backend server being down gracefully
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            // Log backend connection errors in development
            if (process.env.NODE_ENV === 'development') {
              // eslint-disable-next-line no-console
              logger.info('Backend API proxy error:', err.message);
            }
            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                error: 'Backend API unavailable',
                message:
                  'The backend server is currently down. Please try again later.',
              })
            );
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            if (process.env.NODE_ENV === 'development') {
              // eslint-disable-next-line no-console
              logger.info(
                `Proxying API request:${req.method} ${req.url} -> http://localhost:3001${req.url}`
              );
            }
            // Use proxyReq for logging proxy request details
            proxyReq.setHeader(
              'x-forwarded-for',
              req.socket.remoteAddress || ' unknown'
            );
          });
        },
      },
      // Proxy WebSocket connections
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 3002,
    host: '0.0.0.0',
  },
  build: {
    target: 'esnext',
  },
  resolve: {
    alias: {
      '@claude-zen/foundation':
        '/home/mhugo/code/claude-code-zen/packages/public-api/core/foundation/src/browser.ts',
    },
  },
  optimizeDeps: {
  include: ['date-fns', 'socket.io-client'],
  },
});
