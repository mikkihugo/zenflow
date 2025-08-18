/**
 * Type declarations for moving-averages module
 */
declare module 'moving-averages' {
  export function sma(data: number[], period: number): number[];
  export function ema(data: number[], period: number): number[];
  export function wma(data: number[], period: number): number[];
  export function rsi(data: number[], period: number): number[];
  export function bollingerBands(data: number[], period: number, stdDev: number): {
    upper: number[];
    middle: number[];
    lower: number[];
  };
}