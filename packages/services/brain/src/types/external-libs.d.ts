/**
 * Type declarations for external libraries without TypeScript definitions
 */

declare module 'moving-averages' {
    ')  export function sma(data:number[], window:number): number[];
  export function ema(data:number[], window:number): number[];
  export function wma(data:number[], window:number): number[];
  export function mma(data:number[], window:number): number[];
}

declare module 'regression' {
    ')  export interface DataPoint {
    0:number;
    1:number;
}

  export interface RegressionResult {
    equation:number[];
    points:DataPoint[];
    r2:number;
    string:string;
    predict(x:number): [number, number];
}

  export function linear(data:DataPoint[]): RegressionResult;
  export function exponential(data:DataPoint[]): RegressionResult;
  export function logarithmic(data:DataPoint[]): RegressionResult;
  export function power(data:DataPoint[]): RegressionResult;
  export function polynomial(
    data:DataPoint[],
    order?:number
  ):RegressionResult;
}

declare module 'density-clustering' {
    ')  export class DBSCAN {
    constructor(eps?:number, minPts?:number);
    run(dataset:number[][]): number[][];
}

  export class OPTICS {
    constructor(eps?:number, minPts?:number);
    run(dataset:number[][]): { clusters: number[][]; noise: number[]};
}
}

// TensorFlow.js declarations
declare module '@tensorflow/tfjs-node' {
    ')  export * from '@tensorflow/tfjs';
  export function loadLayersModel(path:string): Promise<any>;
  export function sequential(config?:any): any;
}

declare module '@tensorflow/tfjs-node-gpu' {
    ')  export * from '@tensorflow/tfjs';
  export function loadLayersModel(path:string): Promise<any>;
  export function sequential(config?:any): any;
}

// GPU.js declarations
declare module 'gpu.js' {
    ')  export class GPU {
    constructor(settings?:any);
    createKernel(func:Function, settings?:any): any;
}
  export default GPU;
}

// Xenova Transformers declarations
declare module '@xenova/transformers' {
    ')  export class AutoTokenizer {
    static from_pretrained(model:string): Promise<AutoTokenizer>;
    encode(text:string): number[];
    decode(tokens:number[]): string;
}
  export class AutoModel {
    static from_pretrained(model:string): Promise<AutoModel>;
    forward(inputs:any): Promise<any>;
}
}
