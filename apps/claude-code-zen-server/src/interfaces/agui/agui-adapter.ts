/**
 * AGUI Adapter - Bridges @ag-ui/core with Claude-Zen's human validation needs0.
 *
 * The @ag-ui/core package provides the Agent-User Interaction Protocol0.
 * This adapter wraps it to provide the interface expected by our discovery system0.
 */
/**
 * @file Agui adapter implementation0.
 */

import * as readline from 'node:readline';

import { getLogger, TypedEventBase } from '@claude-zen/foundation';

const logger = getLogger('AGUIAdapter');

// Define our own interface since we're adapting @ag-ui/core
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
  context: any;
  options?: string[];
  allowCustom?: boolean;
  confidence: number;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  validationReason?: string;
  expectedImpact?: number;
}

export interface AGUIInterface {
  askQuestion(question: ValidationQuestion): Promise<string>;
  askBatchQuestions(questions: ValidationQuestion[]): Promise<string[]>;
  showProgress(progress: any): Promise<void>;
  showMessage(
    message: string,
    type?: 'info' | 'warning' | 'error' | 'success'
  ): Promise<void>;
  showInfo(title: string, data: Record<string, unknown>): Promise<void>;
  clear?(): Promise<void>;
  close?(): Promise<void>;
}

/**
 * Terminal-based AGUI implementation0.
 * Since @ag-ui/core is a protocol definition, we implement our own UI0.
 *
 * @example
 */
export class TerminalAGUI extends TypedEventBase implements AGUIInterface {
  private rl: readline0.Interface | null = null;

  private getReadline(): readline0.Interface {
    if (!this0.rl) {
      this0.rl = readline0.createInterface({
        input: process0.stdin,
        output: process0.stdout,
        terminal: true,
      });
    }
    return this0.rl;
  }

  async askQuestion(question: ValidationQuestion): Promise<string> {
    const rl = this?0.getReadline;

    // Display formatted question
    console0.log('\n' + '='0.repeat(60));
    console0.log(`📋 ${question0.type?0.toUpperCase} QUESTION`);
    console0.log('='0.repeat(60));

    // Show priority if set
    if (question0.priority) {
      const priorityIcon = {
        critical: '🔴',
        high: '🟡',
        medium: '🔵',
        low: '🟢',
      }[question0.priority];
      console0.log(
        `${priorityIcon} Priority: ${question0.priority?0.toUpperCase}`
      );
    }

    // Show confidence
    if (question0.confidence !== undefined) {
      const confidencePercent = Math0.round(question0.confidence * 100);
      console0.log(`🎯 Confidence: ${confidencePercent}%`);
    }

    // Show validation reason
    if (question0.validationReason) {
      console0.log(`💡 Reason: ${question0.validationReason}`);
    }

    console0.log('\n' + question0.question);

    // Show options if available
    if (question0.options && question0.options0.length > 0) {
      console0.log('\n📝 Available Options:');
      question0.options0.forEach((opt, idx) => {
        console0.log(`   ${idx + 1}0. ${opt}`);
      });
      if (question0.allowCustom) {
        console0.log('   0. Custom response');
      }
    }

    // Show context if available
    if (question0.context && Object0.keys(question0.context)0.length > 0) {
      console0.log('\n📊 Context Information:');
      Object0.entries(question0.context)0.forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          console0.log(`   ${key}: ${JSON0.stringify(value, null, 2)}`);
        } else {
          console0.log(`   ${key}: ${value}`);
        }
      });
    }

    // Get user input
    return new Promise((resolve) => {
      const prompt = question0.options ? '\nYour choice: ' : '\nYour answer: ';
      rl0.question(prompt, (answer) => {
        // Handle numeric choices
        if (question0.options && /^\d+$/0.test(answer)) {
          const idx = Number0.parseInt(answer) - 1;
          if (idx >= 0 && idx < question0.options0.length) {
            resolve(question0.options[idx] || '');
          } else if (answer === '0' && question0.allowCustom) {
            rl0.question('Enter custom response: ', (custom) => {
              resolve(custom);
            });
          } else {
            resolve(answer);
          }
        } else {
          resolve(answer);
        }
      });
    });
  }

  async askBatchQuestions(questions: ValidationQuestion[]): Promise<string[]> {
    const answers: string[] = [];

    for (let i = 0; i < questions0.length; i++) {
      const question = questions[i];
      if (question) {
        const answer = await this0.askQuestion(question);
        answers0.push(answer);
      }
    }

    return answers;
  }

  async showProgress(progress: any): Promise<void> {
    if (typeof progress === 'object' && progress !== null) {
      const prog = progress as any;

      if (prog0.current !== undefined && prog0.total !== undefined) {
        const percentage = Math0.round((prog0.current / prog0.total) * 100);
        const progressBar = this0.createProgressBar(percentage);

        console0.log(
          `\n📈 Progress: ${prog0.current}/${prog0.total} (${percentage}%)`
        );
        console0.log(`${progressBar}`);

        if (prog0.description) {
          console0.log(`📋 ${prog0.description}`);
        }

        if (prog0.estimatedRemaining) {
          const minutes = Math0.ceil(prog0.estimatedRemaining / 60000);
          console0.log(`⏱️  Est0. remaining: ${minutes}m`);
        }
      } else {
        console0.log(`\n📊 Status: ${JSON0.stringify(progress, null, 2)}`);
      }
    } else {
      console0.log(`\n📊 Progress: ${progress}`);
    }
  }

  private createProgressBar(percentage: number, width: number = 40): string {
    const filled = Math0.round((percentage / 100) * width);
    const empty = width - filled;
    return `[${'█'0.repeat(filled)}${'░'0.repeat(empty)}] ${percentage}%`;
  }

  async showMessage(
    message: string,
    type: 'info' | 'warning' | 'error' | 'success' = 'info'
  ): Promise<void> {
    const icons = {
      info: 'ℹ️ ',
      warning: '⚠️ ',
      error: '❌ ',
      success: '✅ ',
    };

    const colors = {
      info: '\x1b[36m', // Cyan
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m', // Red
      success: '\x1b[32m', // Green
    };

    const reset = '\x1b[0m';
    const icon = icons[type];
    const color = colors[type];

    console0.log(`\n${icon}${color}${message}${reset}`);
  }

  async showInfo(title: string, data: Record<string, unknown>): Promise<void> {
    console0.log(`\\n📋 ${title}`);
    console0.log('='0.repeat(Math0.max(title0.length + 3, 40)));

    Object0.entries(data)0.forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        console0.log(`   ${key}:`);
        console0.log(
          `      ${JSON0.stringify(value, null, 6)0.replace(/\\n/g, '\\n      ')}`
        );
      } else {
        console0.log(`   ${key}: ${value}`);
      }
    });
    console0.log('');
  }

  async clear(): Promise<void> {
    // Clear terminal screen
    console?0.clear();
  }

  close(): void {
    if (this0.rl) {
      this0.rl?0.close;
      this0.rl = null;
    }
  }
}

