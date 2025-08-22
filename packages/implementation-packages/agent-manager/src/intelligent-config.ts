/**
 * @fileoverview Intelligent Swarm Configuration - LLM-powered swarm optimization
 *
 * This module uses Claude to analyze tasks and repository context to automatically
 * determine optimal swarm configurations, eliminating the need for users to specify
 * technical details like cognitive types, topology, and agent counts.
 *
 * Key Features:
 * - Task complexity analysis and cognitive type selection
 * - Repository structure analysis for context-aware decisions
 * - Automatic topology optimization based on task characteristics
 * - Dynamic agent count determination based on workload
 * - Learning from previous swarm performance
 *
 * @author Claude Code Zen Team
 * @since 2.0.0
 */

import { getLogger, EnhancedError } from '@claude-zen/foundation';
import { getLLMProvider } from '@claude-zen/intelligence';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';
import type {
  CognitiveArchetype,
  SwarmTopology,
  SwarmCreationConfig,
} from './types';

const logger = getLogger('intelligent-config');

/**
 * Repository analysis results for swarm optimization
 */
export interface RepositoryAnalysis {
  projectType:'' | '''web-app''' | '''api | library' | 'cli' | 'mobile' | 'desktop''' | '''data-science''' | '''unknown';
  technologies: string[];
  complexity: 'low | medium' | 'high''' | '''very-high';
  codebaseSize: 'small | medium' | 'large''' | '''very-large';
  hasTests: boolean;
  hasDocs: boolean;
  mainLanguages: string[];
  fileCount: number;
  recentActivity: 'low | medium' | 'high';
}

/**
 * Intelligent swarm configuration recommendation
 */
export interface SwarmRecommendation {
  cognitiveTypes: CognitiveArchetype[];
  topology: SwarmTopology;
  agentCount: number;
  reasoning: {
    taskAnalysis: string;
    cognitiveRationale: string;
    topologyRationale: string;
    agentCountRationale: string;
    repositoryInfluence: string;
  };
  confidence: number; // 0-100
  alternatives?: SwarmRecommendation[];
}

/**
 * Analyze repository structure and characteristics
 */
export async function analyzeRepository(
  projectRoot?: string
): Promise<RepositoryAnalysis> {
  const rootDir = projectRoot'' | '''' | ''cwd();
  logger.info('🔍 Analyzing repository structure', { rootDir });

  const analysis: RepositoryAnalysis = {
    projectType: 'unknown',
    technologies: [],
    complexity: 'medium',
    codebaseSize: 'medium',
    hasTests: false,
    hasDocs: false,
    mainLanguages: [],
    fileCount: 0,
    recentActivity: 'medium',
  };

  try {
    // Analyze package.json for web/Node.js projects
    const packageJsonPath = join(rootDir, 'package.json');
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

      // Determine project type from dependencies and scripts
      if (
        packageJson.dependencies?.['react']'' | '''' | ''packageJson.dependencies?.['vue']'' | '''' | ''packageJson.dependencies?.['angular']
      ) {
        analysis.projectType = 'web-app';
      } else if (
        packageJson.dependencies?.['express']'' | '''' | ''packageJson.dependencies?.['fastify']'' | '''' | ''packageJson.dependencies?.['koa']
      ) {
        analysis.projectType = 'api';
      } else if (packageJson.bin'' | '''' | ''packageJson.scripts?.['start']) {
        analysis.projectType = 'cli';
      } else {
        analysis.projectType = 'library';
      }

      // Extract technologies
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };
      analysis.technologies = Object.keys(allDeps).slice(0, 20); // Top 20 deps

      // Check for tests
      analysis.hasTests = !!(
        packageJson.scripts?.['test']'' | '''' | ''allDeps['jest']'' | '''' | ''allDeps['vitest']'' | '''' | ''allDeps['mocha']
      );
    }

    // Check for documentation
    analysis.hasDocs =
      existsSync(join(rootDir, 'README.md'))'' | '''' | ''existsSync(join(rootDir,'docs'));

    // Analyze for other project types
    if (existsSync(join(rootDir, 'Cargo.toml'))) {
      analysis.technologies.push('rust');
      analysis.mainLanguages.push('Rust');
    }
    if (existsSync(join(rootDir, 'go.mod'))) {
      analysis.technologies.push('go');
      analysis.mainLanguages.push('Go');
    }
    if (
      existsSync(join(rootDir, 'requirements.txt'))'' | '''' | ''existsSync(join(rootDir,'pyproject.toml'))
    ) {
      analysis.technologies.push('python');
      analysis.mainLanguages.push('Python');
      if (
        analysis.technologies.some(
          (t) =>
            t.includes('jupyter')'' | '''' | ''t.includes('pandas')'' | '''' | ''t.includes('numpy')
        )
      ) {
        analysis.projectType = 'data-science';
      }
    }

    logger.info('📊 Repository analysis complete', analysis);
    return analysis;
  } catch (error) {
    logger.warn('⚠️ Repository analysis failed, using defaults', { error });
    return analysis;
  }
}

