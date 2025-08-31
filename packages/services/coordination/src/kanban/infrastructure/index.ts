/**
 * @fileoverview Infrastructure Services Index
 *
 * Centralized exports for all infrastructure services in the Kanban system.
 * Infrastructure services handle technical concerns like persistence, events,
 * state management, and performance monitoring.
 */

// Core infrastructure services
export { EventCoordinator } from './event-coordinator';
export { StateMachineCoordinatorService } from './state-machine-coordinator';
export { PerformanceTrackerService } from './performance-tracker';
export { PersistenceCoordinatorService } from './persistence-coordinator';

// Infrastructure service factory
export class InfrastructureServiceFactory {
  private eventCoordinator?: EventCoordinator;
  private stateMachineCoordinator?: StateMachineCoordinatorService;
  private performanceTracker?: PerformanceTrackerService;
  private persistenceCoordinator?: PersistenceCoordinatorService;

  /**
   * Create event coordinator service
   */
  createEventCoordinator(config?: any): EventCoordinator {
    if (!this.eventCoordinator) {
      this.eventCoordinator = new EventCoordinator(config);
    }
    return this.eventCoordinator;
  }

  /**
   * Create state machine coordinator service
   */
  createStateMachineCoordinator(
    eventCoordinator: EventCoordinator,
    config?: any
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
    eventCoordinator: EventCoordinator,
    config?: any
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
    eventCoordinator: EventCoordinator,
    config?: any
  ): PersistenceCoordinatorService {
    if (!this.persistenceCoordinator) {
      this.persistenceCoordinator = new PersistenceCoordinatorService(eventCoordinator, config);
    }
    return this.persistenceCoordinator;
  }

  /**
   * Create all infrastructure services with proper dependencies
   */
  createAllServices(config?: any): {
    eventCoordinator: EventCoordinator;
    stateMachineCoordinator: StateMachineCoordinatorService;
    performanceTracker: PerformanceTrackerService;
    persistenceCoordinator: PersistenceCoordinatorService;
  } {
    const eventCoordinator = this.createEventCoordinator(config);
    const stateMachineCoordinator = this.createStateMachineCoordinator(eventCoordinator, config);
    const performanceTracker = this.createPerformanceTracker(eventCoordinator, config);
    const persistenceCoordinator = this.createPersistenceCoordinator(eventCoordinator, config);

    return {
      eventCoordinator,
      stateMachineCoordinator,
      performanceTracker,
      persistenceCoordinator
    };
  }
}

// Export default factory instance
export const infrastructureServiceFactory = new InfrastructureServiceFactory();

/**
 * Get health status of all infrastructure services
 */
export function getHealthStatus() {
  const eventCoordinatorHealthy = infrastructureServiceFactory.eventCoordinator?.isHealthy() ?? false;
  const stateMachineHealthy = infrastructureServiceFactory.stateMachineCoordinator?.isHealthy() ?? false;
  const performanceHealthy = infrastructureServiceFactory.performanceTracker?.isHealthy() ?? false;
  const persistenceHealthy = infrastructureServiceFactory.persistenceCoordinator?.isHealthy() ?? false;
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