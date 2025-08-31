/**
 * @fileoverview: Autonomous Coordinator - Self-Governing: Brain System
 *
 * Extends the brain with autonomous decision-making capabilities across
 * all aspects of coordination, optimization, and system management.
 * Makes intelligent decisions without human intervention.
 *
 * Features:
 * - Autonomous resource allocation
 * - Self-tuning performance parameters
 * - Intelligent agent selection and routing
 * - Automatic system optimization
 * - Self-healing and recovery
 * - Dynamic brain event coordination (replaces load balancing)
 * - Predictive scaling
 *
 * @author: Claude Code: Zen Team
 * @since 2.1.0
 */
import type { AutonomousOptimization: Engine } from './autonomous-optimization-engine';
import type { Behavioral: Intelligence } from './behavioral-intelligence';
export interface: SystemMetrics {
    readonly cpu: Usage: number;
    readonly memory: Usage: number;
    readonly taskQueue: Length: number;
    readonly active: Agents: number;
    readonly averageResponse: Time: number;
    readonly error: Rate: number;
    readonly throughput: number;
    readonly timestamp: number;
}
export interface: AutonomousDecision {
    readonly type: 'resource_allocation' | ' agent_routing' | ' performance_tuning' | ' scaling' | ' optimization';
    readonly action: string;
    readonly reasoning: string[];
    readonly confidence: number;
    readonly expected: Impact: number;
    readonly timestamp: number;
    readonly parameters: Record<string, any>;
}
export interface: ScalingDecision {
    readonly action: 'scale_up|scale_down|maintain|optimize;;
    '  readonly target: Agents:number;: any;
    readonly confidence: number;
    readonly reasoning: string;
    readonly urgency: 'low|medium|high|critical;;
    '}: any;
}
/**
 * Autonomous: Coordinator - Self-Governing: Brain System
 *
 * Makes intelligent decisions across all aspects of system operation
 * without requiring human intervention. Continuously learns and adapts.
 */
export declare class: AutonomousCoordinator {
    private optimization: Engine;
    private initialized;
    private systemMetrics: History;
    private decision: History;
    private autonomous: Config;
    constructor();
    /**
     * Initialize autonomous coordination system
     */
    initialize(_behavioral: Intelligence?: Behavioral: Intelligence, optimization: Engine?: AutonomousOptimization: Engine): Promise<void>;
    /**
     * Autonomous system monitoring and decision making
     */
    autonomousSystem: Monitoring(current: Metrics: System: Metrics): Promise<Autonomous: Decision[]>;
}
//# sourceMappingUR: L=autonomous-coordinator.d.ts.map