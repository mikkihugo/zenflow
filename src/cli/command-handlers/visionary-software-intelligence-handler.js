
// src/cli/command-handlers/vision-to-code-workflow-handler.js

import { MetaRegistryManager, MemoryBackend } from '../../coordination/meta-registry/meta-manager.js';
import HierarchicalTaskManagerPlugin from '../../coordination/meta-registry/plugins/hierarchical-task-manager.js';
import ArchitectAdvisorPlugin from '../../coordination/meta-registry/plugins/architect-advisor.js';
import MemoryRAGPlugin from '../../coordination/meta-registry/plugins/memory-rag.js';
import PortDiscoveryPlugin from '../../coordination/meta-registry/plugins/port-discovery.js';
import PubSubPlugin from '../../coordination/meta-registry/plugins/pubsub.js';
import NATTraversalPlugin from '../../coordination/meta-registry/plugins/nat-traversal.js';
import { HiveMindCore } from '../hive-mind-handlers/hive-mind/core.js';
import { MCPToolWrapper } from '../hive-mind-handlers/hive-mind/mcp-wrapper.js';

let metaRegistryManager;
let defaultRegistry;
let hierarchicalTaskManagerPlugin;
let hiveMindCore;
let mcpToolWrapper;

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

    // Initialize HiveMindCore and MCPToolWrapper
    const { HiveMindCore } = await import('../hive-mind-handlers/hive-mind/core.js');
    const { MCPToolWrapper } = await import('../hive-mind-handlers/hive-mind/mcp-wrapper.js');
    hiveMindCore = new HiveMindCore(defaultRegistry);
    mcpToolWrapper = new MCPToolWrapper(defaultRegistry);
    await hiveMindCore.initialize();
  }
}

