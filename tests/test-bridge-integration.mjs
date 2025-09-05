#!/usr/bin/env node

/**
 * Simple test script to verify the bridge works
 */

import { createEventDrivenSystemMonitor } from '../packages/services/system-monitoring/src/monitoring-event-driven.js';
import { createSystemMonitoringBridge } from '../packages/services/system-monitoring/src/monitoring-event-bridge.js';

async function main() {
  // 🧪 Testing System Monitor Bridge...
  
  try {
    // Create monitor
    const monitor = createEventDrivenSystemMonitor();
    
    // Create bridge
    const bridge = await createSystemMonitoringBridge(monitor, {
      moduleId: 'test-system-monitoring',
      heartbeatInterval: 2000,
      enableLogging: true,
    });

    // ✅ Bridge created successfully
    // 📊 Bridge Status: bridge.getStatus()

    // Initialize monitor
    await monitor.initialize();
    // ✅ Monitor initialized

    // Let it run for a few seconds
    // ⏳ Running for 5 seconds...
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Cleanup
    bridge.stop();
    await monitor.shutdown();
    
    // 🎉 Test completed successfully!
    
  } catch (error) {
    // ❌ Test failed: error
    process.exit(1);
  }
}

main();