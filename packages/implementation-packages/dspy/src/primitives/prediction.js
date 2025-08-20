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
 * Utility functions for working with predictions
 */
export class PredictionUtils {
    /**
     * Create a new prediction
     */
    static create(data, options = {}) {
        return {
            data,
            timestamp: Date.now(),
            confidence: 1.0,
            ...options
        };
    }
    /**
     * Merge multiple predictions
     */
    static merge(predictions) {
        if (predictions.length === 0) {
            return { data: {} };
        }
        if (predictions.length === 1) {
            const firstPred = predictions[0];
            if (firstPred) {
                return firstPred;
            }
        }
        // Merge data fields
        const mergedData = {};
        for (const pred of predictions) {
            if (pred.data) {
                Object.assign(mergedData, pred.data);
            }
        }
        // Combine reasoning
        const reasoning = predictions
            .map(p => p.reasoning)
            .filter(Boolean)
            .join(' | ');
        // Average confidence
        const confidences = predictions
            .map(p => p.confidence)
            .filter(c => typeof c === 'number');
        const avgConfidence = confidences.length > 0
            ? confidences.reduce((sum, c) => sum + c, 0) / confidences.length
            : undefined;
        const result = {
            data: mergedData,
            metadata: {
                merged_from: predictions.length,
                merged_at: Date.now()
            }
        };
        if (reasoning) {
            result.reasoning = reasoning;
        }
        if (avgConfidence !== undefined) {
            result.confidence = avgConfidence;
        }
        return result;
    }
    /**
     * Extract specific field from prediction
     */
    static extract(prediction, field, defaultValue) {
        return prediction.data?.[field] ?? prediction[field] ?? defaultValue;
    }
    /**
     * Check if prediction has field
     */
    static hasField(prediction, field) {
        return (prediction.data && field in prediction.data) || field in prediction;
    }
    /**
     * Get all fields from prediction
     */
    static getFields(prediction) {
        const fields = new Set();
        if (prediction.data) {
            Object.keys(prediction.data).forEach(key => fields.add(key));
        }
        Object.keys(prediction).forEach(key => {
            if (key !== 'data') {
                fields.add(key);
            }
        });
        return Array.from(fields);
    }
    /**
     * Validate prediction structure
     */
    static validate(prediction) {
        return prediction && typeof prediction === 'object';
    }
    /**
     * Convert prediction to string
     */
    static toString(prediction) {
        if (prediction.data) {
            return JSON.stringify(prediction.data);
        }
        return JSON.stringify(prediction);
    }
    /**
     * Deep copy prediction
     */
    static deepcopy(prediction) {
        return JSON.parse(JSON.stringify(prediction));
    }
    /**
     * Filter predictions by confidence threshold
     */
    static filterByConfidence(predictions, threshold) {
        return predictions.filter(p => (p.confidence ?? 1.0) >= threshold);
    }
    /**
     * Sort predictions by confidence (descending)
     */
    static sortByConfidence(predictions) {
        return [...predictions].sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));
    }
    /**
     * Get top N predictions by confidence
     */
    static topN(predictions, n) {
        return this.sortByConfidence(predictions).slice(0, n);
    }
}