const handleVisionCommand = async (subcommand, args, flags) => {
  switch (subcommand) {
    case 'create':
      console.log('Creating vision...');
      const vision = await hierarchicalTaskManagerPlugin.createVision({
        title: flags.title || args[0],
        description: flags.description || args[1],
        objectives: flags.goals ? flags.goals.split(',') : [],
        timeline: flags.timeline,
        priority: flags.priority,
        stakeholders: flags.stakeholders ? flags.stakeholders.split(',') : [],
        source: 'cli',
      });
      console.log('Vision created:', vision);
      break;
    case 'approve':
      console.log('Approving vision...');
      const approvedVision = await hierarchicalTaskManagerPlugin.approveVision(args[0], {
        approver_email: flags.approver || 'cli_user@example.com',
        approval_notes: flags.notes,
        conditions: flags.conditions ? flags.conditions.split(',') : [],
      });
      console.log('Vision approved:', approvedVision);
      break;
    case 'roadmap':
      console.log('Getting vision roadmap...');
      const roadmap = await hierarchicalTaskManagerPlugin.getVision(args[0]);
      console.log('Vision Roadmap:', roadmap ? roadmap.metadata : 'Not found or no roadmap');
      break;
    case 'list':
      console.log('Listing visions...');
      const visions = await hierarchicalTaskManagerPlugin.listVisions(flags);
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
      const newAdr = await architectAdvisorPlugin.createSuggestion({
        title: flags.title || args[0],
        description: flags.description || args[1],
        type: 'architectural-decision',
        reasoning: flags.context,
        alternatives: flags.alternatives ? flags.alternatives.split(',') : [],
        consequences: flags.consequences,
        visionId: flags.visionId,
        technicalPlanId: flags.technicalPlanId,
        confidence: 1.0, // CLI-created ADRs have high confidence
        impact: 'high', // Default impact
        effort: 'medium', // Default effort
      });
      console.log('ADR created:', newAdr);
      break;
    case 'list':
      console.log('Listing ADRs...');
      const adrs = await architectAdvisorPlugin.getSuggestions({
        type: 'architectural-decision',
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
      const squadId = args[0];
      const assignedTask = await hierarchicalTaskManagerPlugin.createTask({
        title: flags.title || args[1],
        description: flags.description,
        type: flags.type,
        priority: flags.priority,
        effort: flags.effort,
        skills: flags.skills ? flags.skills.split(',') : [],
        dependencies: flags.dependencies ? flags.dependencies.split(',') : [],
        assignee: squadId, // Assign to squad (conceptually)
        status: 'assigned',
        source: 'cli',
      }, squadId, 'squad'); // Parent is the squad
      console.log('Task assigned:', assignedTask);
      break;
    default:
      console.log(`Unknown squad subcommand: ${subcommand}`);
      break;
  }
};

const handleAdvancedSwarmCommand = async (subcommand, args, flags) => {
  switch (subcommand) {
    case 'coordinate':
      console.log('🧠 Initiating advanced swarm coordination...');
      const objective = flags.objective || args[0];
      if (!objective) {
        console.error('Objective is required for advanced swarm coordination.');
        return;
      }
      const advancedSwarmConfig = {
        objective: objective,
        name: flags.name,
        queenType: flags.queenType || 'advanced-intelligence',
        maxWorkers: flags.maxWorkers || 8,
        consensusAlgorithm: flags.consensus || 'hierarchical-consensus',
        topology: flags.topology || 'hierarchical',
        autoScale: flags.autoScale !== false,
        encryption: flags.encryption !== false,
        cognitiveSupport: true,
        neuralPatterns: true,
        intelligenceLevel: 'advanced'
      };
      await hiveMindCore.initialize(advancedSwarmConfig);
      console.log('✅ Advanced swarm coordination initiated via HiveMindCore.');
      break;
    case 'agents':
      console.log('Getting agent status...');
      const agentsStatus = hiveMindCore.getStatus().workers; // Assuming getStatus returns worker agents
      console.log('Agent status:', agentsStatus);
      break;
    case 'mrap':
      console.log('Executing MRAP reasoning...');
      const mrapResult = await hiveMindCore.buildConsensus(
        flags.topic || args[0],
        flags.options ? flags.options.split(',') : [],
      );
      console.log('MRAP reasoning executed:', mrapResult);
      break;
    default:
      console.log(`Unknown swarm subcommand: ${subcommand}`);
      break;
  }
};

const handleVsiCommand = async (subcommand, args, flags) => {
  switch (subcommand) {
    case 'analyze':
      console.log('🧠 Executing Visionary Software Intelligence analysis...');
      const codebasePath = args[0];
      const vsiObjective = `Analyze codebase: ${codebasePath}`;
      const createdTask = await hierarchicalTaskManagerPlugin.createTask({
        title: vsiObjective,
        description: `VSI analysis for codebase ${codebasePath}`,
        type: 'vsi_analysis',
        priority: 5,
        effort: 'large',
        metadata: {
          codebasePath: codebasePath,
          analysisMode: flags.mode || 'comprehensive',
          language: flags.language || 'auto-detect',
          includeRefactoring: flags.refactoring !== false,
          patternDetection: flags.patterns !== false,
          qualityAssessment: flags.quality !== false,
          advancedCoordination: true
        },
      }, codebasePath, 'codebase_analysis');
      console.log('✅ VSI analysis workflow initiated as task:', createdTask);
      break;
    case 'progress':
      console.log('📊 Getting VSI analysis progress...');
      const analysisId = args[0];
      const vsiTasks = await defaultRegistry.discover({
        tags: ['task', 'vsi_analysis'],
        query: { 'metadata.codebasePath': analysisId },
      });
      console.log('📈 VSI progress (related tasks):', vsiTasks);
      break;
    case 'refactor':
      console.log('🔧 Generating refactoring recommendations...');
      const refactorPath = args[0];
      const refactorTask = await hierarchicalTaskManagerPlugin.createTask({
        title: `Refactor recommendations: ${refactorPath}`,
        description: `Generate intelligent refactoring recommendations for ${refactorPath}`,
        type: 'vsi_refactoring',
        priority: 4,
        effort: 'medium',
        metadata: {
          codebasePath: refactorPath,
          language: flags.language || 'auto-detect',
          refactoringDepth: flags.depth || 'comprehensive',
          includeBestPractices: flags.bestPractices !== false,
          advancedCoordination: true
        },
      }, refactorPath, 'refactoring_analysis');
      console.log('✅ VSI refactoring workflow initiated:', refactorTask);
      break;
    default:
      console.log(`Unknown vtc subcommand: ${subcommand}`);
      break;
  }
};

export const visionarySoftwareIntelligenceHandler = async (subArgs, flags) => {
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
      await handleAdvancedSwarmCommand(subcommand, remainingArgs, flags);
      break;
    case 'vsi':
      await handleVsiCommand(subcommand, remainingArgs, flags);
      break;
    default:
      console.log(`
Usage: claude-zen workflow <command> <subcommand> [options]

Commands:
  vision    Manage strategic visions (create, approve, roadmap, list)
  adr       Manage Architectural Decision Records (create, list)
  squad     Manage development squads (assign-task)
  swarm     Manage advanced swarm coordination (coordinate, agents, mrap)
  vsi       Execute Visionary Software Intelligence workflows (analyze, progress, refactor)

Use 'claude-zen workflow <command> --help' for more details.
      `);
      break;
  }
};
