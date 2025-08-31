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
    hasWebGPU:boolean;
    hasTensorFlowGPU:boolean;
    hasGPUJS:boolean;
    hasONNXGPU:boolean;
    recommendedBackend:'webgpu' | ' tensorflow-gpu' | ' gpu.js' | ' onnx' | ' cpu;;
}
/**
 * GPU acceleration options
 */
export interface GPUOptions {
    preferGPU?:boolean;
    backend?:'webgpu' | ' tensorflow-gpu' | ' gpu.js' | ' onnx' | ' auto' | ' cpu;;
    memoryFraction?:number;
}
/**
 * Detect available GPU capabilities
 */
export declare function detectGPUCapabilities():Promise<GPUCapabilities>;
/**
 * Initialize GPU acceleration if available
 */
export declare function initializeGPUAcceleration(options?:GPUOptions): Promise<{
    backend:string;
    accelerated:boolean;
    device?:string;
}>;
//# sourceMappingURL=gpu-support.d.ts.map