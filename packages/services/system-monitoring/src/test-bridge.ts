/**
 * @fileoverview Test Bridge Integration
 *
 * Simple test to verify the bridge works correctly
 */

import { createEventDrivenSystemMonitor } from './monitoring-event-driven.js';
import { createSystemMonitoringBridge } from './monitoring-event-bridge.js';
import { EventBus } from '@claude-zen/foundation';

async function testBridgeIntegration(): Promise<void> {
  console.log('🧪 Testing System Monitor Bridge Integration...');

  // Create monitor and bridge
  const monitor = createEventDrivenSystemMonitor();
  const bridge = await createSystemMonitoringBridge(monitor, {
    moduleId: 'test-system-monitoring',
    heartbeatInterval: 1000, // 1 second for testing
    enableLogging: true,
  });

  const eventBus = EventBus.getInstance();

  // Test event forwarding
  eventBus.on('system-monitoring:metrics', (payload) => {
    console.log('✅ Received forwarded event:', payload);
  });

  // Initialize monitor to start emitting events
  await monitor.initialize();

  // Wait a bit for events to flow
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Trigger a metrics request to see if events flow
  monitor.addEventListener('brain:system-monitoring:get-metrics', () => {
    console.log('📊 Brain requested metrics');
  });

  // Check bridge status
  const status = bridge.getStatus();
  console.log('🔍 Bridge Status:', status);

  // Cleanup
  bridge.stop();
  await monitor.shutdown();

  console.log('🎉 Bridge test completed');
  
  if (status.isStarted) {
    console.log('✅ Bridge started successfully');
  } else {
    console.log('❌ Bridge failed to start');
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testBridgeIntegration().catch(console.error);
}

export { testBridgeIntegration };