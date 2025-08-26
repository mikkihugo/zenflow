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

export type EventMiddleware = (
  context: EventContext,
  next: () => Promise<void>
) => Promise<void>;

/**
 * Simple middleware chain executor.
 */
export class MiddlewareChain {
  private middleware: EventMiddleware[] = [];

  use(middleware: EventMiddleware): void {
    this.middleware.push(middleware);
  }

  async execute(context: EventContext): Promise<void> {
    let index = 0;
    const dispatch = async (i: number): Promise<void> => {
      if (i <= index) return;
      index = i;
      const fn = this.middleware[i];
      if (!fn) return;
      await fn(context, () => dispatch(i + 1));
    };
    await dispatch(0);
  }
}