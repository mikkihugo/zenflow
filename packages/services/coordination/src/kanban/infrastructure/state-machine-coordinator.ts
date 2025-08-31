/**
 * @fileoverview State Machine Coordinator Infrastructure Service
 *
 * Infrastructure layer for coordinated state management across system components.
 * Handles state transitions, validation, and coordination workflows.
 */

import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('StateMachineCoordinator');

/**
 * State machine configuration
 */
export interface StateMachineConfig {
  /** Enable state validation */
  enableStateValidation: boolean;
  /** Initial state */
  initialState: string;
}

export interface StateTransition {
  id: string;
  fromState: string;
  toState: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export class StateMachineCoordinatorService {
  private currentState: string;
  private stateHistory: StateTransition[] = [];
  private allowedTransitions: Map<string, string[]> = new Map();
  private initialized = false;
  private eventCoordinator: any;
  private config: StateMachineConfig;

  constructor(eventCoordinator: any) {
    this.eventCoordinator = eventCoordinator;
    this.config = {
      enableStateValidation: true,
      initialState: 'idle'
    };
    this.currentState = this.config.initialState;
    
    // Define allowed state transitions
    this.setupAllowedTransitions();
    
    try {
      this.initialized = true;
      logger.info('StateMachineCoordinatorService initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize StateMachineCoordinatorService:', error);
      throw error;
    }
  }

  /**
   * Setup allowed state transitions
   */
  private setupAllowedTransitions(): void {
    this.allowedTransitions.set('idle', ['running', 'paused']);
    this.allowedTransitions.set('running', ['paused', 'completed', 'failed']);
    this.allowedTransitions.set('paused', ['running', 'cancelled']);
    this.allowedTransitions.set('completed', ['idle']);
    this.allowedTransitions.set('failed', ['idle']);
    this.allowedTransitions.set('cancelled', ['idle']);
  }

  /**
   * Transition to a new state
   */
  async transitionTo(
    newState: string,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    if (!this.initialized) return false;
    
    if (this.config.enableStateValidation) {
      const allowedStates = this.allowedTransitions.get(this.currentState);
      if (!allowedStates || !allowedStates.includes(newState)) {
        logger.warn(`Invalid state transition from ${this.currentState} to ${newState}`);
        return false;
      }
    }
    
    const transition: StateTransition = {
      id: `transition_${Date.now()}`,
      fromState: this.currentState,
      toState: newState,
      timestamp: Date.now(),
      metadata: metadata || {}
    };
    
    this.stateHistory.push(transition);
    this.currentState = newState;
    
    logger.info(`State transition: ${transition.fromState} -> ${transition.toState}`);
    return true;
  }

  /**
   * Get current state
   */
  getCurrentState(): string {
    return this.currentState;
  }

  /**
   * Get state history
   */
  getStateHistory(): StateTransition[] {
    return [...this.stateHistory];
  }

  /**
   * Check if transition is allowed
   */
  isTransitionAllowed(fromState: string, toState: string): boolean {
    const allowedStates = this.allowedTransitions.get(fromState);
    return allowedStates ? allowedStates.includes(toState) : false;
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    this.currentState = this.config.initialState;
    this.stateHistory = [];
    logger.info('State machine reset to initial state');
  }
}