
// src/cli/command-handlers/vision-to-code-workflow-handler.js

import { MetaRegistryManager } from '../../coordination/meta-registry/meta-manager.js';
import MemoryBackend from '../../coordination/meta-registry/backends/memory-backend.js';

let metaRegistryManager;
let defaultRegistry;
let hierarchicalTaskManagerPlugin;

async function initializeMetaRegistry() {
  if (!metaRegistryManager) {
    const { MetaRegistryManager, MemoryBackend } = await import('../../coordination/meta-registry/meta-manager.js');
    const HierarchicalTaskManagerPlugin = (await import('../../coordination/meta-registry/plugins/hierarchical-task-manager.js')).default;
    const ArchitectAdvisorPlugin = (await import('../../coordination/meta-registry/plugins/architect-advisor.js')).default;
    const MemoryRAGPlugin = (await import('../../coordination/meta-registry/plugins/memory-rag.js')).default;
    const PortDiscoveryPlugin = (await import('../../coordination/meta-registry/plugins/port-discovery.js')).default;
    const PubSubPlugin = (await import('../../coordination/meta-registry/plugins/pubsub.js')).default;
    const NATTraversalPlugin = (await import('../../coordination/meta-registry/plugins/nat-traversal.js')).default;

    metaRegistryManager = new MetaRegistryManager();
    await metaRegistryManager.initialize();
    defaultRegistry = await metaRegistryManager.createRegistry('default', new MemoryBackend());

    // Register plugins
    await defaultRegistry.use('hierarchical-task-manager', new HierarchicalTaskManagerPlugin());
    await defaultRegistry.use('architect-advisor', new ArchitectAdvisorPlugin());
    await defaultRegistry.use('memory-rag', new MemoryRAGPlugin());
    await defaultRegistry.use('port-discovery', new PortDiscoveryPlugin());
    await defaultRegistry.use('pubsub', new PubSubPlugin());
    await defaultRegistry.use('nat-traversal', new NATTraversalPlugin());

    hierarchicalTaskManagerPlugin = defaultRegistry.pluginSystem.getPlugin('hierarchical-task-manager');
    if (!hierarchicalTaskManagerPlugin) {
      throw new Error('HierarchicalTaskManagerPlugin not found in MetaRegistry.');
    }
  }
}

const handleVisionCommand = async (subcommand, args, flags) => {
  switch (subcommand) {
    case 'create':
      console.log('Creating vision...');
      const vision = await visionService.createVision({
        title: flags.title || args[0],
        description: flags.description || args[1],
        strategic_goals: flags.goals ? flags.goals.split(',') : [],
        timeline_months: flags.timeline,
        budget_usd: flags.budget,
        stakeholders: flags.stakeholders ? flags.stakeholders.split(',') : [],
        priority: flags.priority,
        created_by: 'cli_user', // Placeholder
      });
      console.log('Vision created:', vision);
      break;
    case 'approve':
      console.log('Approving vision...');
      const approvedVision = await visionService.approveVision(args[0], {
        approver_email: flags.approver || 'cli_user@example.com',
        approval_notes: flags.notes,
        conditions: flags.conditions ? flags.conditions.split(',') : [],
        approved_by: 'cli_user', // Placeholder
      });
      console.log('Vision approved:', approvedVision);
      break;
    case 'roadmap':
      console.log('Getting vision roadmap...');
      const roadmap = await visionService.getVision(args[0]); // Assuming getVision returns enough for roadmap
      console.log('Vision Roadmap:', roadmap ? roadmap.gemini_insights : 'Not found or no roadmap');
      break;
    case 'list':
      console.log('Listing visions...');
      const visions = await visionService.listVisions(flags);
      console.log('Visions:', visions);
      break;
    default:
      console.log(`Unknown vision subcommand: ${subcommand}`);
      break;
  }
};

const handleAdrCommand = async (subcommand, args, flags) => {
  switch (subcommand) {
    case 'create':
      console.log('Creating ADR...');
      const newAdr = await adrService.createAdr({
        title: flags.title || args[0],
        decision: flags.decision || args[1],
        context: flags.context,
        alternatives: flags.alternatives ? flags.alternatives.split(',') : [],
        consequences: flags.consequences,
        vision_id: flags.visionId,
        technical_plan_id: flags.technicalPlanId,
      });
      console.log('ADR created:', newAdr);
      break;
    case 'list':
      console.log('Listing ADRs...');
      const adrs = await adrService.listAdrs({
        vision_id: flags.visionId,
        technical_plan_id: flags.technicalPlanId,
        status: flags.status,
      });
      console.log('ADRs:', adrs);
      break;
    default:
      console.log(`Unknown adr subcommand: ${subcommand}`);
      break;
  }
};

