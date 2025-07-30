/**
 * Output Formatting Utilities
 * Comprehensive output formatting with colors, tables, and structured data
 */

import { 
  OutputFormatter as IOutputFormatter, 
  OutputFormat, 
  TableColumn, 
  TableOptions 
} from '../../types/cli';
import { CLIError } from '../core/cli-error';

// =============================================================================
// COLOR UTILITIES
// =============================================================================

interface ColorCodes {
  reset: string;
  bright: string;
  dim: string;
  underscore: string;
  blink: string;
  reverse: string;
  hidden: string;
  
  // Foreground colors
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  
  // Background colors
  bgBlack: string;
  bgRed: string;
  bgGreen: string;
  bgYellow: string;
  bgBlue: string;
  bgMagenta: string;
  bgCyan: string;
  bgWhite: string;
}

const colors: ColorCodes = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

function supportsColor(): boolean {
  return process.stdout.isTTY && 
         process.env.NODE_ENV !== 'test' && 
         process.env.NO_COLOR !== '1';
}

function colorize(text: string, color: keyof ColorCodes): string {
  if (!supportsColor()) {
    return text;
  }
  return `${colors[color]}${text}${colors.reset}`;
}

// =============================================================================
// EMOJI AND ICON UTILITIES
// =============================================================================

const icons = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  loading: '⏳',
  rocket: '🚀',
  diamond: '💎',
  fire: '🔥',
  zap: '⚡',
  target: '🎯',
  chart: '📊',
  search: '🔍',
  bee: '🐝',
  art: '🎨',
  bulb: '💡',
  gear: '⚙️',
  shield: '🛡️',
  heart: '❤️',
  star: '⭐',
  check: '✓',
  cross: '✗',
  arrow: '→',
  doubleArrow: '⇒'
};

function getIcon(name: keyof typeof icons, fallback = ''): string {
  if (process.env.NO_EMOJI === '1' || process.platform === 'win32') {
    return fallback;
  }
  return icons[name] || fallback;
}

// =============================================================================
// BASIC OUTPUT FUNCTIONS
// =============================================================================

export function printSuccess(message: string, data?: any): void {
  const icon = getIcon('success', '[SUCCESS]');
  const coloredMessage = colorize(message, 'green');
  console.log(`${icon} ${coloredMessage}`);
  
  if (data && process.env.CLAUDE_FLOW_VERBOSE === 'true') {
    console.log(colorize(JSON.stringify(data, null, 2), 'dim'));
  }
}

export function printError(message: string, error?: Error): void {
  const icon = getIcon('error', '[ERROR]');
  const coloredMessage = colorize(message, 'red');
  console.error(`${icon} ${coloredMessage}`);
  
  if (error && process.env.CLAUDE_FLOW_VERBOSE === 'true') {
    console.error(colorize(error.stack || error.message, 'dim'));
  }
}

export function printWarning(message: string, data?: any): void {
  const icon = getIcon('warning', '[WARNING]');
  const coloredMessage = colorize(message, 'yellow');
  console.warn(`${icon} ${coloredMessage}`);
  
  if (data && process.env.CLAUDE_FLOW_VERBOSE === 'true') {
    console.warn(colorize(JSON.stringify(data, null, 2), 'dim'));
  }
}

export function printInfo(message: string, data?: any): void {
  const icon = getIcon('info', '[INFO]');
  const coloredMessage = colorize(message, 'cyan');
  console.log(`${icon} ${coloredMessage}`);
  
  if (data && process.env.CLAUDE_FLOW_VERBOSE === 'true') {
    console.log(colorize(JSON.stringify(data, null, 2), 'dim'));
  }
}

export function printDebug(message: string, data?: any): void {
  if (process.env.NODE_ENV !== 'development' && process.env.CLAUDE_FLOW_DEBUG !== 'true') {
    return;
  }
  
  const coloredMessage = colorize(`[DEBUG] ${message}`, 'dim');
  console.log(coloredMessage);
  
  if (data) {
    console.log(colorize(JSON.stringify(data, null, 2), 'dim'));
  }
}

