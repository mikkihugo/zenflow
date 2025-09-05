/**
 * @fileoverview Integration Test for System Monitor Bridge
 * 
 * Tests the complete flow from EventDrivenSystemMonitor to EventBus
 */

import { createEventDrivenSystemMonitor } from './packages/services/system-monitoring/src/monitoring-event-driven.js';
import { createSystemMonitoringBridge } from './packages/services/system-monitoring/src/monitoring-event-bridge.js';
import { EventBus } from './packages/core/foundation/dist/src/index.js';

async function testEventFlow() {
  // Removed console.log('🧪 Starting EventBus Integration Test...');
  
  // Create EventBus instance
  const eventBus = EventBus.getInstance();
  
  // Track events received
  const eventsReceived = [];
  
  // Listen for system monitoring events
  const eventTypes = [
    'system-monitoring:tracking-started',
    'system-monitoring:metrics', 
    'system-monitoring:health',
    'system-monitoring:error',
    'telemetry:record-metric',
    'telemetry:record-gauge',
    'registry:module-register',
    'registry:heartbeat'
  ];
  
  eventTypes.forEach(eventType => {
    eventBus.on(eventType, (payload) => {
      // Removed console.log(`📨 EventBus received: ${eventType}`, payload);
      eventsReceived.push({ eventType, payload, timestamp: Date.now() });
    });
  });

  // Removed console.log('👂 Listening for events:', eventTypes);

  // Create monitor and bridge
  // Removed console.log('🏗️  Creating monitor and bridge...');
  const monitor = createEventDrivenSystemMonitor();
  
  const bridge = await createSystemMonitoringBridge(monitor, {
    moduleId: 'test-system-monitoring',
    heartbeatInterval: 2000, // 2 seconds
    enableLogging: true
  });

  // Removed console.log('✅ Bridge created and started');
  // Removed console.log('📊 Bridge Status:', bridge.getStatus());

  // Initialize monitor
  await monitor.initialize();
  // Removed console.log('✅ Monitor initialized');

  // Simulate some brain events to trigger system monitoring responses
  // Removed console.log('🧠 Simulating brain events...');
  
  // Trigger metrics request
  monitor.addEventListener('brain:system-monitoring:get-metrics', (data) => {
    // Removed console.log('🔄 Monitor received brain request:', data);
  });

  // Wait for events to flow
  // Removed console.log('⏳ Waiting 10 seconds for events to flow...');
  await new Promise(resolve => setTimeout(resolve, 10000));

  // Summary
  // Removed console.log('\n📈 Test Results:');
  // Removed console.log(`Events received: ${eventsReceived.length}`);
  
  const eventCounts = eventsReceived.reduce((acc, event) => {
    acc[event.eventType] = (acc[event.eventType] || 0) + 1;
    return acc;
  }, {});
  
  // Removed console.log('Event breakdown:', eventCounts);

  // Check for expected events
  const hasModuleRegister = eventsReceived.some(e => e.eventType === 'registry:module-register');
  const hasHeartbeat = eventsReceived.some(e => e.eventType === 'registry:heartbeat');
  
  // Removed console.log(`✅ Module registration event: ${hasModuleRegister ? 'Yes' : 'No'}`);
  // Removed console.log(`💓 Heartbeat events: ${hasHeartbeat ? 'Yes' : 'No'}`);

  // Cleanup
  // Removed console.log('\n🧹 Cleaning up...');
  bridge.stop();
  await monitor.shutdown();
  
  // Removed console.log('🎉 Integration test completed!');
  
  // Return results for validation
  return {
    eventsReceived: eventsReceived.length,
    hasModuleRegister,
    hasHeartbeat,
    eventCounts
  };
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testEventFlow()
    .then(results => {
      // Removed console.log('\n✅ Test Results:', results);
      if (results.eventsReceived > 0) {
        // Removed console.log('🎉 SUCCESS: Events are flowing through EventBus!');
        process.exit(0);
      } else {
        // Removed console.log('❌ FAILURE: No events received');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

export { testEventFlow };