/**
 * @fileoverview Infrastructure Services Index
 *
 * Centralized exports for all infrastructure services in the Kanban system.
 * Infrastructure services handle technical concerns like persistence, events,
 * state management, and performance monitoring.
 *
 * **Infrastructure Services:**
 * - EventCoordinatorService: Event bus management and cross-system coordination
 * - StateMachineCoordinatorService: XState workflow coordination and state management  
 * - PerformanceTrackerService: Performance monitoring and optimization
 * - PersistenceCoordinatorService: Database operations and data persistence
 *
 * **Usage Pattern:**
 * Infrastructure services are used by the API layer to handle technical concerns,
 * while domain services contain the pure business logic. This separation ensures
 * clean architecture and testability.
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

// Infrastructure Services
export { EventCoordinatorService } from './event-coordinator';
export { StateMachineCoordinatorService } from './state-machine-coordinator';
export { PerformanceTrackerService } from './performance-tracker';
export { PersistenceCoordinatorService } from './persistence-coordinator';
// Infrastructure Configuration Interfaces
export type { EventCoordinationConfig, EventCoordinationMetrics } from './event-coordinator';
export type { StateMachineConfig, StateMachineMetrics, TransitionResult } from './state-machine-coordinator';
export type { PerformanceTrackerConfig, PerformanceMetrics, PerformanceAlert } from './performance-tracker';
export type { PersistenceConfig, DatabaseHealthMetrics, TransactionContext, QueryResult } from './persistence-coordinator';
/**
 * Infrastructure Services Factory
 * 
 * Creates and configures all infrastructure services with proper dependencies.
 * Ensures services are initialized in the correct order and with proper configuration.
 */
export class InfrastructureServicesFactory {
  private eventCoordinator?: EventCoordinatorService;
  private stateMachineCoordinator?: StateMachineCoordinatorService;
  private performanceTracker?: PerformanceTrackerService;
  private persistenceCoordinator?: PersistenceCoordinatorService;

  /**
   * Create event coordinator service
   */
  createEventCoordinator(config?: Partial<EventCoordinationConfig>): EventCoordinatorService {
    if (!this.eventCoordinator) {
      this.eventCoordinator = new EventCoordinatorService(config);
    }
    return this.eventCoordinator;
  }

  /**
   * Create state machine coordinator service
   */
  createStateMachineCoordinator(
    eventCoordinator: EventCoordinatorService,
    config?: Partial<StateMachineConfig>
  ): StateMachineCoordinatorService {
    if (!this.stateMachineCoordinator) {
      this.stateMachineCoordinator = new StateMachineCoordinatorService(eventCoordinator, config);
    }
    return this.stateMachineCoordinator;
  }

  /**
   * Create performance tracker service
   */
  createPerformanceTracker(
    eventCoordinator: EventCoordinatorService,
    config?: Partial<PerformanceTrackerConfig>
  ): PerformanceTrackerService {
    if (!this.performanceTracker) {
      this.performanceTracker = new PerformanceTrackerService(eventCoordinator, config);
    }
    return this.performanceTracker;
  }

  /**
   * Create persistence coordinator service
   */
  createPersistenceCoordinator(
    eventCoordinator: EventCoordinatorService,
    config?: Partial<PersistenceConfig>
  ): PersistenceCoordinatorService {
    if (!this.persistenceCoordinator) {
      this.persistenceCoordinator = new PersistenceCoordinatorService(eventCoordinator, config);
    }
    return this.persistenceCoordinator;
  }

  /**
   * Create all infrastructure services with proper dependencies
   */
  createAllServices(config?: {
    eventCoordinator?: Partial<EventCoordinationConfig>;
    stateMachine?: Partial<StateMachineConfig>;
    performance?: Partial<PerformanceTrackerConfig>;
    persistence?: Partial<PersistenceConfig>;
  }): {
    eventCoordinator: EventCoordinatorService;
    stateMachineCoordinator: StateMachineCoordinatorService;
    performanceTracker: PerformanceTrackerService;
    persistenceCoordinator: PersistenceCoordinatorService;
  } {
    // Create event coordinator first (no dependencies)
    const eventCoordinator = this.createEventCoordinator(config?.eventCoordinator);

    // Create services that depend on event coordinator
    const stateMachineCoordinator = this.createStateMachineCoordinator(
      eventCoordinator,
      config?.stateMachine
    );
    const performanceTracker = this.createPerformanceTracker(
      eventCoordinator,
      config?.performance
    );
    const persistenceCoordinator = this.createPersistenceCoordinator(
      eventCoordinator,
      config?.persistence
    );

    return {
      eventCoordinator,
      stateMachineCoordinator,
      performanceTracker,
      persistenceCoordinator,
    };
  }

  /**
   * Initialize all infrastructure services
   */
  async initializeAllServices(): Promise<void> {
    if (this.eventCoordinator) {
      await this.eventCoordinator.initialize();
    }
    if (this.stateMachineCoordinator) {
      await this.stateMachineCoordinator.initialize();
    }
    if (this.performanceTracker) {
      await this.performanceTracker.initialize();
    }
    if (this.persistenceCoordinator) {
      await this.persistenceCoordinator.initialize();
    }
  }

  /**
   * Shutdown all infrastructure services
   */
  async shutdownAllServices(): Promise<void> {
    // Shutdown in reverse order of initialization
    if (this.persistenceCoordinator) {
      await this.persistenceCoordinator.shutdown();
    }
    if (this.performanceTracker) {
      await this.performanceTracker.shutdown();
    }
    if (this.stateMachineCoordinator) {
      await this.stateMachineCoordinator.shutdown();
    }
    if (this.eventCoordinator) {
      await this.eventCoordinator.shutdown();
    }
  }

  /**
   * Get health status of all infrastructure services
   */
  getHealthStatus(): {
    eventCoordinator: boolean;
    stateMachineCoordinator: boolean;
    performanceTracker: boolean;
    persistenceCoordinator: boolean;
    overall: boolean;
  } {
    const eventCoordinatorHealthy = this.eventCoordinator?.isHealthy() ?? false;
    const stateMachineHealthy = this.stateMachineCoordinator?.isHealthy() ?? false;
    const performanceHealthy = this.performanceTracker?.isHealthy() ?? false;
    const persistenceHealthy = this.persistenceCoordinator?.isHealthy() ?? false;

    const overall = eventCoordinatorHealthy && 
                   stateMachineHealthy && 
                   performanceHealthy && 
                   persistenceHealthy;

    return {
      eventCoordinator: eventCoordinatorHealthy,
      stateMachineCoordinator: stateMachineHealthy,
      performanceTracker: performanceHealthy,
      persistenceCoordinator: persistenceHealthy,
      overall,
    };
  }
}