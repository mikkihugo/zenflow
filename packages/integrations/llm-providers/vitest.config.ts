import { resolve} from 'node:path';
import { defineConfig} from 'vitest/config';

export default defineConfig({
  test:{
    environment: 'node',    globals:true,
    pool: 'forks',    poolOptions:{
      forks:{
        singleFork:true,
},
},
    setupFiles:['./tests/setup.ts'],
    coverage:{
      provider: 'v8',      reporter:['text',    'json',    'html'],
      exclude:[
        'node_modules/**',        'dist/**',        '**/*.d.ts',        'tests/**',        'coverage/**',        'vitest.config.ts',],
      thresholds:{
        global:{
          branches:75,
          functions:75,
          lines:75,
          statements:75,
},
},
},
    include:['tests/**/*.{test,spec}.{js,ts}',    'src/**/*.{test,spec}.{js,ts}'],
    exclude:[
      'node_modules/**',      'dist/**',      'tests/integration/**', // Skip integration tests by default')],
    testTimeout:5000,
    hookTimeout:5000,
    env:{
      NODE_ENV: 'test',      LOG_LEVEL: 'silent',},
},
  resolve:{
    alias:{
      '@':resolve(__dirname, './src'),
      '@tests':resolve(__dirname, './tests'),
},
},
});