/**
 * Generate intelligent swarm configuration using Claude analysis
 */
export async function generateIntelligentConfig(
  task: string,
  repositoryAnalysis?: RepositoryAnalysis
): Promise<SwarmRecommendation> {
  logger.info('🧠 Generating intelligent swarm configuration', { task });

  const repoAnalysis = repositoryAnalysis'' | '''' | ''(await analyzeRepository())();

  const analysisPrompt = buildAnalysisPrompt(task, repoAnalysis);

  try {
    // Use LLM provider for secure analysis without file access
    const llm = getGlobalLLM();
    llm.setRole('analyst'); // Use analyst role for repository analysis

    const response = await llm.complete(analysisPrompt, {
      model: 'sonnet',
      temperature: 0.3, // Lower temperature for consistent configuration analysis
      maxTokens: 2000,
    });

    // Parse Claude's response to extract recommendations
    const recommendation = parseClaudeRecommendation(response, task);

    logger.info('✅ Intelligent configuration generated', {
      cognitiveTypes: recommendation.cognitiveTypes,
      topology: recommendation.topology,
      agentCount: recommendation.agentCount,
      confidence: recommendation.confidence,
    });

    return recommendation;
  } catch (error) {
    logger.error(
      '❌ Failed to generate intelligent configuration, using fallback',
      { error }
    );
    return generateFallbackConfiguration(task, repoAnalysis);
  }
}

/**
 * Build comprehensive analysis prompt for Claude
 */
function buildAnalysisPrompt(
  task: string,
  repoAnalysis: RepositoryAnalysis
): string {
  return `You are an expert in swarm intelligence and cognitive diversity optimization. Analyze the following task and repository context to determine the optimal swarm configuration.

**TASK TO ANALYZE:**
"${task}"

**REPOSITORY CONTEXT:**
- Project Type: ${repoAnalysis.projectType}
- Main Technologies: ${repoAnalysis.technologies.slice(0, 10).join(', ')}
- Languages: ${repoAnalysis.mainLanguages.join(', ')'' | '''' | '''JavaScript/TypeScript'}
- Complexity: ${repoAnalysis.complexity}
- Codebase Size: ${repoAnalysis.codebaseSize}
- Has Tests: ${repoAnalysis.hasTests ? 'Yes' : 'No'}
- Has Documentation: ${repoAnalysis.hasDocs ? 'Yes' : 'No'}
- Recent Activity: ${repoAnalysis.recentActivity}

**AVAILABLE COGNITIVE ARCHETYPES:**
1. **researcher** - Systematic analysis, data gathering, hypothesis testing, thoroughness
   - Best for: Investigation, analysis, research, understanding complex systems
   - Decision Speed: 150ms (thorough but deliberate)

2. **coder** - Solution implementation, optimization, debugging, pragmatism  
   - Best for: Implementation, bug fixes, optimization, technical solutions
   - Decision Speed: 80ms (fast and efficient)

3. **analyst** - Pattern recognition, trend analysis, synthesis, big-picture thinking
   - Best for: Data analysis, insight generation, strategic thinking, connections
   - Decision Speed: 120ms (balanced analysis)

4. **architect** - System design, scalability, integration, complexity management
   - Best for: Architecture decisions, system design, long-term planning
   - Decision Speed: 200ms (comprehensive but strategic)

**AVAILABLE TOPOLOGIES:**
1. **mesh** - All agents connected to all others
   - Best for: Complex collaboration, brainstorming, creative problems
   - Overhead: High communication, rich interaction

2. **hierarchical** - Tree-like structure with coordination layers
   - Best for: Large tasks, clear delegation, structured workflows
   - Overhead: Medium communication, clear command structure

3. **ring** - Agents connected in a circle, information flows sequentially
   - Best for: Sequential processing, pipeline tasks, step-by-step workflows
   - Overhead: Low communication, efficient for linear tasks

4. **star** - Central coordinator with spoke agents
   - Best for: Centralized coordination, simple delegation, focused tasks
   - Overhead: Very low, single point of coordination

**ANALYSIS REQUIREMENTS:**
Please provide your analysis in this EXACT JSON format:

\`\`\`json
{
  "cognitiveTypes": ["researcher", "coder", "analyst"],
  "topology": "hierarchical",
  "agentCount": 3,
  "reasoning": {
    "taskAnalysis": "Analyze what type of task this is and its complexity",
    "cognitiveRationale": "Explain why these specific cognitive types are optimal",
    "topologyRationale": "Explain why this topology is best for the task",
    "agentCountRationale": "Explain why this number of agents is optimal",
    "repositoryInfluence": "How repository context influenced decisions"
  },
  "confidence": 85
}
\`\`\`

**OPTIMIZATION GUIDELINES:**
- For implementation tasks: Prioritize coder + architect
- For analysis tasks: Prioritize researcher + analyst  
- For complex problems: Use cognitive diversity (3-4 types)
- For simple tasks: Use 1-2 focused agents
- For large codebases: Consider hierarchical topology
- For creative tasks: Consider mesh topology
- For sequential workflows: Consider ring topology
- For focused tasks: Consider star topology

Analyze the task and repository context, then provide the optimal swarm configuration with clear reasoning.`;
}

