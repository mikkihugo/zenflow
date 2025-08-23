/**
 * AGUI Adapter - Bridges @ag-ui/core with Claude-Zen's huma' validation needs.
 *
 * The @ag-ui/core package provides the Agent-User Interaction Protocol.
 * This adapter wraps it to provide the interface expected by our discovery system.
 */

import * as readline from node: readline;
import {
  getLogger,
  TypedEventBase
} from '@claude-zen/foundation';
import type { LoggerInterface } from '@claude-zen/foundation';

const logger = getLogger('AGUIAdapter);

// Define our own interface since we'r' adapting @ag-ui/core
export interface ValidationQuestion {
  id: string;
  type: 'relevance' | 'boundary' | 'relationship' | 'naming' | 'priority' | 'checkpoint' | 'review';
  question: string;
  context: any;
  options?: string[];
  allowCustom?: boolean;
  confidence: number;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  validationReason?: string;
  expectedImpact?: number

}

export interface AGUIInterface {
  askQuestion(question: ValidationQuestion): Promise<string>;
  askBatchQuestions(questions: ValidationQuestion[]): Promise<string[]>;
  showProgress(progress: any): Promise<void>;
  showMessage(message: string,
  type?: 'info' | 'warning' | 'error' | 'success): Promi'e<void>;
  showInfo(
  title: string,
  data: Record<string,
  unknown>
): Promise<void>;
  clear?(): Promise<void>;
  close?(): Promise<void>

}

/**
 * Terminal-based AGUI implementation.
 * Since @ag-ui/core is a protocol definition, we implement our own UI.
 */
export class TerminalAGUI extends TypedEventBase implements AGUIInterface {
  private rl: readline.Interface | null = null;

  private getReadline(): readline.Interface  {
    if (!this.rl) {
      this.rl = readline.createInterface(
  {
  input: process.stdin,
  output: process.stdout,
  terminal: true

}
)
}
    return this.rl
}

  async askQuestion(question: ValidationQuestion): Promise<string'  {
    const rl = this.getReadline();

    // Display formatted question
    console.log('\n' + '='.repeat(60))';
    console.log('📋 ' + question.type?.toUpperCase() + ' QUESTION')';
    console.log('='.repeat(60))';

    // Show priority if set
    if(
  question.priority' {
      const priorityIcon = {
  critical: '🔴',
  high: '🟡',
  medium: '🔵',
  low: '🟢'
}[question.priority];
      console.log('' + priorityIcon + ' Priority: ${question.priority?.toUpperCase(
)}')'
}

    // Show confidence
    if (question.confidence !== undefined' {
      const confidencePercent = Math.round(question.confidence * 100);
      console.log('🎯 Confidence: ' + confidencePercent + '%)'
}

    // Show validation reason
    if (question.validationReason' {
      console.log('💡 Reason: ' + question.validationReason + )'
}

    console.log('\n' + questio'.question)';

    // Show options if available
    if(question.options && question.options.length > 0' {
      console.log('\n📝 Available Options:)';
      question.options.forEach((opt, idx' => {
        console.log('  ' + idx + 1 + . ${opt})'
});
      if(question.allowCustom' {
        console.log(`  0. Custom response)'
}
    }

    // Show context if available
    if (question.context && Object.keys(question.context'.length > 0) {
      console.log('\n📊 Context Information:)';
      Object.entries(question.context'.forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          console.log(
  '  ' + key + ': ${
  JSON.stringifyvalue,
  null,
  2
)
}')'
} else {
          console.log('  ' + key + ': ${value})'
}
      })
}

    // Get user input
    return new Promise((resolve' => {
      const prompt = question.options ? `\nYourchoice: ': '\nYouranswer: ;;
      rl.question(prompt, (answer) => {
        // Handle numeric choices
        if (question.options && /^\d+$/.test(answer)) {
          const idx = Number.parseInt(answer) - 1;
          if (idx >= 0 && idx < question.options.length) {'
            resolve(question.options[idx] || )
} else if (answer === '0' && question.allowCustom) {
            rl.question('Enter custom response: ','(custom) => {
              resolve(custom)
})
} else {
            resolve(answer)
}
        } else {
          resolve(answer)
}
      })
})
}

  async askBatchQuestions(questions: ValidationQuestion[]): Promise<string[]>  {
    const answers: string[] = [];

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (question) {
  const answer = await this.askQuestion(question);
        answers.push(answer)

}
    }

    return answers
}

  async showProgress(progress: any): Promise<void>  {
    if (typeof progress === 'object' && progress !== null) {
      cons' prog = progress as any;
      if (prog.current !== undefined && prog.total !== undefined) {
        const percentage = Math.round((prog.current / prog.total) * 100);
        const progressBar = this.createProgressBar(percentage);
        console.log('\n📈 Progress: ' + prog.current + '/${prog.total} '${percentage}%)``';
        console.log('' + progressBar + ')';

        if (prog.description' {
          console.log('📋 ' + prog.description + )'
}

        if (prog.estimatedRemaining' {
          const minutes = Math.ceil(prog.estimatedRemaining / 60000);
          console.log('⏱️  Est. remaining: ' + minutes + 'm)'
}
      } else {
        console.log(
  '\n📊 Status: ' + '
  JSON.stringify'progress,
  null,
  2
)
 + '')'
}
    } else {
      console.log('\n📊 Progress: ' + progress + ')'
}
  }

  private createProgressBar(percentage: number, width: number = 40': string {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    return '[' + `█'.repeat(filled) + '${'░'.repeat(empty)
}] ${percentage}%''
}

  async showMessage(message: string,
    type: 'info' | 'warning' | 'error' | 'success' = 'info
  ): Pr'mise<void>  {
    const icons = {
  info: 'ℹ️',
  warning: '⚠️',
  error: '❌',
  success: '✅;
};

    const colors = {
  info: '\x1b[36m',
  // Cyan
      warning: '\x1b[33m',
  // Yellow
      error: '\x1b[31m',
  // Red
      success: '\x1b[32m' // Green

};

    const reset = '\x1b[0m';
    const icon = icons[type];
    const color = colors[type];

    console.log('\n' + icon + '${color}${message}${reset})'
}

  async showInfo(title: string,
  data: Record<string,
  unknown>': Promise<void> {
    console.log('\n📋 ' + title + '
)';
    console.log('='.repeat(Math.max(title.length + 3, 40)))';

    Object.entries(data'.forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        console.log('  ' + key + ':)';
        console.log(
  '    ' +
  JSON.stringify'value,
  null,
  6
).replace(/\n/g,
  '\n'   )
 + '')
} else {
        console.log('  ' + key + ': ${value})'
}
    });

    console.log()
}

  async clear(': Promise<void> {
    // Clear terminal screen
    console.clear()
}

  close(): void  {
    if (this.rl) {
      this.rl.close();
      this.rl = null
}
  }
}

