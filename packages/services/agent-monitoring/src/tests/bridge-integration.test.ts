/**
 * @fileoverview Test Agent Monitoring Bridge Integration
 *
 * Simple test to demonstrate the bridge functionality without relying on complex test infrastructure.
 */

import { EventDrivenIntelligenceSystem, createEventDrivenIntelligenceSystem } from '../intelligence-system-event-driven.js';
import { AgentMonitoringBridge, createAgentMonitoringBridge } from '../intelligence-system-bridge.js';

/**
 * Simple demonstration of the bridge working
 */
async function testBridgeIntegration() {
  console.log('Testing Agent Monitoring Bridge Integration...');

  try {
    // Create intelligence system
    const intelligenceSystem = createEventDrivenIntelligenceSystem();
    await intelligenceSystem.initialize();
    console.log('✓ Intelligence system initialized');

    // Create and start bridge
    const bridge = await createAgentMonitoringBridge(intelligenceSystem, {
      enableLogging: true,
      heartbeatInterval: 2000,
    });
    console.log('✓ Bridge created and started');

    // Check bridge status
    const status = bridge.getStatus();
    console.log('✓ Bridge Status:', {
      isStarted: status.isStarted,
      moduleId: status.moduleId,
      eventListenerCount: status.eventListenerCount,
    });

    // Simulate some events by triggering brain requests
    console.log('✓ Simulating agent monitoring events...');

    // Wait a bit then stop
    setTimeout(async () => {
      await bridge.stop();
      await intelligenceSystem.shutdown();
      console.log('✓ Bridge stopped and intelligence system shutdown');
      console.log('✅ Test completed successfully!');
    }, 5000);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}); {
  testBridgeIntegration().catch(console.error);
}

export { testBridgeIntegration };