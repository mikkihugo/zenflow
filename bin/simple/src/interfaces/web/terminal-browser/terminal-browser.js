import * as blessed from 'blessed';
import fetch from 'node-fetch';
import { parse } from 'node-html-parser';
import * as terminalKit from 'terminal-kit';
import { getLogger } from '../../../config/logging-config.js';
const logger = getLogger('terminal-browser');
const terminal = terminalKit.terminal;
export class TerminalBrowser {
    config;
    screen;
    currentUrl = '';
    history = [];
    historyIndex = -1;
    refreshTimer;
    constructor(config = {}) {
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
    setupUI() {
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
    setupKeyHandlers() {
        if (!this.config.enableNavigation)
            return;
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
        this.screen.key(['1'], () => this.navigateTo('/'));
        this.screen.key(['2'], () => this.navigateTo('/api-docs'));
        this.screen.key(['3'], () => this.navigateTo('/tsdocs'));
        this.screen.key(['4'], () => this.navigateTo('/health'));
        this.screen.key(['5'], () => this.navigateTo('/metrics'));
    }
    async openDashboard(url) {
        const targetUrl = url || this.config.baseUrl;
        try {
            logger.info('Opening dashboard in terminal browser', { url: targetUrl });
            this.showLoading();
            await this.navigateTo(targetUrl);
            if (this.config.refreshInterval > 0) {
                this.startAutoRefresh();
            }
            logger.info('Terminal browser opened successfully');
        }
        catch (error) {
            logger.error('Failed to open dashboard', {
                error: error instanceof Error ? error.message : String(error),
            });
            this.showError(error instanceof Error ? error.message : String(error));
        }
    }
    async navigateTo(url) {
        try {
            const fullUrl = url.startsWith('http')
                ? url
                : `${this.config.baseUrl}${url}`;
            logger.debug('Navigating to URL', { url: fullUrl });
            const response = await fetch(fullUrl);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const html = await response.text();
            await this.renderHTML(html);
            this.currentUrl = fullUrl;
            this.addToHistory(fullUrl);
            this.updateAddressBar();
        }
        catch (error) {
            logger.error('Navigation failed', {
                url,
                error: error instanceof Error ? error.message : String(error),
            });
            this.showError(`Failed to load: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async renderHTML(html) {
        try {
            const doc = parse(html);
            const title = doc.querySelector('title')?.text || 'Claude Code Zen';
            const body = doc.querySelector('body');
            if (!body) {
                this.showError('Invalid HTML: No body element found');
                return;
            }
            const content = this.htmlToTerminalText(body);
            this.screen.title = title;
            const contentBox = this.screen.children.find((child) => child.options && child.options.label === ' Web Content ');
            if (contentBox) {
                contentBox.setContent(content);
                contentBox.scrollTo(0);
            }
            this.screen.render();
        }
        catch (error) {
            logger.error('HTML rendering failed', {
                error: error instanceof Error ? error.message : String(error),
            });
            this.showError('Failed to render page content');
        }
    }
    htmlToTerminalText(element) {
        let text = '';
        if (element.nodeType === 3) {
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
                for (const child of element.childNodes || []) {
                    text += this.htmlToTerminalText(child);
                }
                text += '\n';
                break;
            case 'br':
                text += '\n';
                break;
            default:
                if (element.text) {
                    text += element.text;
                }
                else {
                    for (const child of element.childNodes || []) {
                        text += this.htmlToTerminalText(child);
                    }
                }
        }
        return text;
    }
    showLoading() {
        const contentBox = this.screen.children.find((child) => child.options && child.options.label === ' Web Content ');
        if (contentBox) {
            contentBox.setContent('\n{center}{bold}{yellow-fg}Loading...{/}{/center}');
            this.screen.render();
        }
    }
    showError(message) {
        const contentBox = this.screen.children.find((child) => child.options && child.options.label === ' Web Content ');
        if (contentBox) {
            contentBox.setContent(`\n{center}{bold}{red-fg}Error: ${message}{/}{/center}`);
            this.screen.render();
        }
    }
    showHelp() {
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
    updateAddressBar() {
        const headerBox = this.screen.children[0];
        if (headerBox) {
            headerBox.setContent(`URL: ${this.currentUrl}`);
            this.screen.render();
        }
    }
    addToHistory(url) {
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(url);
        this.historyIndex = this.history.length - 1;
    }
    goBack() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.navigateTo(this.history[this.historyIndex]);
        }
    }
    goForward() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.navigateTo(this.history[this.historyIndex]);
        }
    }
    handleEnter() {
        this.refresh();
    }
    refresh() {
        if (this.currentUrl) {
            this.navigateTo(this.currentUrl);
        }
    }
    startAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        this.refreshTimer = setInterval(() => {
            if (this.currentUrl) {
                this.refresh();
            }
        }, this.config.refreshInterval);
    }
    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = undefined;
        }
    }
    shutdown() {
        logger.info('Shutting down terminal browser');
        this.stopAutoRefresh();
        this.screen.destroy();
        process.exit(0);
    }
    getStatus() {
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
export function createTerminalBrowser(config) {
    return new TerminalBrowser(config);
}
export async function launchTerminalBrowser(url, config) {
    const browser = createTerminalBrowser(config);
    await browser.openDashboard(url);
}
export default TerminalBrowser;
//# sourceMappingURL=terminal-browser.js.map