/**
 * @fileoverview Simplified Telemetry Implementation
 *
 * Simple, working telemetry infrastructure for claude-code-zen monitoring packages.
 * Provides metrics, tracing, and event logging primitives.
 */
import type { SpanOptions, TelemetryConfig} from './types.js';
/**
 * Simple telemetry manager for claude-code-zen
 */
export declare class TelemetryManager {
    private config;
    private logger;
    private initialized;
    private metrics;
    private traces;
    constructor(_config?:TelemetryConfig);
    initialize():Promise<void>;
    shutdown():Promise<void>;
    isInitialized():boolean;
    getServiceName():string;
    recordMetric(name:string, value?:number, attributes?:Record<string, any>):void;
    recordHistogram(name:string, value:number, attributes?:Record<string, any>):void;
    recordGauge(name:string, value:number, attributes?:Record<string, any>):void;
    recordEvent(name:string, data?:any): void;
    startTrace(name:string, options?:SpanOptions): any;
    withTrace<T>(fn:() => T): T;
    withTrace<T>(name:string, fn:() => T): T;
    withAsyncTrace<T>(fn:() => Promise<T>): Promise<T>;
    withAsyncTrace<T>(name:string, fn:() => Promise<T>): Promise<T>;
    getMetrics():Record<string, any>;
    getTraces():Record<string, any>;
}
export declare function initializeTelemetry(config?:TelemetryConfig): Promise<TelemetryManager>;
export declare function getTelemetry():TelemetryManager;
export declare function shutdownTelemetry():Promise<void>;
export declare function recordMetric(name:string, value?:number, attributes?:Record<string, any>):void;
export declare function recordHistogram(name:string, value:number, attributes?:Record<string, any>):void;
export declare function recordGauge(name:string, value:number, attributes?:Record<string, any>):void;
export declare function recordEvent(name:string, data?:any): void;
export declare function startTrace(name:string, options?:SpanOptions): any;
export declare function withTrace<T>(fn:() => T): T;
export declare function withTrace<T>(name:string, fn:() => T): T;
export declare function withAsyncTrace<T>(fn:() => Promise<T>): Promise<T>;
export declare function withAsyncTrace<T>(name:string, fn:() => Promise<T>): Promise<T>;
export declare function traced(name?:string): (target: any, propertyKey:string, descriptor:PropertyDescriptor) => void;
export declare function tracedAsync(name?:string): (target: any, propertyKey:string, descriptor:PropertyDescriptor) => void;
export declare function metered(name?:string): (target: any, propertyKey:string, descriptor:PropertyDescriptor) => void;
export declare function setTraceAttributes(attributes:Record<string, any>):void;
export type Span = ReturnType<typeof startTrace>;
export type Tracer = TelemetryManager;
export type Meter = TelemetryManager;
export type Attributes = Record<string, any>;
//# sourceMappingURL=telemetry.d.ts.map