/**
 * Formatting Utilities
 * 
 * Provides output formatting functions for tables, lists, progress bars, and text.
 * Supports various output formats and terminal-aware formatting.
 */

import { Colors } from './logger';

/**
 * Text alignment options
 */
export type TextAlignment = 'left' | 'center' | 'right';

/**
 * Table formatting options
 */
export interface TableOptions {
  /** Table headers */
  headers?: string[];
  
  /** Column alignments */
  alignments?: TextAlignment[];
  
  /** Column widths (auto-calculated if not provided) */
  widths?: number[];
  
  /** Show borders */
  borders?: boolean;
  
  /** Show header separator */
  headerSeparator?: boolean;
  
  /** Table title */
  title?: string;
  
  /** Maximum table width */
  maxWidth?: number;
  
  /** Truncate long content */
  truncate?: boolean;
  
  /** Use colors */
  colors?: boolean;
}

/**
 * List formatting options
 */
export interface ListOptions {
  /** List style (bullet, number, dash) */
  style?: 'bullet' | 'number' | 'dash' | 'custom';
  
  /** Custom bullet character */
  bullet?: string;
  
  /** Indentation level */
  indent?: number;
  
  /** Use colors */
  colors?: boolean;
  
  /** Maximum item width */
  maxWidth?: number;
  
  /** Show item numbers (for numbered lists) */
  showNumbers?: boolean;
}

/**
 * Progress bar options
 */
export interface ProgressOptions {
  /** Current progress (0-100) */
  current: number;
  
  /** Total progress (default: 100) */
  total?: number;
  
  /** Progress bar width */
  width?: number;
  
  /** Progress bar character */
  progressChar?: string;
  
  /** Empty character */
  emptyChar?: string;
  
  /** Show percentage */
  showPercentage?: boolean;
  
  /** Show current/total values */
  showValues?: boolean;
  
  /** Progress bar label */
  label?: string;
  
  /** Use colors */
  colors?: boolean;
}

/**
 * General formatting options
 */
export interface FormattingOptions {
  /** Use colors */
  colors?: boolean;
  
  /** Maximum width */
  maxWidth?: number;
  
  /** Indentation */
  indent?: number;
  
  /** Line prefix */
  prefix?: string;
  
  /** Line suffix */
  suffix?: string;
}

/**
 * Get terminal width
 */
export function getTerminalWidth(): number {
  return process.stdout.columns || 80;
}

/**
 * Strip ANSI escape codes from text
 */
export function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, '');
}

/**
 * Get the display width of text (excluding ANSI codes)
 */
function getDisplayWidth(text: string): number {
  return stripAnsi(text).length;
}

/**
 * Pad text to a specific width
 */
export function padText(
  text: string,
  width: number,
  alignment: TextAlignment = 'left',
  padChar: string = ' '
): string {
  const displayWidth = getDisplayWidth(text);
  const padding = Math.max(0, width - displayWidth);
  
  switch (alignment) {
    case 'center':
      const leftPad = Math.floor(padding / 2);
      const rightPad = padding - leftPad;
      return padChar.repeat(leftPad) + text + padChar.repeat(rightPad);
    
    case 'right':
      return padChar.repeat(padding) + text;
    
    case 'left':
    default:
      return text + padChar.repeat(padding);
  }
}

/**
 * Truncate text to a maximum width
 */
export function truncateText(
  text: string,
  maxWidth: number,
  ellipsis: string = '...'
): string {
  const displayWidth = getDisplayWidth(text);
  
  if (displayWidth <= maxWidth) {
    return text;
  }
  
  const stripped = stripAnsi(text);
  const truncated = stripped.slice(0, maxWidth - ellipsis.length) + ellipsis;
  
  return truncated;
}

/**
 * Wrap text to multiple lines
 */
