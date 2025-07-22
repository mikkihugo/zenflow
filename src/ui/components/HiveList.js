import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

const HiveList = ({ hives, onSelect }) => {
  const hiveNames = Object.keys(hives);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : hiveNames.length - 1));
    } else if (key.downArrow) {
      setSelectedIndex(prev => (prev < hiveNames.length - 1 ? prev + 1 : 0));
    } else if (key.return) {
      onSelect(hiveNames[selectedIndex]);
    }
  });

  return (
    <Box borderStyle="round" padding={2} flexDirection="column">
      <Text bold>Hives (Select with ↑↓, Enter to view details)</Text>
      {hiveNames.map((name, index) => (
        <Box key={name} flexDirection="row">
          <Text color={index === selectedIndex ? "cyan" : "green"}>
            {index === selectedIndex ? "> " : "  "}{name}:
          </Text>
          <Text> {hives[name].path}</Text>
        </Box>
      ))}
    </Box>
  );
};

export default HiveList;
