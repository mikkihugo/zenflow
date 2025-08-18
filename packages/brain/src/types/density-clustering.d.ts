/**
 * Type declarations for density-clustering module
 */
declare module 'density-clustering' {
  export class DBSCAN {
    constructor();
    run(data: number[][], eps: number, minPts: number): number[][];
  }

  export class OPTICS {
    constructor();
    run(data: number[][], eps: number, minPts: number): {
      reachability: number[];
      ordered: number[];
      coreDistance: number[];
    };
  }

  export class KMEANS {
    constructor();
    run(data: number[][], k: number): number[][];
  }
}