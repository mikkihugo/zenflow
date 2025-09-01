export declare class AsyncUtils {
/**
* Create debounced function
*/
static debounce<T extends (...args: any[]) => any>(
func: T,
wait: number
): T & {
cancel(): void;
flush(): void;
};
/**
* Create throttled function
*/
static throttle<T extends (...args: any[]) => any>(
func: T,
wait: number
): T & {
cancel(): void;
flush(): void;
};
/**
* Create promise-based delay
*/
static createDelay(milliseconds: number): Promise<void>;
/**
* Create timeout promise
*/
static createTimeout<T>(
promise: Promise<T>,
milliseconds: number
): Promise<T>;
}
//# sourceMappingURL=async-utils.d.ts.map
