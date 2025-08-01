/**
 * Ink UI Components - Main Export Module
 * 
 * This module exports all UI components, screens, and hooks for the Claude Flow CLI.
 * Built with Ink (React for CLI) for rich terminal user interfaces.
 */

// Component exports
export * from './components';

// Screen exports
export * from './screens';

// Hook exports
export * from './hooks';

// Type definitions for UI components
export interface UITheme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    text: string;
    dimText: string;
    background: string;
  };
  symbols: {
    check: string;
    cross: string;
    warning: string;
    info: string;
    arrow: string;
    bullet: string;
    spinner: string[];
  };
}

// Default theme configuration
export const defaultTheme: UITheme = {
  colors: {
    primary: '#00D7FF',
    secondary: '#6C7B7F',
    success: '#00D100',
    warning: '#FFAB00',
    error: '#FF5722',
    info: '#2196F3',
    text: '#FFFFFF',
    dimText: '#6C7B7F',
    background: '#1A1A1A',
  },
  symbols: {
    check: '✓',
    cross: '✗',
    warning: '⚠',
    info: 'ℹ',
    arrow: '→',
    bullet: '•',
    spinner: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  },
};

// Common UI utilities
export const UIUtils = {
  formatDuration: (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
    return `${(ms / 3600000).toFixed(1)}h`;
  },
  
  formatBytes: (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
      bytes /= 1024;
      i++;
    }
    return `${bytes.toFixed(1)}${units[i]}`;
  },
  
  truncateText: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  },
  
  centerText: (text: string, width: number): string => {
    const padding = Math.max(0, width - text.length);
    const leftPad = Math.floor(padding / 2);
    const rightPad = padding - leftPad;
    return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
  },
};
