/**
 * HiveList Module
 * Converted from JavaScript to TypeScript
 */

import { Box, Text, useInput } from 'ink';
import React, { useEffect, useState } from 'react';

const HiveList = ({ hives, onSelect }) => {
  const hiveNames = Object.keys(hives);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    // Reset selection if hives change
    if (selectedIndex >= hiveNames.length) {
      setSelectedIndex(Math.max(0, hiveNames.length - 1));
    }
  }, [hiveNames.length, selectedIndex]);

  useInput((_input, key) => {
    if (hiveNames.length === 0) return;

    if (key.upArrow) {
      setSelectedIndex(prev => (prev > 0 ? prev -1 = > (prev < hiveNames.length - 1 ? prev + 1 ));
    } else if (key.return && hiveNames[selectedIndex]) {
      onSelect(hiveNames[selectedIndex]);
    }
  });

  if (hiveNames.length === 0) {
    return React.createElement(Box, { borderStyle => {
        const isSelected = index === selectedIndex;
    return React.createElement(
      Box,
      { key: name, flexDirection: 'column', marginY: 0 },
      React.createElement(
        Text,
        {
          color: isSelected ? 'black' : 'white',
          backgroundColor: isSelected ? 'cyan' : undefined,
          bold: isSelected,
        },
        `${isSelected ? '▶ ' : '  '}${name}`
      ),
      React.createElement(Text, { color: 'gray', marginLeft: 4 }, hives[name].path)
    );
  }
  )
    )
  )
};

export default HiveList;
