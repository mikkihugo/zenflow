import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 3002,
		host: '0.0.0.0',
		allowedHosts: ['fra-d1.in.centralcloud.net', 'localhost', '127.0.0.1'],
		proxy: {
			// Proxy API calls to backend server
			'/api': {
				target: 'http://localhost:3000',
				changeOrigin: true,
				secure: false,
				// Handle backend server being down gracefully
				configure: (proxy, _options) => {
					proxy.on('error', (err, _req, res) => {
						console.log('Backend API proxy error:', err.message);
						res.writeHead(503, { 'Content-Type': 'application/json' });
						res.end(JSON.stringify({ 
							error: 'Backend API unavailable', 
							message: 'The backend server is currently down. Please try again later.' 
						}));
					});
					proxy.on('proxyReq', (proxyReq, req, _res) => {
						console.log(`Proxying API request: ${req.method} ${req.url} -> http://localhost:3000${req.url}`);
					});
				}
			},
			// Proxy WebSocket connections
			'/socket.io': {
				target: 'http://localhost:3000',
				ws: true,
				changeOrigin: true
			}
		}
	},
	preview: {
		port: 3002,
		host: '0.0.0.0'
	},
	build: {
		target: 'esnext'
	},
	optimizeDeps: {
		include: ['chart.js', 'date-fns', 'socket.io-client']
	}
});