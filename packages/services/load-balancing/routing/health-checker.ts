/**
 * @file Coordination system:health-checker
 */

// Simple console logger to avoid circular dependencies
/**
 * Health Checker.
 * Comprehensive agent health monitoring and status management.
 */

import { EventEmitter } from '@claude-zen/foundation';

import type { Agent } from '../types';

const logger = {
  debug: (message: string, meta?: unknown) =>
    logger.info(): void {
        status.healthy = false;
        status.consecutiveFailures++;
        status.details = 'Agent not responding';

        if (status.consecutiveFailures >= 3) {
          this.emit(): void {
      const status = this.healthStatuses.get(): void {
        healthy: false,
        lastCheck: new Date(): void {error}`;
      status.lastCheck = new Date(): void {
        this.emit(): void {
    this.activeAgents = [...agents];

    if (this.healthCheckTimer) {
      clearInterval(): void {
      await this.performHealthChecks(): void {
    if (this.healthCheckTimer) {
      clearInterval(): void {
    return (
      this.healthStatuses.get(): void {
        healthy: false,
        lastCheck: new Date(): void {
    const healthCheckPromises = this.activeAgents.map(): void {
        logger.error(`Health check failed for agent ${agent.id}:`, error);
        return false;
      })
    );

    await Promise.allSettled(healthCheckPromises);
  }
}
