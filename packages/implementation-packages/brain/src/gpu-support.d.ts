/**
 * @fileoverview GPU Support Detection and Acceleration
 *
 * Optional GPU acceleration support for neural networks.
 * Falls back gracefully to CPU-only operation if GPU is not available.
 */
/**
 * GPU acceleration capabilities
 */
export interface GPUCapabilities {
    hasWebGPU: boolean;
    hasTensorFlowGPU: boolean;
    hasGPUJS: boolean;
    hasONNXGPU: boolean;
    recommendedBackend: 'webgpu' | 'tensorflow-gpu' | 'gpu.js' | 'onnx' | 'cpu';
}
/**
 * GPU acceleration options
 */
export interface GPUOptions {
    preferGPU?: boolean;
    backend?: 'webgpu' | 'tensorflow-gpu' | 'gpu.js' | 'onnx' | 'auto' | 'cpu';
    memoryFraction?: number;
}
/**
 * Detect available GPU capabilities
 */
export declare function detectGPUCapabilities(): Promise<GPUCapabilities>;
/**
 * Initialize GPU acceleration if available
 */
export declare function initializeGPUAcceleration(options?: GPUOptions): Promise<{
    backend: string;
    accelerated: boolean;
    device?: string;
}>;
/**
 * Create a GPU-accelerated neural network if possible
 */
export declare function createAcceleratedNeuralNetwork(architecture: any, options?: GPUOptions): Promise<{
    network: any;
    backend: string;
    accelerated: boolean;
}>;
/**
 * GPU-accelerated matrix operations using GPU.js
 */
export declare class GPUMatrix {
    private gpu;
    private kernels;
    constructor();
    private initializeGPU;
    /**
     * GPU-accelerated matrix multiplication
     */
    multiply(a: number[][], b: number[][]): Promise<number[][]>;
    private cpuMultiply;
    /**
     * Cleanup GPU resources
     */
    destroy(): void;
}
export declare const isGPUAvailable: () => Promise<boolean>;
export declare const getRecommendedGPUBackend: () => Promise<string>;
//# sourceMappingURL=gpu-support.d.ts.map