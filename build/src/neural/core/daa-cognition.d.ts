/**
 * DAA Cognition (Decision, Action, Adaptation)
 * Cognitive decision-making system with adaptive learning.
 */
/**
 * @file Neural network: daa-cognition.
 */
interface DAACognitionOptions {
    adaptationRate?: number;
    decisionThreshold?: number;
    maxHistory?: number;
    [key: string]: any;
}
interface CognitionDecision {
    id: string;
    context: any;
    confidence: number;
    timestamp: Date;
    outcome?: any;
}
interface CognitionAction {
    id: string;
    type: string;
    parameters: any;
    result?: any;
}
interface CognitionAdaptation {
    id: string;
    trigger: string;
    change: any;
    effectiveness?: number;
}
export declare class DAACognition {
    decisions: Map<string, CognitionDecision>;
    actions: Map<string, CognitionAction>;
    adaptations: Map<string, CognitionAdaptation>;
    options: DAACognitionOptions;
    history: any[];
    constructor(options?: DAACognitionOptions);
    /**
     * Make a cognitive decision based on input data.
     *
     * @param context
     * @param options
     */
    makeDecision(context: any, options?: any): Promise<CognitionDecision>;
    /**
     * Execute an action based on decision.
     *
     * @param decisionId
     * @param actionType
     * @param parameters
     */
    executeAction(decisionId: any, actionType: any, parameters?: {}): Promise<{
        id: string;
        decisionId: any;
        type: any;
        parameters: {};
        executed: Date;
        result: null;
    }>;
    /**
     * Adapt based on feedback.
     *
     * @param feedback
     */
    adapt(feedback: any): Promise<{
        id: string;
        trigger: string;
        change: {
            type: string;
            delta: number;
        }[];
        effectiveness: number;
    }>;
    /**
     * Get decision history.
     *
     * @param limit
     */
    getDecisionHistory(limit?: number): any[];
    /**
     * Get cognitive metrics.
     */
    getMetrics(): {
        totalDecisions: number;
        totalActions: number;
        totalAdaptations: number;
        avgConfidence: number;
        adaptationRate: number | undefined;
        recentDecisions: number;
    };
    private calculateConfidence;
    private applyFilters;
    private performAction;
    private calculateAdaptations;
    private applyAdaptations;
    private calculateAverageConfidence;
}
export default DAACognition;
//# sourceMappingURL=daa-cognition.d.ts.map