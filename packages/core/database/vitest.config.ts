/**
 * Vitest Configuration for Database Package
 *
 * This configuration isolates the database package testing environment
 * from the main project configuration to avoid setup file dependencies.
 */
import { defineConfig} from 'vitest/config';

export default defineConfig({
  test:{
    environment: 'node',    include:[
      'src/__tests__/**/*.test.ts',      'src/__tests__/**/*.test.tsx',      'tests/**/*.test.ts',      'tests/**/*.test.tsx',],
    exclude:['node_modules',    'dist',    '.git',    'coverage'],
    globals:true,
    testTimeout:30000,
    hookTimeout:10000,
    teardownTimeout:10000,
    reporter:['verbose'],
},
});
