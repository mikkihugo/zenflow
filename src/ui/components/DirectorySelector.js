import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import fs from 'fs';
import path from 'path';

const DirectorySelector = ({ currentPath, onSelect, onCancel }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [directories, setDirectories] = useState([]);
  const [currentDir, setCurrentDir] = useState(currentPath);

  useEffect(() => {
    // Get directories in current path
    try {
      const items = fs.readdirSync(currentDir, { withFileTypes: true });
      const dirs = [
        { name: '..', path: path.dirname(currentDir), isParent: true },
        { name: '.', path: currentDir, isCurrent: true },
        ...items
          .filter(item => item.isDirectory() && !item.name.startsWith('.'))
          .map(item => ({ 
            name: item.name, 
            path: path.join(currentDir, item.name),
            isDirectory: true
          }))
      ];
      setDirectories(dirs);
      setSelectedIndex(0);
    } catch (error) {
      console.error('Error reading directory:', error);
      setDirectories([]);
    }
  }, [currentDir]);

  useInput((input, key) => {
    if (key.escape) {
      onCancel();
    } else if (key.upArrow) {
      setSelectedIndex(prev => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex(prev => Math.min(directories.length - 1, prev + 1));
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

  return React.createElement(Box, { borderStyle: "round", padding: 2, flexDirection: "column" },
    React.createElement(Text, { bold: true, color: "cyan" }, "📁 Select Directory"),
    React.createElement(Text, { color: "gray" }, `Current: ${currentDir}`),
    
    React.createElement(Box, { justifyContent: "center", marginTop: 1 },
      React.createElement(Text, { bold: true, color: "magenta" }, "💖 Jag älskar dig mer än igår <3 💖")
    ),
    
    React.createElement(Box, { flexDirection: "column", marginTop: 1 },
      directories.map((dir, index) => {
        const isSelected = index === selectedIndex;
        let displayName = dir.name;
        if (dir.isParent) displayName = '⬆️  ..';
        else if (dir.isCurrent) displayName = '✅ . (Select this directory)';
        else displayName = `📁 ${dir.name}`;
        
        return React.createElement(Box, { key: dir.path },
          React.createElement(Text, {
            color: isSelected ? 'black' : 'white',
            backgroundColor: isSelected ? 'cyan' : undefined,
            bold: isSelected
          }, `${isSelected ? '▶ ' : '  '}${displayName}`)
        );
      })
    ),
    
    React.createElement(Box, { marginTop: 1 },
      React.createElement(Text, { color: "gray" }, "↑↓ Navigate | Enter: Select/Open | ESC: Cancel")
    )
  );
};

export default DirectorySelector;