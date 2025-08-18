#!/usr/bin/env node

console.log('🧠 Testing Brain Orchestrator...');

try {
  const { BrainCoordinator } = await import('./dist/main.js');
  
  console.log('✅ BrainCoordinator imported successfully');
  
  const brain = new BrainCoordinator();
  await brain.initialize();
  
  console.log('✅ Brain initialized');
  
  // Simple prediction test
  const result = await brain.predict([0.1, 0.2, 0.3]);
  console.log('📊 Prediction result:', result);
  
  console.log('✅ Brain orchestrator test completed!');
  
} catch (error) {
  console.error('❌ Test failed:', error);
  process.exit(1);
}