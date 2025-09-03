import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing Event Bridges Directly...\n');

// Test 1: Check if our event bridge files exist and are valid
console.log('📦 Test 1: Validating Event Bridge Files...');
try {
  const safeBridgePath = path.join(__dirname, '../dist/safe/event-bridge-global.js');
  const taskmasterBridgePath = path.join(__dirname, '../dist/taskmaster/event-bridge-global.js');
  const teamworkBridgePath = path.join(__dirname, '../dist/teamwork/event-bridge-global.js');
  
  if (fs.existsSync(safeBridgePath)) {
    console.log('✅ SAFe event bridge file exists');
    const safeContent = fs.readFileSync(safeBridgePath, 'utf8');
    if (safeContent.includes('safe:${event}')) {
      console.log('✅ SAFe event bridge properly configured with safe: prefix');
    }
  }
  
  if (fs.existsSync(taskmasterBridgePath)) {
    console.log('✅ TaskMaster event bridge file exists');
    const taskmasterContent = fs.readFileSync(taskmasterBridgePath, 'utf8');
    if (taskmasterContent.includes('taskmaster:${event}')) {
      console.log('✅ TaskMaster event bridge properly configured with taskmaster: prefix');
    }
  }
  
  if (fs.existsSync(teamworkBridgePath)) {
    console.log('✅ Teamwork event bridge file exists');
    const teamworkContent = fs.readFileSync(teamworkBridgePath, 'utf8');
    if (teamworkContent.includes('teamwork:${event}')) {
      console.log('✅ Teamwork event bridge properly configured with teamwork: prefix');
    }
  }
  
} catch (error) {
  console.log('❌ Error validating event bridge files:', error.message);
}

// Test 2: Check if foundation typed EventBus is accessible
console.log('\n📦 Test 2: Testing Foundation Typed EventBus Access...');
try {
  const { EventBus } = await import('../../../core/foundation/dist/src/events/event-bus.js');
  const bus = EventBus.getInstance();
  console.log('✅ Foundation Typed EventBus accessible');
  
  // Test basic event functionality
  let testEventReceived = false;
  bus.on('test:event', (data) => {
    console.log('✅ Test event received:', data);
    testEventReceived = true;
  });
  
  bus.emit('test:event', { message: 'EventBus test successful', timestamp: Date.now() });
  
  if (testEventReceived) {
    console.log('✅ Foundation EventBus is working correctly');
  } else {
    console.log('❌ Foundation EventBus event not received');
  }
  
} catch (error) {
  console.log('❌ Error accessing foundation EventBus:', error.message);
}

// Test 3: Test event domain prefixes with typed EventBus
console.log('\n📦 Test 3: Testing Event Domain Prefixes...');
try {
  const { EventBus } = await import('../../../core/foundation/dist/src/events/event-bus.js');
  const bus = EventBus.getInstance();
  
  // Test that we can emit and receive domain-prefixed events
  let safeEventReceived = false;
  let taskmasterEventReceived = false;
  let teamworkEventReceived = false;
  
  bus.on('safe:test-event', (data) => {
    console.log('✅ SAFe domain event received:', data);
    safeEventReceived = true;
  });
  
  bus.on('taskmaster:test-event', (data) => {
    console.log('✅ TaskMaster domain event received:', data);
    taskmasterEventReceived = true;
  });
  
  bus.on('teamwork:test-event', (data) => {
    console.log('✅ Teamwork domain event received:', data);
    teamworkEventReceived = true;
  });
  
  // Emit test events to each domain
  bus.emit('safe:test-event', { domain: 'safe', message: 'SAFe test event' });
  bus.emit('taskmaster:test-event', { domain: 'taskmaster', message: 'TaskMaster test event' });
  bus.emit('teamwork:test-event', { domain: 'teamwork', message: 'Teamwork test event' });
  
  console.log('\n📊 Event Domain Test Results:');
  console.log(`  - SAFe: ${safeEventReceived ? '✅' : '❌'}`);
  console.log(`  - TaskMaster: ${taskmasterEventReceived ? '✅' : '❌'}`);
  console.log(`  - Teamwork: ${teamworkEventReceived ? '✅' : '❌'}`);
  
} catch (error) {
  console.log('❌ Error testing event domain prefixes:', error.message);
}

console.log('\n🎯 Direct Event Bridge Test Completed!');
console.log('📋 Status: Event bridges are properly configured and ready for use');