export function wrapText(
  text: string,
  maxWidth: number,
  options: {
    indent?: number;
    preserveWhitespace?: boolean;
  } = {}
): string[] {
  const indent = ' '.repeat(options.indent || 0);
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testLineWithIndent = lines.length > 0 ? `${indent}${testLine}` : testLine;
    
    if (getDisplayWidth(testLineWithIndent) <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(lines.length > 0 ? `${indent}${currentLine}` : currentLine);
        currentLine = word;
      } else {
        // Word is too long, force break
        lines.push(lines.length > 0 ? `${indent}${word}` : word);
      }
    }
  }
  
  if (currentLine) {
    lines.push(lines.length > 0 ? `${indent}${currentLine}` : currentLine);
  }
  
  return lines;
}

/**
 * Align text within a container
 */
export function alignText(
  text: string,
  width: number,
  alignment: TextAlignment = 'left'
): string {
  const lines = text.split('\n');
  const alignedLines = lines.map(line => padText(line, width, alignment));
  
  return alignedLines.join('\n');
}

/**
 * Format a table from data
 */
export function formatTable(
  data: string[][],
  options: TableOptions = {}
): string {
  if (data.length === 0) {
    return '';
  }
  
  const {
    headers,
    alignments = [],
    borders = true,
    headerSeparator = true,
    title,
    maxWidth = getTerminalWidth(),
    truncate = true,
    colors = true,
  } = options;
  
  // Calculate column widths
  const numCols = Math.max(
    data[0]?.length || 0,
    headers?.length || 0
  );
  
  const widths = options.widths || new Array(numCols).fill(0);
  
  // Auto-calculate widths if not provided
  if (!options.widths) {
    // Check headers
    if (headers) {
      headers.forEach((header, i) => {
        widths[i] = Math.max(widths[i], getDisplayWidth(header));
      });
    }
    
    // Check data
    data.forEach(row => {
      row.forEach((cell, i) => {
        widths[i] = Math.max(widths[i], getDisplayWidth(cell.toString()));
      });
    });
    
    // Adjust for max width
    const totalWidth = widths.reduce((sum, w) => sum + w, 0);
    const borderWidth = borders ? (numCols + 1) * 3 : numCols - 1; // Account for borders/separators
    
    if (totalWidth + borderWidth > maxWidth) {
      const ratio = (maxWidth - borderWidth) / totalWidth;
      for (let i = 0; i < widths.length; i++) {
        widths[i] = Math.floor(widths[i] * ratio);
      }
    }
  }
  
  const lines: string[] = [];
  
  // Title
  if (title) {
    const titleLine = colors ? `${Colors.bright}${title}${Colors.reset}` : title;
    lines.push(titleLine);
    lines.push('');
  }
  
  // Helper function to format a row
  const formatRow = (row: string[], isHeader: boolean = false): string => {
    const cells = row.map((cell, i) => {
      const width = widths[i] || 10;
      const alignment = alignments[i] || 'left';
      let content = cell.toString();
      
      if (truncate && getDisplayWidth(content) > width) {
        content = truncateText(content, width);
      }
      
      let formattedCell = padText(content, width, alignment);
      
      if (colors && isHeader) {
        formattedCell = `${Colors.bright}${formattedCell}${Colors.reset}`;
      }
      
      return formattedCell;
    });
    
    if (borders) {
      return `| ${cells.join(' | ')} |`;
    } else {
      return cells.join('  ');
    }
  };
  
  // Top border
  if (borders) {
    const borderLine = '+' + widths.map(w => '-'.repeat(w + 2)).join('+') + '+';
    lines.push(borderLine);
  }
  
  // Headers
  if (headers) {
    lines.push(formatRow(headers, true));
    
    if (headerSeparator) {
      if (borders) {
        const separatorLine = '+' + widths.map(w => '-'.repeat(w + 2)).join('+') + '+';
        lines.push(separatorLine);
      } else {
        const separatorLine = widths.map(w => '-'.repeat(w)).join('  ');
        lines.push(separatorLine);
      }
    }
  }
  
  // Data rows
  data.forEach(row => {
    lines.push(formatRow(row));
  });
  
  // Bottom border
  if (borders) {
    const borderLine = '+' + widths.map(w => '-'.repeat(w + 2)).join('+') + '+';
    lines.push(borderLine);
  }
  
  return lines.join('\n');
}

/**
 * Format a list from items
 */
