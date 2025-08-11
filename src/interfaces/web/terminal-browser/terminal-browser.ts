/**
 * @fileoverview Embedded Terminal Browser
 *
 * Self-contained terminal browser using terminal-kit and blessed
 * for accessing the web dashboard from terminal environments.
 * No external browser dependencies required.
 */

import * as blessed from 'blessed';
import fetch from 'node-fetch';
import { parse } from 'node-html-parser';
import * as terminalKit from 'terminal-kit';
import { getLogger } from '../../../config/logging-config.js';

const logger = getLogger('terminal-browser');
const terminal = terminalKit.terminal;

export interface TerminalBrowserConfig {
  /** Base URL for the web dashboard */
  baseUrl?: string;
  /** Terminal width (auto-detected if not specified) */
  width?: number;
  /** Terminal height (auto-detected if not specified) */
  height?: number;
  /** Enable keyboard navigation */
  enableNavigation?: boolean;
  /** Enable form interaction */
  enableForms?: boolean;
  /** Refresh interval for live data (ms) */
  refreshInterval?: number;
}

/**
 * Embedded Terminal Browser
 *
 * Provides a full web browsing experience within the terminal
 * using blessed for UI components and node-html-parser for HTML processing.
 */
export class TerminalBrowser {
  private config: Required<TerminalBrowserConfig>;
  private screen: any;
  private currentUrl: string = '';
  private history: string[] = [];
  private historyIndex: number = -1;
  private refreshTimer?: NodeJS.Timeout;

