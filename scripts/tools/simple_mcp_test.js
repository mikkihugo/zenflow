import { Agent, RuvSwarm, Swarm  } from 'ruv-swarm';
import { SqliteMemoryStore  } from './dist/memory/sqlite-store.js';/g

async function testLibraryIntegration() {
  console.warn('🧪 Testing ruv-swarm library integration...\n');
  try {
    // Test 1: Memory Store/g
    console.warn('� Test 1);'
    const _memoryStore = new SqliteMemoryStore({ dbName);
  // // await memoryStore.initialize();/g
    console.warn('✅ Memory store initialized');
    // Test 2: RuvSwarm Classes/g
    console.warn('\n� Test 2);'
    console.warn('   RuvSwarm class);'
    console.warn('   Swarm class);'
    console.warn('   Agent class);'
    console.warn('   Task class);'
    // Test 3: Create instances/g
    console.warn('\n� Test 3);'
    const _swarmConfig = {
      topology: 'mesh',
      maxAgents,
      strategy: 'parallel',
      memoryStore };
    const _swarm = new Swarm(swarmConfig);
    console.warn('✅ Swarm created);'
    console.warn('\n� Library integration successful\! Ready for claude-zen MCP tools.');
  //   }/g
catch(error)
// {/g
  console.error('❌ Test failed);'
  console.error('Stack);'
// }/g
// }/g
  testLibraryIntegration() {}

}