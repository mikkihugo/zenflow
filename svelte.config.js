import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// Use the Node.js adapter for production deployment
		adapter: adapter({
			// Options for the adapter
			out: 'build',
			precompress: false,
			envPrefix: ''
		}),
		
		// Configure file paths
		files: {
			assets: 'static',
			hooks: {
				client: 'src/hooks.client.ts',
				server: 'src/hooks.server.ts'
			},
			lib: 'src/lib',
			params: 'src/params',
			routes: 'src/routes',
			serviceWorker: 'src/service-worker.ts',
			appTemplate: 'src/app.html'
		},
		
		// Configure the development server
		alias: {
			$lib: 'src/lib',
			$components: 'src/lib/components',
			$stores: 'src/lib/stores',
			$utils: 'src/lib/utils',
			$types: 'src/lib/types'
		},
		
		// Enable TypeScript checking in development
		typescript: {
			config: (config) => {
				config.compilerOptions.allowJs = true;
				config.compilerOptions.checkJs = true;
				return config;
			}
		}
	}
};

export default config;