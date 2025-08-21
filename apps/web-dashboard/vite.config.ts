import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 3002,
		host: '0.0.0.0'
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