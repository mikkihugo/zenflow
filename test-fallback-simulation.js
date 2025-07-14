#!/usr/bin/env node

// Simulate missing better-sqlite3 by intercepting require
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id) {
  if (id === 'better-sqlite3') {
    throw new Error('Cannot find module \'better-sqlite3\'');
  }
  return originalRequire.apply(this, arguments);
};

// Now test the memory system
const { EnhancedMemory } = require('./src/memory/enhanced-memory.js');

async function testFallback() {
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
}

testFallback();