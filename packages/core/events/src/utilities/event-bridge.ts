import { EventBus, getLogger } from '@claude-zen/foundation';

export type LocalWildcardEmitter = {
  on(event: string | '*', handler: (...args: unknown[]) => void): void;
};

/**
 * Bridge a local event emitter (any object that supports `on('*', handler)`) to the global EventBus.
 * No new runtime dependencies – relies solely on the existing foundation EventBus.
 *
 * @param localEmitter - the local emitter instance (wildcard capable)
 * @param prefix       - domain prefix to namespace outgoing events, e.g. `sparc`, `safe`
 */
export function bridgeLocalEmitter<T extends string = string>(
  localEmitter: LocalWildcardEmitter,
  prefix: string,
): void {
  const bus = EventBus.getInstance();
  const logger = getLogger('coordination-bridge');

   
  localEmitter.on('*', (...args: unknown[]) => {
    const eventName = args[0] as T;
    const payload = args[1];
    const fullName = `${prefix}:${String(eventName)}`;
    bus.emit(fullName as never, payload as never);
    logger.debug('Bridged local event', { from: eventName, to: fullName });
  });
}