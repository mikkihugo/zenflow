import { EventBus as FoundationEventBus } from '@claude-zen/foundation';

type EventCallback = (data: unknown) => void;

/**
 * Compatibility adapter: route publish/subscribe to the foundation EventBus singleton.
 * Preserves existing API while eliminating parallel custom buses.
 */
class EventBus {
  public static publish(eventName: string, eventData: unknown): void {
    const b: any = FoundationEventBus.getInstance();
    if (typeof b.emit === 'function') {
      b.emit(eventName, eventData);
    } else if (typeof b.emitSafe === 'function') {
      void b.emitSafe(eventName, eventData);
    }
  }

  public static subscribe(eventName: string, callback: EventCallback): void {
    const b: any = FoundationEventBus.getInstance();
    if (typeof b.on === 'function') {
      b.on(eventName, callback);
    } else if (typeof b.addListener === 'function') {
      b.addListener(eventName, callback);
    }
  }
}

export { EventBus };
