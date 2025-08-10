import { build } from 'esbuild';

const isProduction = process.env.NODE_ENV === 'production';
const isWatch = process.argv.includes('--watch');

// Single entry point that handles all modes
const config = {
  entryPoints: ['src/main.ts'], // Single unified entry
  bundle: true,
  outfile: 'dist/claude-zen.js',
  format: 'esm',
  platform: 'node',
  target: 'node18',
  sourcemap: !isProduction,
  minify: isProduction,
  keepNames: true,
  treeShaking: true,

  external: ['better-sqlite3', 'kuzu', '@lancedb/lancedb'],

  banner: {
    js: `#!/usr/bin/env node
    import { createRequire } from 'module';
    const require = createRequire(import.meta.url);`,
  },
};

if (isWatch) {
  const ctx = await build({ ...config, watch: true });
  console.log('👀 Watching...');
} else {
  await build(config);
  console.log('✅ Single entry build complete!');
}