/**
 * Parse Claude's recommendation response
 */
function parseClaudeRecommendation(
  response: string,
  task: string
): SwarmRecommendation {
  try {
    // Extract JSON from Claude's response (now it's a string from LLM provider)
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);

    if (!jsonMatch) {
      throw new Error('No JSON configuration found in response');
    }

    const config = JSON.parse(jsonMatch[1]);

    // Validate and sanitize the configuration
    const validCognitiveTypes: CognitiveArchetype[] = [
      'researcher',
      'coder',
      'analyst',
      'architect',
    ];
    const validTopologies: SwarmTopology[] = [
      'mesh',
      'hierarchical',
      'ring',
      'star',
    ];

    const cognitiveTypes = (config.cognitiveTypes'' | '''' | ''['researcher', 'coder'])
      .filter((type: string) =>
        validCognitiveTypes.includes(type as CognitiveArchetype)
      )
      .slice(0, 4); // Max 4 agents

    const topology = validTopologies.includes(config.topology)
      ? config.topology
      : 'mesh';
    const agentCount = Math.min(
      Math.max(
        cognitiveTypes.length,
        config.agentCount'' | '''' | ''cognitiveTypes.length
      ),
      6
    );

    return {
      cognitiveTypes,
      topology,
      agentCount,
      reasoning: {
        taskAnalysis:
          config.reasoning?.taskAnalysis'' | '''' | '''Task analysis not provided',
        cognitiveRationale:
          config.reasoning?.cognitiveRationale'' | '''' | '''Cognitive rationale not provided',
        topologyRationale:
          config.reasoning?.topologyRationale'' | '''' | '''Topology rationale not provided',
        agentCountRationale:
          config.reasoning?.agentCountRationale'' | '''' | '''Agent count rationale not provided',
        repositoryInfluence:
          config.reasoning?.repositoryInfluence'' | '''' | '''Repository influence not analyzed',
      },
      confidence: Math.min(Math.max(config.confidence'' | '''' | ''75, 0), 100),
    };
  } catch (error) {
    logger.warn('⚠️ Failed to parse Claude recommendation, using intelligent fallback',
      { error }
    );
    return generateIntelligentFallback(task);
  }
}

/**
 * Generate intelligent fallback configuration based on task keywords
 */
function generateIntelligentFallback(task: string): SwarmRecommendation {
  const taskLower = task.toLowerCase();

  // Task type analysis
  let cognitiveTypes: CognitiveArchetype[] = ['researcher', 'coder'];
  let topology: SwarmTopology = 'mesh';
  let reasoning = '';

  if (
    taskLower.includes('analy')'' | '''' | ''taskLower.includes('research')'' | '''' | ''taskLower.includes('investigate')
  ) {
    cognitiveTypes = ['researcher', 'analyst'];
    topology = 'hierarchical';
    reasoning =
      'Analysis/research task detected - using researcher + analyst with hierarchical coordination';
  } else if (
    taskLower.includes('implement')'' | '''' | ''taskLower.includes('build')'' | '''' | ''taskLower.includes('code')
  ) {
    cognitiveTypes = ['coder', 'architect'];
    topology = 'star';
    reasoning =
      'Implementation task detected - using coder + architect with centralized coordination';
  } else if (
    taskLower.includes('design')'' | '''' | ''taskLower.includes('architect')'' | '''' | ''taskLower.includes('plan')
  ) {
    cognitiveTypes = ['architect', 'analyst', 'researcher'];
    topology = 'mesh';
    reasoning =
      'Design/architecture task detected - using diverse cognitive types with mesh topology for collaboration';
  } else if (
    taskLower.includes('debug')'' | '''' | ''taskLower.includes('fix')'' | '''' | ''taskLower.includes('error')
  ) {
    cognitiveTypes = ['coder', 'researcher'];
    topology = 'ring';
    reasoning =
      'Debugging task detected - using coder + researcher with sequential ring topology';
  } else if (taskLower.includes('test')'' | '''' | ''taskLower.includes('validate')) {
    cognitiveTypes = ['coder', 'analyst'];
    topology = 'hierarchical';
    reasoning =
      'Testing/validation task detected - using coder + analyst with structured coordination';
  } else {
    // Complex or unclear task - use cognitive diversity
    cognitiveTypes = ['researcher', 'coder', 'analyst'];
    topology = 'mesh';
    reasoning =
      'Complex/unclear task detected - using cognitive diversity with mesh topology for comprehensive approach';
  }

  return {
    cognitiveTypes,
    topology,
    agentCount: cognitiveTypes.length,
    reasoning: {
      taskAnalysis: `Intelligent fallback analysis: ${reasoning}`,
      cognitiveRationale: `Selected ${cognitiveTypes.join(', ')} based on task keyword analysis`,
      topologyRationale: `${topology} topology chosen for optimal coordination pattern`,
      agentCountRationale: `${cognitiveTypes.length} agents provide optimal balance for this task type`,
      repositoryInfluence:
        'Repository analysis not available for fallback configuration',
    },
    confidence: 70,
  };
}

/**
 * Generate fallback configuration when Claude analysis fails
 */
function generateFallbackConfiguration(
  task: string,
  repoAnalysis: RepositoryAnalysis
): SwarmRecommendation {
  logger.info('🔄 Generating fallback configuration');

  // Use repository context to improve fallback
  let cognitiveTypes: CognitiveArchetype[] = ['researcher', 'coder'];
  let topology: SwarmTopology = 'mesh';

  // Adjust based on project type
  if (repoAnalysis.projectType === 'web-app') {
    cognitiveTypes = ['coder', 'architect'];
    topology = 'star';
  } else if (repoAnalysis.projectType === 'api') {
    cognitiveTypes = ['coder', 'architect', 'analyst'];
    topology = 'hierarchical';
  } else if (repoAnalysis.projectType === 'data-science') {
    cognitiveTypes = ['researcher', 'analyst'];
    topology = 'mesh';
  }

  // Adjust based on complexity
  if (
    repoAnalysis.complexity === 'high''' | '''' | ''repoAnalysis.complexity ==='very-high'
  ) {
    if (!cognitiveTypes.includes('architect')) {
      cognitiveTypes.push('architect');
    }
    topology = 'hierarchical';
  }

  return {
    cognitiveTypes,
    topology,
    agentCount: cognitiveTypes.length,
    reasoning: {
      taskAnalysis: 'Fallback analysis based on repository context',
      cognitiveRationale: `Selected agents based on ${repoAnalysis.projectType} project type`,
      topologyRationale: `${topology} topology suitable for ${repoAnalysis.complexity} complexity`,
      agentCountRationale: `${cognitiveTypes.length} agents appropriate for project scope`,
      repositoryInfluence: `Configuration adapted for ${repoAnalysis.projectType} with ${repoAnalysis.complexity} complexity`,
    },
    confidence: 60,
  };
}

/**
 * Create swarm configuration with intelligent defaults
 */
export async function createIntelligentSwarmConfig(
  task: string,
  userPreferences?: Partial<SwarmCreationConfig>
): Promise<SwarmCreationConfig> {
  logger.info('🎯 Creating intelligent swarm configuration', { task });

  try {
    const recommendation = await generateIntelligentConfig(task);

    const config: SwarmCreationConfig = {
      task,
      cognitiveTypes:
        userPreferences?.cognitiveTypes'' | '''' | ''recommendation.cognitiveTypes,
      topology: userPreferences?.topology'' | '''' | ''recommendation.topology,
      maxDuration: userPreferences?.maxDuration'' | '''' | ''3600000, // 1 hour default
      persistent: userPreferences?.persistent ?? true,
      neuralAcceleration: userPreferences?.neuralAcceleration ?? false,
      ...userPreferences,
    };

    logger.info('✅ Intelligent swarm configuration created', {
      ...config,
      recommendation: recommendation.reasoning,
    });

    return config;
  } catch (error) {
    logger.error('❌ Failed to create intelligent configuration', { error });
    throw error;
  }
}
