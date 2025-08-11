/**
 * @fileoverview Neural Domain Types - Single Source of Truth
 *
 * All neural network, AI model, and cognitive pattern types.
 * Following Google TypeScript style guide and domain architecture standard.
 */
// Error types
export class NeuralError extends Error {
    code;
    networkId;
    constructor(message, code, networkId) {
        super(message);
        this.code = code;
        this.networkId = networkId;
        this.name = 'NeuralError';
    }
}
export class TrainingError extends NeuralError {
    epoch;
    loss;
    constructor(message, epoch, loss) {
        super(message, 'TRAINING_ERROR');
        this.epoch = epoch;
        this.loss = loss;
        this.name = 'TrainingError';
    }
}
export class ModelError extends NeuralError {
    modelConfig;
    constructor(message, modelConfig) {
        super(message, 'MODEL_ERROR');
        this.modelConfig = modelConfig;
        this.name = 'ModelError';
    }
}
export class CognitivePatternError extends NeuralError {
    patternType;
    constructor(message, patternType) {
        super(message, 'COGNITIVE_PATTERN_ERROR');
        this.patternType = patternType;
        this.name = 'CognitivePatternError';
    }
}
