import { join } from 'path'
import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

export default {
	darkMode: 'class',
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {},
	},
	plugins: [
		forms,
		typography,
		// Temporarily disable skeleton plugin for build compatibility
		// skeleton({
		// 	themes: {
		// 		preset: [
		// 			{
		// 				name: 'modern',
		// 				enhancements: true,
		// 			},
		// 		],
		// 	},
		// }),
	],
} satisfies Config;
