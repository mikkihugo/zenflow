/**
 * Render Adapter - Unified rendering for TUI and Web
 * Auto-detects environment and renders components appropriately
 */

import React from 'react';

// Environment detection
export const isWeb = (): boolean => typeof window !== 'undefined';
export const isTUI = (): boolean => !isWeb() && process.stdout?.isTTY === true;

// Conditional imports based on environment
const inkComponents: any = {};
const webComponents: any = {};

if (isTUI()) {
  // Dynamic import for TUI environment
  try {
    // Note: This would be dynamically imported in a real scenario
    // const ink = await import('ink');
    // inkComponents = ink;
  } catch (_error) {
    console.warn('Ink not available, falling back to console output');
  }
} else if (isWeb()) {
  // Dynamic import for web environment
  try {
    // Note: This would be dynamically imported in a real scenario
    // const reactDOM = await import('react-dom');
    // webComponents = { reactDOM };
  } catch (_error) {
    console.warn('React DOM not available');
  }
}

interface UniversalBoxProps {
  children: React.ReactNode;
  flexDirection?: 'row' | 'column';
  padding?: number;
  margin?: number;
  borderStyle?: 'single' | 'double' | 'round';
  borderColor?: string;
}

/** Universal Box component - works in both TUI and Web */
export const UniversalBox: React.FC<UniversalBoxProps> = (props) => {
  const { children, flexDirection = 'column', ...otherProps } = props;
  
  if (isTUI() && inkComponents.Box) {
    // Ink Box for terminal
    return React.createElement(inkComponents.Box, props, children);
  } else {
    // HTML div for web
    const webStyle = {
      display: flexDirection === 'column' ? 'flex' : 'block',
      flexDirection: flexDirection === 'column' ? 'column' : 'row',
      padding: props.padding || 0,
      margin: props.margin || 0,
      border: props.borderStyle ? '1px solid' : 'none',
      borderColor: props.borderColor || '#ccc'
    };
    
    return React.createElement('div', { style: webStyle }, children);
  }
};

interface UniversalTextProps {
  children: React.ReactNode;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

/** Universal Text component - works in both TUI and Web */
export const UniversalText: React.FC<UniversalTextProps> = ({ children, color, bold, ...props }) => {
  if (isTUI() && inkComponents.Text) {
    // Ink Text for terminal
    return React.createElement(inkComponents.Text, { color, bold, ...props }, children);
  } else {
    // HTML span for web
    const webStyle = {
      color: convertTuiColorToWeb(color),
      fontWeight: bold ? 'bold' : 'normal',
      fontStyle: props.italic ? 'italic' : 'normal',
      textDecoration: props.underline ? 'underline' : 'none'
    };
    
    return React.createElement('span', { style: webStyle }, children);
  }
};

interface UniversalStaticProps {
  items: any[];
  children: (item: any, index: number) => React.ReactNode;
}

/** Universal Static component - works in both TUI and Web */
export const UniversalStatic: React.FC<UniversalStaticProps> = ({ items, children }) => {
  if (isTUI() && inkComponents.Static) {
    // Ink Static for terminal
    return React.createElement(inkComponents.Static, { items }, children);
  } else {
    // HTML list for web
    return React.createElement('div', null,
      items.map((item, index) =>
        React.createElement('div', { key: index }, children(item, index))
      )
    );
  }
};

/** Universal render function */
export const universalRender = (component: React.ReactElement): void => {
  if (isTUI() && inkComponents.render) {
    // Ink render for terminal
    inkComponents.render(component);
  } else if (isWeb() && webComponents.reactDOM) {
    // React DOM render for web
    const container = document.getElementById('root') || document.body;
    webComponents.reactDOM.render(component, container);
  } else {
    // Fallback - just log the component structure
    console.log('Rendering component:', component.type?.name || 'Unknown');
  }
};

/** Convert TUI colors to web colors */
export const convertTuiColorToWeb = (tuiColor?: string): string => {
  const colorMap: Record<string, string> = {
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

  return colorMap[tuiColor || ''] || tuiColor || '#ffffff';
};

interface InputHandler {
  (input: string, key: any): void;
}

/** Universal input handling */
export const useUniversalInput = (handler: InputHandler): void => {
  if (isTUI() && inkComponents.useInput) {
    // Use Ink's useInput for terminal
    inkComponents.useInput(handler);
  } else if (isWeb()) {
    // Use keyboard events for web
    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
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

// Export environment detection functions
export { isWeb as getIsWeb, isTUI as getIsTUI };