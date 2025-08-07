import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup';
import analyzer from 'rollup-plugin-analyzer';

export default defineConfig({
  input: 'src/claude-zen-core.ts',
  output: [
    {
      file: 'dist/claude-zen-core.js',
      format: 'es',
      sourcemap: true,
    },
    {
      file: 'dist/claude-zen-core.cjs',
      format: 'cjs',
      sourcemap: true,
    },
  ],
  plugins: [
    nodeResolve({
      preferBuiltins: true,
      exportConditions: ['node'],
    }),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
      rootDir: 'src',
    }),
    // Bundle analyzer (only when ANALYZE env var is set)
    ...(process.env.ANALYZE ? [analyzer({ summaryOnly: true })] : []),
  ],
  external: [
    // Keep Node.js built-ins external
    'node:fs',
    'node:path',
    'node:url',
    'node:process',
    'node:events',
    'node:util',
    'node:os',
    'node:crypto',
    'node:child_process',

    // Keep large dependencies external
    'better-sqlite3',
    'express',
    'react',
    'socket.io',
    'ws',
    '@lancedb/lancedb',
    'kuzu',
    '@google/generative-ai',
  ],
});
