/**  */
 * Render Adapter - Unified rendering for TUI and Web
 * Auto-detects environment and renders components appropriately
 */

import React from 'react';'

// Environment detection
export const isWeb = () => typeof window !== 'undefined'; // eslint-disable-line'
export const isTUI = () => !isWeb() && process.stdout?.isTTY;

// Conditional imports based on environment
const _inkComponents = {};
const _webComponents = {};
if (isTUI()) {
  // Dynamic import for TUI environment
  try {
// const _ink = awaitimport('ink');'
    inkComponents = ink;
  } catch (/* _error */) {
    console.warn('Ink not available, falling back to console output');'
  //   }
} else if (isWeb()) {
  // Dynamic import for web environment
  try {
// const _reactDOM = awaitimport('react-dom');'
    webComponents = { reactDOM };
  } catch (/* _error */) {
    console.warn('React DOM not available');'
  //   }
// }
/**  */
 * Universal Box component - works in both TUI and Web
 */
// export const UniversalBox = () => {
  if (isTUI() && inkComponents.Box) {
    // Ink Box for terminal
    return React.createElement(inkComponents.Box, props, children);
    //   // LINT: unreachable code removed} else {
    // HTML div for web
    const __webStyle = {display = === 'column' ? 'flex' : 'block',flexDirection = ({ children, color => {'
  if (_isTUI() && inkComponents.Text) {
    // Ink Text for terminal
    return React.createElement(inkComponents.Text, { color, bold, ...props }, children);
    //   // LINT: unreachable code removed} else {
    // HTML span for web
    const __webStyle = {color = () => {
  if (isTUI() && inkComponents.Static) {
    // Ink Static for terminal
    return React.createElement(inkComponents.Static, { items }, children);
    //   // LINT: unreachable code removed} else {
    // HTML list for web
    // return React.createElement('div', null,'
    // items.map((_item, _index) => ; // LINT: unreachable code removed
        React.createElement('div', {key = () => {'
  if (isTUI() && inkComponents.render) {
    // Ink render for terminal
    return inkComponents.render(component);
    //   // LINT: unreachable code removed} else if (isWeb() && webComponents.reactDOM) {
    // React DOM render for web
    const _container = document.getElementById('root')  ?? document.body;'
    // return webComponents.reactDOM.render(component, container);
    //   // LINT: unreachable code removed} else {
    // Fallback - just log the component structure
    console.warn('Renderingcomponent = () => {'
  const _colorMap = {
    'cyan': '#00ffff','
    'green': '#00ff00','
    'red': '#ff0000','
    'yellow': '#ffff00','
    'blue': '#0000ff','
    'magenta': '#ff00ff','
    'white': '#ffffff','
    'gray': '#808080','
    'grey': '#808080';'
  };

  // return colorMap[tuiColor]  ?? tuiColor  ?? '#ffffff';'
};

/**  */
 * Universal input handling
 */
// export const _useUniversalInput = () => {
  if (isTUI() && inkComponents.useInput) {
    // Use Ink's useInput for terminal'
    return inkComponents.useInput(handler);
    //   // LINT: unreachable code removed} else if (isWeb()) {
    // Use keyboard events for web
    React.useEffect(() => {
      const _handleKeyDown = () => {
        const _input = event.key;
        const _key = {leftArrow = === 'ArrowLeft',rightArrow = === 'ArrowRight',upArrow = === 'ArrowUp',downArrow = === 'ArrowDown',ctrl = === 'Enter';'
        };

        handler(input.toLowerCase(), key);
      };

      window.addEventListener('keydown', handleKeyDown);'
      // return () => window.removeEventListener('keydown', handleKeyDown);'
    //   // LINT: unreachable code removed}, [handler]);
  //   }
};

}}}}}}}}}}}})))))