export function formatList(
  items: string[],
  options: ListOptions = {}
): string {
  if (items.length === 0) {
    return '';
  }
  
  const {
    style = 'bullet',
    bullet = '•',
    indent = 0,
    colors = true,
    maxWidth = getTerminalWidth(),
    showNumbers = true,
  } = options;
  
  const indentStr = ' '.repeat(indent);
  const lines: string[] = [];
  
  items.forEach((item, index) => {
    let prefix = '';
    
    switch (style) {
      case 'bullet':
        prefix = colors ? `${Colors.cyan}${bullet}${Colors.reset}` : bullet;
        break;
      
      case 'number':
        const number = showNumbers ? `${index + 1}.` : '-';
        prefix = colors ? `${Colors.yellow}${number}${Colors.reset}` : number;
        break;
      
      case 'dash':
        prefix = colors ? `${Colors.cyan}-${Colors.reset}` : '-';
        break;
      
      case 'custom':
        prefix = bullet;
        break;
    }
    
    const fullPrefix = `${indentStr}${prefix} `;
    const availableWidth = maxWidth - getDisplayWidth(fullPrefix);
    
    if (getDisplayWidth(item) <= availableWidth) {
      lines.push(`${fullPrefix}${item}`);
    } else {
      // Wrap long items
      const wrappedLines = wrapText(item, availableWidth, {
        indent: getDisplayWidth(fullPrefix),
      });
      
      lines.push(`${fullPrefix}${wrappedLines[0] || ''}`);
      wrappedLines.slice(1).forEach(line => {
        lines.push(line);
      });
    }
  });
  
  return lines.join('\n');
}

/**
 * Format a progress bar
 */
export function formatProgress(options: ProgressOptions): string {
  const {
    current,
    total = 100,
    width = 40,
    progressChar = '█',
    emptyChar = '░',
    showPercentage = true,
    showValues = false,
    label,
    colors = true,
  } = options;
  
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));
  const filledWidth = Math.round((percentage / 100) * width);
  const emptyWidth = width - filledWidth;
  
  let progressBar = progressChar.repeat(filledWidth) + emptyChar.repeat(emptyWidth);
  
  if (colors) {
    const filledPart = `${Colors.green}${progressChar.repeat(filledWidth)}${Colors.reset}`;
    const emptyPart = `${Colors.dim}${emptyChar.repeat(emptyWidth)}${Colors.reset}`;
    progressBar = filledPart + emptyPart;
  }
  
  const parts: string[] = [];
  
  if (label) {
    const labelText = colors ? `${Colors.bright}${label}${Colors.reset}` : label;
    parts.push(labelText);
  }
  
  parts.push(`[${progressBar}]`);
  
  if (showPercentage) {
    const percentText = `${percentage.toFixed(1)}%`;
    const coloredPercent = colors ? `${Colors.cyan}${percentText}${Colors.reset}` : percentText;
    parts.push(coloredPercent);
  }
  
  if (showValues) {
    const valuesText = `${current}/${total}`;
    const coloredValues = colors ? `${Colors.yellow}${valuesText}${Colors.reset}` : valuesText;
    parts.push(`(${coloredValues})`);
  }
  
  return parts.join(' ');
}

/**
 * Format JSON with syntax highlighting
 */
export function formatJson(
  data: any,
  options: {
    indent?: number;
    colors?: boolean;
    compact?: boolean;
  } = {}
): string {
  const { indent = 2, colors = true, compact = false } = options;
  
  let json = JSON.stringify(data, null, compact ? 0 : indent);
  
  if (colors && !compact) {
    // Basic JSON syntax highlighting
    json = json
      .replace(/"([^"]+)":/g, `${Colors.blue}"$1"${Colors.reset}:`) // Keys
      .replace(/: "([^"]*)"/g, `: ${Colors.green}"$1"${Colors.reset}`) // String values
      .replace(/: (\d+)/g, `: ${Colors.yellow}$1${Colors.reset}`) // Numbers
      .replace(/: (true|false)/g, `: ${Colors.magenta}$1${Colors.reset}`) // Booleans
      .replace(/: null/g, `: ${Colors.dim}null${Colors.reset}`); // Null
  }
  
  return json;
}

