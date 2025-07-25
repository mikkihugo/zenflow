import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';

const HiveList = ({ hives, onSelect }) => {
  const hiveNames = Object.keys(hives);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    // Reset selection if hives change
    if (selectedIndex >= hiveNames.length) {
      setSelectedIndex(Math.max(0, hiveNames.length - 1));
    }
  }, [hiveNames.length, selectedIndex]);

  useInput((input, key) => {
    if (hiveNames.length === 0) return;
    
    if (key.upArrow) {
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : hiveNames.length - 1));
    } else if (key.downArrow) {
      setSelectedIndex(prev => (prev < hiveNames.length - 1 ? prev + 1 : 0));
    } else if (key.return && hiveNames[selectedIndex]) {
      onSelect(hiveNames[selectedIndex]);
    }
  });

  if (hiveNames.length === 0) {
    return React.createElement(Box, { borderStyle: "round", padding: 2, flexDirection: "column" },
      React.createElement(Text, { bold: true, color: "yellow" }, "🐝 Services (0)"),
      React.createElement(Text, { color: "gray" }, "No services found. Create one with:"),
      React.createElement(Text, { color: "cyan" }, "create my-service"),
      React.createElement(Box, { justifyContent: "center", marginTop: 1 },
        React.createElement(Text, { bold: true, color: "magenta" }, "Service Management")
      )
    );
  }

  return React.createElement(Box, { borderStyle: "round", padding: 2, flexDirection: "column" },
    React.createElement(Text, { bold: true, color: "yellow" }, `🐝 Services (${hiveNames.length})`),
    React.createElement(Text, { color: "gray" }, "Use ↑↓ arrows to navigate, Enter to select"),
    React.createElement(Box, { justifyContent: "center", marginTop: 1 },
      React.createElement(Text, { bold: true, color: "magenta" }, "Service Management")
    ),
    
    React.createElement(Box, { flexDirection: "column", marginTop: 1 },
      hiveNames.map((name, index) => {
        const isSelected = index === selectedIndex;
        return React.createElement(Box, { key: name, flexDirection: "column", marginY: 0 },
          React.createElement(Text, {
            color: isSelected ? 'black' : 'white',
            backgroundColor: isSelected ? 'cyan' : undefined,
            bold: isSelected
          }, `${isSelected ? '▶ ' : '  '}${name}`),
          React.createElement(Text, { color: "gray", marginLeft: 4 }, hives[name].path)
        );
      })
    )
  );
};

export default HiveList;
