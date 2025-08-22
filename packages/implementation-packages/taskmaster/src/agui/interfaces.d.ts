/**
 * AGUI Interfaces - Self-contained interface definitions
 * Copied from /src/interfaces/agui/ to make package self-contained
 */
import { TypedEventBase } from '@claude-zen/foundation';
/**
 * Represents a validation question for human-in-the-loop interactions.
 *
 * This interface defines the structure for questions presented to users
 * during autonomous system operations that require human validation or
 * decision-making. Used throughout the AGUI system for task approval,
 * boundary checking, and critical decision points in AI swarm coordination.
 *
 * @since 1.0.0
 * @see {@link AGUIInterface.askQuestion} for usage in AGUI implementations
 * @see {@link AGUIInterface.askBatchQuestions} for batch processing
 * @example
 * ```typescript
 * const question: ValidationQuestion = {
 *   id: 'task-approval-001',
 *   type: 'checkpoint',
 *   question: 'Should the agent proceed with database migration?',
 *   context: { tables: ['users', 'tasks'], estimatedTime: '5 minutes' },
 *   confidence: 0.8,
 *   priority: 'high',
 *   options: ['Proceed', 'Cancel', 'Review Details'],
 *   allowCustom: true
 * };
 * ```
 */
export interface ValidationQuestion {
  id: string;
  type:'' | '''relevance | boundary' | 'relationship''' | '''naming | priority' | 'checkpoint''' | '''review';
  question: string;
  context: unknown;
  options?: string[];
  allowCustom?: boolean;
  confidence: number;
  priority?: 'critical | high' | 'medium''' | '''low';
  validationReason?: string;
  expectedImpact?: number;
}
/**
 * Core interface for AGUI (Autonomous Graphical User Interface) implementations.
 *
 * Defines the standard contract for all AGUI adapters within the claude-code-zen
 * ecosystem. This interface enables consistent human-in-the-loop interactions
 * across different UI modalities (terminal, web, custom interfaces) while
 * maintaining compatibility with autonomous system workflows.
 *
 * Implementations must handle user interactions asynchronously to avoid blocking
 * autonomous operations and should provide graceful degradation when user
 * input is unavailable.
 *
 * @since 1.0.0
 * @see {@link ValidationQuestion} for question structure definitions
 * @see {@link EventHandlerConfig} for event handling configuration
 * @example
 * ```typescript
 * import { AGUIInterface, ValidationQuestion } from '@claude-zen/agui';
 *
 * class TerminalAGUI implements AGUIInterface {
 *   async askQuestion(question: ValidationQuestion): Promise<string> {
 *     // Terminal-specific implementation
 *     console.log(question.question);
 *     return await getUserInput();
 *   }
 *
 *   async showMessage(message: string, type = 'info'): Promise<void> {
 *     console.log(`[${type.toUpperCase()}] ${message}`);
 *   }
 * }
 * ```
 */
export interface AGUIInterface {
  askQuestion(question: ValidationQuestion): Promise<string>;
  askBatchQuestions(questions: ValidationQuestion[]): Promise<string[]>;
  showProgress(progress: unknown): Promise<void>;
  showMessage(
    message: string,
    type?: 'info | warning' | 'error''' | '''success'
  ): Promise<void>;
  showInfo(title: string, data: Record<string, unknown>): Promise<void>;
  clear?(): Promise<void>;
  close?(): Promise<void>;
}
/**
 * Configuration interface for event handler mappings in AGUI systems.
 *
 * Defines a flexible mapping structure that allows AGUI implementations to
 * register custom event handlers for different user interaction events.
 * This enables extensible behavior customization while maintaining type
 * safety for event handling within the claude-code-zen platform.
 *
 * The configuration supports dynamic event registration and allows handlers
 * to receive variable arguments based on the specific event type, providing
 * maximum flexibility for different AGUI adapter implementations.
 *
 * @since 1.0.0
 * @see {@link AGUIInterface} for the main AGUI contract
 * @example
 * ```typescript
 * const eventConfig: EventHandlerConfig = {
 *   'user-input': (data: string) => console.log('User entered:', data),
 *   'validation-complete': (result: boolean, context: any) => {
 *     if (result) {
 *       console.log('Validation passed for:', context);
 *     }
 *   },
 *   'error': (error: Error) => console.error('AGUI Error:', error.message)
 * };
 * ```
 */
export interface EventHandlerConfig {
  [key: string]: (...args: any[]) => void;
}
/**
 * Web-based AGUI implementation for browser environments.
 */
export declare class WebAGUI extends TypedEventBase implements AGUIInterface {
  private container;
  constructor(containerSelector?: string);
  askQuestion(question: ValidationQuestion): Promise<string>;
  askBatchQuestions(questions: ValidationQuestion[]): Promise<string[]>;
  showProgress(progress: unknown): Promise<void>;
  showMessage(
    message: string,
    type?: 'info | warning' | 'error''' | '''success'
  ): Promise<void>;
  showInfo(title: string, data: Record<string, unknown>): Promise<void>;
  clear(): Promise<void>;
  close(): Promise<void>;
}
/**
 * Headless AGUI for server-side and automated environments.
 * Provides automatic responses without UI components.
 */
export declare class HeadlessAGUI implements AGUIInterface {
  private responses;
  private defaultResponse;
  setResponse(questionId: string, response: string): void;
  setDefaultResponse(response: string): void;
  askQuestion(question: ValidationQuestion): Promise<string>;
  askBatchQuestions(questions: ValidationQuestion[]): Promise<string[]>;
  showProgress(progress: unknown): Promise<void>;
  showMessage(
    message: string,
    type?: 'info | warning' | 'error''' | '''success'
  ): Promise<void>;
  showInfo(title: string, data: Record<string, unknown>): Promise<void>;
  clear(): Promise<void>;
  close(): Promise<void>;
}
/**
 * Factory function to create appropriate AGUI instance.
 */
export declare function createAGUI(
  type?: 'web''' | '''headless',
  containerSelector?: string
): AGUIInterface;
