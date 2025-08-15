// Simple test to see if tsx can import .js when file is .ts
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Current directory:', __dirname);
console.log('Testing direct import...');

try {
  const diModule = await import('./src/core/di-container.js');
  console.log('✅ Import successful');
  console.log('Exports:', Object.keys(diModule));
  
  console.log('Testing function call...');
  const container = diModule.createClaudeZenDIContainer();
  console.log('✅ Function call successful');
  console.log('Container type:', typeof container);
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}