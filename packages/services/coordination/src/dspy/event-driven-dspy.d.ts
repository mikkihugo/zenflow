/**
 * @fileoverview Event-Driven DSPy - Complete Event Architecture
 *
 * Event-driven DSPy implementation that coordinates via events
 */
import { EventBus } from '@claude-zen/foundation';
/**
 * DSPy optimization request via events
 */
export interface DspyOptimizationRequest {
    requestId: string;
    prompt: string;
    context?: Record<string, unknown>;
    priority?: number;
}
export interface DspyLlmRequest {
    requestId: string;
    messages:  {
        role: string;
        content: string;
    }[];
    model: string;
}
export interface DspyLlmResponse {
    requestId: string;
    content: string;
    metadata?: Record<string, unknown>;
}
export interface DspyOptimizationResult {
    requestId: string;
    optimizedPrompt: string;
    confidence: number;
}
export declare class EventDrivenDspy extends EventBus {
    private pendingOptimizations;
    private pendingLlmCalls;
    private optimizationHistory;
    constructor();
    /**
     * Setup event handlers for complete event-driven architecture
     */
    private setupEventHandlers;
    /**
     * Process optimization request via events
     */
    private processOptimizationRequest;
    /**
     * Call LLM via events
     */
    private callLlmViaEvents;
    /**
     * Generate prompt variation
     */
    private generatePromptVariation;
    /**
     * Evaluate prompt variation
     */
    private evaluatePromptVariation;
    /**
     * Extract prompt from LLM response
     */
    private extractPromptFromResponse;
    /**
     * Calculate similarity between responses
     */
    private calculateSimilarity;
    /**
     * Store optimization result
     */
    private storeOptimizationResult;
}
//# sourceMappingURL=event-driven-dspy.d.ts.map