export function printVerbose(message: string, data?: any): void {
  if (process.env.CLAUDE_FLOW_VERBOSE !== 'true') {
    return;
  }
  
  const coloredMessage = colorize(`[VERBOSE] ${message}`, 'dim');
  console.log(coloredMessage);
  
  if (data) {
    console.log(colorize(JSON.stringify(data, null, 2), 'dim'));
  }
}

// =============================================================================
// PROGRESS AND LOADING
// =============================================================================

export class ProgressBar {
  private current = 0;
  private total: number;
  private width: number;
  private message: string;
  private startTime: number;

  constructor(total: number, width = 40, message = 'Progress') {
    this.total = total;
    this.width = width;
    this.message = message;
    this.startTime = Date.now();
  }

  update(current: number, customMessage?: string): void {
    this.current = current;
    const percentage = Math.round((current / this.total) * 100);
    const filled = Math.round((current / this.total) * this.width);
    const empty = this.width - filled;
    
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const elapsed = Date.now() - this.startTime;
    const eta = current > 0 ? Math.round((elapsed / current) * (this.total - current)) : 0;
    
    const message = customMessage || this.message;
    const statusLine = `${message}: [${colorize(bar, 'cyan')}] ${percentage}% (${current}/${this.total}) ETA: ${eta}ms`;
    
    process.stdout.write(`\r${statusLine}`);
    
    if (current === this.total) {
      process.stdout.write('\n');
      printSuccess(`${message} completed in ${elapsed}ms`);
    }
  }

  finish(message?: string): void {
    this.update(this.total, message);
  }
}

export class Spinner {
  private frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  private interval?: NodeJS.Timeout;
  private currentFrame = 0;
  private message: string;

  constructor(message = 'Loading...') {
    this.message = message;
  }

  start(): void {
    if (this.interval) {
      return;
    }

    this.interval = setInterval(() => {
      const frame = this.frames[this.currentFrame];
      process.stdout.write(`\r${colorize(frame, 'cyan')} ${this.message}`);
      this.currentFrame = (this.currentFrame + 1) % this.frames.length;
    }, 100);
  }

  updateMessage(message: string): void {
    this.message = message;
  }

  stop(finalMessage?: string): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
    
    process.stdout.write('\r' + ' '.repeat(this.message.length + 2) + '\r');
    
    if (finalMessage) {
      printSuccess(finalMessage);
    }
  }

  fail(errorMessage?: string): void {
    this.stop();
    if (errorMessage) {
      printError(errorMessage);
    }
  }
}

// =============================================================================
// TABLE FORMATTING
// =============================================================================

export function formatTable(data: any[], options: TableOptions): string {
  if (!data || data.length === 0) {
    return colorize('No data to display', 'dim');
  }

  const { columns, title, border = true, striped = false, compact = false } = options;
  
  // Calculate column widths
  const columnWidths = columns.map(col => {
    const headerWidth = col.title.length;
    const dataWidth = Math.max(...data.map(row => {
      const value = row[col.key];
      const formatted = col.format ? col.format(value) : String(value || '');
      return formatted.length;
    }));
    return Math.max(headerWidth, dataWidth, col.width || 0);
  });

  let result = '';
  const padding = compact ? 1 : 2;
  
  // Title
  if (title) {
    const titleWidth = columnWidths.reduce((sum, width) => sum + width + padding * 2, 0) + columns.length - 1;
    result += colorize(title.padStart((titleWidth + title.length) / 2).padEnd(titleWidth), 'bright') + '\n';
    if (border) {
      result += '═'.repeat(titleWidth) + '\n';
    }
  }

  // Header
  const headerRow = columns.map((col, i) => {
    const content = col.title.padEnd(columnWidths[i]);
    return colorize(content, 'bright');
  }).join(border ? ' │ ' : '   ');
  
  result += headerRow + '\n';
  
  // Header separator
  if (border) {
    const separator = columnWidths.map(width => '─'.repeat(width)).join('─┼─');
    result += separator + '\n';
  }

  // Data rows
  data.forEach((row, rowIndex) => {
    const dataRow = columns.map((col, colIndex) => {
      const value = row[col.key];
      let formatted = col.format ? col.format(value) : String(value || '');
      
      // Apply alignment
      switch (col.align) {
        case 'center':
          formatted = formatted.padStart((columnWidths[colIndex] + formatted.length) / 2).padEnd(columnWidths[colIndex]);
          break;
        case 'right':
          formatted = formatted.padStart(columnWidths[colIndex]);
          break;
        default:
          formatted = formatted.padEnd(columnWidths[colIndex]);
      }
      
      // Apply striping
      if (striped && rowIndex % 2 === 1) {
        return colorize(formatted, 'dim');
      }
      
      return formatted;
    }).join(border ? ' │ ' : '   ');
    
    result += dataRow + '\n';
  });

  return result;
}

