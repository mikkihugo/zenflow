/**
 * @file Coordination system: performance.
 */
declare class PerformanceCLI {
    ruvSwarm: any;
    constructor();
    initialize(): Promise<any>;
    analyze(args: any): Promise<void>;
    optimize(args: any): Promise<void>;
    suggest(_args: any): Promise<void>;
    getArg(args: any, flag: any): any;
}
declare const performanceCLI: PerformanceCLI;
export { performanceCLI, PerformanceCLI };
//# sourceMappingURL=performance.d.ts.map