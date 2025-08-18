/**
 * Type declarations for koa-compose module
 */
declare module 'koa-compose' {
  type Middleware<T = any> = (context: T, next: () => Promise<any>) => any;
  
  interface Compose {
    <T>(middleware: ReadonlyArray<Middleware<T>>): Middleware<T>;
  }
  
  const compose: Compose;
  export = compose;
}