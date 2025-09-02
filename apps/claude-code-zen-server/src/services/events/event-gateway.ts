import { getLogger } from '@claude-zen/foundation';
import { getEventBus, type CorrelatedPayload } from './event-bus';
import { WebDataService } from '../web/data.handler';

const logger = getLogger('EventGateway');

export class EventGateway {
  constructor(private readonly data: WebDataService) {}

  initialize(): void {
    const bus = getEventBus();

    // Health/status
    bus.on('api:system:status:request', async (payload: CorrelatedPayload) => {
      try {
        const result = await this.data.getSystemStatus();
        bus.emit('api:system:status:response', { ...result, correlationId: payload?.correlationId });
      } catch (error) {
        logger.warn('status handler failed', { error });
        bus.emit('api:error', { scope: 'status', error: String(error), correlationId: payload?.correlationId });
      }
    });

    // Swarms list
    bus.on('api:swarms:list:request', async (payload: CorrelatedPayload) => {
      try {
        const result = await this.data.getSwarmStatus();
        bus.emit('api:swarms:list:response', { swarms: result, correlationId: payload?.correlationId });
      } catch (error) {
        logger.warn('swarms handler failed', { error });
        bus.emit('api:error', { scope: 'swarms', error: String(error), correlationId: payload?.correlationId });
      }
    });

    // Task metrics
    bus.on('api:tasks:metrics:request', async (payload: CorrelatedPayload) => {
      try {
        const result = await this.data.getTaskMetrics();
        bus.emit('api:tasks:metrics:response', { metrics: result, correlationId: payload?.correlationId });
      } catch (error) {
        logger.warn('tasks handler failed', { error });
        bus.emit('api:error', { scope: 'tasks', error: String(error), correlationId: payload?.correlationId });
      }
    });
  }
}
