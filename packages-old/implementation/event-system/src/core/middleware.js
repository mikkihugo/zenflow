/**
 * @file Event Middleware
 *
 * Simple middleware implementation for the event system.
 */
/**
 * Simple middleware chain executor.
 */
export class MiddlewareChain {
    middleware = [];
    use(middleware) {
        this.middleware.push(middleware);
    }
    async execute(context) {
        let index = 0;
        const dispatch = async (i) => {
            if (i <= index)
                return;
            index = i;
            const fn = this.middleware[i];
            if (!fn)
                return;
            await fn(context, () => dispatch(i + 1));
        };
        await dispatch(0);
    }
}