  constructor(config: TerminalBrowserConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || 'http://localhost:3000',
      width: config.width || process.stdout.columns || 80,
      height: config.height || process.stdout.rows || 24,
      enableNavigation: config.enableNavigation ?? true,
      enableForms: config.enableForms ?? true,
      refreshInterval: config.refreshInterval || 5000,
    };

    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Claude Code Zen - Terminal Browser',
      dockBorders: true,
      fullUnicode: true,
      autoPadding: true,
    });

    this.setupUI();
    this.setupKeyHandlers();
  }

  /**
   * Setup the terminal UI layout
   */
  private setupUI(): void {
    // Header with URL bar
    const header = blessed.box({
      parent: this.screen,
      top: 0,
      left: 0,
      width: '100%',
      height: 3,
      border: {
        type: 'line',
      },
      style: {
        border: {
          fg: 'cyan',
        },
        bg: 'black',
        fg: 'white',
      },
      label: ' Address Bar ',
      content: `URL: ${this.config.baseUrl}`,
    });

    // Main content area
    const content = blessed.box({
      parent: this.screen,
      top: 3,
      left: 0,
      width: '100%',
      height: '100%-5',
      border: {
        type: 'line',
      },
      style: {
        border: {
          fg: 'blue',
        },
      },
      label: ' Web Content ',
      scrollable: true,
      alwaysScroll: true,
      scrollbar: {
        style: {
          bg: 'blue',
        },
      },
      keys: true,
      vi: true,
    });

    // Footer with help
    const footer = blessed.box({
      parent: this.screen,
      bottom: 0,
      left: 0,
      width: '100%',
      height: 2,
      border: {
        type: 'line',
      },
      style: {
        border: {
          fg: 'green',
        },
        bg: 'black',
        fg: 'yellow',
      },
      content: 'Press q to quit | r to refresh | h for help | ↑↓ to scroll',
    });

    this.screen.key(['q', 'C-c'], () => {
      this.shutdown();
    });

    this.screen.render();
  }

  /**
   * Setup keyboard navigation handlers
   */
  private setupKeyHandlers(): void {
    if (!this.config.enableNavigation) return;

    this.screen.key(['r', 'f5'], () => {
      this.refresh();
    });

    this.screen.key(['h', '?'], () => {
      this.showHelp();
    });

    this.screen.key(['left', 'backspace'], () => {
      this.goBack();
    });

    this.screen.key(['right'], () => {
      this.goForward();
    });

    this.screen.key(['enter'], () => {
      this.handleEnter();
    });

    // Navigation shortcuts
    this.screen.key(['1'], () => this.navigateTo('/'));
    this.screen.key(['2'], () => this.navigateTo('/api-docs'));
    this.screen.key(['3'], () => this.navigateTo('/tsdocs'));
    this.screen.key(['4'], () => this.navigateTo('/health'));
    this.screen.key(['5'], () => this.navigateTo('/metrics'));
  }

  /**
   * Open the dashboard in terminal browser
   */
  async openDashboard(url?: string): Promise<void> {
    const targetUrl = url || this.config.baseUrl;

    try {
      logger.info('Opening dashboard in terminal browser', { url: targetUrl });

      // Show loading message
      this.showLoading();

      // Navigate to the URL
      await this.navigateTo(targetUrl);

      // Start auto-refresh if enabled
      if (this.config.refreshInterval > 0) {
        this.startAutoRefresh();
      }

      logger.info('Terminal browser opened successfully');
    } catch (error) {
      logger.error('Failed to open dashboard', {
        error: error instanceof Error ? error.message : String(error),
      });
      this.showError(error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Navigate to a specific URL
   */
  private async navigateTo(url: string): Promise<void> {
    try {
      // Resolve relative URLs
      const fullUrl = url.startsWith('http')
        ? url
        : `${this.config.baseUrl}${url}`;

      logger.debug('Navigating to URL', { url: fullUrl });

      // Fetch the page
      const response = await fetch(fullUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();

      // Parse and render the HTML
      await this.renderHTML(html);

      // Update navigation state
      this.currentUrl = fullUrl;
      this.addToHistory(fullUrl);
      this.updateAddressBar();
    } catch (error) {
      logger.error('Navigation failed', {
        url,
        error: error instanceof Error ? error.message : String(error),
      });
      this.showError(
        `Failed to load: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Render HTML content in the terminal
   */
  private async renderHTML(html: string): Promise<void> {
    try {
      const doc = parse(html);

      // Extract content from common elements
      const title = doc.querySelector('title')?.text || 'Claude Code Zen';
      const body = doc.querySelector('body');

      if (!body) {
        this.showError('Invalid HTML: No body element found');
        return;
      }

      // Convert HTML to terminal-friendly text
      const content = this.htmlToTerminalText(body);

      // Update screen title
      this.screen.title = title;

      // Find content box and update it
      const contentBox = this.screen.children.find(
        (child) =>
          child.options && (child.options as any).label === ' Web Content ',
      ) as any;

      if (contentBox) {
        contentBox.setContent(content);
        contentBox.scrollTo(0); // Scroll to top
      }

      this.screen.render();
    } catch (error) {
      logger.error('HTML rendering failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      this.showError('Failed to render page content');
    }
  }

  /**
   * Convert HTML to terminal-friendly text
   */
  private htmlToTerminalText(element: any): string {
    let text = '';

    if (element.nodeType === 3) {
      // Text node
      return element.text?.trim() || '';
    }

    const tagName = element.tagName?.toLowerCase();

    switch (tagName) {
      case 'h1':
        text += `\n{bold}{cyan-fg}# ${element.text}{/}\n`;
        break;
      case 'h2':
        text += `\n{bold}{blue-fg}## ${element.text}{/}\n`;
        break;
      case 'h3':
        text += `\n{bold}{magenta-fg}### ${element.text}{/}\n`;
        break;
      case 'p':
        text += `\n${element.text}\n`;
        break;
      case 'a': {
        const href = element.getAttribute('href');
        text += `{underline}{blue-fg}${element.text}${href ? ` (${href})` : ''}{/}`;
        break;
      }
      case 'li':
        text += `  • ${element.text}\n`;
        break;
      case 'pre':
      case 'code':
        text += `\n{gray-bg}{white-fg} ${element.text} {/}\n`;
        break;
      case 'div':
      case 'section':
      case 'article':
        // Process children recursively
        for (const child of element.childNodes || []) {
          text += this.htmlToTerminalText(child);
        }
        text += '\n';
        break;
      case 'br':
        text += '\n';
        break;
      default:
        // Extract text from unknown elements
        if (element.text) {
          text += element.text;
        } else {
          // Process children
          for (const child of element.childNodes || []) {
            text += this.htmlToTerminalText(child);
          }
        }
    }

    return text;
  }

  /**
   * Show loading indicator
   */
  private showLoading(): void {
    const contentBox = this.screen.children.find(
      (child) =>
        child.options && (child.options as any).label === ' Web Content ',
    ) as any;

    if (contentBox) {
      contentBox.setContent(
        '\n{center}{bold}{yellow-fg}Loading...{/}{/center}',
      );
      this.screen.render();
    }
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    const contentBox = this.screen.children.find(
      (child) =>
        child.options && (child.options as any).label === ' Web Content ',
    ) as any;

    if (contentBox) {
      contentBox.setContent(
        `\n{center}{bold}{red-fg}Error: ${message}{/}{/center}`,
      );
      this.screen.render();
    }
  }

  /**
   * Show help dialog
   */
  private showHelp(): void {
    const helpContent = `
{center}{bold}{green-fg}Claude Code Zen Terminal Browser Help{/}{/center}

{bold}Navigation:{/}
  q, Ctrl+C    - Quit browser
  r, F5        - Refresh current page
  h, ?         - Show this help
  ←, Backspace - Go back in history
  →            - Go forward in history
  ↑, ↓         - Scroll content
  Enter        - Follow selected link

{bold}Quick Access:{/}
  1 - Dashboard home (/)
  2 - API Documentation (/api-docs)
  3 - Code Documentation (/tsdocs)
  4 - Health Check (/health)
  5 - Metrics (/metrics)

{bold}Features:{/}
  • Real-time auto-refresh
  • Full keyboard navigation
  • Responsive terminal layout
  • HTML content rendering

Press any key to close help...
    `;

    const helpBox = blessed.box({
      parent: this.screen,
      top: 'center',
      left: 'center',
      width: '80%',
      height: '80%',
      border: {
        type: 'line',
      },
      style: {
        border: {
          fg: 'yellow',
        },
        bg: 'black',
      },
      content: helpContent,
      scrollable: true,
      keys: true,
      vi: true,
    });

    helpBox.focus();
    helpBox.key(['escape', 'enter', 'space', 'q'], () => {
      this.screen.remove(helpBox);
      this.screen.render();
    });

    this.screen.render();
  }

  /**
   * Update address bar display
   */
  private updateAddressBar(): void {
    const headerBox = this.screen.children[0] as any;
    if (headerBox) {
      headerBox.setContent(`URL: ${this.currentUrl}`);
      this.screen.render();
    }
  }

  /**
   * Add URL to navigation history
   */
  private addToHistory(url: string): void {
    // Remove any forward history
    this.history = this.history.slice(0, this.historyIndex + 1);

    // Add new URL
    this.history.push(url);
    this.historyIndex = this.history.length - 1;
  }

  /**
   * Go back in history
   */
  private goBack(): void {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.navigateTo(this.history[this.historyIndex]);
    }
  }

  /**
   * Go forward in history
   */
  private goForward(): void {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.navigateTo(this.history[this.historyIndex]);
    }
  }

  /**
   * Handle Enter key press
   */
  private handleEnter(): void {
    // In a full implementation, this would follow the currently selected link
    // For now, just refresh the page
    this.refresh();
  }

  /**
   * Refresh current page
   */
  private refresh(): void {
    if (this.currentUrl) {
      this.navigateTo(this.currentUrl);
    }
  }

  /**
   * Start auto-refresh timer
   */
  private startAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    this.refreshTimer = setInterval(() => {
      if (this.currentUrl) {
        this.refresh();
      }
    }, this.config.refreshInterval);
  }

  /**
   * Stop auto-refresh timer
   */
  private stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = undefined;
    }
  }

  /**
   * Shutdown the terminal browser
   */
  shutdown(): void {
    logger.info('Shutting down terminal browser');

    this.stopAutoRefresh();
    this.screen.destroy();
    process.exit(0);
  }

  /**
   * Get browser status
   */
  getStatus(): any {
    return {
      currentUrl: this.currentUrl,
      historyLength: this.history.length,
      historyIndex: this.historyIndex,
      autoRefresh: !!this.refreshTimer,
      refreshInterval: this.config.refreshInterval,
      config: this.config,
    };
  }
}

/**
 * Create and configure terminal browser instance
 */
export function createTerminalBrowser(
  config?: TerminalBrowserConfig,
): TerminalBrowser {
  return new TerminalBrowser(config);
}

/**
 * Quick launch function for terminal browser
 */
export async function launchTerminalBrowser(
  url?: string,
  config?: TerminalBrowserConfig,
): Promise<void> {
  const browser = createTerminalBrowser(config);
  await browser.openDashboard(url);
}

export default TerminalBrowser;
