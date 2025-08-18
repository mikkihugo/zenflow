/**
 * Type declarations for optional GPU libraries
 */

declare module '@tensorflow/tfjs-node-gpu' {
  export * from '@tensorflow/tfjs';
  export const version: string;
}

declare module 'gpu.js' {
  export interface GPUSettings {
    mode?: 'gpu' | 'webgl' | 'webgl2' | 'headlessgl' | 'cpu';
    canvas?: HTMLCanvasElement;
    context?: WebGLRenderingContext | WebGL2RenderingContext;
    functions?: any[];
    output?: number[];
    graphical?: boolean;
    loopMaxIterations?: number;
    constants?: Record<string, any>;
    constantTypes?: Record<string, string>;
    hardcodeConstants?: boolean;
    debug?: boolean;
    onIstanbulCoverageVariable?: string;
    removeIstanbulCoverage?: boolean;
    precision?: 'single' | 'unsigned';
  }

  export interface GPUFunction {
    (...args: any[]): any;
    setOutput(output: number[]): this;
    setPipeline(pipeline: boolean): this;
    setImmutable(immutable: boolean): this;
    exec(): any;
    getPixels(): Uint8ClampedArray;
    color(r: number, g: number, b: number, a?: number): [number, number, number, number?];
    toString(): string;
  }

  export class GPU {
    constructor(settings?: GPUSettings);
    createKernel(func: Function): GPUFunction;
    createKernelMap(map: Record<string, Function>, func: Function): GPUFunction;
    combineKernels(...kernels: GPUFunction[]): GPUFunction;
    addFunction(func: Function): this;
    addNativeFunction(name: string, source: string): this;
    destroy(): void;
  }

  export function gpu(settings?: GPUSettings): GPU;
  export default GPU;
}