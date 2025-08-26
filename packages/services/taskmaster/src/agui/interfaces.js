/**
 * AGUI Interfaces - Self-contained interface definitions
 * Copied from /src/interfaces/agui/ to make package self-contained
 */
import { getLogger, TypedEventBase } from '@claude-zen/foundation';
const logger = getLogger('AGUIAdapter');
';
/**
 * Web-based AGUI implementation for browser environments.
 */
export class WebAGUI extends TypedEventBase {
    container = null;
    constructor(_containerSelector) {
        super();
        if (typeof window !== 'undefined') {
            ';
            this.container = containerSelector
                ? document.querySelector(containerSelector)
                : document.body;
        }
    }
    async askQuestion(question) {
        return new Promise((resolve) => {
            if (!this.container) {
                logger.warn('WebAGUI: No container available, returning default response', ');
                resolve('Yes');
                ';
                return;
            }
            // Create question modal
            const modal = document.createElement('div');
            ';
            modal.className = 'agui-modal';
            modal.innerHTML = ``
                < div;
            class {
            }
            "agui-modal-content" >
                $;
            {
                question.type.toUpperCase();
            }
            Question < /h3>
                < p > $question.question < /p>;
            $;
            question.options
                ? ``
                    < div : ;
            class {
            }
            "agui-options" >
                $;
            {
                question.options
                    .map((_opt, _idx) => `<button class="agui-option" data-value="${opt}">${opt}</button>` `
                )
                .join('')'
            </div>
          ` `
              : ` `
            <input type="text" class="agui-input" placeholder="Enter your response">
          ` `
          }
          <div class="agui-actions">
            <button class="agui-submit">Submit</button>
            <button class="agui-cancel">Cancel</button>
          </div>
        </div>
      `);
                `

      this.container.appendChild(modal);

      // Handle responses
      const handleResponse = (value: string) => {
        this.container?.removeChild(modal);
        resolve(value);
      };

      // Option buttons
      modal.querySelectorAll('.agui-option').forEach((_btn) => {'
        btn.addEventListener('click', () => {'
          const value = (btn as HTMLElement).dataset.value||';
          handleResponse(value);
        });
      });

      // Submit button
      modal.querySelector('.agui-submit')?.addEventListener('click', () => {'
        const input = modal.querySelector('.agui-input') as HTMLInputElement;'
        const value = input ? input.value : 'Yes;
        handleResponse(value);
      });

      // Cancel button
      modal.querySelector('.agui-cancel')?.addEventListener('click', () => {'
        handleResponse('Cancel');'
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

    let progressElement = this.container.querySelector('.agui-progress');'
    if (!progressElement) {
      progressElement = document.createElement('div');'
      progressElement.className = 'agui-progress';
      this.container.appendChild(progressElement);
    }

    if (typeof progress === 'object' && progress !== null) {'
      const prog = progress as any;
      if (prog.current !== undefined && prog.total !== undefined) {
        const _percentage = Math.round((prog.current / prog.total) * 100);
        progressElement.innerHTML = ` `
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${percentage}%"></div>
          </div>
          <div class="progress-text">${prog.current}/${prog.total} (${percentage}%)</div>
          $prog.description ? ` < div;
                class {
                }
                "progress-description" > $;
                {
                    prog.description;
                }
                /div>` : ''' `;`;
            }
        });
    }
    async showMessage(message, type = 'info', ) {
        if (!this.container) {
            console.log(`[$type.toUpperCase()] $message`);
            `
      return;
    }

    const messageElement = document.createElement('div');'
    messageElement.className = `;
            agui - message;
            agui - message - $type `;`;
            messageElement.textContent = message;
            this.container.appendChild(messageElement);
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (this.container?.contains(messageElement)) {
                    this.container.removeChild(messageElement);
                }
            }, 5000);
        }
        async;
        showInfo(title, string, data, (Record));
        Promise < void  > {
            : .container, return: ,
            const: infoElement = document.createElement('div'), ': infoElement.className = 'agui-info',
            infoElement, : .innerHTML = ``
                < h3 > $title < /h3>
                < pre > $JSON.stringify(data, null, 2) < /pre> `;`,
            this: .container.appendChild(infoElement)
        };
        async;
        clear();
        Promise;
        if (this.container) {
            this.container.innerHTML = '';
        }
        async;
        close();
        Promise;
        // Cleanup event listeners and DOM elements
        this.removeAllListeners();
    }
}
/**
 * Headless AGUI for server-side and automated environments.
 * Provides automatic responses without UI components.
 */
export class HeadlessAGUI {
    responses = new Map();
    defaultResponse = 'Yes';
    setResponse(questionId, response) {
        this.responses.set(questionId, response);
    }
    setDefaultResponse(response) {
        this.defaultResponse = response;
    }
    async askQuestion(question) {
        logger.debug('Headless AGUI Question:', question);
        ';
        const response = this.responses.get(question.id) || this.defaultResponse;
        return response;
    }
    async askBatchQuestions(questions) {
        logger.debug(`Headless AGUI Batch: ${questions.length} questions`);
        `
    return questions.map(
      (q) => this.responses.get(q.id)||this.defaultResponse
    );
  }

  async showProgress(progress: unknown): Promise<void> {
    logger.debug('Headless AGUI Progress:', progress);'
  }

  async showMessage(
    message: string,
    type?: 'info|warning|error|success'): Promise<void> {'
    logger.debug(`;
        Headless;
        AGUI;
        Message[$type || 'info'];
        `, message);`;
    }
    async showInfo(title, data) {
        logger.debug(`Headless AGUI Info [$title]:`, data);
        `
  }

  async clear(): Promise<void> {
    logger.debug('Headless AGUI: Clear called');'
  }

  async close(): Promise<void> {
    logger.debug('Headless AGUI: Close called');'
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
    case 'headless':'
      return new HeadlessAGUI();
    default:
      return new WebAGUI(containerSelector);
  }
}
        ;
    }
}