// =============================================================================
// OUTPUT FORMATTER IMPLEMENTATION
// =============================================================================

export class TypeScriptOutputFormatter implements IOutputFormatter {
  format(data: any, format: OutputFormat): string {
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
        
      case 'yaml':
        return this.formatYaml(data);
        
      case 'table':
        if (Array.isArray(data)) {
          return this.formatArrayAsTable(data);
        }
        return this.formatObjectAsTable(data);
        
      case 'tree':
        return this.formatTree(data);
        
      case 'text':
      default:
        return this.formatText(data);
    }
  }

  formatError(error: CLIError): string {
    let message = colorize(`Error: ${error.message}`, 'red');
    
    if (error.command) {
      message += `\n  Command: ${error.command}`;
    }
    
    if (error.details.code) {
      message += `\n  Code: ${error.details.code}`;
    }
    
    if (error.details.context) {
      const contextEntries = Object.entries(error.details.context)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => `    ${key}: ${JSON.stringify(value)}`)
        .join('\n');
      
      if (contextEntries) {
        message += `\n  Context:\n${contextEntries}`;
      }
    }
    
    if (process.env.CLAUDE_FLOW_VERBOSE === 'true' && error.stack) {
      message += `\n\nStack Trace:\n${colorize(error.stack, 'dim')}`;
    }
    
    return message;
  }

  formatSuccess(message: string): string {
    return colorize(`${getIcon('success')} ${message}`, 'green');
  }

  formatWarning(message: string): string {
    return colorize(`${getIcon('warning')} ${message}`, 'yellow');
  }

  formatInfo(message: string): string {
    return colorize(`${getIcon('info')} ${message}`, 'cyan');
  }

  private formatYaml(data: any, indent = 0): string {
    const spaces = '  '.repeat(indent);
    
    if (Array.isArray(data)) {
      return data.map(item => `${spaces}- ${this.formatYaml(item, indent + 1).trim()}`).join('\n');
    }
    
    if (typeof data === 'object' && data !== null) {
      return Object.entries(data)
        .map(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            return `${spaces}${key}:\n${this.formatYaml(value, indent + 1)}`;
          }
          return `${spaces}${key}: ${value}`;
        })
        .join('\n');
    }
    
    return String(data);
  }

  private formatArrayAsTable(data: any[]): string {
    if (data.length === 0) {
      return colorize('No data to display', 'dim');
    }
    
    // Auto-detect columns from first object
    const firstItem = data[0];
    if (typeof firstItem !== 'object' || firstItem === null) {
      // Simple array
      return data.map((item, index) => `${index}: ${item}`).join('\n');
    }
    
    const columns: TableColumn[] = Object.keys(firstItem).map(key => ({
      key,
      title: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
      align: 'left'
    }));
    
    return formatTable(data, { columns, border: true, striped: true });
  }

  private formatObjectAsTable(data: any): string {
    if (typeof data !== 'object' || data === null) {
      return String(data);
    }
    
    const entries = Object.entries(data).map(([key, value]) => ({
      property: key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value)
    }));
    
    const columns: TableColumn[] = [
      { key: 'property', title: 'Property', align: 'left' },
      { key: 'value', title: 'Value', align: 'left' }
    ];
    
    return formatTable(entries, { columns, border: true });
  }

  private formatTree(data: any, prefix = '', isLast = true): string {
    let result = '';
    
    if (typeof data !== 'object' || data === null) {
      return prefix + String(data);
    }
    
    const entries = Object.entries(data);
    
    entries.forEach(([key, value], index) => {
      const isLastEntry = index === entries.length - 1;
      const connector = isLastEntry ? '└── ' : '├── ';
      const nextPrefix = prefix + (isLastEntry ? '    ' : '│   ');
      
      result += prefix + connector + colorize(key, 'bright');
      
      if (typeof value === 'object' && value !== null) {
        result += '\n' + this.formatTree(value, nextPrefix, isLastEntry);
      } else {
        result += ': ' + colorize(String(value), 'dim');
      }
      
      if (index < entries.length - 1) {
        result += '\n';
      }
    });
    
    return result;
  }

  private formatText(data: any): string {
    if (typeof data === 'string') {
      return data;
    }
    
    if (typeof data === 'object' && data !== null) {
      return JSON.stringify(data, null, 2);
    }
    
    return String(data);
  }
}

