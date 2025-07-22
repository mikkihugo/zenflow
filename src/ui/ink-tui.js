import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput } from 'ink';
import HiveList from './components/HiveList.js';
import HiveDetails from './components/HiveDetails.js';
import { readHiveRegistry } from '../cli/command-handlers/hive-mind-command.js';

const Tui = ({ cli }) => {
  const [hives, setHives] = useState({});
  const [selectedHive, setSelectedHive] = useState(null);

  useEffect(() => {
    async function fetchHives() {
      const registry = await readHiveRegistry();
      setHives(registry);
    }
    fetchHives();
  }, []);

  useInput((input, key) => {
    if (key.escape && selectedHive) {
      setSelectedHive(null);
    }
  });

  const handleSelectHive = (hiveName) => {
    setSelectedHive(hives[hiveName]);
  };

  return (
    <Box borderStyle="round" padding={2} flexDirection="column">
      <Text bold>claude-zen TUI</Text>
      {selectedHive ? (
        <HiveDetails hive={selectedHive} />
      ) : (
        <HiveList hives={hives} onSelect={handleSelectHive} />
      )}
    </Box>
  );
};

export function renderTui(cli) {
  render(<Tui cli={cli} />);
}
