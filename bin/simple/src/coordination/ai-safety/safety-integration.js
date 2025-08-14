import { createAISafetyOrchestrator, } from './safety-orchestrator.ts';
let globalSafetyOrchestrator = null;
export async function initializeAISafetySystem() {
    if (globalSafetyOrchestrator) {
        return globalSafetyOrchestrator;
    }
    console.log('🛡️ Initializing AI Safety System...');
    globalSafetyOrchestrator = createAISafetyOrchestrator();
    globalSafetyOrchestrator.on('safety:alert', (alert) => {
        console.warn(`🚨 Safety Alert: ${alert.type} from agent ${alert.agentId}`);
    });
    globalSafetyOrchestrator.on('safety:critical', (alert) => {
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
export async function monitorAIInteraction(response, toolCalls, agentId = 'unknown') {
    if (!globalSafetyOrchestrator) {
        await initializeAISafetySystem();
    }
    const interactionData = {
        agentId,
        input: '',
        response,
        toolCalls,
        timestamp: new Date(),
        claimedCapabilities: [],
        actualWork: [],
    };
    return await globalSafetyOrchestrator.analyzeInteraction(interactionData);
}
export function getSafetyMetrics() {
    if (!globalSafetyOrchestrator) {
        return null;
    }
    return globalSafetyOrchestrator.getSafetyMetrics();
}
export async function emergencySafetyShutdown() {
    console.error('🛑 EMERGENCY SAFETY SHUTDOWN INITIATED');
    if (globalSafetyOrchestrator) {
        await globalSafetyOrchestrator.stopSafetyMonitoring();
        console.error('🛑 Safety monitoring stopped');
    }
}
export async function runSafetyMode() {
    console.log('🛡️ Starting Claude Code Zen in SAFETY mode');
    console.log('🔍 Real-time AI deception detection and monitoring active');
    const orchestrator = await initializeAISafetySystem();
    console.log('💻 Safety monitoring dashboard active');
    console.log('Press Ctrl+C to stop monitoring');
    const metricsInterval = setInterval(() => {
        const metrics = orchestrator.getSafetyMetrics();
        console.log('📊 Safety Metrics:', {
            totalInteractions: metrics.totalInteractions,
            deceptionDetected: metrics.deceptionDetected,
            humanEscalations: metrics.humanEscalations,
            totalAlerts: metrics.detectorStats.totalAlerts,
            criticalAlerts: metrics.detectorStats.criticalAlerts,
        });
    }, 10000);
    process.on('SIGINT', async () => {
        console.log('\n🛑 Shutting down safety monitoring...');
        clearInterval(metricsInterval);
        await emergencySafetyShutdown();
        process.exit(0);
    });
    await new Promise(() => { });
}
export const SAFETY_MODE_INTEGRATION = {
    case: 'safety',
    description: 'AI safety monitoring and deception detection',
    handler: runSafetyMode,
};
//# sourceMappingURL=safety-integration.js.map