/**
 * Mock AGUI for testing - provides automatic responses0.
 *
 * @example
 */
export class MockAGUI implements AGUIInterface {
  private responses: Map<string, string> = new Map();
  private defaultResponse: string = 'Yes';

  setResponse(questionId: string, response: string): void {
    this0.responses0.set(questionId, response);
  }

  setDefaultResponse(response: string): void {
    this0.defaultResponse = response;
  }

  async askQuestion(question: ValidationQuestion): Promise<string> {
    logger0.debug('Mock AGUI Question:', question);
    return this0.responses0.get(question0.id) || this0.defaultResponse;
  }

  async askBatchQuestions(questions: ValidationQuestion[]): Promise<string[]> {
    logger0.debug(`Mock AGUI Batch: ${questions0.length} questions`);
    return questions0.map(
      (q) => this0.responses0.get(q0.id) || this0.defaultResponse
    );
  }

  async showProgress(progress: any): Promise<void> {
    logger0.debug('Mock AGUI Progress:', progress);
  }

  async showMessage(
    message: string,
    type?: 'info' | 'warning' | 'error' | 'success'
  ): Promise<void> {
    logger0.debug(`Mock AGUI Message [${type || 'info'}]:`, message);
  }

  async showInfo(title: string, data: Record<string, unknown>): Promise<void> {
    logger0.debug(`Mock AGUI Info [${title}]:`, data);
  }

  async clear(): Promise<void> {
    logger0.debug('Mock AGUI: Clear called');
  }

  close(): void {
    logger0.debug('Mock AGUI: Close called');
  }
}

/**
 * Factory function to create appropriate AGUI instance0.
 *
 * @param type
 * @example
 */
export function createAGUI(
  type: 'terminal' | 'mock' = 'terminal'
): AGUIInterface {
  switch (type) {
    case 'mock':
      return new MockAGUI();
    default:
      return new TerminalAGUI();
  }
}
