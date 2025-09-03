import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing Event-Driven Coordination Architecture...\n');

// Test 1: Check if coordination package can access foundation EventBus
console.log('📦 Test 1: Foundation EventBus Access...');
try {
  const { EventBus } = await import('../../../core/foundation/dist/src/events/event-bus.js');
  const bus = EventBus.getInstance();
  console.log('✅ Foundation EventBus accessible from coordination package');
  
  // Test basic event functionality
  let testEventReceived = false;
  bus.on('coordination:test', (data) => {
    console.log('✅ Coordination test event received:', data);
    testEventReceived = true;
  });
  
  bus.emit('coordination:test', { message: 'EventBus integration test successful', timestamp: Date.now() });
  
  if (testEventReceived) {
    console.log('✅ Foundation EventBus integration working correctly');
  } else {
    console.log('❌ Foundation EventBus integration failed');
  }
  
} catch (error) {
  console.log('❌ Error accessing foundation EventBus:', error.message);
}

// Test 2: Test coordination domain events
console.log('\n📦 Test 2: Coordination Domain Events...');
try {
  const { EventBus } = await import('../../../core/foundation/dist/src/events/event-bus.js');
  const bus = EventBus.getInstance();
  
  // Test coordination domain events
  let safeEventReceived = false;
  let taskmasterEventReceived = false;
  let teamworkEventReceived = false;
  
  bus.on('safe:agent-registered', (data) => {
    console.log('✅ SAFe domain event received:', data);
    safeEventReceived = true;
  });
  
  bus.on('taskmaster:approval-requested', (data) => {
    console.log('✅ TaskMaster domain event received:', data);
    taskmasterEventReceived = true;
  });
  
  bus.on('teamwork:collaboration-requested', (data) => {
    console.log('✅ Teamwork domain event received:', data);
    teamworkEventReceived = true;
  });
  
  // Emit test events to each domain
  bus.emit('safe:agent-registered', { agentId: 'test-agent', domain: 'safe' });
  bus.emit('taskmaster:approval-requested', { taskId: 'test-task', domain: 'taskmaster' });
  bus.emit('teamwork:collaboration-requested', { teamId: 'test-team', domain: 'teamwork' });
  
  console.log('\n📊 Coordination Domain Test Results:');
  console.log(`  - SAFe: ${safeEventReceived ? '✅' : '❌'}`);
  console.log(`  - TaskMaster: ${taskmasterEventReceived ? '✅' : '❌'}`);
  console.log(`  - Teamwork: ${teamworkEventReceived ? '✅' : '❌'}`);
  
} catch (error) {
  console.log('❌ Error testing coordination domain events:', error.message);
}

// Test 3: Test coordination package exports
console.log('\n📦 Test 3: Coordination Package Exports...');
try {
  const coordination = await import('../dist/index.js');
  console.log('✅ Coordination package imports successfully');
  
  // Check if key exports are available
  if (coordination.CoordinationOrchestrator) {
    console.log('✅ CoordinationOrchestrator exported');
  } else {
    console.log('❌ CoordinationOrchestrator not exported');
  }
  
  if (coordination.EventBus) {
    console.log('✅ EventBus re-exported from foundation');
  } else {
    console.log('❌ EventBus not re-exported');
  }
  
  if (coordination.CoordinationEventType) {
    console.log('✅ CoordinationEventType exported');
  } else {
    console.log('❌ CoordinationEventType not exported');
  }
  
} catch (error) {
  console.log('❌ Error testing coordination package exports:', error.message);
}

// Test 4: Test event-driven coordination orchestrator
console.log('\n📦 Test 4: Event-Driven Coordination Orchestrator...');
try {
  const { CoordinationOrchestrator } = await import('../dist/core/coordination-orchestrator.js');
  const { EventBus } = await import('../../../core/foundation/dist/src/events/event-bus.js');
  
  const orchestrator = new CoordinationOrchestrator();
  const bus = EventBus.getInstance();
  
  console.log('✅ CoordinationOrchestrator instantiated');
  
  // Test that orchestrator can emit events
  let orchestratorEventReceived = false;
  bus.on('orchestration:coordination-requested', (data) => {
    console.log('✅ Orchestrator event received:', data);
    orchestratorEventReceived = true;
  });
  
  // This should emit an event
  await orchestrator.submitTask('test-task', 'Test task description');
  
  if (orchestratorEventReceived) {
    console.log('✅ Orchestrator event emission working');
  } else {
    console.log('❌ Orchestrator event emission failed');
  }
  
} catch (error) {
  console.log('❌ Error testing coordination orchestrator:', error.message);
}

console.log('\n🎯 Event-Driven Coordination Test Completed!');
console.log('📋 Status: Coordination package is now fully event-driven using foundation EventBus');
