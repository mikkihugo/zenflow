/**
 * @fileoverview Autonomous Teleprompter Selector - Intelligent ML Selection
 *
 * Provides autonomous selection between basic mathematical teleprompters and
 * ML-enhanced variants using the DSPy-Brain ML Bridge for intelligent analysis.
 * This system automatically determines whether to use standard optimization
 * or advanced ML capabilities based on task characteristics and performance history.
 *
 * Key Features:
 * - 🤖 Autonomous teleprompter selection using ML analysis
 * - 📊 Performance-based decision making with historical data
 * - 🧠 Integration with DSPy-Brain ML Bridge for intelligent recommendations
 * - ⚡ Adaptive learning from usage patterns and success rates
 * - 🎯 Multi-objective optimization (accuracy, speed, memory, complexity)
 * - 📈 Confidence scoring and uncertainty quantification
 * - 🔄 Fallback mechanisms for robust operation
 *
 * Architecture:
 * - Task analysis using natural language processing and pattern recognition
 * - Historical performance tracking for each teleprompter variant
 * - ML-powered recommendation engine using DSPy-Brain Bridge
 * - Confidence-based selection with fallback to proven alternatives
 * - Real-time adaptation based on success/failure feedback
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 1.0.0
 */
import { EventEmitter } from 'node:events';
export interface OptimizationTask {
    id: string;
    description: string;
    domain: TaskDomain;
    complexity: TaskComplexity;
    requirements: TaskRequirements;
    constraints: TaskConstraints;
    metadata?: Record<string, any>;
}
export interface TaskDomain {
    type: 'nlp' | 'vision' | 'reasoning' | 'classification' | 'generation' | 'multimodal' | 'general';
    specificArea?: string;
    dataCharacteristics: {
        size: 'small' | 'medium' | 'large' | 'massive';
        quality: 'poor' | 'fair' | 'good' | 'excellent';
        complexity: 'simple' | 'moderate' | 'complex' | 'highly_complex';
    };
}
export interface TaskComplexity {
    computational: 'low' | 'medium' | 'high' | 'extreme';
    algorithmic: 'basic' | 'intermediate' | 'advanced' | 'research_level';
    dataVolume: 'tiny' | 'small' | 'medium' | 'large' | 'huge';
    timeConstraints: 'relaxed' | 'moderate' | 'tight' | 'critical';
}
export interface TaskRequirements {
    minimumAccuracy: number;
    maximumLatency: number;
    memoryConstraints: number;
    robustness: 'basic' | 'moderate' | 'high' | 'critical';
    interpretability: 'not_required' | 'helpful' | 'important' | 'mandatory';
}
export interface TaskConstraints {
    computationalBudget: 'unlimited' | 'high' | 'moderate' | 'limited' | 'minimal';
    timeLimit: number;
    memoryLimit: number;
    qualityThreshold: number;
    fallbackRequired: boolean;
}
export interface TeleprompterSelection {
    selectedTeleprompter: TeleprompterVariant;
    confidence: number;
    reasoning: string;
    alternatives: TeleprompterVariant[];
    expectedPerformance: PerformanceEstimate;
    fallbackOptions: TeleprompterVariant[];
    selectionMetadata: SelectionMetadata;
}
export interface TeleprompterVariant {
    name: string;
    type: 'basic' | 'ml_enhanced';
    algorithm: 'miprov2' | 'copro' | 'bootstrap' | 'grpo' | 'custom';
    implementation: string;
    capabilities: string[];
    requiredResources: ResourceRequirements;
    estimatedPerformance: PerformanceEstimate;
}
export interface ResourceRequirements {
    computationLevel: 'minimal' | 'low' | 'moderate' | 'high' | 'intensive';
    memoryUsage: number;
    timeComplexity: 'O(1)' | 'O(log n)' | 'O(n)' | 'O(n log n)' | 'O(n²)' | 'O(2^n)';
    gpuRequired: boolean;
    networkAccess: boolean;
}
export interface PerformanceEstimate {
    accuracy: {
        mean: number;
        std: number;
        min: number;
        max: number;
    };
    speed: {
        mean: number;
        std: number;
        min: number;
        max: number;
    };
    memory: {
        mean: number;
        std: number;
        min: number;
        max: number;
    };
    robustness: number;
    confidence: number;
    sourceData: 'historical' | 'predicted' | 'hybrid';
}
export interface SelectionMetadata {
    analysisTime: number;
    decisionFactors: Array<{
        factor: string;
        weight: number;
        value: number;
    }>;
    uncertaintyFactors: string[];
    recommendationSource: 'ml_bridge' | 'historical' | 'heuristic' | 'hybrid';
    alternativeEvaluations: number;
    confidenceBreakdown: Record<string, number>;
}
export interface TeleprompterPerformanceRecord {
    teleprompterName: string;
    taskId: string;
    taskCharacteristics: OptimizationTask;
    actualPerformance: {
        accuracy: number;
        speed: number;
        memory: number;
        robustness: number;
        success: boolean;
    };
    timestamp: Date;
    executionContext: Record<string, any>;
}
export interface PerformanceHistory {
    teleprompterName: string;
    totalExecutions: number;
    successRate: number;
    averagePerformance: {
        accuracy: number;
        speed: number;
        memory: number;
        robustness: number;
    };
    performanceVariance: {
        accuracy: number;
        speed: number;
        memory: number;
        robustness: number;
    };
    domainSpecificPerformance: Map<string, PerformanceEstimate>;
    recentTrends: {
        improving: boolean;
        degrading: boolean;
        stable: boolean;
    };
}
/**
 * Autonomous Teleprompter Selector - Intelligent ML Selection System
 *
 * This class provides autonomous selection between basic mathematical teleprompters
 * and ML-enhanced variants using sophisticated analysis and machine learning.
 */
