type EventCallback = (data: unknown) => void;

class EventBus {
  private static listeners: { [key: string]: EventCallback[] } = {};

  public static publish(eventName: string, eventData: unknown): void {
    const eventListeners = this.listeners[eventName];
    if (eventListeners) {
      for (const callback of eventListeners) callback(eventData);
    }
  }

  public static subscribe(eventName: string, callback: EventCallback): void {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);
  }
}

export { EventBus };
