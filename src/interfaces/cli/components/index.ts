/**
 * UI Components - Component Exports
 * 
 * This module exports all reusable UI components for the Claude Flow CLI.
 * Components are built with Ink for rich terminal interfaces.
 */

// Basic UI components
export { Header } from './header';
export { Footer } from './footer';
export { Spinner } from './spinner';
export { ProgressBar } from './progress-bar';
export { StatusBadge } from './status-badge';
export { ErrorMessage } from './error-message';

// Component prop types
export type { HeaderProps } from './header';
export type { FooterProps } from './footer';
export type { SpinnerProps } from './spinner';
export type { ProgressBarProps } from './progress-bar';
export type { StatusBadgeProps } from './status-badge';
export type { ErrorMessageProps } from './error-message';

// Common component types
export interface BaseComponentProps {
  className?: string;
  testId?: string;
}

export type StatusType = 'success' | 'error' | 'warning' | 'info' | 'pending';
export type SizeType = 'small' | 'medium' | 'large';
export type VariantType = 'primary' | 'secondary' | 'ghost';
