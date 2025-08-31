/**
 * @fileoverview SAFe Events Manager - Comprehensive SAFe ceremony orchestration.
 *
 * Provides enterprise-grade SAFe events and ceremonies management through specialized
 * event scheduling, workflow coordination, and human-facilitated ceremonies.
 *
 * Key Features: * - SAFe event scheduling and orchestration (System Demos, I&A workshops)
 * - ART sync meeting coordination
 * - Program Increment event management
 * - Cross-ART coordination events
 * - Event metrics and retrospective analysis
 * - Human-facilitated ceremony integration
 *
 * Part of the coordination package providing comprehensive
 * Scaled Agile Framework (SAFe) integration capabilities.
 */
import { EventBus } from '@claude-zen/foundation';
export interface SAFeEventsManagerConfig {
  enableSystemDemos: new () => SAFeEventsManager;
  (memory: any, eventBus: any, config: any): any;
}
export declare class SAFeEventsManager extends EventBus {
  private logger;
  private eventOutcomes;
  private eventTemplates;
  private initialized;
  constructor(): void {
      piId,
    }: {
      piId: any;
    }
  ): any;
}
//# sourceMappingURL=safe-events-manager.d.ts.map
