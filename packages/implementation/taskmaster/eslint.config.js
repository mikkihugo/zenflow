import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
	js.configs.recommended,
	// Main TypeScript configuration for backend code
	{
		files: ["src/**/*.ts", "src/**/*.tsx"],
		ignores: ["src/agui/**/*"], // AGUI has different config below
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 2022,
				sourceType: "module",
			},
			globals: {
				// Node.js globals for backend code
				process: "readonly",
				Buffer: "readonly",
				__dirname: "readonly",
				__filename: "readonly",
			},
		},
		plugins: {
			"@typescript-eslint": tsPlugin,
		},
		rules: {
			...tsPlugin.configs.recommended.rules,
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/naming-convention": "warn",
			"no-console": "warn",
			"no-undef": "error",
		},
	},
	// Special configuration for AGUI files (browser environment)
	{
		files: ["src/agui/**/*.ts", "src/agui/**/*.tsx"],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 2022,
				sourceType: "module",
			},
			globals: {
				// Browser globals for AGUI components
				window: "readonly",
				document: "readonly",
				HTMLElement: "readonly",
				HTMLInputElement: "readonly",
				console: "readonly",
				setTimeout: "readonly",
				setInterval: "readonly",
				clearTimeout: "readonly",
				clearInterval: "readonly",
				Event: "readonly",
				EventTarget: "readonly",

				// Node.js globals still needed
				process: "readonly",
				Buffer: "readonly",
			},
		},
		plugins: {
			"@typescript-eslint": tsPlugin,
		},
		rules: {
			...tsPlugin.configs.recommended.rules,
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/naming-convention": "off", // Relax naming for event types
			"no-console": "off", // Allow console in AGUI for fallbacks
			"no-undef": "error",
		},
	},
	{
		files: ["scripts/**/*.js"],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: "module",
			globals: {
				process: "readonly",
				console: "readonly",
				require: "readonly",
				module: "readonly",
				__dirname: "readonly",
			},
		},
	},
	{
		ignores: [
			"dist/**/*",
			"node_modules/**/*",
			"src/wasm/**/*", // Exclude entire WASM directory
			"src/**/*.js", // Exclude generated JavaScript files
			"src/**/*.d.ts", // Exclude generated declaration files
			"**/*.wasm",
			"**/*.d.ts.map",
			"**/*.js.map",
			".pnpm-debug.log*",
			"tsup.config.ts", // Skip config files that reference missing tsconfigs
			"*.config.js", // Skip other config files
			"*.config.ts",
		],
	},
];
