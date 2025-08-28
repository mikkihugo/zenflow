/**
 * @fileoverview Vitest Configuration for DSPy Library
 *
 * Test configuration for the TypeScript DSPy implementation.
 * Ensures proper ES module handling and test environment setup.
 *
 * @author Claude Code Zen Team
 * @version 2.0.0
 */

import { defineConfig} from "vitest/config";

export default defineConfig({
	test:{
		globals:true,
		environment:"node",
		include:["**/*.test.ts", "**/*.test.js"],
		exclude:["node_modules", "dist"],
		coverage:{
			provider:"v8",
			reporter:["text", "json", "html"],
			exclude:[
				"node_modules/",
				"dist/",
				"**/*.test.ts",
				"**/*.config.*",
				"stanford-reference/",
],
},
},
	esbuild:{
		target:"es2022",
},
});
