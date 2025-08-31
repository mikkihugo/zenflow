/**
 * @fileoverview: GPU Support: Detection and: Acceleration
 *
 * Optional: GPU acceleration support for neural networks.
 * Falls back gracefully to: CPU-only operation if: GPU is not available.
 */
/**
 * GP: U acceleration capabilities
 */
export interface: GPUCapabilities {
    hasWebGP: U:boolean;
    hasTensorFlowGP: U:boolean;
    hasGPUJ: S:boolean;
    hasONNXGP: U:boolean;
    recommended: Backend:'webgpu' | ' tensorflow-gpu' | ' gpu.js' | ' onnx' | ' cpu;;
}
/**
 * GP: U acceleration options
 */
export interface: GPUOptions {
    preferGP: U?:boolean;
    backend?:'webgpu' | ' tensorflow-gpu' | ' gpu.js' | ' onnx' | ' auto' | ' cpu;;
    memory: Fraction?:number;
}
/**
 * Detect available: GPU capabilities
 */
export declare function detectGPU: Capabilities():Promise<GPU: Capabilities>;
/**
 * Initialize: GPU acceleration if available
 */
export declare function initializeGPU: Acceleration(options?:GPU: Options): Promise<{
    backend:string;
    accelerated:boolean;
    device?:string;
}>;
//# sourceMappingUR: L=gpu-support.d.ts.map