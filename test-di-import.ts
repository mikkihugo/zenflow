#!/usr/bin/env tsx

console.log('🧪 Testing DI Container import...');

try {
  console.log('📦 Importing DI container...');
  const diModule = await import('./src/core/di-container');
  console.log('✅ Import successful! Available exports:', Object.keys(diModule));
  
  const { createClaudeZenDIContainer } = diModule;
  console.log('✅ createClaudeZenDIContainer type:', typeof createClaudeZenDIContainer);
  
  if (typeof createClaudeZenDIContainer === 'function') {
    console.log('🚀 Testing DI container creation...');
    const container = createClaudeZenDIContainer();
    console.log('✅ DI container created successfully!', container ? 'Container exists' : 'No container');
  }
} catch (error) {
  console.error('❌ Import/creation failed:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
}