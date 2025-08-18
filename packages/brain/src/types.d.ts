// Type declarations for missing packages
declare module 'moving-averages' {
  export function sma(values: number[], period: number): number[];
  export function ema(values: number[], period: number): number[];
  export function wma(values: number[], period: number): number[];
}

declare module 'regression' {
  export function linear(data: number[][]): { equation: number[]; r2: number; };
  export function exponential(data: number[][]): { equation: number[]; r2: number; };
  export function polynomial(data: number[][], order: number): { equation: number[]; r2: number; };
}

declare module 'density-clustering' {
  export class DBSCAN {
    constructor();
    run(dataset: number[][], neighborhoodRadius: number, minPointsPerCluster: number): number[][];
  }
}

// Export empty to make this a module
export {};