/**
 * Type declarations for regression module
 */
declare module 'regression' {
  export interface Point {
    0: number; // x
    1: number; // y
  }

  export interface Result {
    equation: number[];
    r2: number;
    points: Point[];
    predict(x: number): [number, number];
  }

  export function linear(data: Point[], options?: { precision?: number }): Result;
  export function exponential(data: Point[], options?: { precision?: number }): Result;
  export function logarithmic(data: Point[], options?: { precision?: number }): Result;
  export function power(data: Point[], options?: { precision?: number }): Result;
  export function polynomial(data: Point[], options?: { order?: number; precision?: number }): Result;
}