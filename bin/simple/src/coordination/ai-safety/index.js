export { AIDeceptionDetector, analyzeAIResponse, createAIDeceptionDetector, } from './ai-deception-detector.ts';
export { AISafetyOrchestrator, createAISafetyOrchestrator, } from './safety-orchestrator.ts';
export async function initializeAISafety() {
    const { createAISafetyOrchestrator } = await import('./safety-orchestrator.ts');
    const orchestrator = createAISafetyOrchestrator();
    await orchestrator.startSafetyMonitoring();
    return orchestrator;
}
export async function emergencySafetyShutdown() {
    console.log('🛑 EMERGENCY SAFETY SHUTDOWN INITIATED');
}
//# sourceMappingURL=index.js.map