// =============================================================================
// GLOBAL FORMATTER INSTANCE
// =============================================================================

export const outputFormatter = new TypeScriptOutputFormatter();

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function createBox(content: string, title?: string, width?: number): string {
  const lines = content.split('\n');
  const maxLength = Math.max(
    ...lines.map(line => line.length),
    title ? title.length + 2 : 0,
    width || 0
  );
  
  const boxWidth = maxLength + 4; // 2 chars padding on each side
  
  let result = '';
  
  // Top border
  if (title) {
    const titlePadding = Math.max(0, boxWidth - title.length - 4);
    const leftPadding = Math.floor(titlePadding / 2);
    const rightPadding = titlePadding - leftPadding;
    result += '┌' + '─'.repeat(leftPadding) + ` ${title} ` + '─'.repeat(rightPadding) + '┐\n';
  } else {
    result += '┌' + '─'.repeat(boxWidth - 2) + '┐\n';
  }
  
  // Content lines
  lines.forEach(line => {
    const padding = boxWidth - line.length - 4;
    result += `│  ${line}${' '.repeat(Math.max(0, padding))}  │\n`;
  });
  
  // Bottom border
  result += '└' + '─'.repeat(boxWidth - 2) + '┘';
  
  return result;
}

export function truncateString(str: string, maxLength: number, suffix = '...'): string {
  if (str.length <= maxLength) {
    return str;
  }
  
  return str.substring(0, maxLength - suffix.length) + suffix;
}

export function padString(str: string, length: number, align: 'left' | 'center' | 'right' = 'left'): string {
  if (str.length >= length) {
    return str;
  }
  
  const padding = length - str.length;
  
  switch (align) {
    case 'center':
      const leftPad = Math.floor(padding / 2);
      const rightPad = padding - leftPad;
      return ' '.repeat(leftPad) + str + ' '.repeat(rightPad);
      
    case 'right':
      return ' '.repeat(padding) + str;
      
    case 'left':
    default:
      return str + ' '.repeat(padding);
  }
}

export function wrapText(text: string, width: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    if ((currentLine + word).length > width) {
      if (currentLine) {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        // Word is longer than width, force break
        lines.push(word);
      }
    } else {
      currentLine += word + ' ';
    }
  }
  
  if (currentLine) {
    lines.push(currentLine.trim());
  }
  
  return lines;
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  colors,
  icons,
  colorize,
  getIcon,
  supportsColor,
  ProgressBar,
  Spinner
};