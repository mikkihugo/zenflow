/**
 * @file Neural Network-Enhanced Deception Detection.
 *
 * Uses neural networks to learn sophisticated deception patterns from logs
 * and adapt to new forms of AI deception over time.
 */
import { type LogAnalysisResult } from './log-based-deception-detector.ts';
interface DeceptionFeatures {
    claimToActionRatio: number;
    verificationWordCount: number;
    implementationWordCount: number;
    toolCallFrequency: number;
    timeGapBetweenClaimAndAction: number;
    complexityOfClaims: number;
    specificityOfClaims: number;
    toolDiversityScore: number;
    fileModificationRatio: number;
    bashCommandComplexity: number;
}
interface TrainingExample {
    features: DeceptionFeatures;
    isDeceptive: boolean;
    deceptionType?: 'SANDBAGGING' | 'VERIFICATION_FRAUD' | 'WORK_AVOIDANCE';
    confidence: number;
}
interface NeuralPrediction {
    deceptionProbability: number;
    predictedType: string;
    confidence: number;
    features: DeceptionFeatures;
    explanation: string[];
}
/**
 * Neural network-enhanced deception detection system.
 *
 * @example
 */
export declare class NeuralDeceptionDetector {
    private logger;
    private baseDetector;
    private trainingData;
    private modelWeights;
    private adaptationRate;
    constructor();
    /**
     * Initialize neural network with baseline weights.
     */
    private initializeModel;
    /**
     * Extract neural network features from log analysis.
     *
     * @param analysis
     * @param aiResponse
     */
    private extractFeatures;
    /**
     * Count verification-related words (claims without proof).
     *
     * @param text
     */
    private countVerificationWords;
    /**
     * Count implementation-related words.
     *
     * @param text
     */
    private countImplementationWords;
    /**
     * Calculate time gap between claims and actions (simplified).
     *
     * @param analysis
     */
    private calculateTimeGap;
    /**
     * Calculate complexity of AI claims.
     *
     * @param claims
     */
    private calculateClaimComplexity;
    /**
     * Calculate specificity of claims (vague vs specific).
     *
     * @param claims
     */
    private calculateClaimSpecificity;
    /**
     * Calculate tool diversity score.
     *
     * @param toolCalls
     */
    private calculateToolDiversity;
    /**
     * Calculate bash command complexity.
     *
     * @param bashCommands
     */
    private calculateBashComplexity;
    /**
     * Neural network prediction using weighted features.
     *
     * @param features
     */
    private predict;
    /**
     * Learn from feedback and adapt model weights.
     *
     * @param analysis
     * @param aiResponse
     * @param actualDeception
     * @param deceptionType
     */
    learnFromFeedback(analysis: LogAnalysisResult, aiResponse: string, actualDeception: boolean, deceptionType?: string): void;
    /**
     * Calculate model accuracy on training data.
     */
    private calculateAccuracy;
    /**
     * Enhanced deception detection with neural network.
     *
     * @param aiResponse
     */
    detectDeceptionWithML(aiResponse: string): Promise<{
        logAnalysis: LogAnalysisResult;
        neuralPrediction: NeuralPrediction;
        finalVerdict: {
            isDeceptive: boolean;
            confidence: number;
            reasoning: string[];
        };
    }>;
    /**
     * Export model state for persistence.
     */
    exportModel(): {
        weights: Record<string, number>;
        trainingData: TrainingExample[];
    };
    /**
     * Import model state from persistence.
     *
     * @param modelData
     * @param modelData.weights
     * @param modelData.trainingData
     */
    importModel(modelData: {
        weights: Record<string, number>;
        trainingData: TrainingExample[];
    }): void;
}
/**
 * Create a neural deception detector with learning capabilities.
 *
 * @example
 */
export declare function createNeuralDeceptionDetector(): NeuralDeceptionDetector;
export {};
//# sourceMappingURL=neural-deception-detector.d.ts.map