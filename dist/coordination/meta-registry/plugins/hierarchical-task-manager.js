/**
 * Hierarchical Task Management Plugin
 * Manages the complete hierarchy: Vision to Epic to Feature to PRD to ADR to User Story to Task
 * With intelligent suggestion system for missing components
 */

import { EventEmitter } from 'events';
import { nanoid } from 'nanoid';
import Database from 'better-sqlite3';
import path from 'path';
import { readFile } from 'fs/promises';
import matter from 'gray-matter';
import { readHiveRegistry } from '../../../cli/command-handlers/hive-mind-command.js';
import { generateText } from '../../../cli/ai-service.js';
import { swarmCommand } from '../../../cli/command-handlers/swarm-command.js';

export class HierarchicalTaskManagerPlugin extends EventEmitter {
  static metadata = {
    name: 'hierarchical-task-manager',
    version: '1.2.0',
    description: 'Complete hierarchical task management from vision to implementation using SQLite',
    dependencies: ['memory-rag', 'architect-advisor'],
    capabilities: ['vision-management', 'epic-breakdown', 'feature-planning', 'prd-generation', 'user-story-creation', 'task-delegation', 'completeness-analysis']
  };

  constructor() {
    super();
    this.registry = null;
    this.memoryRag = null;
    this.architectAdvisor = null;
    this.db = null;
    
    // Intelligence engines
    this.suggestionEngine = null;
    this.completenessAnalyzer = null;
    this.breakdownEngine = null;
  }

  async initialize(registry, options = {}) {
    this.registry = registry;
    this.options = {
      dbPath: options.dbPath || './.swarm/hierarchy.db',
      autoBreakdown: options.autoBreakdown !== false,
      completenessThreshold: options.completenessThreshold || 0.85,
      suggestionInterval: options.suggestionInterval || 300000, // 5 minutes
      enableQueenCoordination: options.enableQueenCoordination !== false,
      minConfidenceForSuggestion: options.minConfidenceForSuggestion || 0.7,
      ...options
    };

    // Initialize database
    this.db = new Database(this.options.dbPath);
    this.createSchema();

    // Get dependent plugins
    this.memoryRag = registry.pluginSystem.getPlugin('memory-rag');
    this.architectAdvisor = registry.pluginSystem.getPlugin('architect-advisor');

    // Initialize intelligence engines
    this.initializeIntelligenceEngines();

    // Load all service scopes
    this.serviceScopes = await this.loadServiceScopes();

    // Register plugin services
    await this.registerPluginServices();

    // Start intelligent monitoring
    if (this.options.autoBreakdown) {
      this.startIntelligentMonitoring();
    }
  }

  createSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS visions (
          id TEXT PRIMARY KEY,
          title TEXT,
          description TEXT,
          objectives TEXT,
          stakeholders TEXT,
          timeline TEXT,
          priority TEXT,
          status TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          metadata TEXT
      );

      CREATE TABLE IF NOT EXISTS epics (
          id TEXT PRIMARY KEY,
          vision_id TEXT,
          title TEXT,
          description TEXT,
          acceptance_criteria TEXT,
          business_value TEXT,
          effort TEXT,
          priority TEXT,
          status TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          metadata TEXT,
          FOREIGN KEY (vision_id) REFERENCES visions(id)
      );

      CREATE TABLE IF NOT EXISTS features (
          id TEXT PRIMARY KEY,
          epic_id TEXT,
          title TEXT,
          description TEXT,
          functional_requirements TEXT,
          non_functional_requirements TEXT,
          dependencies TEXT,
          risks TEXT,
          effort TEXT,
          priority TEXT,
          status TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          metadata TEXT,
          FOREIGN KEY (epic_id) REFERENCES epics(id)
      );

      CREATE TABLE IF NOT EXISTS prds (
          id TEXT PRIMARY KEY,
          feature_id TEXT,
          title TEXT,
          sections TEXT,
          status TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          metadata TEXT,
          FOREIGN KEY (feature_id) REFERENCES features(id)
      );

      CREATE TABLE IF NOT EXISTS user_stories (
          id TEXT PRIMARY KEY,
          parent_id TEXT,
          parent_type TEXT,
          title TEXT,
          narrative TEXT,
          acceptance_criteria TEXT,
          priority TEXT,
          effort TEXT,
          status TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          metadata TEXT
      );

      CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          parent_id TEXT,
          parent_type TEXT,
          title TEXT,
          description TEXT,
          type TEXT,
          priority TEXT,
          effort TEXT,
          skills TEXT,
          dependencies TEXT,
          status TEXT,
          assignee TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          metadata TEXT
      );

      CREATE TABLE IF NOT EXISTS assignments (
          id TEXT PRIMARY KEY,
          task_id TEXT,
          queen_id TEXT,
          assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          context TEXT,
          status TEXT,
          progress TEXT,
          communication TEXT,
          FOREIGN KEY (task_id) REFERENCES tasks(id)
      );

      CREATE TABLE IF NOT EXISTS service_scopes (
          name TEXT PRIMARY KEY,
          path TEXT,
          content TEXT,
          metadata TEXT,
          last_scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  async loadServiceScopes() {
    const registry = await readHiveRegistry();
    const scopes = {};
    for (const [name, hive] of Object.entries(registry)) {
      const scopePath = path.join(path.dirname(hive.path), 'scope.md');
      try {
        const content = await readFile(scopePath, 'utf8');
        const parsed = matter(content);
        const scopeData = {
          name: name,
          path: scopePath,
          content: content,
          metadata: JSON.stringify(parsed.data),
        };
        this.db.prepare(`
          INSERT OR REPLACE INTO service_scopes (name, path, content, metadata)
          VALUES (@name, @path, @content, @metadata)
        `).run(scopeData);
        scopes[name] = scopeData;
      } catch (error) {
        // Scope file might not exist, which is fine.
        console.warn(`Could not load scope for ${name}: ${error.message}`);
      }
    }
    return scopes;
  }

  initializeIntelligenceEngines() {
    // These would need to be adapted to work with the DB if they have their own persistence logic
    // For now, assuming they operate in-memory or are stateless
    // this.suggestionEngine = new SuggestionEngine(this);
    // this.completenessAnalyzer = new CompletenessAnalyzer(this);
    // this.breakdownEngine = new BreakdownEngine(this);
  }
  
  startIntelligentMonitoring() {
    // Start periodic monitoring for incomplete work and optimization opportunities
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.analyzeCompleteness();
        await this.optimizeDelegations();
      } catch (error) {
        console.warn('Monitoring cycle error:', error.message);
      }
    }, this.options.suggestionInterval);
  }
  
  async analyzeCompleteness() {
    // Analyze hierarchy completeness and suggest missing components
    const incompleteVisions = this.db.prepare(`
      SELECT v.* FROM visions v 
      WHERE v.status IN ('draft', 'in_progress')
      AND (SELECT COUNT(*) FROM epics e WHERE e.vision_id = v.id) = 0
    `).all();
    
    for (const vision of incompleteVisions) {
      if (Math.random() < 0.1) { // Only suggest occasionally to avoid spam
        this.emit('suggestionGenerated', {
          type: 'missing_epics',
          visionId: vision.id,
          message: `Vision "${vision.title}" has no epics. Consider running breakdown analysis.`
        });
      }
    }
  }
  
  async optimizeDelegations() {
    // Look for optimization opportunities in delegations
    const stalledAssignments = this.db.prepare(`
      SELECT * FROM assignments 
      WHERE status = 'delegated' 
      AND assigned_at < datetime('now', '-24 hours')
    `).all();
    
    for (const assignment of stalledAssignments) {
      this.emit('suggestionGenerated', {
        type: 'stalled_delegation',
        assignmentId: assignment.id,
        message: `Assignment to ${assignment.queen_id} has been pending for over 24 hours.`
      });
    }
  }

  async registerPluginServices() {
    // This method might need adjustment to fetch data from the DB instead of in-memory maps
    await this.registry.register('service:hierarchical-task-manager', {
      plugin: 'hierarchical-task-manager',
      version: HierarchicalTaskManagerPlugin.metadata.version,
      capabilities: HierarchicalTaskManagerPlugin.metadata.capabilities,
    }, {
      tags: ['service', 'plugin', 'task-management', 'hierarchy', 'intelligence'],
      ttl: 3600
    });
  }

  // Vision Management
  async createVision(visionData) {
    const visionId = nanoid();
    const vision = {
      id: visionId,
      title: visionData.title,
      description: visionData.description,
      objectives: JSON.stringify(visionData.objectives || []),
      stakeholders: JSON.stringify(visionData.stakeholders || []),
      timeline: visionData.timeline,
      priority: visionData.priority || 'medium',
      status: 'draft',
      metadata: JSON.stringify({
        source: visionData.source || 'manual',
        confidence: visionData.confidence || 1.0,
        complexity: this.calculateComplexity(visionData)
      })
    };

    const stmt = this.db.prepare(`
      INSERT INTO visions (id, title, description, objectives, stakeholders, timeline, priority, status, metadata)
      VALUES (@id, @title, @description, @objectives, @stakeholders, @timeline, @priority, @status, @metadata)
    `);
    stmt.run(vision);

    await this.registry.register(`vision:${visionId}`, vision, { tags: ['vision', 'hierarchy', 'planning'], ttl: 86400 });
    this.emit('visionCreated', { visionId, vision });
    
    // Trigger intelligent breakdown and delegation
    if (this.options.autoBreakdown) {
      try {
        await this.intelligentBreakdownAndDelegate(visionId, vision);
      } catch (error) {
        console.warn(`Failed to auto-breakdown vision ${visionId}:`, error.message);
        // Continue execution - auto-breakdown is optional
      }
    }
    
    return visionId;
  }

  // Epic Management
  async createEpic(epicData, parentVisionId) {
    const epicId = nanoid();
    const epic = {
        id: epicId,
        vision_id: parentVisionId,
        title: epicData.title,
        description: epicData.description,
        acceptance_criteria: JSON.stringify(epicData.acceptanceCriteria || []),
        business_value: epicData.businessValue,
        effort: epicData.effort || 'medium',
        priority: epicData.priority || 'medium',
        status: 'planned',
        metadata: JSON.stringify({
            source: epicData.source || 'breakdown',
            confidence: epicData.confidence || 0.8,
            complexity: this.calculateComplexity(epicData)
        })
    };

    const stmt = this.db.prepare(`
        INSERT INTO epics (id, vision_id, title, description, acceptance_criteria, business_value, effort, priority, status, metadata)
        VALUES (@id, @vision_id, @title, @description, @acceptance_criteria, @business_value, @effort, @priority, @status, @metadata)
    `);
    stmt.run(epic);

    await this.registry.register(`epic:${epicId}`, epic, { tags: ['epic', 'hierarchy', 'planning', `vision:${parentVisionId}`], ttl: 86400 });
    this.emit('epicCreated', { epicId, epic, parentVisionId });
    return epicId;
  }

  // Feature Management
  async createFeature(featureData, parentEpicId) {
    const featureId = nanoid();
    const feature = {
        id: featureId,
        epic_id: parentEpicId,
        title: featureData.title,
        description: featureData.description,
        functional_requirements: JSON.stringify(featureData.functionalRequirements || []),
        non_functional_requirements: JSON.stringify(featureData.nonFunctionalRequirements || []),
        dependencies: JSON.stringify(featureData.dependencies || []),
        risks: JSON.stringify(featureData.risks || []),
        effort: featureData.effort || 'medium',
        priority: featureData.priority || 'medium',
        status: 'defined',
        metadata: JSON.stringify({
            source: featureData.source || 'breakdown',
            confidence: featureData.confidence || 0.7,
            complexity: this.calculateComplexity(featureData)
        })
    };

    const stmt = this.db.prepare(`
        INSERT INTO features (id, epic_id, title, description, functional_requirements, non_functional_requirements, dependencies, risks, effort, priority, status, metadata)
        VALUES (@id, @epic_id, @title, @description, @functional_requirements, @non_functional_requirements, @dependencies, @risks, @effort, @priority, @status, @metadata)
    `);
    stmt.run(feature);

    await this.registry.register(`feature:${featureId}`, feature, { tags: ['feature', 'hierarchy', 'planning', `epic:${parentEpicId}`], ttl: 86400 });
    this.emit('featureCreated', { featureId, feature, parentEpicId });
    return featureId;
  }

  // PRD Generation
  async generatePRD(featureId) {
    const feature = this.db.prepare('SELECT * FROM features WHERE id = ?').get(featureId);
    if (!feature) throw new Error(`Feature ${featureId} not found`);

    const prdId = nanoid();
    const prd = {
        id: prdId,
        feature_id: featureId,
        title: `PRD: ${feature.title}`,
        sections: JSON.stringify({
            overview: {
                description: feature.description,
                objectives: JSON.parse(feature.functional_requirements).slice(0, 3) || [],
            },
        }),
        status: 'draft',
        metadata: JSON.stringify({
            generatedBy: 'hierarchical-task-manager',
            confidence: 0.8,
        })
    };
    
    const stmt = this.db.prepare(`
        INSERT INTO prds (id, feature_id, title, sections, status, metadata)
        VALUES (@id, @feature_id, @title, @sections, @status, @metadata)
    `);
    stmt.run(prd);

    await this.registry.register(`prd:${prdId}`, prd, { tags: ['prd', 'hierarchy', 'documentation', `feature:${featureId}`], ttl: 86400 });
    this.emit('prdGenerated', { prdId, prd, featureId });
    return prdId;
  }

  // User Story Creation
  async createUserStory(storyData, parentId, parentType) {
    const storyId = nanoid();
    const userStory = {
        id: storyId,
        parent_id: parentId,
        parent_type: parentType,
        title: storyData.title,
        narrative: JSON.stringify({
            as: storyData.as || 'a user',
            i_want: storyData.i_want,
            so_that: storyData.so_that
        }),
        acceptance_criteria: JSON.stringify(storyData.acceptanceCriteria || []),
        priority: storyData.priority || 'medium',
        effort: storyData.effort || 'medium',
        status: 'backlog',
        metadata: JSON.stringify({
            source: storyData.source || 'breakdown',
            confidence: storyData.confidence || 0.7,
        })
    };

    const stmt = this.db.prepare(`
        INSERT INTO user_stories (id, parent_id, parent_type, title, narrative, acceptance_criteria, priority, effort, status, metadata)
        VALUES (@id, @parent_id, @parent_type, @title, @narrative, @acceptance_criteria, @priority, @effort, @status, @metadata)
    `);
    stmt.run(userStory);

    await this.registry.register(`user-story:${storyId}`, userStory, { tags: ['user-story', 'hierarchy', 'development', `${parentType}:${parentId}`], ttl: 86400 });
    this.emit('userStoryCreated', { storyId, userStory, parentId, parentType });
    return storyId;
  }

  // Task Creation and Management
  async createTask(taskData, parentId, parentType) {
    const taskId = nanoid();
    const task = {
        id: taskId,
        parent_id: parentId,
        parent_type: parentType,
        title: taskData.title,
        description: taskData.description,
        type: taskData.type || 'development',
        priority: taskData.priority || 'medium',
        effort: taskData.effort || 'medium',
        skills: JSON.stringify(taskData.skills || []),
        dependencies: JSON.stringify(taskData.dependencies || []),
        status: 'todo',
        assignee: null,
        metadata: JSON.stringify({
            source: taskData.source || 'breakdown',
            confidence: taskData.confidence || 0.8,
        })
    };

    const stmt = this.db.prepare(`
        INSERT INTO tasks (id, parent_id, parent_type, title, description, type, priority, effort, skills, dependencies, status, assignee, metadata)
        VALUES (@id, @parent_id, @parent_type, @title, @description, @type, @priority, @effort, @skills, @dependencies, @status, @assignee, @metadata)
    `);
    stmt.run(task);

    await this.registry.register(`task:${taskId}`, task, { tags: ['task', 'hierarchy', 'development', `${parentType}:${parentId}`, task.type], ttl: 86400 });
    this.emit('taskCreated', { taskId, task, parentId, parentType });
    return taskId;
  }

  // Queen Task Assignment System
  async assignTaskToQueen(taskId, queenId, context = {}) {
    const task = this.db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    const assignmentId = nanoid();
    const assignment = {
        id: assignmentId,
        task_id: taskId,
        queen_id: queenId,
        context: JSON.stringify({
            priority: task.priority,
            skills_required: JSON.parse(task.skills),
            effort_estimate: task.effort,
            dependencies: JSON.parse(task.dependencies),
            ...context
        }),
        status: 'assigned',
        progress: JSON.stringify({
            started: null,
            completed: null,
            progress_percentage: 0,
            milestones: []
        }),
        communication: JSON.stringify({
            updates: [],
            blockers: [],
            questions: []
        })
    };

    const stmt = this.db.prepare(`
        INSERT INTO assignments (id, task_id, queen_id, context, status, progress, communication)
        VALUES (@id, @task_id, @queen_id, @context, @status, @progress, @communication)
    `);
    stmt.run(assignment);

    this.db.prepare('UPDATE tasks SET assignee = ?, status = ? WHERE id = ?').run(queenId, 'assigned', taskId);

    await this.registry.register(`assignment:${assignmentId}`, assignment, { tags: ['assignment', 'task-delegation', 'queen', `queen:${queenId}`, `task:${taskId}`], ttl: 86400 });
    this.emit('taskAssigned', { assignmentId, assignment, taskId, queenId });
    return assignmentId;
  }

  // AI-Driven Vision Breakdown and Delegation
  async intelligentBreakdownAndDelegate(visionId, vision) {
    console.log(`🧠 Starting intelligent breakdown for vision: ${vision.title}`);
    
    // Step 1: Generate initial breakdown using AI
    const breakdownPrompt = `
      Vision Title: ${vision.title}
      Description: ${vision.description}
      Objectives: ${vision.objectives}
      
      As a CTO, break down this vision into 3-5 high-level epics that can be delegated to different teams.
      For each epic, provide:
      - Title: Clear, actionable epic name
      - Description: Detailed scope and purpose
      - BusinessValue: Why this epic matters
      - AcceptanceCriteria: 2-3 key criteria for completion
      - Priority: high/medium/low based on dependencies and impact
      - EstimatedEffort: small/medium/large
      - RelevantServices: Keywords that might match service scopes (e.g., auth, api, frontend, database, analytics)
      
      Respond in JSON format with an array of epics.
    `;
    
    const aiBreakdown = await generateText(breakdownPrompt);
    let epics;
    
    try {
      epics = JSON.parse(aiBreakdown);
    } catch (error) {
      console.warn('Failed to parse AI breakdown, creating fallback epic');
      epics = [{
        title: `Implement ${vision.title}`,
        description: vision.description,
        businessValue: 'Core vision implementation',
        acceptanceCriteria: ['Vision successfully implemented', 'All objectives met'],
        priority: 'high',
        estimatedEffort: 'large',
        relevantServices: ['api', 'frontend', 'database']
      }];
    }
    
    // Step 2: Create epics and delegate to services
    const maxConcurrentDelegations = 3; // Prevent overwhelming the system
    const delegatedEpics = [];
    
    for (const [index, epicData] of epics.slice(0, maxConcurrentDelegations).entries()) {
      try {
        // Create the epic in our hierarchy
        const epicId = await this.createEpic({
          title: epicData.title,
          description: epicData.description,
          businessValue: epicData.businessValue,
          acceptanceCriteria: epicData.acceptanceCriteria || [],
          priority: epicData.priority || 'medium',
          effort: epicData.estimatedEffort || 'medium',
          source: 'ai_breakdown',
          confidence: 0.8
        }, visionId);
        
        // Step 3: Find most relevant service for delegation
        const relevantService = await this.findRelevantService(epicData);
        
        if (relevantService) {
          // Step 4: Delegate to the relevant service hive
          await this.delegateEpicToService(epicId, epicData, relevantService);
          delegatedEpics.push({ epicId, service: relevantService.name });
        } else {
          console.warn(`No relevant service found for epic: ${epicData.title}`);
        }
        
      } catch (error) {
        console.error(`Failed to process epic ${epicData.title}:`, error.message);
      }
    }
    
    // Update vision status
    this.db.prepare('UPDATE visions SET status = ? WHERE id = ?')
      .run('in_progress', visionId);
    
    console.log(`✅ Vision breakdown complete. Created ${epics.length} epics, delegated ${delegatedEpics.length}`);
    this.emit('visionBreakdownComplete', { visionId, epics: delegatedEpics });
    
    return delegatedEpics;
  }
  
  // Find the most relevant service based on epic content and service scopes
  async findRelevantService(epicData) {
    const services = Object.values(this.serviceScopes);
    if (services.length === 0) return null;
    
    // Simple keyword matching - can be enhanced with AI semantic matching
    const epicKeywords = [
      ...this.extractKeywords(epicData.title),
      ...this.extractKeywords(epicData.description),
      ...(epicData.relevantServices || [])
    ];
    
    let bestMatch = null;
    let bestScore = 0;
    
    for (const service of services) {
      const serviceKeywords = this.extractKeywords(service.content);
      const score = this.calculateKeywordMatch(epicKeywords, serviceKeywords);
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = service;
      }
    }
    
    // Only return if we have a reasonable match
    return bestScore > 0.3 ? bestMatch : null;
  }
  
  // Extract relevant keywords from text
  extractKeywords(text) {
    if (!text) return [];
    
    // Simple keyword extraction - can be enhanced with NLP
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    return text.toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.has(word))
      .slice(0, 20); // Limit to most relevant keywords
  }
  
  // Calculate keyword match score between two keyword arrays
  calculateKeywordMatch(keywords1, keywords2) {
    const set1 = new Set(keywords1);
    const set2 = new Set(keywords2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    
    if (set1.size === 0 || set2.size === 0) return 0;
    return intersection.size / Math.max(set1.size, set2.size);
  }
  
  // Delegate an epic to a specific service hive
  async delegateEpicToService(epicId, epicData, service) {
    try {
      console.log(`📡 Delegating epic "${epicData.title}" to service: ${service.name}`);
      
      // Prepare delegation context
      const delegationObjective = `
        EPIC DELEGATION from Project Hive:
        
        Epic: ${epicData.title}
        Description: ${epicData.description}
        Business Value: ${epicData.businessValue}
        Priority: ${epicData.priority}
        Estimated Effort: ${epicData.estimatedEffort}
        
        Acceptance Criteria:
        ${(epicData.acceptanceCriteria || []).map((criteria, i) => `${i + 1}. ${criteria}`).join('\n')}
        
        Please break this down into actionable tasks and begin implementation.
        Report progress back to the Project Hive for coordination.
      `;
      
      // Get service hive info from registry
      const hiveRegistry = await readHiveRegistry();
      const hiveInfo = hiveRegistry[service.name];
      
      if (!hiveInfo) {
        throw new Error(`Service hive ${service.name} not found in registry`);
      }
      
      // Create assignment record
      const assignmentId = nanoid();
      const assignment = {
        id: assignmentId,
        task_id: epicId, // Using epic as a high-level task
        queen_id: service.name,
        context: JSON.stringify({
          type: 'epic_delegation',
          epic_title: epicData.title,
          priority: epicData.priority,
          estimated_effort: epicData.estimatedEffort,
          service_scope: service.content.substring(0, 500), // Truncated scope context
          delegation_timestamp: new Date().toISOString()
        }),
        status: 'delegated',
        progress: JSON.stringify({
          started: new Date().toISOString(),
          completed: null,
          progress_percentage: 0,
          milestones: []
        }),
        communication: JSON.stringify({
          updates: [],
          blockers: [],
          questions: []
        })
      };
      
      const stmt = this.db.prepare(`
        INSERT INTO assignments (id, task_id, queen_id, context, status, progress, communication)
        VALUES (@id, @task_id, @queen_id, @context, @status, @progress, @communication)
      `);
      stmt.run(assignment);
      
      // Delegate to the service using swarm command
      const swarmArgs = [delegationObjective];
      const swarmFlags = {
        internal: true,
        dbPath: hiveInfo.path,
        priority: epicData.priority,
        strategy: 'adaptive',
        background: true
      };
      
      await swarmCommand(swarmArgs, swarmFlags);
      
      console.log(`✅ Successfully delegated epic to ${service.name}`);
      this.emit('epicDelegated', { epicId, service: service.name, assignmentId });
      
      return assignmentId;
      
    } catch (error) {
      console.error(`Failed to delegate epic to ${service.name}:`, error.message);
      throw error;
    }
  }
  
  // Utility methods
  calculateComplexity(data) {
    let complexity = 1;
    if (data.description) complexity += Math.min(data.description.length / 100, 3);
    if (data.objectives?.length) complexity += data.objectives.length * 0.5;
    if (data.functionalRequirements?.length) complexity += data.functionalRequirements.length * 0.3;
    return Math.min(complexity, 10);
  }

  // ... Other methods like intelligence engines and hierarchy navigation would also need to be refactored to use the DB ...
  
  async cleanup() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    if (this.db) {
      this.db.close();
    }
  }
}

export default HierarchicalTaskManagerPlugin;
