/**
 * DirectorySelector Module
 * Converted from JavaScript to TypeScript
 */

import { Box, Text } from 'ink';
import React, { useEffect, useState } from 'react';

const DirectorySelector = ({ currentPath, onSelect, onCancel }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [directories, _setDirectories] = useState([]);
  const [_currentDir, setCurrentDir] = useState(currentPath);

  useEffect(() => {
    // Get directories in current path
    try {

    }
    else
    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(directories.length - 1, prev + 1));
    } else if (key.return) {
      const selected = directories[selectedIndex];
      if (selected) {
        if (selected.isCurrent) {
          // Select current directory
          onSelect(selected.path);
        } else {
          // Navigate into directory
          setCurrentDir(selected.path);
        }
      }
    }
  });

  return React.createElement(Box, { borderStyle => {
        const isSelected = index === selectedIndex;
  let displayName = dir.name;
  if (dir.isParent) displayName = '⬆️  ..';
  else if (dir.isCurrent) displayName = '✅ . (Select this directory)';
  else displayName = `📁 ${dir.name}`;

  return React.createElement(
    Box,
    { key: dir.path },
    React.createElement(
      Text,
      {
        color: isSelected ? 'black' : 'white',
        backgroundColor: isSelected ? 'cyan' : undefined,
        bold: isSelected,
      },
      `${isSelected ? '▶ ' : '  '}${displayName}`
    )
  );
};
)
    ),
    
    React.createElement(Box,
{
  marginTop: 1;
}
,
      React.createElement(Text,
{
  color: 'gray';
}
, "↑↓ Navigate | Enter: Select/Open | ESC: Cancel")
    )
  )
}

export default DirectorySelector;
