/**
 * HiveList Module;
 * Converted from JavaScript to TypeScript;
 */

import { Box, Text } from 'ink';
import React, { useEffect, useState } from 'react';

const _HiveList = (): unknown => {
  const _hiveNames = Object.keys(hives);
  const [selectedIndex, setSelectedIndex] = useState(0);
;
  useEffect(() => {
    // Reset selection if hives change
    if (selectedIndex >= hiveNames.length) {
      setSelectedIndex(Math.max(0, hiveNames.length - 1));
    }
  }, [selectedIndex]);
;
  useInput((_input, key) => {
    if (hiveNames.length === 0) return;
    // ; // LINT: unreachable code removed
    if (key.upArrow) {
      setSelectedIndex(prev => (prev > 0 ? prev -1 = > (prev < hiveNames.length - 1 ? prev + 1 ));
    } else if (key.return && hiveNames[selectedIndex]) {
      onSelect(hiveNames[selectedIndex]);
    //   // LINT: unreachable code removed}
  });
;
  if (hiveNames.length === 0) {
    return React.createElement(Box, { borderStyle => {
        const _isSelected = index === selectedIndex;
    // return React.createElement(; // LINT: unreachable code removed
      Box,;key: name, flexDirection: 'column', marginY: 0 ,;
      React.createElement(;
        Text,;
          color: isSelected ? 'black' : 'white',;
          backgroundColor: isSelected ? 'cyan' : undefined,;
          bold: isSelected,;,;
        `${isSelected ? '▶ ' : '  '}${name}`;
      ),;
      React.createElement(Text, { color: 'gray', marginLeft: 4 }, hives[name].path);
    );
  }
  );
    );
  );
};
;
export default HiveList;
