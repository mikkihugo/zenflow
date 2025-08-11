/**
 * Neural Service Implementation.
 *
 * Service implementation for neural network operations, machine learning,
 * and AI model management. Integrates with existing neural systems.
 */
/**
 * @file Neural service implementation.
 */
import type { IService } from '../core/interfaces.ts';
import type { NeuralServiceConfig, ServiceOperationOptions } from '../types.ts';
import { BaseService } from './base-service.ts';
/**
 * Neural service implementation.
 *
 * @example
 */
export declare class NeuralService extends BaseService implements IService {
    private models;
    private trainingJobs;
    private inferenceCache;
    constructor(config: NeuralServiceConfig);
    protected doInitialize(): Promise<void>;
    protected doStart(): Promise<void>;
    protected doStop(): Promise<void>;
    protected doDestroy(): Promise<void>;
    protected doHealthCheck(): Promise<boolean>;
    protected executeOperation<T = any>(operation: string, params?: any, _options?: ServiceOperationOptions): Promise<T>;
    private loadModel;
    private unloadModel;
    private getModels;
    private predict;
    private batchPredict;
    private startTraining;
    private stopTraining;
    private getTrainingJobs;
    private getTrainingStatus;
    private clearInferenceCache;
    private getNeuralStats;
    private initializeGPU;
    private checkGPUHealth;
    private startCacheCleanup;
    private simulatePrediction;
    private simulateTraining;
}
export default NeuralService;
//# sourceMappingURL=neural-service.d.ts.map