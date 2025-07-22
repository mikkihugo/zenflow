import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import Database from 'better-sqlite3';

const HiveDetails = ({ hive }) => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const db = new Database(hive.path);
        const result = db.prepare(`
          SELECT
            (SELECT COUNT(*) FROM visions) as totalVisions,
            (SELECT COUNT(*) FROM epics) as totalEpics,
            (SELECT COUNT(*) FROM features) as totalFeatures,
            (SELECT COUNT(*) FROM prds) as totalPrds,
            (SELECT COUNT(*) FROM user_stories) as totalUserStories,
            (SELECT COUNT(*) FROM tasks) as totalTasks
        `).get();
        setStats(result);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchStats();
  }, [hive.path]);

  return (
    <Box borderStyle="round" padding={2} flexDirection="column">
      <Text bold>Hive Details: {hive.name}</Text>
      <Text>Path: {hive.path}</Text>
      {error && <Text color="red">Error: {error}</Text>}
      {stats ? (
        <Box flexDirection="column" marginTop={1}>
          <Text>Visions: {stats.totalVisions}</Text>
          <Text>Epics: {stats.totalEpics}</Text>
          <Text>Features: {stats.totalFeatures}</Text>
          <Text>PRDs: {stats.totalPrds}</Text>
          <Text>User Stories: {stats.totalUserStories}</Text>
          <Text>Tasks: {stats.totalTasks}</Text>
        </Box>
      ) : (
        <Text>Loading stats...</Text>
      )}
    </Box>
  );
};

export default HiveDetails;