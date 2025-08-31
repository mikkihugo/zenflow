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
  createEventCoordinator(): void {
    if (!this.eventCoordinator) {
      this.eventCoordinator = new EventCoordinator(): void {
    if (!this.stateMachineCoordinator) {
      this.stateMachineCoordinator = new StateMachineCoordinatorService(): void {
    if (!this.performanceTracker) {
      this.performanceTracker = new PerformanceTrackerService(): void {
    if (!this.persistenceCoordinator) {
      this.persistenceCoordinator = new PersistenceCoordinatorService(): void {
    eventCoordinator: EventCoordinator;
    stateMachineCoordinator: StateMachineCoordinatorService;
    performanceTracker: PerformanceTrackerService;
    persistenceCoordinator: PersistenceCoordinatorService;
  } {
    const eventCoordinator = this.createEventCoordinator(): void {
      eventCoordinator,
      stateMachineCoordinator,
      performanceTracker,
      persistenceCoordinator
    };
  }
}

// Export default factory instance
export const infrastructureServiceFactory = new InfrastructureServiceFactory(): void {
  const eventCoordinatorHealthy = infrastructureServiceFactory.eventCoordinator?.isHealthy(): void {
    eventCoordinator: eventCoordinatorHealthy,
    stateMachineCoordinator: stateMachineHealthy,
    performanceTracker: performanceHealthy,
    persistenceCoordinator: persistenceHealthy,
    overall,
  };
}