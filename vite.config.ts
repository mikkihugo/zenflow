import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [sveltekit()],

	// Development server configuration
	server: {
		port: 3002, // Port 3000 reserved for nginx, 3001 for main app
		host: "0.0.0.0",
	},

	// Build configuration
	build: {
		target: "node18",
		outDir: "svelte-build",
		sourcemap: true,
	},

	// Resolve configuration
	resolve: {
		alias: {
			$lib: "./src/lib",
			$components: "./src/lib/components",
			$stores: "./src/lib/stores",
			$utils: "./src/lib/utils",
			$types: "./src/lib/types",
		},
	},

	// CSS configuration
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: '@use "src/lib/styles/variables.scss" as *;',
			},
		},
	},

	// Define configuration
	define: {
		__VERSION__: JSON.stringify(process.env.npm_package_version || "2.0.0"),
		__BUILD_TIME__: JSON.stringify(new Date().toISOString()),
	},

	// Optimization
	optimizeDeps: {
		include: ["socket.io-client", "chart.js"],
	},
});
