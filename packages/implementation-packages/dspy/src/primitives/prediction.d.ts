/**
 * @fileoverview DSPy Prediction - Production Grade
 *
 * Core Prediction interface for DSPy module outputs.
 * 100% compatible with Stanford DSPy's Prediction interface.
 *
 * @version 1.0.0
 * @author Claude Code Zen Team
 */
/**
 * DSPy Prediction interface
 * Represents the output of a DSPy module execution
 */
export interface Prediction {
    /** The main data/result of the prediction */
    data?: Record<string, any>;
    /** Reasoning or explanation for the prediction */
    reasoning?: string;
    /** Confidence score (0-1) */
    confidence?: number;
    /** Metadata about the prediction */
    metadata?: Record<string, any>;
    /** Raw completion text from LM */
    completion_text?: string;
    /** Timestamp when prediction was made */
    timestamp?: number;
    /** Model used for prediction */
    model?: string;
    /** Cost/tokens used for prediction */
    cost?: {
        input_tokens?: number;
        output_tokens?: number;
        total_cost?: number;
    };
    /** Any additional fields */
    [key: string]: any;
}
/**
 * Utility functions for working with predictions
 */
export declare class PredictionUtils {
    /**
     * Create a new prediction
     */
    static create(data: Record<string, any>, options?: Partial<Prediction>): Prediction;
    /**
     * Merge multiple predictions
     */
    static merge(predictions: Prediction[]): Prediction;
    /**
     * Extract specific field from prediction
     */
    static extract(prediction: Prediction, field: string, defaultValue?: any): any;
    /**
     * Check if prediction has field
     */
    static hasField(prediction: Prediction, field: string): boolean;
    /**
     * Get all fields from prediction
     */
    static getFields(prediction: Prediction): string[];
    /**
     * Validate prediction structure
     */
    static validate(prediction: any): prediction is Prediction;
    /**
     * Convert prediction to string
     */
    static toString(prediction: Prediction): string;
    /**
     * Deep copy prediction
     */
    static deepcopy(prediction: Prediction): Prediction;
    /**
     * Filter predictions by confidence threshold
     */
    static filterByConfidence(predictions: Prediction[], threshold: number): Prediction[];
    /**
     * Sort predictions by confidence (descending)
     */
    static sortByConfidence(predictions: Prediction[]): Prediction[];
    /**
     * Get top N predictions by confidence
     */
    static topN(predictions: Prediction[], n: number): Prediction[];
}
export default Prediction;
//# sourceMappingURL=prediction.d.ts.map