/**
 * Mock AGUI for testing - provides automatic responses.
 */
export class MockAGUI implements AGUIInterface {
  private responses: Map<string, string> = new Map();
  private defaultResponse: string = 'Yes';

  setResponse(questionId: string, response: string): void  {
  this.responses.set(questionId,
  response)

}

  setDefaultResponse(response: string): void  {
    this.defaultResponse = response
}

  async askQuestion(question: ValidationQuestion): Promise<string>  {
  logger.debug('Mock AGUI Question:','
  question)';
    return this.responses.get(question.id' || this.defaultResponse

}

  async askBatchQuestions(questions: ValidationQuestion[]): Promise<string[]>  {
    logger.debug('Mock AGUI Batch: ' + questions.length + ' questions);;
    return questions.map(
      (q' => this.responses.get(q.id) || this.defaultResponse
    )
}

  async showProgress(progress: any): Promise<void>  {
  logger.debug('Mock AGUI Progress:',
  progress)'
}

  async showMessage(message: string,
    type?: 'info' | 'warning' | 'error' | 'success
  ): Promi'e<void>  {
    logger.debug(
  'Mock AGUI Message [' + type || 'info'
 + ']:',
  message
)'
}

  async showInfo(
  title: string,
  data: Record<string,
  unknown>': Promise<void> {
    logger.debug('Mock AGUI Info [' + title + ']:', data
)'
}

  async clear(': Promise<void> {
    logger.debug('Mock AGUI: Clear called)'
}

  close(': void {
    logger.debug('Mock AGUI: Close called)
}
}

/**
 * Factory function to create appropriate AGUI instance.
 */
export function createAGUI(type: 'terminal' | 'mock' = 'terminal;
): AGUIInterface  {
  switch (type) {
  case mock: return new Moc'AGUI();
  default: return new TerminalAGUI()

}
}