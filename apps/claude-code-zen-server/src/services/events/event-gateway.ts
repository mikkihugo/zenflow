import { type CorrelatedPayload } from './event-bus';
import { WebDataService } from '../web/data.handler';

// logger is unused

export class EventGateway {
  constructor(private readonly data: WebDataService) {}

  initialize(): void {
    // bus is unused

    // Health/status
    bus.on('api:system:status:request', async (payload: CorrelatedPayload) => {
      try {
        // result is unused
        bus.emit('api:system:status:response', { ...result, correlationId: payload?.correlationId });
      } catch (error) {
        logger.warn('status handler failed', { error });
        bus.emit('api:error', { scope: 'status', error: String(error), correlationId: payload?.correlationId });
      }
    });

    // Swarms
    bus.on('api:swarms:list:request', async (payload: CorrelatedPayload) => {
      try {
        // result is unused
        bus.emit('api:swarms:list:response', { swarms: result, correlationId: payload?.correlationId });
      } catch (error) {
        logger.warn('swarms handler failed', { error });
        bus.emit('api:error', { scope: 'swarms', error: String(error), correlationId: payload?.correlationId });
      }
    });

    // Tasks/metrics
    bus.on('api:tasks:metrics:request', async (payload: CorrelatedPayload) => {
      try {
        // result is unused
        bus.emit('api:tasks:metrics:response', { metrics: result, correlationId: payload?.correlationId });
      } catch (error) {
        logger.warn('tasks handler failed', { error });
        bus.emit('api:error', { scope: 'tasks', error: String(error), correlationId: payload?.correlationId });
      }
    });
  }
}
