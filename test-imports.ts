#!/usr/bin/env npx tsx

console.log('🔍 Testing imports...');

try {
  console.log('✅ Import 1: parseArgs');
  const { parseArgs } = await import('node:util');
  console.log('✅ parseArgs imported successfully');

  console.log('✅ Import 2: @logtape/logtape');
  const { configure } = await import('@logtape/logtape');
  console.log('✅ LogTape imported successfully');

  console.log('✅ Import 3: logging-config');
  const { getLogger } = await import('./src/config/logging-config.js');
  console.log('✅ Logging config imported successfully');

  console.log('✅ Import 4: di-container');
  const { createClaudeZenDIContainer } = await import(
    './src/core/di-container.js'
  );
  console.log('✅ DI container imported successfully');

  console.log('🎉 All imports successful!');
} catch (error) {
  console.error('❌ Import failed:', error.message);
}

process.exit(0);
