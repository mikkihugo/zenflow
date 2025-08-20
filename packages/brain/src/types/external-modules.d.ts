/**
 * @fileoverview External Module Type Declarations
 * 
 * Type declarations for external modules that don't have TypeScript definitions
 * or where we need to extend/override existing definitions.
 */

declare module 'consistent-hashing' {
  export default class ConsistentHashing {
    constructor(options?: { vnodes?: number });
    add(key: string, weight?: number): void;
    remove(key: string): void;
    get(key: string): string | undefined;
    getMultiple(key: string, count: number): string[];
  }
}

declare module 'hashring' {
  export default class HashRing {
    constructor(nodes?: string[] | Record<string, number>);
    add(node: string, weight?: number): void;
    remove(node: string): void;
    get(key: string): string;
    getNodes(): string[];
  }
}

declare module 'node-os-utils' {
  export interface CPUInfo {
    model: string;
    speed: number;
    times: {
      user: number;
      nice: number;
      sys: number;
      idle: number;
      irq: number;
    };
  }
  
  export interface MemInfo {
    totalMemMb: number;
    usedMemMb: number;
    freeMemMb: number;
    freeMemPercentage: number;
  }
  
  export const cpu: {
    usage(): Promise<number>;
    info(): Promise<CPUInfo[]>;
    loadavg(): number[];
    count(): number;
  };
  
  export const mem: {
    info(): Promise<MemInfo>;
  };
  
  export const netstat: {
    inOut(): Promise<{ inputMb: number; outputMb: number }>;
  };
}