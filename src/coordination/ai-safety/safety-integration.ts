/**
 * @file AI Safety Integration with Main System.
 * 
 * Integrates the AI deception detection system with the main Claude Code application.
 * Adds 'safety' mode to main.ts and provides integration hooks.
 */

import { AISafetyOrchestrator, createAISafetyOrchestrator } from './safety-orchestrator';
import type { DeceptionAlert, AIInteractionData } from './ai-deception-detector';

/**
 * Global safety orchestrator instance.
 */
let globalSafetyOrchestrator: AISafetyOrchestrator | null = null;

/**
 * Initialize AI safety monitoring system.
 *
 * @example
 */
export async function initializeAISafetySystem(): Promise<AISafetyOrchestrator> {
  if (globalSafetyOrchestrator) {
    return globalSafetyOrchestrator;
  }

  console.log('🛡️ Initializing AI Safety System...');
  
  globalSafetyOrchestrator = createAISafetyOrchestrator();
  
  // Set up event handlers for the global instance
  globalSafetyOrchestrator.on('safety:alert', (alert: DeceptionAlert) => {
    console.warn(`🚨 Safety Alert: ${alert.type} from agent ${alert.agentId}`);
  });

  globalSafetyOrchestrator.on('safety:critical', (alert: DeceptionAlert) => {
    console.error(`🛑 CRITICAL Safety Alert: ${alert.type}`);
    console.error(`   Agent: ${alert.agentId}`);
    console.error(`   Evidence: ${alert.evidence.join(', ')}`);
    console.error(`   Intervention: ${alert.intervention}`);
  });

  globalSafetyOrchestrator.on('safety:emergency-pause', () => {
    console.error('⏸️ EMERGENCY: All agent sessions paused');
  });

  globalSafetyOrchestrator.on('safety:human-notification', (notification) => {
    console.error('📢 HUMAN ESCALATION:', notification);
  });

  await globalSafetyOrchestrator.startSafetyMonitoring();
  
  console.log('✅ AI Safety System initialized and monitoring active');
  
  return globalSafetyOrchestrator;
}

/**
 * Monitor AI interaction for deception patterns
 * Use this function to analyze any AI response in the system.
 *
 * @param response
 * @param toolCalls
 * @param agentId
 * @example
 */
export async function monitorAIInteraction(
  response: string, 
  toolCalls: string[], 
  agentId: string = 'unknown'
): Promise<DeceptionAlert[]> {
  if (!globalSafetyOrchestrator) {
    await initializeAISafetySystem();
  }

  const interactionData: AIInteractionData = {
    agentId,
    input: '',
    response,
    toolCalls,
    timestamp: new Date(),
    claimedCapabilities: [],
    actualWork: []
  };

  return await globalSafetyOrchestrator!.analyzeInteraction(interactionData);
}

/**
 * Get safety metrics and statistics.
 *
 * @example
 */
export function getSafetyMetrics() {
  if (!globalSafetyOrchestrator) {
    return null;
  }
  return globalSafetyOrchestrator.getSafetyMetrics();
}

/**
 * Emergency safety shutdown.
 *
 * @example
 */
export async function emergencySafetyShutdown(): Promise<void> {
  console.error('🛑 EMERGENCY SAFETY SHUTDOWN INITIATED');
  
  if (globalSafetyOrchestrator) {
    await globalSafetyOrchestrator.stopSafetyMonitoring();
    console.error('🛑 Safety monitoring stopped');
  }
  
  // In a real implementation, this would:
  // 1. Pause all running AI agents
  // 2. Lock down system capabilities
  // 3. Alert human operators
  // 4. Generate safety incident report
}

/**
 * Safety mode main entry point for claude-zen safety command.
 *
 * @example
 */
export async function runSafetyMode(): Promise<void> {
  console.log('🛡️ Starting Claude Code Zen in SAFETY mode');
  console.log('🔍 Real-time AI deception detection and monitoring active');
  
  const orchestrator = await initializeAISafetySystem();
  
  // Keep the process running
  console.log('💻 Safety monitoring dashboard active');
  console.log('Press Ctrl+C to stop monitoring');
  
  // Display live metrics every 10 seconds
  const metricsInterval = setInterval(() => {
    const metrics = orchestrator.getSafetyMetrics();
    console.log('📊 Safety Metrics:', {
      totalInteractions: metrics.totalInteractions,
      deceptionDetected: metrics.deceptionDetected,
      humanEscalations: metrics.humanEscalations,
      totalAlerts: metrics.detectorStats.totalAlerts,
      criticalAlerts: metrics.detectorStats.criticalAlerts
    });
  }, 10000);

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down safety monitoring...');
    clearInterval(metricsInterval);
    await emergencySafetyShutdown();
    process.exit(0);
  });

  // Keep the process alive
  await new Promise(() => {}); // Run forever until SIGINT
}

/**
 * Hook for integration with main system modes
 * Add this to main.ts in the switch statement.
 */
export const SAFETY_MODE_INTEGRATION = {
  case: 'safety',
  description: 'AI safety monitoring and deception detection',
  handler: runSafetyMode
};