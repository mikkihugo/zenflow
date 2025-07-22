/**
 * Render Adapter - Unified rendering for TUI and Web
 * Auto-detects environment and renders components appropriately
 */
import React from 'react';

// Environment detection
export const isWeb = () => typeof window !== 'undefined';
export const isTUI = () => !isWeb() && process.stdout?.isTTY;

// Conditional imports based on environment
let inkComponents = {};
let webComponents = {};

if (isTUI()) {
  // Dynamic import for TUI environment
  try {
    const ink = await import('ink');
    inkComponents = ink;
  } catch (error) {
    console.warn('Ink not available, falling back to console output');
  }
} else if (isWeb()) {
  // Dynamic import for web environment  
  try {
    const reactDOM = await import('react-dom');
    webComponents = { reactDOM };
  } catch (error) {
    console.warn('React DOM not available');
  }
}

/**
 * Universal Box component - works in both TUI and Web
 */
export const UniversalBox = ({ children, style = {}, ...props }) => {
  if (isTUI() && inkComponents.Box) {
    // Ink Box for terminal
    return React.createElement(inkComponents.Box, props, children);
  } else {
    // HTML div for web
    const webStyle = {
      display: props.flexDirection === 'column' ? 'flex' : 'block',
      flexDirection: props.flexDirection || 'row',
      padding: props.paddingX ? `0 ${props.paddingX}rem` : '0',
      margin: props.marginTop ? `${props.marginTop}rem 0 0 0` : '0',
      border: props.borderStyle ? `1px ${props.borderStyle} ${props.borderColor || '#ccc'}` : 'none',
      ...style
    };
    
    return React.createElement('div', { style: webStyle }, children);
  }
};

/**
 * Universal Text component - works in both TUI and Web
 */
export const UniversalText = ({ children, color, bold, ...props }) => {
  if (isTUI() && inkComponents.Text) {
    // Ink Text for terminal
    return React.createElement(inkComponents.Text, { color, bold, ...props }, children);
  } else {
    // HTML span for web
    const webStyle = {
      color: getWebColor(color),
      fontWeight: bold ? 'bold' : 'normal',
      fontSize: '14px',
      fontFamily: 'monospace'
    };
    
    return React.createElement('span', { style: webStyle }, children);
  }
};

/**
 * Universal Static component - works in both TUI and Web
 */
export const UniversalStatic = ({ items, children }) => {
  if (isTUI() && inkComponents.Static) {
    // Ink Static for terminal
    return React.createElement(inkComponents.Static, { items }, children);
  } else {
    // HTML list for web
    return React.createElement('div', null, 
      items.map((item, index) => 
        React.createElement('div', { key: index, style: { marginBottom: '8px' } },
          children(item, index)
        )
      )
    );
  }
};

/**
 * Universal render function - detects environment and renders
 */
export const universalRender = (component) => {
  if (isTUI() && inkComponents.render) {
    // Ink render for terminal
    return inkComponents.render(component);
  } else if (isWeb() && webComponents.reactDOM) {
    // React DOM render for web
    const container = document.getElementById('root') || document.body;
    return webComponents.reactDOM.render(component, container);
  } else {
    // Fallback - just log the component structure
    console.log('Rendering component:', component);
    return component;
  }
};

/**
 * Convert TUI colors to web CSS colors
 */
const getWebColor = (tuiColor) => {
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
export const useUniversalInput = (handler) => {
  if (isTUI() && inkComponents.useInput) {
    // Use Ink's useInput for terminal
    return inkComponents.useInput(handler);
  } else if (isWeb()) {
    // Use keyboard events for web
    React.useEffect(() => {
      const handleKeyDown = (event) => {
        const input = event.key;
        const key = {
          leftArrow: event.key === 'ArrowLeft',
          rightArrow: event.key === 'ArrowRight',
          upArrow: event.key === 'ArrowUp',
          downArrow: event.key === 'ArrowDown',
          ctrl: event.ctrlKey,
          return: event.key === 'Enter'
        };
        
        handler(input.toLowerCase(), key);
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handler]);
  }
};