export declare class AutonomousTeleprompterSelector extends EventEmitter {
    private logger;
    private mlBridge;
    private initialized;
    private availableVariants;
    private performanceHistory;
    private recentRecords;
    private selectionHistory;
    private adaptationParameters;
    constructor();
    /**
     * Initialize the autonomous selector with available teleprompter variants.
     */
    initialize(): Promise<void>;
    /**
     * Autonomously select the optimal teleprompter for a given optimization task.
     *
     * @param task - The optimization task to analyze
     * @returns Selected teleprompter with confidence and reasoning
     */
    selectOptimalTeleprompter(task: OptimizationTask): Promise<TeleprompterSelection>;
    /**
     * Record the actual performance of a selected teleprompter for learning.
     *
     * @param taskId - The task ID
     * @param teleprompterName - The teleprompter that was used
     * @param actualPerformance - The actual performance achieved
     */
    recordPerformance(taskId: string, teleprompterName: string, actualPerformance: TeleprompterPerformanceRecord['actualPerformance']): Promise<void>;
    /**
     * Get current selector status and analytics.
     */
    getStatus(): {
        initialized: boolean;
        availableVariants: number;
        performanceRecords: number;
        selectionHistory: number;
        mlBridgeStatus: any;
        adaptationParameters: any;
    };
    private registerTeleprompterVariants;
    private registerAdditionalVariants;
    private analyzeTaskCharacteristics;
    private generateTaskDescription;
    private evaluateAllVariants;
    private evaluateVariantForTask;
    private calculateAccuracyFit;
    private calculateSpeedFit;
    private calculateMemoryFit;
    private calculateRobustnessFit;
    private mapRobustnessRequirement;
    private applyPerformanceWeighting;
    private getDomainSpecificBonus;
    private getTrendBonus;
    private makeFinalSelection;
    private enrichSelection;
    private enhancePerformanceEstimate;
    private createFallbackSelection;
    private calculateDomainComplexity;
    private estimateComputationalRequirements;
    private analyzeDataCharacteristics;
    private assessConstraints;
    private assessRequirements;
    private generateReasoningText;
    private generateDecisionFactors;
    private identifyUncertaintyFactors;
    private generateConfidenceBreakdown;
    private findTaskById;
    private getSystemLoad;
    private loadPerformanceHistory;
    private updatePerformanceHistory;
    private adaptSelectionParameters;
    /**
     * Export performance data for analysis.
     */
    exportPerformanceData(): {
        performanceHistory: Array<[string, PerformanceHistory]>;
        recentRecords: TeleprompterPerformanceRecord[];
        selectionHistory: TeleprompterSelection[];
        adaptationParameters: any;
    };
    /**
     * Clean up resources.
     */
    destroy(): Promise<void>;
}
/**
 * Factory function to create Autonomous Teleprompter Selector.
 */
export declare function createAutonomousTeleprompterSelector(): AutonomousTeleprompterSelector;
export default AutonomousTeleprompterSelector;
//# sourceMappingURL=teleprompter-selector.d.ts.map