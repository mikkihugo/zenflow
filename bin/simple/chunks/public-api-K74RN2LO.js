
    import { createRequire } from 'module';
    import { fileURLToPath } from 'url';
    import { dirname } from 'path';
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const require = createRequire(import.meta.url);
    
import {
  __name
} from "./chunk-O4JO3PGD.js";

// src/coordination/public-api.ts
async function createPublicSwarmCoordinator(config) {
  const { SwarmCoordinator } = await import("./swarm-coordinator-GAVTF56A.js");
  const coordinator = new SwarmCoordinator();
  await coordinator.initialize(config);
  return {
    async initialize(config2) {
      return coordinator.initialize(config2);
    },
    async shutdown() {
      return coordinator.shutdown();
    },
    getState() {
      return coordinator.getState();
    },
    getSwarmId() {
      return coordinator.getSwarmId();
    },
    getAgentCount() {
      return coordinator.getAgentCount();
    },
    getActiveAgents() {
      return coordinator.getActiveAgents();
    },
    getStatus() {
      return {
        id: coordinator.getSwarmId(),
        state: coordinator.getState(),
        agentCount: coordinator.getAgentCount(),
        taskCount: coordinator.getTaskCount(),
        uptime: coordinator.getUptime()
      };
    }
  };
}
__name(createPublicSwarmCoordinator, "createPublicSwarmCoordinator");
export {
  createPublicSwarmCoordinator
};
//# sourceMappingURL=public-api-K74RN2LO.js.map
