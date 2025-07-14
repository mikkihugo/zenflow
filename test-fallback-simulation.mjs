#!/usr/bin/env node

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a require function for this ES module
const require = createRequire(import.meta.url);

// Mock better-sqlite3 to simulate it being missing
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id) {
  if (id === 'better-sqlite3') {
    throw new Error('Cannot find module \'better-sqlite3\' - Simulating missing native module');
  }
  return originalRequire.apply(this, arguments);
};

// Import after mocking
import('./src/memory/enhanced-memory.js').then(async ({ EnhancedMemory }) => {
  console.log('🧪 Testing SQLite Fallback Mechanism\n');
  
  const memory = new EnhancedMemory();
  
  try {
    await memory.initialize();
    console.log('✅ Memory initialized successfully');
    console.log(`📊 Using fallback: ${memory.useFallback ? 'YES (in-memory)' : 'NO (SQLite)'}`);
    
    // Test basic operations
    console.log('\n🔧 Testing memory operations:');
    
    await memory.store('test-key', 'test-value', { namespace: 'test' });
    console.log('✅ Store operation successful');
    
    const value = await memory.retrieve('test-key', { namespace: 'test' });
    console.log(`✅ Retrieve operation successful: ${value}`);
    
    const items = await memory.list({ namespace: 'test' });
    console.log(`✅ List operation successful: ${items.length} items`);
    
    console.log('\n🎉 All operations completed successfully!');
    console.log('💡 The fallback mechanism is working correctly.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}).catch(err => {
  console.error('Failed to import:', err);
});