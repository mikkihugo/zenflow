export declare class ObjectProcessor {
/**
* Group items by key function
*/
static groupBy<T>(
items: T[],
keyFn: (item: T) => string
): Record<string, T[]>;
/**
* Create object map keyed by function result
*/
static keyBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T>;
/**
* Transform object values while preserving keys
*/
static mapValues<T, U>(
obj: Record<string, T>,
valueFn: (value: T) => U
): Record<string, U>;
/**
* Pick specific properties from object
*/
static pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
/**
* Omit specific properties from object
*/
static omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>;
/**
* Deep clone object safely
*/
static cloneDeep<T>(obj: T): T;
/**
* Merge objects deeply
*/
static merge<T>(...objects: Partial<T>[]): T;
/**
* Check if object is empty
*/
static isEmpty(value: any): boolean;
/**
* Deep equality check
*/
static isEqual(a: any, b: any): boolean;
'}
//# sourceMappingURL=object-processor.d.ts.map
