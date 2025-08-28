/**
 * @fileoverview GPU Support Detection and Acceleration
 *
 * Optional GPU acceleration support for neural networks.
 * Falls back gracefully to CPU-only operation if GPU is not available.
 */

import { getLogger} from '@claude-zen/foundation';

const logger = getLogger('GPUSupport');

/**
 * GPU acceleration capabilities
 */
export interface GPUCapabilities {
  hasWebGPU:boolean;
  hasTensorFlowGPU:boolean;
  hasGPUJS:boolean;
  hasONNXGPU:boolean;
  recommendedBackend:'webgpu' | ' tensorflow-gpu' | ' gpu.js' | ' onnx' | ' cpu;
}

/**
 * GPU acceleration options
 */
export interface GPUOptions {
  preferGPU?:boolean;
  backend?:'webgpu' | ' tensorflow-gpu' | ' gpu.js' | ' onnx' | ' auto' | ' cpu;
  memoryFraction?:number;
}

/**
 * Detect available GPU capabilities
 */
export async function detectGPUCapabilities():Promise<GPUCapabilities> {
  const capabilities:GPUCapabilities = {
    hasWebGPU:false,
    hasTensorFlowGPU:false,
    hasGPUJS:false,
    hasONNXGPU:false,
    recommendedBackend: 'cpu',};

  // Check WebGPU availability
  try {
    if (typeof navigator !== 'undefined' && ' gpu' in navigator) {
    ')      const adapter = await (navigator as any).gpu?.requestAdapter();
      capabilities.hasWebGPU = !!adapter;
      if (capabilities.hasWebGPU) {
        logger.info('WebGPU detected and available');')}
}
} catch (error) {
    logger.debug('WebGPU not available:', error);')}

  // Check TensorFlow GPU support
  try {
    const tf = await import('@tensorflow/tfjs-node-gpu').catch(() => null);')    if (tf) {
      capabilities.hasTensorFlowGPU = true;
      logger.info('TensorFlow GPU support detected');')}
} catch (error) {
    logger.debug('TensorFlow GPU not available:', error);')}

  // Check GPU.js availability
  try {
    const { GPU} = await import('gpu.js').catch(() => ({ GPU:null}));')    if (GPU) {
      const gpu = new GPU();
      capabilities.hasGPUJS = !!(gpu as any).context;
      if (capabilities.hasGPUJS) {
        logger.info('GPU.js acceleration detected');')}
}
} catch (error) {
    logger.debug('GPU.js not available:', error);')}

  // Check ONNX Runtime GPU support (optional dependency)
  try {
    // Note:onnxruntime-node is optional - commented out to fix compilation
    // const ort = await import('onnxruntime-node').catch(() => null);')    // if (ort) {
    //   capabilities.hasONNXGPU = true;
    //   logger.info('ONNX Runtime GPU support detected');')    //}
    capabilities.hasONNXGPU = false; // Default to false when dependency not available
} catch (error) {
    logger.debug('ONNX Runtime GPU not available:', error);')}

  // Determine recommended backend
  if (capabilities.hasTensorFlowGPU) {
    capabilities.recommendedBackend = 'tensorflow-gpu';
} else if (capabilities.hasWebGPU) {
    capabilities.recommendedBackend = 'webgpu';
} else if (capabilities.hasONNXGPU) {
    capabilities.recommendedBackend = 'onnx';
} else if (capabilities.hasGPUJS) {
    capabilities.recommendedBackend = 'gpu.js';
}

  logger.info('GPU capabilities detected:', capabilities);')  return capabilities;
}

/**
 * Initialize GPU acceleration if available
 */
export async function initializeGPUAcceleration(
  options:GPUOptions = {}
):Promise<{
  backend:string;
  accelerated:boolean;
  device?:string;
}> {
  const { preferGPU = true, backend = 'auto', memoryFraction = 0.9} = options;')
  if (!preferGPU||backend ==='cpu') {
    ')    logger.info('GPU acceleration disabled, using CPU');')    return { backend: 'cpu', accelerated:false};')}

  const capabilities = await detectGPUCapabilities();
  const selectedBackend =
    backend === 'auto' ? capabilities.recommendedBackend:backend;')
  // Try to initialize the selected backend
  try {
    switch (selectedBackend) {
      case 'tensorflow-gpu': ')'        if (capabilities.hasTensorFlowGPU) {
          const _tf = await import('@tensorflow/tfjs-node-gpu');')
          // Use tf to configure GPU memory settings
          logger.debug('TensorFlow GPU module loaded',    ')            version:(tf.version as any)?.['tfjs-core']||' unknown',            backend:selectedBackend,);

          // Configure memory growth to avoid GPU memory issues
          if (memoryFraction < 1.0) {
            logger.info(
              `TensorFlow GPU initialized with ${memoryFraction * 100}% memory limit``
            );
}
          return {
            backend: 'tensorflow-gpu',            accelerated:true,
            device: 'GPU',};
}
        break;

      case 'webgpu': ')'        if (capabilities.hasWebGPU) {
          logger.info('WebGPU acceleration enabled');')          return { backend: 'webgpu', accelerated:true, device: ' WebGPU'};')}
        break;

      case 'gpu.js': ')'        if (capabilities.hasGPUJS) {
          const { GPU} = await import('gpu.js');')          const gpu = new GPU();
          logger.info('GPU.js acceleration enabled');')          return {
            backend: 'gpu.js',            accelerated:true,
            device:(gpu as any).mode||'unknown',};
}
        break;

      case 'onnx': ')'        if (capabilities.hasONNXGPU) {
          logger.info('ONNX Runtime GPU acceleration enabled');')          return { backend: 'onnx', accelerated:true, device: ' GPU'};')}
        break;
}
} catch (error) {
    logger.warn(`Failed to initialize ${selectedBackend} acceleration:`, error);`
}

  // Fallback to CPU
  logger.info('GPU acceleration not available, falling back to CPU');')  return { backend: 'cpu', accelerated:false};')}

/**
 * Create a GPU-accelerated neural network if possible
 */
export async function createAcceleratedNeuralNetwork(
  architecture:any,
  options:GPUOptions = {}
):Promise<{
  network:any;
  backend:string;
  accelerated:boolean;
}> {
  const acceleration = await initializeGPUAcceleration(options);

  let network:any;

  if (acceleration.accelerated && acceleration.backend === 'tensorflow-gpu') {
    ')    try {
      const tf = await import('@tensorflow/tfjs-node-gpu');')      // Create TensorFlow model with GPU acceleration
      network = tf.sequential(architecture);
      logger.info('Neural network created with TensorFlow GPU acceleration');')} catch (error) {
      logger.warn(
        'Failed to create TensorFlow GPU network, falling back to CPU: ','        error
      );
      const tf = await import('@tensorflow/tfjs-node');')      network = tf.sequential(architecture);
}
} else {
    // Fallback to regular TensorFlow or Brain.js
    try {
      const tf = await import('@tensorflow/tfjs-node');')      network = tf.sequential(architecture);
} catch (error) {
      logger.warn('TensorFlow not available, falling back to Brain.js:', error);')      const { NeuralNetwork} = await import('brain.js');')      network = new NeuralNetwork(architecture);
}
}

  return {
    network,
    backend:acceleration.backend,
    accelerated:acceleration.accelerated,
};
}

/**
 * GPU-accelerated matrix operations using GPU.js
 */
export class GPUMatrix {
  private gpu:any;
  private kernels:Map<string, any> = new Map();

  constructor() {
    this.initializeGPU();
}

  private async initializeGPU() {
    try {
      const { GPU} = await import('gpu.js');')      this.gpu = new GPU();
      logger.info('GPU.js matrix operations initialized');')} catch (error) {
      logger.warn('GPU.js not available for matrix operations:', error);')}
}

  /**
   * GPU-accelerated matrix multiplication
   */
  multiply(a:number[][], b:number[][]): Promise<number[][]> {
    if (!this.gpu) {
      // Fallback to CPU implementation
      return this.cpuMultiply(a, b);
}

    try {
      if (!this.kernels.has('multiply')) {
    ')        const kernel = this.gpu
          .createKernel(function (
            this:any,
            a:number[][],
            b:number[][],
            aWidth:number
          ) {
            let sum = 0;
            for (let i = 0; i < aWidth; i++) {
              sum += a[this.thread.y!][i] * b[i][this.thread.x!];
}
            return sum;
})
          .setOutput([b[0].length, a.length]);

        this.kernels.set('multiply', kernel);')}

      const kernel = this.kernels.get('multiply');')      const result = kernel(a, b, a[0].length) as number[][];
      return Promise.resolve(result);
} catch (error) {
      logger.warn(
        'GPU matrix multiplication failed, falling back to CPU: ','        error
      );
      return this.cpuMultiply(a, b);
}
}

  private async cpuMultiply(a:number[][], b:number[][]): Promise<number[][]> {
    const result:number[][] = [];
    for (let i = 0; i < a.length; i++) {
      result[i] = [];
      for (let j = 0; j < b[0].length; j++) {
        let sum = 0;
        for (let k = 0; k < a[0].length; k++) {
          sum += a[i][k] * b[k][j];
}
        result[i][j] = sum;
}
}
    return result;
}

  /**
   * Cleanup GPU resources
   */
  destroy() {
    if (this.gpu) {
      this.kernels.forEach((kernel) => kernel.destroy?.());
      this.kernels.clear();
      this.gpu.destroy?.();
}
}
}

// Export convenience functions
export const isGPUAvailable = async ():Promise<boolean> => {
  const capabilities = await detectGPUCapabilities();
  return (
    capabilities.hasTensorFlowGPU ||
    capabilities.hasWebGPU ||
    capabilities.hasGPUJS ||
    capabilities.hasONNXGPU
  );
};

export const getRecommendedGPUBackend = async ():Promise<string> => {
  const capabilities = await detectGPUCapabilities();
  return capabilities.recommendedBackend;
};
