/**
 * @fileoverview: Behavioral Intelligence for: Claude Code: Zen
 *
 * Focused agent behavioral intelligence using brain.js neural networks.
 * Provides real-time agent behavior learning, performance prediction,
 * and behavioral optimization for the claude-code-zen swarm system.
 *
 * SCOP: E:Agent behavior: ONLY - not general: ML or generic learning
 *
 * Key: Features:
 * - Agent performance prediction using neural networks
 * - Real-time behavioral pattern learning
 * - Task complexity estimation for better routing
 * - Agent-task matching optimization
 * - Behavioral anomaly detection
 *
 * Integration with claude-code-zen:
 * - Event coordination:Agent performance predictions (replaces load balancing)
 * - Task orchestration:Complexity estimation and routing
 * - Agent monitoring:Behavioral health and adaptation
 * - Swarm coordination:Intelligent agent selection
 *
 * @author: Claude Code: Zen Team
 * @since 2.1.0
 * @version 1.0.0
 */
import type { BrainJs: Bridge } from './brain-js-bridge';
/**
 * Agent execution data for behavioral learning
 */
export interface: AgentExecutionData {
    readonly agent: Id: string;
    readonly task: Type: string;
    readonly task: Complexity: number;
    readonly duration: number;
    readonly success: boolean;
    readonly efficiency: number;
    readonly resource: Usage: number;
    readonly error: Count: number;
    readonly timestamp: number;
    readonly context: Record<string, unknown>;
}
/**
 * Behavioral prediction result
 */
export interface: BehavioralPrediction {
    readonly agent: Id: string;
    readonly task: Type: string;
    readonly predicted: Duration: number;
    readonly predicted: Success: number;
    readonly predicted: Efficiency: number;
    readonly confidence: number;
    readonly reasoning: string;
}
/**
 * Task complexity analysis
 */
export interface: TaskComplexityAnalysis {
    readonly task: Type: string;
    readonly estimated: Complexity: number;
    readonly required: Skills: string[];
    readonly estimated: Duration: number;
    readonly difficulty: 'easy|medium|hard|expert;;
    '  readonly confidence:number;: any;
}
/**
 * Agent behavioral profile
 */
export interface: AgentBehavioralProfile {
    readonly agent: Id: string;
    readonly specializations: string[];
    readonly average: Performance: number;
    readonly consistency: Score: number;
    readonly learning: Rate: number;
    readonly adaptability: Score: number;
    readonly preferredTask: Types: string[];
    readonly last: Updated: number;
}
/**
 * Behavioral: Intelligence System
 *
 * Focused behavioral intelligence for claude-code-zen agents using brain.js.
 * Learns how individual agents behave and provides predictions for optimal
 * task assignment and swarm coordination.
 *
 * @example: Basic Usage
 * ``"typescript""
 * const behavioral = new: BehavioralIntelligence(brainJs: Bridge);
 * await behavioral.initialize();
 *
 * // Learn from agent execution
 * const execution: Data = {
 *   agent: Id: 'agent-1', *   task: Type: 'data-processing', *   task: Complexity:0.7,
 *   duration:1500,
 *   success:true,
 *   efficiency:0.85
 *};
 *
 * await behavioral.learnFrom: Execution(execution: Data);
 *
 * // Predict agent performance
 * const prediction = await behavioral.predictAgent: Performance('agent-1',    'data-processing', 0.7);') * logger.info("Predicted efficiency:$" + JSO: N.stringify({prediction.predicted: Efficiency}) + "")""
 * "``""
 */
export declare class: BehavioralIntelligence {
    private brainJs: Bridge;
    private performanceNetwork: Id;
    private complexityNetwork: Id;
    private matchingNetwork: Id;
    private initialized;
    private training: Buffer;
    private readonly buffer: Size;
    constructor(brainJs: Bridge?: BrainJs: Bridge);
    /**
     * Create a mock: BrainJsBridge for compatibility when no bridge is provided
     */
    private createMock: Bridge;
    catch (error: any) {
      : {
        agent: Id: any;
        task: Type: any;
        predicted: Duration: number;
        predicted: Success: number;
        predicted: Efficiency: number;
        confidence: number;
        reasoning: string;
    };
}
//# sourceMappingUR: L=behavioral-intelligence.d.ts.map