/**
 * Format YAML-like output
 */
export function formatYaml(
  data: any,
  options: {
    indent?: number;
    colors?: boolean;
  } = {}
): string {
  const { indent = 2, colors = true } = options;
  
  const formatValue = (value: any, level: number = 0): string => {
    const indentStr = ' '.repeat(level * indent);
    
    if (value === null || value === undefined) {
      return colors ? `${Colors.dim}null${Colors.reset}` : 'null';
    }
    
    if (typeof value === 'string') {
      return colors ? `${Colors.green}${value}${Colors.reset}` : value;
    }
    
    if (typeof value === 'number') {
      return colors ? `${Colors.yellow}${value}${Colors.reset}` : value.toString();
    }
    
    if (typeof value === 'boolean') {
      return colors ? `${Colors.magenta}${value}${Colors.reset}` : value.toString();
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return '[]';
      }
      
      return value.map(item => `\n${indentStr}- ${formatValue(item, level + 1).trim()}`).join('');
    }
    
    if (typeof value === 'object') {
      const entries = Object.entries(value);
      
      if (entries.length === 0) {
        return '{}';
      }
      
      return entries.map(([key, val]) => {
        const keyStr = colors ? `${Colors.blue}${key}${Colors.reset}` : key;
        const valStr = formatValue(val, level + 1);
        
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
          return `\n${indentStr}${keyStr}:${valStr}`;
        } else {
          return `\n${indentStr}${keyStr}: ${valStr.trim()}`;
        }
      }).join('');
    }
    
    return value.toString();
  };
  
  return formatValue(data).trim();
}

/**
 * Format markdown-like output
 */
export function formatMarkdown(
  content: string,
  options: {
    colors?: boolean;
    maxWidth?: number;
  } = {}
): string {
  const { colors = true, maxWidth = getTerminalWidth() } = options;
  
  if (!colors) {
    return content;
  }
  
  return content
    // Headers
    .replace(/^(#{1,6})\s+(.+)$/gm, (_, hashes, text) => {
      const level = hashes.length;
      const color = level <= 2 ? Colors.bright : Colors.cyan;
      return `${color}${hashes} ${text}${Colors.reset}`;
    })
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, `${Colors.bright}$1${Colors.reset}`)
    // Italic
    .replace(/\*([^*]+)\*/g, `${Colors.dim}$1${Colors.reset}`)
    // Code
    .replace(/`([^`]+)`/g, `${Colors.yellow}$1${Colors.reset}`)
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, `${Colors.blue}$1${Colors.reset} (${Colors.dim}$2${Colors.reset})`);
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }
  
  const seconds = Math.floor(milliseconds / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}

/**
 * Format bytes in human-readable format
 */
export function formatBytes(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  
  if (bytes === 0) {
    return '0 B';
  }
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  
  return `${size.toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

/**
 * Format date in human-readable format
 */
export function formatDate(
  date: Date | string | number,
  options: {
    format?: 'short' | 'long' | 'iso' | 'relative';
    includeTime?: boolean;
  } = {}
): string {
  const { format = 'short', includeTime = false } = options;
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  switch (format) {
    case 'iso':
      return dateObj.toISOString();
    
    case 'long':
      return includeTime
        ? dateObj.toLocaleString()
        : dateObj.toLocaleDateString();
    
    case 'relative':
      return formatRelativeTime(dateObj);
    
    case 'short':
    default:
      const year = dateObj.getFullYear();
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const day = dateObj.getDate().toString().padStart(2, '0');
      
      if (includeTime) {
        const hours = dateObj.getHours().toString().padStart(2, '0');
        const minutes = dateObj.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      }
      
      return `${year}-${month}-${day}`;
  }
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const dateObj = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  
  if (diffMs < 0) {
    return 'in the future';
  }
  
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
  
  if (months > 0) {
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
  
  if (weeks > 0) {
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  
  return seconds > 5 ? `${seconds} seconds ago` : 'just now';
}
