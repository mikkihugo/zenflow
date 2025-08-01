/**
 * UI Components - Component Exports
 *
 * This module exports all reusable UI components for the Claude Flow CLI.
 * Components are built with Ink for rich terminal interfaces.
 */

export type { ErrorMessageProps } from './error-message';
export { ErrorMessage } from './error-message';
export type { FooterProps } from './footer';
export { Footer } from './footer';
// Component prop types
export type { HeaderProps } from './header';
// Basic UI components
export { Header } from './header';
export type { ProgressBarProps } from './progress-bar';
export { ProgressBar } from './progress-bar';
export type { SpinnerProps } from './spinner';
export { Spinner } from './spinner';
export type { StatusBadgeProps } from './status-badge';
export { StatusBadge } from './status-badge';

// Common component types
export interface BaseComponentProps {
  className?: string;
  testId?: string;
}

export type StatusType = 'success' | 'error' | 'warning' | 'info' | 'pending';
export type SizeType = 'small' | 'medium' | 'large';
export type VariantType = 'primary' | 'secondary' | 'ghost';
