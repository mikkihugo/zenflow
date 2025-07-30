/**
 * Render Adapter - Unified rendering for TUI and Web
 * Auto-detects environment and renders components appropriately
 */
import React from 'react';

// Environment detection
export const isWeb = (): any => typeof window !== 'undefined';
export const isTUI = (): any => !isWeb() && process.stdout?.isTTY;

// Conditional imports based on environment
let inkComponents = {};
let webComponents = {};

if (isTUI()) {
  // Dynamic import for TUI environment
  try {
    const ink = await import('ink');
    inkComponents = ink;
  } catch (_error) {
    console.warn('Ink not available, falling back to console output');
  }
} else if (isWeb()) {
  // Dynamic import for web environment
  try {
    const reactDOM = await import('react-dom');
    webComponents = { reactDOM };
  } catch (_error) {
    console.warn('React DOM not available');
  }
}

/**
 * Universal Box component - works in both TUI and Web
 */
export const UniversalBox = ({ children, style = {}, ...props }: any) => {
  if (isTUI() && inkComponents.Box) {
    // Ink Box for terminal
    return React.createElement(inkComponents.Box, props, children);
  } else {
    // HTML div for web
    const _webStyle = {display = === 'column' ? 'flex' : 'block',flexDirection = ({ children, color => {
  if (_isTUI() && inkComponents.Text) {
    // Ink Text for terminal
    return React.createElement(inkComponents.Text, { color, bold, ...props }, children);
  } else {
    // HTML span for web
    const _webStyle = {color = ({ items, children }: any) => {
  if (isTUI() && inkComponents.Static) {
    // Ink Static for terminal
    return React.createElement(inkComponents.Static, { items }, children);
  } else {
    // HTML list for web
    return React.createElement('div', null, 
      items.map((_item, _index) => 
        React.createElement('div', {key = (component) => {
  if (isTUI() && inkComponents.render) {
    // Ink render for terminal
    return inkComponents.render(component);
  } else if (isWeb() && webComponents.reactDOM) {
    // React DOM render for web
    const container = document.getElementById('root') || document.body;
    return webComponents.reactDOM.render(component, container);
  } else {
    // Fallback - just log the component structure
    console.warn('Renderingcomponent = (tuiColor) => {
  const colorMap = {
    'cyan': '#00ffff',
    'green': '#00ff00',
    'red': '#ff0000',
    'yellow': '#ffff00',
    'blue': '#0000ff',
    'magenta': '#ff00ff',
    'white': '#ffffff',
    'gray': '#808080',
    'grey': '#808080'
  };
  
  return colorMap[tuiColor] || tuiColor || '#ffffff';
};

/**
 * Universal input handling
 */
export const _useUniversalInput = (handler) => {
  if (isTUI() && inkComponents.useInput) {
    // Use Ink's useInput for terminal
    return inkComponents.useInput(handler);
  } else if (isWeb()) {
    // Use keyboard events for web
    React.useEffect(() => {
      const handleKeyDown = (event) => {
        const input = event.key;
        const key = {leftArrow = === 'ArrowLeft',rightArrow = === 'ArrowRight',upArrow = === 'ArrowUp',downArrow = === 'ArrowDown',ctrl = === 'Enter'
        };
        
        handler(input.toLowerCase(), key);
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handler]);
  }
};
