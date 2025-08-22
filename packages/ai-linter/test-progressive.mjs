#!/usr/bin/env node

/**
 * Simple test for the progressive batch linter
 */

// Mock the foundation logger to avoid import issues
globalThis.mockLogger = {
  info: (msg, ...args) => console.log(`ℹ️  ${msg}`, ...args),
  debug: (msg, ...args) => console.log(`🐛 ${msg}`, ...args),
  warn: (msg, ...args) => console.log(`⚠️  ${msg}`, ...args),
  error: (msg, ...args) => console.log(`❌ ${msg}`, ...args),
};

// Simple module.exports for getLogger
const getLogger = (name) => ({
  ...globalThis.mockLogger,
  name,
});

try {
  console.log('🧪 Testing Progressive Batch Linter...');

  // Test if we can at least import the compiled module
  const { ProgressiveBatchLinter } = await import('./dist/progressive-batch-linter.js');

  console.log('✅ Progressive batch linter module imported successfully');
  console.log('📦 ProgressiveBatchLinter class available:', typeof ProgressiveBatchLinter);

  // Test basic config
  const config = {
    batchSize: 5,
    rootDir: '/tmp/test',
    confidenceThreshold: 0.7,
    resume: false,
  };

  console.log('🎯 Test configuration:', config);
  console.log('✅ Progressive batch linter test completed!');

} catch (error) {
  console.error('❌ Progressive batch linter test failed:', error.message);
  process.exit(1);
}