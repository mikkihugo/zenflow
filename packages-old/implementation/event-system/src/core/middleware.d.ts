/**
 * @file Event Middleware
 *
 * Simple middleware implementation for the event system.
 */
export interface EventContext {
    event: string;
    payload: unknown;
    timestamp: number;
}
export type EventMiddleware = (context: EventContext, next: () => Promise<void>) => Promise<void>;
/**
 * Simple middleware chain executor.
 */
export declare class MiddlewareChain {
    private middleware;
    use(middleware: EventMiddleware): void;
    execute(context: EventContext): Promise<void>;
}
//# sourceMappingURL=middleware.d.ts.map