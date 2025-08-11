/**
 * Neural Domain API
 * Temporary stub to fix import errors
 * xxx NEEDS_HUMAN: Complete implementation based on actual neural functionality.
 */
/**
 * @file Neural network: api.
 */
export interface NeuralModel {
    id: string;
    name: string;
    type: string;
    layers: number[];
    status: 'training' | 'ready' | 'error';
}
export interface TrainingRequest {
    modelId: string;
    data: number[][];
    labels: number[][];
    epochs?: number;
}
export interface PredictionRequest {
    modelId: string;
    input: number[];
}
export interface NeuralMetrics {
    accuracy: number;
    loss: number;
    epochs: number;
    trainingTime: number;
}
/**
 * Neural Domain API class
 * xxx NEEDS_HUMAN: Complete implementation with actual neural services.
 *
 * @example
 */
export declare class NeuralDomainAPI {
    /**
     * Create a new neural model.
     *
     * @param model
     */
    createModel(model: Omit<NeuralModel, 'id' | 'status'>): Promise<NeuralModel>;
    /**
     * Get model by ID.
     *
     * @param modelId
     */
    getModel(modelId: string): Promise<NeuralModel | null>;
    /**
     * List all models.
     */
    listModels(): Promise<NeuralModel[]>;
    /**
     * Train a model.
     *
     * @param request
     */
    train(request: TrainingRequest): Promise<NeuralMetrics>;
    /**
     * Make a prediction.
     *
     * @param request
     */
    predict(request: PredictionRequest): Promise<number[]>;
    /**
     * Delete a model.
     *
     * @param modelId
     */
    deleteModel(modelId: string): Promise<boolean>;
    /**
     * Get training metrics.
     *
     * @param modelId
     */
    getMetrics(modelId: string): Promise<NeuralMetrics | null>;
}
export default NeuralDomainAPI;
//# sourceMappingURL=api.d.ts.map