const handleSquadCommand = async (subcommand, args, flags) => {
  switch (subcommand) {
    case 'assign-task':
      console.log('Assigning task to squad...');
      const assignedTask = await squadService.assignTask(args[0], {
        type: flags.type,
        title: flags.title || args[1],
        description: flags.description,
        requirements: flags.requirements ? flags.requirements.split(',') : [],
        estimated_hours: flags.estimatedHours,
        dependencies: flags.dependencies ? flags.dependencies.split(',') : [],
        claude_assistance_level: flags.claudeAssistance,
      });
      console.log('Task assigned:', assignedTask);
      break;
    default:
      console.log(`Unknown squad subcommand: ${subcommand}`);
      break;
  }
};

const handleSwarmCommand = async (subcommand, args, flags) => {
  switch (subcommand) {
    case 'coordinate':
      console.log('Initiating swarm coordination...');
      const visionData = await visionService.getVision(args[0]); // Assuming args[0] is visionId
      if (!visionData) {
        console.error('Vision not found for coordination.');
        return;
      }
      const coordinationResult = await swarmService.coordinateVisionWorkflow(visionData, flags.optimizationGoals ? flags.optimizationGoals.split(',') : []);
      console.log('Swarm coordination initiated:', coordinationResult);
      break;
    case 'agents':
      console.log('Getting agent status...');
      const agentsStatus = await swarmService.getAgentsStatus(args[0]); // Optional swarmId
      console.log('Agent status:', agentsStatus);
      break;
    case 'mrap':
      console.log('Executing MRAP reasoning...');
      const mrapResult = await swarmService.mrapReason(
        args[0], // visionId
        flags.type, // reasoningType
        flags.constraints ? JSON.parse(flags.constraints) : {},
        flags.optimizationPreferences ? JSON.parse(flags.optimizationPreferences) : {}
      );
      console.log('MRAP reasoning executed:', mrapResult);
      break;
    default:
      console.log(`Unknown swarm subcommand: ${subcommand}`);
      break;
  }
};

const handleVtcCommand = async (subcommand, args, flags) => {
  switch (subcommand) {
    case 'execute':
      console.log('Executing Vision-to-Code workflow...');
      const execution = await vtcService.executeVtcWorkflow(
        args[0], // technicalPlanId
        flags.mode,
        flags.claudeIntegration,
        flags.squadConfig ? JSON.parse(flags.squadConfig) : {}
      );
      console.log('VTC workflow executed:', execution);
      break;
    case 'progress':
      console.log('Getting VTC progress...');
      const progress = await vtcService.getVtcProgress(args[0]); // executionId
      console.log('VTC progress:', progress);
      break;
    default:
      console.log(`Unknown vtc subcommand: ${subcommand}`);
      break;
  }
};

export const visionToCodeWorkflowHandler = async (subArgs, flags) => {
  await initializeMetaRegistry();

  const mainCommand = subArgs[0];
  const subcommand = subArgs[1];
  const remainingArgs = subArgs.slice(2);

  switch (mainCommand) {
    case 'vision':
      await handleVisionCommand(subcommand, remainingArgs, flags);
      break;
    case 'adr':
      await handleAdrCommand(subcommand, remainingArgs, flags);
      break;
    case 'squad':
      await handleSquadCommand(subcommand, remainingArgs, flags);
      break;
    case 'swarm':
      await handleSwarmCommand(subcommand, remainingArgs, flags);
      break;
    case 'vtc':
      await handleVtcCommand(subcommand, remainingArgs, flags);
      break;
    default:
      console.log(`
Usage: claude-zen workflow <command> <subcommand> [options]

Commands:
  vision    Manage strategic visions (create, approve, roadmap, list)
  adr       Manage Architectural Decision Records (create, list)
  squad     Manage development squads (assign-task)
  swarm     Manage swarm coordination (coordinate, agents, mrap)
  vtc       Execute Vision-to-Code workflows (execute, progress)

Use 'claude-zen workflow <command> --help' for more details.
      `);
      break;
  }
};
