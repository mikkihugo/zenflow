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
		
		// Configure the development server
		alias: {
			$lib: 'src/lib',
			$components: 'src/lib/components',
			$stores: 'src/lib/stores',
			$utils: 'src/lib/utils',
			$types: 'src/lib/types'
		}
	}
};

export default config;