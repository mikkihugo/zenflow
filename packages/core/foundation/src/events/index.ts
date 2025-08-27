/**
 * @fileoverview Events - Foundation Event System
 * 
 * Comprehensive event system with EventEmitter and EventBus
 */

export { EventEmitter } from './event-emitter.js';
export type { EventMap, EventArgs } from './event-emitter.js';

export { EventBus } from './event-bus.js';
export type { 
  EventBusConfig, 
  EventListener, 
  EventMetrics, 
  EventContext, 
  EventMiddleware,
  Event as EventBusEvent 
} from './event-bus.js';