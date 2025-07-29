export default {
  cli: {
    maxAgents: 4,
    swarmMode: 'simple',
    memoryPath: './.hive-mind/memory',
  },
  hiveMind: {
    memoryPath: './.hive-mind/memory',
    swarmMode: 'simple',
    maxAgents: 4,
    lanceConfig: {
      persistDirectory: './.hive-mind/memory/vectors',
      collection: 'hive_mind_memory',
    },
    kuzuConfig: {
      persistDirectory: './.hive-mind/memory/graphs',
      enableRelationships: true,
    },
    sqliteConfig: {
      dbPath: './.hive-mind/memory/structured.db',
      enableWAL: true,
    },
  },
};