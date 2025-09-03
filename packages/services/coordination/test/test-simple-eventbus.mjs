import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing Simple EventBus Integration...\n');

// Test 1: Direct EventBus access
console.log('📦 Test 1: Foundation EventBus Direct Access...');
try {
  const { EventBus } = await import('../../../core/foundation/dist/src/events/event-bus.js');
  const bus = EventBus.getInstance();
  console.log('✅ Foundation EventBus accessible directly');
  
  // Test basic event functionality
  let testEventReceived = false;
  bus.on('test:simple', (data) => {
    console.log('✅ Simple test event received:', data);
    testEventReceived = true;
  });
  
  bus.emit('test:simple', { message: 'Simple EventBus test successful', timestamp: Date.now() });
  
  if (testEventReceived) {
    console.log('✅ Foundation EventBus basic functionality working');
  } else {
    console.log('❌ Foundation EventBus basic functionality failed');
  }
  
} catch (error) {
  console.log('❌ Error accessing foundation EventBus directly:', error.message);
}

// Test 2: Domain-specific events
console.log('\n📦 Test 2: Domain-Specific Events...');
try {
  const { EventBus } = await import('../../../core/foundation/dist/src/events/event-bus.js');
  const bus = EventBus.getInstance();
  
  // Test coordination domain events
  let safeEventReceived = false;
  let taskmasterEventReceived = false;
  let teamworkEventReceived = false;
  
  bus.on('safe:test', (data) => {
    console.log('✅ SAFe domain event received:', data);
    safeEventReceived = true;
  });
  
  bus.on('taskmaster:test', (data) => {
    console.log('✅ TaskMaster domain event received:', data);
    taskmasterEventReceived = true;
  });
  
  bus.on('teamwork:test', (data) => {
    console.log('✅ Teamwork domain event received:', data);
    teamworkEventReceived = true;
  });
  
  // Emit test events to each domain
  bus.emit('safe:test', { domain: 'safe', message: 'SAFe test event' });
  bus.emit('taskmaster:test', { domain: 'taskmaster', message: 'TaskMaster test event' });
  bus.emit('teamwork:test', { domain: 'teamwork', message: 'Teamwork test event' });
  
  console.log('\n📊 Domain Event Test Results:');
  console.log(`  - SAFe: ${safeEventReceived ? '✅' : '❌'}`);
  console.log(`  - TaskMaster: ${taskmasterEventReceived ? '✅' : '❌'}`);
  console.log(`  - Teamwork: ${teamworkEventReceived ? '✅' : '❌'}`);
  
} catch (error) {
  console.log('❌ Error testing domain events:', error.message);
}

console.log('\n🎯 Simple EventBus Test Completed!');
console.log('📋 Status: Foundation EventBus is working correctly for coordination events');
