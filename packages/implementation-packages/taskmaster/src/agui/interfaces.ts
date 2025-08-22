/**
 * AGUI Interfaces - Self-contained interface definitions
 * Copied from /src/interfaces/agui/ to make package self-contained
 */

import { TypedEventBase } from '@claude-zen/foundation';
import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('AGUIAdapter');

// Define our own interface since we're adapting @ag-ui/core

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
  type:
    | 'relevance'
    | 'boundary'
    | 'relationship'
    | 'naming'
    | 'priority'
    | 'checkpoint'
    | 'review';
  question: string;
  context: unknown;
  options?: string[];
  allowCustom?: boolean;
  confidence: number;
  priority?: 'critical' | 'high' | 'medium' | 'low';
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
    type?: 'info' | 'warning' | 'error' | 'success'
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
export class WebAGUI extends TypedEventBase implements AGUIInterface {
  private container: HTMLElement | null = null;

  constructor(containerSelector?: string) {
    super();
    if (typeof window !== 'undefined') {
      this.container = containerSelector 
        ? document.querySelector(containerSelector)
        : document.body;
    }
  }

  async askQuestion(question: ValidationQuestion): Promise<string> {
    return new Promise((resolve) => {
      if (!this.container) {
        logger.warn('WebAGUI: No container available, returning default response');
        resolve('Yes');
        return;
      }

      // Create question modal
      const modal = document.createElement('div');
      modal.className = 'agui-modal';
      modal.innerHTML = `
        <div class="agui-modal-content">
          <h3>${question.type.toUpperCase()} Question</h3>
          <p>${question.question}</p>
          ${question.options ? `
            <div class="agui-options">
              ${question.options.map((opt, idx) => 
                `<button class="agui-option" data-value="${opt}">${opt}</button>`
              ).join('')}
            </div>
          ` : `
            <input type="text" class="agui-input" placeholder="Enter your response">
          `}
          <div class="agui-actions">
            <button class="agui-submit">Submit</button>
            <button class="agui-cancel">Cancel</button>
          </div>
        </div>
      `;

      this.container.appendChild(modal);

      // Handle responses
      const handleResponse = (value: string) => {
        this.container?.removeChild(modal);
        resolve(value);
      };

      // Option buttons
      modal.querySelectorAll('.agui-option').forEach(btn => {
        btn.addEventListener('click', () => {
          const value = (btn as HTMLElement).dataset.value || '';
          handleResponse(value);
        });
      });

      // Submit button
      modal.querySelector('.agui-submit')?.addEventListener('click', () => {
        const input = modal.querySelector('.agui-input') as HTMLInputElement;
        const value = input ? input.value : 'Yes';
        handleResponse(value);
      });

      // Cancel button
      modal.querySelector('.agui-cancel')?.addEventListener('click', () => {
        handleResponse('Cancel');
      });
    });
  }

  async askBatchQuestions(questions: ValidationQuestion[]): Promise<string[]> {
    const answers: string[] = [];
    for (const question of questions) {
      const answer = await this.askQuestion(question);
      answers.push(answer);
    }
    return answers;
  }

  async showProgress(progress: unknown): Promise<void> {
    if (!this.container) return;

    let progressElement = this.container.querySelector('.agui-progress');
    if (!progressElement) {
      progressElement = document.createElement('div');
      progressElement.className = 'agui-progress';
      this.container.appendChild(progressElement);
    }

    if (typeof progress === 'object' && progress !== null) {
      const prog = progress as any;
      if (prog.current !== undefined && prog.total !== undefined) {
        const percentage = Math.round((prog.current / prog.total) * 100);
        progressElement.innerHTML = `
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${percentage}%"></div>
          </div>
          <div class="progress-text">${prog.current}/${prog.total} (${percentage}%)</div>
          ${prog.description ? `<div class="progress-description">${prog.description}</div>` : ''}
        `;
      }
    }
  }

  async showMessage(
    message: string,
    type: 'info' | 'warning' | 'error' | 'success' = 'info'
  ): Promise<void> {
    if (!this.container) {
      console.log(`[${type.toUpperCase()}] ${message}`);
      return;
    }

    const messageElement = document.createElement('div');
    messageElement.className = `agui-message agui-message-${type}`;
    messageElement.textContent = message;
    
    this.container.appendChild(messageElement);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (this.container?.contains(messageElement)) {
        this.container.removeChild(messageElement);
      }
    }, 5000);
  }

  async showInfo(title: string, data: Record<string, unknown>): Promise<void> {
    if (!this.container) return;

    const infoElement = document.createElement('div');
    infoElement.className = 'agui-info';
    infoElement.innerHTML = `
      <h3>${title}</h3>
      <pre>${JSON.stringify(data, null, 2)}</pre>
    `;
    
    this.container.appendChild(infoElement);
  }

  async clear(): Promise<void> {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  async close(): Promise<void> {
    // Cleanup event listeners and DOM elements
    this.removeAllListeners();
  }
}

/**
 * Headless AGUI for server-side and automated environments.
 * Provides automatic responses without UI components.
 */
export class HeadlessAGUI implements AGUIInterface {
  private responses: Map<string, string> = new Map();
  private defaultResponse: string = 'Yes';

  setResponse(questionId: string, response: string): void {
    this.responses.set(questionId, response);
  }

  setDefaultResponse(response: string): void {
    this.defaultResponse = response;
  }

  async askQuestion(question: ValidationQuestion): Promise<string> {
    logger.debug('Headless AGUI Question:', question);
    const response = this.responses.get(question.id) || this.defaultResponse;
    return response;
  }

  async askBatchQuestions(questions: ValidationQuestion[]): Promise<string[]> {
    logger.debug(`Headless AGUI Batch: ${questions.length} questions`);
    return questions.map(
      (q) => this.responses.get(q.id) || this.defaultResponse
    );
  }

  async showProgress(progress: unknown): Promise<void> {
    logger.debug('Headless AGUI Progress:', progress);
  }

  async showMessage(
    message: string,
    type?: 'info' | 'warning' | 'error' | 'success'
  ): Promise<void> {
    logger.debug(`Headless AGUI Message [${type || 'info'}]:`, message);
  }

  async showInfo(title: string, data: Record<string, unknown>): Promise<void> {
    logger.debug(`Headless AGUI Info [${title}]:`, data);
  }

  async clear(): Promise<void> {
    logger.debug('Headless AGUI: Clear called');
  }

  async close(): Promise<void> {
    logger.debug('Headless AGUI: Close called');
  }
}

/**
 * Factory function to create appropriate AGUI instance.
 */
export function createAGUI(
  type: 'web' | 'headless' = 'web',
  containerSelector?: string
): AGUIInterface {
  switch (type) {
    case 'headless':
      return new HeadlessAGUI();
    default:
      return new WebAGUI(containerSelector);
  }
}
